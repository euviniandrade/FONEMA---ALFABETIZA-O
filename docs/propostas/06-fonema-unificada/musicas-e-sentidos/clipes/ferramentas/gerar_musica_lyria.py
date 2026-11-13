import json,urllib.request,base64,sys
P="""Upbeat, catchy Brazilian kids pop song for a phonics show, 112 BPM, ukulele, handclaps, light drums. Duet in Brazilian Portuguese, young female and male pop singers, very clear diction, each vowel sung long and clean after a short pause.
Lyrics:
Ei! Vem com a gente! Mão pra cima!
A de asa... aaaa!
É de eco... éééé!
I de ilha... iiii!
Ô de ovo... ôôôô!
U de uva, biquinho pra frente... uuuu!
A, É, I, Ô, U! Cinco vogais pra cantar com você!
Bate palma, gira e pula, A, É, I, Ô, U!"""
body={"contents":[{"parts":[{"text":P}]}]}
r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/lyria-3-clip-preview:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"placeholder"})
try:
  d=json.loads(urllib.request.urlopen(r,timeout=300).read())
except urllib.error.HTTPError as e:
  print("ERR",e.code,e.read()[:300]); sys.exit()
for p in d["candidates"][0]["content"]["parts"]:
  if "inlineData" in p:
    ext={"audio/mpeg":"mp3","audio/wav":"wav"}.get(p["inlineData"]["mimeType"],"bin")
    fn=sys.argv[1]+"."+ext; open(fn,"wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok",fn,p["inlineData"]["mimeType"])
  elif "text" in p: print("txt",p["text"][:200])
