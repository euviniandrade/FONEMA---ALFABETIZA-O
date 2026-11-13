#!/usr/bin/env python3
"""Procura no texto termos que contradizem as decisões do dono (D008, D009, D011, D012, D014...).

Uso:
    python3 tools/qualidade/verificar_termos.py                 # docs/ inteiro (menos registros)
    python3 tools/qualidade/verificar_termos.py --pasta docs/propostas/06-fonema-unificada
    python3 tools/qualidade/verificar_termos.py --todos         # mostra também linhas com negação
    python3 tools/qualidade/verificar_termos.py --regra D012    # só uma regra

Cada ocorrência sai como:  [REGRA] arquivo:linha  termo  | trecho
Linhas que já NEGAM o termo ("sem", "nunca", "não", "proibido", "fora", "evitar", "no lugar de",
"atualizado pela", citações de decisão...) são ignoradas, a menos que se use --todos.
É uma triagem: cada ocorrência precisa de leitura humana antes de corrigir.

Pastas ignoradas por padrão (registros históricos ou de terceiros): docs/pesquisa, docs/bibliografia,
docs/decisoes, vendor, fonts, tools/bibliografia/data.
"""
from __future__ import annotations

import argparse
import os
import re
import sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EXTS = (".md", ".html", ".js", ".vtt", ".txt", ".json", ".yaml", ".yml")
IGNORAR = [os.path.join("docs", p) for p in ("pesquisa", "bibliografia", "decisoes")] + [
    os.path.join("tools", "bibliografia", "data"),
    os.path.join("tools", "qualidade"),
    os.path.join("docs", "QUALIDADE.md"),
    os.path.join("docs", "CONVENCOES.md"),
]
IGNORAR_DIRS = {".git", "node_modules", "vendor", "fonts", "__pycache__"}

REGRAS: list[tuple[str, str, str]] = [
    # (regra, rótulo, regex)
    ("D011", "nome antigo da academia", r"Roda da Sofia"),
    ("D012", "festa junina / santos", r"\bjunin[ao]s?\b|festa de s[aã]o|festas? de santos?|quadrilha junina"),
    ("D012", "carnaval / halloween", r"\bcarnaval\b|halloween|dia das bruxas"),
    ("D012", "magia / bruxaria", r"\bm[aá]gic[ao]s?\b|\bmagia\b|bruxa|feiti[cç]|po[cç][aã]o|po[cç][oõ]es|varinha"),
    ("D012", "superstição", r"amuleto|hor[oó]scopo|\bsignos?\b|trevo de quatro|p[eé] de coelho"),
    ("D012", "entidade do folclore", r"\bSaci\b|Curupira|Boitat[aá]|Mula[- ]sem[- ]cabe[cç]a|\bCuca\b|lenda do boto|lobisomem"),
    ("D008", "joia / adorno", r"\bjoias?\b|brincos?\b|pulseiras?\b|\bcolar(es)? (de|com)\b|\banel (de|com) (ouro|prata|pedra)|mi[cç]angas?|tiaras?\b|fivelas?\b|piercing|maquiagem|batom"),
    ("D009", "arco-íris", r"arco[- ]?[íi]ris|rainbow"),
    ("D014", "'jogo' como identidade", r"^#+ .*\bjogo\b|\bo jogo (FONEMA|educativo)\b|\bnosso jogo\b|\bjogo de alfabetiza"),
    ("MARCA", "Boquinhas como nosso recurso", r"\bBoquinhas?\b"),
]
NEGACAO = re.compile(
    r"\b(sem|nunca|n[aã]o|nem|proib\w*|fora|evitar|evita|retir\w*|tirar|troca\w*|substitu\w*|no lugar|"
    r"em vez|atualizado|D0\d\d|Decis[aã]o 0\d\d|marca registrada|registrad\w*|de terceiro|exceto|"
    r"jamais|nada de|n[aã]o usar|vetad\w*|exclu\w*|banid\w*|checklist|confer\w*)\b",
    re.I,
)


def iterar(pastas):
    ign = [os.path.join(RAIZ, i) for i in IGNORAR]
    for pasta in pastas:
        base = os.path.join(RAIZ, pasta)
        if os.path.isfile(base):
            yield base
            continue
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in IGNORAR_DIRS and not any(os.path.join(dp, d).startswith(i) for i in ign)]
            for f in fns:
                cam = os.path.join(dp, f)
                if f.endswith(EXTS) and not any(cam.startswith(i) for i in ign):
                    yield cam


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pasta", action="append")
    ap.add_argument("--todos", action="store_true", help="não ignora linhas com negação")
    ap.add_argument("--regra", help="filtra uma regra (ex.: D012)")
    args = ap.parse_args()
    regras = [(r, n, re.compile(x, re.I if r != "D014" else 0)) for r, n, x in REGRAS if not args.regra or r == args.regra]
    total = 0
    for cam in iterar(args.pasta or ["docs"]):
        rel = os.path.relpath(cam, RAIZ)
        with open(cam, encoding="utf-8", errors="replace") as f:
            for n, linha in enumerate(f, 1):
                for regra, nome, rx in regras:
                    m = rx.search(linha)
                    if not m:
                        continue
                    if not args.todos and NEGACAO.search(linha):
                        continue
                    total += 1
                    ini = max(0, m.start() - 60)
                    trecho = linha[ini:m.end() + 60].strip().replace("\t", " ")
                    print(f"[{regra}] {rel}:{n}  {m.group(0)!r}  | {trecho}")
    print(f"\n{total} ocorrências para revisar.", file=sys.stderr)
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
