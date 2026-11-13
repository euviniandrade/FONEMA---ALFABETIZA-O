import json,urllib.request,base64,sys
out,ar,prompt=sys.argv[1],sys.argv[2],sys.argv[3]; refs=sys.argv[4:]
parts=[{"inlineData":{"mimeType":"image/png","data":base64.b64encode(open(r,'rb').read()).decode()}} for r in refs]+[{"text":prompt}]
body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":ar,"imageSize":"2K"}}}
r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"placeholder"})
try: d=json.loads(urllib.request.urlopen(r,timeout=400).read())
except urllib.error.HTTPError as e: print("ERR",out,e.code,e.read()[:300]); sys.exit()
for p in d["candidates"][0]["content"]["parts"]:
  if "inlineData" in p: open(out,"wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok",out)
