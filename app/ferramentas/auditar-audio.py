#!/usr/bin/env python3
"""Auditoria dos clipes de voz (D027 §2: "nenhum áudio vai ao ar sem auditoria").

Audita TODOS os clipes citados nos manifestos (web/public/audio/falas e /nomes):
  a) SINAL (ffmpeg → PCM): duração, silêncio inicial/final, começo/fim "seco" (energia alta nos
     primeiros/últimos 25 ms = fala cortada), clipe curto demais para o texto (< 55 ms por caractere
     falado), clipping e volume fora da média.
     Na FONTE bruta do TTS (audio-fontes/): fim CORTADO (o arquivo acaba em plena fala, sem a queda natural da voz) — a masterização disfarça o estalo, mas a sílaba continua faltando.
  b) CONTEÚDO: transcreve a fonte de cada clipe (Google Gemini; segunda opinião do ElevenLabs Scribe onde
     falta transcrição ou ela não bate) e compara com o texto enviado ao TTS
     (scripts/gerar-vozes.ts --textos). Marca: começo faltando, fim faltando, sílaba faltando,
     palavra trocada, nome errado.
Saída: docs/auditoria-audio.md (relatório) e docs/auditoria-audio.json (dados por clipe).
Cache das transcrições (por conteúdo do arquivo): docs/auditoria-audio-cache.json.

Uso (a partir de app/):
  python3 ferramentas/auditar-audio.py                 # auditoria completa
  python3 ferramentas/auditar-audio.py --sem-transcricao   # só o sinal (sem rede)
  python3 ferramentas/auditar-audio.py --fontes --rotulo antes   # audita os clipes BRUTOS (como iam ao ar antes da masterização)
  python3 ferramentas/auditar-audio.py --estrito       # sai com código 1 se houver clipe GRAVE (para CI)
A chave do Gemini vem de GEMINI_API_KEY (neste ambiente o proxy injeta; o valor padrão é um marcador).
"""
import argparse, base64, concurrent.futures as cf, difflib, hashlib, json, os, re, subprocess, sys, time, unicodedata, urllib.request
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RAIZ, 'web/public/audio')
FONTES = os.path.join(RAIZ, 'audio-fontes')   # clipes brutos do TTS (ferramentas/masterizar-audio.py gera os de public/)
DOCS = os.path.join(RAIZ, 'docs')
CACHE = os.path.join(DOCS, 'auditoria-audio-cache.json')          # transcrições do Gemini (por conteúdo do arquivo-fonte)
CACHE2 = os.path.join(DOCS, 'auditoria-audio-cache-scribe.json')  # segunda opinião: ElevenLabs Scribe
SR = 44100
MODELO = os.environ.get('GEMINI_MODELO', 'gemini-3.5-flash')
PROMPT = 'Transcreva exatamente o que é dito em português do Brasil. Responda só com a transcrição.'

# limites
MS_POR_CARACTERE = 55      # abaixo disso o clipe é curto demais para o texto
SECO_DB = -30.0            # RMS (dBFS) dos 25 ms das pontas acima disso = começo/fim seco
JANELA_PONTA_MS = 25
LIMIAR_SILENCIO_DB = -45.0
DESVIO_VOLUME_DB = 4.0     # distância da mediana (volume da parte falada)
ALVO_LUFS = -16.0


def db(x):
    return 20 * np.log10(max(float(x), 1e-9))


