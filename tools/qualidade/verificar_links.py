#!/usr/bin/env python3
"""Verifica links e imagens relativos quebrados nos arquivos Markdown e HTML do repositório.

Uso:
    python3 tools/qualidade/verificar_links.py            # relatório completo
    python3 tools/qualidade/verificar_links.py --pasta docs/universo
    python3 tools/qualidade/verificar_links.py --ignorar docs/pesquisa --ignorar docs/bibliografia

Saída: uma linha por link quebrado  ->  arquivo:linha  [tipo]  destino
Código de saída: 0 se nada quebrado, 1 se houver links quebrados.

Regras:
- Só verifica destinos relativos (ignora http(s)://, mailto:, data:, #âncora pura).
- Aceita destinos com %20 / acentos codificados (decodifica antes de checar).
- Remove âncora (#...) e query (?...) antes de checar o arquivo.
- Ignora blocos de código cercados por ``` no Markdown.
- Pastas sempre ignoradas: .git, node_modules, vendor, __pycache__, tools/bibliografia/data.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from urllib.parse import unquote

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SEMPRE_IGNORAR = {".git", "node_modules", "vendor", "__pycache__"}
CAMINHOS_IGNORADOS = {os.path.join("tools", "bibliografia", "data")}

# [texto](destino "título")  e  ![alt](destino)
RE_MD_LINK = re.compile(r"(!?)\[(?:[^\]\[]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
# referência: [id]: destino
RE_MD_REF = re.compile(r"^\s*\[[^\]]+\]:\s+<?(\S+?)>?(?:\s+.*)?$")
# HTML: src="..." href="..."
RE_HTML_ATTR = re.compile(r"""\b(src|href|poster)\s*=\s*["']([^"']+)["']""", re.I)


def externo(destino: str) -> bool:
    d = destino.strip().lower()
    return (
        d.startswith(("http://", "https://", "mailto:", "data:", "tel:", "javascript:", "//", "blob:"))
        or d.startswith("#")
        or d == ""
        or "${" in d  # template JS
        or "{{" in d
    )


def normalizar(destino: str) -> str:
    destino = destino.split("#", 1)[0].split("?", 1)[0]
    return unquote(destino)


def iterar_arquivos(pastas: list[str], ignorar: list[str]):
    ignorar_abs = [os.path.abspath(os.path.join(RAIZ, i)) for i in ignorar]
    ignorar_abs += [os.path.join(RAIZ, c) for c in CAMINHOS_IGNORADOS]
    for pasta in pastas:
        base = os.path.abspath(os.path.join(RAIZ, pasta))
        if os.path.isfile(base):
            yield base
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [
                d for d in dirnames
                if d not in SEMPRE_IGNORAR
                and not any(os.path.join(dirpath, d).startswith(i) for i in ignorar_abs)
            ]
            for nome in filenames:
                if nome.lower().endswith((".md", ".html", ".htm")):
                    yield os.path.join(dirpath, nome)


def links_do_arquivo(caminho: str):
    """Gera (linha, tipo, destino)."""
    eh_md = caminho.lower().endswith(".md")
    em_codigo = False
    with open(caminho, encoding="utf-8", errors="replace") as f:
        for n, linha in enumerate(f, 1):
            if eh_md:
                if linha.lstrip().startswith("```"):
                    em_codigo = not em_codigo
                    continue
                if em_codigo:
                    continue
                # remove código inline `...`
                sem_codigo = re.sub(r"`[^`]*`", "", linha)
                for m in RE_MD_LINK.finditer(sem_codigo):
                    yield n, ("imagem" if m.group(1) else "link"), m.group(2)
                m = RE_MD_REF.match(sem_codigo)
                if m:
                    yield n, "ref", m.group(1)
                for m in RE_HTML_ATTR.finditer(sem_codigo):
                    yield n, "html-" + m.group(1).lower(), m.group(2)
            else:
                for m in RE_HTML_ATTR.finditer(linha):
                    yield n, "html-" + m.group(1).lower(), m.group(2)


def verificar(pastas: list[str], ignorar: list[str]):
    quebrados = []
    total = 0
    for arq in iterar_arquivos(pastas, ignorar):
        pasta_arq = os.path.dirname(arq)
        for n, tipo, destino in links_do_arquivo(arq):
            if externo(destino):
                continue
            total += 1
            alvo = normalizar(destino)
            if not alvo:
                continue
            if alvo.startswith("/"):
                caminho_alvo = os.path.join(RAIZ, alvo.lstrip("/"))
            else:
                caminho_alvo = os.path.normpath(os.path.join(pasta_arq, alvo))
            if not os.path.exists(caminho_alvo):
                quebrados.append((os.path.relpath(arq, RAIZ), n, tipo, destino))
    return total, quebrados


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pasta", action="append", help="pasta (relativa à raiz) a verificar; padrão: raiz inteira")
    ap.add_argument("--ignorar", action="append", default=[], help="pasta (relativa à raiz) a ignorar")
    args = ap.parse_args()
    pastas = args.pasta or ["."]
    total, quebrados = verificar(pastas, args.ignorar)
    for arq, n, tipo, destino in quebrados:
        print(f"{arq}:{n}  [{tipo}]  {destino}")
    print(f"\n{total} links relativos verificados; {len(quebrados)} quebrados.", file=sys.stderr)
    return 1 if quebrados else 0


if __name__ == "__main__":
    sys.exit(main())
