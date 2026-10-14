# Revisão técnica e privacidade — 14/10/2026

## Escopo e limites

Site estático de Liandro Faro, preservando identidade visual, fotografias e conteúdo jurídico. Esta revisão técnica e documental não é certificação de conformidade com a LGPD nem auditoria de segurança ofensiva.

## Correções implementadas

- Política de Privacidade com Liandro Moreira da Cunha Faro como responsável e o e-mail profissional já publicado como canal LGPD. Link no rodapé de todas as páginas.
- Remoção das requisições ao Google Fonts: mesmas famílias e arquivos de fonte hospedados localmente, com licenças OFL.
- Nenhum pixel, analytics, formulário ativo ou cookie publicitário encontrado no código. Não foi acrescentado banner de consentimento sem finalidade. A política informa a possibilidade de cookies técnicos da infraestrutura.
- Canonical, sitemap, robots, Open Graph e JSON-LD ajustados para `https://liandrofaro.adv.br`. Newsletter e referências mantêm a orientação de não indexar já existente. Nova página 404 não indexável.
- `_headers` com CSP restritiva, hash do JSON-LD, proteção contra enquadramento, MIME sniffing, permissões desnecessárias e envio de referrer. HSTS inicial de um dia, sem includeSubDomains/preload, para não afetar outros serviços do domínio.
- `wrangler.jsonc` publica somente `dist`, sem backend ou segredos. URLs `.html` preservadas; aliases sem extensão redirecionam para as páginas existentes. Domínio workers.dev recebe noindex.
- CSS inválido na regra de movimento reduzido corrigido. Conteúdo continua visível se a animação não inicializar. Parallax desativado em telas compactas.
- Menu: nomes acessíveis de abrir/fechar, Escape, ciclo de foco, inert do conteúdo de fundo e remoção do backdrop-filter no cabeçalho mobile.
- Alvos de toque, foco visível, hierarquia de títulos nas listagens e contraste de pequenos textos dourados em fundos claros corrigidos.
- Transbordamentos comprovados: margem/largura da nota na página Atuação, mínimos de Grid e títulos longos em 320 px. Corrigidos na origem, sem esconder overflow horizontal.
- Home informa que a newsletter ainda está em preparação, consistente com a página interna. Nenhuma inscrição ou envio foi simulado. Aviso informativo no rodapé; telefone apenas reformatado, mantendo o número original.

## Testes executados

- `python3 scripts/verify-site.py`: 10 páginas, 224 referências locais, arquivos/fragmentos, IDs únicos, imagens com alt, um H1 por página, estrutura de fechamento HTML, canonical, sitemap XML, JSON-LD e seu hash CSP. Não substitui um validador completo do HTML Living Standard.
- `node --check dist/app.js` e `node --check dist/editorial-motion.js`: sintaxe válida.
- Chrome com viewport emulado: 320, 375, 390, 430, 768 e 1440 px. 60 combinações de página/largura, sem transbordamento horizontal ou imagens quebradas após estabilização do layout.
- Home mobile: menu aberto no topo e após navegação/rolagem; cinco links acionados; fechamento e Escape; foco devolvido ao botão; cinco faixas de atuação com títulos sem corte; preferência manual de movimento reduzido.
- Links externos consultados por HTTP: STJ, CESUPA, WhatsApp, Instagram, ANPD, Cloudflare e sites de referências responderam 200. Dois links do Codrops responderam 403 à consulta automatizada; isso não comprova URL quebrada, por isso foram preservados.
- Não foram enviados e-mails, mensagens, documentos nem inscrições. Entrega do e-mail LGPD e titularidade operacional da caixa precisam ser confirmadas pelo responsável.
- Não foi testado Safari real no iPhone. Emulação de largura no Chrome não valida o motor WebKit, teclado virtual, VoiceOver nem comportamento em aparelho real.
- Não foi realizada avaliação completa WCAG com leitor de tela, pentest, revisão das contas administrativas ou teste de restauração.

