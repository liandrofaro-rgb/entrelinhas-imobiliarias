#!/usr/bin/env python3
"""Gera as páginas de artigos a partir de content/artigos.json.

Uso: python3 scripts/build-articles.py
Escreve: dist/artigo-<slug>.html, dist/capa-<slug>.svg, a lista em dist/artigos.html
e as entradas no sitemap. Segue content/guia-editorial-artigos.md.
"""
import hashlib, html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
ORIGIN = 'https://liandrofaro.adv.br'
MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
FORMATOS = {'analise': 'ANÁLISE', 'explicativo': 'EXPLICANDO', 'debate': 'EM DEBATE', 'caso': 'CASO PRÁTICO', 'roteiro': 'ROTEIRO'}


def curta(iso):
    d = date.fromisoformat(iso)
    return f'{d.day} {MESES[d.month - 1]} {d.year}'


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\((https://[^)\s]+)\)', r'<a class="art-cite" href="\2" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'==(.+?)==', r'<mark class="kw">\1</mark>', t)
    return re.sub(r'(?<![*\w])\*([^*\s][^*]*?)\*(?![*\w])', r'<em>\1</em>', t)


def plain(t):
    return re.sub(r'\*\*|\*|==', '', re.sub(r'\[([^\]]+)\]\(https://[^)\s]+\)', r'\1', t))


def para(p):
    # citação literal em destaque: "> “texto” | Min. Fulano, relator (REsp 0)"
    if p.startswith('> '):
        texto, _, autor = p[2:].partition(' | ')
        cite = f'<cite>{inline(autor)}</cite>' if autor else ''
        return f'<blockquote class="art-quote"><p>{inline(texto)}</p>{cite}</blockquote>\n'
    return f'<p>{inline(p)}</p>\n'


def paras(lista):
    return ''.join(para(p) for p in lista)


# ---------- capa (estilo A: capa editorial escura com blocos isométricos) ----------
def cube(cx, cy, a, h, top, left, right):
    p = lambda *xy: ' '.join(f'{x},{y}' for x, y in xy)
    return (f'<polygon points="{p((cx-a,cy),(cx,cy-a//2),(cx+a,cy),(cx,cy+a//2))}" fill="{top}"/>'
            f'<polygon points="{p((cx-a,cy),(cx,cy+a//2),(cx,cy+a//2+h),(cx-a,cy+h))}" fill="{left}"/>'
            f'<polygon points="{p((cx+a,cy),(cx,cy+a//2),(cx,cy+a//2+h),(cx+a,cy+h))}" fill="{right}"/>')


BLUE = ('#8fb8dc', '#1e5e91', '#12375b')
PALE = ('#bcd3e6', '#1e5e91', '#12375b')
GOLD = ('#c8a154', '#a8863f', '#8a6c2e')


def blocos(seed):
    v = seed % 3
    if v == 0:  # pilha
        return cube(900, 430, 120, 110, *BLUE) + cube(940, 310, 100, 70, *PALE) + cube(970, 200, 70, 50, *GOLD)
    if v == 1:  # escada
        return cube(760, 470, 80, 60, *BLUE) + cube(890, 400, 80, 100, *PALE) + cube(1020, 330, 80, 150, *BLUE) + cube(1020, 190, 60, 40, *GOLD)
    return cube(820, 430, 90, 110, *BLUE) + cube(990, 350, 90, 170, *PALE) + cube(905, 260, 60, 40, *GOLD)  # torres



# ---------- cenas exclusivas por artigo (mesma identidade: azul-marinho, isométrico, um detalhe dourado) ----------
def face(lado, cx, cy, a, h, pts):
    """Mapeia pontos (u,v) de 0 a 1 para uma face esquerda ('e') ou direita ('d') do cubo."""
    out = []
    for u, v in pts:
        if lado == 'e': out.append((cx - a + a * u, cy + (a / 2) * u + h * v))
        else: out.append((cx + a * u, cy + a / 2 - (a / 2) * u + h * v))
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in out)


def janelas(lado, cx, cy, a, h, cols, rows, cor, ouro=None):
    out = ''
    for i in range(cols):
        for j in range(rows):
            u0, u1 = 0.12 + i * (0.76 / cols), 0.12 + i * (0.76 / cols) + 0.76 / cols * 0.62
            v0, v1 = 0.07 + j * (0.86 / rows), 0.07 + j * (0.86 / rows) + 0.86 / rows * 0.55
            c = '#c8a154' if ouro == (i, j) else cor
            out += f'<polygon points="{face(lado, cx, cy, a, h, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])}" fill="{c}"/>'
    return out


def cena_airbnb():
    cx, cy, a, h = 900, 250, 120, 250
    return (f'<polygon points="660,560 900,440 1140,560 900,680" fill="#12375b" fill-opacity=".55"/>'
            + cube(cx, cy, a, h, *BLUE)
            + janelas('e', cx, cy, a, h, 3, 5, '#bcd3e6') + janelas('d', cx, cy, a, h, 3, 5, '#5f8fb8', ouro=(1, 2))
            + cube(780, 520, 55, 38, *GOLD)
            + '<path d="M762 506 q18 -26 36 0" fill="none" stroke="#8a6c2e" stroke-width="5" stroke-linecap="round"/>')


def cena_usucapiao():
    cx, cy, a, h = 900, 400, 110, 110
    relogio = [(0.5 + 0.30 * __import__('math').cos(t / 24 * 6.2832), 0.5 + 0.30 * __import__('math').sin(t / 24 * 6.2832)) for t in range(24)]
    return (f'<polygon points="660,560 900,440 1140,560 900,680" fill="#12375b" fill-opacity=".55"/>'
            + cube(cx, cy, a, h, *BLUE).replace(f'<polygon points="{cx-a},{cy} {cx},{cy-a//2} {cx+a},{cy} {cx},{cy+a//2}" fill="#8fb8dc"/>', '')
            + f'<polygon points="{cx-a},{cy} {cx},{cy+a//2} {cx},265" fill="#1e5e91" stroke="#07172f" stroke-width="3"/>'
            + f'<polygon points="{cx+a},{cy} {cx},{cy+a//2} {cx},265" fill="#12375b" stroke="#07172f" stroke-width="3"/>'
            + f'<polygon points="{face("e", cx, cy, a, h, [(0.15, 0.25), (0.45, 0.25), (0.45, 0.95), (0.15, 0.95)])}" fill="#bcd3e6"/>'
            + f'<polygon points="{face("d", cx, cy, a, h, relogio)}" fill="#07172f" stroke="#c8a154" stroke-width="6"/>'
            + f'<polyline points="{face("d", cx, cy, a, h, [(0.5, 0.25), (0.5, 0.5), (0.68, 0.62)])}" fill="none" stroke="#c8a154" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')


CENAS = {'airbnb-condominio-destinacao-nao-plataforma': cena_airbnb, 'usucapiao-tempo-nao-faz-dono': cena_usucapiao}

def quebra(titulo, limite=17):
    linhas, atual = [], ''
    for palavra in titulo.split():
        if atual and len(atual) + 1 + len(palavra) > limite:
            linhas.append(atual); atual = palavra
        else:
            atual = f'{atual} {palavra}'.strip()
    linhas.append(atual)
    return linhas


def capa(a, hero=False):
    seed = int(hashlib.md5(a['slug'].encode()).hexdigest(), 16)
    linhas = quebra(a.get('titulo_capa', a['titulo']).rstrip('.') + '.')
    if len(linhas) > 5: linhas = linhas[:5]
    tam = 62 if len(linhas) <= 3 else 52
    y0 = 560 - (len(linhas) - 1) * (tam + 13)
    ts = ''.join(f'<tspan x="70" y="{y0 + i * (tam + 13)}">{html.escape(l)}</tspan>' for i, l in enumerate(linhas))
    rotulo = html.escape(f'{FORMATOS[a["formato"]]} · {a["area"]}'.upper())
    if hero:
        texto = (f'<text x="70" y="300" font-family="Arial,sans-serif" font-weight="700" font-size="54" letter-spacing="6" fill="#c8a154">{html.escape(FORMATOS[a["formato"]])}</text>'
                 f'<text x="70" y="360" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#fff">{html.escape(a["area"])}</text>'
                 '<rect x="70" y="392" width="90" height="5" fill="#c8a154"/>')
    else:
        texto = (f'<text x="70" y="110" font-family="Arial,sans-serif" font-weight="700" font-size="22" letter-spacing="5" fill="#c8a154">{rotulo}</text>'
                 f'<text font-family="Arial,sans-serif" font-weight="700" font-size="{tam}" fill="#fff">{ts}</text>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img">'
            '<rect width="1200" height="630" fill="#07172f"/><circle cx="900" cy="250" r="330" fill="#0c2a4a"/>'
            '<circle cx="900" cy="250" r="210" fill="#12375b"/>'
            '<g stroke="#1e5e91" stroke-opacity=".35" stroke-width="1"><path d="M0 120H1200M0 240H1200M0 360H1200M0 480H1200M300 0V630M600 0V630M900 0V630"/></g>'
            f'<g stroke="#07172f" stroke-width="3" stroke-linejoin="round">{CENAS[a["slug"]]() if a["slug"] in CENAS else blocos(seed)}</g>'
            f'{texto}</svg>\n')


# ---------- validação e páginas ----------
def palavras(a):
    blocos_ = list(a['abertura'])
    for sec in a['secoes']: blocos_ += [x[2:] if x.startswith('> ') else x for x in sec['paragrafos']]
    blocos_ += [a.get('destaque', '')]
    return len(re.sub(r'\s+', ' ', plain(' '.join(blocos_))).split())


def validar(items, noticias):
    erros, vistos = [], set()
    slugs_n = {n['slug'] for n in noticias}
    for a in items:
        s = a.get('slug', '?')
        if s in vistos: erros.append(f'{s}: slug repetido')
        vistos.add(s)
        faltou = False
        for c in ('slug', 'titulo', 'subtitulo', 'descricao', 'area', 'formato', 'data_publicacao', 'abertura', 'secoes', 'fontes'):
            if not a.get(c): erros.append(f'{s}: falta {c}'); faltou = True
        if a.get('formato') not in FORMATOS: erros.append(f'{s}: formato inválido')
        if faltou: continue
        if not 3 <= len(a['secoes']) <= 5: erros.append(f'{s}: precisa de 3 a 5 seções')
        if any(sum(1 for x in sec['paragrafos'] if not x.startswith('> ')) < 2 for sec in a['secoes']): erros.append(f'{s}: cada seção precisa de ao menos 2 parágrafos (texto corrido)')
        n = palavras(a)
        if not 700 <= n <= 1300: erros.append(f'{s}: {n} palavras (esperado 700 a 1300)')
        if not all(f['url'].startswith('https://') for f in a['fontes']): erros.append(f'{s}: fontes precisam de https')
        for r in a.get('relacionadas', []):
            if r not in slugs_n: erros.append(f'{s}: notícia relacionada inexistente: {r}')
    return erros


def pagina_main(a, noticias):
    n = palavras(a)
    minutos = max(1, round(n / 200))
    meta = f'Por Liandro Faro · {curta(a["data_publicacao"])} · Leitura de {minutos} minutos'
    nav = [(f's{i+1}', sec['titulo']) for i, sec in enumerate(a['secoes'])] + [('fontes', 'Fontes e leitura relacionada')]
    aside = ''.join(f'<a href="#{i}">{html.escape(t)}</a>\n' for i, t in nav)
    out = f'''<div class="reading-head wrap">
<a class="back-link" href="artigos.html">← Artigos</a>
<p class="label">{html.escape((FORMATOS[a["formato"]] + " · " + a["area"]).upper())}</p>
<h1>{html.escape(a["titulo"])}</h1>
<p class="article-deck">{html.escape(a["subtitulo"])}</p>
<div class="article-meta">{html.escape(meta)}</div>
</div>
<figure class="news-hero art-hero wrap">
<img src="capa-{a["slug"]}-hero.svg" width="1200" height="630" alt="{html.escape("Capa do artigo: " + a["titulo"])}">
</figure>
<div class="article-layout wrap">
<aside class="article-aside">
<span class="label">NESTE ARTIGO</span>
{aside}</aside>
<article class="article-body art-essay">
<div class="art-lead">
{paras(a["abertura"])}</div>
'''
    apos = a.get('destaque_apos_secao', 1)
    for i, sec in enumerate(a['secoes']):
        out += f'<section id="s{i+1}">\n<h2>{html.escape(sec["titulo"])}</h2>\n{paras(sec["paragrafos"])}</section>\n'
        if a.get('destaque') and i + 1 == apos:
            out += f'<blockquote class="art-pull">{inline(a["destaque"])}</blockquote>\n'
    out += '<section class="source-box art-fontes" id="fontes">\n<span class="label">FONTES E LEITURA RELACIONADA</span>\n'
    if a.get('decisoes'):
        out += '<ul class="art-decisoes">\n' + ''.join(f'<li>{inline(x)}</li>\n' for x in a['decisoes']) + '</ul>\n'
    out += ''.join(f'<a href="{html.escape(f["url"])}" target="_blank" rel="noopener">{html.escape(f["rotulo"])}</a>\n' for f in a['fontes'])
    rel = [x for x in noticias if x['slug'] in a.get('relacionadas', [])]
    if rel:
        out += '<span class="label art-legal">NOTÍCIAS RELACIONADAS</span>\n<ul>\n' + ''.join(f'<li><a href="noticia-{x["slug"]}.html">{html.escape(x["titulo"])}</a></li>\n' for x in rel) + '</ul>\n'
    if a.get('base_legal'):
        out += '<span class="label art-legal">BASE LEGAL</span>\n<ul>\n' + ''.join(f'<li>{inline(l)}</li>\n' for l in a['base_legal']) + '</ul>\n'
    out += '</section>\n'
    aviso = 'Conteúdo informativo e opinativo. Não substitui a análise individual de uma situação concreta.'
    if a.get('hipotetico'): aviso = 'Os casos descritos neste artigo são hipotéticos, criados para ilustrar o tema. ' + aviso
    out += f'<p class="art-aviso">{html.escape(aviso)}</p>\n<div class="art-autor"><strong>Liandro Faro</strong><span>Advogado e professor · Belém, Pará · OAB/PA 14.611-A</span><a href="sobre.html">Quem sou →</a></div>\n'
    out += '<a class="text-link" href="artigos.html">Veja outros artigos <span>→</span>\n</a>\n</article>\n</div>'
    return out


def trocar(arquivo, ini, fim, novo):
    t = arquivo.read_text(encoding='utf-8')
    pad = re.compile(re.escape(ini) + r'.*?' + re.escape(fim), re.S)
    if not pad.search(t): sys.exit(f'marcadores {ini} não encontrados em {arquivo.name}')
    arquivo.write_text(pad.sub(lambda _: ini + '\n' + novo + fim, t), encoding='utf-8')


def main():
    items = json.loads((ROOT / 'content' / 'artigos.json').read_text(encoding='utf-8'))
    noticias = json.loads((ROOT / 'content' / 'noticias.json').read_text(encoding='utf-8'))
    erros = validar(items, noticias)
    if erros: sys.exit('Erros na lista de artigos:\n- ' + '\n- '.join(erros))
    # mais recentes primeiro; na mesma data, o último incluído na lista vem antes
    items = [a for _, a in sorted(enumerate(items), key=lambda x: (x[1]['data_publicacao'], x[0]), reverse=True)]
    modelo = (ROOT / 'content' / 'artigo-template.html').read_text(encoding='utf-8')
    gerados = set()
    for a in items:
        arq = f'artigo-{a["slug"]}.html'
        pag = (modelo.replace('{{MAIN}}', pagina_main(a, noticias)).replace('{{TITULO}}', html.escape(a['titulo']))
               .replace('{{DESCRICAO}}', html.escape(a['descricao'])).replace('{{ARQUIVO}}', arq)
               .replace('{{IMAGEM}}', f'capa-{a["slug"]}.svg'))
        pag = pag.replace('Newsletter', 'Newsletter') if False else pag
        (DIST / arq).write_text(pag, encoding='utf-8')
        (DIST / f'capa-{a["slug"]}.svg').write_text(capa(a), encoding='utf-8')
        (DIST / f'capa-{a["slug"]}-hero.svg').write_text(capa(a, hero=True), encoding='utf-8')
        gerados.add(arq)
    for velho in list(DIST.glob('artigo-*.html')) + list(DIST.glob('capa-*.svg')):
        if velho.name.startswith('artigo-') and velho.name not in gerados: velho.unlink()
        if velho.name.startswith('capa-') and f'artigo-{velho.stem[5:].removesuffix("-hero")}.html' not in gerados: velho.unlink()
    linhas = ''
    for a in items:
        cat = a['area'].lower()
        linhas += (f'<a class="article-row readable-article" href="artigo-{a["slug"]}.html" data-category="{html.escape(cat)}">\n'
                   f'<span class="eyebrow">{html.escape((a["area"] + " / " + FORMATOS[a["formato"]]).upper())}</span>\n'
                   f'<h2>{html.escape(a["titulo"])}</h2>\n<p>{html.escape(a["subtitulo"])}</p>\n'
                   f'<span class="inline-link">Leia o artigo <span>↗</span>\n</span>\n</a>\n')
    trocar(DIST / 'artigos.html', '<!-- ARTIGOS:START -->', '<!-- ARTIGOS:END -->', linhas)
    areas = sorted({a['area'] for a in items} | {'Condomínio'})
    botoes = '<button data-filter="all" aria-pressed="true" class="active">Todos</button>\n' + ''.join(
        f'<button data-filter="{html.escape(x.lower())}" aria-pressed="false">{html.escape(x)}</button>\n' for x in areas)
    trocar(DIST / 'artigos.html', '<!-- FILTROS:START -->', '<!-- FILTROS:END -->', botoes)
    u = items[0]

    def lane(n_itens):
        h = (f'<a class="publication-feature" href="artigo-{u["slug"]}.html">\n'
             f'<figure class="publication-feature-image">\n'
             f'<img class="art-thumb" src="capa-{u["slug"]}-hero.svg" alt="{html.escape("Capa do artigo: " + u["titulo"])}" width="1200" height="630" loading="lazy" decoding="async">\n'
             f'</figure>\n<div class="publication-feature-copy">\n'
             f'<span class="publication-meta">{html.escape(FORMATOS[u["formato"]])} AUTORAL <i aria-hidden="true">·</i> {html.escape(u["area"].upper())}</span>\n'
             f'<h4>{html.escape(u["titulo"])}</h4>\n<p>{html.escape(u["subtitulo"])}</p>\n'
             f'<span class="publication-action">Ler artigo <i aria-hidden="true">↗</i></span>\n</div>\n</a>\n')
        for x in items[1:1 + n_itens]:
            h += (f'<a class="publication-radar-item" href="artigo-{x["slug"]}.html">\n'
                  f'<figure><img class="art-thumb" src="capa-{x["slug"]}-hero.svg" alt="{html.escape("Capa do artigo: " + x["titulo"])}" width="1200" height="630" loading="lazy" decoding="async"></figure>\n'
                  f'<div>\n<span class="publication-meta">{html.escape(FORMATOS[x["formato"]])} · {html.escape(x["area"].upper())}</span>\n<h4>{html.escape(x["titulo"])}</h4>\n</div>\n'
                  f'<span class="publication-radar-arrow" aria-hidden="true">→</span>\n</a>\n')
        return h
    trocar(DIST / 'index.html', '<!-- ARTIGO-DESTAQUE:START -->', '<!-- ARTIGO-DESTAQUE:END -->', lane(2))
    trocar(DIST / 'publicacoes.html', '<!-- ARTIGO-DESTAQUE:START -->', '<!-- ARTIGO-DESTAQUE:END -->', lane(5))
    convite = (f'<p class="eyebrow">LEITURA COM CONTEXTO</p>\n<h2>{html.escape(u["titulo"])}</h2>\n<p>{html.escape(u["subtitulo"])}</p>\n'
               f'<a class="inline-link" href="artigo-{u["slug"]}.html">Leia o artigo <span>↗</span>\n</a>\n')
    trocar(DIST / 'noticias.html', '<!-- CONVITE:START -->', '<!-- CONVITE:END -->', convite)
    mapa = DIST / 'sitemap.xml'
    t = re.sub(r'[ \t]*<url><loc>' + re.escape(ORIGIN) + r'/artigo-[^<]*</loc></url>\n', '', mapa.read_text(encoding='utf-8'))
    t = t.replace('</urlset>', ''.join(f'  <url><loc>{ORIGIN}/{x}</loc></url>\n' for x in sorted(gerados)) + '</urlset>')
    mapa.write_text(t, encoding='utf-8')
    print(f'{len(items)} artigos; {len(gerados)} páginas geradas.')


if __name__ == '__main__':
    main()
