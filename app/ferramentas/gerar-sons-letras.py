#!/usr/bin/env python3
"""SOM REAL DAS LETRAS (D029 §2): recorta, mede e publica o fonema puro de cada letra. Não gasta créditos.

  app/audio-fontes/sons/<fonema>.mp3 + fontes.json   (bruto do TTS: voz adulta de professora, ElevenLabs v3;
        texto sustentado "Mmmmmmmm." ou sílaba/palavra com a consoante esticada "Zzzzzzzzá.", "Nnnnnnnnavio.")
        ↓ 1. acha só o trecho do SOM (sem a vogal que vem depois), quadro a quadro: voz na banda grave,
        ↓    energia por faixa, centro do chiado
        ↓ 2. contínuos: alonga o miolo estável (laço com emenda alinhada) até ~1,1 s; explosivos: estouro +
        ↓    resto mínimo de vogal (≤ 70 ms, em fade), como a professora faz "p… p… p"
        ↓ 3. fade, silêncio nas pontas, volume
        ↓ 4. VERIFICAÇÃO OBJETIVA do clipe pronto (critérios por tipo de som, abaixo) → aprovado / duvidoso / reprovado
  app/web/public/audio/sons/<fonema>.mp3 + mapa.json   (só aprovados e duvidosos; reprovado NÃO vai ao ar)
  app/docs/auditoria-sons-letras.md                   (tabela por fonema, com as medidas e o motivo)

Critérios (pesquisa 45: contínuos sustentados; explosivos curtos, quase sem vogal, surdos sem voz):
  vogais         voz em > 85 % do clipe; F1/F2 (LPC) na faixa da vogal; 0,7–2,2 s
  m n l          voz > 90 %; energia concentrada abaixo de 500 Hz; quase nada acima de 2 kHz; sem trecho de vogal
  v              como os de cima + ruído de fricção em parte do clipe (senão: duvidoso)
  s x f          SEM barra de voz; chiado: s acima de 6,5 kHz; x entre 3,3 e 5,6 kHz; f espalhado (grave e agudo)
  z j            COM barra de voz + chiado (z acima de 6,5 kHz; j entre 3,8 e 6,6 kHz)
  explosivos     80–280 ms; surdos (p t k) sem voz antes do estouro; sonoros (b d g) com voz antes do estouro;
                 resto de vogal ≤ 90 ms. O ponto de articulação não é medido com segurança → sempre "duvidoso".
Nenhum clipe foi ouvido por pessoa: "aprovado" quer dizer aprovado nas medidas. O som gravado pelo adulto no
Estúdio de sons (Área do Professor/Família) tem prioridade sobre estes clipes.

Uso (a partir de app/):  python3 ferramentas/gerar-sons-letras.py [--scribe]
  --scribe: acrescenta a transcrição do ElevenLabs Scribe de cada clipe pronto (só informativa para sons soltos).
"""
import json, os, subprocess, sys
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTES = os.path.join(RAIZ, 'audio-fontes/sons')
PUB = os.path.join(RAIZ, 'web/public/audio/sons')
DOC = os.path.join(RAIZ, 'docs/auditoria-sons-letras.md')
SR = 44100
ALVO_CONTINUO_S = 1.1

