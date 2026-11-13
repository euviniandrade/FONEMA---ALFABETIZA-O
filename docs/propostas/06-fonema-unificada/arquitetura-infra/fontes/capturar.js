// Captura os diagramas: node fontes/capturar.js  (requer playwright)
const {chromium}=require('playwright');const path=require('path');
const D=[['arquitetura-geral',1800],['infra-aws',1800],['fluxo-dados-privacidade',1800],['pipeline-ci-cd',1800],['camadas-seguranca',1800],['offline-sala-de-aula',1800]];
(async()=>{const b=await chromium.launch();const so=process.argv[2];
 for(const [n,w] of D){if(so&&so!==n)continue;const p=await b.newPage({viewport:{width:w,height:1000},deviceScaleFactor:2});
  await p.goto('file://'+path.resolve(__dirname,n+'.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
  const el=await p.$('.pagina');await el.screenshot({path:path.resolve(__dirname,'..',n+'.png')});console.log('ok',n);await p.close();}
 await b.close();})();
