# Progressão do professor no domínio principal

Rascunho no pedido #32. Endereço previsto: `https://liandrofaro.adv.br/progressao-professor`.
Não exige DNS: a rota pertence ao mesmo site do domínio já configurado.

## Fluxo

Preencher → ver a projeção → autorizar e enviar → confirmação com protocolo →
contato opcional pelo WhatsApp. Sem confirmação do banco, a última tela não abre.
O mesmo envio pode ser repetido após falha sem criar outra linha no banco.

## Armazenamento

Reutiliza o receptor e o banco D1 já publicados no aplicativo do professor. Nenhuma
credencial está no frontend ou neste repositório. O receptor continua responsável
pela validação, autorização do formulário, consentimento, gravação e consulta privada.
A área administrativa permanece no endereço reservado da aplicação de armazenamento.

O Worker do site principal encaminha somente `/progressao-professor/api/form-token`
e `/progressao-professor/api/leads`, para destino fixo. Não encaminha rotas administrativas,
cookies do restante do site, cabeçalhos de identidade ou credenciais. Valida a origem,
limita o corpo, mantém o identificador de envio, evita cache e conserva o cookie de
formulário como host-only/HttpOnly/Secure/SameSite. Falhas não viram confirmação de envio.
O aplicativo receptor deve permanecer disponível para que esse armazenamento funcione.

## Site principal

A configuração do Worker passa a declarar o arquivo `worker/progressao-professor.mjs`
e o binding de ativos `ASSETS`, com Worker-first apenas nas rotas de API do professor.
Os demais endereços mantêm o serviço de ativos existente. `/progressao-professor`
reescreve para a página HTML com código 200, preservando o endereço sem extensão.
A política CSP existente foi preservada; scripts e estilos continuam em arquivos externos.
Campos e resultados ficam marcados como sensíveis para mascaramento no Clarity.
A medição do site continua condicionada às escolhas no aviso de cookies.

## Verificação

- `python3 scripts/verify-site.py`: 98 páginas e 4.899 referências locais válidas.
- `node tests/progressao/ui.test.cjs`: 120 verificações de navegação/validação/envio.
- `node tests/progressao/run.cjs dominio-principal`: os mesmos 100 perfis, 50 anteriores
  e 50 posteriores ao corte, com 483 comparações. Expectativas originais preservadas.
- `node tests/progressao/proxy.test.mjs`: 27 checagens de rota, origem, cookies,
  credenciais, corpo limitado, falha e confirmação do receptor.

O receptor atual foi previamente testado com um envio fictício real e conferência da
linha no banco. O novo caminho no domínio principal só pode ser confirmado online
após a aprovação e a publicação deste rascunho. Não se declara auditoria jurídica
integral nem validação de todo histórico individual.
