#!/usr/bin/env python3
"""FONEMA — coletor e validador de bibliografia acadêmica, por país.

Etapa 1 (coleta): consulta o PubMed (filtro por país da afiliação dos autores,
via campo [ad]) e o Crossref (query.affiliation) para 8 eixos temáticos.

Etapa 2 (validação e 1º filtro):
  - registro existe na base (PMID no PubMed / DOI registrado no Crossref);
  - país confirmado no texto de afiliação de pelo menos um autor;
  - exclui retratados, erratas, comentários, cartas e editoriais;
  - relevância: palavras-chave do eixo no título (ou >=2 no resumo);
  - deduplicação por DOI / PMID / título normalizado;
  - nível de evidência (A meta-análise/revisão sistemática, B ensaio
    randomizado/controlado, C revisão, D estudo primário);
  - corte de até N registros por país, ordenados por evidência, relevância
    e recência.

Saída: data/raw/*.jsonl (bruto) e data/validado.jsonl (aprovados) + rejeitados.
Uso: python3 coletar.py [--max-por-pais 500]
"""
import argparse, json, os, re, sys, time, unicodedata
import urllib.parse, urllib.request
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(AQUI, "data")
UA = "fonema-bibliografia/1.0 (pesquisa educacional)"

# ---------------------------------------------------------------- eixos
CRIANCA = '(child OR children OR childhood OR preschool OR kindergarten OR "primary school" OR pupils OR students)'
EIXOS = {
    "metodo_fonico": {
        "nome": "Método fônico e aquisição da leitura",
        "pubmed": '(phonics OR "phonological awareness" OR "phonemic awareness" OR "learning to read" OR "reading acquisition" OR "early literacy" OR "emergent literacy" OR "letter-sound" OR "letter knowledge" OR "word decoding" OR "reading instruction" OR "literacy acquisition" OR "orthographic learning" OR "beginning readers")',
        "crossref": "phonics phonological awareness learning to read early literacy reading instruction",
        "chaves": ["phonic", "phonolog", "phonem", "learning to read", "reading acquisition", "literacy", "letter-sound", "letter knowledge", "decoding", "reading instruction", "beginning reader", "orthograph", "alfabetiza", "consciência fonol", "leitura", "lectura", "lecture"],
    },
    "dislexia": {
        "nome": "Dislexia e dificuldades de leitura",
        "pubmed": '(dyslexia OR "reading disability" OR "reading disabilities" OR "reading difficulties" OR "poor readers" OR "struggling readers")',
        "crossref": "dyslexia reading difficulties intervention children",
        "chaves": ["dislexi", "dyslex", "reading disab", "reading difficult", "poor reader", "struggling reader", "dislexia"],
    },
    "neuro_leitura": {
        "nome": "Neurociência da leitura",
        "pubmed": f'((reading OR literacy OR "visual word form") AND (brain OR fMRI OR EEG OR ERP OR neural OR neuroimaging OR cortex OR "white matter") AND {CRIANCA})',
        "crossref": "neuroscience of reading brain children literacy fMRI",
        "chaves": ["reading", "literacy", "visual word form", "readers", "letter"],
        "chaves_extra": ["brain", "fmri", "eeg", "erp", "neural", "neuroimag", "cortex", "white matter", "neuro"],
    },
    "neuro_aprendizagem": {
        "nome": "Neurociência da aprendizagem (memória, atenção, funções executivas)",
        "pubmed": f'(("educational neuroscience" OR neuroeducation OR "mind brain and education" OR "spacing effect" OR "spaced repetition" OR "spaced learning" OR "retrieval practice" OR "testing effect" OR "executive function" OR "executive functions" OR "working memory" OR "sleep-dependent consolidation" OR "cognitive load") AND (learning) AND {CRIANCA})',
        "crossref": "educational neuroscience learning memory executive functions children",
        "chaves": ["neuroci", "neuroscien", "neuroeduc", "aprendizag", "aprendizaj", "memória", "memoria", "funções executivas", "funciones ejecutivas", "spacing", "spaced", "retrieval practice", "testing effect", "executive function", "working memory", "consolidation", "cognitive load", "memory", "attention"],
    },
    "motivacao_recompensa": {
        "nome": "Motivação, recompensa, dopamina e engajamento",
        "pubmed": f'((curiosity OR reward OR dopamine OR "intrinsic motivation" OR motivation OR gamification OR "game-based learning" OR "growth mindset" OR feedback) AND (learning) AND {CRIANCA})',
        "crossref": "motivation reward curiosity gamification learning children",
        "chaves": ["curiosity", "reward", "dopamin", "motivat", "gamif", "game-based", "mindset", "feedback", "engagement"],
    },
    "fala_fonologia": {
        "nome": "Fala, fonologia, articulação e percepção da fala",
        "pubmed": f'(("speech sound disorder" OR "speech sound disorders" OR "phonological development" OR "phonological disorder" OR "phonological acquisition" OR articulation OR "speech perception" OR "audiovisual speech" OR "childhood apraxia of speech") AND {CRIANCA})',
        "crossref": "phonological development speech sound disorder children articulation",
        "chaves": ["speech", "phonolog", "articulat", "apraxia", "fonol", "fala", "habla"],
    },
    "tecnologia_jogos": {
        "nome": "Tecnologia, jogos digitais e reconhecimento de fala para alfabetização",
        "pubmed": '(("serious game" OR "serious games" OR "educational game" OR "digital game" OR "video game" OR tablet OR "mobile app" OR "computer-assisted" OR "computer assisted" OR "speech recognition" OR GraphoGame OR "intelligent tutoring") AND (reading OR literacy OR phonological OR phonics OR dyslexia))',
        "crossref": "digital game app tablet reading literacy children intervention",
        "chaves": ["game", "tablet", "app", "computer", "digital", "speech recognition", "graphogame", "tutor", "technolog", "software"],
        "chaves_extra": ["reading", "literacy", "phonolog", "phonic", "dyslex", "letter"],
    },
    "neurodivergencia": {
        "nome": "Neurodivergência (TEA, TDAH, Down, TDL) e leitura",
        "pubmed": '((autism OR autistic OR ASD OR ADHD OR "attention deficit" OR "Down syndrome" OR "developmental language disorder" OR "specific language impairment" OR hyperlexia) AND (reading OR literacy OR phonological OR "word recognition"))',
        "crossref": "autism ADHD Down syndrome reading literacy intervention children",
        "chaves": ["autis", "asd", "adhd", "attention deficit", "down syndrome", "language disorder", "language impairment", "hyperlex"],
        "chaves_extra": ["reading", "literacy", "phonolog", "word recognition", "letter"],
    },
}

