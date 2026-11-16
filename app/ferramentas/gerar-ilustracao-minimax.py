#!/usr/bin/env python3
"""Gera ILUSTRAÇÕES DE HISTÓRIA (cena inteira, com fundo) pela API da MiniMax (modelo image-01).
Irmã de gerar-figura-minimax.py (que recorta objetos soltos). A chave é injetada pelo proxy do ambiente (nunca em código).
Uso:
  gerar-ilustracao-minimax.py <saida.webp> "<descrição da cena em inglês>" [--largura 1200] [--bruto pasta] [--so-converter]
O estilo (filme de animação 3D, D025) é acrescentado aqui, para todas as páginas saírem no mesmo padrão.
Sem texto, sem letras, sem arco-íris (D009).
ATENÇÃO (16/11): este gerador NÃO mantém o personagem de uma página para outra, e o subject_reference da MiniMax (tipo
"character") não segurou a cara do Bolota (testado: saiu outro bicho, e com arco-íris). Páginas com o Bolota: Higgsfield,
generate_image com o modelo nano_banana_2 e a imagem de referência ferramentas/referencia-bolota.jpg (1,5 crédito por imagem);
as 6 páginas de "O Bolota e a chuva" foram refeitas assim."""
import base64, io, json, os, sys, urllib.request
from PIL import Image

ESTILO = (", stylized 3D animated family feature film still, soft rounded shapes, warm cinematic lighting, gentle depth of field, "
          "cheerful but natural colors, child-friendly, clean composition with the main character large and clearly visible, "
          "no text, no letters, no words, no captions, no rainbow")


def gerar(prompt):
    req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
        headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
        data=json.dumps({'model': 'image-01', 'prompt': prompt + ESTILO, 'aspect_ratio': '4:3', 'response_format': 'base64', 'n': 1}).encode())
    d = json.load(urllib.request.urlopen(req, timeout=300))
    if d.get('base_resp', {}).get('status_code') != 0:
        sys.exit(f"MiniMax: {d.get('base_resp')}")
    return base64.b64decode(d['data']['image_base64'][0])


if __name__ == '__main__':
    saida, prompt = sys.argv[1], sys.argv[2]
    larg = int(sys.argv[sys.argv.index('--largura') + 1]) if '--largura' in sys.argv else 1200
    bruto = sys.argv[sys.argv.index('--bruto') + 1] if '--bruto' in sys.argv else None
    arq = os.path.join(bruto, os.path.basename(saida).rsplit('.', 1)[0] + '.jpg') if bruto else None
    if '--so-converter' in sys.argv:
        dados = open(arq, 'rb').read()
    else:
        dados = gerar(prompt)
        if arq:
            os.makedirs(bruto, exist_ok=True)
            open(arq, 'wb').write(dados)
    im = Image.open(io.BytesIO(dados)).convert('RGB')
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(saida) or '.', exist_ok=True)
    im.save(saida, quality=84, method=6)
    print('ok', saida, im.size)
