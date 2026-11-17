"""Pinta bocas-guia (rascunho) sobre o rosto da Sofia sem boca, para a MiniMax renderizar no estilo."""
import sys, os
from PIL import Image, ImageDraw, ImageFilter
K = 4
base = Image.open('ref-semboca.jpg').convert('RGB')
LAB, LABE, ESC, DEN, LIN, LINE = (205, 100, 95), (175, 75, 70), (70, 25, 30), (250, 246, 240), (225, 110, 120), (190, 80, 95)
def E(d, box, cor): d.ellipse([v*K for v in box], fill=cor)
def R(d, box, r, cor): d.rounded_rectangle([v*K for v in box], radius=r*K, fill=cor)
def P(d, pts, cor): d.polygon([(x*K, y*K) for x, y in pts], fill=cor)
def boca(nome):
    big = Image.new('RGBA', (base.width*K, base.height*K), (0, 0, 0, 0)); d = ImageDraw.Draw(big)
    cx = 395
    if nome == 'f':
        E(d, (322, 500, 468, 552), LAB)            # lábio de baixo (empurrado para cima)
        E(d, (322, 478, 468, 512), LABE)           # lábio de cima
        R(d, (348, 494, 442, 520), 7, DEN)         # dentes de cima pousados no lábio de baixo
        d.line([(cx*K, 495*K), (cx*K, 519*K)], fill=(215, 205, 200), width=K*2)
    elif nome in ('l', 't', 'r'):
        top, bot = {'l': (472, 585), 't': (490, 552), 'r': (482, 565)}[nome]
        E(d, (318, top-14, 472, bot+16), LAB)     # lábios
        E(d, (332, top, 458, bot), ESC)            # boca aberta
        R(d, (350, top+2, 440, top+20), 6, DEN)    # dentes de cima
        # língua: corpo embaixo + ponta subindo até atrás dos dentes de cima
        E(d, (340, bot-38, 450, bot+4), LIN)
        P(d, [(366, bot-20), (378, top+20), (395, top+16), (412, top+20), (424, bot-20)], LIN)
        E(d, (377, top+14, 413, top+34), LIN)
        d.line([(cx*K, (top+40)*K), (cx*K, (bot-10)*K)], fill=LINE, width=K*3)
    elif nome == 'k':
        E(d, (328, 474, 462, 572), LAB); E(d, (342, 484, 448, 560), ESC)
        R(d, (356, 486, 434, 502), 6, DEN)
        E(d, (356, 538, 434, 568), LINE)           # língua recuada, só o fundo
    elif nome == 'x':
        E(d, (340, 478, 450, 560), LAB); E(d, (346, 482, 444, 556), LABE)
        R(d, (368, 502, 422, 536), 10, ESC)
        R(d, (372, 505, 418, 533), 8, DEN); d.line([(372*K, 519*K), (418*K, 519*K)], fill=(190, 180, 175), width=K*2)
    elif nome in ('i', 's'):
        w = 88 if nome == 'i' else 70
        P(d, [(cx-w-8, 512), (cx, 490), (cx+w+8, 512), (cx, 548)], LAB)
        E(d, (cx-w, 498, cx+w, 532), ESC)
        R(d, (cx-w+14, 499, cx+w-14, 531), 8, DEN); d.line([((cx-w+14)*K, 515*K), ((cx+w-14)*K, 515*K)], fill=(150, 120, 115), width=K*2)
    elif nome == 'e':
        E(d, (318, 482, 472, 552), LAB); E(d, (330, 490, 460, 542), ESC)
        R(d, (346, 491, 444, 506), 6, DEN); R(d, (356, 528, 434, 541), 6, DEN)
        E(d, (350, 516, 440, 540), LIN)
    return big.resize(base.size, Image.LANCZOS)
os.makedirs('guias', exist_ok=True)
for n in sys.argv[1:]:
    b = boca(n); im = base.copy(); im.paste(b, (0, 0), b.filter(ImageFilter.GaussianBlur(0.6)))
    im.save(f'guias/ref-{n}.jpg', quality=93)