# fonema → (arquivo publicado, tipo, ipa, letras, classes aceitas no recorte)
FONEMAS = {
    'a': ('a', 'vogal', '/a/', ['A'], None), 'E': ('e-aberto', 'vogal', '/ɛ/', ['E'], None), 'e': ('e-fechado', 'vogal', '/e/', ['E'], None),
    'i': ('i', 'vogal', '/i/', ['I', 'Y'], None), 'O': ('o-aberto', 'vogal', '/ɔ/', ['O'], None), 'o': ('o-fechado', 'vogal', '/o/', ['O'], None),
    'u': ('u', 'vogal', '/u/', ['U', 'W'], None), 'a~': ('a-nasal', 'vogal', '/ã/', ['Ã'], None),
    'm': ('m', 'continuo', '/m/', ['M'], 'N'), 'n': ('n', 'continuo', '/n/', ['N'], 'N'), 'l': ('l', 'continuo', '/l/', ['L'], 'N'),
    'v': ('v', 'continuo', '/v/', ['V', 'W'], 'Nzj'), 'f': ('f', 'continuo', '/f/', ['F'], 'sfx'), 's': ('s', 'continuo', '/s/', ['S'], 's'),
    'x': ('x', 'continuo', '/ʃ/', ['X', 'CH'], 'x'), 'z': ('z', 'continuo', '/z/', ['Z'], 'z'), 'j': ('j', 'continuo', '/ʒ/', ['J'], 'j'),
    'rr': ('rr', 'continuo', '/ʁ/', ['R'], 'R'),
    'p': ('p', 'explosivo', '/p/', ['P'], None), 'b': ('b', 'explosivo', '/b/', ['B'], None), 't': ('t', 'explosivo', '/t/', ['T'], None),
    'd': ('d', 'explosivo', '/d/', ['D'], None), 'k': ('k', 'explosivo', '/k/', ['C', 'K', 'Q'], None), 'g': ('g', 'explosivo', '/g/', ['G'], None),
}
# letra (ou dígrafo) → fonemas, o principal do currículo primeiro (packages/conteudo/src/alfabeto.ts)
LETRAS = {
    'A': ['a'], 'B': ['b'], 'C': ['k', 's'], 'D': ['d'], 'E': ['e', 'E'], 'F': ['f'], 'G': ['g', 'j'], 'H': [], 'I': ['i'], 'J': ['j'], 'K': ['k'],
    'L': ['l'], 'M': ['m'], 'N': ['n'], 'O': ['o', 'O'], 'P': ['p'], 'Q': ['k'], 'R': ['rr', 'r'], 'S': ['s', 'z'], 'T': ['t'], 'U': ['u'],
    'V': ['v'], 'W': ['u', 'v'], 'X': ['x'], 'Y': ['i'], 'Z': ['z'], 'CH': ['x'], 'LH': ['lh'], 'NH': ['nh'], 'RR': ['rr'], 'SS': ['s'], 'Ç': ['s']
}
# faixas de F1/F2 (Hz) para voz feminina adulta, pt-BR (largas de propósito)
VOGAL = {'a': ((750, 1250), (1250, 1900)), 'E': ((520, 800), (1900, 2800)), 'e': ((330, 520), (2000, 3000)), 'i': ((220, 420), (2300, 3300)),
         'O': ((520, 820), (850, 1300)), 'o': ((330, 520), (650, 1150)), 'u': ((230, 450), (550, 1050)), 'a~': ((380, 750), (1100, 1900))}
SURDOS = 'ptk'
SEM_SOM = {'r': 'R fraco (batida da língua): não se sustenta e o recorte da batida sozinha não ficou confiável',
           'lh': 'LH: som curto entre vogais; o recorte ficou com menos de 100 ms e sem identidade clara',
           'nh': 'NH: idem ao LH'}


