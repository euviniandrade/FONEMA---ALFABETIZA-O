// Captura das telas: node shot.js  (1280×800, deviceScaleFactor 2)
const {chromium}=require('playwright');const path=require('path');
const telas=['01-criar-avatar-pele-rosto','02-criar-avatar-cabelo','03-criar-avatar-roupa','04-lojinha-utensilios','05-meu-avatar-na-vila','06-fluxo-avatar'];
(async()=>{const b=await chromium.launch();const so=process.argv.slice(2);
for(const t of telas){ if(so.length&&!so.some(s=>t.startsWith(s)))continue;
 const p=await b.newPage({viewport:{width:1280,height:800},deviceScaleFactor:2});
 p.on('pageerror',e=>console.log('ERR',t,e.message));p.on('requestfailed',r=>console.log('FALHOU',t,r.url()));
 await p.goto('file://'+path.resolve(__dirname,t+'.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
 await p.screenshot({path:path.resolve(__dirname,'..',t+'.png')});await p.close();console.log('ok',t);}
await b.close();})();
