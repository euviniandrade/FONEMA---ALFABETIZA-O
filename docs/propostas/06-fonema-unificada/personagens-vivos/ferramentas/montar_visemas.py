#!/usr/bin/env python3
"""
Monta o BUSTO QUE FALA a partir dos rostos por som do Espelho do Som (espelho-do-som-3d/recortes/rosto-*.jpg).

Cada rosto veio de uma geração diferente, então a cabeça não está no mesmo lugar. O script:
  1. alinha cada rosto ao rosto-base (boca fechada, "M") procurando o melhor deslocamento/escala na faixa dos olhos;
  2. recorta SÓ a região da boca e do queixo com máscara de borda suave e acerta a cor da pele pela borda;
  3. salva: base.webp (busto), boca-<visema>.webp (camada transparente só com a boca), pisca.webp
     (pálpebras pintadas sobre os olhos) — tudo no mesmo quadro, pronto para empilhar no app.

  python3 montar_visemas.py <pasta recortes> <pasta de saída assets/vivos/busto>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

REC, SAIDA = sys.argv[1], sys.argv[2]
T = 360  # lado do busto final

# medidas em pixels do rosto-base (M) de cada personagem
P = {
    'sofia': dict(visemas={'a': 'A', 'e': 'E', 'o': 'O', 'f': 'F', 'l': 'L', 's': 'S', 'u': 'CH'},
                  quadro=(203, 12, 503, 312), olhos=((310, 165), (390, 165)), rolho=(23, 18), boca=(353, 222), rboca=(60, 44),
                  faixa=(270, 120, 436, 205)),
    'tales': dict(visemas={'a': 'A', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U'},
                  quadro=(12, 26, 332, 346), olhos=((130, 190), (215, 190)), rolho=(29, 22), boca=(172, 250), rboca=(72, 50),
                  faixa=(85, 140, 262, 235)),
}

def alinhar(base, img, faixa):
    """melhor (escala, dx, dy) para a faixa dos olhos de img coincidir com a de base."""
    x0, y0, x1, y1 = faixa
    alvo = np.asarray(base.crop(faixa).convert('L').filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    melhor = (1e9, 1.0, 0, 0)
    for s in np.arange(0.90, 1.101, 0.02):
        g = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS).convert('L').filter(ImageFilter.GaussianBlur(1.2))
        a = np.asarray(g).astype(np.float32)
        for dy in range(-26, 27, 2):
            for dx in range(-26, 27, 2):
                # ponto (x,y) da base corresponde a (x*s+dx, y*s+dy) em g
                X0, Y0 = round(x0 * s) + dx, round(y0 * s) + dy
                if X0 < 0 or Y0 < 0 or Y0 + alvo.shape[0] > a.shape[0] or X0 + alvo.shape[1] > a.shape[1]: continue
                d = np.abs(a[Y0:Y0 + alvo.shape[0], X0:X0 + alvo.shape[1]] - alvo).mean()
                if d < melhor[0]: melhor = (d, s, X0 - x0, Y0 - y0)
    return melhor

def mascara(tam, centro, raios, pena):
    m = Image.new('L', tam, 0)
    ImageDraw.Draw(m).ellipse([centro[0] - raios[0], centro[1] - raios[1], centro[0] + raios[0], centro[1] + raios[1]], fill=255)
    return m.filter(ImageFilter.GaussianBlur(pena))

for quem, p in P.items():
    base = Image.open(f'{REC}/rosto-{quem}-M.jpg').convert('RGB')
    q = p['quadro']
    def final(im): return im.crop(q).resize((T, T), Image.LANCZOS)
    final(base).save(f'{SAIDA}/{quem}-base.webp', quality=88, method=6)
    bx, by = p['boca']; rx, ry = p['rboca']
    m = mascara(base.size, (bx, by + 6), (rx, ry), 7)
    anel = np.asarray(mascara(base.size, (bx, by + 6), (rx + 8, ry + 8), 3)).astype(np.float32) / 255 - np.asarray(mascara(base.size, (bx, by + 6), (rx - 4, ry - 4), 3)).astype(np.float32) / 255
    anel = np.clip(anel, 0, 1)[..., None]
    nb = np.asarray(base).astype(np.float32)
    for v, arq in p['visemas'].items():
        img = Image.open(f'{REC}/rosto-{quem}-{arq}.jpg').convert('RGB')
        d, s, dx, dy = alinhar(base, img, p['faixa'])
        g = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
        al = Image.new('RGB', base.size, (200, 225, 250)); al.paste(g, (-dx, -dy))
        na = np.asarray(al).astype(np.float32)
        # acerta a cor pela borda da máscara (pele em volta da boca)
        dif = ((nb - na) * anel).sum((0, 1)) / anel.sum()
        na = np.clip(na + dif, 0, 255).astype(np.uint8)
        camada = Image.fromarray(na).convert('RGBA'); camada.putalpha(m)
        final(camada).save(f'{SAIDA}/{quem}-boca-{v}.webp', quality=88, method=6)
        print(quem, v, 'dif', round(d, 2), 'escala', round(s, 2), 'desloc', dx, dy)
    # piscada: pálpebra pintada (cor da pele entre os olhos, com degradê) + linha dos cílios
    K = 4
    cam = Image.new('RGBA', (base.width * K, base.height * K), (0, 0, 0, 0)); d = ImageDraw.Draw(cam)
    ex, ey = p['rolho']
    (xa, ya), (xb, yb) = p['olhos']
    pele = nb[ya - 4:ya + 4, (xa + xb) // 2 - 5:(xa + xb) // 2 + 5].reshape(-1, 3).mean(0)
    for (cx, cy) in p['olhos']:
        for k in range(12):  # degradê: mais claro em cima, mais escuro perto dos cílios
            t = k / 11; cor = tuple(int(c * (1.04 - 0.14 * t)) for c in pele)
            y0 = cy - ey + (2 * ey) * t * 0.9
            d.chord([(cx - ex) * K, (cy - ey) * K, (cx + ex) * K, (cy + ey) * K], 0, 360, fill=cor + (255,)) if k == 0 else d.rectangle([(cx - ex) * K, y0 * K, (cx + ex) * K, (cy + ey) * K], fill=cor + (255,))
        d.arc([(cx - ex + 1) * K, (cy - ey + 4) * K, (cx + ex - 1) * K, (cy + ey - 1) * K], 12, 168, fill=(45, 28, 22, 255), width=3 * K)
    # recorta o degradê no formato do olho
    forma = Image.new('L', cam.size, 0); df = ImageDraw.Draw(forma)
    for (cx, cy) in p['olhos']: df.ellipse([(cx - ex) * K, (cy - ey) * K, (cx + ex) * K, (cy + ey + 1) * K], fill=255)
    cam.putalpha(Image.fromarray(np.minimum(np.asarray(cam.getchannel('A')), np.asarray(forma))))
    cam = cam.resize(base.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.1))
    final(cam).save(f'{SAIDA}/{quem}-pisca.webp', quality=90, method=6)
print('ok')
