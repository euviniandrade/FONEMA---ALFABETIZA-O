#!/usr/bin/env python3
"""Verifica arquivos do repositório: duplicados (mesmo conteúdo), grandes demais e nomes problemáticos.

Uso:
    python3 tools/qualidade/verificar_arquivos.py              # tudo
    python3 tools/qualidade/verificar_arquivos.py --limite-mb 20
    python3 tools/qualidade/verificar_arquivos.py --so-git     # só arquivos versionados (git ls-files)
    python3 tools/qualidade/verificar_arquivos.py --estrito    # aponta também maiúsculas

Relata (não apaga nem renomeia nada):
  [DUPLICADO]  grupos de arquivos com o mesmo hash SHA-256
  [GRANDE]     arquivos acima do limite (padrão 20 MB)
  [NOME]       nomes com espaço, acento/ç ou caracteres especiais (maiúsculas só com --estrito;
               siglas de país e letras de opção, ex.: BR.md, K-tales-...mp3, são aceitas)
Pastas sempre ignoradas: .git, node_modules, __pycache__, tools/bibliografia/data.
Duplicados dentro de vendor/ e fonts/ (bibliotecas e fontes copiadas por protótipo) são resumidos à parte.
"""
from __future__ import annotations

import argparse
import hashlib
import os
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IGNORAR_DIRS = {".git", "node_modules", "__pycache__"}
IGNORAR_CAMINHOS = (os.path.join("tools", "bibliografia", "data"),)
PASTAS_COPIA_ESPERADA = ("vendor", "fonts")
RE_NOME_OK = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9._-]*$")  # "_" inicial = fonte HTML de arte
RE_NOME_ESTRITO = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
# Exceções aceitas para nomes (convenções de ecossistema)
NOMES_ACEITOS = {"README.md", "LICENSE", "CLAUDE.md", "INDICE.md", "QUALIDADE.md", "CONVENCOES.md",
                 "Makefile", "Dockerfile", ".gitignore", ".gitattributes", ".env.example"}


def listar(so_git: bool):
    if so_git:
        saida = subprocess.run(["git", "ls-files", "-z"], cwd=RAIZ, capture_output=True, check=True).stdout
        for rel in saida.decode("utf-8").split("\0"):
            if rel and os.path.isfile(os.path.join(RAIZ, rel)):
                yield rel
        return
    for dirpath, dirnames, filenames in os.walk(RAIZ):
        dirnames[:] = [d for d in dirnames if d not in IGNORAR_DIRS]
        rel_dir = os.path.relpath(dirpath, RAIZ)
        if any(rel_dir == c or rel_dir.startswith(c + os.sep) for c in IGNORAR_CAMINHOS):
            dirnames[:] = []
            continue
        for nome in filenames:
            yield os.path.normpath(os.path.join(rel_dir, nome))


def sha256(caminho: str) -> str:
    h = hashlib.sha256()
    with open(caminho, "rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def tem_acento(s: str) -> bool:
    return any(unicodedata.category(c) == "Mn" for c in unicodedata.normalize("NFD", s))


def problema_nome(rel: str, estrito: bool = False) -> str | None:
    partes = rel.split(os.sep)
    if any(p in ("vendor", "fonts") for p in partes):
        return None  # nomes vêm de bibliotecas de terceiros
    nome = partes[-1]
    if nome in NOMES_ACEITOS:
        return None
    for p in partes:
        if " " in p:
            return "espaço no nome"
        if tem_acento(p):
            return "acento/ç no nome"
    if nome.startswith("."):
        return None
    if not RE_NOME_OK.match(nome):
        return "caractere especial"
    if estrito and not RE_NOME_ESTRITO.match(nome):
        return "maiúscula (modo --estrito)"
    return None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limite-mb", type=float, default=20.0)
    ap.add_argument("--so-git", action="store_true", help="só arquivos versionados")
    ap.add_argument("--estrito", action="store_true", help="também aponta maiúsculas em nomes de arquivo")
    args = ap.parse_args()

    por_hash: dict[str, list[str]] = defaultdict(list)
    grandes, nomes = [], []
    for rel in listar(args.so_git):
        cam = os.path.join(RAIZ, rel)
        tam = os.path.getsize(cam)
        if tam == 0:
            continue
        if tam > args.limite_mb * 1024 * 1024:
            grandes.append((rel, tam))
        p = problema_nome(rel, args.estrito)
        if p:
            nomes.append((rel, p))
        por_hash[sha256(cam)].append(rel)

    dups_conteudo, dups_copia = [], 0
    for h, arqs in por_hash.items():
        if len(arqs) < 2:
            continue
        if all(any(seg in PASTAS_COPIA_ESPERADA for seg in a.split(os.sep)) for a in arqs):
            dups_copia += 1
            continue
        dups_conteudo.append(sorted(arqs))

    for grupo in sorted(dups_conteudo):
        print("[DUPLICADO] " + "  ==  ".join(grupo))
    for rel, tam in sorted(grandes):
        print(f"[GRANDE] {rel}  ({tam / 1024 / 1024:.1f} MB)")
    for rel, p in sorted(nomes):
        print(f"[NOME] {rel}  ({p})")
    print(
        f"\nResumo: {len(dups_conteudo)} grupos duplicados; {dups_copia} grupos de cópias esperadas em vendor/fonts; "
        f"{len(grandes)} arquivos > {args.limite_mb:g} MB; {len(nomes)} nomes problemáticos.",
        file=sys.stderr,
    )
    return 1 if (dups_conteudo or grandes or nomes) else 0


if __name__ == "__main__":
    sys.exit(main())
