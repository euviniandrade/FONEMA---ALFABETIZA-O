"""Monta os HTML das telas 01–03 a partir de pedaços comuns (topo, palco 3D, guia, rodapé)."""
import os
AQUI = os.path.dirname(os.path.abspath(__file__))
P = '../../pecas/'

def topo(passo):
    nomes = ['Rosto e pele', 'Cabelo', 'Roupa', 'Pronto!']
    ps = ''
    for i, n in enumerate(nomes, 1):
        cls = 'feito' if i < passo else ('agora' if i == passo else '')
        ic = '<span data-ic="ok" style="display:flex;width:20px;height:20px"></span>' if i < passo else str(i)
        ps += f'<div class="passo {cls}"><i>{ic}</i>{n}</div>'
    return f'''<div class="topo">
  <div class="circ" style="color:var(--marinho)"><span data-ic="voltar" style="display:flex"></span></div>
  <div class="titulo">Crie seu personagem</div>
  <div class="passos">{ps}</div>
  <div class="moedas"><span class="moeda"></span>17</div>
  <div class="audio" style="color:#fff"><span data-ic="som" style="display:flex"></span></div>
</div>'''

ARCO = '''<svg class="girar" viewBox="0 0 400 130">
  <defs><marker id="pe" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#284A86"/></marker></defs>
  <path d="M60 70 A150 42 0 0 0 340 70" fill="none" stroke="#284A86" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 12" marker-start="url(#pe)" marker-end="url(#pe)"/>
</svg>'''

def palco(avatar, nome='LÉO', extra=''):
    return f'''<div class="palco">
  <div class="chip360"><span data-ic="girad" style="display:flex;width:20px;height:20px"></span>Gira 360°</div>
  <div class="nomeav">{nome}</div>
  <div class="disco"></div>{ARCO}<div class="sombra"></div>
  <img class="avatar" src="{P}{avatar}">{extra}
  <div class="rot e" style="color:var(--marinho2)"><span data-ic="girae" style="display:flex"></span></div>
  <div class="rot d" style="color:var(--marinho2)"><span data-ic="girad" style="display:flex"></span></div>
  <div class="dica"><span data-ic="mao" style="display:inline-flex;width:22px;height:22px;vertical-align:-4px;color:var(--marinho2)"></span> Arraste com o dedo para girar</div>
</div>'''

def guia(texto, sofia='alegre', tales='alegre', top=20, left=22, largura=560):
    return f'''<div class="guia" style="left:{left}px;top:{top}px">
  <div class="busto"><img src="{P}sofia-busto-{sofia}.png"></div><div class="busto tales"><img src="{P}tales-busto-{tales}.png"></div>
  <div class="balao" style="width:{largura}px">{texto}<span class="mini-som" style="color:var(--azul)"><span data-ic="som" style="display:flex"></span></span></div>
</div>'''

def rodape(prox='Próximo', nota=''):
    return f'''<div class="rodape">
  <div class="btn papel" style="width:440px"><span data-ic="voltar" style="display:flex"></span>Voltar</div>
  <div class="regra" style="flex:1;margin-left:10px">{nota}</div>
  <div class="btn ipe" style="width:300px">{prox}<span data-ic="seguir" style="display:flex"></span></div>
</div>'''

