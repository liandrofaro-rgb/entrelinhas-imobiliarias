#!/usr/bin/env python3
"""Gera as páginas de notícias a partir de content/noticias.json.

Uso: python3 scripts/build-news.py
Escreve: dist/noticia-<slug>.html, a lista em dist/noticias.html, o bloco
"Últimas notícias" em dist/newsletter.html e as entradas no sitemap.
"""
import html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
ORIGIN = 'https://liandrofaro.adv.br'
MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']


def curta(iso):
    d = date.fromisoformat(iso)
    return f'{d.day} {MESES[d.month - 1]} {d.year}'


def numerica(iso):
    d = date.fromisoformat(iso)
    return f'{d.day:02d}.{d.month:02d}.{d.year}'


def inline(text):
    t = html.escape(text, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'==(.+?)==', r'<mark class="kw">\1</mark>', t)
    return t


def plain(text):
    return re.sub(r'\*\*|==', '', text)


def validar(items):
    erros = []
    slugs = set()
    for n in items:
        s = n.get('slug', '?')
        if s in slugs: erros.append(f'{s}: slug repetido')
        slugs.add(s)
        for campo in ('slug', 'titulo', 'orgao', 'area', 'data_publicacao', 'imagem', 'imagem_alt'):
            if not n.get(campo): erros.append(f'{s}: falta {campo}')
        if not re.fullmatch(r'[a-z0-9-]+', s): erros.append(f'{s}: slug inválido')
        if not n.get('fontes') or not all(f['url'].startswith('https://') for f in n['fontes']):
            erros.append(f'{s}: precisa de fonte com link https')
        if not n.get('externo'):
            if len(n.get('resumo', [])) < 3: erros.append(f'{s}: resumo precisa de ao menos 3 tópicos')
            for campo in ('subtitulo', 'descricao', 'aconteceu', 'entrelinhas'):
                if not n.get(campo): erros.append(f'{s}: falta {campo}')
            if not (DIST / n['imagem']).exists(): erros.append(f'{s}: imagem {n["imagem"]} não existe em dist/')
    return erros


def paragrafos(lista):
    return ''.join(f'<p>{inline(p)}</p>\n' for p in lista)


def secao(id_, titulo, lista):
    if not lista: return ''
    return f'<section id="{id_}">\n<h2>{html.escape(titulo)}</h2>\n{paragrafos(lista)}</section>\n'