CONSULTAS_LOCAIS = {
    "pt": {"metodo_fonico": "consciência fonológica alfabetização leitura escrita crianças",
           "dislexia": "dislexia leitura crianças intervenção",
           "fala_fonologia": "desvio fonológico aquisição fonológica crianças fala",
           "neuro_aprendizagem": "neurociência aprendizagem crianças memória funções executivas"},
    "es": {"metodo_fonico": "conciencia fonológica lectura escritura niños alfabetización",
           "dislexia": "dislexia lectura niños intervención",
           "fala_fonologia": "desarrollo fonológico niños habla trastorno",
           "neuro_aprendizagem": "neurociencia aprendizaje niños memoria funciones ejecutivas"},
}
LINGUA_PAIS = {"BR": "pt", "PT": "pt", "MZ": "pt", "AO": "pt", "ES": "es", "MX": "es", "AR": "es",
               "CL": "es", "CO": "es", "UY": "es", "PE": "es"}

# ---------------------------------------------------------------- países
# código: (nome PT, termos PubMed [ad], padrões de validação na afiliação)
PAISES = {
    "BR": ("Brasil", ["Brazil", "Brasil"], ["brazil", "brasil"]),
    "PT": ("Portugal", ["Portugal"], ["portugal"]),
    "US": ("Estados Unidos", ["USA", "United States"], ["usa", "united states", "u.s.a"]),
    "GB": ("Reino Unido", ["UK", "United Kingdom", "England", "Scotland", "Wales"], ["uk", "united kingdom", "england", "scotland", "wales", "northern ireland"]),
    "IE": ("Irlanda", ["Ireland"], ["ireland"]),
    "CA": ("Canadá", ["Canada"], ["canada"]),
    "AU": ("Austrália", ["Australia"], ["australia"]),
    "NZ": ("Nova Zelândia", ["New Zealand"], ["new zealand"]),
    "FR": ("França", ["France"], ["france"]),
    "BE": ("Bélgica", ["Belgium"], ["belgium", "belgique", "belgië"]),
    "CH": ("Suíça", ["Switzerland"], ["switzerland", "suisse", "schweiz"]),
    "DE": ("Alemanha", ["Germany"], ["germany", "deutschland"]),
    "AT": ("Áustria", ["Austria"], ["austria", "österreich"]),
    "NL": ("Países Baixos", ["Netherlands"], ["netherlands", "the netherlands", "nederland"]),
    "IT": ("Itália", ["Italy"], ["italy", "italia"]),
    "ES": ("Espanha", ["Spain"], ["spain", "españa"]),
    "FI": ("Finlândia", ["Finland"], ["finland", "suomi"]),
    "SE": ("Suécia", ["Sweden"], ["sweden"]),
    "NO": ("Noruega", ["Norway"], ["norway"]),
    "DK": ("Dinamarca", ["Denmark"], ["denmark"]),
    "IS": ("Islândia", ["Iceland"], ["iceland"]),
    "GR": ("Grécia", ["Greece"], ["greece"]),
    "PL": ("Polônia", ["Poland"], ["poland"]),
    "CZ": ("Tchéquia", ["Czech Republic", "Czechia"], ["czech"]),
    "HU": ("Hungria", ["Hungary"], ["hungary"]),
    "RO": ("Romênia", ["Romania"], ["romania"]),
    "RU": ("Rússia", ["Russia", "Russian Federation"], ["russia"]),
    "TR": ("Turquia", ["Turkey", "Türkiye"], ["turkey", "türkiye", "turkiye"]),
    "IL": ("Israel", ["Israel"], ["israel"]),
    "SA": ("Arábia Saudita", ["Saudi Arabia"], ["saudi arabia"]),
    "IR": ("Irã", ["Iran"], ["iran"]),
    "IN": ("Índia", ["India"], ["india"]),
    "CN": ("China", ["China"], ["china", "p.r.c"]),
    "HK": ("Hong Kong", ["Hong Kong"], ["hong kong"]),
    "TW": ("Taiwan", ["Taiwan"], ["taiwan"]),
    "JP": ("Japão", ["Japan"], ["japan"]),
    "KR": ("Coreia do Sul", ["Korea"], ["korea"]),
    "SG": ("Singapura", ["Singapore"], ["singapore"]),
    "MY": ("Malásia", ["Malaysia"], ["malaysia"]),
    "ID": ("Indonésia", ["Indonesia"], ["indonesia"]),
    "PH": ("Filipinas", ["Philippines"], ["philippines"]),
    "VN": ("Vietnã", ["Vietnam", "Viet Nam"], ["vietnam", "viet nam"]),
    "TH": ("Tailândia", ["Thailand"], ["thailand"]),
    "CL": ("Chile", ["Chile"], ["chile"]),
    "AR": ("Argentina", ["Argentina"], ["argentina"]),
    "MX": ("México", ["Mexico"], ["mexico", "méxico"]),
    "CO": ("Colômbia", ["Colombia"], ["colombia"]),
    "UY": ("Uruguai", ["Uruguay"], ["uruguay"]),
    "PE": ("Peru", ["Peru"], ["peru", "perú"]),
    "ZA": ("África do Sul", ["South Africa"], ["south africa"]),
    "KE": ("Quênia", ["Kenya"], ["kenya"]),
    "NG": ("Nigéria", ["Nigeria"], ["nigeria"]),
    "GH": ("Gana", ["Ghana"], ["ghana"]),
    "EG": ("Egito", ["Egypt"], ["egypt"]),
    "MZ": ("Moçambique", ["Mozambique", "Moçambique"], ["mozambique", "moçambique"]),
    "AO": ("Angola", ["Angola"], ["angola"]),
}

