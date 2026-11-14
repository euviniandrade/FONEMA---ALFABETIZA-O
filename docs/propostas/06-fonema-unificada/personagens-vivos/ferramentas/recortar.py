#!/usr/bin/env python3
"""
Recorta o fundo (chroma key) de um vídeo gerado e monta os arquivos leves do app.

  python3 recortar.py giro   video.mp4 saida_sem_extensao  [--cor verde|magenta] [--altura 420] [--quadros 48]
      -> saida.webp (folha de quadros 8 colunas, fundo transparente) + saida.json (medidas)
  python3 recortar.py estado video.mp4 saida_sem_extensao  [--cor verde|magenta] [--altura 480] [--fps 24]
      -> saida.webm (VP9 com canal alfa), saida.anim.webp (reserva para Safari, 8 qps), saida.webp (pôster)

Só usa ffmpeg + numpy + Pillow. Chave: verde = G - max(R,B); magenta = min(R,B) - G; borda suave e
"despill" (tira o reflexo da cor do fundo nas bordas).
"""
import argparse, json, subprocess, sys
import numpy as np
from PIL import Image

def ler(video):
    info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip().split(',')
    w, h = int(info[0]), int(info[1]); a, b = info[2].split('/'); fps = float(a) / float(b)
    bruto = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', video, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(bruto, np.uint8).reshape(-1, h, w, 3), fps

def borrar(a):
    """média 3x3 (suaviza a borda do alfa)."""
    p = np.pad(a, 1, mode='edge')
    return (p[:-2, :-2] + p[:-2, 1:-1] + p[:-2, 2:] + p[1:-1, :-2] + p[1:-1, 1:-1] + p[1:-1, 2:] + p[2:, :-2] + p[2:, 1:-1] + p[2:, 2:]) / 9.0

def chave(q, cor):
    f = q.astype(np.float32); r, g, b = f[..., 0], f[..., 1], f[..., 2]
    if cor == 'verde':
        d = g - np.maximum(r, b); alfa = np.clip((66 - d) / (66 - 22), 0, 1)
        g = np.minimum(g, np.maximum(r, b))
    else:
        d = np.minimum(r, b) - g; alfa = np.clip((115 - d) / (115 - 35), 0, 1)
        ex = np.maximum(0, np.minimum(r, b) - g); r = r - ex; b = b - ex
    alfa = np.clip(borrar(alfa) * 1.6 - 0.45, 0, 1)   # aperta 1 px a borda e suaviza
    out = np.empty(q.shape[:2] + (4,), np.uint8)
    out[..., 0] = r; out[..., 1] = g; out[..., 2] = b; out[..., 3] = alfa * 255
    return out

def caixa(quadros, margem=10):
    m = np.zeros(quadros[0].shape[:2], bool)
    for q in quadros: m |= q[..., 3] > 100
    # tira ruído solto: colunas/linhas com pouquíssimos pixels não contam
    ys = np.where(m.sum(1) > 2)[0]; xs = np.where(m.sum(0) > 2)[0]
    h, w = m.shape
    x0, x1, y0, y1 = max(0, xs[0] - margem), min(w, xs[-1] + margem), max(0, ys[0] - margem), min(h, ys[-1] + margem)
    return x0, y0, x1 - ((x1 - x0) % 2), y1 - ((y1 - y0) % 2)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('modo'); ap.add_argument('video'); ap.add_argument('saida')
    ap.add_argument('--cor', default='verde'); ap.add_argument('--altura', type=int, default=0)
    ap.add_argument('--quadros', type=int, default=48); ap.add_argument('--fps', type=int, default=24)
    ap.add_argument('--crf', type=int, default=36)
    a = ap.parse_args()
    bruto, fps = ler(a.video)
    quadros = [chave(q, a.cor) for q in bruto]
    x0, y0, x1, y1 = caixa(quadros)
    quadros = [q[y0:y1, x0:x1] for q in quadros]
    h, w = quadros[0].shape[:2]
    if a.modo == 'giro':
        alt = a.altura or 420; larg = int(round(w * alt / h))
        peq = [np.asarray(Image.fromarray(q).resize((48, 64))).astype(np.float32) for q in quadros]
        n = len(peq)
        # onde o giro fecha: quadro da 2ª metade mais parecido com o primeiro
        dif0 = [np.abs(peq[i] - peq[0]).mean() for i in range(n)]
        fim = int(np.argmin([d if i > n * 0.6 else 1e9 for i, d in enumerate(dif0)]))
        fecha = dif0[fim]
        # velocidade irregular do vídeo: amostra metade pelo tempo, metade pelo "quanto mudou"
        mov = np.array([np.abs(peq[i + 1] - peq[i]).mean() for i in range(fim)])
        peso = 0.5 / fim + 0.5 * mov / mov.sum()
        acum = np.concatenate([[0], np.cumsum(peso)])
        idx = [int(np.searchsorted(acum, k / a.quadros, side='right') - 1) for k in range(a.quadros)]
        col = 8; lin = (a.quadros + col - 1) // col
        folha = Image.new('RGBA', (larg * col, alt * lin), (0, 0, 0, 0))
        for k, i in enumerate(idx):
            folha.paste(Image.fromarray(quadros[i]).resize((larg, alt), Image.LANCZOS), ((k % col) * larg, (k // col) * alt))
        folha.save(a.saida + '.webp', quality=82, method=6)
        json.dump({'quadros': a.quadros, 'colunas': col, 'linhas': lin, 'largura': larg, 'altura': alt, 'fechaEm': fim, 'diferencaFecho': round(float(fecha), 2), 'indices': idx}, open(a.saida + '.json', 'w'))
        print('giro', a.saida, f'{larg}x{alt}', 'fecha no quadro', fim, 'dif', round(float(fecha), 2))
    else:
        alt = a.altura or 480; larg = int(round(w * alt / h / 2) * 2)
        n = len(quadros); N = 10
        # fecha o laço: os últimos N quadros derretem de volta para o primeiro
        for i in range(N):
            t = (i + 1) / N; k = n - N + i
            quadros[k] = (quadros[k].astype(np.float32) * (1 - t) + quadros[0].astype(np.float32) * t).astype(np.uint8)
        dados = b''.join(q.tobytes() for q in quadros)
        ent = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-']
        subprocess.run(ent + ['-vf', f'scale={larg}:{alt}:flags=lanczos,fps={a.fps}', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', str(a.crf), '-g', '48', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-an', '-metadata:s:v:0', 'alpha_mode=1', a.saida + '.webm'], input=dados, check=True)
        ar = int(alt * 0.625); lr = int(round(larg * 0.625))
        subprocess.run(ent + ['-vf', f'scale={lr}:{ar}:flags=lanczos,fps=8', '-c:v', 'libwebp_anim', '-lossless', '0', '-q:v', '42', '-compression_level', '4', '-loop', '0', '-an', a.saida + '.anim.webp'], input=dados, check=True)
        Image.fromarray(quadros[0]).resize((larg, alt), Image.LANCZOS).save(a.saida + '.webp', quality=86, method=6)
        print('estado', a.saida, f'{larg}x{alt}', n, 'quadros', round(n / fps, 2), 's')

if __name__ == '__main__':
    main()