def pagina_main(n):
    orgao = n['orgao']
    julg = n.get('data_julgamento')
    etiqueta = f'{orgao} · {n["area"]} · ' + (f'JULGADO EM {curta(julg)}' if julg else curta(n['data_publicacao']))
    textos = n['resumo'] + n['aconteceu'] + n.get('lei', []) + n.get('decisao', []) + n['entrelinhas']
    minutos = max(1, round(len(re.sub(r'\s+', ' ', plain(' '.join(textos))).split()) / 200))
    meta = f'Entrelinhas Imobiliárias · Notícia {"do " + orgao if orgao in ("STJ","STF","CNJ") else "de " + orgao} de {numerica(n["data_publicacao"])} · Leitura de {minutos} minutos'
    titulo_decisao = n.get('decisao_titulo', f'O que o {orgao} decidiu')
    nav = [('resumo', 'Em resumo'), ('caso', 'O que aconteceu')]
    if n.get('lei'): nav.append(('lei', 'O que diz a lei'))
    if n.get('decisao'): nav.append(('decisao', titulo_decisao))
    nav.append(('entrelinhas', 'Nas entrelinhas'))
    if n.get('dados'): nav.append(('dados', 'Dados da decisão'))
    nav.append(('fontes', 'Fonte' if len(n['fontes']) == 1 else 'Fontes'))
    aside = ''.join(f'<a href="#{i}">{t}</a>\n' for i, t in nav)
    resumo = ''.join(f'<li>{inline(r)}</li>\n' for r in n['resumo'])
    out = f'''<div class="reading-head wrap">
<a class="back-link" href="noticias.html">← Notícias</a>
<p class="label">{html.escape(etiqueta.upper())}</p>
<h1>{html.escape(n["titulo"])}</h1>
<p class="article-deck">{html.escape(n["subtitulo"])}</p>
<div class="article-meta">{html.escape(meta)}</div>
</div>
<figure class="news-hero wrap">
<img src="{n["imagem"]}" width="1200" height="630" alt="{html.escape(n["imagem_alt"])}">
<figcaption>Ilustração produzida para esta notícia.</figcaption>
</figure>
<div class="article-layout wrap">
<aside class="article-aside">
<span class="label">NESTA NOTÍCIA</span>
{aside}</aside>
<article class="article-body">
<section class="news-summary" id="resumo">
<span class="label">EM RESUMO</span>
<ul>
{resumo}</ul>
</section>
{secao("caso", "O que aconteceu", n["aconteceu"])}{secao("lei", "O que diz a lei", n.get("lei"))}'''
    if n.get('decisao'):
        out += secao('decisao', titulo_decisao, n['decisao']).replace('</section>\n', (f'<p class="news-key">{inline(n["destaque"])}</p>\n' if n.get('destaque') else '') + '</section>\n')
    out += f'''<section class="news-close" id="entrelinhas">
<span class="label">NAS ENTRELINHAS</span>
<h2>{html.escape(n.get("entrelinhas_titulo", "O que está por trás"))}</h2>
{paragrafos(n["entrelinhas"])}'''
    if n.get('sintese'): out += f'<p class="news-takeaway">{inline(n["sintese"])}</p>\n'
    out += '</section>\n'
    if n.get('dados'):
        dl = ''.join(f'<div><dt>{html.escape(k)}</dt><dd>{html.escape(v)}</dd></div>\n' for k, v in n['dados'])
        out += f'<section class="news-facts" id="dados" aria-label="Dados da decisão">\n<span class="label">DADOS DA DECISÃO</span>\n<dl>\n{dl}</dl>\n</section>\n'
    links = ''.join(f'<a href="{html.escape(f["url"])}" target="_blank" rel="noopener">{html.escape(f["rotulo"])}</a>\n' for f in n['fontes'])
    out += f'<section class="source-box" id="fontes">\n<span class="label">{"FONTE" if len(n["fontes"]) == 1 else "FONTES"}</span>\n{links}</section>\n'
    out += '<a class="text-link" href="noticias.html">Veja outras notícias <span>→</span>\n</a>\n</article>\n</div>'
    return out


def card(n, destaque):
    externo = n.get('externo')
    href = n['fontes'][0]['url'] if externo else f'noticia-{n["slug"]}.html'
    alvo = ' target="_blank" rel="noopener"' if externo else ''
    w, h = n.get('imagem_w', 1200), n.get('imagem_h', 630)
    desc = f'<p>{html.escape(n["subtitulo"])}</p>' if destaque and n.get('subtitulo') else ''
    link = 'Acessar fonte <i aria-hidden="true">↗</i>' if externo else 'Ler notícia <i aria-hidden="true">→</i>'
    cls = 'news-card news-card-featured' if destaque else 'news-card'
    return (f'<a class="{cls}" href="{html.escape(href)}"{alvo}>\n'
            f'<figure><img src="{n["imagem"]}" alt="{html.escape(n["imagem_alt"])}" width="{w}" height="{h}"></figure>\n'
            f'<div class="news-card-copy"><span class="news-card-meta">{n["orgao"]} · {curta(n["data_publicacao"])}</span>'
            f'<h2>{html.escape(n["titulo"])}</h2>{desc}<span class="news-card-link">{link}</span></div>\n</a>\n')