EXCLUIR_TIPOS = {"Retracted Publication", "Retraction of Publication", "Erratum", "Published Erratum",
                 "Comment", "Letter", "Editorial", "News", "Expression of Concern"}


def http_get(url, tentativas=5, pausa=0.4):
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                dado = r.read()
            time.sleep(pausa)
            return dado
        except Exception as e:  # rede instável / 429
            espera = 2 ** i
            print(f"  ! {type(e).__name__}: {e} — nova tentativa em {espera}s", file=sys.stderr)
            time.sleep(espera)
    return None


def norm(t):
    t = unicodedata.normalize("NFKD", (t or "").lower())
    return re.sub(r"[^a-z0-9 ]", "", "".join(c for c in t if not unicodedata.combining(c))).strip()


# ---------------------------------------------------------------- PubMed
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"


def pubmed_buscar(termo, retmax):
    q = urllib.parse.urlencode({"db": "pubmed", "term": termo, "retmax": retmax,
                                "sort": "relevance", "retmode": "json"})
    d = http_get(EUTILS + "esearch.fcgi?" + q, pausa=0.6)
    if not d:
        return 0, []
    r = json.loads(d)["esearchresult"]
    return int(r.get("count", 0)), r.get("idlist", [])


def pubmed_detalhes(pmids):
    out = []
    for i in range(0, len(pmids), 200):
        lote = pmids[i:i + 200]
        d = http_get(EUTILS + "efetch.fcgi?" + urllib.parse.urlencode(
            {"db": "pubmed", "id": ",".join(lote), "retmode": "xml"}), pausa=0.7)
        if not d:
            continue
        raiz = ET.fromstring(d)
        for art in raiz.findall(".//PubmedArticle"):
            mc = art.find("MedlineCitation")
            a = mc.find("Article")
            titulo = "".join(a.find("ArticleTitle").itertext()) if a.find("ArticleTitle") is not None else ""
            resumo = " ".join("".join(x.itertext()) for x in a.findall(".//AbstractText"))
            ano = (a.findtext(".//JournalIssue/PubDate/Year") or
                   (a.findtext(".//JournalIssue/PubDate/MedlineDate") or "")[:4])
            autores, afils = [], []
            for au in a.findall(".//Author"):
                nome = " ".join(filter(None, [au.findtext("ForeName"), au.findtext("LastName")])) or au.findtext("CollectiveName") or ""
                if nome:
                    autores.append(nome)
                afils += [x.text or "" for x in au.findall(".//AffiliationInfo/Affiliation")]
            doi = ""
            for eid in art.findall(".//ArticleIdList/ArticleId"):
                if eid.get("IdType") == "doi":
                    doi = (eid.text or "").lower()
            tipos = [t.text for t in a.findall(".//PublicationTypeList/PublicationType")]
            out.append({
                "fonte_base": "PubMed", "pmid": mc.findtext("PMID"), "doi": doi,
                "titulo": titulo.strip(), "resumo": resumo.strip(), "ano": ano,
                "periodico": a.findtext(".//Journal/Title") or "",
                "autores": autores, "afiliacoes": afils, "tipos": tipos,
                "idioma": a.findtext("Language") or "",
            })
    return out


