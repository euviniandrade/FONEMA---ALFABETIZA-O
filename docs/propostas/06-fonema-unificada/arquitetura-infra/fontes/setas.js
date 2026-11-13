// Desenha setas entre elementos (ids). Uso: desenhar([[de, para, {rot, cor, tr, de:'r', para:'l', dx, dy}], ...])
function desenhar(lista){
  const pg=document.querySelector('.pagina');const R=pg.getBoundingClientRect();
  const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','setas');svg.setAttribute('width',R.width);svg.setAttribute('height',R.height);
  const defs=document.createElementNS(ns,'defs');svg.appendChild(defs);const cores={};
  function marcador(c){if(cores[c])return cores[c];const id='m'+Object.keys(cores).length;
    const m=document.createElementNS(ns,'marker');m.setAttribute('id',id);m.setAttribute('viewBox','0 0 10 10');
    m.setAttribute('refX','8.5');m.setAttribute('refY','5');m.setAttribute('markerWidth','7');m.setAttribute('markerHeight','7');m.setAttribute('orient','auto-start-reverse');
    const p=document.createElementNS(ns,'path');p.setAttribute('d','M0,0 L10,5 L0,10 z');p.setAttribute('fill',c);m.appendChild(p);defs.appendChild(m);cores[c]=id;return id;}
  function ponto(el,lado,desl){const r=el.getBoundingClientRect();const x=r.left-R.left,y=r.top-R.top;const d=desl||0;
    if(lado==='r')return[x+r.width,y+r.height/2+d];if(lado==='l')return[x,y+r.height/2+d];
    if(lado==='t')return[x+r.width/2+d,y];return[x+r.width/2+d,y+r.height];}
  function auto(a,b){const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    const dx=(rb.left+rb.width/2)-(ra.left+ra.width/2),dy=(rb.top+rb.height/2)-(ra.top+ra.height/2);
    if(Math.abs(dx)>Math.abs(dy))return dx>0?['r','l']:['l','r'];return dy>0?['b','t']:['t','b'];}
  const rotulos=[];
  for(const [ia,ib,o0] of lista){const o=o0||{};const a=document.getElementById(ia),b=document.getElementById(ib);
    if(!a||!b){console.warn('faltou',ia,ib);continue}
    const [la,lb]=o.de&&o.para?[o.de,o.para]:auto(a,b);const c=o.cor||'#1B2433';
    const p1=ponto(a,la,o.da),p2=ponto(b,lb,o.db);if(o.vert)p2[0]=p1[0];if(o.horiz)p2[1]=p1[1];const k=o.curva||0.45;
    const vx=s=>s==='r'?1:s==='l'?-1:0,vy=s=>s==='b'?1:s==='t'?-1:0;
    const dist=Math.hypot(p2[0]-p1[0],p2[1]-p1[1])*k;
    const c1=[p1[0]+vx(la)*dist,p1[1]+vy(la)*dist],c2=[p2[0]+vx(lb)*dist,p2[1]+vy(lb)*dist];
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d',`M${p1} C${c1} ${c2} ${p2}`);path.setAttribute('fill','none');path.setAttribute('stroke',c);
    path.setAttribute('stroke-width',o.w||2.6);if(o.tr)path.setAttribute('stroke-dasharray','8 6');
    path.setAttribute('marker-end',`url(#${marcador(c)})`);if(o.duplo)path.setAttribute('marker-start',`url(#${marcador(c)})`);svg.appendChild(path);
    if(o.rot)rotulos.push([path,o,c]);}
  pg.appendChild(svg);
  for(const [path,o,c] of rotulos){const t=o.t??0.5;const P=path.getPointAtLength(path.getTotalLength()*t);
    const g=document.createElementNS(ns,'g');const tx=document.createElementNS(ns,'text');
    const linhas=String(o.rot).split('\n');linhas.forEach((ln,i)=>{const ts=document.createElementNS(ns,'tspan');ts.setAttribute('x',P.x+(o.lx||0));ts.setAttribute('dy',i?'1.2em':'0');ts.textContent=ln;tx.appendChild(ts)});
    tx.setAttribute('x',P.x+(o.lx||0));tx.setAttribute('y',P.y+(o.ly||0)+4-(linhas.length-1)*8);tx.setAttribute('text-anchor','middle');tx.setAttribute('fill',c);
    g.appendChild(tx);svg.appendChild(g);const bb=tx.getBBox();const rc=document.createElementNS(ns,'rect');
    rc.setAttribute('x',bb.x-6);rc.setAttribute('y',bb.y-3);rc.setAttribute('width',bb.width+12);rc.setAttribute('height',bb.height+6);
    rc.setAttribute('rx',6);rc.setAttribute('fill','#fff');rc.setAttribute('stroke',c);rc.setAttribute('stroke-width','1.2');g.insertBefore(rc,tx);}
}
