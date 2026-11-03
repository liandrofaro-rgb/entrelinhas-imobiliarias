# Medição da página do professor

Página: https://liandrofaro.adv.br/progressao-professor

Link para divulgar por WhatsApp:
https://liandrofaro.adv.br/progressao-professor?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=progressao_professor

O pixel global existente foi reutilizado, sem outra inicialização: **Pixel | Liandro Faro**, ID 2402863303246556. Também são reutilizados o GA4 G-F8DFP490DP e o projeto Clarity yy5ugafk3a.

| Ação | Meta | GA4 | Clarity |
| --- | --- | --- | --- |
| Acesso à página | PageView e ProfessorPageView | page_view e professor_page_view | sessão e professor_page_view |
| Botão de início | ProfessorFormStart | professor_form_start | professor_form_start |
| Resultado de dados preenchidos | ProfessorResultView | professor_result_view | professor_result_view |
| Envio confirmado pelo banco | Lead | generate_lead | professor_lead_saved |
| Clique no WhatsApp | Contact (evento existente) | whatsapp_click (evento existente) | whatsapp_clique (evento existente) |

## Leitura dos números

Na Meta, consultar o Gerenciador de Eventos na fonte acima. Os eventos Professor* identificam o formulário; Lead e Contact também podem ser usados em outras páginas, por isso devem ser filtrados pela URL da página do professor. No GA4, filtrar a página e a campanha `progressao_professor`; a origem do link é `whatsapp` e a mídia é `mensagem`. No Clarity, filtrar a página e os eventos do formulário.

Esses são eventos/visitas medidos, não uma contagem garantida de pessoas distintas. Os quatro eventos do formulário são emitidos uma vez por carregamento da página; recarregar inicia outra visita de medição. Voltar ao resultado ou à tela final não gera outra conversão no mesmo carregamento. O clique no WhatsApp não comprova envio de mensagem ou atendimento. Não mede a abertura/leitura das mensagens dentro do WhatsApp.

## Condições

- O aceite de Anúncios ativa Meta; o aceite de Medição ativa GA4/Clarity. Sem autorização correspondente, nenhum evento é enviado ao serviço.
- Eventos ocorridos antes da primeira escolha ficam apenas em memória e só são enviados após o aceite correspondente. Uma escolha já recusada é respeitada. Nada é acrescentado ao armazenamento de dados da carreira para medição.
- Nomes, e-mails, telefones, respostas, títulos, datas da carreira, percentuais, textos da análise e protocolos não integram os parâmetros dos novos eventos. Somente o formulário identificado por constante e uma origem limitada a categorias conhecidas.
- Exemplos fictícios não contam como resultado preenchido nem como Lead. Falha de validação, falta de autorização e erro no envio não contam como Lead.
- Bloqueadores, recusa, limites dos provedores e atrasos de processamento afetam a contagem. Ausência de eventos não prova ausência de visitantes; não há reconstrução de acessos anteriores.
- Não houve alteração de campanhas, verba, públicos ou API de Conversões.

## Verificação

`node tests/progressao/analytics.test.cjs`: 19 verificações de consentimento, recusa, deduplicação, isolamento da página e parâmetros permitidos.

`node tests/progressao/analytics-ui.test.cjs`: 9 verificações das ações reais, exemplos, validação, envio com falha e confirmação de gravação.

`node tests/progressao/ui.test.cjs`: 120 verificações do fluxo existente.

`python3 scripts/verify-site.py`: estrutura e política CSP existentes.
