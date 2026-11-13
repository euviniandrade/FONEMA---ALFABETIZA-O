// uso: node quadros.js <pasta> <escala> <t1,t2,...|video>  — captura quadros determinísticos de bola.html
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,dir,esc,lista]=process.argv;fs.mkdirSync(dir,{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:+esc});
p.on('pageerror',e=>console.log('[err]',e.message));
await p.goto('http://localhost:8931/imersivo/fontes/bola.html');await p.waitForFunction(()=>window.__pronto===true);
const ts=lista==='video'?Array.from({length:13*30},(_,i)=>i/30):lista.split(',').map(Number);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.render(t),ts[i]);
 const nome=lista==='video'?`${dir}/f${String(i).padStart(4,'0')}.jpg`:`${dir}/t${ts[i]}.png`;
 await p.screenshot(lista==='video'?{path:nome,type:'jpeg',quality:92}:{path:nome});}
await b.close();console.log('ok',ts.length);})();
