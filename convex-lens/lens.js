'use strict';
(function (root) {
  const FOCAL = 10;
  const RULES = [
    {id:'far',u:'u > 2f',v:'异侧，f < v < 2f',size:'缩小',nature:'倒立 · 实像',app:'照相机',compare:'u > v'},
    {id:'double',u:'u = 2f',v:'异侧，v = 2f',size:'等大',nature:'倒立 · 实像',app:'等大成像；不必硬配仪器',compare:'u = v'},
    {id:'between',u:'f < u < 2f',v:'异侧，v > 2f',size:'放大',nature:'倒立 · 实像',app:'投影仪 / 幻灯机',compare:'u < v'},
    {id:'focus',u:'u = f',v:'不成有限远的像',size:'—',nature:'出射光平行',app:'先记住边界条件',compare:'不能作有限像距比较'},
    {id:'inside',u:'u < f',v:'同侧，虚像',size:'放大',nature:'正立 · 虚像',app:'放大镜',compare:'虚像到透镜的距离大于 u'}
  ];
  function model(u,f=FOCAL) {
    if(!Number.isFinite(u)||!Number.isFinite(f)||u<=0||f<=0)throw new RangeError('Object distance and focal length must be positive finite numbers.');
    const atFocus=Math.abs(u-f)<1e-8;
    const regime=atFocus?'focus':u<f?'inside':Math.abs(u-2*f)<1e-8?'double':u>2*f?'far':'between';
    const v=atFocus?null:f*u/(u-f);
    return {u,f,v,m:v===null?null:Math.abs(v/u),real:v!==null&&v>0,regime,rule:RULES.find(r=>r.id===regime)};
  }
  const CLUES = {
    'real-far':{ids:['between'],result:'只有这一行：f < u < 2f，u < v，倒立、放大、实像；典型应用是投影仪。'},
    'object-far':{ids:['far'],result:'只有这一行：f < v < 2f，u > v，倒立、缩小、实像；典型应用是照相机。'},
    'real-near':{ids:['far'],result:'注意已知的是像距 v，不是物距 u。实像在 F 与 2F 之间 ⇒ 物体在 2F 以外 ⇒ u > v ⇒ 倒立缩小实像。'},
    equal:{ids:['double'],result:'u = 2f ⇒ v = 2f ⇒ u = v ⇒ 倒立、等大、实像。这里不必硬凑一种常用仪器。'},
    upright:{ids:['inside'],result:'凸透镜前放实际物体时，正立的像对应：u < f，正立放大虚像、物像同侧，不能用光屏承接；应用是放大镜。'},
    'real-only':{ids:['far','double','between'],result:'还有三行都符合！只能确定 u > f、倒立、物像异侧且可用光屏承接；放大、等大、缩小都可能，应用也不能唯一确定。'},
    'large-only':{ids:['between','inside'],result:'还剩两行：“倒立放大的实像”和“正立放大的虚像”。只知道“放大”不够；还要问能否用光屏承接，或者是正立还是倒立。'}
  };
  const API={model,RULES,CLUES};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.LensModel=API;
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id),all=s=>[...document.querySelectorAll(s)];
  const text=(id,value)=>{$(id).textContent=value;};
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const round=(n,d=2)=>Number(n.toFixed(d));
  const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  const xy=(x,y)=>`${round(x)},${round(y)}`;
  const line=(a,b,c,d,color='#94b5b7',width=2,extra='')=>`<line x1="${round(a)}" y1="${round(b)}" x2="${round(c)}" y2="${round(d)}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const label=(x,y,t,color='#c2dcdb',size=21,anchor='middle')=>`<text x="${round(x)}" y="${round(y)}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${esc(t)}</text>`;
  function ray(x1,y1,x2,y2,color,width=2.5){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);if(!len)return '';
    const ux=dx/len,uy=dy/len,mx=x1+dx*.58,my=y1+dy*.58;
    return line(x1,y1,x2,y2,color,width)+`<path d="M${xy(mx+ux*8,my+uy*8)} L${xy(mx-ux*6-uy*4,my-uy*6+ux*4)} L${xy(mx-ux*6+uy*4,my-uy*6-ux*4)}Z" fill="${color}"/>`;
  }
  const handle=(x,y,kind)=>`<g class="drag-handle" data-drag="${kind}"><circle cx="${round(x)}" cy="${round(y)}" r="24" fill="#ffcf6f16" stroke="#ffcf6f55"/><circle cx="${round(x)}" cy="${round(y)}" r="9" fill="#ffcf6f"/></g>`;
  function candle(h,color='#efd58d',dashed=false){
    const w=h*.12;return `<rect x="${-w}" y="${-h*.65}" width="${w*2}" height="${h*.65}" rx="2" fill="${dashed?'none':color}" stroke="${color}" stroke-width="2" ${dashed?'stroke-dasharray="5 4"':''}/><path d="M0 ${-h} Q${-h*.25} ${-h*.64} 0 ${-h*.65} Q${h*.2} ${-h*.73} 0 ${-h}Z" fill="${dashed?'none':'#ffb87e'}" stroke="${color}" stroke-width="1.5" ${dashed?'stroke-dasharray="4 3"':''}/>`;
  }
  function lens(x,y,height=118){return `<path d="M${x} ${y-height} Q${x-27} ${y} ${x} ${y+height} Q${x+27} ${y} ${x} ${y-height}Z" fill="#78e0d620" stroke="#86ded6" stroke-width="2.2"/>`;}
  function showPanel(index,scroll=true){
    all('[data-tab]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;$(`panel-${i}`).hidden=i!==index;});
    if(scroll)$('classroom').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    if(index===1)renderLab();
    if(index===2)renderGuide();
  }
  all('[data-go]').forEach(b=>b.addEventListener('click',()=>showPanel(Number(b.dataset.go))));
  all('[data-tab]').forEach(b=>{
    b.addEventListener('click',()=>showPanel(Number(b.dataset.tab)));
    b.addEventListener('keydown',e=>{let n=Number(b.dataset.tab);if(e.key==='ArrowRight')n=(n+1)%4;else if(e.key==='ArrowLeft')n=(n+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();showPanel(n,false);$(`tab-${n}`).focus();});
  });
  function drawTerms(active='u'){
    const O=480,Y=160,U=280,V=680;
    let s=line(70,Y,900,Y,'#8daba6',1.5)+lens(O,Y,104);
    s+=`<g transform="translate(${U} ${Y})">${candle(66,'#476e5f')}</g><g transform="translate(${V} ${Y}) scale(1 -1)">${candle(66,'#476e5f')}</g>`;
    s+=label(U,65,'蜡烛（物）','#244d49',23)+label(O,28,'凸透镜','#244d49',23)+label(V,65,'光屏上的实像','#244d49',23);
    for(const sign of [-1,1])for(const k of [1,2]){const x=O+sign*k*100;s+=line(x,Y-5,x,Y+5,'#5c897e',2)+label(x,Y+27,k===1?'F':'2F','#3c7464',18);}
    const color=active==='u'?'#c88e2f':'#5f8d7a';s+=line(U,255,O,255,color,active==='u'?5:2)+line(U,247,U,263,color)+line(O,247,O,263,color)+label((U+O)/2,290,'u：物体到透镜',color,22);
    const c2=active==='v'?'#c88e2f':'#5f8d7a';s+=line(O,255,V,255,c2,active==='v'?5:2)+line(V,247,V,263,c2)+label((V+O)/2,290,'v：像到透镜',c2,22);
    s+=line(O,88,O+100,88,active==='f'?'#c88e2f':'#6c9a91',active==='f'?5:2)+label(O+50,74,'f',active==='f'?'#b7791d':'#4f7d72',23);
    $('terms-svg').innerHTML=s;
    const notes={u:'u 只量“物体到透镜”。题目写 u > 2f，说的是物体在 2F 外，不是在说像。',v:'v 只量“像到透镜”。光屏恰好接到清晰实像时，透镜到光屏的距离才等于像距；没调清晰时不能混为一谈。',f:'f 是这块透镜的焦距。本课固定 f = 10 cm，因此 2f = 20 cm；F 是位置，f 是距离，大小写不是一回事。'};text('term-note',notes[active]);
  }
  all('[data-term]').forEach(b=>b.addEventListener('click',()=>{all('[data-term]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));drawTerms(b.dataset.term);}));drawTerms();
  all('[data-term-answer]').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.termAnswer==='between';$('term-check').className='feedback'+(ok?'':' bad');text('term-check',ok?'✓ 对了。10 < 15 < 20，所以 f < u < 2f。注意这里的 15 cm 是物距 u。':'把数字先排好：f = 10，2f = 20，而 u = 15。15 在 10 和 20 之间，所以物体在 F 与 2F 之间。');}));
  const state={u:30,screen:15,showScreen:true,rays:true};
  let geometry=null,traceFrame=0;
  function renderLab(){
    cancelAnimationFrame(traceFrame);
    const m=model(state.u),v=m.v,absV=v===null?0:Math.abs(v),O=500,Y=190;
    // A distant screen must not compress the lens and object into an unreadable cluster.
    const scale=Math.min(10,400/Math.max(state.u,absV,40));
    const h=Math.min(64,m.m?150/m.m:64),X=O-state.u*scale,XI=v===null?null:O+v*scale,XS=O+state.screen*scale;
    const top=Y-h,imageTop=v===null?null:Y+h*v/state.u,right=960;
    const paths=[[[X,top],[O,top],[right,top+h*((right-O)/scale)/FOCAL]],[[X,top],[O,Y],[right,Y+h*((right-O)/scale)/state.u]]];
    geometry={O,Y,scale,h,X,XI,XS,top,imageTop,paths};
    let s=`<defs><clipPath id="plot-clip"><rect x="10" y="10" width="980" height="414"/></clipPath></defs><g clip-path="url(#plot-clip)">`;
    s+=line(35,Y,968,Y,'#81aaa9',1.2)+lens(O,Y,113);
    s+=label(O,43,'凸透镜','#c5e1dd',22)+label(O,337,'O 光心','#98bdb9',18);
    for(const sign of [-1,1])for(const k of [1,2]){const x=O+sign*k*FOCAL*scale;s+=line(x,Y-5,x,Y+5,'#adcbc7',2)+label(x,Y+(k===1?29:53),k===1?'F':'2F','#c4d5bf',20);}
    if(state.rays){
      s+=ray(X,top,O,top,'#ff9a7c')+ray(O,top,right,paths[0][2][1],'#ff9a7c');
      s+=ray(X,top,O,Y,'#78e0d6')+ray(O,Y,right,paths[1][2][1],'#78e0d6');
      if(v!==null&&v<0){s+=line(O,top,XI,imageTop,'#ff9a7c',2,'stroke-dasharray="7 6" data-extension="parallel"')+line(O,Y,XI,imageTop,'#78e0d6',2,'stroke-dasharray="7 6" data-extension="central"');}
    }
    if(state.showScreen){if(XS<=945){s+=`<rect x="${round(XS-5)}" y="70" width="10" height="282" rx="4" fill="#b9c9b6" opacity=".65"/>`+label(clamp(XS,80,920),58,'光屏位置','#d7dfc8',21);s+=handle(XS,390,'screen');}else{s+=label(970,68,`光屏在图外 → ${fmt(state.screen)} cm`,'#d7dfc8',20,'end');}}
    if(v!==null){
      s+=`<g id="image-glyph" data-v="${v}" data-magnification="${m.m}" data-kind="${m.real?'real':'virtual'}" transform="translate(${round(XI)} ${Y}) scale(${round(m.m,5)} ${round(m.real?-m.m:m.m,5)})">${candle(h,'#f4cf88',!m.real)}</g>`;
      s+=label(clamp(XI,95,900),m.real?Math.min(365,imageTop+32):Math.max(26,imageTop-22),m.real?'倒立实像':'正立虚像','#f5d78c',23);
    }
    s+=`<g class="drag-handle" data-drag="object" id="object-glyph" transform="translate(${round(X)} ${Y})">${candle(h)}</g>`;
    s+=label(clamp(X,90,910),Math.max(67,top-24),'蜡烛','#f1d791',23)+handle(X,390,'object');
    s+=line(X,354,O,354,'#bca578',1.5)+label((X+O)/2,378,`u = ${fmt(state.u)} cm`,'#ead4a5',20);
    if(v!==null){s+=line(O,v>0?305:105,XI,v>0?305:105,'#9dbaaa',1.5)+label((O+XI)/2,v>0?328:94,`${m.real?'v':'虚像距'} = ${fmt(absV)} cm`,'#c5ddd1',19);}
    if(v===null)s+=label(736,365,'出射光平行，不在有限远相交','#f0d093',22);
    if(!m.real&&v!==null)s+=label(758,85,'透过透镜看向左侧的虚像','#d6dfd0',19);
    s+='</g>';$('lens-svg').innerHTML=s;
    $('lens-svg').setAttribute('aria-label',`物距 ${state.u} 厘米，${m.rule.u}，${m.rule.v}，${m.rule.size}，${m.rule.nature}`);
    text('u-out',`${fmt(state.u)} cm`);text('screen-out',`${fmt(state.screen)} cm`);
    text('metric-u',m.rule.u);text('metric-v',v===null?'没有有限像距':m.real?m.rule.v.replace('异侧，',''):'与物体同侧');
    text('metric-image',m.regime==='focus'?'不成有限远的像':m.rule.nature.replace(' · ',` · ${m.rule.size} · `));
    text('metric-app',m.regime==='double'?'等大成像':m.regime==='focus'?'这是分界点':m.rule.app);
    text('case-label',m.regime==='far'?'照相机的成像情形':m.regime==='between'?'投影仪的成像情形':m.regime==='inside'?'放大镜的成像情形':m.regime==='double'?'实像大小的分界点':'实像 / 虚像的分界点');
    text('scale-note',`${scale<9.9?'像或光屏较远，示意已缩小视野。':'焦距固定：F 是 10 cm 处，2F 是 20 cm 处。'}光路按未放光屏画出，竖条只标光屏位置；放上光屏的效果看预览。图会缩放，物体大小不变。`);
    const screenFocused=m.real&&Math.abs(state.screen-v)<=.12;
    let explanation='';
    if(m.real)explanation=`<strong>${m.rule.u}</strong>：两条折射光线在右侧实际相交，得到<strong>倒立、${m.rule.size}的实像</strong>。像距约 ${fmt(v)} cm。${!state.showScreen?'光屏移走了，成像位置仍在，实像没有消失。':screenFocused?'光屏刚好在像的位置，所以看到清晰的像。':`现在光屏在 ${fmt(state.screen)} cm，不在像的位置；按“把光屏移到清晰处”试试。`}`;
    else if(m.regime==='focus')explanation='<strong>u = f：</strong>折射后的光线平行，不在有限远相交。因此无论把光屏放在哪个有限位置，都不能接到清晰的像；不是“像太小看不见”。';
    else explanation=`<strong>u < f：</strong>右侧的实际光线没有相交；它们向后延长，在左侧相交。因此得到<strong>正立、放大的虚像</strong>，物像同侧，像到透镜约 ${fmt(absV)} cm。眼睛能透过透镜看见，但光屏不能接到清晰虚像。`;
    $('lab-explain').innerHTML=explanation;
    $('focus-screen').disabled=!m.real||!state.showScreen;
    all('[data-u]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.u)===state.u)));
    renderScreen(m,screenFocused);renderTable(m.regime);
  }
  function renderScreen(m,focused){
    let s='<rect x="12" y="8" width="216" height="114" rx="8" fill="#dce5c9"/>';
    let result='';
    if(!state.showScreen){s='<rect x="12" y="8" width="216" height="114" rx="8" fill="#183640" stroke="#49686b" stroke-dasharray="5 5"/>'+label(120,72,'光屏已移走','#b5cbca',20);result='成像规律并未改变';}
    else if(m.real){const blur=focused?0:clamp(Math.abs(state.screen-m.v)*.6,2,15);s+=`<defs><filter id="screen-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><g transform="translate(120 32) scale(1 -1)" filter="url(#screen-blur)">${candle(Math.min(85,45*m.m),'#435f4d')}</g>`;result=focused?'清晰的倒像 ✓':'有光，但像模糊；需要调光屏';}
    else {s+='<ellipse cx="120" cy="65" rx="67" ry="35" fill="#f4f0cc" opacity=".55"/>';result=m.regime==='focus'?'不能接到清晰的像':'光屏不能接到这个虚像';}
    $('screen-svg').innerHTML=s;text('screen-result',result);
  }
  function renderTable(current){$('rules-table').innerHTML=RULES.map(r=>`<tr class="${r.id===current?'current':''}"><td>${esc(r.u)}</td><td>${esc(r.v)}</td><td>${r.size}</td><td>${r.nature}</td><td>${r.app}</td></tr>`).join('');}
  function setU(value,focus=false){state.u=clamp(value,5,40);$('object-u').value=state.u;const m=model(state.u);if(focus&&m.real){state.screen=round(m.v,1);$('screen-distance').value=state.screen;}renderLab();}
  $('object-u').addEventListener('input',()=>setU(Number($('object-u').value)));
  $('screen-distance').addEventListener('input',()=>{state.screen=Number($('screen-distance').value);renderLab();});
  all('[data-u]').forEach(b=>b.addEventListener('click',()=>setU(Number(b.dataset.u))));
  $('focus-screen').addEventListener('click',()=>{const m=model(state.u);if(m.real){state.screen=round(m.v,1);$('screen-distance').value=state.screen;renderLab();}});
  $('screen-toggle').addEventListener('click',()=>{state.showScreen=!state.showScreen;$('screen-toggle').setAttribute('aria-pressed',String(state.showScreen));text('screen-toggle',`光屏：${state.showScreen?'显示':'隐藏'}`);renderLab();});
  $('rays-toggle').addEventListener('click',()=>{state.rays=!state.rays;$('rays-toggle').setAttribute('aria-pressed',String(state.rays));text('rays-toggle',`光路：${state.rays?'显示':'隐藏'}`);renderLab();});
  $('zoom-diagram').addEventListener('click',()=>{const on=$('zoom-diagram').getAttribute('aria-pressed')!=='true';$('zoom-diagram').setAttribute('aria-pressed',String(on));text('zoom-diagram',on?'收回全图 ↙':'放大光路图 ↗');document.querySelector('.plot').classList.toggle('zoomed',on);const scroller=document.querySelector('.plot-scroll');scroller.scrollLeft=on?(scroller.scrollWidth-scroller.clientWidth)/2:0;text('zoom-hint',on?'左右滑动图像，查看蜡烛、焦点和像。':'手机看不清标注时，可以点“放大光路图”。');});
  $('mission-start').addEventListener('click',()=>{setU(30,true);$('lens-svg').scrollIntoView({block:'center',behavior:'smooth'});});
  $('mission-end').addEventListener('click',()=>{setU(15);$('lens-svg').scrollIntoView({block:'center',behavior:'smooth'});});
  let drag=null,dragGeometry=null;
  const svg=$('lens-svg');
  const move=e=>{if(!drag)return;const matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());if(drag==='object'){const u=Math.round(clamp((dragGeometry.O-p.x)/dragGeometry.scale,5,40)*2)/2;setU(u);}else{state.screen=Math.round(clamp((p.x-dragGeometry.O)/dragGeometry.scale,5,220)*2)/2;$('screen-distance').value=state.screen;renderLab();}};
  svg.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-drag]');if(!h)return;drag=h.dataset.drag;dragGeometry={...geometry};svg.setPointerCapture(e.pointerId);e.preventDefault();});
  svg.addEventListener('pointermove',move);['pointerup','pointercancel','lostpointercapture'].forEach(n=>svg.addEventListener(n,()=>{drag=null;}));
  $('trace-light').addEventListener('click',()=>{
    cancelAnimationFrame(traceFrame);svg.querySelectorAll('[data-photon]').forEach(el=>el.remove());
    const m=model(state.u);const paths=geometry.paths.map((points,k)=>m.real?points.slice(0,2).concat([[geometry.XI,geometry.imageTop]]):points);
    const traces=paths.map((points,k)=>{const el=document.createElementNS('http://www.w3.org/2000/svg','circle');el.setAttribute('r','7');el.setAttribute('fill',k===0?'#ff9a7c':'#78e0d6');el.setAttribute('stroke','white');el.setAttribute('data-photon','');svg.querySelector('g[clip-path]').appendChild(el);const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));return{points,lengths,total:lengths.reduce((a,b)=>a+b,0),el};});
    const start=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame=t=>{if(traces.some(t=>!t.el.isConnected))return;const progress=reduce?1:clamp((t-start)/2100,0,1);for(const trace of traces){let d=progress*trace.total,k=0;while(k<trace.lengths.length-1&&d>trace.lengths[k])d-=trace.lengths[k++];const ratio=d/trace.lengths[k],a=trace.points[k],b=trace.points[k+1];trace.el.setAttribute('cx',a[0]+(b[0]-a[0])*ratio);trace.el.setAttribute('cy',a[1]+(b[1]-a[1])*ratio);}if(progress<1)traceFrame=requestAnimationFrame(frame);};frame(start);
    text('scale-note','移动亮点只慢放实际光路，不代表真实光速；虚线不是光实际走过的路。');
  });
  let guideStep=0;
  const GUIDE=[
    ['先认清已知：v 说的是像。','v > 2f，意思是<b>像在透镜另一侧的 2F 外</b>。题目还有“光屏能接到”，所以讨论的是<b>实像</b>。先别急着把物体放到 2F 外——那是把 v 认成 u 了。'],
    ['先找对行：物体在 F 与 2F 之间。','回想实验中的三种实像：只有<b>物体在 F 与 2F 之间</b>这一行，像才在另一侧 2F 外。因此得到 <b>f < u < 2f</b>。不熟悉就点下方按钮，回光学台验证这一行。'],
    ['用 2f 作“中间人”，比较 u 和 v。','刚推出 <b>u < 2f</b>，已知又说 <b>v > 2f</b>。把它们连起来就是 <b>u < 2f < v</b>，所以 <b>u < v</b>。这一步不需要再背新结论。'],
    ['看光路：倒立、放大、实像。','火焰顶端的<b>实际光线在右侧下方相交</b>：能会聚，叫实像；上下颠倒，叫倒立。像离透镜比物体远，图中像也更高，因此是<b>放大的实像</b>。'],
    ['最后才联想应用：投影仪。','投影仪需要把较小的画面，变成光屏上较大的像，正好对应<b>倒立、放大的实像</b>。所以这四条是一整行，不是四个互不相干的答案。']
  ];
  function renderGuide(){
    let s='';const O=420,Y=166,scale=8,X=300,XI=660,h=46;
    s+=`<rect x="580" y="40" width="250" height="245" rx="10" fill="#eeb85c12"/>`;
    if(guideStep>=1)s+='<rect x="260" y="40" width="80" height="245" rx="10" fill="#78dfd71c"/>';
    s+=line(60,Y,850,Y,'#7da8a7',1.3)+lens(O,Y,105);
    for(const sign of [-1,1])for(const k of [1,2]){const x=O+sign*k*80;s+=line(x,Y-5,x,Y+5,'#bad6ca',2)+label(x,Y+26,k===1?'F':'2F','#cfddc4',21);}
    s+=label(O,32,'凸透镜','#bfdbd8',22)+label(710,61,'像在 2F 外','#f7cf88',24);
    s+=`<g transform="translate(${XI} ${Y}) scale(2 -2)">${candle(h)}</g>`;
    if(guideStep>=1)s+=`<g transform="translate(${X} ${Y})">${candle(h)}</g>`+label(X,83,'物体在这里','#9ee6cb',23);
    else s+=label(X,108,'物体在哪？','#bdd2cd',23);
    if(guideStep>=3)s+=ray(X,Y-h,O,Y-h,'#ff9a7c')+ray(O,Y-h,XI,Y+2*h,'#ff9a7c')+ray(X,Y-h,O,Y,'#78e0d6')+ray(O,Y,XI,Y+2*h,'#78e0d6');
    s+=label(680,305,'已知 v > 2f','#f5cb7f',24);
    if(guideStep>=1)s+=label(257,305,'推出 f < u < 2f','#a0e6c3',24);
    $('guide-svg').innerHTML=s;
    const [title,body]=GUIDE[guideStep];$('guide-story').innerHTML=`<span class="tag">第 ${guideStep+1} 步</span><h3>${title}</h3><p>${body}</p>${guideStep===1?'<button id="guide-verify" class="text-button">在光学台验证这一行 ↗</button>':''}`;
    const verify=$('guide-verify');if(verify)verify.addEventListener('click',()=>{state.showScreen=true;state.rays=true;$('screen-toggle').setAttribute('aria-pressed','true');$('rays-toggle').setAttribute('aria-pressed','true');text('screen-toggle','光屏：显示');text('rays-toggle','光路：显示');setU(15,true);showPanel(1);});
    const answers=['f < u < 2f','u < v','倒立 · 放大 · 实像','投影仪 / 幻灯机'],ids=['deduction-u','deduction-compare','deduction-nature','deduction-app'];
    ids.forEach((id,i)=>text(id,guideStep>=i+1?answers[i]:'等待推导…'));
    all('[data-reveal]').forEach(el=>el.classList.toggle('revealed',guideStep>=Number(el.dataset.reveal)));
    $('guide-prev').disabled=guideStep===0;$('guide-next').disabled=guideStep===4;text('guide-next',guideStep===4?'推导完成 ✓':'推下一步 →');text('guide-count',`第 ${guideStep+1} / 5 步`);
  }
  $('guide-next').addEventListener('click',()=>{guideStep=Math.min(4,guideStep+1);renderGuide();});$('guide-prev').addEventListener('click',()=>{guideStep=Math.max(0,guideStep-1);renderGuide();});renderGuide();
  function renderClue(extra=false){
    const key=$('clue-select').value,c=extra&&key==='large-only'?CLUES['real-far']:CLUES[key];
    $('candidate-rows').innerHTML=RULES.map(r=>`<div class="candidate ${c.ids.includes(r.id)?'match':''}"><b>${esc(r.u)}</b><small>${r.size} / ${r.nature}</small><span class="marker">${c.ids.includes(r.id)?'✓ 符合':'不符合'}</span></div>`).join('');
    text('clue-result',(extra?'补上“能用光屏接到”，排除了放大的虚像。':'')+c.result);
    $('extra-clue').hidden=key!=='large-only'||extra;
  }
  $('clue-select').addEventListener('change',()=>renderClue());$('add-screen-clue').addEventListener('click',()=>renderClue(true));renderClue();
  // Options deliberately contain plausible misconceptions rather than arbitrary distractors.
  const QUIZ=[
    {topic:'像距反推物距',given:'光屏在透镜另一侧接到像，且 v > 2f。',context:'就是刚才那道题。这次不看答案，自己补齐四条。',fields:[
      ['物距 u 的范围',['u > 2f','u = 2f','f < u < 2f','u < f'],2,'别把 v 看成 u。实像在 2F 外，物体在哪一段？'],
      ['u 和 v 的关系',['u > v','u = v','u < v','一定不能比较'],2,'把 u < 2f 和 2f < v 连起来。'],
      ['像的性质',['正立、放大、虚像','倒立、放大、实像','倒立、缩小、实像','倒立、等大、实像'],1,'光屏能接到是实像；这一行的像比物体大。'],
      ['典型应用',['照相机','放大镜','投影仪','不能成像'],2,'哪一种工具把小画面变成光屏上的大画面？']],
      hint:'先锁定“实像”三行，再找哪一行的 v > 2f。得到 u 的范围后，用 2f 作桥梁比较 u、v。',reason:'v > 2f（实像）⇒ f < u < 2f ⇒ u < 2f < v ⇒ u < v ⇒ 倒立放大的实像 ⇒ 投影仪。'},
    {topic:'物距推像距',given:'同一块凸透镜，物距 u > 2f。',context:'条件这次给的是物距，不是像距。用照相机那一行想。',fields:[
      ['像距 v 的范围',['v > 2f','v = 2f','f < v < 2f','v = f'],2,'物体在 2F 外，对应的实像在另一侧 F 与 2F 之间。'],
      ['u 和 v 的关系',['u < v','u > v','u = v','不能比较'],1,'现在 u 在 2f 上面，v 在 2f 下面。'],
      ['像的性质',['倒立、缩小、实像','正立、缩小、虚像','倒立、放大、实像','正立、放大、虚像'],0,'先想手机或相机：很大的景物在感光面上形成小的像。'],
      ['能否用光屏承接',['能，在清晰像的位置','不能，所有像都不能','能，放在哪里都清晰'],0,'实像能接到，但光屏要移到像所在的位置。']],hint:'把实验切到“2F 外”，留意像落在 F 与 2F 之间，且比蜡烛小。',reason:'u > 2f ⇒ f < v < 2f ⇒ u > v，成倒立缩小实像。光屏必须放到像的位置，才能接到清晰图像。'},
    {topic:'等号不是“之间”',given:'物体恰好放在 2F 处，即 u = 2f。',context:'边界要单独看，不能把等号算进 f < u < 2f。',fields:[
      ['像距 v',['v = f','v = 2f','v > 2f','f < v < 2f'],1,'物距等于二倍焦距时，像也在另一侧二倍焦距处。'],
      ['物和像的大小',['物体大于像','物体小于像','物体与像等大'],2,'二倍焦距是实像放大、缩小的分界。'],
      ['像的性质',['倒立、等大、实像','正立、等大、实像','正立、等大、虚像'],0,'等大不等于正立。看实际光线在主光轴下方相交。'],
      ['u 和 v 的关系',['u < v','u > v','u = v'],2,'两段距离都等于 2f。']],hint:'两个等号要配对：u = 2f 时，v 也等于 2f。像的大小刚好等大，但方向仍倒立。',reason:'u = 2f ⇒ v = 2f ⇒ u = v。物像异侧，成倒立、等大实像。此行不必硬配照相机、投影仪或放大镜。'},
    {topic:'放大不一定是实像',given:'把物体放在焦点以内，即 u < f。',context:'这次是放大镜情形。把“虚像看不见”这个误会排除。',fields:[
      ['物体和像在哪',['透镜两侧','透镜同侧','像就在光屏上'],1,'这里相交的是反向延长线，交点在物体这一侧。'],
      ['像的性质',['倒立、放大、实像','正立、放大、虚像','正立、缩小、虚像'],1,'虚像正立；凸透镜的这个虚像比物体大。'],
      ['能否用光屏承接',['可以，只要光屏足够远','不能，但眼睛可透过透镜看见','不能，所以眼睛也看不见'],1,'虚像位置没有实际光线会聚，不能接屏；这不等于不能被眼睛看见。'],
      ['典型应用',['照相机','投影仪','放大镜'],2,'读小字时，把放大镜放得较近，物体位于焦距以内。']],hint:'想一想：放大镜里的字是正着的。它是正立放大虚像，在物体同侧，光屏接不到。',reason:'u < f ⇒ 正立、放大、虚像，物像同侧，不能用光屏承接；应用是放大镜。眼睛从透镜另一侧观察。'},
    {topic:'一个条件也可能不够',given:'题目只告诉你：这个凸透镜成了一个实像。',context:'不能凭空补上“放大”或“缩小”。选出能确定的结论。',fields:[
      ['能确定的物距条件',['u > f','u > 2f','f < u < 2f','u < f'],0,'三个实像情况都满足 u > f，但不全满足 u > 2f。'],
      ['像的正倒',['正立','倒立','这里无法判断正倒'],1,'本课凸透镜前的实际物体，所成实像都倒立。'],
      ['像的大小',['一定放大','一定缩小','一定等大','还不能唯一确定'],3,'实像有放大、缩小和等大三种。'],
      ['能否唯一确定典型应用',['一定是投影仪','一定是照相机','不能，条件还不够'],2,'光有“实像”，不能在照相机和投影仪情形之间作唯一选择。']],hint:'打开“条件筛选器”，选“只知道成实像”。看看还剩几行。多行都符合的列不能硬选唯一值。',reason:'已知实像，只能确定 u > f、倒立、物像异侧且可用光屏承接。大小可能缩小、等大或放大，应用不唯一。指出信息不足也是正确的物理判断。'},
    {topic:'看懂“物近像远”',given:'f = 10 cm，蜡烛从 u = 30 cm 移到 u = 15 cm。',context:'移动前后都有 u > f，始终在成实像；透镜不动。',fields:[
      ['像距怎样变',['变小','变大','不变'],1,'物体从 2F 外进入 F 与 2F 间，像从 F 与 2F 间移到 2F 外。'],
      ['像的大小怎样变',['变小','不变','变大'],2,'实像范围内：物近、像远、像变大。'],
      ['怎样移动光屏才能再次清晰',['向透镜靠近','远离透镜','不用移动，原处仍清晰'],1,'光屏要追到新的像的位置。新像更远，就把光屏移远。'],
      ['两次像的正倒与虚实',['都倒立、都实像','先实像后虚像','先倒立后正立'],0,'两次物距都大于焦距，没有跨过一倍焦距这个分界。']],hint:'先判断有没有跨过 f，再判断跨过没跨过 2f。这里没有跨过 f，只跨过了 2f。',reason:'从 u = 30 cm 到 15 cm，像距从 15 cm 增至 30 cm，像从缩小变为放大。光屏应远离透镜；两次都是倒立实像。'}
  ];
  let qi=0;const answers=QUIZ.map(()=>Array(4).fill('')),checked=QUIZ.map(()=>false),solved=new Set();
  function renderQuiz(){
    const q=QUIZ[qi];text('quiz-number',`练习 ${String(qi+1).padStart(2,'0')}`);text('quiz-topic',q.topic);text('quiz-given',q.given);text('quiz-context',q.context);
    $('quiz-tabs').innerHTML=QUIZ.map((q,i)=>`<button data-quiz="${i}" class="${solved.has(i)?'passed':''}" aria-current="${i===qi}">第 ${i+1} 题${i===4?' · 辨别':''}</button>`).join('');
    $('answer-fields').innerHTML=q.fields.map(([title,opts],i)=>`<div class="field" id="field-${i}"><label for="answer-${i}">${i+1}. ${title}</label><select id="answer-${i}" data-field="${i}"><option value="">请选择，不急着猜</option>${opts.map((o,j)=>`<option value="${j}" ${String(j)===answers[qi][i]?'selected':''}>${esc(o)}</option>`).join('')}</select><p class="field-hint" id="field-hint-${i}"></p></div>`).join('');
    $('quiz-prev').disabled=qi===0;$('quiz-next').disabled=qi===QUIZ.length-1;text('quiz-progress',`${qi+1} / ${QUIZ.length}`);text('quiz-feedback','');$('quiz-reason').hidden=true;
    if(checked[qi])checkQuiz(false);
    text('mastery',`已掌握 ${solved.size} / ${QUIZ.length} 题`);$('completion').hidden=solved.size!==QUIZ.length;
  }
  function checkQuiz(update=true){
    const q=QUIZ[qi];let correct=0;
    q.fields.forEach(([,opts,right,hint],i)=>{
      const value=answers[qi][i],ok=value!==''&&Number(value)===right;correct+=Number(ok);
      $(`field-${i}`).className=`field ${ok?'good':'bad'}`;text(`field-hint-${i}`,ok?'✓ 这一格推对了。':value===''?'先选这一格；也可以先点“给我一个思路”。':hint);
    });
    if(update)checked[qi]=true;
    if(correct===4)solved.add(qi);else solved.delete(qi);
    $('quiz-feedback').className='feedback'+(correct===4?'':' bad');text('quiz-feedback',correct===4?'✓ 四格都对了！用自己的话说出条件之间的联系，再做下一题。':`已对 ${correct} / 4 格。只修改有提示的格子，再检查一次。`);
    text('mastery',`已掌握 ${solved.size} / ${QUIZ.length} 题`);$('completion').hidden=solved.size!==QUIZ.length;
    all('[data-quiz]').forEach(b=>b.classList.toggle('passed',solved.has(Number(b.dataset.quiz))));
  }
  $('quiz-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-quiz]');if(b){qi=Number(b.dataset.quiz);renderQuiz();}});
  $('answer-fields').addEventListener('change',e=>{if(!e.target.matches('[data-field]'))return;answers[qi][Number(e.target.dataset.field)]=e.target.value;if(checked[qi])checkQuiz(false);});
  $('check-answers').addEventListener('click',()=>checkQuiz());
  $('quiz-hint').addEventListener('click',()=>{$('quiz-feedback').className='feedback';text('quiz-feedback',QUIZ[qi].hint);});
  $('quiz-explain').addEventListener('click',()=>{$('quiz-reason').hidden=false;$('quiz-reason').textContent=QUIZ[qi].reason;});
  $('quiz-prev').addEventListener('click',()=>{qi=Math.max(0,qi-1);renderQuiz();});$('quiz-next').addEventListener('click',()=>{qi=Math.min(QUIZ.length-1,qi+1);renderQuiz();});
  $('reset-quiz').addEventListener('click',()=>{answers.forEach(a=>a.fill(''));checked.fill(false);solved.clear();qi=0;renderQuiz();});
  root.LensLesson={setU,renderLab,setGuideStep:(n)=>{guideStep=clamp(n,0,4);renderGuide();},getGuideStep:()=>guideStep,getSolved:()=>solved.size};
  renderLab();renderQuiz();
})(typeof window==='undefined'?globalThis:window);
