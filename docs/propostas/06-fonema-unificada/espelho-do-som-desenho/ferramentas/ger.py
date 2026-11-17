#!/usr/bin/env python3
"""ger.py lote.json pasta  — lote: [{id, boca, n}] ; gera em paralelo com referencia da Sofia."""
import base64, json, sys, os, urllib.request, concurrent.futures as cf
lote = json.load(open(sys.argv[1])); pasta = sys.argv[2]; os.makedirs(pasta, exist_ok=True); ref = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), 'ref-sofia.jpg')
B = 'data:image/jpeg;base64,' + base64.b64encode(open(ref, 'rb').read()).decode()
MOLDE = ("{boca} Extreme close-up of the face of the same little girl from the reference image, stylized 3D animated family film character, "
         "big brown eyes, warm brown skin, dark curly hair, front view, looking straight at the camera, head straight and centered, "
         "the face fills the frame from the eyebrows to the chin, soft even studio lighting, plain soft pale blue background, "
         "speech therapy mouth position illustration, no jewelry, no earrings, no hands, no fingers, no text, no letters")
def um(item):
    pr = MOLDE.format(boca=item['boca'])
    req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
        headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
        data=json.dumps({'model': 'image-01', 'prompt': pr[:1500], 'aspect_ratio': '1:1', 'response_format': 'base64', 'n': item.get('n', 2),
                         'subject_reference': [{'type': 'character', 'image_file': B}]}).encode())
    for t in range(3):
        try: d = json.load(urllib.request.urlopen(req, timeout=300))
        except Exception as e: d = {'base_resp': {'status_msg': str(e)}}
        if d.get('base_resp', {}).get('status_code') == 0: break
    else: return f"{item['id']}: {d.get('base_resp')}"
    out = []
    for k, b in enumerate(d['data']['image_base64']):
        f = os.path.join(pasta, f"{item['id']}-{item.get('tag','v')}{k+1}.jpg"); open(f, 'wb').write(base64.b64decode(b)); out.append(f)
    return f"{item['id']}: {len(out)} ok"
with cf.ThreadPoolExecutor(6) as ex:
    for r in ex.map(um, lote): print(r, flush=True)
