// Pranchas: mosaico de ambientes e decomposição de paralaxe — node extras.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..');
const css = `@font-face{font-family:Andika;src:url(fonts/andika-latin-400-normal.woff2) format('woff2');font-weight:400}
@font-face{font-family:Andika;src:url(fonts/andika-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-600-normal.woff2) format('woff2');font-weight:600}
@font-face{font-family:Fredoka;src:url(fonts/fredoka-latin-700-normal.woff2) format('woff2');font-weight:700}
html,body{margin:0;width:1280px;height:800px;overflow:hidden;font-family:Andika,sans-serif;color:#2B2A4C}`;
const list = [
  ['01-quintal-vila', 'Quintal / Vila', 'Etapa 0'], ['02-ilha-das-vogais', 'Ilha das Vogais', 'Etapa 1'], ['03-mata-atlantica', 'Mata Atlântica', 'Etapa 2'], ['04-pampa', 'Pampa', 'Etapa 3'],
  ['05-pantanal', 'Pantanal', 'Etapa 4'], ['06-cerrado', 'Cerrado', 'Etapa 5'], ['07-caatinga', 'Caatinga', 'Etapa 6 · chefe Ano 1'], ['08-amazonia', 'Amazônia', 'Etapa 7'],
  ['09-litoral-e-mar', 'Litoral e Mar', 'Etapa 8'], ['10-cidade-das-letras', 'Cidade das Letras', 'Etapa 9'], ['11-arquipelago-dos-livros', 'Arquipélago dos Livros', 'Etapa 10 · final'], ['int-biblioteca', 'Biblioteca', 'interior'],
  ['int-padaria', 'Padaria', 'interior'], ['int-escola-sala', 'Sala de aula', 'interior'], ['int-oficina-robos', 'Oficina de robôs', 'interior'], ['int-casa-sofia-quarto', 'Quarto da Sofia', 'interior'],
];
function mosaico() {
  const cells = list.map(([f, t, e], i) => `<div class="c"><img src="../${f}.png"><div class="tag"><b>${i < 11 ? String(i + 1).padStart(2, '0') : '◆'}</b> ${t}<span>${e}</span></div>${i < 10 ? '<div class="arrow">›</div>' : ''}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}
body{background:linear-gradient(160deg,#FFF6E6,#F6E2C4)}
h1{font-family:Fredoka;font-weight:700;font-size:24px;margin:0;position:absolute;left:62px;top:10px;color:#5A2E16}
.sub{position:absolute;right:62px;top:16px;font-size:13px;color:#7A5A48}
.g{position:absolute;left:62px;top:44px;display:grid;grid-template-columns:repeat(4,280px);grid-auto-rows:175px;gap:12px}
.c{position:relative;border-radius:10px;overflow:visible;box-shadow:0 6px 16px rgba(90,46,22,.25)}
.c img{width:280px;height:175px;border-radius:10px;display:block}
.tag{position:absolute;left:8px;bottom:8px;background:rgba(255,251,242,.92);border-radius:8px;padding:3px 8px;font-size:12px;font-weight:700;color:#2B2A4C}
.tag b{color:#C2410C;margin-right:3px}.tag span{font-weight:400;color:#7A5A48;margin-left:6px;font-size:11px}
.arrow{position:absolute;right:-12px;top:72px;width:12px;text-align:center;font-family:Fredoka;font-weight:700;color:#C2410C;font-size:22px}
.c:nth-child(4n) .arrow{display:none}
</style></head><body><h1>FONEMA · ambientes para desbravar</h1><div class="sub">11 regiões da jornada (2 anos) + 5 interiores da vila · cada cenário com 5 pontos exploráveis ✦</div><div class="g">${cells}</div></body></html>`;
}
function paralaxe() {
  const L = [['sky', 'Céu', 0.08, 'gradiente, sol, nuvens, raios de luz'], ['far', 'Fundo', 0.25, 'chapadas e vereda de buritis na névoa'], ['mid', 'Meio', 0.55, 'planície, ipê, lobo-guará, seriema, cupinzeiros'], ['near', 'Perto', 1.0, 'pequizeiro, coruja, caju, araras, trilha'], ['fg', 'Primeiro plano', 1.25, 'capim alto desfocado, canela-de-ema, partículas']];
  const rows = L.map(([k, t, v, d], i) => `<div class="row" style="top:${112 + i * 132}px"><div class="n">${i + 1}</div><div class="img" style="transform:perspective(700px) rotateY(18deg) translateZ(${i * 14}px)"><img src="camadas/06-cerrado-${k}.png"></div><div class="txt"><b>${t}</b><span>${d}</span><div class="bar"><i style="width:${v / 1.25 * 100}%"></i></div><em>velocidade ${String(v).replace('.', ',')}×</em></div></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}
body{background:radial-gradient(circle at 70% 30%,#3A2A4A,#160E22)}
h1{font-family:Fredoka;font-weight:700;font-size:26px;margin:0;position:absolute;left:44px;top:22px;color:#FFE8B0}
.sub{position:absolute;left:44px;top:60px;font-size:14px;color:#E8D8C8}
.row{position:absolute;left:44px;height:124px;width:600px}
.n{position:absolute;left:0;top:44px;width:30px;height:30px;border-radius:50%;background:#C2410C;color:#fff;font-family:Fredoka;font-weight:700;text-align:center;line-height:30px}
.img{position:absolute;left:44px;top:0;width:198px;height:124px;border:2px solid rgba(255,232,176,.6);border-radius:6px;overflow:hidden;background:repeating-conic-gradient(rgba(255,255,255,.08) 0 25%,transparent 0 50%) 0 0/16px 16px;box-shadow:0 8px 20px rgba(0,0,0,.4)}
.img img{width:198px;height:124px;display:block}
.txt{position:absolute;left:268px;top:14px;width:330px;color:#E8D8C8;font-size:13px}
.txt b{display:block;color:#FFC870;font-size:16px;font-family:Fredoka;font-weight:600}
.bar{margin-top:8px;height:8px;width:240px;background:rgba(255,255,255,.12);border-radius:4px}.bar i{display:block;height:8px;border-radius:4px;background:linear-gradient(90deg,#FFC870,#F28C28)}
.txt em{font-style:normal;font-size:12px;color:#FFE8B0}
.final{position:absolute;right:44px;top:112px;width:560px}
.final img{width:560px;height:350px;border-radius:8px;border:2px solid #FFC870;display:block;box-shadow:0 10px 30px rgba(0,0,0,.4)}
.final p{color:#CFC0D8;font-size:12px;margin:6px 0 0}
.box{position:absolute;right:44px;top:512px;width:532px;color:#E8D8C8;font-size:13px;line-height:1.5;background:rgba(255,255,255,.06);border:1px solid rgba(255,232,176,.25);border-radius:10px;padding:12px 14px}
.box b{color:#FFC870}
</style></head><body><h1>Paralaxe: o Cerrado decomposto em 5 camadas</h1><div class="sub">Cada cenário sai do SVG-fonte em 5 grupos (layer-sky/far/mid/near/fg), exportados como PNG/WebP com transparência ou animados direto em Rive.</div>
${rows}
<div class="final"><img src="../06-cerrado.png"><p>Resultado composto (06-cerrado.png) — os 5 planos sobrepostos.</p></div>
<div class="box"><b>Regra de movimento:</b> deslocamento = arrasto × fator da camada. Giroscópio: ±12 px no céu até ±40 px no primeiro plano, com amortecimento. <b>Respiração:</b> nuvens derivam, capim balança e partículas flutuam em laços de 6–10 s. <b>Modo leve</b> (celular simples): 2 camadas (céu+fundo; meio+perto+frente) e sem partículas. <b>Pontos ✦</b> moram na camada do objeto e acompanham o movimento; o toque abre a palavra (som → sílabas → palavra).</div>
</body></html>`;
}
(async () => {
  const b = await chromium.launch();
  for (const [name, fn] of [['mosaico-ambientes', mosaico], ['paralaxe-camadas', paralaxe]]) {
    const file = path.join(__dirname, `_${name}.html`); fs.writeFileSync(file, fn());
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
    await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `${name}.png`) }); await p.close(); console.log('ok', name);
  }
  await b.close();
})();
