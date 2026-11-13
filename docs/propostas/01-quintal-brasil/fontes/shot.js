const {chromium}=require('playwright');const path=require('path');
(async()=>{const [,,file,w,h,out]=process.argv;const b=await chromium.launch();
const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:2});
await p.goto('file://'+path.resolve(file));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({path:out,fullPage:false});await b.close();console.log('saved',out);})();
