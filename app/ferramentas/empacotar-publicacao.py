#!/usr/bin/env python3
"""Prepara o dist/ para publicar como página única (limite de arquivos): junta os mp3 de audio/falas e
audio/nomes num pacote (audio/pacote.mp3 + audio/pacote.json). Só entram os clipes citados nos manifestos.
Os clipes que o Espelho do Som toca direto pelo caminho continuam também como arquivos soltos.
Uso: empacotar-publicacao.py <dist> <pasta-nova>"""
import json, os, re, shutil, sys
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): sys.exit(f'{out} já existe: escolha uma pasta nova')
shutil.copytree(src, out, ignore=shutil.ignore_patterns('*.py', '*.md', '*.map', '*.mp3'))
man = json.load(open(os.path.join(src, 'audio/falas/manifesto.json')))
usados = set(man.values())
soltos = set()
ea = os.path.join(src, 'espelho/espelho-audio.js')
if os.path.exists(ea):
    js = open(ea).read()
    for quem, texto, arq in re.findall(r"\['(sofia|tales)', '((?:[^'\\]|\\.)*)', '([^']+\.mp3)'\]", js):
        soltos.add(man.get(f'{quem}|{texto}', arq))
    for k, arq in man.items():
        if re.match(r'^(sofia|tales)\|.{1,3}, de \w+[.!]?$', k): soltos.add(arq)
itens, blob = {}, bytearray()
for base in ('audio/falas', 'audio/nomes'):
    for raiz, _, arqs in os.walk(os.path.join(src, base)):
        for a in sorted(arqs):
            if not a.endswith('.mp3') or (base == 'audio/falas' and a not in usados): continue
            p = os.path.join(raiz, a); d = open(p, 'rb').read(); rel = os.path.relpath(p, src).replace(os.sep, '/')
            itens[rel] = [len(blob), len(d)]; blob += d
            if a in soltos and base == 'audio/falas': shutil.copy(p, os.path.join(out, rel))
for raiz, _, arqs in os.walk(src):  # demais mp3 (música, diálogo da dupla) seguem como arquivos
    for a in arqs:
        rel = os.path.relpath(os.path.join(raiz, a), src).replace(os.sep, '/')
        if a.endswith('.mp3') and not rel.startswith(('audio/falas/', 'audio/nomes/')):
            os.makedirs(os.path.dirname(os.path.join(out, rel)), exist_ok=True); shutil.copy(os.path.join(raiz, a), os.path.join(out, rel))
open(os.path.join(out, 'audio/pacote.mp3'), 'wb').write(blob)
json.dump({'arquivo': 'pacote.mp3', 'itens': itens}, open(os.path.join(out, 'audio/pacote.json'), 'w'))
n = sum(len(fs) for _, _, fs in os.walk(out))
print(f'{len(itens)} clipes no pacote ({len(blob)/1e6:.1f} MB); {len(soltos)} soltos; {n} arquivos no total')
