#!/usr/bin/env python3
"""FONEMA — Etapa 3: exporta a bibliografia validada.

Lê data/validado.jsonl e gera em docs/bibliografia/:
  - bibliografia_fonema.xlsx (aba Resumo + aba Todos + uma aba por país)
  - bibliografia_fonema.csv
  - README.md (metodologia, números por país/eixo/evidência)
  - paises/<CODIGO>.md (lista legível por país, agrupada por eixo)
"""
import csv, json, os, collections
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

from coletar import PAISES, EIXOS, DATA

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(RAIZ, "docs", "bibliografia")
NIVEL = {"A": "A — meta-análise / revisão sistemática", "B": "B — ensaio randomizado/controlado",
         "C": "C — revisão narrativa", "D": "D — estudo primário"}


import re as _re


def limpo(t):
    return _re.sub(r"\s+", " ", _re.sub(r"<[^>]+>", " ", t or "")).strip()


def link(r):
    if r.get("doi"):
        return "https://doi.org/" + r["doi"]
    if r.get("pmid"):
        return f"https://pubmed.ncbi.nlm.nih.gov/{r['pmid']}/"
    return ""


def autores_curto(r):
    a = r.get("autores") or []
    if not a:
        return ""
    return a[0] + (" et al." if len(a) > 2 else (" & " + a[1] if len(a) == 2 else ""))


