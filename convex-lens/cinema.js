'use strict';
// A clip teaches one idea. Time is deterministic so pausing and scrubbing preserve the same optics.
(() => {
  const model=window.LensModel.model;
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const part=(t,a,b)=>clamp((t-a)/(b-a));
  const ease=n=>n*n*(3-2*n);
  const mix=(a,b,p)=>a+(b-a)*ease(clamp(p));
  const num=n=>Math.round(n*100)/100;
  const fmt=n=>Number(n.toFixed(1));
  const colors={amber:'#ffcb7c',mint:'#91e7c8',muted:'#a9bfb5',ink:'#f3f6df',blue:'#93cce4'};
  const CLIPS={
    objects:{u:30,beats:[['先找到真正的蜡烛','左边这支蜡烛是物体。中间是凸透镜，右边还没有第二支蜡烛。'],['跟着光走一次','蜡烛发出的光经过凸透镜，向右传播。动画把光路放慢，让我们看清过程。'],['光屏上出现了像','右边出现的是蜡烛的图像，不是一支新的蜡烛。光屏只负责把这个图像接住。']]},
    u:{u:30,beats:[['从透镜开始量','只看左边。透镜到蜡烛的距离，叫物距，写成 u。'],['蜡烛远离，线段变长','透镜不动，蜡烛向左移动。物体到透镜更远，所以 u 变大。'],['蜡烛靠近，线段变短','蜡烛向右移动，u 变小。u 只管物体到透镜，不管光屏在哪里。']]},
    v:{u:30,beats:[['这次只看右边','右边已经形成清晰的像。我们量的是透镜到像的距离。'],['把这段距离画出来','这段叫像距，记作 v。它不是物体到像的总距离。'],['光屏要去找像','图中像的位置固定。光屏靠近它时，屏上的图像才变清晰；移动光屏并不能改变像距。']]},
    f:{u:30,beats:[['先送来平行光','这次暂时没有蜡烛。看几束与主光轴平行的光照向凸透镜。'],['经过透镜后，会聚到一点','光在透镜处改变方向，来到同一个点。这个位置叫焦点 F。'],['位置叫 F，距离叫 f','从透镜到焦点的距离，叫焦距 f。本课固定 f = 10 cm；不换透镜，f 就不变。']]},
    twof:{u:30,beats:[['先量一段焦距','透镜到 F 是一段 f，这里长 10 cm。'],['把同样长的一段再接上','再走一个 10 cm，总共 20 cm。这个位置叫 2F。'],['透镜两侧都有标记','F 离透镜 10 cm，2F 离透镜 20 cm。先把它们当成位置刻度，不急着背成像表。']]},
    interval:{u:15,beats:[['黄色区域是 F 与 2F 之间','左侧 F 距透镜 10 cm，2F 距透镜 20 cm。看清这段区域。'],['把物体放进这段区域','让蜡烛慢慢移到距透镜 15 cm 处。等它停下，比 10 cm 远、比 20 cm 近。'],['图上的位置，就是 f < u < 2f','u 是物距，所以这个不等式说的是物体的位置。边界上的等号不包含在“之间”里面。']]},
    real:{u:30,beats:[['只追踪火焰顶端这个点','从同一个点出发的两条代表性光线，经透镜后向右传播。'],['两条实际光线真的相交','它们会聚到的地方，就是这个点的实像位置。其他点也这样成像，合起来成为完整的像。'],['再把光屏放到这里','光屏接到清晰的像。移走光屏，光仍在这里会聚；光屏不是制造像的东西。']]},
    orientation:{u:30,beats:[['先认住火焰顶端的小金点','物体的火焰朝上。金色小点标出的是同一个物点。'],['跟着这个点发出的光','光经过透镜后，会聚到主光轴下方。上方的点，成像到了下方。'],['上下颠倒，叫倒立','现在完整的像出现了：物体火焰朝上，像的火焰朝下。这里只比较方向，先不谈大小。']]},
    size:{u:30,beats:[['量一量物体的高度','还是刚才同一幅成像。先用一根标尺标出物体的完整高度。'],['再量一量像的高度','只比较两根标尺的长度。右边像的高度更小，所以是缩小的像。'],['三个词，分别回答三件事','能接屏：实像。方向：倒立。大小：缩小。合起来是倒立、缩小的实像。']]},
    far:{u:30,beats:[['物体先放在 2F 外','先看左边：u > 2f。像在另一侧 F 与 2F 之间。'],['只在 2F 外移动蜡烛','蜡烛更远时，像更靠近 F，也更小。注意像始终没有跑出 F 与 2F 之间。'],['停下来，读这一种情况','u > 2f → f < v < 2f → 倒立、缩小、实像。照相机用的就是这种成像情形。']]},
    double:{u:20,beats:[['从 2F 外向 2F 靠近','这次让蜡烛慢慢移到左侧 2F。不要把“在 2F 上”读成“在 2F 外”。'],['蜡烛到 2F，像也到 2F','停稳后，两边距离都是 20 cm。物距 u = 2f，像距 v = 2f。'],['像与物体等高，但仍倒立','这一种是倒立、等大的实像。等大说的是高度，不能把它误当成正立。']]},
    between:{u:15,beats:[['物体在 F 与 2F 之间','先看左边：f < u < 2f。像已经到另一侧 2F 以外，而且比物体高。'],['蜡烛靠近 F，像远离透镜','只在这段里移动。你会看到：物体越靠近 F，像越远、越大。这里始终在成实像。'],['把“投小成大”与画面联系起来','停在 u = 15 cm，像距是 30 cm，像放大两倍。投影仪把小画面投成大画面，就是这一种情形。']]},
    focus:{u:10,beats:[['物体恰好在 F 上','这里是 u = f，不是大于或小于。先找到火焰顶端发出的两条光线。'],['出射光变成了平行光','同一个物点发出的光，经透镜后彼此平行，不在有限远处相交。'],['换几个光屏位置，也接不清晰','右侧标记只是尝试接屏的位置，图中光路按未放光屏绘制。没有有限的会聚点，就没有有限远的清晰像。']]},
    inside:{u:7.5,beats:[['把物体放到 F 以内','u < f。右侧实际光线散开，没有会聚成实像。'],['虚线只是向后找位置','把出射光反向延长，两条虚线在物体同侧相交。注意：光没有沿虚线倒着走。'],['眼睛看到正立、放大的虚像','从右侧透过透镜观察，好像光来自左边这个更大的物体。能看见，但不能用光屏接住它；这就是放大镜。']]},
    compare:{u:30,beats:[['第一站：2F 外，像缩小','现在才把三种实像连起来看。先看远处的蜡烛：像在另一侧 F 与 2F 之间。'],['第二站：恰好 2F，像等大','蜡烛靠近透镜到 2F，像同时移到另一侧 2F。等大是实像大小变化的分界。'],['第三站：F 与 2F 之间，像放大','继续靠近，但仍在 F 外。像移到另一侧 2F 外并放大。记住前提：这里一直在成实像。']]}
  };
  function motion(key,t){
    if(key==='u')return t<.33?30:t<.67?mix(30,40,part(t,.33,.6)):mix(40,22,part(t,.67,.92));
    if(key==='interval')return mix(27,15,part(t,.33,.6));
    if(key==='far')return mix(30,40,part(t,.33,.6));
    if(key==='double')return mix(30,20,part(t,.04,.3));
    if(key==='between')return mix(18,15,part(t,.33,.6));
    if(key==='compare')return t<.33?30:t<.67?mix(30,20,part(t,.33,.52)):mix(20,15,part(t,.67,.85));
    return CLIPS[key].u;
  }
  const line=(a,b,color=colors.muted,w=2,dash='')=>`<line x1="${num(a[0])}" y1="${num(a[1])}" x2="${num(b[0])}" y2="${num(b[1])}" stroke="${color}" stroke-width="${w}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
  const label=(x,y,s,color=colors.ink,size=24)=>`<text x="${num(x)}" y="${num(y)}" fill="${color}" font-size="${size}" text-anchor="middle">${s}</text>`;
  const fade=(s,p)=>`<g opacity="${num(clamp(p))}">${s}</g>`;
  function candle(x,y,h,invert=false,virtual=false){
    return `<g transform="translate(${num(x)} ${num(y)}) scale(1 ${invert?-1:1})" ${virtual?'stroke-dasharray="5 4"':''}><rect x="${num(-h*.13)}" y="${num(-h*.68)}" width="${num(h*.26)}" height="${num(h*.68)}" rx="3" fill="${virtual?'none':colors.mint}" stroke="${colors.mint}" stroke-width="2"/><path d="M0 ${num(-h)} Q${num(-h*.25)} ${num(-h*.74)} 0 ${num(-h*.68)} Q${num(h*.24)} ${num(-h*.74)} 0 ${num(-h)}Z" fill="${virtual?'none':colors.amber}" stroke="${colors.amber}" stroke-width="2"/></g>`;
  }
  function path(points,p,color){
    const lengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));
    const total=lengths.reduce((a,b)=>a+b,0);let d=total*clamp(p),dot=points.at(-1);
    for(let i=0;i<lengths.length;i++){if(d<=lengths[i]){const z=lengths[i]===0?0:d/lengths[i];dot=[points[i][0]+(points[i+1][0]-points[i][0])*z,points[i][1]+(points[i+1][1]-points[i][1])*z];break;}d-=lengths[i];}
    return `<polyline points="${points.map(v=>v.map(num).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.6" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${num(100*(1-clamp(p)))}"/>`+(p>0&&p<1?`<circle cx="${num(dot[0])}" cy="${num(dot[1])}" r="6" fill="${color}" filter="url(#cinema-glow)"/>`:'');
  }
  function dimension(a,b,y,s,p=1,color=colors.amber){
    const end=a+(b-a)*clamp(p);
    return line([a,y],[end,y],color,3)+line([a,y-6],[a,y+6],color)+line([end,y-6],[end,y+6],color)+fade(label((a+b)/2,y+30,s,color),part(p,.4,1));
  }
  function picture(key,t,width,receiverOverride){
    const W=width<600?600:900,O=W/2,Y=167,u=motion(key,t),m=model(u),beat=Math.min(2,Math.floor(t*3));
    // A fixed scale per clip prevents a moving candle from also changing the camera zoom.
    const extent=['f','twof'].includes(key)?28:['between','inside'].includes(key)?36:42;
    const scale=(W/2-50)/extent;
    const h=key==='inside'?40:key==='between'?58:key==='compare'?52:64;
    const x=O-u*scale,xi=m.v===null?null:O+m.v*scale,yt=xi===null?null:Y+h*m.v/u;
    const dims=['far','double','between','compare'].includes(key);
    let s=`<defs><filter id="cinema-glow"><feGaussianBlur stdDeviation="3"/></filter><pattern id="cinema-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#b7e8cf" stroke-opacity=".055"/></pattern><clipPath id="cinema-clip"><rect x="12" y="25" width="${W-24}" height="281"/></clipPath></defs><rect width="${W}" height="390" fill="url(#cinema-grid)"/>`;
    s+=line([22,Y],[W-22,Y],'#527467',1.5);
    s+=`<path d="M${O} ${Y-115} Q${O-32} ${Y} ${O} ${Y+115} Q${O+32} ${Y} ${O} ${Y-115}Z" fill="#89e3ca22" stroke="#87d9c0" stroke-width="2.5"/>`+label(O,27,'凸透镜',colors.mint,22);
    if(['f','twof'].includes(key)){
      const F=O+10*scale,FF=O+20*scale;
      if(key==='f'){
        for(const dy of [-68,0,68])s+=path([[35,Y+dy],[O,Y+dy],[F,Y]],part(t,.08,.6),dy===0?colors.blue:colors.amber);
        s+=fade(`<circle cx="${F}" cy="${Y}" r="7" fill="${colors.amber}"/>`+label(F,Y+35,'F',colors.amber),part(t,.48,.65));
        s+=dimension(O,F,310,'f = 10 cm',part(t,.67,.92));
      }else{
        s+=line([F,Y-7],[F,Y+7],colors.amber)+label(F,Y+33,'F',colors.amber)+dimension(O,F,245,'10 cm',part(t,.03,.27));
        s+=fade(line([FF,Y-7],[FF,Y+7],colors.mint)+label(FF,Y+33,'2F',colors.mint)+dimension(F,FF,245,'10 cm',part(t,.34,.59),colors.mint),part(t,.33,.38));
        s+=dimension(O,FF,315,'2f = 20 cm',part(t,.67,.9));
        s+=fade(line([O-10*scale,Y-7],[O-10*scale,Y+7],colors.amber)+label(O-10*scale,Y+33,'F',colors.amber)+line([O-20*scale,Y-7],[O-20*scale,Y+7],colors.mint)+label(O-20*scale,Y+33,'2F',colors.mint),part(t,.68,.84));
      }
      return {svg:s,W,u,v:m.v,beat};
    }
    const marks=['interval','far','double','between','focus','inside','compare'].includes(key);
    if(key==='interval')s+=fade(`<rect x="${O-20*scale}" y="65" width="${10*scale}" height="185" rx="8" fill="#ffcb7c" opacity=".16"/>`,part(t,0,.16));
    if(marks){for(const side of [-1,1]){if(key==='interval'&&side===1)continue;for(const k of [1,2]){if((key==='focus'||key==='inside')&&k===2)continue;const xx=O+side*k*10*scale;s+=line([xx,Y-6],[xx,Y+6],'#779b8b',2)+label(xx,Y+(k===1?30:55),k===1?'F':'2F',colors.muted,22);}}}
    if(key==='u'||key==='interval'){
      s+=candle(x,Y,h)+label(x,Y-h-19,'物体',colors.amber);
      s+=dimension(x,O,290,`u = ${fmt(u)} cm`,key==='u'?part(t,.03,.25):part(t,.35,.6));
      if(key==='interval')s+=fade(label(W*.73,100,'10 < 15 < 20',colors.amber,25)+label(W*.73,133,'f < u < 2f',colors.ink,26),part(t,.67,.87));
      return {svg:s,W,u,v:m.v,beat};
    }
    const simple=['objects','real','orientation'].includes(key);
    let rayProgress=simple?part(t,.26,.64):key==='focus'?part(t,.1,.65):key==='inside'?part(t,.03,.31):0;
    const rays=simple||key==='focus'||key==='inside';
    // The teaching screen is introduced only after the ray construction. Focus uses position markers, not opaque screens.
    if(rays){
      const xr=m.real?xi:W-23,world=(xr-O)/scale;
      let rayMarkup=path([[x,Y-h],[O,Y-h],[xr,Y-h+h*world/10]],rayProgress,colors.amber)+path([[x,Y-h],[O,Y],[xr,Y+h*world/u]],rayProgress,colors.blue);
      if(key==='inside')rayMarkup+=fade(line([O,Y-h],[xi,yt],colors.amber,2,'7 7')+line([O,Y],[xi,yt],colors.blue,2,'7 7'),part(t,.34,.62));
      s+=`<g clip-path="url(#cinema-clip)">${rayMarkup}</g>`;
    }
    let imageOpacity=simple?part(t,.64,.82):key==='inside'?part(t,.67,.89):1;
    if(key==='orientation')s+=fade(`<circle cx="${num(x)}" cy="${num(Y-h)}" r="7" fill="${colors.amber}"/>`,part(t,0,.15));
    if(xi!==null){
      let receive=key==='objects'?part(t,.67,.88):key==='real'?part(t,.69,.9):key==='v'?1:0;
      if(receiverOverride!==null&&key==='real')receive=receiverOverride?1:0;
      if(receive>0){const sx=key==='v'?mix(xi+65,xi,part(t,.67,.9)):mix(xi+55,xi,receive);s+=fade(`<rect x="${num(sx-3)}" y="65" width="6" height="224" rx="2" fill="#d3e0ce"/>`+label(sx,62,'光屏',colors.muted,22),receive);}
      s+=fade(`<g id="cinema-image" data-x="${num(xi)}" data-height="${num(h*m.m)}">${candle(xi,Y,h*m.m,m.real,!m.real)}</g>`,imageOpacity);
      if(key==='objects')s+=fade(label(xi,260,'蜡烛的像',colors.mint),part(t,.72,.9));
      else if(!marks&&key!=='v')s+=fade(label(xi,Math.min(298,Y+h*m.m+32),'像',colors.mint),imageOpacity);
      if(key==='inside')s+=fade(label(xi,Math.max(34,yt-18),'正立的虚像',colors.mint,23),imageOpacity);
      if(key==='orientation')s+=fade(`<circle cx="${num(xi)}" cy="${num(yt)}" r="7" fill="${colors.amber}"/>`+label(O+110,321,'上方的点 → 成像到下方',colors.amber,25),part(t,.63,.83));
    }
    s+=`<g id="cinema-object" data-x="${num(x)}">${candle(x,Y,h)}${label(x,Y-h-20,'物体',colors.amber)}</g>`;
    if(key==='v'){
      s+=dimension(O,xi,308,'v = 15 cm',part(t,.33,.6),colors.mint);
      s+=fade(label(xi,270,'像的位置不变',colors.mint,22),part(t,.68,.9));
    }
    if(key==='size'){
      s+=fade(line([x-30,Y-h],[x-30,Y],colors.amber,5)+label(x-48,Y-h/2,'高',colors.amber,23),part(t,.02,.22));
      s+=fade(line([xi+32,Y],[xi+32,Y+h*m.m],colors.mint,5)+label(xi+60,Y+25,'矮',colors.mint,23),part(t,.34,.56));
      s+=fade(label(O,333,'方向：倒立   大小：缩小   能接屏：实像',colors.ink,W===600?21:25),part(t,.68,.86));
    }
    if(dims){
      s+=dimension(x,O,315,`u = ${fmt(u)} cm`,1,colors.amber)+dimension(O,xi,315,`v = ${fmt(m.v)} cm`,1,colors.mint);
      s+=label(xi,Y-20,'像',colors.mint,22);
    }
    if(key==='focus'){
      const screenX=mix(O+40,W-40,part(t,.68,.92));
      s+=fade(line([screenX,84],[screenX,293],colors.muted,3,'8 6')+label(W*.73,335,'光屏试放处：接不到清晰像',colors.muted,W===600?21:24),part(t,.67,.76));
    }
    return {svg:s,W,u,v:m.v,beat};
  }
  let active=null;
  function destroy(){if(active){active.dispose();active=null;}}
  function mount(host,key){
    destroy();const clip=CLIPS[key];if(!clip)throw new Error('Unknown teaching clip: '+key);
    const duration=18000;let elapsed=0,playing=false,raf=0,prev=0,lastBeat=-1,receiver=null,disposed=false;
    host.innerHTML=`<div class="cinema" data-clip="${key}" data-playing="false"><div class="cinema-top"><span><i></i> 动画观察室</span><span>${['objects','u','v'].includes(key)?'先观察，不需要答题':'固定同一块透镜 · f = 10 cm'}</span></div><div class="cinema-viewport"><svg class="cinema-scene" viewBox="0 0 900 390" role="img" aria-label="${clip.beats[0][0]}的光学动画"></svg></div><div class="cinema-caption" aria-live="polite" aria-atomic="true"><span class="cinema-beat-number">01 / 03</span><div><h3></h3><p></p></div></div><div class="cinema-controls"><button class="cinema-play" aria-label="播放动画">▶ 播放</button><button class="cinema-replay">↺ 重播</button><label class="cinema-timeline"><span class="sr-only">动画进度，拖动可慢慢看</span><input type="range" min="0" max="18000" step="20" value="0" aria-label="动画进度"><output>0:00 / 0:18</output></label><button class="cinema-zoom" aria-pressed="false">放大图示</button></div><div class="cinema-beats" aria-label="按画面分段看">${clip.beats.map((b,i)=>`<button data-beat="${i}" aria-current="${i===0}"><span>0${i+1}</span>${b[0]}</button>`).join('')}</div><p class="cinema-status" role="status"></p>${key==='real'?'<div class="cinema-extra"><button class="cinema-screen">看完后，试试移走光屏</button><span>光屏不决定像的位置。</span></div>':''}<p class="cinema-footnote">光路按薄透镜模型绘制；动画速度与屏幕尺寸为教学示意，不是真实光速。可暂停、拖动进度或点分段回看。</p></div>`;
    const root=host.firstElementChild,svg=root.querySelector('svg'),play=root.querySelector('.cinema-play'),slider=root.querySelector('input'),output=root.querySelector('output'),status=root.querySelector('.cinema-status'),caption=root.querySelector('.cinema-caption');
    function render(){
      const frame=picture(key,elapsed/duration,root.clientWidth,receiver);svg.setAttribute('viewBox',`0 0 ${frame.W} 390`);svg.innerHTML=frame.svg;
      root.dataset.elapsed=String(Math.round(elapsed));root.dataset.u=String(frame.u);root.dataset.v=frame.v===null?'none':String(frame.v);
      slider.value=String(Math.round(elapsed));output.textContent=`0:${String(Math.floor(elapsed/1000)).padStart(2,'0')} / 0:18`;
      if(frame.beat!==lastBeat){lastBeat=frame.beat;caption.querySelector('h3').textContent=clip.beats[frame.beat][0];caption.querySelector('p').textContent=clip.beats[frame.beat][1];caption.querySelector('span').textContent=`0${frame.beat+1} / 03`;root.querySelectorAll('[data-beat]').forEach((b,i)=>b.setAttribute('aria-current',String(i===frame.beat)));svg.setAttribute('aria-label',clip.beats[frame.beat][0]+'。'+clip.beats[frame.beat][1]);}
    }
    function state(){root.dataset.playing=String(playing);play.textContent=playing?'Ⅱ 暂停':'▶ 播放';play.setAttribute('aria-label',playing?'暂停动画':'播放动画');status.textContent=elapsed>=duration?'本段播放完毕。可以重播，也可以直接去下一段。':playing?'正在慢放 · 不会自动跳到下一课':'已暂停 · 拖动进度，可以停在任何一幅画面';}
    function pause(){playing=false;cancelAnimationFrame(raf);raf=0;state();}
    function tick(now){if(!playing||disposed)return;elapsed=Math.min(duration,elapsed+Math.min(now-prev,100));prev=now;render();if(elapsed>=duration)pause();else raf=requestAnimationFrame(tick);}
    function start(){if(elapsed>=duration)elapsed=0;playing=true;prev=performance.now();state();raf=requestAnimationFrame(tick);}
    play.addEventListener('click',()=>playing?pause():start());
    root.querySelector('.cinema-replay').addEventListener('click',()=>{pause();elapsed=0;receiver=null;render();start();});
    slider.addEventListener('input',()=>{pause();elapsed=Number(slider.value);render();state();});
    root.querySelectorAll('[data-beat]').forEach(b=>b.addEventListener('click',()=>{pause();elapsed=Number(b.dataset.beat)*6000;render();state();}));
    root.querySelector('.cinema-zoom').addEventListener('click',e=>{const zoom=root.classList.toggle('cinema-enlarged');e.currentTarget.setAttribute('aria-pressed',String(zoom));e.currentTarget.textContent=zoom?'收回图示':'放大图示';render();});
    const screen=root.querySelector('.cinema-screen');if(screen)screen.addEventListener('click',()=>{pause();elapsed=duration;receiver=receiver===null?false:!receiver;screen.textContent=receiver?'移走光屏，再看光路':'放回光屏，接住实像';render();state();});
    function hidden(){if(document.hidden)pause();}document.addEventListener('visibilitychange',hidden);
    const resize=new ResizeObserver(()=>{if(!disposed)render();});resize.observe(root);
    active={dispose(){disposed=true;cancelAnimationFrame(raf);resize.disconnect();document.removeEventListener('visibilitychange',hidden);}};
    render();state();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)start();
  }
  window.LensCinema={mount,destroy};
})();
