
/* Site safety is scoped to the inspector workspace. External recognition owns its alerts. */
function yunjuSafetyCard(){
 if(state.role!=='inspector'||!['home','quality','project'].includes(state.view)||document.getElementById('yunju-safety-card'))return;
 const card=document.createElement('section');card.id='yunju-safety-card';card.className='panel';card.style.cssText='margin:20px 0;padding:24px';
 card.innerHTML=`<div class="section-head"><div><span class="eyebrow">SITE SAFETY</span><h2>现场安全监测</h2><p class="subtext">让施工现场的每一份安全，都有人关注。</p></div><span class="pill purple">吸烟识别 · 视频测试</span></div><p>上传施工视频，使用吸烟识别工具检测并查看报警。摄像头实时通道待接入。</p><div class="button-row"><button class="primary" id="yj-smoke-open">上传视频测试 ↗</button><button class="outline" id="yj-camera-open">摄像头通道 · 待接入</button></div>`;
 document.getElementById('content').append(card);
 document.getElementById('yj-smoke-open').onclick=()=>{modal('现场安全 · 吸烟识别',`<p class="subtext">在下方工具中上传视频并开始检测，识别状态及报警在工具内显示。当前仅支持吸烟检测。</p><iframe title="施工视频吸烟检测与报警" src="https://guagua-cpu.github.io/smoke-recognition/web/index.html" style="width:100%;height:62vh;border:1px solid #e5dfd5;border-radius:12px;background:white" allow="fullscreen"></iframe><p class="subtext">若无法加载或上传，<a href="https://guagua-cpu.github.io/smoke-recognition/web/index.html" target="_blank" rel="noopener noreferrer">在独立窗口打开识别工具 ↗</a></p>`);};
 document.getElementById('yj-camera-open').onclick=()=>modal('摄像头视频通道',`<div class="hint-box"><h3>实时监控，待接入</h3><p>已预留摄像头通道入口，当前尚未连接设备。可先通过上传施工视频测试吸烟识别与报警。</p></div><p class="subtext">后续接入项目摄像头后，可在这里选择视频通道并启动现场检测。</p>`);
}
const safetyRender=render;render=function(){safetyRender();yunjuSafetyCard();};yunjuSafetyCard();