def trocar(arquivo, inicio, fim, novo, marcador_inicial=None):
    t = arquivo.read_text(encoding='utf-8')
    padrao = re.compile(re.escape(inicio) + r'.*?' + re.escape(fim), re.S)
    if not padrao.search(t):
        sys.exit(f'marcadores {inicio} não encontrados em {arquivo.name}')
    arquivo.write_text(padrao.sub(lambda _: inicio + '\n' + novo + fim, t), encoding='utf-8')


def main():
    items = json.loads((ROOT / 'content' / 'noticias.json').read_text(encoding='utf-8'))
    erros = validar(items)
    if erros:
        sys.exit('Erros na lista de notícias:\n- ' + '\n- '.join(erros))
    items.sort(key=lambda n: n['data_publicacao'], reverse=True)
    modelo = (ROOT / 'content' / 'noticia-template.html').read_text(encoding='utf-8')
    gerados = set()
    for n in items:
        if n.get('externo'): continue
        arq = f'noticia-{n["slug"]}.html'
        pagina = (modelo.replace('{{MAIN}}', pagina_main(n)).replace('{{TITULO}}', html.escape(n['titulo']))
                  .replace('{{DESCRICAO}}', html.escape(n['descricao'])).replace('{{ARQUIVO}}', arq)
                  .replace('{{IMAGEM}}', n['imagem']))
        (DIST / arq).write_text(pagina, encoding='utf-8')
        gerados.add(arq)
    for velho in DIST.glob('noticia-*.html'):
        if velho.name not in gerados:
            velho.unlink()
    cards = ''.join(card(n, i == 0) for i, n in enumerate(items))
    trocar(DIST / 'noticias.html', '<!-- NEWS:START -->', '<!-- NEWS:END -->', cards)
    feed = ''
    for n in items[:3]:
        externo = n.get('externo')
        href = n['fontes'][0]['url'] if externo else f'noticia-{n["slug"]}.html'
        alvo = ' target="_blank" rel="noopener"' if externo else ''
        feed += (f'<li><a href="{html.escape(href)}"{alvo}><span class="nl-feed-meta">{n["orgao"]} · {curta(n["data_publicacao"])}</span>'
                 f'<strong>{html.escape(n["titulo"])}</strong></a></li>\n')
    trocar(DIST / 'newsletter.html', '<!-- NL:START -->', '<!-- NL:END -->', f'<ul class="nl-feed">\n{feed}</ul>\n')
    def radar_html(n):
        h = '<div class="pub-rows" tabindex="0" role="region" aria-label="Lista rolável">\n'
        for n_ in items[:n]:
            h += (f'<a class="pub-row" href="noticia-{n_["slug"]}.html">\n'
                  f'<figure><img src="{n_["imagem"]}" alt="" width="1200" height="630" loading="lazy" decoding="async"></figure>\n'
                  f'<div>\n<span class="publication-meta">{n_["orgao"]} <i aria-hidden="true">·</i> {curta(n_["data_publicacao"])}</span>\n'
                  f'<h4>{html.escape(n_["titulo"])}</h4>\n</div>\n<span class="pub-row-arrow" aria-hidden="true">→</span>\n</a>\n')
        return h + '</div>\n'
    trocar(DIST / 'index.html', '<!-- RADAR:START -->', '<!-- RADAR:END -->', radar_html(10))
    trocar(DIST / 'publicacoes.html', '<!-- RADAR:START -->', '<!-- RADAR:END -->', radar_html(12))
    mapa = DIST / 'sitemap.xml'
    t = re.sub(r'[ \t]*<url><loc>' + re.escape(ORIGIN) + r'/noticia-[^<]*</loc></url>\n', '', mapa.read_text(encoding='utf-8'))
    novas = ''.join(f'  <url><loc>{ORIGIN}/{a}</loc></url>\n' for a in sorted(gerados))
    t = t.replace('</urlset>', novas + '</urlset>')
    mapa.write_text(t, encoding='utf-8')
    print(f'{len(items)} notícias na lista; {len(gerados)} páginas geradas.')


if __name__ == '__main__':
    main()