def main():
    os.makedirs(os.path.join(OUT, "paises"), exist_ok=True)
    regs = [json.loads(l) for l in open(os.path.join(DATA, "validado.jsonl"))]
    vstats = json.load(open(os.path.join(DATA, "validacao_stats.json")))
    brutas = json.load(open(os.path.join(DATA, "contagens_brutas.json"))) if os.path.exists(os.path.join(DATA, "contagens_brutas.json")) else {}
    por_pais = collections.defaultdict(list)
    for r in regs:
        por_pais[r["pais"]].append(r)

    cols = ["País", "Eixos", "Evidência", "Ano", "Autores", "Título", "Periódico", "DOI", "PMID", "Link", "Base(s)", "Relevância"]

    def linha(r):
        return [PAISES[r["pais"]][0], "; ".join(EIXOS[e]["nome"] for e in r["eixos"]), r["evidencia"], r.get("ano", ""),
                autores_curto(r), limpo(r["titulo"]), limpo(r.get("periodico", "")), r.get("doi", ""), r.get("pmid", ""), link(r),
                "+".join(r.get("bases", [])), r.get("relevancia", 0)]

    # CSV
    with open(os.path.join(OUT, "bibliografia_fonema.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in regs:
            w.writerow(linha(r))

    # Base completa validada (todos os aprovados no 1º filtro, sem o corte de 500)
    import gzip
    pt = os.path.join(DATA, "validos_todos.jsonl")
    if os.path.exists(pt):
        n = 0
        with gzip.open(os.path.join(OUT, "base_completa_validada.csv.gz"), "wt", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(cols)
            for l in open(pt):
                w.writerow(linha(json.loads(l))); n += 1
        print("base completa:", n)

    # XLSX
    wb = Workbook()
    ws = wb.active
    ws.title = "Resumo"
    ws.append(["País", "Código", "Selecionados (até 500)", "Válidos únicos", "Rejeitados no filtro", "Nível A", "Nível B", "Nível C", "Nível D"])
    for cod in sorted(por_pais, key=lambda c: -len(por_pais[c])):
        lst = por_pais[cod]
        cnt = collections.Counter(r["evidencia"] for r in lst)
        st = vstats["stats"].get(cod, {})
        ws.append([PAISES[cod][0], cod, len(lst), st.get("validos_unicos", ""), st.get("rejeitados", ""),
                   cnt["A"], cnt["B"], cnt["C"], cnt["D"]])
    for c in ws[1]:
        c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="5B3FD9")

    def aba(nome, lista):
        s = wb.create_sheet(nome[:31])
        s.append(cols)
        for r in lista:
            s.append(linha(r))
            if link(r):
                s.cell(row=s.max_row, column=10).hyperlink = link(r)
        for c in s[1]:
            c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="5B3FD9")
        larg = [14, 40, 9, 6, 24, 80, 30, 26, 10, 36, 14, 9]
        for i, l in enumerate(larg, 1):
            s.column_dimensions[get_column_letter(i)].width = l
        s.freeze_panes = "A2"
        s.auto_filter.ref = s.dimensions

    aba("Todos", regs)
    for cod in sorted(por_pais, key=lambda c: -len(por_pais[c])):
        aba(f"{cod} {PAISES[cod][0]}", por_pais[cod])
    wb.save(os.path.join(OUT, "bibliografia_fonema.xlsx"))

    # Markdown por país
    for cod, lst in por_pais.items():
        with open(os.path.join(OUT, "paises", f"{cod}.md"), "w") as f:
            f.write(f"# {PAISES[cod][0]} — bibliografia validada ({len(lst)} trabalhos)\n\n")
            f.write("Ordenado por nível de evidência e relevância. Níveis: A = meta-análise/revisão sistemática; "
                    "B = ensaio randomizado/controlado; C = revisão; D = estudo primário.\n\n")
            for eixo, e in EIXOS.items():
                sub = [r for r in lst if eixo in r["eixos"]]
                if not sub:
                    continue
                f.write(f"## {e['nome']} ({len(sub)})\n\n")
                for r in sub:
                    f.write(f"- **[{r['evidencia']}]** {autores_curto(r)} ({r.get('ano','')}). {limpo(r['titulo'])} "
                            f"*{r.get('periodico','')}*. {link(r)}\n")
                f.write("\n")

    # README
    tot_eixo = collections.Counter(e for r in regs for e in r["eixos"])
    tot_niv = collections.Counter(r["evidencia"] for r in regs)
    rej = collections.Counter()
    for d in vstats["rejeitados"].values():
        rej.update(d)
    with open(os.path.join(OUT, "README.md"), "w") as f:
        f.write("# Bibliografia acadêmica validada — FONEMA\n\n")
        f.write(f"**{len(regs)} trabalhos validados** de **{len(por_pais)} países**, sobre método fônico, "
                "aquisição da leitura e neurociência da aprendizagem.\n\n")
        f.write("Arquivos: [`bibliografia_fonema.xlsx`](bibliografia_fonema.xlsx) (uma aba por país, com filtros e links), "
                "[`bibliografia_fonema.csv`](bibliografia_fonema.csv), listas por país em [`paises/`](paises/) e a "
                "**base completa validada** (todos os aprovados no filtro, sem o corte de 500) em "
                "[`base_completa_validada.csv.gz`](base_completa_validada.csv.gz).\n\n")
        f.write("## Como foi feito (3 etapas)\n\n"
                "1. **Coleta** (`tools/bibliografia/coletar.py`): PubMed (filtro pelo país da afiliação dos autores) e "
                "Crossref (afiliação + consultas em inglês, português e espanhol) em 8 eixos temáticos, por país.\n"
                "2. **Validação e 1º filtro**: registro existe na base (PMID/DOI); país confirmado no texto de afiliação; "
                "exclusão de retratações, erratas, comentários, cartas e editoriais; relevância temática por palavras-chave "
                "no título/resumo; deduplicação; classificação por nível de evidência; corte de até 500 por país "
                "(garantindo os 40 melhores de cada eixo).\n"
                "3. **Entrega** (`tools/bibliografia/exportar.py`): planilha, CSV e listas.\n\n")
        f.write("**Limites honestos:** a coleta usa bases indexadas (forte em saúde, psicologia e neurociência; "
                "mais fraca em livros e literatura cinzenta de educação). Países com pouca produção indexada nesses "
                "temas ficam abaixo de 500 — o número mostra a produção real encontrada, sem enchimento. O filtro é "
                "automático (1º filtro); a curadoria final das obras-chave está nos relatórios temáticos em `docs/pesquisa/`.\n\n")
        f.write("## Por país\n\n| País | Selecionados | Válidos únicos | A | B | C | D |\n|---|---|---|---|---|---|---|\n")
        for cod in sorted(por_pais, key=lambda c: -len(por_pais[c])):
            lst = por_pais[cod]; cnt = collections.Counter(r["evidencia"] for r in lst)
            st = vstats["stats"].get(cod, {})
            f.write(f"| [{PAISES[cod][0]}](paises/{cod}.md) | {len(lst)} | {st.get('validos_unicos','')} | "
                    f"{cnt['A']} | {cnt['B']} | {cnt['C']} | {cnt['D']} |\n")
        f.write("\n## Por eixo temático\n\n| Eixo | Trabalhos |\n|---|---|\n")
        for eixo, e in EIXOS.items():
            f.write(f"| {e['nome']} | {tot_eixo[eixo]} |\n")
        f.write("\n## Por nível de evidência\n\n| Nível | Trabalhos |\n|---|---|\n")
        for k in "ABCD":
            f.write(f"| {NIVEL[k]} | {tot_niv[k]} |\n")
        f.write("\n## Rejeitados no 1º filtro\n\n| Motivo | Registros |\n|---|---|\n")
        for k, v in rej.most_common():
            f.write(f"| {k} | {v} |\n")
    print("exportado:", len(regs), "registros,", len(por_pais), "países")


if __name__ == "__main__":
    main()