def decodificar(arq, sr=SR):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def quadros(x, sr=SR, jan=0.04, passo=0.01):
    """Medidas por quadro de 40 ms (passo de 10 ms)."""
    n, p = int(jan * sr), int(passo * sr)
    w, fr, out = np.hanning(n), np.fft.rfftfreq(n, 1 / sr), []
    grave, agudo, alto = fr <= 900, fr >= 1500, (fr >= 3000) & (fr < 9000)
    lo, hi = int(sr / 420), int(sr / 75)
    for i in range(0, len(x) - n, p):
        q = x[i:i + n]
        F = np.fft.rfft(q * w)
        S = np.abs(F) ** 2 + 1e-14
        tot = S.sum()
        b = lambda a, c: float(S[(fr >= a) & (fr < c)].sum() / tot)
        Fg = F.copy(); Fg[~grave] = 0
        ql = np.fft.irfft(Fg, n)
        ac = np.correlate(ql, ql, 'full')[n - 1:]
        vl = float(ac[lo + int(np.argmax(ac[lo:hi]))] / ac[0]) if ac[0] > 1e-10 else 0.0
        db = 10 * np.log10(np.mean(q * q) + 1e-12)
        dbl = 10 * np.log10(S[grave].sum() / n / n * 2 + 1e-14)
        out.append(dict(t=i / sr, db=db, vl=vl, dbl=dbl, hfdb=10 * np.log10(S[alto].sum() / n / n * 2 + 1e-14),
                        cenh=float((S[agudo] * fr[agudo]).sum() / S[agudo].sum()), b0=b(0, 500), b1=b(500, 2000), b2=b(2000, 4000), b3=b(4000, 22050)))
    return out


def classe(q, pico):
    hf = q['b2'] + q['b3']
    voz = q['vl'] > 0.6 and q['dbl'] > q['db'] - 25
    if q['db'] < pico - 32: return '.'
    if not voz and hf > 0.5: return 's' if q['cenh'] > 6500 else ('x' if q['cenh'] < 5600 and q['b3'] < 0.8 else 'f')
    if voz and hf > 0.25 and q['b1'] < 0.15: return 'z' if q['cenh'] > 6500 else 'j'
    if voz and q['b1'] > 0.25: return 'V'
    if voz and q['b0'] > 0.7: return 'N'
    return '?'


def classes(x):
    Q = quadros(x)
    pico = max(q['db'] for q in Q)
    return ''.join(classe(q, pico) for q in Q), Q


def maior_trecho(s, aceitas, furo=3):
    """Maior sequência de quadros das classes aceitas (tolerando `furo` quadros de outra classe no meio)."""
    melhor, ini, fim, falhas = (0, 0), None, None, 0
    for i, c in enumerate(s + '!'):
        if c in aceitas:
            if ini is None: ini = i
            fim, falhas = i, 0
        elif ini is not None:
            falhas += 1
            if falhas > furo or c == '!':
                if fim - ini > melhor[1] - melhor[0]: melhor = (ini, fim + 1)
                ini = None
    return melhor


def lpc(x, p):
    r = np.correlate(x, x, 'full')[len(x) - 1:len(x) + p]
    a = np.zeros(p + 1); a[0] = 1; e = r[0]
    for i in range(1, p + 1):
        k = -(r[i] + np.dot(a[1:i], r[i - 1:0:-1])) / e
        a[1:i + 1] = a[1:i + 1] + k * np.concatenate((a[i - 1:0:-1], [1]))
        e *= 1 - k * k
    return a


