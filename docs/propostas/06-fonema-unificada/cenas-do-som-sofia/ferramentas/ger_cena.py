#!/usr/bin/env python3
"""ger_cena.py lote.json pasta ref.jpg — cenas do som com a Sofia (MiniMax image-01 + subject_reference)."""
import base64, json, sys, os, urllib.request, concurrent.futures as cf
lote = json.load(open(sys.argv[1])); pasta = sys.argv[2]; os.makedirs(pasta, exist_ok=True)
B = 'data:image/jpeg;base64,' + base64.b64encode(open(sys.argv[3], 'rb').read()).decode()
MOLDE = ("{acao} {plano} {quem} stylized 3D animated family film character, curly dark hair, "
         "white t-shirt with navy blue raglan sleeves and a small navy blue capital letter A embroidered on the left side of the chest, navy pants. Plain light cream background. " if os.environ.get("COMA") else "plain white t-shirt with navy blue sleeves, navy pants. Plain light cream background. "
         "Bare arms and bare wrists. Clean simple clothes.")
def um(item):
    pr = MOLDE.format(acao=item['acao'], plano=item.get('plano', 'Medium shot from the knees up.'), quem=('A 6 year old girl with warm medium-brown skin, round cheeks, big round brown eyes, very long voluminous dark brown spiral curly hair falling past her shoulders,' if os.environ.get('SEMREF') else 'The girl from the reference image,'))
    req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
        headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
        data=json.dumps({'model': 'image-01', 'prompt': pr[:1500], 'aspect_ratio': '1:1', 'response_format': 'base64', 'n': item.get('n', 2),
                         **({} if os.environ.get('SEMREF') else {'subject_reference': [{'type': 'character', 'image_file': B}]})}).encode())
    for t in range(3):
        try: d = json.load(urllib.request.urlopen(req, timeout=300))
        except Exception as e: d = {'base_resp': {'status_msg': str(e)}}
        if d.get("base_resp", {}).get("status_code") == 0: break
        __import__("time").sleep(20)
    else: return f"{item['id']}: {d.get('base_resp')}"
    out = []
    for k, b in enumerate(d['data']['image_base64']):
        f = os.path.join(pasta, f"{item['id']}-{item.get('tag','v')}{k+1}.jpg"); open(f, 'wb').write(base64.b64decode(b)); out.append(f)
    return f"{item['id']}: {len(out)} ok"
with cf.ThreadPoolExecutor(int(os.environ.get("PAR","6"))) as ex:
    for r in ex.map(um, lote): print(r, flush=True)
