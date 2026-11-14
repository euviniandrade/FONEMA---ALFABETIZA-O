#!/usr/bin/env python3
"""Conceitos do Espelho do Som pela MiniMax (image-01). Uso: g.py saida.jpg "prompt" [16:9]"""
import base64, json, sys, urllib.request
out, prompt = sys.argv[1], sys.argv[2]; ar = sys.argv[3] if len(sys.argv) > 3 else '1:1'
req = urllib.request.Request('https://api.minimax.io/v1/image_generation', method='POST',
    headers={'Authorization': 'Bearer proxy-injected', 'Content-Type': 'application/json'},
    data=json.dumps({'model': 'image-01', 'prompt': prompt, 'aspect_ratio': ar, 'response_format': 'base64', 'n': 1}).encode())
d = json.load(urllib.request.urlopen(req, timeout=240))
if d.get('base_resp', {}).get('status_code') != 0: sys.exit(str(d.get('base_resp')))
open(out, 'wb').write(base64.b64decode(d['data']['image_base64'][0])); print('ok', out)
