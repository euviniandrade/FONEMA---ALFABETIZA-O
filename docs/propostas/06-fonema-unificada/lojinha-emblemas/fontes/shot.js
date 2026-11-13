const {chromium}=require('playwright');const path=require('path');
(async()=>{const args=process.argv.slice(2);const b=await chromium.launch();
for(let i=0;i<args.length;i+=4){const [file,w,h,out]=args.slice(i,i+4);
const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:2});
p.on('pageerror',e=>console.log('ERR',file,e.message));p.on('console',m=>{if(m.type()==='error')console.log('CERR',file,m.text())});
await p.goto('file://'+path.resolve(file));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
await p.screenshot({path:out});await p.close();console.log('saved',out);}
await b.close();})();
