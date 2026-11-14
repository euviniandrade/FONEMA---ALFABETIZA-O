#!/usr/bin/env python3
"""Prepara o dist/ para publicar como página única: junta os mp3 de audio/falas e audio/nomes num pacote
(audio/pacote.bin + audio/pacote.json) e remove os arquivos soltos. Uso: empacotar-publicacao.py <dist> <saida>"""
import json, os, shutil, sys
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): sys.exit(f'{out} já existe: escolha uma pasta nova')
shutil.copytree(src, out, ignore=shutil.ignore_patterns('*.py', '*.md', '*.map'))
import re
manter = set()
ea = os.path.join(out, 'espelho/espelho-audio.js')
if os.path.exists(ea):  # o Espelho do Som toca estes clipes direto pelo caminho
    manter = set(re.findall(r"'([a-z]+-[a-z0-9]+\.mp3)'", open(ea).read()))
itens, blob = {}, bytearray()
for base in ('audio/falas', 'audio/nomes'):
    for raiz, _, arqs in os.walk(os.path.join(out, base)):
        for a in sorted(arqs):
            if not a.endswith('.mp3'): continue
            p = os.path.join(raiz, a); d = open(p, 'rb').read()
            itens[os.path.relpath(p, out).replace(os.sep, '/')] = [len(blob), len(d)]; blob += d
            if a not in manter: os.remove(p)
open(os.path.join(out, 'audio/pacote.bin'), 'wb').write(blob)
json.dump({'arquivo': 'pacote.bin', 'itens': itens}, open(os.path.join(out, 'audio/pacote.json'), 'w'))
for f in ('sw.js', 'registerSW.js'):
    pass  # o service worker não roda na página publicada; os arquivos ficam, sem efeito
n = sum(len(fs) for _, _, fs in os.walk(out))
print(f'{len(itens)} clipes no pacote ({len(blob)/1e6:.1f} MB); {n} arquivos no total')
