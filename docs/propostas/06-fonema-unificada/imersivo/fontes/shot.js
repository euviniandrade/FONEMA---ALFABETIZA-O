// uso: node shot.js <url> <saida.png> [largura altura]
const {chromium}=require('playwright');
(async()=>{const [,,url,out,w='1280',h='800']=process.argv;
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:2});
p.on('console',m=>console.log('[pg]',m.text()));p.on('pageerror',e=>console.log('[err]',e.message));
await p.goto(url);await p.evaluate(()=>document.fonts.ready);
await p.waitForFunction(()=>window.__pronto!==false,null,{timeout:60000});await p.waitForTimeout(400);
await p.screenshot({path:out});await b.close();console.log('salvo',out);})();