# ---------------------------------------------------------------- Crossref
def crossref_buscar(consulta, pais_nome_en, rows):
    q = urllib.parse.urlencode({
        "query.bibliographic": consulta, "query.affiliation": pais_nome_en,
        "rows": rows, "filter": "type:journal-article,from-pub-date:1990",
        "select": "DOI,title,author,issued,container-title,abstract,type,is-referenced-by-count,update-to",
    })
    d = http_get("https://api.crossref.org/works?" + q, pausa=0.2)
    if not d:
        return []
    out = []
    for it in json.loads(d)["message"]["items"]:
        afils, autores = [], []
        for au in it.get("author", []) or []:
            autores.append(" ".join(filter(None, [au.get("given"), au.get("family")])))
            afils += [x.get("name", "") for x in au.get("affiliation", [])]
        ano = ""
        try:
            ano = str(it["issued"]["date-parts"][0][0])
        except Exception:
            pass
        resumo = re.sub(r"<[^>]+>", " ", it.get("abstract", "") or "")
        out.append({
            "fonte_base": "Crossref", "pmid": "", "doi": (it.get("DOI") or "").lower(),
            "titulo": " ".join(it.get("title") or []).strip(), "resumo": resumo.strip(), "ano": ano,
            "periodico": " ".join(it.get("container-title") or []),
            "autores": autores, "afiliacoes": afils, "tipos": [it.get("type", "")],
            "citacoes": it.get("is-referenced-by-count", 0),
            "retratado": bool(it.get("update-to")),
        })
    return out