def decodificar(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def lufs(arq):
    """Loudness integrada (EBU R128) pelo ffmpeg; None para clipes curtos demais (< 0,4 s de fala)."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', arq, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True)
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)
    v = float(m[-1]) if m else None
    return None if v is None or v <= -69 else v


def medir(arq, texto_falado):
    x = decodificar(arq)
    n = len(x)
    dur = n / SR
    passo = int(SR * 0.005)
    quadros = max(1, n // passo)
    env = np.array([np.sqrt(np.mean(x[i * passo:(i + 1) * passo] ** 2) + 1e-12) for i in range(quadros)])
    env_db = 20 * np.log10(env + 1e-9)
    ativos = np.where(env_db > LIMIAR_SILENCIO_DB)[0]
    if len(ativos) == 0:
        return {'dur': round(dur, 3), 'mudo': True, 'problemas': ['mudo']}
    ini = ativos[0] * passo / SR
    fim = dur - (ativos[-1] + 1) * passo / SR
    fala = x[ativos[0] * passo:(ativos[-1] + 1) * passo]
    env_fala = env[ativos[0]:ativos[-1] + 1]
    # volume da parte falada: RMS dos quadros acima de -40 dBFS
    q = env_fala[env_fala > 10 ** (-40 / 20)]
    rms_fala = db(np.sqrt(np.mean(q ** 2))) if len(q) else db(np.sqrt(np.mean(fala ** 2)))
    w = int(SR * JANELA_PONTA_MS / 1000)
    ponta_ini = db(np.sqrt(np.mean(x[:w] ** 2)))
    ponta_fim = db(np.sqrt(np.mean(x[-w:] ** 2)))
    pico = db(np.max(np.abs(x)))
    estourados = int(np.sum(np.abs(x) >= 0.999))
    topo = np.abs(x) >= 0.985 * np.max(np.abs(x))
    achatados = int(np.sum(topo[:-3] & topo[1:-2] & topo[2:-1] & topo[3:]))  # 4 amostras seguidas no topo = onda achatada
    letras = len(re.sub(r'[^\w]', '', texto_falado, flags=re.UNICODE))
    dur_fala = dur - ini - max(fim, 0)
    ms_car = 1000 * dur_fala / max(letras, 1)
    m = {
        'dur': round(dur, 3), 'silencio_ini_ms': round(ini * 1000), 'silencio_fim_ms': round(max(fim, 0) * 1000),
        'ponta_ini_db': round(ponta_ini, 1), 'ponta_fim_db': round(ponta_fim, 1), 'pico_db': round(pico, 1),
        'rms_fala_db': round(rms_fala, 1), 'lufs': lufs(arq), 'ms_por_caractere': round(ms_car), 'estourados': estourados, 'achatados': achatados,
    }
    p = []
    if ponta_ini > SECO_DB: p.append('começo seco')
    if ponta_fim > SECO_DB: p.append('fim seco')
    if ini * 1000 < 15 and 'começo seco' not in p: p.append('sem respiro no começo')
    if fim * 1000 < 15 and 'fim seco' not in p: p.append('sem respiro no fim')
    if letras >= 2 and ms_car < MS_POR_CARACTERE: p.append('curto demais')
    if estourados >= 8 or achatados >= 6: p.append('clipping')
    # corte na gravação: o arquivo acaba em plena fala (sem queda da voz) ou já começa em plena fala
    forte = np.where(env > 10 ** ((rms_fala - 10) / 20))[0]
    m['queda_fim_ms'] = int((ativos[-1] - forte[-1]) * 5) if len(forte) else 0
    m['subida_ini_ms'] = int((forte[0] - ativos[0]) * 5 + ini * 1000) if len(forte) else 0
    m['problemas'] = p
    return m


def cortes_na_fonte(m):
    """Problemas de corte medidos no arquivo BRUTO (não somem com fade/silêncio)."""
    p = []
    if m.get('mudo'):
        return ['mudo']
    if m['queda_fim_ms'] <= 5 and m['silencio_fim_ms'] <= 10: p.append('fim cortado na gravação')
    return p


# ---------- conteúdo ----------
def sem_acento(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def normalizar(s):
    s = sem_acento(s.lower())
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = re.sub(r'([a-z])\1{2,}', r'\1', s)  # sons esticados: "aaaaa" → "a"
    return s.split()


def fonetico(w):
    """Chave fonética simples: tira diferenças só de grafia (Sophia/Sofia, Luísa/Luiza, Thiago/Tiago…)."""
    w = sem_acento(w.lower())
    w = re.sub(r'[^a-z]', '', w)
    for a, b in (('ph', 'f'), ('th', 't'), ('ch', 'x'), ('sh', 'x'), ('lh', 'li'), ('nh', 'ni'), ('qu', 'k'), ('ck', 'k'), ('ss', 's'), ('ç', 's'),
                 ('y', 'i'), ('w', 'u'), ('z', 's'), ('c', 'k'), ('q', 'k'), ('h', ''), ('ou', 'o'), ('ei', 'e'), ('ll', 'l'), ('nn', 'n'), ('tt', 't'), ('rr', 'r')):
        w = w.replace(a, b)
    w = re.sub(r'(.)\1+', r'\1', w)
    w = re.sub(r'm$', 'n', w)
    return w


NUMEROS = {'1': 'um', '2': 'dois', '3': 'tres', '4': 'quatro', '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove', '10': 'dez'}


# nome da letra dito por extenso ("gê", "quê", "ípsilon", "dáblio", "agá") = a letra (o transcritor escreve "G", "Q", "Y", "W", "H")
NOME_DE_LETRA = {'ge': 'g', 'ke': 'k', 'ipsilon': 'i', 'dablio': 'u', 'aga': '', 'xis': 'x', 'jota': 'j'}


def chaves(texto):
    ks = [fonetico(NUMEROS.get(w, w)) for w in normalizar(texto)]
    ks = [NOME_DE_LETRA.get(k, k) if (i == 0 or ks[i - 1] == 'letra') else k for i, k in enumerate(ks)]
    return [k for k in ks if k]


def comparar(esperado, ouvido, eh_nome=False):
    """Devolve (distância 0–1, lista de problemas)."""
    e, o = chaves(esperado), chaves(ouvido)
    if not e:
        return 0.0, []
    if not o:
        return 1.0, ['transcrição vazia']
    je, jo = ' '.join(e), ' '.join(o)
    dist = 1 - difflib.SequenceMatcher(None, je, jo).ratio()
    if je == jo or je.replace(' ', '') == jo.replace(' ', ''):
        return 0.0, []
    p = []
    sm = difflib.SequenceMatcher(None, e, o)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            continue
        fe, fo = ' '.join(e[i1:i2]), ' '.join(o[j1:j2])
        ce, co = fe.replace(' ', ''), fo.replace(' ', '')
        if ce == co:
            continue
        if op == 'insert':
            p.append(f'sobrando “{fo}”')
            continue
        onde = 'começo' if i1 == 0 else 'fim' if i2 == len(e) else 'meio'
        if op == 'delete':
            p.append(f'{onde} faltando “{fe}”' if onde != 'meio' else f'palavra faltando “{fe}”')
            continue
        # replace: sílaba faltando (o ouvido é um pedaço do esperado) ou palavra trocada
        if co and len(co) < len(ce) and (ce.endswith(co) or ce.startswith(co) or co in ce):
            lado = 'no começo' if ce.endswith(co) else 'no fim' if ce.startswith(co) else 'no meio'
            p.append(f'sílaba faltando {lado} (“{fe}” → “{fo}”)')
        elif difflib.SequenceMatcher(None, ce, co).ratio() >= 0.8 and len(ce) > 4:
            continue  # variação pequena de transcrição
        else:
            p.append(('nome errado' if eh_nome else 'palavra trocada') + f' (“{fe}” → “{fo}”)')
    return round(dist, 3), p


class SemCota(Exception):
    """A API de transcrição recusou por cota/teto de gasto: não adianta insistir."""


def transcrever(arq, tentativas=4):
    d = base64.b64encode(open(arq, 'rb').read()).decode()
    corpo = {'contents': [{'parts': [{'inlineData': {'mimeType': 'audio/mpeg', 'data': d}}, {'text': PROMPT}]}], 'generationConfig': {'temperature': 0}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent'
    erro = None
    for t in range(tentativas):
        try:
            req = urllib.request.Request(url, data=json.dumps(corpo).encode(), headers={'x-goog-api-key': os.environ.get('GEMINI_API_KEY', 'placeholder'), 'content-type': 'application/json'})
            r = json.loads(urllib.request.urlopen(req, timeout=90).read())
            partes = r.get('candidates', [{}])[0].get('content', {}).get('parts', [])
            return re.sub(r'^thought\s*\n', '', ''.join(x.get('text', '') for x in partes if not x.get('thought')).strip())
        except Exception as e:  # rede/limite: tenta de novo
            erro = e
            corpo_erro = getattr(e, 'read', lambda: b'')()
            if b'spending cap' in corpo_erro or b'RESOURCE_EXHAUSTED' in corpo_erro and b'quota' in corpo_erro.lower():
                raise SemCota('o projeto do Gemini atingiu o teto de gasto/cota')
            time.sleep(2 * (t + 1))
    raise RuntimeError(f'transcrição falhou: {erro}')


def transcrever_scribe(arq, tentativas=3):
    """Segunda opinião: ElevenLabs Speech-to-Text (Scribe). Devolve (texto, início da 1ª palavra em s, fim da última em s)."""
    lim = '----fonema' + hashlib.sha1(arq.encode()).hexdigest()[:12]
    corpo = b''
    for k, v in (('model_id', 'scribe_v1'), ('language_code', 'por')):
        corpo += f'--{lim}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    corpo += f'--{lim}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode() + open(arq, 'rb').read() + f'\r\n--{lim}--\r\n'.encode()
    erro = None
    for t in range(tentativas):
        try:
            req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=corpo, headers={'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', 'proxy-injected'), 'content-type': f'multipart/form-data; boundary={lim}'})
            r = json.loads(urllib.request.urlopen(req, timeout=90).read())
            ws = [w for w in r.get('words', []) if w.get('type') == 'word']
            return [r.get('text', '').strip(), ws[0]['start'] if ws else None, ws[-1]['end'] if ws else None]
        except Exception as e:
            erro = e
            if getattr(e, 'code', 0) in (401, 402, 403):
                raise SemCota(f'ElevenLabs STT recusou ({e.code})')
            time.sleep(2 * (t + 1))
    raise RuntimeError(f'transcrição (scribe) falhou: {erro}')


def sha(arq):
    return hashlib.sha1(open(arq, 'rb').read()).hexdigest()[:16]


def listar(fontes=False):
    """[(tipo, voz, chave, arquivo no ar (relativo a PUB, ou a FONTES com --fontes), texto esperado, arquivo-fonte relativo a FONTES)]"""
    mf = json.load(open(os.path.join(FONTES, 'falas/manifesto.json')))
    mn = json.load(open(os.path.join(FONTES, 'nomes/manifesto.json')))
    man = mf if fontes else json.load(open(os.path.join(PUB, 'falas/manifesto.json')))
    r = subprocess.run(['npx', 'tsx', 'scripts/gerar-vozes.ts', '--textos'], capture_output=True, text=True, cwd=RAIZ)
    textos = json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {}
    itens = []
    for chave, arq in man.items():
        voz, k = chave.split('|', 1)
        itens.append(('fala', voz, k, f'falas/{arq}', textos.get(chave, k), f'falas/{mf[chave]}' if chave in mf else None))
    if fontes:
        for voz in ('sofia', 'tales'):
            for n, arq in mn.get(voz, {}).items():
                itens.append(('nome', voz, n, f'nomes/{voz}/{arq}', n, f'nomes/{voz}/{arq}'))
        return itens
    nomes = json.load(open(os.path.join(PUB, 'nomes/manifesto.json')))
    arquivos = nomes.get('arquivos', {})
    for voz in ('sofia', 'tales'):
        for n in nomes.get(voz, []):
            itens.append(('nome', voz, n, f'nomes/{voz}/{arquivos.get(voz, {}).get(n, n + ".mp3")}', n, f'nomes/{voz}/{mn[voz][n]}' if n in mn.get(voz, {}) else None))
    return itens


def gravidade(it):
    """grave = defeito audível provável; leve = só higiene de sinal."""
    s, c = it['sinal'].get('problemas', []), it.get('conteudo', [])
    if any(x in s for x in ('mudo', 'arquivo ausente', 'começo seco', 'fim seco', 'curto demais', 'clipping')) or it.get('fonte_problemas'):
        return 'grave'
    if c:
        # palavra, sílaba ou som solto: a transcrição automática erra muito → conferir de ouvido
        return 'grave' if len(normalizar(it['esperado'])) >= 3 else 'conferir'
    return 'leve' if s or it.get('volume_fora') else 'ok'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sem-transcricao', action='store_true')
    ap.add_argument('--rotulo', default='')
    ap.add_argument('--estrito', action='store_true')
    ap.add_argument('--paralelo', type=int, default=5)
    ap.add_argument('--motor', default='gemini,scribe', help='transcritores, em ordem: gemini e/ou scribe (ElevenLabs STT, segunda opinião)')
    ap.add_argument('--fontes', action='store_true', help='audita os clipes brutos (audio-fontes) em vez dos masterizados')
    a = ap.parse_args()
    itens = listar(a.fontes)
    base = FONTES if a.fontes else PUB
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    res = []
    for tipo, voz, chave, rel, esperado, fonte in itens:
        arq = os.path.join(base, rel)
        if not os.path.exists(arq):
            res.append({'tipo': tipo, 'voz': voz, 'chave': chave, 'arquivo': rel, 'esperado': esperado, 'sinal': {'problemas': ['arquivo ausente']}})
            continue
        r = {'tipo': tipo, 'voz': voz, 'chave': chave, 'arquivo': rel, 'esperado': esperado, 'sinal': medir(arq, esperado)}
        farq = os.path.join(FONTES, fonte) if fonte else None
        if farq and os.path.exists(farq):
            r['fonte'] = fonte
            r['sha'] = sha(farq)   # a transcrição é da fonte: a masterização não muda o que é dito
            r['fonte_problemas'] = cortes_na_fonte(r['sinal'] if a.fontes else medir(farq, esperado))
        res.append(r)
    # volume: distância da mediana por voz
    for voz in ('sofia', 'tales'):
        vs = [r['sinal']['rms_fala_db'] for r in res if r['voz'] == voz and 'rms_fala_db' in r['sinal']]
        med = float(np.median(vs)) if vs else 0
        for r in res:
            if r['voz'] == voz and 'rms_fala_db' in r['sinal']:
                r['sinal']['desvio_volume_db'] = round(r['sinal']['rms_fala_db'] - med, 1)
                if abs(r['sinal']['desvio_volume_db']) > DESVIO_VOLUME_DB:
                    r['volume_fora'] = True
    if not a.sem_transcricao:
        cache2 = json.load(open(CACHE2)) if os.path.exists(CACHE2) else {}

        def lote(falta, fn, destino, arq_cache, nome):
            if not falta:
                return
            print(f'{nome}: a transcrever {len(falta)} clipes', flush=True)
            parar = []

            def um(r):
                if parar:
                    raise SemCota('interrompido')
                return r['sha'], fn(os.path.join(FONTES, r['fonte']))
            with cf.ThreadPoolExecutor(a.paralelo) as ex:
                for i, f in enumerate(cf.as_completed([ex.submit(um, r) for r in falta])):
                    try:
                        k, t = f.result()
                        destino[k] = t
                    except SemCota as e:
                        if not parar:
                            print(f'  {nome}: interrompido ({e}).', flush=True)
                        parar.append(1)
                    except Exception as e:
                        print('  erro:', e, flush=True)
                    if (i + 1) % 50 == 0:
                        print(f'  {i + 1}/{len(falta)}', flush=True)
                        json.dump(destino, open(arq_cache, 'w'), ensure_ascii=False, indent=0, sort_keys=True)
            json.dump(destino, open(arq_cache, 'w'), ensure_ascii=False, indent=0, sort_keys=True)

        def avaliar(r):
            """Compara com as transcrições disponíveis; basta UMA bater com o texto para o conteúdo valer."""
            r.pop('ouvido', None); r.pop('conteudo', None)
            ops = []
            if r.get('sha') in cache:
                ops.append(('gemini', re.sub(r'^thought\s*\n', '', cache[r['sha']])))
            if r.get('sha') in cache2:
                ops.append(('scribe', cache2[r['sha']][0]))
            if not ops:
                return False
            av = [(m, t) + comparar(r['esperado'], t, r['tipo'] == 'nome') for m, t in ops]
            melhor = min(av, key=lambda x: (len(x[3]), x[2]))
            r['ouvido'] = ' / '.join(f'{t}' for _, t in ops) if melhor[3] and len(ops) > 1 else melhor[1]
            r['transcritores'] = [m for m, _ in ops]
            r['distancia'], r['conteudo'] = melhor[2], melhor[3]
            return not melhor[3]

        motores = a.motor.split(',')
        if 'gemini' in motores:
            lote([r for r in res if 'sha' in r and r['sha'] not in cache], transcrever, cache, CACHE, 'Gemini')
        if 'scribe' in motores:
            # segunda opinião só onde falta transcrição ou a primeira não bateu com o texto
            lote([r for r in res if 'sha' in r and r['sha'] not in cache2 and not avaliar(r)], transcrever_scribe, cache2, CACHE2, 'Scribe')
        for r in res:
            avaliar(r)
    for r in res:
        r['gravidade'] = gravidade(r)
    sufixo = f'-{a.rotulo}' if a.rotulo else ''
    json.dump(res, open(os.path.join(DOCS, f'auditoria-audio{sufixo}.json'), 'w'), ensure_ascii=False, indent=1)
    relatorio(res, a, sufixo)
    graves = sum(r['gravidade'] == 'grave' for r in res)
    print(f'{len(res)} clipes · graves: {graves} · a conferir de ouvido: {sum(r["gravidade"] == "conferir" for r in res)} · leves: {sum(r["gravidade"] == "leve" for r in res)} · ok: {sum(r["gravidade"] == "ok" for r in res)}')
    if a.estrito and graves:
        sys.exit(1)


def contar(res):
    c = {}
    for r in res:
        for p in r['sinal'].get('problemas', []):
            c[p] = c.get(p, 0) + 1
        if r.get('volume_fora'): c['volume fora da média'] = c.get('volume fora da média', 0) + 1
        for p in r.get('fonte_problemas', []):
            if p != 'mudo': c[p] = c.get(p, 0) + 1
        for p in r.get('conteudo', []):
            k = re.sub(r'\s*[(“].*', '', p)
            c['conteúdo: ' + k] = c.get('conteúdo: ' + k, 0) + 1
    return c


def relatorio(res, a, sufixo):
    antes_arq = os.path.join(DOCS, 'auditoria-audio-antes.json')
    antes = json.load(open(antes_arq)) if os.path.exists(antes_arq) and a.rotulo != 'antes' else None
    L = ['# Auditoria dos clipes de voz', '',
         f'Gerado por `ferramentas/auditar-audio.py`{" (só sinal)" if a.sem_transcricao else ""}. Regra (D027 §2): **nenhum áudio vai ao ar sem esta auditoria**.', '',
         f'- Clipes auditados: **{len(res)}** ({sum(r["tipo"] == "fala" for r in res)} falas + {sum(r["tipo"] == "nome" for r in res)} nomes; vozes Sofia e Tales)',
         f'- Graves (defeito audível provável): **{sum(r["gravidade"] == "grave" for r in res)}** · a conferir de ouvido (palavra/som solto com transcrição diferente): **{sum(r["gravidade"] == "conferir" for r in res)}** · leves (higiene do sinal): **{sum(r["gravidade"] == "leve" for r in res)}** · sem defeito: **{sum(r["gravidade"] == "ok" for r in res)}**']
    if not a.sem_transcricao:
        st = sum('ouvido' not in r for r in res)
        L.append(f'- Conteúdo conferido por transcrição: **{len(res) - st}** clipes · **sem transcrição: {st}** (só o sinal foi conferido nesses)')
    ls = [r['sinal']['lufs'] for r in res if r['sinal'].get('lufs') is not None]
    if ls:
        L.append(f'- Volume (clipes ≥ 0,4 s): mediana {np.median(ls):.1f} LUFS, de {min(ls):.1f} a {max(ls):.1f} (alvo {ALVO_LUFS:.0f})')
    L += ['', '## Defeitos por tipo', '', '| Tipo | Antes | Agora |' if antes else '| Tipo | Clipes |', '|---|---|---|' if antes else '|---|---|']
    c, ca = contar(res), contar(antes) if antes else {}
    for k in sorted(set(c) | set(ca), key=lambda k: -(c.get(k, 0) + ca.get(k, 0))):
        L.append(f'| {k} | {ca.get(k, 0)} | {c.get(k, 0)} |' if antes else f'| {k} | {c[k]} |')
    if antes:
        L += ['', f'Antes: {sum(r["gravidade"] == "grave" for r in antes)} graves, {sum(r["gravidade"] == "conferir" for r in antes)} a conferir e {sum(r["gravidade"] == "leve" for r in antes)} leves em {len(antes)} clipes '
              f'({sum("ouvido" in r for r in antes)} com transcrição).']
    L += ['', 'Critérios: começo/fim seco = RMS dos 25 ms das pontas acima de −30 dBFS; curto demais = menos de 55 ms por caractere falado; '
          'volume fora = mais de 4 dB da mediana da voz; clipping = 8+ amostras no teto ou onda achatada; '
          'fim cortado na gravação = o arquivo bruto do TTS acaba em plena fala (sem a queda da voz); conteúdo = transcrição automática (Gemini e, como segunda opinião, ElevenLabs Scribe; basta uma bater) comparada ao texto enviado ao TTS, '
          'por chave fonética (ignora caixa, pontuação e grafia). Sílabas e sons soltos têm transcrição pouco confiável: conferir de ouvido.', '',
          '## Clipes graves', '', '| Voz | Texto esperado | Ouvido | Problemas | Arquivo |', '|---|---|---|---|---|']
    for r in sorted((r for r in res if r['gravidade'] == 'grave'), key=lambda r: (r['tipo'], r['voz'], r['esperado'])):
        ps = r['sinal'].get('problemas', []) + [p for p in r.get('fonte_problemas', []) if p != 'mudo'] + r.get('conteudo', []) + (['volume fora da média'] if r.get('volume_fora') else [])
        L.append(f"| {r['voz']} | {r['esperado'][:70]} | {(r.get('ouvido') or '—')[:70]} | {'; '.join(ps)} | `{r['arquivo']}` |")
    L += ['', '## A conferir de ouvido (palavras, sílabas e sons soltos)', '', '| Voz | Texto esperado | Ouvido | Arquivo |', '|---|---|---|---|']
    for r in sorted((r for r in res if r['gravidade'] == 'conferir'), key=lambda r: (r['voz'], r['esperado'])):
        L.append(f"| {r['voz']} | {r['esperado'][:50]} | {(r.get('ouvido') or '—')[:50]} | `{r['arquivo']}` |")
    if not a.sem_transcricao:
        st = [r for r in res if 'ouvido' not in r]
        L += ['', f'## Sem transcrição ({len(st)})', '', 'Clipes cujo conteúdo ainda NÃO foi conferido por transcrição (rodar a auditoria de novo quando houver cota):', '']
        L.append(', '.join(f"`{r['voz']}|{r['chave'][:40]}`" for r in st) or '—')
    open(os.path.join(DOCS, f'auditoria-audio{sufixo}.md'), 'w').write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
