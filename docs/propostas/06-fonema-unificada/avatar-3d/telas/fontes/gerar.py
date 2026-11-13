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
<div class="acc"><div class="im"><img src="{P}rosto-09-oculos-aparelho.png" style="left:-8px;top:-96px;width:300px"><div class="anel" style="left:2px;top:30px"></div></div><div class="nm">APARELHO</div></div>
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