# ---------------------------------------------------------------- validação
def nivel_evidencia(r):
    tipos = " ".join(r.get("tipos", [])).lower()
    t = (r["titulo"] + " " + r["resumo"][:600]).lower()
    if "meta-analysis" in tipos or "systematic review" in tipos or "meta-analy" in t or "systematic review" in t:
        return "A"
    if "randomized controlled trial" in tipos or "clinical trial" in tipos or "randomi" in t:
        return "B"
    if "review" in tipos or re.search(r"\breview\b", r["titulo"].lower()):
        return "C"
    return "D"


def relevancia(r, eixo):
    e = EIXOS[eixo]
    tit, res = r["titulo"].lower(), r["resumo"].lower()
    h_tit = sum(1 for k in e["chaves"] if k in tit)
    h_res = sum(1 for k in e["chaves"] if k in res)
    ok = h_tit >= 1 or h_res >= 2
    if ok and "chaves_extra" in e:
        ok = any(k in tit or k in res for k in e["chaves_extra"])
    return ok, h_tit * 3 + h_res


def pais_confirmado(r, cod):
    pads = PAISES[cod][2]
    texto = " | ".join(r.get("afiliacoes", [])).lower()
    return any(re.search(r"(^|[^a-z])" + re.escape(p) + r"([^a-z]|$)", texto) for p in pads)


def validar(r, eixo, cod):
    if not r["titulo"]:
        return False, "sem título"
    if set(r.get("tipos", [])) & EXCLUIR_TIPOS or r.get("retratado"):
        return False, "tipo excluído/retratado"
    if not pais_confirmado(r, cod):
        return False, "país não confirmado na afiliação"
    ok, score = relevancia(r, eixo)
    if not ok:
        return False, "fora do tema"
    r["relevancia"] = score
    r["evidencia"] = nivel_evidencia(r)
    return True, ""


