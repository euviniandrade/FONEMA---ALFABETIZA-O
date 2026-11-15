#!/usr/bin/env python3
"""Gera figuras 3D pela API da MiniMax (modelo image-01, o mais econômico) e recorta o fundo.
A chave é injetada pelo proxy do ambiente (nunca fica em código). Uso:
  gerar-figura-minimax.py <saida.webp> "<descrição em inglês do objeto>" [--tamanho 220] [--bruto pasta] [--so-recortar] [--furos] [--macico] [--cena]
O estilo e o fundo branco são acrescentados aqui, para todas as figuras saírem no mesmo padrão."""
import base64, json, os, sys, urllib.request
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as nd

ESTILO = (", single object, stylized 3D animated family film render, soft rounded shapes, glossy clean materials, "
          "cheerful saturated colors, soft studio lighting, centered, whole object visible with margin, "
          "isolated on a plain flat pure white background, no text, no letters, no people")

ESTILO_CENA = (", stylized 3D animated family film render, soft rounded shapes, cheerful saturated colors, soft studio lighting, centered, "
               "isolated on a plain flat pure white background, no text, no letters")

def gerar(prompt):
    req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
        headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
        data=json.dumps({'model': 'image-01', 'prompt': prompt + (ESTILO_CENA if '--cena' in sys.argv else ESTILO), 'aspect_ratio': '1:1', 'response_format': 'base64', 'n': 1}).encode())
    d = json.load(urllib.request.urlopen(req, timeout=240))
    if d.get('base_resp', {}).get('status_code') != 0: sys.exit(f"MiniMax: {d.get('base_resp')}")
    return base64.b64decode(d['data']['image_base64'][0])

_sessao = None
def recortar(im, furos=False, macico=False):
    """Recorte por modelo de segmentação (rembg, isnet-general-use): tira o fundo e a sombra do chão sem comer partes claras do objeto.
    `furos` tira também o branco preso por dentro (anel, zero). Requer: pip install rembg onnxruntime."""
    global _sessao
    from rembg import remove, new_session
    if _sessao is None: _sessao = new_session('isnet-general-use')
    out = remove(im.convert('RGB'), session=_sessao)
    if furos:
        a = np.asarray(im.convert('RGB')).astype(int); al = np.asarray(out)[..., 3].copy()
        al[(a.min(2) > 236) & ((a.max(2) - a.min(2)) < 10)] = 0
        out.putalpha(Image.fromarray(al).filter(ImageFilter.GaussianBlur(1)))
    al = np.asarray(out)[..., 3] > 40                                  # solta migalhas longe do objeto
    rot, n = nd.label(al)
    if n > 1:
        tam = nd.sum(al, rot, range(1, n + 1)); fica = np.isin(rot, [k + 1 for k, t in enumerate(tam) if t > tam.max() * 0.03])
        out.putalpha(Image.fromarray((np.asarray(out)[..., 3] * fica).astype('uint8')))
    if macico:                                                         # quadro, janela: o miolo é parte do objeto
        al = np.asarray(out)[..., 3]; cheio = nd.binary_fill_holes(al > 40)
        out = im.convert('RGBA'); out.putalpha(Image.fromarray(np.maximum(al, cheio * 255).astype('uint8')))
    cx = Image.fromarray(((np.asarray(out)[..., 3] > 40) * 255).astype('uint8')).getbbox()
    return out.crop(cx)

if __name__ == '__main__':
    saida, prompt = sys.argv[1], sys.argv[2]
    tam = int(sys.argv[sys.argv.index('--tamanho') + 1]) if '--tamanho' in sys.argv else 220
    bruto = sys.argv[sys.argv.index('--bruto') + 1] if '--bruto' in sys.argv else None
    import io
    arq = os.path.join(bruto, os.path.basename(saida).rsplit('.', 1)[0] + '.jpg') if bruto else None
    if '--so-recortar' in sys.argv: dados = open(arq, 'rb').read()   # refaz o recorte do bruto já salvo, sem gastar créditos
    else:
        dados = gerar(prompt)
        if arq: os.makedirs(bruto, exist_ok=True); open(arq, 'wb').write(dados)
    fig = recortar(Image.open(io.BytesIO(dados)), furos='--furos' in sys.argv, macico='--macico' in sys.argv)
    fig.thumbnail((tam - 12, tam - 12), Image.LANCZOS)
    tela = Image.new('RGBA', (tam, tam), (0, 0, 0, 0)); tela.alpha_composite(fig, ((tam - fig.width) // 2, (tam - fig.height) // 2))
    tela.save(saida, quality=92); print('ok', saida)