def formantes(x44):
    """F1 e F2 medianos (LPC de ordem 12 a 11 kHz)."""
    sr = 11025
    x = x44[::4].astype(np.float64)
    x = np.append(x[0], x[1:] - 0.97 * x[:-1])
    n = int(0.03 * sr)
    en = [np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n // 2)]
    lim, out = max(en) * 0.3, []
    for j, i in enumerate(range(0, len(x) - n, n // 2)):
        if en[j] < lim: continue
        try: a = lpc(x[i:i + n] * np.hamming(n), 12)
        except Exception: continue
        f = sorted((np.angle(r) * sr / 2 / np.pi, -sr / np.pi * np.log(abs(r))) for r in np.roots(a) if r.imag > 0)
        f = [c for c, bw in f if c > 200 and bw < 500]
        if len(f) >= 2: out.append(f[:2])
    if not out: return 0.0, 0.0
    return float(np.median([o[0] for o in out])), float(np.median([o[1] for o in out]))


def alongar(x, alvo_s):
    """Alonga um som estável repetindo o miolo, com emenda de 50 ms alinhada pela forma de onda."""
    alvo, L = int(alvo_s * SR), int(0.05 * SR)
    if len(x) >= alvo or len(x) < 4 * L: return x
    a, b = int(len(x) * 0.3), int(len(x) * 0.8)
    saida = x[:b].copy()
    while len(saida) < alvo:
        ref = saida[-L:]
        # melhor ponto de entrada perto de `a` (correlação com o fim do que já foi montado)
        busca = range(max(L, a - int(0.012 * SR)), a + int(0.012 * SR), 4)
        k = max(busca, key=lambda j: float(np.dot(ref, x[j - L:j]) / (np.linalg.norm(x[j - L:j]) + 1e-9)))
        rampa = np.linspace(0, 1, L, dtype=np.float32)
        saida[-L:] = ref * (1 - rampa) + x[k - L:k] * rampa
        saida = np.concatenate((saida, x[k:b]))
    return np.concatenate((saida, x[b:]))


def acabamento(x, rms_db, fade_in=0.03, fade_out=0.06):
    x = x.astype(np.float32).copy()
    fi, fo = min(int(fade_in * SR), len(x) // 3), min(int(fade_out * SR), len(x) // 2)
    x[:fi] *= np.linspace(0, 1, fi) ** 2
    x[-fo:] *= np.linspace(1, 0, fo) ** 2
    rms = np.sqrt(np.mean(x * x) + 1e-12)
    x *= 10 ** (rms_db / 20) / rms
    pico = np.max(np.abs(x))
    teto = 10 ** (-1.5 / 20)
    if pico > teto: x *= teto / pico
    sil = np.zeros(int(0.06 * SR), dtype=np.float32)
    return np.concatenate((sil, x, sil))


def recortar(fonema, x):
    """Devolve (sinal recortado, observação) ou (None, motivo)."""
    _, tipo, _, _, aceitas = FONEMAS[fonema]
    s, Q = classes(x)
    p = int(0.01 * SR)
    if tipo == 'vogal':
        pico = max(q['db'] for q in Q)
        ativos = [i for i, q in enumerate(Q) if q['db'] > pico - 22]
        a, b = ativos[0], ativos[-1] + 4
        # só o primeiro bloco contínuo (o TTS às vezes repete o som depois de uma pausa)
        for i in range(a, b):
            if Q[min(i, len(Q) - 1)]['db'] < pico - 30 and i - a > 40: b = i; break
        return x[a * p:min(len(x), b * p)], f'{(b - a) / 100:.2f} s do bruto'
    if tipo == 'continuo' and fonema == 'rr':
        # "Arrrrrrrá.": o R é o trecho fraco e irregular entre as duas vogais
        pico = max(q['db'] for q in Q)
        fortes = [q['db'] > pico - 9 for q in Q]
        try:
            a = fortes.index(False, fortes.index(True))
            b = len(fortes) - 1 - fortes[::-1].index(True)
            while b > a and fortes[b]: b -= 1
        except ValueError:
            return None, 'não achei o trecho do R entre as vogais'
        a, b = a + 4, b - 3
        if b - a < 15: return None, 'trecho do R curto demais'
        return x[a * p:b * p], f'{(b - a) / 100:.2f} s entre as vogais'
    if tipo == 'continuo':
        a, b = maior_trecho(s, aceitas)
        if b - a < 12: return None, f'trecho do som com só {(b - a) * 10} ms no bruto'
        depois = s[b:b + 6]
        if 'V' in depois: b -= 3   # afasta da vogal que vem em seguida
        a += 1
        return x[a * p:(b + 3) * p], f'{(b - a) / 100:.2f} s do bruto'
    # explosivo: do começo do som até 70 ms depois do início da vogal
    pico = max(q['db'] for q in Q)
    ini = next(i for i, q in enumerate(Q) if q['db'] > pico - 32)
    vog = next((i for i in range(ini, len(Q) - 3) if s[i:i + 3] == 'VVV'), None)
    if vog is None: return None, 'não achei a vogal depois do estouro'
    # quadro de 40 ms: a vogal "aparece" ~20 ms antes do centro do quadro
    fim = (vog + 2) * p + int(0.07 * SR)
    a = max(0, ini * p + int(0.012 * SR))
    return x[a:fim], f'estouro em {ini * 10} ms, vogal em {(vog + 2) * 10} ms'


def medir(fonema, y):
    """Mede o clipe PRONTO e devolve (estado, motivo, medidas)."""
    _, tipo, _, _, _ = FONEMAS[fonema]
    s, Q = classes(y)
    A = [(c, q) for c, q in zip(s, Q) if c != '.']
    if not A: return 'reprovado', 'clipe mudo', {}
    dur = len(A) / 100
    voz = float(np.mean([q['vl'] > 0.6 and q['dbl'] > q['db'] - 25 for _, q in A]))
    med = lambda k: float(np.median([q[k] for _, q in A]))
    vogal = float(np.mean([c == 'V' for c, _ in A]))
    hf = float(np.mean([(q['b2'] + q['b3']) > 0.25 for _, q in A]))
    m = dict(dur=round(dur, 2), voz=round(voz, 2), cenh=round(med('cenh')), grave=round(med('b0'), 2), medio=round(med('b1'), 2), agudo=round(med('b2') + med('b3'), 2), vogal=round(vogal, 2))
    falhas, duvidas = [], []
    if tipo == 'vogal':
        f1, f2 = formantes(y)
        m['F1'], m['F2'] = round(f1), round(f2)
        (a1, b1), (a2, b2) = VOGAL[fonema]
        if voz < 0.85: falhas.append(f'voz em só {voz:.0%} do clipe')
        if not a1 <= f1 <= b1: falhas.append(f'F1 {f1:.0f} Hz fora de {a1}–{b1}')
        if not a2 <= f2 <= b2: falhas.append(f'F2 {f2:.0f} Hz fora de {a2}–{b2}')
        if not 0.7 <= dur <= 2.2: falhas.append(f'duração {dur:.2f} s')
        if fonema == 'a~': duvidas.append('a nasalidade não é medida; só a posição da vogal')
    elif fonema in 'mnl' or fonema == 'v':
        if voz < 0.9: falhas.append(f'voz em só {voz:.0%}')
        if m['grave'] < 0.6: falhas.append(f'energia grave {m["grave"]:.2f} (esperado > 0,6)')
        if vogal > 0.1: falhas.append(f'{vogal:.0%} do clipe soa como vogal')
        if dur < 0.6: falhas.append(f'duração {dur:.2f} s')
        if fonema == 'v': duvidas.append(f'a fricção do V é fraca (aparece em {hf:.0%} do clipe): pode soar como um "mmm" ou "uuu" abafado')
        if fonema == 'l': duvidas.append('L e N se parecem nas medidas: confirmado só por vir de "llllá"')
    elif fonema in 'sxf':
        if voz > 0.15: falhas.append(f'barra de voz em {voz:.0%} (deveria ser só ar)')
        if fonema == 's' and m['cenh'] < 6500: falhas.append(f'chiado em {m["cenh"]} Hz (s fica acima de 6500)')
        if fonema == 'x' and not 3300 <= m['cenh'] <= 5600: falhas.append(f'chiado em {m["cenh"]} Hz (x fica entre 3300 e 5600)')
        if fonema == 'f' and m['medio'] + med('b2') < 0.1: falhas.append('ruído só no agudo: soa como S, não como F')
        if dur < 0.6: falhas.append(f'duração {dur:.2f} s')
    elif fonema in 'zj':
        if voz < 0.8: falhas.append(f'voz em só {voz:.0%} (deveria vibrar)')
        if hf < 0.7: falhas.append(f'chiado em só {hf:.0%} do clipe')
        if fonema == 'z' and m['cenh'] < 6500: falhas.append(f'chiado em {m["cenh"]} Hz (z fica acima de 6500)')
        if fonema == 'j' and not 3800 <= m['cenh'] <= 6600: falhas.append(f'chiado em {m["cenh"]} Hz (j fica entre 3800 e 6600)')
        if dur < 0.6: falhas.append(f'duração {dur:.2f} s')
        if fonema == 'j': duvidas.append('a transcrição automática não reconheceu o som como J (ouviu "iii" numa versão): o chiado pode estar fraco perto da voz')
    elif fonema == 'rr':
        if vogal > 0.25: falhas.append(f'{vogal:.0%} do clipe soa como vogal')
        if dur < 0.3: falhas.append(f'duração {dur:.2f} s')
        duvidas.append('R forte muda com o sotaque (garganta ou língua tremendo); as medidas não garantem que soe como R')
    else:  # explosivo
        ini = [q for _, q in A[:4]]
        voz_ini = float(np.mean([q['vl'] > 0.6 and q['dbl'] > q['db'] - 25 and q['b0'] > 0.6 for q in ini]))
        resto = sum(c == 'V' for c, _ in A) / 100
        m['vozNoComeco'], m['restoDeVogal'] = round(voz_ini, 2), round(resto, 2)
        if not 0.08 <= dur <= 0.28: falhas.append(f'duração {dur:.2f} s (esperado 0,08–0,28)')
        if fonema in SURDOS and voz_ini > 0.5: falhas.append('tem voz antes do estouro (deveria ser surdo)')
        if fonema not in SURDOS and voz_ini < 0.5: duvidas.append('sem barra de voz antes do estouro: pode soar como o par surdo')
        if resto > 0.11: falhas.append(f'resto de vogal de {resto * 1000:.0f} ms')
        duvidas.append('o ponto do estouro (lábios, dentes, fundo da boca) não é medido com segurança: conferir de ouvido')
    if falhas: return 'reprovado', '; '.join(falhas), m
    if duvidas: return 'duvidoso', '; '.join(duvidas), m
    return 'aprovado', 'dentro dos critérios do tipo de som', m


def scribe(arq):
    r = subprocess.run(['curl', '-sS', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', f'xi-api-key: {os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")}',
                        '-F', 'model_id=scribe_v1', '-F', 'language_code=por', '-F', f'file=@{arq}'], capture_output=True, text=True)
    try: return (json.loads(r.stdout).get('text') or '').strip() or '(vazio)'
    except Exception: return '(falhou)'


def main():
    fontes = json.load(open(os.path.join(FONTES, 'fontes.json')))
    os.makedirs(PUB, exist_ok=True)
    mapa = {'versao': 1, 'descricao': 'Som real (fonema puro) de cada letra. Só entram clipes aprovados ou duvidosos nas medidas; reprovados ficam de fora e a letra usa a fala da dupla. Gravações do adulto (Estúdio de sons) têm prioridade no app.',
            'repeticoes': {'vogal': 2, 'continuo': 3, 'explosivo': 3}, 'fonemas': {}, 'letras': LETRAS, 'semSom': sorted(SEM_SOM)}
    linhas, cont = [], {'aprovado': 0, 'duvidoso': 0, 'reprovado': 0}
    for fonema, (nome, tipo, ipa, letras, _) in FONEMAS.items():
        f = fontes.get(fonema)
        destino = os.path.join(PUB, f'{nome}.mp3')
        if not f:
            linhas.append((fonema, ipa, letras, tipo, 'reprovado', 'sem fonte gerada', {}, '', '')); cont['reprovado'] += 1; continue
        x = decodificar(os.path.join(FONTES, f['fonte']))
        y, obs = recortar(fonema, x)
        if y is None:
            estado, motivo, m = 'reprovado', obs, {}
        else:
            if tipo == 'continuo' and fonema != 'rr': y = alongar(y, ALVO_CONTINUO_S)
            surdo = fonema in 'sxf'
            y = acabamento(y, -25.0 if surdo else (-20.0 if tipo != 'explosivo' else -18.0), fade_in=0.004 if tipo == 'explosivo' else 0.03, fade_out=0.05 if tipo == 'explosivo' else 0.08)
            estado, motivo, m = medir(fonema, y)
        cont[estado] += 1
        tr = ''
        if estado == 'reprovado':
            if os.path.exists(destino): os.remove(destino)
        else:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-codec:a', 'libmp3lame', '-b:a', '96k', destino], input=y.tobytes(), check=True)
            mapa['fonemas'][fonema] = {'arquivo': f'{nome}.mp3', 'estado': estado, 'tipo': tipo, 'ipa': ipa, 'letras': letras, 'duracaoMs': int(len(y) / SR * 1000)}
            if '--scribe' in sys.argv: tr = scribe(destino)
        linhas.append((fonema, ipa, letras, tipo, estado, motivo, m, f['texto'], tr))
        print(f'{fonema:3} {estado:9} {motivo[:90]}  {m}')
    for fonema, motivo in SEM_SOM.items():
        linhas.append((fonema, {'r': '/ɾ/', 'lh': '/ʎ/', 'nh': '/ɲ/'}[fonema], [fonema.upper()], 'curto', 'reprovado', motivo, {}, '', '')); cont['reprovado'] += 1
    json.dump(mapa, open(os.path.join(PUB, 'mapa.json'), 'w'), ensure_ascii=False, indent=1)
    with open(DOC, 'w') as o:
        o.write('# Auditoria dos sons das letras (fonemas puros)\n\n')
        o.write('Gerado por `ferramentas/gerar-sons-letras.py`. Regra (D027 §2 e D029 §2): **clipe reprovado não vai ao ar**; a letra fica com a fala da dupla ("M, de macaco.") até um adulto gravar o som no Estúdio de sons.\n\n')
        o.write(f'- Aprovados nas medidas: **{cont["aprovado"]}** · duvidosos (no ar, mas pedem conferência de ouvido): **{cont["duvidoso"]}** · reprovados (fora do ar): **{cont["reprovado"]}**\n')
        o.write('- **Nenhum clipe foi ouvido por pessoa.** "Aprovado" significa aprovado nas medidas do sinal (voz, faixa do chiado, formantes, duração). A conferência final é de ouvido, de preferência por fonoaudióloga.\n')
        o.write('- Voz: adulta feminina de professora (ElevenLabs, modelo v3), usada **só** para o som da letra. Fontes brutas em `audio-fontes/sons/`.\n')
        o.write('- Contínuos com menos de 1,1 s no bruto foram alongados repetindo o miolo estável (emenda alinhada de 50 ms).\n\n')
        o.write('| Fonema | Letras | Tipo | Estado | Motivo | Medidas | Texto enviado ao TTS | Scribe ouviu |\n|---|---|---|---|---|---|---|---|\n')
        for fonema, ipa, letras, tipo, estado, motivo, m, texto, tr in linhas:
            med = ' · '.join(f'{k} {v}' for k, v in m.items())
            o.write(f'| {ipa} `{fonema}` | {", ".join(letras)} | {tipo} | **{estado}** | {motivo} | {med} | {texto} | {tr} |\n')
        o.write('\nMedidas: `dur` duração do som (s) · `voz` fração do clipe com barra de voz · `cenh` centro do chiado (Hz, acima de 1,5 kHz) · `grave`/`medio`/`agudo` fração da energia abaixo de 500 Hz, de 0,5 a 2 kHz e acima de 2 kHz · `vogal` fração do clipe que soa como vogal · `F1`/`F2` formantes (Hz).\n')
    print(cont, '→', DOC)


if __name__ == '__main__':
    main()
