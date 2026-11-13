import json,urllib.request,base64,sys,time
H={"Content-Type":"application/json","x-goog-api-key":"placeholder"}
def req(url,body=None):
  r=urllib.request.Request(url,data=json.dumps(body).encode() if body else None,headers=H)
  return json.loads(urllib.request.urlopen(r,timeout=120).read())
img,out,prompt=sys.argv[1],sys.argv[2],sys.argv[3]
b=base64.b64encode(open(img,'rb').read()).decode()
mt="image/png" if img.endswith(".png") else "image/jpeg"
d=req("https://generativelanguage.googleapis.com/v1beta/interactions",{"model":"gemini-omni-1.2-flash","input":[{"type":"image","data":b,"mime_type":mt},{"type":"text","text":prompt}],"response_modalities":["video"],"background":True})
iid=d["id"]
for i in range(60):
  time.sleep(10); d=req(f"https://generativelanguage.googleapis.com/v1beta/interactions/{iid}")
  if d.get("status")!="in_progress": break
print(d.get("status"))
for s in d.get("steps",[]):
  if s.get("type")=="model_output":
    for c in s["content"]:
      if c.get("type")=="video": open(out,"wb").write(base64.b64decode(c["data"])); print("ok",out)
      elif c.get("type")=="text": print("txt",c["text"][:200])
