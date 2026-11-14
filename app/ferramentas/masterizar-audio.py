#!/usr/bin/env python3
"""Masterização dos clipes de voz (não gasta créditos): fontes brutas do TTS → clipes prontos para o app.

  app/audio-fontes/falas/*.mp3 + manifesto.json  ("voz|texto" → arquivo bruto em uso)
  app/audio-fontes/nomes/<voz>/*.mp3 + manifesto.json  ({voz: {nome: arquivo bruto}})
        ↓  apara o silêncio das pontas · fade-in 10 ms / fade-out 15 ms · 80 ms de silêncio no começo e no fim
        ↓  volume igual em todos (parte falada em −17 dBFS ≈ −16 LUFS, teto −1,5 dBFS sem estourar)
  app/web/public/audio/falas/<bruto>-m<V>.mp3 + manifesto.json  ("voz|texto" → arquivo masterizado)
  app/web/public/audio/nomes/<voz>/<bruto>-m<V>.mp3 + manifesto.json  ({sofia: [...], tales: [...], arquivos: {voz: {nome: arquivo}}})

As fontes NUNCA são apagadas nem alteradas. O sufixo -m<V> muda quando a receita muda (o navegador nunca fica
com um clipe antigo em cache). Clipes masterizados que saíram do manifesto são removidos de public/ (são derivados).

Uso (a partir de app/):  python3 ferramentas/masterizar-audio.py [--refazer] [--migrar]
  --migrar: primeira vez — move os mp3 brutos de web/public/audio para audio-fontes (git mv quando possível).
"""
import json, os, re, subprocess, sys
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTES = os.path.join(RAIZ, 'audio-fontes')
PUB = os.path.join(RAIZ, 'web/public/audio')
V = 1                      # versão da receita
SR = 44100
ALVO_RMS_DB = -17.0        # RMS da parte falada
TETO = 10 ** (-1.5 / 20)   # pico máximo
SILENCIO_MS = 80           # silêncio no começo e no fim
FADE_IN_MS, FADE_OUT_MS = 10, 15
MARGEM_INI_MS, MARGEM_FIM_MS = 25, 50   # respiro mantido antes/depois da fala ao aparar (consoantes fracas, final da vogal)
SUF = re.compile(r'-m\d+\.mp3$')