def chave(r):
    return r["doi"] or ("pmid:" + r["pmid"] if r["pmid"] else "t:" + norm(r["titulo"])[:120])


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-por-pais", type=int, default=500)
    ap.add_argument("--pubmed-por-eixo", type=int, default=600)
    ap.add_argument("--crossref-por-eixo", type=int, default=200)
    ap.add_argument("--paises", default="")
    a = ap.parse_args()
    os.makedirs(os.path.join(DATA, "raw"), exist_ok=True)
    paises = a.paises.split(",") if a.paises else list(PAISES)
    contagens = {}

    for cod in paises:
        nome_pt, termos_ad, _ = PAISES[cod]
        raw_path = os.path.join(DATA, "raw", f"{cod}.jsonl")
        if os.path.exists(raw_path):
            print(f"[{cod}] já coletado, pulando coleta")
            continue
        filtro_ad = "(" + " OR ".join(f'"{t}"[ad]' for t in termos_ad) + ")"
        registros = []
        contagens[cod] = {}
        for eixo, e in EIXOS.items():
            total, ids = pubmed_buscar(f"{e['pubmed']} AND {filtro_ad}", a.pubmed_por_eixo)
            det = pubmed_detalhes(ids) if ids else []
            pais_en = termos_ad[-1] if cod != "US" else "United States"
            cr = crossref_buscar(e["crossref"], pais_en, a.crossref_por_eixo)
            lingua = LINGUA_PAIS.get(cod)
            if lingua and eixo in CONSULTAS_LOCAIS[lingua]:
                cr += crossref_buscar(CONSULTAS_LOCAIS[lingua][eixo], pais_en, a.crossref_por_eixo)
            contagens[cod][eixo] = {"pubmed_total": total, "pubmed_baixados": len(det), "crossref": len(cr)}
            for r in det + cr:
                r["eixo"], r["pais"] = eixo, cod
                registros.append(r)
            print(f"[{cod}] {eixo}: PubMed {total} (baixados {len(det)}), Crossref {len(cr)}", flush=True)
        with open(raw_path, "w") as f:
            for r in registros:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
    json.dump(contagens, open(os.path.join(DATA, "contagens_brutas.json"), "w"), ensure_ascii=False, indent=1)

    # -------- etapa 2: validação e filtro
    aprovados, rejeitados, stats = [], {}, {}
    for cod in PAISES:
        p = os.path.join(DATA, "raw", f"{cod}.jsonl")
        if not os.path.exists(p):
            continue
        vistos, bons, rej = {}, [], {}
        for linha in open(p):
            r = json.loads(linha)
            ok, motivo = validar(r, r["eixo"], cod)
            if not ok:
                rej[motivo] = rej.get(motivo, 0) + 1
                continue
            k = chave(r)
            if k in vistos:  # mesmo trabalho em outro eixo: acumula eixos
                b = vistos[k]
                if r["eixo"] not in b["eixos"]:
                    b["eixos"].append(r["eixo"])
                b["relevancia"] = max(b["relevancia"], r["relevancia"])
                if r["fonte_base"] not in b["bases"]:
                    b["bases"].append(r["fonte_base"])
                    b["pmid"] = b["pmid"] or r["pmid"]
                continue
            r["eixos"], r["bases"] = [r.pop("eixo")], [r.pop("fonte_base")]
            vistos[k] = r
            bons.append(r)
        # ordenação: evidência > relevância > recência
        ordem = {"A": 0, "B": 1, "C": 2, "D": 3}
        bons.sort(key=lambda r: (ordem[r["evidencia"]], -r["relevancia"], -(int(r["ano"]) if str(r["ano"]).isdigit() else 0)))
        # garante diversidade: primeiro os 40 melhores de cada eixo, depois completa
        escolhidos, ids = [], set()
        for eixo in EIXOS:
            for r in [x for x in bons if eixo in x["eixos"]][:40]:
                if id(r) not in ids:
                    escolhidos.append(r); ids.add(id(r))
        for r in bons:
            if len(escolhidos) >= a.max_por_pais:
                break
            if id(r) not in ids:
                escolhidos.append(r); ids.add(id(r))
        escolhidos = escolhidos[:a.max_por_pais]
        escolhidos.sort(key=lambda r: (ordem[r["evidencia"]], -r["relevancia"]))
        aprovados += escolhidos
        rejeitados[cod] = rej
        stats[cod] = {"validos_unicos": len(bons), "selecionados": len(escolhidos),
                      "rejeitados": sum(rej.values())}
        print(f"[{cod}] válidos únicos {len(bons)} → selecionados {len(escolhidos)}; rejeitados {rej}")

    with open(os.path.join(DATA, "validado.jsonl"), "w") as f:
        for r in aprovados:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    json.dump({"stats": stats, "rejeitados": rejeitados}, open(os.path.join(DATA, "validacao_stats.json"), "w"), ensure_ascii=False, indent=1)
    print("TOTAL selecionados:", len(aprovados))


if __name__ == "__main__":
    main()
