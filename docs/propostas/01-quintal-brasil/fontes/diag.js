// usage: node diag.js spec.js out.html
const spec=require(require('path').resolve(process.argv[2]));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const B={};let svg='';
const W=spec.w,H=spec.h;
svg+=`<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" fill="#6E5D52"/></marker>
<filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#3B2A20" flood-opacity=".12"/></filter></defs>`;
svg+=`<rect width="${W}" height="${H}" fill="#FFF4E2"/>`;
svg+=`<text x="36" y="52" font-family="Fredoka" font-weight="700" font-size="30" fill="#A9472A">${esc(spec.title)}</text><text x="36" y="80" font-family="Atkinson" font-size="15" fill="#6E5D52">${esc(spec.sub)}</text>`;
for(const g of spec.groups||[]){svg+=`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="22" fill="${g.fill||'#FFFBF4'}" stroke="${g.stroke||'#E8D9C4'}" stroke-width="2" ${g.dash?'stroke-dasharray="8 6"':''}/><text x="${g.x+18}" y="${g.y+28}" font-family="Fredoka" font-weight="600" font-size="17" fill="${g.color||'#3B2A20'}">${esc(g.label)}</text>`}
for(const b of spec.boxes){B[b.id]=b;}
// arrows first
for(const a of spec.arrows||[]){const s=B[a[0]],t=B[a[1]];
 const c=(b)=>[b.x+b.w/2,b.y+b.h/2];
 const clip=(b,from,to)=>{const [cx,cy]=from,[tx,ty]=to;const dx=tx-cx,dy=ty-cy;const sx=dx?(b.w/2+6)/Math.abs(dx):1e9,sy=dy?(b.h/2+6)/Math.abs(dy):1e9;const k=Math.min(sx,sy);return [cx+dx*k,cy+dy*k]};
 let [x1,y1]=clip(s,c(s),c(t)),[x2,y2]=clip(t,c(t),c(s));
 if(a[3]&&a[3].ox){x1+=a[3].ox;x2+=a[3].ox} if(a[3]&&a[3].oy){y1+=a[3].oy;y2+=a[3].oy}
 const col=(a[3]&&a[3].color)||'#6E5D52';
 svg+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.2" ${a[3]&&a[3].dash?'stroke-dasharray="6 5"':''} marker-end="url(#ar)" ${a[3]&&a[3].both?'marker-start="url(#ar)"':''}/>`;
 if(a[2]){const mx=(x1+x2)/2+((a[3]&&a[3].lx)||0),my=(y1+y2)/2+((a[3]&&a[3].ly)||0);const w=a[2].length*6.4+12;svg+=`<rect x="${mx-w/2}" y="${my-10}" width="${w}" height="19" rx="9" fill="#FFF4E2" stroke="#E8D9C4"/><text x="${mx}" y="${my+4}" text-anchor="middle" font-family="Atkinson" font-size="11.5" fill="#3B2A20">${esc(a[2])}</text>`}
}
for(const b of spec.boxes){ if(b.ghost) continue;
 svg+=`<g filter="url(#sh)"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14" fill="${b.fill||'#fff'}" stroke="${b.stroke||'#E8D9C4'}" stroke-width="1.5"/></g><rect x="${b.x}" y="${b.y}" width="7" height="${b.h}" rx="3" fill="${b.accent||'#A9472A'}"/>`;
 svg+=`<text x="${b.x+18}" y="${b.y+24}" font-family="Atkinson" font-weight="700" font-size="14.5" fill="#3B2A20">${esc(b.t)}</text>`;
 (b.l||[]).forEach((l,i)=>svg+=`<text x="${b.x+18}" y="${b.y+44+i*17}" font-family="Atkinson" font-size="12.3" fill="#6E5D52">${esc(l)}</text>`);
}
for(const n of spec.notes||[]){svg+=`<text x="${n.x}" y="${n.y}" font-family="Atkinson" font-size="${n.s||12.5}" fill="${n.c||'#6E5D52'}" ${n.b?'font-weight="700"':''}>${esc(n.t)}</text>`}
const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="common.css"><style>body{width:${W}px;height:${H}px;overflow:hidden}</style></head><body><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg></body></html>`;
require('fs').writeFileSync(process.argv[3],html);
