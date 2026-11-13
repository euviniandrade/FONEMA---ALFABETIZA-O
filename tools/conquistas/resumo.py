#!/usr/bin/env python3
"""Resumo do catálogo de conquistas do FONEMA.

Lê docs/propostas/06-fonema-unificada/conquistas/catalogo.json e imprime:
  1. totais (fixos x gerados) e contagem por tipo;
  2. tabela região x categoria (só itens fixos);
  3. curva acumulada de liberação por semana (de 4 em 4 semanas), com
     itens e "degraus" (níveis) liberados;
  4. checagens simples (ids únicos, campos obrigatórios, valores válidos).

Uso:
    python3 tools/conquistas/resumo.py [caminho/do/catalogo.json] [--semanal]
"""
import json
import sys
from collections import Counter, OrderedDict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PADRAO = RAIZ / "docs/propostas/06-fonema-unificada/conquistas/catalogo.json"

REGIOES = ["MAT", "R0", "R1", "R2a", "R2b", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "EV"]
CATEGORIAS = OrderedDict([
    ("fonema", "fon"), ("silaba", "síl"), ("palavra", "pal"), ("leitura", "lei"), ("compreensao", "comp"),
    ("valores", "val"), ("esporte", "esp"), ("ambiente", "amb"), ("conhecimento", "conh"),
    ("financeiro", "fin"), ("emocional", "emo"), ("computacional", "pc"), ("familia_professor", "fam/prof"),
    ("constancia", "const"), ("colecionador", "col"), ("segredo", "seg"),
])
TIPOS = ["selo", "medalha", "trofeu", "titulo", "emblema_colecao", "selo_validacao"]
VISIBILIDADE = {"visivel", "misterio", "oculto"}
CAMPOS = ["id", "nome", "tipo", "categoria", "regiao", "semana_liberacao", "criterio", "niveis",
          "animacao", "descricao_arte", "visivel_antes"]


def tabela(cabecalho, linhas):
    larg = [max(len(str(x)) for x in col) for col in zip(cabecalho, *linhas)]
    fmt = "| " + " | ".join("{:>%d}" % w for w in larg) + " |"
    print(fmt.format(*cabecalho))
    print("|" + "|".join("-" * (w + 2) for w in larg) + "|")
    for ln in linhas:
        print(fmt.format(*ln))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    semanal = "--semanal" in sys.argv
    caminho = Path(args[0]) if args else PADRAO
    itens = json.loads(caminho.read_text(encoding="utf-8"))

    # 4. checagens
    erros = []
    ids = Counter(i.get("id") for i in itens)
    erros += [f"id repetido: {k}" for k, v in ids.items() if v > 1]
    for i in itens:
        falta = [c for c in CAMPOS if c not in i]
        if falta:
            erros.append(f"{i.get('id')}: faltam {falta}")
        if i.get("tipo") not in TIPOS:
            erros.append(f"{i.get('id')}: tipo inválido {i.get('tipo')}")
        if i.get("categoria") not in CATEGORIAS:
            erros.append(f"{i.get('id')}: categoria inválida {i.get('categoria')}")
        if i.get("regiao") not in REGIOES:
            erros.append(f"{i.get('id')}: região inválida {i.get('regiao')}")
        if i.get("visivel_antes") not in VISIBILIDADE:
            erros.append(f"{i.get('id')}: visibilidade inválida {i.get('visivel_antes')}")

    fixos = [i for i in itens if not i.get("gerado")]
    gerados = [i for i in itens if i.get("gerado")]

    print("## 1. Totais\n")
    print(f"- Itens no JSON: **{len(itens)}** ({len(fixos)} fixos + {len(gerados)} gerados 'Maestria do Som')")
    degraus = sum(len(i["niveis"]) for i in fixos)
    print(f"- Degraus (níveis) entregáveis nos itens fixos: **{degraus}**")
    print(f"- Itens fixos da jornada R0–R10 + eventos (sem o Maternal): "
          f"**{sum(1 for i in fixos if i['regiao'] != 'MAT')}**")
    print(f"- Itens liberáveis pela Trilha Expressa: {sum(1 for i in itens if i.get('trilha_expressa'))}")
    vis = Counter(i["visivel_antes"] for i in fixos)
    print(f"- Visibilidade antes de ganhar (fixos): visível {vis['visivel']}, mistério {vis['misterio']}, "
          f"oculto {vis['oculto']}\n")
    tp = Counter(i["tipo"] for i in fixos)
    tabela(["tipo", "qtd (fixos)"], [[t, tp[t]] for t in TIPOS] + [["total", len(fixos)]])

    print("\n## 2. Região × categoria (itens fixos)\n")
    cab = ["região"] + list(CATEGORIAS.values()) + ["total"]
    linhas = []
    for r in REGIOES:
        c = Counter(i["categoria"] for i in fixos if i["regiao"] == r)
        linhas.append([r] + [c[k] or "·" for k in CATEGORIAS] + [sum(c.values())])
    tot = Counter(i["categoria"] for i in fixos)
    linhas.append(["total"] + [tot[k] for k in CATEGORIAS] + [len(fixos)])
    tabela(cab, linhas)
    print("\nGerados (Maestria do Som) por região: " +
          ", ".join(f"{r} {n}" for r, n in Counter(i["regiao"] for i in gerados).items()))

    print("\n## 3. Curva acumulada de liberação (semana da jornada)\n")
    print("Semana 0 = módulo Maternal. Eventos entram na semana mínima em que podem aparecer.\n")
    passo = 1 if semanal else 4
    marcos = [0] + list(range(passo, 105, passo))
    if 104 not in marcos:
        marcos.append(104)
    linhas, ant_i, ant_d = [], 0, 0
    for s in marcos:
        lib = [i for i in itens if i["semana_liberacao"] <= s]
        n_i = len(lib)
        n_d = sum(len(i["niveis"]) for i in lib if not i.get("gerado")) + sum(4 for i in lib if i.get("gerado"))
        linhas.append([s, n_i - ant_i, n_i, n_d - ant_d, n_d])
        ant_i, ant_d = n_i, n_d
    tabela(["semana até", "novos itens", "itens acumulados", "novos degraus", "degraus acumulados"], linhas)

    print("\n## 4. Checagens\n")
    print("- OK: nenhum problema encontrado." if not erros else "\n".join("- " + e for e in erros))
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
