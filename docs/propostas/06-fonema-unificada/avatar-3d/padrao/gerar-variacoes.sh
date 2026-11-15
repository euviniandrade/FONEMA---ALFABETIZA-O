#!/bin/bash
# Variações de cabelo do boneco padrão (mesmo personagem, mesma roupa branca com o A azul), pela MiniMax com referência de personagem.
cd "$(dirname "$0")"; G=../../espelho-do-som-conceitos/gref.py
ST="Same character, same face, same round dark eyes, same ALL-WHITE outfit (white t-shirt with a small navy-blue letter A on the chest, white pants, white sneakers), same relaxed A-pose facing the camera, full body from head to shoes, no jewelry, no earrings, high-end 3D animated family feature film render, Pixar-like quality, soft even studio lighting, plain flat light grey background, no text other than the letter A"
v(){ [ -f variacoes/$2.jpg ] && return; for t in 1 2 3; do python3 $G $1-padrao.jpg variacoes/$2.jpg "The $3 character, but ONLY the hairstyle is changed: $4. $ST" 3:4 2>/dev/null | tail -1 && [ -f variacoes/$2.jpg ] && break; done; }
v menina menina-cacheado girl "long voluminous dark curly hair falling past the shoulders"
v menina menina-trancas girl "dark hair in two long braids resting on the shoulders"
v menina menina-coque girl "dark hair pulled up into a neat high bun"
v menina menina-rabo girl "dark brown hair in a high ponytail"
v menina menina-black girl "a big round natural afro hairstyle"
v menino menino-crespo boy "very short tight coily black hair, close cropped"
v menino menino-cacheado boy "medium-length loose dark curls on top"
v menino menino-franja boy "straight dark hair with a fringe covering the forehead"
v menino menino-topete boy "short hair with a tall swept-up quiff"
v menino menino-black boy "a round medium natural afro hairstyle"
python3 - <<'P'
from PIL import Image; import glob
fs=sorted(glob.glob('variacoes/*.jpg')); ims=[Image.open(f).resize((288,384)) for f in fs]
sh=Image.new('RGB',(288*5,384*2),'white')
for i,im in enumerate(ims): sh.paste(im,((i%5)*288,(i//5)*384))
sh.save('01-variacoes-cabelo.jpg'); print(len(fs),'variações')
P
