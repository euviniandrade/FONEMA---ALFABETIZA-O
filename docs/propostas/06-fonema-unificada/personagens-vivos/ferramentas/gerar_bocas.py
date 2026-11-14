#!/usr/bin/env python3
"""
Pré-calcula a BOCA de cada clipe de voz oficial (lip-sync offline).

Para cada mp3 do manifesto (app/web/public/audio/falas/manifesto.json: "voz|texto" -> arquivo) e cada nome gravado
(audio/nomes/<voz>/<nome>.mp3):
  1. TEXTO -> sequência de visemas pelas regras do português do Brasil (dígrafos, "qu/gu", o/e finais reduzidos,
     m/n nasais no fim da sílaba...). Visemas = posições do Espelho do Som (D020):
        .  descanso (boca fechada)      m  M/P/B (lábios juntos)        a  A aberta
        e  E/É (meio aberta, sorriso)   i  I (sorriso, dentes)          o  O (redonda)
        u  U (biquinho)                 f  F/V (dente no lábio)         l  L/T/D/N (língua nos dentes)
        s  S/Z/C(e,i) (dentes juntos)   x  CH/J/X/G(e,i) (bico aberto)
  2. ÁUDIO -> envoltória de energia (RMS a cada 10 ms).
  3. Alinhamento por programação dinâmica: cada visema tem uma "energia esperada" (vogal alta, M/P/B quase zero,
     pausa zero) e uma duração provável; o caminho de menor custo coloca as vogais nos picos e as pausas nos silêncios.
  4. Saída (bocas.json): { qps: 25, clipes: { "falas/x.mp3": [impressão digital, "uma letra por quadro de 40 ms", texto] } }.
     Silêncio sempre vira '.', vogal fraca abre menos. A impressão digital (tamanho + hash do meio do arquivo) identifica o clipe quando ele toca por blob.

  python3 gerar_bocas.py <app/web/public> <saida bocas.json>

Não é reconhecimento de fala: é um alinhamento aproximado, bom o bastante para a boca abrir e fechar junto com a voz.
"""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

