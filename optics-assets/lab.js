'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const put = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const num = (id) => Number($(id).value);
  const rad = (deg) => deg * Math.PI / 180;
  const deg = (radians) => radians * 180 / Math.PI;
  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
  const f = (n) => Number(n.toFixed(3));
  const point = (x, y) => `${f(x)},${f(y)}`;
  const label = (x, y, text, color = '#c9dce2', size = 18, anchor = 'middle') => `<text x="${f(x)}" y="${f(y)}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${text}</text>`;
  const line = (x1,y1,x2,y2,color,width=2,extra='') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const ray = (x1,y1,x2,y2,color,width=2.4) => {
    const dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy);
    if(length<1) return '';
    const ux=dx/length,uy=dy/length,mx=x1+dx*.57,my=y1+dy*.57;
    return line(x1,y1,x2,y2,color,width)+`<path d="M${point(mx+ux*7,my+uy*7)} L${point(mx-ux*6-uy*4,my-uy*6+ux*4)} L${point(mx-ux*6+uy*4,my-uy*6-ux*4)}Z" fill="${color}"/>`;
  };
  const handle = (x,y,kind) => `<g class="drag-handle" data-drag="${kind}"><circle cx="${f(x)}" cy="${f(y)}" r="21"/><circle cx="${f(x)}" cy="${f(y)}" r="8"/></g>`;
  function setPressed(selector, active) { all(selector).forEach(el => el.setAttribute('aria-pressed', String(el === active))); }
  const activeTraces = new WeakMap();
  function traceLight(svg, paths) {
    cancelAnimationFrame(activeTraces.get(svg));
    svg.querySelectorAll('[data-photon]').forEach(el=>el.remove());
    const traces=paths.map(({points,color})=>{
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('r','7');dot.setAttribute('fill',color);dot.setAttribute('stroke','#ffffff');dot.setAttribute('stroke-width','2');dot.setAttribute('data-photon','');svg.appendChild(dot);
      const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
      return {dot,points,lengths,total:lengths.reduce((a,b)=>a+b,0)};
    });
    const start=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame=(now)=>{
      if(traces.some(t=>!t.dot.isConnected))return;
      const progress=reduce?1:clamp((now-start)/2400,0,1);
      for(const t of traces){let distance=progress*t.total,index=0;while(index<t.lengths.length-1&&distance>t.lengths[index]){distance-=t.lengths[index++];}const k=distance/t.lengths[index],a=t.points[index],b=t.points[index+1];t.dot.setAttribute('cx',a[0]+(b[0]-a[0])*k);t.dot.setAttribute('cy',a[1]+(b[1]-a[1])*k);}
      if(progress<1)activeTraces.set(svg,requestAnimationFrame(frame));
    };frame(start);
  }
  // Capture on the SVG, not the redrawn handle, to keep dragging stable during redraws.
  function draggable(svg, onMove) {
    let kind = null;
    const move = (event) => {
      if(!kind) return;
      const matrix=svg.getScreenCTM();
      if(!matrix) return;
      const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      onMove(kind,p.x,p.y);
    };
    svg.addEventListener('pointerdown', event => {
      const h=event.target.closest('[data-drag]');
      if(!h) return;
      kind=h.dataset.drag;svg.setPointerCapture(event.pointerId);event.preventDefault();move(event);
    });
    svg.addEventListener('pointermove',move);
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>svg.addEventListener(name,()=>{kind=null;}));
  }
  const banks = {
    straight: [
      ['下列哪个物体此时是光源？',['月亮','正在发光的萤火虫','没有通电的灯泡'],1,'光源要“自身正在发光”。月亮反射太阳光；没有通电、也没有发光的灯泡此时不是光源。'],
      ['“光沿直线传播”需要补上哪个条件？',['任何情况下','只要温度相同','在同种均匀的透明介质中'],2,'不能省略“同种、均匀”。跨越不同介质时，光路可能改变方向；这里研究的是最基础的直线传播。'],
      ['小孔成像为什么倒立？',['孔把光弯向另一边','上下端的光路在孔处交叉','光屏把像翻转了'],1,'光一直沿直线前进。来自上端的光穿过孔后落到下方，来自下端的光落到上方。'],
      ['光屏不动，把物体移近小孔，像通常怎样？',['变大，仍倒立','变小，仍倒立','变大，变正立'],0,'屏到孔的距离不变，物到孔的距离减小，像高与物高的比值增大。方向不会因此变成正立。'],
      ['孔足够小时，把圆孔换成三角孔，像的形状主要取决于什么？',['小孔的形状','光屏的形状','物体的形状'],2,'小孔让物体各点的光在屏上形成对应的像。孔足够小时，孔形不决定像形；孔的大小则影响清晰度和亮度。'],
      ['看见闪电约 3 秒后听到雷声，闪电约在多远处？',['1020 m','510 m','900 000 km'],0,'空气声速按初中口径取 340 m/s；忽略光的传播时间，距离约 340 × 3 = 1020 m。这里不是回声，不需要除以 2。']
    ],
    reflection: [
      ['光线与镜面成 30°，反射角是多少？',['30°','60°','90°'],1,'入射角从法线量：90° − 30° = 60°。反射角等于入射角，所以也是 60°。'],
      ['光垂直射向平面镜，入射角是多少？',['90°','45°','0°'],2,'此时入射光线与法线重合，入射角为 0°，反射光沿原路返回。不是与镜面的 90°。'],
      ['把接收反射光的右半纸板向后折，看不到光的痕迹，主要说明什么？',['反射光线与入射光线、法线在同一平面','反射停止了','反射角变为 0°'],0,'纸板离开了反射光线所在的平面，不能接到原来的光；反射光并没有消失。'],
      ['漫反射中的某一条光线，还满足反射角等于入射角吗？',['不满足，因为方向很乱','满足，角度相对该处局部法线测量','只有平滑处才满足'],1,'每个小面都有自己的法线。各小面分别满足 r = i，但法线不同，所以反射方向不同。'],
      ['教室里不同位置的同学都能看见课本，是因为？',['课本自行发光','人的眼睛发光照到课本','课本把照来的光漫反射到不同方向'],2,'课本是反射光，不是自己发光；来自课本的反射光进入各处同学的眼睛，才能被看见。'],
      ['让光沿原反射光线反向射到镜面，它将怎样传播？',['沿原入射光线反向射出','停止在镜面上','一定垂直于镜面射出'],0,'反射光路可逆。注意是路径反向重走，两条光线的入射、反射身份和箭头方向交换。']
    ]
  };
  function initQuiz() {
    const questions=banks[document.body.dataset.lesson], solved=new Set();
    const root=$('quiz-grid');
    const render=()=>{
      root.innerHTML=questions.map(([q,options],i)=>`<article class="question" data-question="${i}"><h3><span class="q-index">0${i+1}</span>${q}</h3><div class="options">${options.map((o,j)=>`<button data-choice="${j}" aria-pressed="false">${String.fromCharCode(65+j)}. ${o}</button>`).join('')}</div><div class="feedback" role="status"></div></article>`).join('');
      put('quiz-score',`已掌握 ${solved.size} / ${questions.length}`);
    };
    root.addEventListener('click',event=>{
      const button=event.target.closest('[data-choice]');if(!button)return;
      const card=button.closest('[data-question]'),index=Number(card.dataset.question),choice=Number(button.dataset.choice);
      const correct=choice===questions[index][2];
      [...card.querySelectorAll('button')].forEach(b=>{b.className='';b.setAttribute('aria-pressed',String(b===button));});
      button.className=correct?'correct':'wrong';
      const feedback=card.querySelector('.feedback');feedback.className=correct?'feedback':'feedback bad';
      feedback.textContent=(correct?'✓ 理解正确。':'再想一步：')+questions[index][3];
      if(correct)solved.add(index);else solved.delete(index);
      put('quiz-score',`已掌握 ${solved.size} / ${questions.length}`);
      put('quiz-message',solved.size===questions.length?'全部通过！现在试着向别人讲清一个实验，才算真正学会。':'可以回实验台验证，再来改选。作答不会上传。');
    });
    $('quiz-reset').addEventListener('click',()=>{solved.clear();render();put('quiz-message','已重置。重新作答，看看这次能不能说出理由。');});render();
  }
  all('[data-predict]').forEach(box=>box.addEventListener('click',event=>{
    const b=event.target.closest('[data-answer]');if(!b)return;
    const key=box.dataset.predict,correct=key==='size'?b.dataset.answer==='larger':b.dataset.answer==='60';
    const messages={size:'光屏不动时，物体越靠近孔，像越大，仍然倒立。现在到下面把物距从 160 调到 80，亲自验证。',angle:'法线与镜面垂直，所以入射角 = 90° − 30° = 60°。下面试着把入射角调到 60°，再显示与镜面的夹角。'};
    const out=$(`predict-${key}`);out.className=correct?'feedback':'feedback bad';out.textContent=(correct?'猜对了！':'先别急着记答案。')+messages[key];
  }));
  function initStraight() {
    const sources={sun:'是光源。太阳自身发光，属于天然光源。',moon:'不是光源。月亮本身不发可见光，我们看到的是它反射的太阳光。',lamp:'此时不是光源。判断看当前是否自身发光，而不只是看名字叫不叫“灯”。',firefly:'是光源。正在发光的萤火虫自身发光，属于天然光源。'};
    all('[data-source]').forEach(b=>b.addEventListener('click',()=>{setPressed('[data-source]',b);put('source-feedback',sources[b.dataset.source]);}));
    const alignment=()=>{
      const offset=num('hole-offset'),center=165+offset,clear=Math.abs(offset)<=10;
      let s=line(60,165,675,165,'#87a5b1',1,'stroke-dasharray="4 7"');
      [[230,165],[370,center],[510,165]].forEach(([x,y],i)=>{s+=line(x,55,x,y-12,'#738e9c',10)+line(x,y+12,x,270,'#738e9c',10)+label(x,305,`${i+1} 号孔`);});
      s+=ray(72,165,clear?660:365,165,'#ffd477',3)+`<circle cx="65" cy="165" r="11" fill="#ffd477"/><rect x="660" y="115" width="10" height="100" rx="4" fill="#688596"/>`;
      if(clear)s+=`<circle cx="665" cy="165" r="18" fill="#73e4dc" opacity=".15"/><circle cx="665" cy="165" r="6" fill="#73e4dc"/>`;
      else s+=`<circle cx="365" cy="165" r="6" fill="#ff916f"/>`;
      s+=label(65,110,'光源')+label(650,95,clear?'亮点出现':'没有亮点')+label(370,30,clear?'小孔对齐，光通过':'小孔错开，光被挡住','#ffd477',20);
      $('alignment-svg').innerHTML=s;put('hole-offset-out',offset===0?'居中':`${offset<0?'上移':'下移'} ${Math.abs(offset)}`);
      put('align-status',clear?'光束穿过三个孔，到达接收处。孔有一定宽度，因此轻微错开时也可能透光。':'光在中间挡板处被挡住，不会为了穿过错开的小孔而自行拐弯。把小孔重新对齐试试。');
    };
    $('hole-offset').addEventListener('input',alignment);$('align-reset').addEventListener('click',()=>{$('hole-offset').value=0;alignment();});alignment();
    function eclipse(type){
      const solar=type==='solar';
      let s=`<circle cx="85" cy="110" r="48" fill="#ffd477"/>`;
      if(solar){s+=`<path d="M325 93L605 110L325 127Z" fill="#030e16"/><circle cx="325" cy="110" r="17" fill="#b5c1c5"/><circle cx="580" cy="110" r="37" fill="#4daab2"/><ellipse cx="552" cy="110" rx="4" ry="8" fill="#203a43"/>`;}else{s+=`<path d="M325 73L710 93L710 127L325 147Z" fill="#030e16"/><circle cx="325" cy="110" r="37" fill="#4daab2"/><circle cx="570" cy="110" r="17" fill="#586f7b"/>`;}
      s+=label(85,195,'太阳')+label(325,195,solar?'月球':'地球')+label(solar?580:570,195,solar?'地球':'月球')+label(455,38,solar?'月球的影子落到地球上':'月球进入地球的影子','#ffd477',19);
      $('eclipse-svg').innerHTML=s;put('eclipse-note',solar?'日食：太阳—月球—地球。月球挡住部分太阳光；地球上合适位置的人会看到太阳被遮挡。':'月食：太阳—地球—月球。地球挡住射向月球的太阳光，月球进入地球的影子。');
    }
    all('[data-eclipse]').forEach(b=>b.addEventListener('click',()=>{setPressed('[data-eclipse]',b);eclipse(b.dataset.eclipse);}));eclipse('solar');
    let showRays=true;
    const drawPinhole=()=>{
      const u=num('object-distance'),v=num('screen-distance'),ap=num('aperture-size'),shape=$('aperture-shape').value,m=v/u;
      const ox=365,oy=220,sx=ox-u*1.45,screen=ox+v*1.45,half=50,opening=ap*3;
      const blur=[0,.35,1.8,4][ap],opacity=clamp((.65+(ap-1)*.18)*(120/v)**.55,.3,1);
      const arrow='<path d="M-7 50V-29H-20L0 -50L20 -29H7V50Z" fill="#ffd477"/><circle cy="-50" r="5" fill="#ff916f"/><circle cy="50" r="5" fill="#73e4dc"/>';
      let s=`<defs><filter id="image-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`;
      s+=line(28,oy,720,oy,'#7897a7',1,'stroke-dasharray="5 7"');
      s+=line(ox,70,ox,oy-opening,'#718b98',9)+line(ox,oy+opening,ox,350,'#718b98',9);
      s+=`<rect x="${f(screen-3)}" y="75" width="6" height="275" rx="3" fill="#9bb4bf"/><rect x="${f(screen-25*m)}" y="${f(oy-55*m)}" width="${f(50*m)}" height="${f(110*m)}" rx="8" fill="#ffd477" opacity=".035"/>`;
      if(showRays){s+=ray(sx,oy-half,ox,oy,'#ff916f')+ray(ox,oy,screen,oy+half*m,'#ff916f')+ray(sx,oy+half,ox,oy,'#73e4dc')+ray(ox,oy,screen,oy-half*m,'#73e4dc');}
      s+=`<g transform="translate(${f(sx)} ${oy})">${arrow}</g><g transform="translate(${f(screen)} ${oy}) scale(${-f(m)})" filter="url(#image-blur)" opacity="${f(opacity)}">${arrow}</g>`;
      s+=label(sx,84,'物体','#e4eeee',20)+label(screen,54,'光屏与倒像','#e4eeee',20)+label(ox,49,'小孔','#ffd477',20);
      s+=line(sx,338,ox-8,338,'#597986',1)+line(ox+8,360,screen,360,'#597986',1);
      s+=label((sx+ox)/2,329,`物距 ${u} cm`,'#b6cdd4',16)+label((screen+ox)/2,383,`像距 ${v} cm`,'#b6cdd4',16);
      s+=handle(sx,380,'object')+handle(screen,380,'screen');
      // The inset communicates the aperture shape; it does not replace the image with the aperture silhouette.
      s+=`<rect x="644" y="15" width="94" height="74" rx="10" fill="#234450"/>`;
      if(shape==='circle')s+='<circle cx="691" cy="42" r="11" fill="#e8efe4"/>';
      if(shape==='square')s+='<rect x="680" y="31" width="22" height="22" fill="#e8efe4"/>';
      if(shape==='triangle')s+='<path d="M691 28L704 53H678Z" fill="#e8efe4"/>';
      s+=label(691,76,'孔形放大图','#b6cdd4',12);
      $('pinhole-svg').innerHTML=s;
      put('u-out',`${u} cm`);put('v-out',`${v} cm`);put('aperture-out',['','很小','稍大','较大'][ap]);
      put('image-scale',`${m.toFixed(2)} 倍`);put('image-quality',['','较清晰','稍模糊','更模糊'][ap]);
      put('pinhole-status',`物距 ${u} cm，像距 ${v} cm：像${m>1?'比物体大':m<1?'比物体小':'与物体等大'}，始终倒立。${ap===1?'沿红线看：物体上端对应屏幕下端；沿青线看：下端对应上端。':'孔变大后，进光增多，但各点形成的光斑更容易重叠，像变模糊。'}`);
    };
    ['object-distance','screen-distance','aperture-size','aperture-shape'].forEach(id=>$(id).addEventListener('input',drawPinhole));
    $('toggle-rays').addEventListener('click',()=>{showRays=!showRays;$('toggle-rays').setAttribute('aria-pressed',String(showRays));put('toggle-rays',`光路：${showRays?'显示':'隐藏'}`);drawPinhole();});
    $('pinhole-reset').addEventListener('click',()=>{$('object-distance').value=160;$('screen-distance').value=120;$('aperture-size').value=1;$('aperture-shape').value='circle';showRays=true;$('toggle-rays').setAttribute('aria-pressed','true');put('toggle-rays','光路：显示');drawPinhole();});
    $('trace-pinhole').addEventListener('click',()=>{
      const u=num('object-distance'),v=num('screen-distance'),x=365-u*1.45,screen=365+v*1.45,m=v/u;
      traceLight($('pinhole-svg'),[{points:[[x,170],[365,220],[screen,220+50*m]],color:'#ff916f'},{points:[[x,270],[365,220],[screen,220-50*m]],color:'#73e4dc'}]);
    });
    draggable($('pinhole-svg'),(kind,x)=>{const id=kind==='object'?'object-distance':'screen-distance';const value=kind==='object'?(365-x)/1.45:(x-365)/1.45;$(id).value=Math.round(clamp(value,Number($(id).min),Number($(id).max))/5)*5;drawPinhole();});drawPinhole();
    const thunder=()=>{const d=num('thunder-distance');put('thunder-distance-out',`${d} m`);put('thunder-result',`光约 ${(d/3e8).toFixed(7)} 秒到达；声音约 ${d/340} 秒到达。所以几乎先立刻看见闪电，再听到雷声。`);};$('thunder-distance').addEventListener('input',thunder);thunder();
  }
  function initReflection() {
    let reversed=false,surfaceAngle=false,target='none';
    const targets={a:25,b:62};
    const drawReflection=()=>{
      const i=num('incidence-angle'),theta=rad(i),O={x:370,y:290},L=233;
      const left={x:O.x-L*Math.sin(theta),y:O.y-L*Math.cos(theta)},right={x:O.x+L*Math.sin(theta),y:left.y};
      const source=reversed?right:left,end=reversed?left:right;
      let s=line(50,O.y,690,O.y,'#adc8d3',6);
      for(let x=50;x<700;x+=25)s+=line(x,O.y+5,x-10,O.y+18,'#47616d',2);
      s+=line(O.x,27,O.x,O.y+1,'#9ebac7',1.7,'stroke-dasharray="6 6"');
      if(target!=='none'){
        const angle=rad(targets[target]),side=reversed?-1:1,x=O.x+side*L*Math.sin(angle),y=O.y-L*Math.cos(angle);
        const hit=Math.abs(i-targets[target])<=3;
        s+=`<circle cx="${f(x)}" cy="${f(y)}" r="16" fill="${hit?'#d7ef8730':'none'}" stroke="${hit?'#d7ef87':'#ffd477'}" stroke-width="3"/><circle cx="${f(x)}" cy="${f(y)}" r="4" fill="#ffd477"/>`+label(x,y-27,`目标 ${target.toUpperCase()}`,'#ffd477',17);
        put('target-status',hit?'✓ 命中！反射光落入圆环。保持“从法线量角”，再换另一个目标。':'拖动光源，让青色反射光穿过目标圆环。圆环有一定大小，不要求角度完全精确。');
      }else put('target-status','自由观察：试试 0°、30°、60°，再把光路反过来。');
      if(i===0){s+=ray(O.x,60,O.x,O.y,'#ff916f',6)+ray(O.x,O.y,O.x,60,'#73e4dc',2);}
      else{s+=ray(source.x,source.y,O.x,O.y,'#ff916f',3)+ray(O.x,O.y,end.x,end.y,'#73e4dc',3);}
      const r=68,lx=O.x-r*Math.sin(theta),ly=O.y-r*Math.cos(theta),rx=O.x+r*Math.sin(theta);
      if(i>0)s+=`<path d="M${point(lx,ly)} A${r} ${r} 0 0 1 ${point(O.x,O.y-r)} A${r} ${r} 0 0 1 ${point(rx,ly)}" fill="none" stroke="#ffd477" stroke-width="2"/>`;
      if(i>=12){const tx=100*Math.sin(theta/2),ty=O.y-100*Math.cos(theta/2);s+=label(O.x-tx,ty,reversed?'r':'i','#ffd477',20)+label(O.x+tx,ty,reversed?'i':'r','#ffd477',20);}
      s+=label(O.x+14,35,'法线','#adcad6',17,'start')+label(630,328,'平面镜','#adcad6',18)+label(O.x,336,'O 入射点','#ffd477',16);
      s+=handle(source.x,source.y,'source');
      if(i>=15){s+=label(source.x+(reversed?35:-35),source.y+9,'光源','#ffd477',17,reversed?'start':'end');}
      if(surfaceAngle)s+=label(370,378,`与镜面的夹角：90° − ${i}° = ${90-i}°`,'#ffd477',21);
      else s+=label(370,378,i===0?'垂直入射：两条光路重合，方向相反':'拖动黄色光源 · 看青色反射光去哪里','#b7ced6',17);
      $('reflection-svg').innerHTML=s;
      put('angle-out',`${i}°`);put('incident-metric',`${i}°`);put('reflected-metric',`${i}°`);put('surface-metric',`${90-i}°`);
      put('reflection-status',`${reversed?'光源换到原来反射光的一侧，光沿原路反向传播。':'反射角跟随入射角改变，不是随机选择方向。'}当前 i = ${i}°，r = ${i}°。${i===0?'这里从法线量角是 0°，不是 90°。':'两条光线与法线的夹角始终相等。'}`);
    };
    $('incidence-angle').addEventListener('input',drawReflection);
    $('reverse-ray').addEventListener('click',()=>{reversed=!reversed;$('reverse-ray').setAttribute('aria-pressed',String(reversed));drawReflection();});
    $('show-surface-angle').addEventListener('click',()=>{surfaceAngle=!surfaceAngle;$('show-surface-angle').setAttribute('aria-pressed',String(surfaceAngle));drawReflection();});
    all('[data-target]').forEach(b=>b.addEventListener('click',()=>{target=b.dataset.target;setPressed('[data-target]',b);drawReflection();}));
    $('reflection-reset').addEventListener('click',()=>{reversed=false;surfaceAngle=false;target='none';$('incidence-angle').value=40;$('reverse-ray').setAttribute('aria-pressed','false');$('show-surface-angle').setAttribute('aria-pressed','false');all('[data-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.target==='none')));drawReflection();});
    $('trace-reflection').addEventListener('click',()=>{
      const theta=rad(num('incidence-angle')),side=reversed?1:-1;
      traceLight($('reflection-svg'),[{points:[[370+side*233*Math.sin(theta),290-233*Math.cos(theta)],[370,290],[370-side*233*Math.sin(theta),290-233*Math.cos(theta)]],color:'#ffd477'}]);
    });
    draggable($('reflection-svg'),(_,x,y)=>{$('incidence-angle').value=Math.round(clamp(deg(Math.atan2(Math.abs(x-370),Math.max(0,290-y))),0,80));drawReflection();});drawReflection();
    let rough=false,normals=true;
    const drawRough=()=>{
      const heights=rough?[242,219,250,207,239,221,252,229]:Array(8).fill(230),selected=num('facet')-1;
      const direction={x:Math.sin(rad(22)),y:Math.cos(rad(22))};
      let s=`<path d="M55 315V${heights[0]} ${heights.slice(1).map((h,k)=>`L${145+k*90} ${h}`).join(' ')}V315Z" fill="#3b5664"/>`;
      let selectedAngle=0;
      for(let k=0;k<7;k++){
        const x1=55+k*90,y1=heights[k],x2=x1+90,y2=heights[k+1],x=(x1+x2)/2,y=(y1+y2)/2,slope=(y2-y1)/90;
        // Upward-facing unit normal in SVG coordinates (positive y points downward).
        const length=Math.hypot(slope,1),normal={x:slope/length,y:-1/length};
        const dot=direction.x*normal.x+direction.y*normal.y;
        const reflected={x:direction.x-2*dot*normal.x,y:direction.y-2*dot*normal.y};
        const angle=deg(Math.acos(clamp(-dot,-1,1))),active=k===selected;
        if(active)selectedAngle=angle;
        s+=line(x1,y1,x2,y2,active?'#ffd477':'#9bb6c2',active?5:2);
        s+=ray(x-direction.x*164,y-direction.y*164,x,y,active?'#ffb695':'#b97862',active?3:1.6);
        s+=ray(x,y,x+reflected.x*180,y+reflected.y*180,active?'#94fff0':'#489f9f',active?3:1.6);
        if(normals)s+=line(x,y,x+normal.x*95,y+normal.y*95,active?'#ffffff':'#7c9dab',active?2:1,'stroke-dasharray="5 5"');
        if(active)s+=`<circle cx="${x}" cy="${y}" r="5" fill="#ffd477"/>`;
        s+=label(x,296,`${k+1}`,active?'#ffd477':'#b3c9d1',16);
      }
      s+=label(370,30,rough?'法线不同 → 反射方向不同':'法线平行 → 反射光也平行','#d4e9e9',20)+label(370,344,`选中 ${selected+1} 号小面 · 金色部分是局部反射面`,'#aac8d2',16);
      $('rough-svg').innerHTML=s;
      put('facet-out',`${selected+1}`);put('facet-incidence',`${selectedAngle.toFixed(1)}°`);put('facet-reflection',`${selectedAngle.toFixed(1)}°`);put('parallel-metric',rough?'不同方向':'平行');
      put('rough-status',`${rough?'表面凹凸，各处法线方向不同。':'表面平滑，各处法线方向相同。'}选中的 ${selected+1} 号小面：相对它自己的法线，入射角 = 反射角 = ${selectedAngle.toFixed(1)}°。`);
    };
    all('[data-surface]').forEach(b=>b.addEventListener('click',()=>{rough=b.dataset.surface==='rough';setPressed('[data-surface]',b);drawRough();}));
    $('facet').addEventListener('input',drawRough);$('show-normals').addEventListener('click',()=>{normals=!normals;$('show-normals').setAttribute('aria-pressed',String(normals));put('show-normals',`局部法线：${normals?'显示':'隐藏'}`);drawRough();});drawRough();
  }
  initQuiz();
  if(document.body.dataset.lesson==='straight')initStraight();else initReflection();
})();
