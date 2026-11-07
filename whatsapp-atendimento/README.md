# Atendimento por WhatsApp com Claude (protótipo)

Worker do Cloudflare, separado do site, que recebe as mensagens do WhatsApp
(API oficial da Meta, WhatsApp Cloud API), pergunta ao Claude e responde.
**Não está publicado.** O deploy automático do site não toca nesta pasta.

## O que ele faz

- Confere que a chamada veio mesmo da Meta (assinatura `X-Hub-Signature-256`).
- No primeiro contato, envia um aviso de que é um assistente virtual, com o link da política de privacidade.
- Mantém as últimas 20 mensagens de cada conversa no Cloudflare KV, apagadas após 30 dias sem uso.
- Responde só a texto; para áudio, foto ou documento, pede um resumo escrito.
- Quando o caso pede o advogado (pedido da pessoa, prazo urgente, dúvida), avisa a pessoa e fica 24 horas em silêncio naquela conversa.
- As regras de conduta (sem parecer sobre o caso, sem honorários, sem promessa de resultado) estão em `src/prompt.ts`.

## Como publicar (quando for a hora)

1. `npm install`
2. `npx wrangler kv namespace create CONVERSAS` e colocar o id em `wrangler.jsonc`.
3. Cadastrar os segredos, um por um: `npx wrangler secret put ANTHROPIC_API_KEY`
   (e também `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`).
4. `npm run deploy`. O endereço fica `https://whatsapp-atendimento.<conta>.workers.dev/webhook`.
5. No painel do app na Meta (WhatsApp > Configuração), cadastrar esse endereço como webhook,
   com o mesmo `WHATSAPP_VERIFY_TOKEN`, e assinar o campo `messages`.

Para testar no computador: copiar `.dev.vars.example` para `.dev.vars`, preencher e rodar `npm run dev`.
`npm run check` confere os tipos.