PUB, SAIDA = sys.argv[1], sys.argv[2]
VOG = {'a': 'a', 'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'e': 'e', 'é': 'e', 'ê': 'e', 'i': 'i', 'í': 'i', 'o': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'u': 'u', 'ú': 'u', 'ü': 'u', 'y': 'i'}
ACENTO = set('áàâãéêíóôõú')
ESPERADA = {'a': 1.0, 'e': 0.9, 'o': 0.9, 'i': 0.75, 'u': 0.7, 'm': 0.12, 'f': 0.2, 'l': 0.45, 's': 0.28, 'x': 0.3, '-': 0.35, '_': 0.0}
PESO = {'a': 1.0, 'e': 1.0, 'o': 1.0, 'i': 0.9, 'u': 0.9, 'm': 0.6, 'f': 0.6, 'l': 0.45, 's': 0.65, 'x': 0.65, '-': 0.4, '_': 0.0}

def palavra_para_visemas(p):
    """uma palavra (minúsculas) -> lista de visemas ('-' = consoante sem forma própria: herda a vogal vizinha)."""
    out = []; n = len(p); i = 0
    while i < n:
        c = p[i]; prox = p[i + 1] if i + 1 < n else ''
        if c in VOG:
            v = VOG[c]
            # redução do português do Brasil: "o"/"e" átonos no fim viram "u"/"i" (gato -> gatu, leite -> leiti)
            fim = i == n - 1 or (i == n - 2 and prox == 's')
            if fim and c == 'o' and (n > 1 or True) and not any(ch in ACENTO for ch in p): v = 'u'
            if fim and c == 'e' and not any(ch in ACENTO for ch in p): v = 'i'
            out.append(v); i += 1; continue
        par = c + prox
        if par in ('ch', 'sh'): out.append('x'); i += 2; continue
        if par in ('lh', 'nh'): out.append('l'); i += 2; continue
        if par in ('rr', 'ss'): out.append('-' if c == 'r' else 's'); i += 2; continue
        if par in ('qu', 'gu') and i + 2 < n and p[i + 2] in 'eéêií': out.append('-'); i += 2; continue
        if c == 'q': out.append('-'); i += 1; continue
        if c in 'pb': out.append('m'); i += 1; continue
        if c == 'm':
            # m nasal no fim da sílaba (com, também, bem): não fecha de novo se já vem p/b, nem no fim da palavra
            if prox == '' or prox in 'pb': i += 1; continue
            out.append('m'); i += 1; continue
        if c == 'n':
            if prox == '' or prox not in VOG and prox != 'h': i += 1; continue   # nasaliza a vogal anterior
            out.append('l'); i += 1; continue
        if c in 'fv': out.append('f'); i += 1; continue
        if c in 'ltd': out.append('l'); i += 1; continue
        if c in 'szç': out.append('s'); i += 1; continue
        if c == 'c': out.append('s' if prox in 'eéêií' else '-'); i += 1; continue
        if c == 'g': out.append('x' if prox in 'eéêií' else '-'); i += 1; continue
        if c in 'jx': out.append('x'); i += 1; continue
        if c == 'h': i += 1; continue
        if c in 'rkw': out.append('u' if c == 'w' else '-'); i += 1; continue
        i += 1
    return out

def texto_para_unidades(texto):
    """texto -> lista de visemas com '_' nas pausas (pontuação)."""
    t = unicodedata.normalize('NFC', texto.lower())
    un = ['_']
    for parte in re.findall(r"[a-záàâãéêíóôõúüç]+|[,.;:!?…/—–-]+", t):
        if re.match(r"[,.;:!?…/—–-]", parte):
            if un[-1] != '_': un.append('_')
        else:
            un += palavra_para_visemas(parte)
    if un[-1] != '_': un.append('_')
    return un

def envoltoria(arq):
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', arq, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    n = len(x) // 160
    if n < 3: return np.zeros(1, np.float32)
    rms = np.sqrt((x[:n * 160].reshape(n, 160) ** 2).mean(1))
    rms = np.convolve(rms, np.ones(3) / 3, mode='same')
    ref = np.percentile(rms, 95) or 1e-6
    return np.clip(rms / ref, 0, 1) ** 0.6

def alinhar(un, env):
    """programação dinâmica segmentar: devolve o visema de cada quadro de 10 ms."""
    T = len(env); U = len(un)
    fala = max(1.0, float((env > 0.12).sum()))
    soma = sum(PESO[u] for u in un) or 1.0
    INF = 1e18
    melhor = np.full(T + 1, INF); melhor[0] = 0
    volta = np.zeros((U, T + 1), np.int32)
    for k, u in enumerate(un):
        custo = np.abs(env - ESPERADA[u]) if u != '_' else env * 3.0
        pref = np.concatenate([[0], np.cumsum(custo)])
        if u == '_': dmin, dmax, desp = 0, T, 0
        else:
            desp = fala * PESO[u] / soma
            dmin = 2 if u in 'ml-' else 3; dmax = int(max(dmin + 2, min(70, desp * 3 + 8)))
        novo = np.full(T + 1, INF); tt = np.arange(T + 1)
        for d in range(dmin, min(dmax, T) + 1):
            cand = np.full(T + 1, INF)
            if d == 0: cand = melhor.copy()
            else: cand[d:] = melhor[:T + 1 - d] + (pref[d:] - pref[:T + 1 - d])
            if u != '_': cand = cand + 0.25 * abs(d - desp) / max(desp, 1.0)
            m = cand < novo; novo[m] = cand[m]; volta[k][m] = d
        melhor = novo
    quadros = [''] * T; t = T
    if melhor[T] >= INF:   # texto longo demais para o áudio (não deve acontecer): espalha por igual
        seq = [u for u in un if u != '_'] or ['_']
        return [seq[min(len(seq) - 1, i * len(seq) // T)] for i in range(T)]
    for k in range(U - 1, -1, -1):
        d = int(volta[k][t])
        for i in range(t - d, t): quadros[i] = un[k]
        t -= d
    return quadros

def resolver(un):
    """consoantes sem forma própria ('-') herdam a próxima vogal (coarticulação)."""
    out = list(un)
    for i, u in enumerate(out):
        if u == '-':
            v = next((x for x in out[i + 1:] if x in 'aeiou_'), '_')
            if v == '_': v = next((x for x in reversed(out[:i]) if x in 'aeiou'), 'e')
            out[i] = v
    return out

def boca(texto, arq):
    env = envoltoria(arq)
    un = resolver(texto_para_unidades(texto))
    q = alinhar(un, env)
    out = []
    for i in range(0, len(q), 4):   # 40 ms
        j = min(len(q) - 1, i + 2); v = q[j]; e = float(env[i:i + 4].mean())
        if v == '_' or e < 0.07: v = '.'
        elif v == 'a' and e < 0.38: v = 'e'       # vogal fraca abre menos
        out.append(v)
    return ''.join(out)

def marca(arq):
    """impressão digital do clipe: tamanho + FNV-1a de 256 bytes do meio (o app calcula igual quando o áudio toca por blob)."""
    b = open(arq, 'rb').read(); m = len(b) // 2; h = 0x811c9dc5
    for x in b[m:m + 256]: h = ((h ^ x) * 0x01000193) & 0xffffffff
    return f'{len(b)}-{h:x}'

if __name__ == '__main__':
    saida = {}
    falas = json.load(open(f'{PUB}/audio/falas/manifesto.json'))
    for chave, arq in falas.items():
        texto = chave.split('|', 1)[1]
        saida[f'falas/{arq}'] = [marca(f'{PUB}/audio/falas/{arq}'), boca(texto, f'{PUB}/audio/falas/{arq}'), texto]
    nomes = json.load(open(f'{PUB}/audio/nomes/manifesto.json'))
    for voz, lista in nomes.items():
        for nome in lista:
            saida[f'nomes/{voz}/{nome}.mp3'] = [marca(f'{PUB}/audio/nomes/{voz}/{nome}.mp3'), boca(nome, f'{PUB}/audio/nomes/{voz}/{nome}.mp3'), '']
    json.dump({'qps': 25, 'clipes': saida}, open(SAIDA, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(saida), 'clipes')
