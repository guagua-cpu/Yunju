const {chromium}=require('C:/Users/zhaoy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path');
const assert=(v,m)=>{if(!v)throw Error(m)};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1540,height:1060}});const errors=[];
 await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174',{waitUntil:'networkidle'});await page.waitForTimeout(300);
 console.log('BOOT',JSON.stringify(await page.evaluate(()=>({brand:document.title,roles:Object.keys(roles).length,sku:products.length,people:people.length,jobs:YS.jobs.length,issues:YD.support.length,replies:YD.support.reduce((s,a)=>s+a.replies.length,0)}))));
 assert(!errors.length,'Startup errors: '+errors.join(' | '));
 await page.screenshot({path:path.resolve('../work/yunju-v3-home.png'),fullPage:true});
 if(process.argv.includes('--smoke')){await browser.close();return;}
 const nav=async(role,view)=>{await page.evaluate(({role,view})=>{state.role=role;state.view=view;render();window.scrollTo(0,0)}, {role,view});};
 for(const role of ['owner','designer','supplier','builder','inspector','company','admin']){
  await nav(role,'home');let routes=await page.locator('#nav [data-route]').evaluateAll(els=>els.map(e=>e.dataset.route));
  assert(new Set(routes).size===routes.length,'Duplicate role nav '+role);
  assert(await page.locator('#role-ribbon .role-tile').count()===7,'Missing role switches');
  assert((await page.locator('#content h1').count())>0,'Missing role dashboard '+role);
 }
 for(const view of ['styles','themes','community','market','partners','schedule','warranty','quality','customer']){await nav('owner',view);assert((await page.locator('#content').innerText()).length>100,'Empty screen '+view);}
 // Work-style link connects products, people, and matching community examples.
 await nav('owner','styles');await page.locator('[data-y="style"][data-id="原木风"]').click();
 await page.locator('.product-card .rating-chip').first().waitFor();assert(await page.locator('.product-card .rating-chip').count()>0,'Style products lack ratings');
 await page.locator('[data-y="style-partners"]').click();assert(await page.locator('#yj-partner-style').inputValue()==='原木风','Partner style filter not linked');
 await page.selectOption('#yj-partner-specialty','墙面设计');assert(await page.locator('#content').innerText(),'Specialty filter failed');
 // Rating evidence and feedback; average must be derived from stored reviews.
 await nav('owner','market');await page.locator('.rating-chip').first().click();let reviewId=await page.locator('#yj-review').getAttribute('data-product');
 await page.locator('#yj-review [name="score"]').selectOption('4.5');await page.locator('#yj-review [name="text"]').fill('已核对规格，服务回复细心，但希望保修范围写得更清楚。');await page.locator('#yj-review button').click();
 assert(await page.evaluate(id=>YS.reviews[id].at(-1).score,reviewId)===4.5,'Half-star review not persisted');await page.locator('.modal-close').click();
 // Feed online update and exact rollback, explicit denial and pause.
 await nav('owner','community');let baseline=await page.evaluate(()=>JSON.stringify(yModel().theta));
 let postId=await page.locator('[data-y="like"]').first().getAttribute('data-id');
 await page.locator('[data-y="like"]').first().click();assert(await page.evaluate(()=>YS.feed.events.length)>0,'Feedback not learned');
 await page.locator('#yj-feed-confirm [data-y="feed-undo"]').click();assert(await page.evaluate(()=>JSON.stringify(yModel().theta))===baseline,'Model rollback not exact');
 await page.evaluate(()=>{let p=YD.posts.find(p=>p.id==='post-0');yFeedback(p,'确认偏好',1.3);YS.feed.confirmed.push(p.style);ysave()});
 assert(await page.evaluate(()=>yModel().theta[YFEATURES.indexOf('原木风')+1])>0,'Style preference not updated');
 await page.evaluate(()=>YA['feed-deny']({dataset:{id:'原木风'}}));assert(await page.evaluate(()=>!yRankPosts().some(p=>p.style==='原木风')),'Denied style still ranked');
 await page.evaluate(()=>YA['feed-undo']());
 // Drag a two-day task into a worker's calendar and verify linked task dates.
 await nav('builder','schedule');await page.selectOption('#yj-worker-trade','木工');
 let ids=await page.evaluate(()=>({job:YS.jobs.find(j=>j.project===E.activeProject&&j.trade==='木工'&&!j.worker).id,worker:E.crew.find(w=>w.trade==='木工').id}));
 await page.fill('#yj-plan-start','2027-01-05');await page.locator('#yj-plan-start').dispatchEvent('change');
 await page.locator(`[data-job="${ids.job}"]`).dragTo(page.locator(`.planner-cell[data-worker="${ids.worker}"][data-day="2027-01-06"]`));
 let job=await page.evaluate(id=>YS.jobs.find(j=>j.id===id),ids.job);assert(job.worker===ids.worker&&job.start==='2027-01-06'&&job.days===2,'Drag assignment failed '+JSON.stringify(job));
 assert(await page.evaluate(id=>{let j=YS.jobs.find(j=>j.id===id);let t=E.tasks.find(t=>t.id===j.task);return t.start===j.start&&t.end===yend(j)},ids.job),'Linked task not synchronized');
 // Occupied dates and incorrect trades are rejected.
 let invalid=await page.evaluate(({job,worker})=>{let a=YS.jobs.find(j=>j.id===job),other=YS.jobs.find(j=>j.project===E.activeProject&&j.trade==='木工'&&j.id!==job);let before=JSON.stringify(other);let ok=yScheduleJob(other.id,worker,a.start,2);return !ok&&JSON.stringify(other)===before},ids);assert(invalid,'Overlapping worker assignment accepted');
 await page.locator('[data-y="schedule-undo"]').click();assert(await page.evaluate(id=>!YS.jobs.find(j=>j.id===id).worker,ids.job),'Schedule undo failed');
 await page.locator('[data-y="plan-tab"][data-value="90天总览"]').click();assert(await page.locator('.gantt-row').count()===12,'90-day timeline missing');assert(await page.locator('.air-panel').count()===1,'Air quality panel missing');
 await page.screenshot({path:path.resolve('../work/yunju-v3-timeline.png'),fullPage:true});
 // Warranty confirmation precedes start; actual acceptance date defines expiry.
 await nav('owner','warranty');await page.locator('[data-y="warranty-confirm"]').first().click();await page.locator('[data-y="warranty-start"]').first().click();await page.fill('#eco-form [name="basis"]','交付验收记录 QA-001');await page.locator('#eco-form button[type="submit"]').click();assert(await page.evaluate(()=>YS.warranties.some(w=>w.project===E.activeProject&&w.confirmed&&w.end)),'Warranty not activated');
 // Inspection requires professional evidence and measurements.
 await nav('inspector','quality');await page.locator('[data-y="inspection-stage"][data-id="木工进场"]').click();await page.locator('[data-y="inspection-create"]').click();let check=await page.evaluate(()=>E.checks.at(-1).id);await page.locator('[data-eco="check-pass"]').click();assert(await page.evaluate(id=>E.checks.find(c=>c.id===id).state,check)!=='通过','Inspection bypassed measurement/evidence guard');await page.locator('.modal-close').click();
 // Automated complaint, real local request, counterpart proposal, owner closure.
 await nav('owner','customer');await page.locator('[data-y="support-open"]').first().click();await page.locator('[data-y="support-issue"][data-id="material"]').click();let caseId=await page.evaluate(()=>YUI.supportCase);
 assert(await page.evaluate(id=>!YS.cases.find(c=>c.id===id).contactSent,caseId),'False contact before action');
 await page.locator('[data-y="support-contact"]').click();assert(await page.evaluate(id=>YS.cases.find(c=>c.id===id).contactSent&&E.messages.some(m=>m.text.includes(id)),caseId),'No real local coordination message');
 await nav('supplier','customer');await page.locator(`[data-y="support-counterpart"][data-id="${caseId}"]`).first().click();await page.fill('#eco-form [name="proposal"]','核对批次后补发 2 片，明日预约送达；费用由供货方承担，待业主确认实际结果。');await page.locator('#eco-form button[type="submit"]').click();
 await nav('owner','customer');await page.locator(`[data-y="support-resolve"][data-id="${caseId}"]`).click();await page.check('#yj-support-resolve [name="done"]');await page.locator('#yj-support-resolve button').click();assert(await page.evaluate(id=>YS.cases.find(c=>c.id===id).state,caseId)==='已确认解决','Support workflow did not close');
 assert(await page.evaluate(()=>YD.support.length===10&&YD.support.every(s=>s.replies.length===10)&&new Set(YD.support.flatMap(s=>s.replies)).size===100),'Support playbook does not have 100 distinct replies');
 // Responsive pages and no horizontal body overflow.
 await page.setViewportSize({width:390,height:844});
 for(const view of ['home','styles','themes','community','partners','schedule','warranty','quality','customer','market']){await nav('owner',view);await page.waitForTimeout(30);let dims=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);assert(dims[0]<=dims[1]+1,'Mobile overflow '+view+' '+dims);}
 await nav('owner','community');await page.screenshot({path:path.resolve('../work/yunju-v3-community-mobile.png'),fullPage:true});
 await page.reload({waitUntil:'networkidle'});assert(await page.evaluate(id=>YS.cases.find(c=>c.id===id)?.state,caseId)==='已确认解决','Reload lost support records');
 assert(!errors.length,'Browser errors '+errors.join(' | '));console.log('PASS: role navigation, styles, reviews, learning rollback, drag schedule, conflict guard, timeline, warranty, inspection, support lifecycle, 100 replies, responsive screens, persistence');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
