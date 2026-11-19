// Atendimento por WhatsApp com Claude, rodando como Cloudflare Worker.
//
// Fluxo: a Meta (WhatsApp Cloud API) chama POST /webhook a cada mensagem
// recebida; o Worker confere a assinatura, responde 200 na hora e, em segundo
// plano, monta o histórico da conversa, pergunta ao Claude e envia a resposta.

import Anthropic from "@anthropic-ai/sdk";
import {
  INSTRUCOES,
  MARCADOR_HUMANO,
  RESPOSTA_FALHA,
  RESPOSTA_SO_TEXTO,
  avisoPrimeiroContato,
} from "./prompt";

export interface Env {
  CONVERSAS: KVNamespace;
  CLAUDE_MODEL: string;
  GRAPH_VERSION: string;
  LINK_PRIVACIDADE: string;
  ANTHROPIC_API_KEY: string;
  WHATSAPP_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
}

type Turno = { role: "user" | "assistant"; content: string };

type MensagemWhatsApp = {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
};

const MAX_TURNOS = 20; // histórico enviado ao Claude por conversa
const DIA = 60 * 60 * 24;
const RETENCAO_CONVERSA = 30 * DIA; // conversa some do KV após 30 dias parada
const PAUSA_HUMANO = DIA; // robô fica em silêncio após transferir

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/webhook") return new Response("Not found", { status: 404 });

    if (request.method === "GET") return verificarWebhook(url, env);

    if (request.method === "POST") {
      const corpo = await request.text();
      const assinatura = request.headers.get("X-Hub-Signature-256") ?? "";
      if (!(await assinaturaValida(corpo, assinatura, env.WHATSAPP_APP_SECRET))) {
        return new Response("Forbidden", { status: 403 });
      }
      // A Meta reenvia o evento se não receber 200 rápido; o trabalho pesado
      // continua depois da resposta.
      ctx.waitUntil(processarEvento(JSON.parse(corpo), env));
      return new Response("OK");
    }

    return new Response("Method not allowed", { status: 405 });
  },
};

// Handshake exigido pela Meta ao cadastrar a URL do webhook.
function verificarWebhook(url: URL, env: Env): Response {
  const modo = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const desafio = url.searchParams.get("hub.challenge");
  if (modo === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN && desafio) {
    return new Response(desafio);
  }
  return new Response("Forbidden", { status: 403 });
}

async function assinaturaValida(corpo: string, cabecalho: string, segredo: string): Promise<boolean> {
  if (!cabecalho.startsWith("sha256=")) return false;
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(corpo));
  const esperado = new TextEncoder().encode(
    "sha256=" + [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, "0")).join(""),
  );
  const recebido = new TextEncoder().encode(cabecalho);
  return esperado.byteLength === recebido.byteLength && crypto.subtle.timingSafeEqual(esperado, recebido);
}

async function processarEvento(evento: any, env: Env): Promise<void> {
  for (const entrada of evento?.entry ?? []) {
    for (const mudanca of entrada?.changes ?? []) {
      for (const mensagem of (mudanca?.value?.messages ?? []) as MensagemWhatsApp[]) {
        try {
          await atender(mensagem, env);
        } catch (erro) {
          console.error("Falha ao atender", mensagem.id, erro);
        }
      }
    }
  }
}

async function atender(mensagem: MensagemWhatsApp, env: Env): Promise<void> {
  // A Meta pode entregar a mesma mensagem mais de uma vez.
  const chaveVista = `vista:${mensagem.id}`;
  if (await env.CONVERSAS.get(chaveVista)) return;
  await env.CONVERSAS.put(chaveVista, "1", { expirationTtl: DIA });

  const contato = mensagem.from;

  // Depois de transferir para o Dr. Liandro, o robô não responde mais por um dia.
  if (await env.CONVERSAS.get(`pausa:${contato}`)) return;

  if (mensagem.type !== "text" || !mensagem.text?.body) {
    await enviarTexto(contato, RESPOSTA_SO_TEXTO, env);
    return;
  }

  const chaveConversa = `conversa:${contato}`;
  const historico = (await env.CONVERSAS.get<Turno[]>(chaveConversa, "json")) ?? [];
  if (historico.length === 0) {
    await enviarTexto(contato, avisoPrimeiroContato(env.LINK_PRIVACIDADE), env);
  }
  historico.push({ role: "user", content: mensagem.text.body });

  let resposta: string;
  let transferir = false;
  try {
    resposta = await perguntarAoClaude(historico.slice(-MAX_TURNOS), env);
    if (resposta.includes(MARCADOR_HUMANO)) {
      transferir = true;
      resposta = resposta.replaceAll(MARCADOR_HUMANO, "").trim();
    }
  } catch (erro) {
    console.error("Falha no Claude", erro);
    resposta = RESPOSTA_FALHA;
    transferir = true;
  }

  await enviarTexto(contato, resposta, env);
  historico.push({ role: "assistant", content: resposta });
  await env.CONVERSAS.put(chaveConversa, JSON.stringify(historico.slice(-MAX_TURNOS)), {
    expirationTtl: RETENCAO_CONVERSA,
  });
  if (transferir) {
    await env.CONVERSAS.put(`pausa:${contato}`, "1", { expirationTtl: PAUSA_HUMANO });
  }
}

async function perguntarAoClaude(historico: Turno[], env: Env): Promise<string> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  // O histórico precisa começar pela pessoa, não pelo assistente.
  while (historico.length && historico[0].role !== "user") historico = historico.slice(1);

  const resposta = await client.beta.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: 2048,
    output_config: { effort: "low" },
    // Se o modelo principal recusar, a própria API tenta o modelo reserva.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    cache_control: { type: "ephemeral" },
    system: INSTRUCOES,
    messages: historico,
  });

  if (resposta.stop_reason === "refusal") throw new Error("Recusa do modelo");
  const texto = resposta.content
    .flatMap((bloco) => (bloco.type === "text" ? [bloco.text] : []))
    .join("\n")
    .trim();
  if (!texto) throw new Error("Resposta vazia");
  return texto;
}

async function enviarTexto(para: string, texto: string, env: Env): Promise<void> {
  const resposta = await fetch(
    `https://graph.facebook.com/${env.GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: para,
        type: "text",
        text: { body: texto.slice(0, 4096) }, // limite do WhatsApp por mensagem
      }),
    },
  );
  if (!resposta.ok) {
    throw new Error(`WhatsApp ${resposta.status}: ${await resposta.text()}`);
  }
}
