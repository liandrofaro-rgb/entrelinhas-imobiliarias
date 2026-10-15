#!/usr/bin/env python3
"""Gera as ilustrações originais por tema em dist/ilustracao-<tema>.svg."""
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'
NAVY, BLUE, SOFT, PALE = '#07172f', '#1e5e91', '#bcd3e6', '#dce8f1'
INK = f'fill="none" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"'
HOUSE = lambda x, y, s=1, fill=BLUE: (
    f'<g transform="translate({x} {y}) scale({s})"><path d="M-60 0 L0 -55 L60 0" {INK}/>'
    f'<path d="M-45 -8 V55 H45 V-8" fill="{fill}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>'
    f'<rect x="-12" y="18" width="24" height="37" rx="2" fill="#fff" stroke="{NAVY}" stroke-width="5"/></g>')

TEMAS = {
 'divorcio': f'<circle cx="530" cy="330" r="115" {INK}/><circle cx="670" cy="330" r="115" fill="none" stroke="{BLUE}" stroke-width="6"/>' + HOUSE(600, 335, 1.1, SOFT),
 'heranca': f'<path d="M600 520 V330 M600 420 L520 350 M600 400 L690 330" {INK}/><circle cx="600" cy="250" r="105" fill="{SOFT}" stroke="{NAVY}" stroke-width="6"/><circle cx="520" cy="320" r="62" fill="{SOFT}" stroke="{NAVY}" stroke-width="6"/><circle cx="690" cy="315" r="68" fill="{SOFT}" stroke="{NAVY}" stroke-width="6"/>' + HOUSE(600, 255, .85) + f'<path d="M470 520 H730" {INK}/>',
 'usucapiao': f'<path d="M470 140 H730 L630 320 L730 500 H470 L570 320 Z" {INK}/><path d="M520 470 H680 L630 380 H570 Z" fill="{BLUE}" stroke="{NAVY}" stroke-width="4" stroke-linejoin="round"/><path d="M600 330 V380" stroke="{BLUE}" stroke-width="6" stroke-linecap="round"/>' + HOUSE(860, 430, .8, SOFT),
 'terra': f'<path d="M400 200 L800 180 L820 440 L420 460 Z" fill="#fff" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M560 192 L580 452 M420 330 L810 312" {INK}/><path d="M580 320 L800 312 L818 440 L584 452 Z" fill="{SOFT}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M400 500 H820 M400 488 V512 M820 488 V512" stroke="{BLUE}" stroke-width="5" stroke-linecap="round"/><path d="M700 250 c0 -30 -40 -30 -40 0 c0 20 20 35 20 50 c0 -15 20 -30 20 -50 z" fill="{BLUE}" stroke="{NAVY}" stroke-width="5"/>',
 'recibo': f'<path d="M470 130 H730 V500 L700 480 L665 500 L630 480 L595 500 L560 480 L525 500 L490 480 L470 500 Z" fill="#fff" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M515 200 H685 M515 250 H685 M515 300 H620" {INK}/><circle cx="660" cy="390" r="42" fill="{BLUE}" stroke="{NAVY}" stroke-width="6"/><path d="M640 390 L656 406 L682 374" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
 'chave': f'<circle cx="480" cy="315" r="95" fill="{SOFT}" stroke="{NAVY}" stroke-width="6"/><circle cx="480" cy="315" r="30" fill="#eef4f8" stroke="{NAVY}" stroke-width="6"/><path d="M575 315 H860 M780 315 V375 M830 315 V360" {INK}/>' + HOUSE(760, 215, .55, BLUE),
 'cadeado': f'<path d="M520 300 V230 C520 150 680 150 680 230 V300" {INK}/><rect x="470" y="290" width="260" height="210" rx="24" fill="{SOFT}" stroke="{NAVY}" stroke-width="6"/><circle cx="600" cy="375" r="26" fill="{BLUE}" stroke="{NAVY}" stroke-width="5"/><path d="M600 395 V450" stroke="{NAVY}" stroke-width="9" stroke-linecap="round"/>',
 'predio': f'<rect x="470" y="140" width="250" height="360" fill="#fff" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><rect x="380" y="300" width="90" height="200" fill="{SOFT}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><rect x="720" y="260" width="100" height="240" fill="{SOFT}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>' + ''.join(f'<rect x="{x}" y="{y}" width="40" height="34" rx="3" fill="{BLUE if (x+y)%3==0 else PALE}" stroke="{NAVY}" stroke-width="4"/>' for x in (500, 560, 640) for y in (180, 250, 320)) + f'<rect x="570" y="425" width="50" height="75" rx="3" fill="{BLUE}" stroke="{NAVY}" stroke-width="5"/><path d="M340 500 H860" {INK}/>',
 'balanca': f'<path d="M600 150 V470 M520 500 H680 M440 210 H760" {INK}/><circle cx="600" cy="150" r="14" fill="{BLUE}" stroke="{NAVY}" stroke-width="5"/><path d="M440 210 L380 340 H500 Z M760 210 L700 340 H820 Z" fill="none" stroke="{NAVY}" stroke-width="5" stroke-linejoin="round"/><path d="M370 340 H510 Q440 410 370 340 Z" fill="{SOFT}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M690 340 H830 Q760 410 690 340 Z" fill="{BLUE}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>',
 'tributo': HOUSE(470, 300, 1.5, SOFT) + f'<circle cx="760" cy="330" r="125" fill="{BLUE}" stroke="{NAVY}" stroke-width="6"/><circle cx="760" cy="330" r="98" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 9"/><circle cx="718" cy="290" r="14" fill="none" stroke="#fff" stroke-width="8"/><circle cx="802" cy="372" r="14" fill="none" stroke="#fff" stroke-width="8"/><path d="M810 280 L710 382" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M470 460 H560" {INK}/>',
 'cartorio': f'<rect x="450" y="130" width="300" height="380" rx="6" fill="#fff" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M495 200 H705 M495 250 H705 M495 300 H640" {INK}/><circle cx="660" cy="410" r="52" fill="{BLUE}" stroke="{NAVY}" stroke-width="6"/><circle cx="660" cy="410" r="36" fill="none" stroke="#fff" stroke-width="3"/><path d="M640 410 L655 425 L682 394" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M630 455 L618 505 L660 480 L702 505 L690 455" fill="{SOFT}" stroke="{NAVY}" stroke-width="5" stroke-linejoin="round"/>',
 'calendario': f'<rect x="440" y="160" width="320" height="340" rx="16" fill="#fff" stroke="{NAVY}" stroke-width="6"/><path d="M440 160 H760 V235 H440 Z" fill="{BLUE}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/><path d="M510 130 V190 M690 130 V190" {INK}/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{SOFT if (x+y)%2 else PALE}" stroke="{NAVY}" stroke-width="3"/>' for x in (490, 545, 600, 655, 710) for y in (290, 340)) + f'<text x="600" y="452" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="76" fill="{NAVY}">10 anos</text>',
}


def svg(tema, corpo):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img">'
            '<rect width="1200" height="630" fill="#eef4f8"/><circle cx="980" cy="120" r="220" fill="#dce8f1"/>'
            '<circle cx="150" cy="560" r="180" fill="#e6eef5"/>'
            '<g fill="none" stroke="#07172f" stroke-opacity=".22" stroke-width="3" stroke-linecap="round">'
            '<path d="M120 520 H330"/><path d="M870 520 H1080"/><path d="M200 560 H300"/><path d="M900 560 H1000"/></g>'
            f'{corpo}</svg>\n')


if __name__ == '__main__':
    for tema, corpo in TEMAS.items():
        (DIST / f'ilustracao-{tema}.svg').write_text(svg(tema, corpo), encoding='utf-8')
    print(f'{len(TEMAS)} ilustrações geradas.')
