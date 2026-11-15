#!/usr/bin/env python3
"""Mesma personagem em outra pose de boca (MiniMax image-01 com referência de personagem). Uso: gref.py ref.jpg saida.jpg "prompt" [4:3]"""
import base64, json, sys, urllib.request
ref, out, prompt = sys.argv[1], sys.argv[2], sys.argv[3]; ar = sys.argv[4] if len(sys.argv) > 4 else '4:3'
b = 'data:image/jpeg;base64,' + base64.b64encode(open(ref, 'rb').read()).decode()
req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
    headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
    data=json.dumps({'model': 'image-01', 'prompt': prompt, 'aspect_ratio': ar, 'response_format': 'base64', 'n': 1,
                     'subject_reference': [{'type': 'character', 'image_file': b}]}).encode())
d = json.load(urllib.request.urlopen(req, timeout=240))
if d.get('base_resp', {}).get('status_code') != 0: sys.exit(str(d.get('base_resp')))
open(out, 'wb').write(base64.b64decode(d['data']['image_base64'][0])); print('ok', out)
