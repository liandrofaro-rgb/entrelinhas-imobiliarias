# Guia editorial: artigos e análises

Artigos são **autorais** (assinados por Liandro Faro) e **sempre passam pela aprovação dele antes de publicar**. Notícias respondem "o que aconteceu?"; artigos respondem "o que isso significa e o que pensar a respeito?".

## Princípio: artigo defende uma tese
Artigo **não reconta uma notícia**. Parte de uma **tese** (título afirmativo), usa **várias decisões ou fontes como prova**, toma posição de forma firme (na voz impessoal) e mostra a conexão entre os casos. Mínimo de 2 fontes. Se o texto só descreve uma decisão, é notícia, não artigo.

## Tamanho
Padrão de **700 a 1.300 palavras** (3 a 7 minutos de leitura). O "Em resumo" no topo permite a leitura rápida.

## Voz
Clara, para leigo interessado e para quem pesquisa, sem juridiquês, com precisão. **Voz impessoal** (terceira pessoa; nada de "eu"/"minha leitura"). A opinião do artigo aparece em "Nas entrelinhas" e em expressões como "vale notar", "a leitura mais provável", sempre separada do **fato** ("o tribunal decidiu").

## Formatos
`analise` (aprofunda uma decisão), `explicativo` (como funciona um tema), `debate` (tese com contra-argumento), `caso` (caso hipotético, sempre marcado como hipotético), `roteiro` (lista do que conferir).

## Anatomia (texto corrido, como um artigo de verdade)
Sem caixas e sem mini-seções. O artigo é um texto contínuo, com ideias encadeadas por transições:
1. Título afirmativo + subtítulo de uma frase
2. Abertura (2 parágrafos): gancho e tese
3. **3 a 5 seções** com intertítulo, cada uma com **2 ou mais parágrafos** longos (80 a 130 palavras), sem listas
4. Os termos técnicos são explicados **dentro do texto**, na primeira vez que aparecem
5. O contra-argumento entra no desenvolvimento ("a objeção é previsível…") e não em um quadro à parte
6. A última seção é **"Nas entrelinhas"**, em prosa: a leitura de fundo e os limites
7. **Citações literais em destaque** (2 a 4 por artigo): trechos dos votos ou da lei, entre aspas, com autor e processo, em bloco próprio logo depois do parágrafo que os introduz; mais uma frase de tese (a do autor) em destaque no meio do texto. Trechos curtos, copiados exatamente da fonte e conferidos; nunca inventados ou "melhorados".
8. Rodapé discreto: decisões citadas, fontes, notícias relacionadas e base legal

## Estilo de leitura
Parágrafos curtos (uma ideia cada); negrito só em termos-chave; marca-texto (`==assim==`) em ideias centrais, no máximo 3; sem HTML.

## Regras
- **Toda decisão ou norma citada é referenciada no corpo do texto, em prosa**, no ponto em que aparece, sem link: data, órgão e identificação do processo, no formato "Em 30.06.26, o STJ divulgou a decisão unânime da Quarta Turma (REsp 0.000.000, rel. Min. Fulano) que…". Quando a data é de divulgação (e não de julgamento), usar "divulgou". O rodapé traz a lista completa e os links das fontes.
- Toda afirmação sobre decisão ou lei traz fonte e data.
- Nada de promessa de resultado nem conselho para caso concreto (regras de publicidade da OAB).
- Caso hipotético: sempre marcado como hipotético, sem nomes reais.
- Direitos autorais: tudo reescrito; imagens só as geradas no projeto.

## Capa
Estilo "capa editorial": fundo azul-marinho, blocos isométricos em azul com um bloco dourado como destaque, rótulo do formato e área em dourado e o título em branco. Gerada por `scripts/build-articles.py`: `capa-<slug>.svg` (com título; usada em compartilhamento e listas) e `capa-<slug>-hero.svg` (sem título; usada no topo da página para não repetir o H1).

## Como publicar
Editar `content/artigos.json` e rodar `python3 scripts/build-articles.py` e `python3 scripts/verify-site.py`.