def decodificar(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def masterizar(x):
    """Devolve o sinal masterizado, ou None se o clipe for mudo."""
    passo = int(SR * 0.005)
    q = max(1, len(x) // passo)
    env = np.array([np.sqrt(np.mean(x[i * passo:(i + 1) * passo] ** 2) + 1e-12) for i in range(q)])
    pico = float(np.max(np.abs(x))) if len(x) else 0.0
    if pico < 10 ** (-40 / 20):
        return None
    limiar = max(10 ** (-50 / 20), pico * 10 ** (-42 / 20))
    ativos = np.where(env > limiar)[0]
    a = max(0, ativos[0] * passo - int(SR * MARGEM_INI_MS / 1000))
    b = min(len(x), (ativos[-1] + 1) * passo + int(SR * MARGEM_FIM_MS / 1000))
    y = x[a:b].astype(np.float64)
    # volume: RMS dos quadros de fala (acima de −40 dBFS)
    ef = env[ativos[0]:ativos[-1] + 1]
    ef = ef[ef > 10 ** (-40 / 20)]
    rms = np.sqrt(np.mean(ef ** 2)) if len(ef) else np.sqrt(np.mean(y ** 2))
    y *= 10 ** (ALVO_RMS_DB / 20) / max(rms, 1e-6)
    # teto suave (sem estourar): acima do joelho a curva achata até o teto
    joelho = TETO * 0.8
    m = np.abs(y)
    acima = m > joelho
    y[acima] = np.sign(y[acima]) * (joelho + (TETO - joelho) * np.tanh((m[acima] - joelho) / (TETO - joelho)))
    fi, fo = int(SR * FADE_IN_MS / 1000), int(SR * FADE_OUT_MS / 1000)
    fi, fo = min(fi, len(y) // 2), min(fo, len(y) // 2)
    y[:fi] *= np.linspace(0, 1, fi) ** 2
    y[len(y) - fo:] *= np.linspace(1, 0, fo) ** 2
    z = np.zeros(int(SR * SILENCIO_MS / 1000))
    return np.concatenate([z, y, z]).astype(np.float32)


def codificar(y, destino):
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '80k', '-write_xing', '1', destino], input=y.tobytes(), check=True)


def migrar():
    """Move os mp3 brutos de public/ para audio-fontes/ (uma vez) e cria os manifestos das fontes."""
    def mover(de, para):
        os.makedirs(os.path.dirname(para), exist_ok=True)
        if subprocess.run(['git', 'mv', '-k', de, para], cwd=RAIZ, capture_output=True).returncode != 0 or os.path.exists(de):
            os.replace(de, para)
    n = 0
    for base in ('falas', 'nomes'):
        for raiz, _, arqs in os.walk(os.path.join(PUB, base)):
            for a in arqs:
                if a.endswith('.mp3') and not SUF.search(a):
                    de = os.path.join(raiz, a)
                    mover(de, os.path.join(FONTES, os.path.relpath(de, PUB)))
                    n += 1
    mf = os.path.join(FONTES, 'falas/manifesto.json')
    if not os.path.exists(mf):
        man = json.load(open(os.path.join(PUB, 'falas/manifesto.json')))
        json.dump({k: SUF.sub('.mp3', v) for k, v in man.items()}, open(mf, 'w'), ensure_ascii=False, indent=1)
    mn = os.path.join(FONTES, 'nomes/manifesto.json')
    if not os.path.exists(mn):
        man = json.load(open(os.path.join(PUB, 'nomes/manifesto.json')))
        json.dump({v: {n: f'{n}.mp3' for n in man.get(v, [])} for v in ('sofia', 'tales')}, open(mn, 'w'), ensure_ascii=False, indent=1)
    print(f'migração: {n} arquivos brutos movidos para audio-fontes/')


def main():
    refazer = '--refazer' in sys.argv
    if '--migrar' in sys.argv:
        migrar()
    feitos = mudos = 0
    # falas
    fontes = json.load(open(os.path.join(FONTES, 'falas/manifesto.json')))
    saida, usados = {}, set()
    for chave, bruto in fontes.items():
        nome = f'{bruto[:-4]}-m{V}.mp3'
        dest = os.path.join(PUB, 'falas', nome)
        if refazer or not os.path.exists(dest):
            y = masterizar(decodificar(os.path.join(FONTES, 'falas', bruto)))
            if y is None:
                mudos += 1
                print(f'  MUDO (fora do manifesto público; regravar): {chave} ({bruto})')
                continue
            codificar(y, dest)
            feitos += 1
        saida[chave] = nome
        usados.add(nome)
    json.dump(saida, open(os.path.join(PUB, 'falas/manifesto.json'), 'w'), ensure_ascii=False, indent=1)
    for a in os.listdir(os.path.join(PUB, 'falas')):
        if SUF.search(a) and a not in usados:
            os.remove(os.path.join(PUB, 'falas', a))
    # nomes
    fontes_n = json.load(open(os.path.join(FONTES, 'nomes/manifesto.json')))
    saida_n = {'sofia': [], 'tales': [], 'arquivos': {'sofia': {}, 'tales': {}}}
    for voz in ('sofia', 'tales'):
        usados = set()
        for n, bruto in fontes_n.get(voz, {}).items():
            nome = f'{bruto[:-4]}-m{V}.mp3'
            dest = os.path.join(PUB, 'nomes', voz, nome)
            if refazer or not os.path.exists(dest):
                y = masterizar(decodificar(os.path.join(FONTES, 'nomes', voz, bruto)))
                if y is None:
                    mudos += 1
                    print(f'  MUDO: nome {voz}/{n}')
                    continue
                codificar(y, dest)
                feitos += 1
            saida_n[voz].append(n)
            saida_n['arquivos'][voz][n] = nome
            usados.add(nome)
        d = os.path.join(PUB, 'nomes', voz)
        for a in os.listdir(d) if os.path.isdir(d) else []:
            if SUF.search(a) and a not in usados:
                os.remove(os.path.join(d, a))
    json.dump(saida_n, open(os.path.join(PUB, 'nomes/manifesto.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'masterizados agora: {feitos} · falas no ar: {len(saida)} · nomes no ar: {len(saida_n["sofia"])}+{len(saida_n["tales"])} · mudos: {mudos}')


if __name__ == '__main__':
    main()
