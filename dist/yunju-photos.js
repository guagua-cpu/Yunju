/* Licensed stock photography: every photograph retains its provenance.
   Limited reuse is permitted by the user; no stock face is a real provider ID. */
const PM=YPHOTO.items,PA=YPHOTO.assignments;
let photoLibraryKind='全部',photoLibraryShown=48;
const originalPhotoProducts=products.length;
// Keep referenced order/plan items and a representative catalog, rather than
// retaining hundreds of near-identical demo variants just to repeat pictures.
const photoReferences=new Set([...state.selected,...state.favorites,...state.compare,...E.projects.flatMap(p=>p.selected||[]),...E.orders.map(o=>o.product),...E.items.map(o=>o.product),...E.inquiries.map(o=>o.product)]);
const photoKeep=[];const photoSubs=new Map();
for(const p of products){let key=p.cat+'|'+p.sub,n=photoSubs.get(key)||0;if(photoReferences.has(p.id)||/^p\d+$/.test(p.id)||(PA['product:'+p.id]&&n<2)){photoKeep.push(p);photoSubs.set(key,n+1);}}
products.splice(0,products.length,...photoKeep);marketCache.key='';
function photoFor(key){return PM[PA[key]];}
function photoHtml(a,label,kind=''){return `<img class="licensed-photo" src="${esc(a.src)}" width="${a.width}" height="${a.height}" loading="lazy" decoding="async" alt="${esc(label)}，${kind==='people'?'职业情景配图，不是服务商本人照片':'素材示意，不代表具体商品型号或实际交付案例'}"><span class="stock-photo-note">${kind==='people'?'职业形象示意':kind==='material'?'材料 / 安装示意':'空间灵感参考'}<span> · ${esc(a.author)} · ${a.license.includes('CC0')?'CC0':a.license.includes('Pexels')?'Pexels':esc(a.license)}</span></span>`;}
function fillPhoto(el,key,label){let a=photoFor(key);if(!a||!el)return false;if(el.dataset.photo===a.id)return true;el.dataset.photo=a.id;el.dataset.photoKey=key;el.classList.add('has-licensed-photo');el.title=`${a.author} · ${a.license} · 来源：${a.source}`;el.innerHTML=photoHtml(a,label||a.title,a.kind);el.setAttribute('aria-label',label||a.title);return true;}
function photoCardId(card){return card.querySelector('[data-action="product"]')?.dataset.id||card.querySelector('[data-action="favorite"]')?.dataset.id;}
function applySitePhotos(){
 const root=state.view==='space'?$('#space-page'):$('#content');if(!root)return;
 root.querySelectorAll('.product-card').forEach(card=>{let id=photoCardId(card),p=productBy(id);if(p)fillPhoto(card.querySelector('.image-slot'),'product:'+id,p.name);});
 if(state.view==='partners')root.querySelectorAll('.work-card').forEach(card=>{let id=card.querySelector('[data-eco="partner-view"]')?.dataset.id,p=people.find(p=>p.id===id);if(p)fillPhoto(card.querySelector('.image-slot'),'person:'+id,p.role+'职业情景');});
 root.querySelectorAll('.style-card').forEach(card=>{let name=card.dataset.id;fillPhoto(card.querySelector('.style-image-reserved'),'style:'+name,name==='新中式'?'新中式选材方向：木色与留白参考':name+'空间参考');});
 if(state.view==='styles'&&YUI.style)fillPhoto(root.querySelector('.style-detail-top .image-slot'),'style:'+YUI.style,YUI.style+'空间灵感');
 if(state.view==='themes'){
  root.querySelectorAll('.theme-card').forEach((card,i)=>{let t=YD.themes[i];fillPhoto(card.querySelector('.image-slot'),'theme:'+t.id,t.name+'改造参考');});
  if(YUI.theme){fillPhoto(root.querySelector('.theme-detail .image-slot'),'theme:'+YUI.theme,YD.themes.find(t=>t.id===YUI.theme)?.name+'空间参考');let extra=root.querySelector('.two-cols .image-slot');let theme=YD.themes.find(t=>t.id===YUI.theme),style=theme?.id==='gaming'?'电竞风':theme?.id==='wedding'?'法式风':'自然风';fillPhoto(extra,'style:'+style,'细节与材质搭配参考');}
 }
 root.querySelectorAll('.post-card[data-post]').forEach(card=>{let id=card.dataset.post,p=yAllPosts().find(p=>p.id===id),el=card.querySelector('.post-photo');if(p&&!yPhoto(p.photo)&&fillPhoto(el,'post:'+id,p.style+'居住场景参考'))el.insertAdjacentHTML('beforeend',`<span class="post-topic">${esc(p.topic)}</span>`);});
 if(state.view==='home')fillPhoto(root.querySelector('.project-preview .image-slot'),'project:'+E.activeProject,currentProject().name+'空间效果参考');
 if(state.view==='designs')root.querySelectorAll('.work-card').forEach((el,i)=>{let d=projectRows('designs')[i];if(d)fillPhoto(el.querySelector('.image-slot'),'design:'+d.id,'方案空间参考');});
 // Any remaining generic picture guide slot receives an appropriate source,
 // rather than an external hotlink or a generated/watermarked picture.
 root.querySelectorAll('.image-slot:not(.has-licensed-photo)').forEach(el=>{
  let text=el.getAttribute('aria-label')||el.textContent;
  if(/真实|户型资料|检测|报告|证照/.test(text))return;
  let p=products.find(p=>p.image===text.replace('图片预留：',''));
  if(p)fillPhoto(el,'product:'+p.id,p.name);
 });
 let link=$('.sidebar [data-route="assets"]');if(link)link.innerHTML='◇ 图片与素材库';
 let footer=$('.site-footer');if(footer&&!footer.querySelector('.photo-attribution-link'))footer.insertAdjacentHTML('beforeend','<button class="photo-attribution-link" data-route="assets">图片来源与授权 ↗</button>');
 applyModalPhotos();
}
function applyModalPhotos(){
 if($('#overlay').hidden)return;let host=$('#modal-content'),title=$('#modal-title')?.textContent||'';
 let p=products.find(p=>p.name===title),person=people.find(p=>p.name===title),post=yAllPosts().find(p=>p.title===title);
 let slots=[...host.querySelectorAll('.image-slot:not(.has-licensed-photo)')];
 if(p)slots.forEach(el=>fillPhoto(el,'product:'+p.id,p.name));
 else if(person){if(slots[0])fillPhoto(slots[0],'person:'+person.id,person.role+'职业形象示意');if(slots[1])fillPhoto(slots[1],'case:'+person.id,'空间灵感参考，非该服务商真实案例');}
 else if(post&&!yPhoto(post.photo))slots.forEach(el=>fillPhoto(el,'post:'+post.id,post.style+'居住情景参考'));
 else if(title.includes('推广预览')){let name=host.querySelector('h3')?.textContent;let goods=products.find(p=>p.name===name);if(goods)slots.forEach(el=>fillPhoto(el,'product:'+goods.id,goods.name));}
}
const photoRender=render;render=function(){photoRender();applySitePhotos();};
const photoModal=modal;modal=function(title,body,wide=false){photoModal(title,body,wide);applyModalPhotos();};
const photoLibraryNames={people:'职业人物',interior:'成品空间',material:'材料与商品'};
renderAssets=function(){let all=Object.values(PM),list=all.filter(a=>photoLibraryKind==='全部'||a.kind===photoLibraryKind);return intro('REAL PHOTOGRAPHS, CLEAR SOURCES','云居素材库 · '+all.length+' 张图片','已下载到本站，包含职业人物、成品空间、材料及商品实拍。照片均作情景参考，不能据此认定服务商身份或所售型号。',`<a class="outline compact" href="assets/photo-sources.json" download>下载来源与授权清单</a>`)+`<div class="photo-library-summary"><span>${all.filter(a=>a.kind==='people').length} 张职业人物</span><span>${all.filter(a=>a.kind==='interior').length} 张空间参考</span><span>${all.filter(a=>a.kind==='material').length} 张材料与商品</span><span>商品展示已从 ${originalPhotoProducts} 个精简为 ${products.length} 个</span></div><div class="module-tabs">${[['全部','全部图片'],['people','职业人物'],['interior','成品空间'],['material','材料与商品']].map(([id,name])=>`<button class="${photoLibraryKind===id?'active':''}" data-photo-filter="${id}">${name}</button>`).join('')}</div><div class="notice">CC0、公有领域、CC BY / BY-SA 与 Pexels 免费自定义许可分别记录，免费使用不等于统一采用开源许可。人物不代表其推荐本平台；素材不冒充真实成交或交付案例。处理仅为等比缩小与网页格式转换。</div><div class="photo-library-grid">${list.slice(0,photoLibraryShown).map(a=>`<article><div class="library-picture">${photoHtml(a,a.title,a.kind)}</div><div><span class="pill warm">${photoLibraryNames[a.kind]}</span><h3>${esc(a.title)}</h3><p>${esc(a.author)} · ${a.width} × ${a.height}</p><p>${esc(a.license)}</p><div class="button-row"><a href="${esc(a.source)}" target="_blank" rel="noopener noreferrer">原始来源 ↗</a><a href="${esc(a.licenseUrl)}" target="_blank" rel="noopener noreferrer">授权条款 ↗</a></div></div></article>`).join('')}</div><div class="photo-library-more"><p>当前展示 ${Math.min(photoLibraryShown,list.length)} / ${list.length} 张</p>${photoLibraryShown<list.length?'<button class="primary" data-photo-more>再看 48 张</button>':''}</div>`;};
document.addEventListener('click',e=>{let filter=e.target.closest('[data-photo-filter]'),more=e.target.closest('[data-photo-more]');if(!filter&&!more)return;e.preventDefault();e.stopImmediatePropagation();if(filter){photoLibraryKind=filter.dataset.photoFilter;photoLibraryShown=48;}else photoLibraryShown+=48;render();},true);
actions['export-assets']=()=>{let a=document.createElement('a');a.href='assets/photo-sources.json';a.download='yunju-photo-sources.json';a.click();};
// Existing content refers to 'reserved photos' in a few introductions; update
// those sentences only. Business workflows, roles and BoHack are untouched.
const photoStyles=yRenderStyles;yRenderStyles=function(){return photoStyles().replaceAll('图片位预留','已配空间参考图');};newViews.styles=()=>yRenderStyles();
const photoThemes=yRenderThemes;yRenderThemes=function(){return photoThemes().replaceAll('图片位预留，方法与交付范围先讲清。','参考图片、改造方法与交付范围先讲清。');};newViews.themes=()=>yRenderThemes();
const photoCommunity=yRenderCommunity;yRenderCommunity=function(){return photoCommunity().replaceAll('图片位已预留；你的分享仅保存在本机。','已配居住场景参考图；你的分享仅保存在本机。');};newViews.community=()=>yRenderCommunity();
render();