## Publicação e manutenção

O painel Cloudflare já mostrava o Worker `entrelinhas-imobiliarias` conectado ao repositório `liandrofaro-rgb/entrelinhas-imobiliarias`, branch `main`, comando `npx wrangler deploy`, raiz `/`. Não foi criado um segundo Worker nem concedido novo acesso OAuth.

Verificar após cada publicação: status do build, resposta HTTPS, cabeçalhos, página de privacidade, rotas `.html`, aliases e 404. Alterações no JSON-LD exigem atualizar seu hash no `_headers`; o teste automatizado detecta divergências.

### Verificação da publicação desta revisão

Código enviado à branch `main` no commit `9e937ee`; a publicação automática tornou a nova política acessível em `https://entrelinhas-imobiliarias.liandrofaro.workers.dev/privacidade.html`. O conteúdo baixado foi comparado byte a byte com o arquivo local e é idêntico.

No endereço workers.dev: `/`, `/index.html`, `/atuacao.html`, `/privacidade.html`, `/sitemap.xml`, `/robots.txt` e a fonte Manrope retornaram 200; `/atuacao` retornou 301 para `/atuacao.html`; um endereço inexistente retornou 404 com a página personalizada. CSP e noindex do host provisório foram confirmados nas respostas. Política e menu foram abertos no Chrome com a CSP ativa, sem erros ou avisos de console capturados nesses testes.

O checkout usado para enviar esta revisão fica em `/private/tmp/liandro-github-T4xnyP`. A pasta original de Downloads continua contendo os arquivos editados, mas não possui metadados Git. Antes do próximo trabalho, usar um clone permanente do repositório ou inicializar/vincular conscientemente a pasta original; não depender da sobrevivência de um diretório temporário.

## Pendências do responsável, por prioridade

1. **Alta — DNS:** a consulta pública nesta revisão ainda retornou `a.auto.dns.br` e `b.auto.dns.br`, sem endereço A. Concluir a delegação/ativação para a Cloudflare e então validar HTTPS, redirecionamentos e indexação no domínio definitivo. Não alterar MX/TXT de e-mail sem inventário.
2. **Alta — operação LGPD:** acompanhar a caixa `liandro@faroadvocacia.adv.br`, estabelecer responsáveis, verificação proporcional de identidade, registro e fluxo de resposta a pedidos; confirmar retenção real de mensagens/logs e condições dos operadores/transferências internacionais. A política não substitui esses procedimentos.
3. **Alta — contas:** confirmar autenticação em dois fatores, recuperação segura e acessos mínimos em GitHub, Cloudflare e e-mail. Não auditados nesta execução.
4. **Média — iPhone:** testar Safari real e VoiceOver antes de concluir a homologação mobile.
5. **Média — newsletter:** antes de ativar, escolher operador, configurar inscrição/cancelamento e informar tratamento, retenção e eventual consentimento. A CSP atual bloqueia formulários/conexões externas deliberadamente e deverá ser revisada de forma restrita.
6. **Baixa — editorial:** home e página Atuação apresentam Inventário e Divórcio em ordens diferentes. É uma inconsistência de organização, não um link quebrado; não houve reordenação sem necessidade. A frase aprovada “impactos e no dia a dia” foi preservada, mas merece revisão de fluidez pelo autor.

## Melhorias opcionais, não aplicadas

Sem novo redesign: validar em aparelho real o ritmo da transição “Meu olhar”; reduzir ainda mais durações somente se houver desconforto; otimizar imagens para formatos modernos mediante comparação visual; confirmar se a página pública de referências de design deve continuar acessível. Essas escolhas não foram tratadas como defeitos comprovados.

## Referências consultadas

- [ANPD — materiais e guia de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes)
- [ANPD — direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares)
- [OAB — Provimento 205/2021](https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021)
- [Cloudflare — headers de assets](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare — roteamento HTML](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Cloudflare — configuração dos builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
