#!/usr/bin/env python3
"""
Converte as artes existentes do projeto (docs/propostas/06-fonema-unificada) em WebP leves para o app
(app/web/public/assets), para o PWA funcionar offline sem baixar PNGs de 3 MB.
Nenhuma imagem é gerada por IA aqui: só redimensiona e converte o que já existe.

Uso (a partir de app/):  npm run assets      (precisa de Python 3 + Pillow)
"""
from pathlib import Path
import shutil
from PIL import Image

RAIZ = Path(__file__).resolve().parents[3]
DOCS = RAIZ / 'docs/propostas/06-fonema-unificada'
SAIDA = Path(__file__).resolve().parents[1] / 'public/assets'

FUNDOS = {
    # D025: os fundos low-poly antigos (vila, quintal, ilha, mata, mar, sala…) saíram; as telas usam as cenas 3D
    # de public/assets/cenas (série Sofia e Tales) e as artes-chave de public/assets/arte.
    'serie-palmas': 'serie-sofia-e-tales/imagens/P1-03-palmas-silabas-portao.png',
    'serie-eco': 'serie-sofia-e-tales/imagens/P1-04-eco-das-vogais-praia.png',
    'serie-bolota': 'serie-sofia-e-tales/imagens/P1-07-ensinando-o-bolota.png',
    'serie-licao': 'serie-sofia-e-tales/imagens/P1-08-tela-de-licao-fundo-limpo.png',
    'serie-garganta': 'serie-sofia-e-tales/imagens/P1-05-som-vibra-garganta-mata.png',
    'dupla-praca': 'personagens-3d/06-leitura-juntos-praca.png',
    'raio-x-partes': 'espelho-do-som-3d/imagens/raio-x-boca-partes.png',
}

RECORTES = {}
PECAS = DOCS / 'avatar-3d/pecas'
for f in sorted(PECAS.glob('crianca-*.png')):
    RECORTES['avatar/' + f.stem] = (f, 520)
for f in sorted(PECAS.glob('*-busto-*.png')):
    RECORTES['dupla/' + f.stem] = (f, 360)
RECORTES['dupla/dupla-corpo'] = (PECAS / 'dupla-sofia-tales-corpo.png', 700)
for f in sorted(PECAS.glob('utensilio-a-tile-*.png')):
    RECORTES['itens/' + f.stem.replace('utensilio-a-tile-', '')] = (f, 220)
for nome in ['cofrinho-tatu', 'moeda', 'moeda-voando', 'moedas-pilha', 'bau-livros']:
    RECORTES['recompensas/' + nome] = (DOCS / f'recompensas-3d/recortes/{nome}.png', 360)
for f in sorted((DOCS / 'espelho-do-som-3d/recortes').glob('sofia-*.png')):
    RECORTES['espelho/' + f.stem] = (f, 520)


def salvar(img: Image.Image, destino: Path, largura: int, qualidade: int) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    if img.width > largura:
        img = img.resize((largura, round(img.height * largura / img.width)), Image.LANCZOS)
    img.save(destino, 'WEBP', quality=qualidade, method=6)


def main() -> None:
    total = 0
    for nome, rel in FUNDOS.items():
        src = DOCS / rel
        if not src.exists():
            print('  (faltou)', rel)
            continue
        salvar(Image.open(src).convert('RGB'), SAIDA / f'fundos/{nome}.webp', 1600, 76)
        total += 1
    for nome, (src, larg) in RECORTES.items():
        if not src.exists():
            print('  (faltou)', src)
            continue
        im = Image.open(src).convert('RGBA')
        # largura máxima pelo lado maior (recortes altos, como o avatar de corpo inteiro)
        escala = min(1.0, larg / max(im.width, im.height))
        salvar(im, SAIDA / f'{nome}.webp', max(1, round(im.width * escala)), 82)
        total += 1
    # áudios reais das vozes oficiais e músicas (quando existirem)
    for rel, nome in [('voz/dupla/sofia-e-tales-ilha-das-vogais.mp3', 'audio/dupla-ilha-das-vogais.mp3'),
                      ('voz/musicas/01-vogais-AEIOU-demo.mp3', 'audio/musica-vogais.mp3')]:
        src = DOCS / rel
        if src.exists():
            (SAIDA / nome).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(src, SAIDA / nome)
            total += 1
    # fontes (Andika para leitura, Fredoka para títulos, Atkinson para o adulto)
    for f in (DOCS / 'lojinha-emblemas/fontes/fonts').glob('*latin-[4-7]00-normal.woff2'):
        (SAIDA / 'fontes').mkdir(parents=True, exist_ok=True)
        shutil.copy(f, SAIDA / 'fontes' / f.name)
        total += 1
    tamanho = sum(p.stat().st_size for p in SAIDA.rglob('*') if p.is_file())
    print(f'{total} arquivos em {SAIDA} ({tamanho / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