def pagina(titulo, corpo, css=''):
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<link rel="stylesheet" href="comum.css"><style>{css}</style></head><body>
{corpo}
<script src="icones.js"></script></body></html>'''

def escrever(nome, html):
    open(os.path.join(AQUI, nome), 'w').write(html); print('ok', nome)

ESCUDO = '<span data-ic="escudo" style="display:inline-flex;width:22px;height:22px;color:var(--folha)"></span>'

# ---------------- TELA 1: rosto e pele ----------------
css1 = '''
.sec{font-family:Fredoka;font-weight:700;font-size:22px;color:var(--marinho);display:flex;align-items:center;gap:12px}
.grade{display:grid;grid-template-columns:repeat(5,128px);gap:16px 18px;margin-top:12px}
.op{width:128px;height:132px;border-radius:26px;background:linear-gradient(180deg,#F2F8FE,#DCEDFA);border:3px solid #E1EDF8;position:relative;box-shadow:0 4px 0 #CFE0EF}
.op .im{position:absolute;inset:0;border-radius:23px;overflow:hidden}
.op img{position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:118px;max-width:124px;object-fit:contain;object-position:bottom}
.op.sel{border-color:var(--ipe);background:linear-gradient(180deg,#FFF6DA,#FFE6A8);box-shadow:0 4px 0 #E5B54F,0 0 0 5px rgba(244,183,60,.25)}
.op.mais{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Fredoka;font-weight:600;font-size:18px;color:var(--marinho2);background:#fff;border-style:dashed;border-color:#B9D2EE}
.op.mais b{font-size:40px;line-height:1}
.peles{display:flex;gap:16px;margin-top:12px;align-items:center}
.pele{width:62px;height:62px;border-radius:50%;border:4px solid #fff;box-shadow:0 0 0 2px #D5E3F0,0 4px 0 #C4D6E8;position:relative}
.pele.sel{box-shadow:0 0 0 4px var(--ipe),0 4px 0 #C98A12}
.privacidade{position:absolute;left:22px;right:22px;bottom:18px;background:var(--folha-claro);border:2px solid #A9D7B6;border-radius:18px;padding:10px 16px;display:flex;gap:10px;align-items:center;font-family:Atkinson;font-size:15px;color:#1E5A36}
'''
rostos = ['rosto-01-avatar-exemplo', 'rosto-02', 'rosto-03', 'rosto-04', 'rosto-05', 'rosto-06', 'rosto-07', 'rosto-08', 'rosto-09-oculos-aparelho']
cards = ''
for i, r in enumerate(rostos):
    sel = ' sel' if i == 0 else ''
    ok = '<div class="ok" data-ic="ok"></div>' if i == 0 else ''
    cards += f'<div class="op{sel}"><div class="im"><img src="{P}{r}.png"></div>{ok}</div>'
cards += '<div class="op mais"><b>+</b>mais rostos</div>'
peles = ['#F7D9C4', '#EFC09A', '#DDA27A', '#C68457', '#A86A43', '#8A5132', '#6B3B22', '#4E2A18']
sw = ''.join(f'<div class="pele{" sel" if c == "#A86A43" else ""}" style="background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.45),rgba(255,255,255,0) 45%),{c}">{"<div class=ok data-ic=ok style=right:-10px;top:-10px;width:30px;height:30px></div>" if c == "#A86A43" else ""}</div>' for c in peles)
corpo1 = topo(1) + palco('roupa-01-uniforme.png') + f'''
<div class="painel">
  {guia('Escolha um <b>rosto</b> e a <b>cor da pele</b>. Pode ser parecido com você, ou do jeito que quiser!', 'alegre', 'alegre', 18, 22, 560)}
  <div style="position:absolute;left:22px;top:124px;right:22px">
    <div class="sec">Rosto <span class="selo gratis">Todos grátis</span></div>
    <div class="grade">{cards}</div>
    <div class="sec" style="margin-top:20px">Cor da pele <span class="ad" style="font-weight:400;font-size:15px;color:var(--cinza)">funciona com qualquer rosto</span></div>
    <div class="peles">{sw}</div>
  </div>
</div>''' + rodape('Próximo', ESCUDO + '<span><b>Sem foto.</b> O personagem é montado com peças<br>e não mostra o rosto real da criança.</span>')
escrever('01-criar-avatar-pele-rosto.html', pagina('Passo 1: rosto e pele', corpo1, css1))

# ---------------- TELA 2: cabelo ----------------
css2 = css1 + '''
.filtros{display:flex;gap:8px;margin-top:12px}
.filtro{height:44px;padding:0 13px;border-radius:999px;background:#fff;border:2px solid var(--linha);font-family:Fredoka;font-weight:600;font-size:18px;color:var(--marinho2);display:flex;align-items:center}
.filtro.sel{background:var(--marinho);border-color:var(--marinho);color:#fff}
.grade2{display:grid;grid-template-columns:repeat(6,108px);gap:14px 16px;margin-top:14px}
.op2{width:106px;height:106px;border-radius:24px;background:linear-gradient(180deg,#F2F8FE,#DCEDFA);border:3px solid #E1EDF8;position:relative;box-shadow:0 4px 0 #CFE0EF}
.op2 .im{position:absolute;inset:0;border-radius:21px;overflow:hidden}
.op2 img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-height:96px;max-width:98px}
.op2.sel{border-color:var(--ipe);background:linear-gradient(180deg,#FFF6DA,#FFE6A8);box-shadow:0 4px 0 #E5B54F,0 0 0 5px rgba(244,183,60,.25)}
.op2 .ok{width:32px;height:32px}
'''
cab = ['a01-crespo-curto', 'b02-dois-puffs', 'a03-cacheado-longo', 'b04-cacheado-ruivo', 'a02-puff-afro-alto', 'a04-cacheado-medio',
       'a05-duas-trancas-ondulado', 'a06-nago-curto', 'a08-nago-trancinhas', 'a09-box-braids', 'a10-coque-alto', 'b09-rabo-lateral',
       'a11-rabo-de-cavalo', 'a12-ondulado-ruivo', 'a15-chanel-liso', 'b11-liso-longo', 'a13-raspado', 'a17-arrepiado']
cards2 = ''
for i, c in enumerate(cab):
    sel = ' sel' if i == 0 else ''
    ok = '<div class="ok" data-ic="ok"></div>' if i == 0 else ''
    cards2 += f'<div class="op2{sel}"><div class="im"><img src="{P}cabelo-{c}-recorte.png"></div>{ok}</div>'
filtros = ''.join(f'<div class="filtro{" sel" if i == 0 else ""}">{f}</div>' for i, f in enumerate(['Todos', 'Crespo', 'Cacheado', 'Tranças', 'Coque', 'Liso', 'Curtinho']))
corpo2 = topo(2) + palco('roupa-01-uniforme.png') + f'''
<div class="painel">
  {guia('Agora o <b>cabelo</b>! Crespo, cacheado, liso, com tranças... <b>todos são grátis</b>. Pode trocar quando quiser.', 'joinha', 'alegre', 18, 22, 560)}
  <div style="position:absolute;left:22px;top:124px;right:22px">
    <div class="sec">Penteados <span class="selo gratis">Todos grátis, sempre</span><span class="ad" style="font-weight:400;font-size:15px;color:var(--cinza);margin-left:auto">cor do cabelo: depois</span></div>
    <div class="filtros">{filtros}</div>
    <div class="grade2">{cards2}</div>
  </div>
</div>''' + rodape('Próximo', '<span data-ic="coracao" style="display:inline-flex;width:20px;height:20px;color:var(--terracota)"></span><span>Cabelo é <b>identidade</b>: nunca custa moedinha<br>e nunca vem com enfeite ou joia.</span>')
escrever('02-criar-avatar-cabelo.html', pagina('Passo 2: cabelo', corpo2, css2))

# ---------------- TELA 3: roupa ----------------
css3 = css1 + '''
.linha3{display:flex;gap:12px;margin-top:10px}
.rp{width:112px;height:158px;border-radius:22px;background:linear-gradient(180deg,#F2F8FE,#DCEDFA);border:3px solid #E1EDF8;position:relative;box-shadow:0 4px 0 #CFE0EF}
.rp .im{position:absolute;inset:0;border-radius:19px;overflow:hidden}
.rp .im img{position:absolute;left:50%;top:6px;transform:translateX(-50%);height:118px}
.rp .nm{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-family:Andika;font-weight:700;font-size:15px;letter-spacing:.5px;color:var(--marinho)}
.rp.sel{border-color:var(--ipe);background:linear-gradient(180deg,#FFF6DA,#FFE6A8);box-shadow:0 4px 0 #E5B54F,0 0 0 5px rgba(244,183,60,.25)}
.rp.trava .im img{filter:saturate(.55) brightness(1.04);opacity:.8}
.rp.trava{background:linear-gradient(180deg,#F7F7F5,#ECEAE4);border-color:#E4E0D6;box-shadow:0 4px 0 #D6D0C2}
.cad{position:absolute;right:6px;top:6px;width:30px;height:30px;border-radius:50%;background:var(--marinho);color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.cad svg{width:16px;height:16px}
.pr{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);display:flex;align-items:center;gap:4px;background:#FFF3CF;border:2px solid #EBC35E;border-radius:999px;padding:1px 10px 1px 3px;font-family:Fredoka;font-weight:700;font-size:16px;box-shadow:0 2px 0 #D9A73E;white-space:nowrap}
.rp.trava .nm{bottom:14px}
.acc{width:100px;height:158px;border-radius:22px;background:linear-gradient(180deg,#F3F8FF,#DCE9FA);border:3px solid #C9DCF2;position:relative;box-shadow:0 4px 0 #BDD1EA}
.acc .im{position:absolute;left:0;right:0;top:0;height:124px;border-radius:19px 19px 0 0;overflow:hidden}
.acc img{position:absolute}
.acc .nm{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-family:Andika;font-weight:700;font-size:14px;letter-spacing:.5px;color:var(--marinho2)}
.anel{position:absolute;width:62px;height:62px;border-radius:50%;border:3px dashed #3D7CC4}
'''
def rp(img, nome, sel=False, preco=None):
    cls = 'rp' + (' sel' if sel else '') + (' trava' if preco else '')
    ok = '<div class="ok" data-ic="ok"></div>' if sel else ''
    cad = f'<div class="cad" data-ic="cadeado"></div><div class="pr"><span class="moeda p"></span>{preco}</div>' if preco else ''
    return f'<div class="{cls}"><div class="im"><img src="{P}{img}"></div><div class="nm">{nome}</div>{ok}{cad}</div>'
gratis = rp('roupa-01-uniforme.png', 'U·NI·FOR·ME') + rp('roupa-02-blusao-capuz.png', 'BLU·SÃO', True)
conquistar = (rp('roupa-03-explorador.png', 'CO·LE·TE', preco=30) + rp('roupa-04-capa-de-chuva.png', 'CA·PA', preco=20) +
              rp('roupa-06-pijama.png', 'PI·JA·MA', preco=18) + rp('roupa-07-festa-junina-xadrez.png', 'XA·DREZ', preco=25) +
              rp('roupa-08-esporte.png', 'TI·ME', preco=22))
acess = f'''
<div class="acc"><div class="im"><img src="{P}rosto-09-oculos-aparelho.png" style="left:50%;top:8px;width:104px;transform:translateX(-50%)"></div><div class="nm">ÓCULOS</div></div>
<div class="acc"><div class="im"><img src="{P}rosto-09-oculos-aparelho.png" style="left:16px;top:-150px;width:300px"><div class="anel" style="left:2px;top:28px"></div></div><div class="nm">APARELHO</div></div>
<div class="acc"><div class="im"><img src="{P}crianca-09-cadeira-de-rodas.png" style="left:50%;top:6px;height:110px;transform:translateX(-50%)"></div><div class="nm">CADEIRA</div></div>
<div class="acc"><div class="im" style="display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 40 60" width="40" height="64" style="margin-top:-14px"><path d="M13 5h14M20 5v38M12 22h16M20 43l-6 13M20 43l6 13" stroke="#284A86" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg></div><div class="nm">MU·LE·TA</div></div>'''
corpo3 = topo(3) + palco('roupa-02-blusao-capuz.png') + f'''
<div class="painel">
  {guia('O <b>uniforme</b> e o <b>blusão</b> já são seus. As outras roupas você conquista <b>lendo</b>!', 'alegre', 'joinha', 18, 22, 560)}
  <div style="position:absolute;left:22px;top:128px;right:22px">
    <div style="display:flex;gap:30px">
      <div><div class="sec">Já são seus <span class="selo gratis">Grátis</span></div><div class="linha3">{gratis}</div></div>
      <div><div class="sec">Acessibilidade <span class="selo acess">Sempre grátis</span></div><div class="linha3" style="gap:10px">{acess}</div></div>
    </div>
    <div class="sec" style="margin-top:22px">Para conquistar <span class="ad" style="font-weight:400;font-size:15px;color:var(--cinza)">preço fixo e igual para todos · sem sorteio · você tem 17</span></div>
    <div class="linha3" style="gap:14px">{conquistar.replace('class="rp', 'style="width:128px" class="rp')}</div>
  </div>
</div>''' + rodape('Próximo', '<span data-ic="escudo" style="display:inline-flex;width:22px;height:22px;color:var(--marinho2)"></span><span>Roupa é só aparência: <b>não dá vantagem</b><br>em lição, jogo ou pontuação.</span>')
escrever('03-criar-avatar-roupa.html', pagina('Passo 3: roupa', corpo3, css3))

# ---------------- TELA 4: lojinha de utensílios ----------------
css4 = '''
body{background:linear-gradient(180deg,#F8EBD3 0%,#F3E0C0 100%)}
.parede{position:absolute;left:0;top:92px;width:1280px;height:708px;background:repeating-linear-gradient(90deg,rgba(160,106,59,.06) 0 2px,transparent 2px 86px),linear-gradient(180deg,#FBF1DE,#F1DDBB)}
.toldo{position:absolute;left:0;top:92px;width:1280px;height:34px;background:repeating-linear-gradient(90deg,#1B3160 0 64px,#FFFFFF 64px 128px);box-shadow:0 6px 10px -4px rgba(0,0,0,.25)}
.toldo::after{content:'';position:absolute;left:0;right:0;bottom:-14px;height:14px;background:radial-gradient(circle at 32px 0,#1B3160 0 30px,transparent 31px) 0 0/128px 14px,radial-gradient(circle at 96px 0,#FFFFFF 0 30px,transparent 31px) 0 0/128px 14px}
.prov{position:absolute;left:24px;top:146px;width:296px;height:330px;border-radius:28px;background:radial-gradient(ellipse 80% 60% at 50% 40%,#FFFFFF,#E5F2FC 60%,#C5E2F6);border:3px solid #fff;box-shadow:0 12px 24px -12px rgba(110,68,35,.5);overflow:hidden}
.prov .disco{width:210px;height:52px;bottom:30px}
.prov .avatar{height:262px;bottom:52px}
.cof{position:absolute;left:24px;top:492px;width:296px;height:214px;border-radius:28px;background:#fff;border:3px solid #F1E2CB;box-shadow:0 12px 24px -12px rgba(110,68,35,.45);padding:16px 18px}
.barra{height:26px;border-radius:999px;background:#EEF3F9;border:2px solid #D5E2EF;overflow:hidden;margin-top:8px;position:relative}
.barra i{position:absolute;left:0;top:0;bottom:0;width:70.8%;background:linear-gradient(180deg,#5E95D3,#284A86);border-radius:999px}
.estante{position:absolute;left:340px;top:192px;width:916px;height:516px}
.prat{position:absolute;left:0;width:916px;height:22px;border-radius:6px;background:linear-gradient(180deg,#C58D57,#A06A3B 60%,#7E4E28);box-shadow:0 10px 14px -6px rgba(80,45,15,.55)}
.prat::after{content:'';position:absolute;left:10px;right:10px;top:22px;height:10px;background:linear-gradient(180deg,rgba(80,45,15,.35),transparent)}
.it{position:absolute;width:172px;height:236px}
.it .obj{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);max-height:92px;max-width:118px;filter:drop-shadow(0 8px 6px rgba(80,45,15,.35))}
.etq{position:absolute;left:4px;right:4px;top:100px;height:128px;background:#FFFDF8;border-radius:16px;border:2px solid #EAD8BE;box-shadow:0 4px 0 #E0C9A6;padding:8px 10px 0;text-align:center}
.etq .nm{font-family:Andika;font-weight:700;font-size:19px;letter-spacing:.6px;color:var(--marinho)}
.etq .pq{font-family:Atkinson;font-size:14px;line-height:1.22;color:#5B4636;margin-top:3px;height:36px;display:block}
.etq .pq b{color:var(--folha)}
.etq .pr{display:inline-flex;align-items:center;gap:4px;margin-top:8px;background:#FFF3CF;border:2px solid #EBC35E;border-radius:999px;padding:1px 12px 1px 3px;font-family:Fredoka;font-weight:700;font-size:18px;box-shadow:0 2px 0 #D9A73E}
.it.meta .etq{border-color:var(--ipe);box-shadow:0 4px 0 #E5B54F,0 0 0 5px rgba(244,183,60,.28);background:#FFF8E2}
.fita{position:absolute;left:50%;top:-14px;transform:translateX(-50%);background:var(--marinho);color:#fff;font-family:Fredoka;font-weight:600;font-size:13px;padding:3px 12px;border-radius:999px;white-space:nowrap;display:flex;gap:5px;align-items:center}
.seu{display:inline-flex;align-items:center;gap:5px;margin-top:6px;background:var(--folha-claro);color:var(--folha);border:2px solid #A9D7B6;border-radius:999px;padding:2px 12px;font-family:Fredoka;font-weight:600;font-size:15px}
.abas{position:absolute;left:340px;top:140px;display:flex;gap:8px;align-items:center}
.aba{height:42px;padding:0 15px;border-radius:999px;background:#fff;border:2px solid #E6D3B5;font-family:Fredoka;font-weight:600;font-size:17px;color:#6E4423;display:flex;align-items:center}
.aba.sel{background:var(--marinho);border-color:var(--marinho);color:#fff}
.regras{position:absolute;left:340px;bottom:16px;width:560px;height:72px;display:flex;flex-wrap:wrap;gap:6px 8px;align-content:center}
.rg{font-family:Atkinson;font-size:13.5px;color:#4B3A2E;background:rgba(255,255,255,.75);border:1.5px solid #E6D3B5;border-radius:999px;padding:3px 10px;display:flex;align-items:center;gap:5px}
.rg b{color:var(--marinho)}
'''
def item(x, y, img, nome, pq, preco=None, meta=False, seu=False):
    cls = 'it' + (' meta' if meta else '')
    fita = '<div class="fita"><span data-ic="porco" style="display:flex;width:15px;height:15px"></span>Meta do cofrinho</div>' if meta else ''
    rodp = '<div class="seu"><span data-ic="ok" style="display:flex;width:16px;height:16px;filter:invert(32%) sepia(60%) saturate(500%) hue-rotate(95deg)"></span>É seu</div>' if seu else f'<div class="pr"><span class="moeda p"></span>{preco}</div>'
    return f'''<div class="{cls}" style="left:{x}px;top:{y}px"><img class="obj" src="{P}utensilio-b-{img}.png">
<div class="etq">{fita}<div class="nm">{nome}</div><div class="pq">{pq}</div>{rodp}</div></div>'''
xs = [8, 190, 372, 554, 736]
l1 = [('mochila', 'MO·CHI·LA', 'levar os <b>achados da trilha</b>', None, False, True),
      ('lupa', 'LU·PA', '<b>explorar o Cerrado</b> de pertinho', 24, True, False),
      ('binoculo', 'BI·NÓ·CU·LO', 'ver o <b>tucano</b> na Mata Atlântica', 28, False, False),
      ('lanterna', 'LAN·TER·NA', 'ler a placa <b>dentro da gruta</b>', 20, False, False),
      ('mapa', 'MA·PA', 'achar o <b>caminho da vila</b>', 14, False, False)]
l2 = [('regador', 'RE·GA·DOR', '<b>regar a horta</b> da vila', 16, False, False),
      ('vaso-com-muda', 'MU·DA', 'plantar um <b>ipê na praça</b>', 12, False, False),
      ('violao', 'VI·O·LÃO', 'tocar no <b>coreto</b> da festa', 30, False, False),
      ('pandeiro', 'PAN·DEI·RO', 'entrar na <b>roda de música</b>', 18, False, False),
      ('chapeu-explorador', 'CHA·PÉU', 'proteger do <b>sol do sertão</b>', 12, False, False)]
its = ''.join(item(xs[i], 0, *l1[i]) for i in range(5)) + ''.join(item(xs[i], 262, *l2[i]) for i in range(5))
abas = ''.join(f'<div class="aba{" sel" if i == 0 else ""}">{a}</div>' for i, a in enumerate(['Todos', 'Explorar', 'Cuidar da vila', 'Música', 'Brincar']))
corpo4 = f'''<div class="parede"></div><div class="toldo"></div>
<div class="topo">
  <div class="circ" style="color:var(--marinho)"><span data-ic="voltar" style="display:flex"></span></div>
  <div class="titulo">Lojinha da Vila</div>
  <div class="ad" style="font-size:16px;color:#6E4423;margin-left:4px">utensílios para as aventuras</div>
  <div style="margin-left:auto" class="moedas"><span class="moeda"></span>17</div>
  <div class="audio" style="color:#fff"><span data-ic="som" style="display:flex"></span></div>
</div>
<div class="prov">
  <div class="chip360" style="font-size:14px;padding:5px 12px;left:14px;top:14px">Provador</div>
  <div class="disco"></div><div class="sombra" style="bottom:58px;width:130px"></div>
  <img class="avatar" src="{P}roupa-03-explorador.png">
  <img src="{P}utensilio-b-lupa.png" style="position:absolute;left:152px;top:140px;width:58px;transform:rotate(-6deg);filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))">
  <div class="abs t" style="left:0;right:0;bottom:8px;text-align:center;font-weight:600;font-size:15px;color:var(--marinho2)">Experimente antes de escolher</div>
</div>
<div class="cof">
  <div style="display:flex;align-items:center;gap:10px"><div style="width:48px;height:48px;border-radius:16px;background:#FDE3E1;color:#D9827A;display:flex;align-items:center;justify-content:center"><span data-ic="porco" style="display:flex;width:32px;height:32px"></span></div>
  <div><div class="t" style="font-weight:700;font-size:20px;color:var(--marinho)">Cofrinho</div><div class="ad" style="font-size:13.5px;color:var(--cinza)">Meta: <b class="sil" style="color:var(--tinta)">LU·PA</b></div></div>
  <img src="{P}utensilio-b-lupa.png" style="width:44px;margin-left:auto"></div>
  <div class="barra"><i></i></div>
  <div style="display:flex;justify-content:space-between;margin-top:6px;font-family:Fredoka;font-weight:600;font-size:17px"><span>17 de 24</span><span style="color:var(--terracota)">falta 7</span></div>
  <div class="ad" style="font-size:13.5px;color:#4B3A2E;margin-top:8px;line-height:1.3">Guardando, ganha <b>+1 a cada 10</b> (sempre igual). Pode tirar quando quiser.</div><div class="ad" style="font-size:13.5px;color:var(--folha);margin-top:6px;display:flex;gap:6px;align-items:center"><span data-ic="escudo" style="display:flex;width:18px;height:18px"></span>Mudou de ideia? Desfaz em 24 h.</div>
</div>
<div class="abas"><span class="t" style="font-weight:700;font-size:19px;color:#6E4423;margin-right:4px">Para que serve?</span>{abas}</div>
<div class="estante"><div class="prat" style="top:222px"></div><div class="prat" style="top:484px"></div>{its}</div>
'''
corpo4 = corpo4.replace('<div class="estante">', '<div class="estante" style="top:196px;height:510px">')
corpo4 += '''<div class="regras">
 <span class="rg"><b>Sem sorteio</b> nem caixa-surpresa</span><span class="rg"><b>Preço fixo</b>, igual para todos</span><span class="rg">Nada some, <b>sem pressa</b></span>
 <span class="rg"><b>Sem joias</b> nem enfeites</span><span class="rg">Item <b>não dá vantagem</b> na lição</span><span class="rg">Sem dinheiro de verdade</span>
</div>
<div class="btn ipe" style="position:absolute;right:24px;bottom:16px;width:340px;font-size:23px"><span data-ic="porco" style="display:flex;width:30px;height:30px"></span>Guardar para a LUPA</div>'''
escrever('04-lojinha-utensilios.html', pagina('Lojinha de utensílios', corpo4, css4))

# ---------------- TELA 5: meu avatar na vila ----------------
PE = '../../../personagens-3d/'
css5 = '''
body{background:#E9C88E}
.cena{position:absolute;left:-77px;top:0;width:1434px;height:800px;background:url(''' + PE + '''06-leitura-juntos-praca.png) center/cover}
.veu{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,30,60,.35) 0%,rgba(20,30,60,0) 18%,rgba(20,30,60,0) 78%,rgba(20,30,60,.45) 100%)}
.av5{position:absolute;left:940px;bottom:-70px;height:750px;filter:sepia(.14) saturate(1.06) brightness(1.03) drop-shadow(-6px 4px 8px rgba(70,40,10,.25))}
.sombra5{position:absolute;left:900px;bottom:-40px;width:300px;height:60px;border-radius:50%;background:radial-gradient(ellipse,rgba(60,35,10,.5),rgba(60,35,10,0) 70%)}
.moch{position:absolute;left:1090px;top:290px;width:150px;filter:sepia(.1) brightness(.92) drop-shadow(0 4px 6px rgba(60,35,10,.35));transform:rotate(6deg)}
.lupa5{position:absolute;left:1046px;top:546px;width:100px;transform:rotate(-4deg);filter:drop-shadow(0 4px 5px rgba(60,35,10,.4))}
.cart{position:absolute;left:24px;top:22px;width:350px;background:rgba(255,253,248,.95);border-radius:26px;padding:16px 18px;box-shadow:0 14px 28px -12px rgba(0,0,0,.45);border:3px solid #fff}
.slot{display:flex;align-items:center;gap:10px;background:#F2F8FE;border:2px solid #D3E4F4;border-radius:18px;padding:6px 10px;margin-top:8px}
.slot img{width:46px;height:46px;object-fit:contain}
.slot .nm{font-family:Andika;font-weight:700;font-size:18px;letter-spacing:.5px;color:var(--marinho)}
.slot .eq{margin-left:auto;font-family:Fredoka;font-weight:600;font-size:14px;color:var(--folha);background:var(--folha-claro);border:2px solid #A9D7B6;border-radius:999px;padding:2px 10px}
.bal5{position:absolute;background:#fff;border-radius:22px;padding:12px 16px;font-size:21px;line-height:1.25;box-shadow:0 10px 22px -10px rgba(0,0,0,.45);border:2px solid #F1E7D6}
.bal5 b{color:var(--marinho)}
.bal5::after{content:'';position:absolute;bottom:-14px;border:14px solid transparent;border-top-color:#fff;border-bottom:0}
.tagnome{position:absolute;left:1010px;top:58px;background:var(--marinho);color:#fff;font-family:Fredoka;font-weight:700;font-size:20px;padding:6px 18px;border-radius:999px;box-shadow:0 4px 0 #10203F;border:3px solid #fff}
'''
corpo5 = f'''<div class="cena"></div><div class="veu"></div>
<div class="sombra5"></div>
<img class="moch" src="{P}utensilio-b-mochila.png">
<img class="av5" src="{P}roupa-03-explorador.png">
<img class="lupa5" src="{P}utensilio-b-lupa.png">
<div class="tagnome">LÉO</div>
<div class="bal5" id="bs" style="left:394px;top:126px;width:236px">Oi, <b>LÉO</b>! Vem ler com a gente?<span class="mini-som" style="color:var(--azul)"><span data-ic="som" style="display:flex"></span></span></div>
<div class="bal5" id="bt" style="left:676px;top:112px;width:262px">Você trouxe a <b>LU·PA</b>! Vamos ao Cerrado?<span class="mini-som" style="color:var(--azul)"><span data-ic="som" style="display:flex"></span></span></div>
<style>#bs::after{{left:140px}}#bt::after{{left:76px}}</style>
<div class="cart">
  <div class="t" style="font-weight:700;font-size:23px;color:var(--marinho)">Pronto! Você na vila</div>
  <div class="ad" style="font-size:14px;color:var(--cinza);margin-top:2px">Equipado para a próxima aventura</div>
  <div class="slot"><img src="{P}utensilio-b-mochila.png"><span class="nm">MO·CHI·LA</span><span class="eq">nas costas</span></div>
  <div class="slot"><img src="{P}utensilio-b-lupa.png"><span class="nm">LU·PA</span><span class="eq">na mão</span></div>
  <div class="slot"><img src="{P}roupa-03-explorador.png" style="object-position:top;height:46px;width:46px;object-fit:cover"><span class="nm">CO·LE·TE</span><span class="eq">vestido</span></div>
</div>
<div class="audio" style="position:absolute;right:24px;top:22px;color:#fff"><span data-ic="som" style="display:flex"></span></div>
<div class="rodape" style="left:24px;right:24px">
  <div class="btn papel" style="width:250px;font-size:22px"><span data-ic="girad" style="display:flex"></span>Trocar visual</div>
  <div class="btn papel" style="width:220px;font-size:22px"><span data-ic="casa" style="display:flex"></span>Lojinha</div>
  <div style="flex:1"></div>
  <div class="btn ipe" style="width:360px">Ir para a aventura<span data-ic="seguir" style="display:flex"></span></div>
</div>'''
escrever('05-meu-avatar-na-vila.html', pagina('Meu avatar na vila', corpo5, css5))

# ---------------- TELA 6: fluxo e regras ----------------
css6 = '''
body{background:linear-gradient(180deg,#EAF5FD,#FFF8EC)}
h1{position:absolute;left:28px;top:20px;font-family:Fredoka;font-weight:700;font-size:30px;color:var(--marinho)}
.sub{position:absolute;left:28px;top:60px;font-family:Atkinson;font-size:15px;color:var(--cinza)}
.bx{position:absolute;background:#fff;border-radius:24px;border:2px solid #E1ECF6;box-shadow:0 10px 22px -14px rgba(27,49,96,.45);padding:14px 18px}
.bx h2{font-family:Fredoka;font-weight:700;font-size:20px;color:var(--marinho);display:flex;align-items:center;gap:10px}
.fl{position:absolute;top:96px;left:28px;right:28px;height:188px;display:flex;align-items:center;gap:0}
.pc{width:250px;height:188px;background:#fff;border-radius:24px;border:2px solid #E1ECF6;box-shadow:0 10px 22px -14px rgba(27,49,96,.45);position:relative;overflow:hidden}
.pc .ft{position:absolute;left:0;top:0;width:110px;bottom:0;background:linear-gradient(180deg,#F2F8FE,#DCEDFA)}
.pc .ft img{position:absolute;left:50%;transform:translateX(-50%)}
.pc .tx{position:absolute;left:122px;right:12px;top:16px}
.num{width:34px;height:34px;border-radius:50%;background:var(--marinho);color:#fff;font-family:Fredoka;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center}
.pc h3{font-family:Fredoka;font-weight:700;font-size:19px;color:var(--marinho);margin-top:6px;line-height:1.1}
.pc p{font-family:Atkinson;font-size:13px;color:#425066;line-height:1.3;margin-top:5px}
.seta{flex:1;display:flex;align-items:center;justify-content:center;color:var(--azul)}
.seta svg{width:34px;height:34px}
.ciclo{display:flex;align-items:flex-start;margin-top:14px;padding-left:6px}
.no{width:118px;text-align:center}
.no .ic{width:64px;height:64px;border-radius:20px;margin:0 auto;display:flex;align-items:center;justify-content:center;background:var(--ceu);border:2px solid #C9DFF3}
.no .ic img{max-width:50px;max-height:50px}
.no b{display:block;font-family:Fredoka;font-weight:600;font-size:15px;color:var(--marinho);margin-top:6px;line-height:1.15}
.no small{display:block;font-family:Atkinson;font-size:12px;color:var(--cinza);margin-top:2px;line-height:1.2}
.sm{color:var(--azul);width:26px;flex:none;margin-top:20px}
.li{font-family:Atkinson;font-size:14.5px;color:#2B3546;line-height:1.3;display:flex;gap:8px;margin-top:7px;align-items:flex-start}
.li .d{flex:none;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:1px}
.li .d svg{width:13px;height:13px}
.d.v{background:var(--folha)} .d.n{background:var(--terracota);color:#fff} .d.a{background:var(--ipe);color:var(--tinta)}
.slots{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.sl{font-family:Atkinson;font-size:13px;background:#EEF4FB;border:1.5px solid #CFE0F1;border-radius:10px;padding:3px 9px;color:var(--marinho)}
.sl b{font-family:Fredoka;font-weight:600}
'''
def pc(n, titulo, texto, img_html):
    return f'<div class="pc"><div class="ft">{img_html}</div><div class="tx"><div class="num">{n}</div><h3>{titulo}</h3><p>{texto}</p></div></div>'
seta = '<div class="seta"><span data-ic="seguir" style="display:flex;width:34px;height:34px"></span></div>'
fluxo = (pc(1, 'Rosto e cor da pele', 'Rostos prontos + cor de pele ajustável. <b>Sem foto.</b>', f'<img src="{P}rosto-01-avatar-exemplo.png" style="top:40px;width:96px">') + seta +
         pc(2, 'Cabelo', 'Crespo, cacheado, liso, tranças, coque. <b>Todos grátis.</b>', f'<img src="{P}cabelo-a01-crespo-curto-recorte.png" style="top:40px;width:96px">') + seta +
         pc(3, 'Roupa e acessibilidade', 'Uniforme e blusão grátis. Óculos, aparelho, cadeira: <b>sempre grátis.</b>', f'<img src="{P}roupa-02-blusao-capuz.png" style="top:10px;height:176px">') + seta +
         pc(4, 'Pronto na vila', 'Ao lado da Sofia e do Tales. Muda o visual quando quiser.', f'<img src="{P}roupa-03-explorador.png" style="top:10px;height:176px"><img src="{P}utensilio-b-lupa.png" style="top:96px;left:76px;width:30px;transform:none">'))
def no(img, t, s):
    return f'<div class="no"><div class="ic">{img}</div><b>{t}</b><small>{s}</small></div>'
sm = '<div class="sm"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></div>'
ciclo = (no(f'<img src="{P}utensilio-b-caderno.png">', 'Aprender', 'lição, leitura, missão') + sm +
         no('<span class="moeda"></span>', 'Moedinhas', 'pelo esforço, com teto') + sm +
         no(f'<span data-ic="porco" style="display:flex;width:40px;height:40px;color:#D9827A"></span>', 'Cofrinho', 'meta + bônus fixo') + sm +
         no(f'<img src="{P}utensilio-b-lupa.png">', 'Escolher o porquê', 'LUPA: explorar o Cerrado') + sm +
         no(f'<img src="{P}utensilio-b-regador.png">', 'Usar no mundo', 'a vila muda, história nova'))
OKs = '<span class="d v" data-ic="ok"></span>'
NOs = '<span class="d n" data-ic="x"></span>'
corpo6 = f'''<h1>Avatar 3D e Lojinha: fluxo e regras</h1>
<div class="sub">Decisões 002, 006, 007, 008 e 009 · rel. 38 (economia virtual) · peças recortadas das pranchas 3D em <b>avatar-3d/pecas/</b></div>
<div class="fl">{fluxo}</div>
<div class="bx" style="left:28px;top:300px;width:740px;height:228px">
  <h2>Ciclo da lojinha <span class="selo gratis" style="font-size:13px">a recompensa principal é mais leitura</span></h2>
  <div class="ciclo">{ciclo}</div>
  <svg style="position:absolute;left:84px;bottom:12px" width="600" height="22" viewBox="0 0 600 22"><path d="M590 2 v8 a8 8 0 0 1 -8 8 H18 a8 8 0 0 1 -8 -8 v-6" fill="none" stroke="#3D7CC4" stroke-width="2.5" stroke-dasharray="5 6"/><path d="M4 8 L10 0 L16 8" fill="none" stroke="#3D7CC4" stroke-width="2.5" stroke-linecap="round"/></svg>
</div>
<div class="bx" style="left:28px;top:544px;width:362px;height:238px;border-color:#BFE0C9">
  <h2><span class="selo gratis">Grátis, sempre</span>identidade</h2>
  <div class="li">{OKs}<span>Rosto, cor da pele, olhos e <b>todos os cabelos</b></span></div>
  <div class="li">{OKs}<span><b>Uniforme e blusão</b> da escola (troca por rede)</span></div>
  <div class="li">{OKs}<span><b>Acessibilidade:</b> óculos de grau, aparelho auditivo, cadeira de rodas, muleta</span></div>
  <div class="li">{OKs}<span>Trocar o visual a qualquer hora, sem custo</span></div>
</div>
<div class="bx" style="left:406px;top:544px;width:362px;height:238px;border-color:#F0D592">
  <h2><span class="selo" style="background:#FFF3CF;color:#8A5A00;border:2px solid #EBC35E">Para conquistar</span>com moedinhas</h2>
  <div class="li"><span class="d a" data-ic="cadeado"></span><span>Roupas de aventura, bioma e festa (COLETE, CAPA, XADREZ...)</span></div>
  <div class="li"><span class="d a" data-ic="cadeado"></span><span>Utensílios <b>com propósito</b>: LUPA, REGADOR, LANTERNA...</span></div>
  <div class="li"><span class="d a" data-ic="cadeado"></span><span><b>Preço fixo</b>, igual para todos, com nome decodificável</span></div>
  <div class="li"><span class="d a" data-ic="cadeado"></span><span>Desfazer compra em 24 h; nada some nem expira</span></div>
</div>
<div class="bx" style="left:784px;top:300px;width:468px;height:262px;border-color:#EBC9BC">
  <h2>Nunca</h2>
  <div class="li">{NOs}<span><b>Foto do rosto</b> da criança (LGPD art. 14, ECA Digital)</span></div>
  <div class="li">{NOs}<span><b>Joias</b>, brincos, colares, pulseiras, maquiagem, enfeites</span></div>
  <div class="li">{NOs}<span>Item que dá <b>vantagem</b> em lição, jogo ou nota</span></div>
  <div class="li">{NOs}<span><b>Sorte</b>: caixa-surpresa, roleta, raridade aleatória</span></div>
  <div class="li">{NOs}<span><b>Dinheiro real</b>, "só hoje", contagem regressiva, ranking</span></div>
  <div class="li">{NOs}<span>Perder item ou bichinho <b>por não comprar</b> ou faltar dias</span></div>
  <div class="li">{NOs}<span>Padrão <b>arco-íris</b> nas peças (2 a 3 cores por item)</span></div>
</div>
<div class="bx" style="left:784px;top:578px;width:468px;height:204px">
  <h2>Na produção: peças glTF modulares</h2>
  <div class="ad" style="font-size:13.5px;color:#425066;margin-top:4px;line-height:1.3">Um corpo-base com esqueleto comum; cada peça é um <b>.glb</b> que encaixa num ponto. Cor de pele e de cabelo são parâmetros do material.</div>
  <div class="slots"><span class="sl"><b>corpo</b> base + pele</span><span class="sl"><b>rosto</b> olhos</span><span class="sl"><b>cabelo</b></span><span class="sl"><b>tronco</b></span><span class="sl"><b>pernas</b></span><span class="sl"><b>pés</b></span><span class="sl"><b>mão</b> lupa</span><span class="sl"><b>costas</b> mochila</span><span class="sl"><b>acess.</b> óculos, aparelho, cadeira</span></div>
</div>'''
escrever('06-fluxo-avatar.html', pagina('Fluxo do avatar', corpo6, css6))
