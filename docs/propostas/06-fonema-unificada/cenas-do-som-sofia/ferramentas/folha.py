import sys,glob
from PIL import Image, ImageDraw
fs=sys.argv[2:]; out=sys.argv[1]; W=4; T=460
c=Image.new('RGB',(W*T,((len(fs)+W-1)//W)*(T+20)),(255,255,255)); d=ImageDraw.Draw(c)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB'); im.thumbnail((T-6,T-6)); x=(i%W)*T; y=(i//W)*(T+20)
  c.paste(im,(x+3,y+3)); d.text((x+5,y+T),f.split('/')[-1],fill=(0,0,0))
c.save(out,quality=85)
