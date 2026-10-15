#!/usr/bin/env python3
"""Gera as imagens de pré-visualização de links (og:image) em PNG, 1200x630.

WhatsApp, Facebook e LinkedIn ignoram SVG em og:image, então cada capa de
artigo (capa-<slug>.svg) e cada ilustração de notícia (ilustracao-*.svg) vira
og-<nome>.png em dist/. Só refaz o que mudou.

Uso: python3 scripts/build-og-images.py
Precisa de um Chrome/Chromium instalado (variável CHROME, o PATH ou o caminho do Playwright).
"""
import glob, os, shutil, subprocess, sys, tempfile
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'


def achar_chrome():
    if os.environ.get('CHROME'): return os.environ['CHROME']
    for nome in ('chromium', 'chromium-browser', 'google-chrome', 'chrome'):
        achado = shutil.which(nome)
        if achado: return achado
    base = os.environ.get('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
    for padrao in ('chromium_headless_shell-*/chrome-linux/headless_shell', 'chromium-*/chrome-linux/chrome'):
        achados = sorted(glob.glob(os.path.join(base, padrao)))
        if achados: return achados[-1]
    sys.exit('Chrome/Chromium não encontrado; defina a variável CHROME.')


def main():
    chrome = achar_chrome()
    fontes = [p for p in sorted(DIST.glob('capa-*.svg')) if not p.stem.endswith('-hero')] + sorted(DIST.glob('ilustracao-*.svg'))
    feitos = 0
    for svg in fontes:
        png = DIST / f'og-{svg.stem}.png'
        if png.exists() and png.stat().st_mtime >= svg.stat().st_mtime: continue
        with tempfile.TemporaryDirectory() as tmp:
            pagina = Path(tmp) / 'og.html'
            pagina.write_text(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:#fff}}img{{display:block;width:1200px;height:630px}}</style><img src="{svg.resolve().as_uri()}">', encoding='utf-8')
            saida = Path(tmp) / 'out.png'
            subprocess.run([chrome, '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                            '--window-size=1200,630', f'--screenshot={saida}', pagina.as_uri()],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            png.write_bytes(saida.read_bytes())
        feitos += 1
    print(f'{len(fontes)} fontes; {feitos} imagens geradas.')


if __name__ == '__main__':
    main()
