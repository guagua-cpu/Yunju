const {chromium}=require('C:/Users/zhaoy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});let errors=[];
 p.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message)});
 await p.goto('http://127.0.0.1:4174',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof renderSiteSafety==='function'&&Object.hasOwn(newViews,'site-safety'));
 await p.evaluate(()=>{state.role='inspector';state.view='site-safety';render()});
 const frame=p.frameLocator('#yunju-smoke-frame');await frame.locator('#file').waitFor({timeout:25000});
 console.log('SMOKE UPLOAD EMBED',await p.locator('#yunju-smoke-frame').getAttribute('src'),await frame.locator('#file').count());
 await p.screenshot({path:path.resolve('../work/yunju-site-safety.png'),fullPage:true});
 await p.evaluate(()=>{state.view='space';render()});const model=p.frameLocator('#space-page iframe');
 await model.locator('#mepAuto').waitFor();await model.locator('#mepAuto').click();await p.locator('[data-mep="three"]').click();await model.locator('#view3d canvas').waitFor({timeout:25000});await p.waitForTimeout(350);
 console.log('MEP TOOLS',await model.locator('[data-tool="mepLine"]').count(),await model.locator('[data-tool="mepNode"]').count(),'3D CANVAS',await model.locator('#view3d canvas').count());
 await p.screenshot({path:path.resolve('../work/yunju-mep-space.png'),fullPage:true});console.log('PAGE ERRORS',JSON.stringify(errors));await b.close();if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
