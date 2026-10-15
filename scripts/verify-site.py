"""Read-only, dependency-free checks; not a substitute for browser/accessibility QA."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import base64
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'dist'
ORIGIN = 'https://liandrofaro.adv.br'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs, self.stack = path, set(), [], []
        self.h1, self.canonical, self.ld, self.ld_text = 0, [], False, ''
        self.consent = False
        self.feed(path.read_text())
        if self.stack: errors.append(f'{path.name}: unclosed {self.stack}')
        if self.h1 != 1: errors.append(f'{path.name}: h1 count {self.h1}')
        if not self.consent: errors.append(f'{path.name}: missing consentimento.js (cookie notice)')
        expected = ORIGIN + ('/' if path.name == 'index.html' else '/' + path.name)
        if path.name != '404.html' and self.canonical != [expected]:
            errors.append(f'{path.name}: canonical {self.canonical}')
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag not in VOID: self.stack.append(tag)
        if tag == 'h1': self.h1 += 1
        if 'id' in a:
            if a['id'] in self.ids: errors.append(f'{self.path.name}: duplicate id {a["id"]}')
            self.ids.add(a['id'])
        if tag == 'img' and 'alt' not in a: errors.append(f'{self.path.name}: missing alt')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        for key in ('src', 'href'):
            if a.get(key): self.refs.append(a[key])
        if tag == 'a' and a.get('target') == '_blank' and 'noopener' not in a.get('rel', ''):
            errors.append(f'{self.path.name}: unsafe external target')
        if tag == 'script' and a.get('type') == 'application/ld+json': self.ld = True
        if tag == 'script' and a.get('src', '').lstrip('/') == 'consentimento.js': self.consent = True
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack or self.stack[-1] != tag:
            errors.append(f'{self.path.name}: mismatched closing {tag}')
        elif self.stack: self.stack.pop()
        if tag == 'script' and self.ld:
            json.loads(self.ld_text)
            digest = base64.b64encode(hashlib.sha256(self.ld_text.encode()).digest()).decode()
            if 'sha256-' + digest not in (ROOT / '_headers').read_text():
                errors.append('JSON-LD CSP hash mismatch')
            self.ld = False
    def handle_data(self, data):
        if self.ld: self.ld_text += data

pages = {p.name: Page(p) for p in sorted(ROOT.glob('*.html'))}
checked = 0
external = set()
for page in pages.values():
    for ref in page.refs:
        u = urlsplit(ref)
        if u.scheme or u.netloc:
            if u.scheme == 'https': external.add(ref)
            continue
        name = unquote(u.path).lstrip('/') or page.path.name
        if not (ROOT / name).is_file(): errors.append(f'{page.path.name}: missing {ref}')
        if u.fragment and name in pages and unquote(u.fragment) not in pages[name].ids:
            errors.append(f'{page.path.name}: missing fragment {ref}')
        checked += 1
tree = ET.parse(ROOT / 'sitemap.xml')
for loc in tree.findall('.//{*}loc'):
    if not loc.text.startswith(ORIGIN + '/'): errors.append(f'wrong sitemap origin: {loc.text}')
    name = urlsplit(loc.text).path.lstrip('/') or 'index.html'
    if name not in pages: errors.append(f'missing sitemap page {name}')
for p in ROOT.glob('*'):
    if p.suffix in ('.html', '.xml', '.txt', '.js', '.css') and 'chatgpt.site' in p.read_text():
        errors.append(f'{p.name}: old domain')
print(f'{len(pages)} pages; {checked} local references; sitemap and JSON-LD/CSP checked.')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('PASS — structure, references, fragments, metadata, alt attributes and CSP hash.')
