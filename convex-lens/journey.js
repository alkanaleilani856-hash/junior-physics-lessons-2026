'use strict';
(() => {
  const $=id=>document.getElementById(id),all=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const api=window.LensLesson,model=window.LensModel.model;
  const STEPS=[
    {chapter:'一 · 先读懂题目里的名字',name:'物体和像',title:'先别看字母。分清“蜡烛”和“蜡烛的像”。',intro:'左边是真正的蜡烛。光经过中间的凸透镜，在右边光屏上形成蜡烛的图像。右边没有放第二支蜡烛。',mode:'objects',note:'这一步只记：<strong>物体</strong>是左边真正的蜡烛；<strong>像</strong>是右边看到的图像。光屏只是接住图像的东西。',question:'右边光屏上看见的“小蜡烛”，叫什么？',options:['蜡烛的像','第二支真正的蜡烛','凸透镜'],answer:0,why:'对。物体是实际放着的蜡烛；光屏上看到的是它的像。',wrong:'先看物体放在哪里：真正的蜡烛只有左边一支。右边是光形成的图像。'},
    {chapter:'一 · 先读懂题目里的名字',name:'只认识 u',title:'现在只看左边这段距离。它叫物距 u。',intro:'从透镜量到物体，这段距离就叫物距，记作 u。右边的像先不看。拖一拖滑块，看看蜡烛越远，u 是不是越大。',mode:'u',slider:[20,40,30],note:'记一个对应就够了：<strong>u → 物体到透镜</strong>。不是物体到光屏。',question:'测量物距 u，应该从透镜量到哪里？',options:['光屏上的像','左边的物体','右边的焦点'],answer:1,why:'对。u 只管“物体到透镜”这段距离。',wrong:'回到图中黄色的线段：一端是透镜，另一端是物体。u 的“物”，就是物体。'},
    {chapter:'一 · 先读懂题目里的名字',name:'只认识 v',title:'再看右边这段距离。它叫像距 v。',intro:'从透镜量到像，这段距离叫像距，记作 v。这里光屏正好接到清晰的像，所以量到光屏上的像即可。',mode:'v',note:'这一步只记：<strong>v → 像到透镜</strong>。题目给 v，就是在告诉你“像的位置”，不是物体的位置。',question:'题目说“像距 v = 15 cm”，说的是哪段？',options:['物体到透镜','物体到光屏','像到透镜'],answer:2,why:'对。已知 v，是像的位置已知；已知 u，才是物体的位置已知。',wrong:'先把“像距”两个字读出来。它对应像与透镜之间的距离，不是物距。'},
    {chapter:'一 · 先读懂题目里的名字',name:'认识 F 和 f',title:'F 是一个位置，f 是到这个位置的距离。',intro:'一些平行的光经过凸透镜，会聚到一个点，这个点叫焦点 F。透镜到焦点的距离，叫焦距 f。',mode:'f',note:'本课始终用同一块透镜：<strong>f = 10 cm</strong>。移动蜡烛，不会把这块透镜的焦距改掉。',question:'把蜡烛向透镜移近一些，这块透镜的 f 会怎样？',options:['仍是 10 cm','跟着蜡烛变小','变成像距 v'],answer:0,why:'对。我们没有换透镜，焦距还是 10 cm。物距变了，不代表焦距也变了。',wrong:'f 是透镜到焦点的距离，由这块透镜决定。移动的是蜡烛，不是焦点。'},
    {chapter:'一 · 先读懂题目里的名字',name:'认识 2F 和 2f',title:'2f 就是“两倍焦距”，不是一个新的难公式。',intro:'f = 10 cm，那么 2f = 20 cm。透镜外 10 cm 的位置标 F，20 cm 的位置标 2F。两侧都有这样的刻度。',mode:'twof',note:'把它当成两道位置标记：<strong>F 在 10 cm，2F 在 20 cm</strong>。这一步先不讨论成什么像。',question:'本课 f = 10 cm，那么 2F 离透镜多远？',options:['5 cm','20 cm','30 cm'],answer:1,why:'对。2f = 2 × 10 = 20 cm。后面的“之间”“以外”，就是和这两道标记比较。',wrong:'“2f”是 2 乘以 f。把 f = 10 cm 代进去，只需要算 2 × 10。'},
    {chapter:'一 · 先读懂题目里的名字',name:'把不等式读成位置',title:'f < u < 2f，只是在说“物体放在哪”。',intro:'先换成数字读：10 cm < 物距 < 20 cm。也就是说，物体在这一侧的 F 与 2F 之间。',mode:'inequality',note:'先认字母，再读位置：这里是 <strong>u</strong>，所以我们找的是<strong>物体</strong>，不是像。等于 F 或 2F 时要另看，不算“之间”。',question:'f = 10 cm、u = 15 cm，物体放在哪一段？',options:['F 以内','2F 以外','F 与 2F 之间'],answer:2,why:'对。10 < 15 < 20，所以 f < u < 2f。你已经能把字母条件翻译成图上的位置了。',wrong:'按数轴排一排：10、15、20。15 在 10 和 20 之间，也就在 F 与 2F 之间。'},
    {chapter:'二 · 学会描述眼前这个像',name:'先认实像',title:'光真的会聚，能被光屏接到，这叫实像。',intro:'现在只观察这一个现象：从火焰顶端来的光，经过透镜后，真的在右边相交。把光屏放在这里，就能接到清晰的像。',mode:'real',screenButton:true,note:'这一小步只判断<strong>实像</strong>，先不判断大小。图中只画两条代表性光线，暂时只看它们是否真的相交。',question:'光线实际会聚、能用光屏承接的像，叫作什么？',options:['实像','虚像','只要看到就是虚像'],answer:0,why:'对。能在光屏上接到，是判断实像的重要依据。移走光屏，原来的成像位置并不因此改变。',wrong:'注意两个依据：“光真的会聚”和“光屏能接到”。它们对应的是实像。'},
    {chapter:'二 · 学会描述眼前这个像',name:'再看正倒',title:'第二个问题：像的顶端，是朝上还是朝下？',intro:'左边蜡烛的火焰朝上；右边像的火焰却在下方。上下颠倒，所以这个像叫倒立的像。',mode:'orientation',note:'判断<strong>正倒</strong>，只比较方向。不要把“倒立”和“放大、缩小”混成同一个问题。',question:'图中这个像的方向是怎样的？',options:['正立','倒立','缩小'],answer:1,why:'对，方向是倒立。“缩小”是回答大小的问题，不是在回答方向。',wrong:'看火焰在哪一端：物体的火焰在上，像的火焰在下，所以方向是倒立。'},
    {chapter:'二 · 学会描述眼前这个像',name:'最后比大小',title:'第三个问题：像比原来的物体大，还是小？',intro:'还是看刚才同一个像。比较蜡烛和像的高度：右边的像更矮，所以它是缩小的像。',mode:'size',note:'现在才把三个已学过的词放一起：这个像是<strong>倒立、缩小的实像</strong>。它们分别回答方向、大小、能否接屏三个问题。',question:'描述图中这个像的大小，应当选哪一个词？',options:['倒立','实像','缩小'],answer:2,why:'对。大小选“缩小”，方向选“倒立”，能实际会聚并接屏叫“实像”。三个词各管一件事。',wrong:'这次问的是大小。请只比较高度：像比物体矮，所以叫缩小。'},
    {chapter:'三 · 一次只观察一种情况',name:'情况一：物在 2F 外',title:'第一种：把物体放在 2F 以外。',intro:'已知物体在 2F 外，就是 u > 2f。现在只观察这一种情况：像在另一侧的 F 与 2F 之间。小范围移动蜡烛，看看是不是仍在这一段。',mode:'case',u:30,slider:[25,40,30],note:'只记录这一行：<strong>u > 2f → f < v < 2f → 倒立、缩小、实像</strong>。照相机是这一行的典型应用。先别急着和别的情况比较。',question:'物体在 2F 外时，这个实像在哪一段？',options:['另一侧 2F 外','另一侧 F 与 2F 之间','与物体同侧'],answer:1,why:'对。第一行就是：物远（2F 外），像在另一侧 F 与 2F 之间，倒立缩小实像。',wrong:'先看右侧两道标记，再看倒立蜡烛的像：它在右侧 F 与 2F 之间，不是在 2F 外。'},
    {chapter:'三 · 一次只观察一种情况',name:'情况二：物在 2F 上',title:'第二种：物体恰好放到 2F 上。',intro:'这次不是“以外”，也不是“之间”，而是 u = 2f。像也恰好落在另一侧 2F 处。',mode:'case',u:20,note:'只记录这一行：<strong>u = 2f → v = 2f → 倒立、等大、实像</strong>。等大不代表正立。这一行不必硬配一种常用仪器。',question:'u = 2f 时，像与物体的大小关系是？',options:['像更大','像更小','像与物体等大'],answer:2,why:'对。物距和像距都等于 2f，像与物体等大，但像仍然倒立。',wrong:'用眼睛比较两支蜡烛的高度：它们等高。像仍倒立，不能因为“等大”就改成正立。'},
    {chapter:'三 · 一次只观察一种情况',name:'情况三：物在 F 与 2F 间',title:'第三种：物体放进 F 与 2F 之间。',intro:'现在已知 f < u < 2f。注意看右边：像会落到 2F 以外，而且比物体大。这就是你那道题最后要找到的一行。',mode:'case',u:15,slider:[13,18,15],note:'只记录这一行：<strong>f < u < 2f → v > 2f → 倒立、放大、实像</strong>。投影仪需要把小画面投成大画面，属于这种情形。',question:'这一种情况中，像距 v 与 2f 的关系是什么？',options:['v > 2f','v = 2f','v < f'],answer:0,why:'对。像已经跑到右侧 2F 以外了，所以 v > 2f。稍后我们就从这个条件反过来找物距。',wrong:'这次先别看物体。题目问 v，请看右边像的位置：它在 2F 以外，所以 v 大于 2f。'},
    {chapter:'三 · 一次只观察一种情况',name:'情况四：物在 F 上',title:'第四种：物体恰好放在 F 上。',intro:'u = f 是一个特殊边界。从火焰顶端来的光经过透镜后成为平行光，不在有限远相交。',mode:'case',u:10,note:'只记录这个边界：<strong>u = f → 不成有限远的像</strong>。不能把等号并入前后任何一种情况。',question:'这时把光屏移到不同的有限距离，能接到清晰像吗？',options:['光屏越近就能接到','不能接到清晰像','一定能接到缩小的像'],answer:1,why:'对。这里两条出射光平行，不在有限远相交，所以光屏在有限位置接不到清晰像。',wrong:'先看两条出射光：它们平行，不会在有限远碰到一起。不是因为光屏还没找到某个很远的位置。'},
    {chapter:'三 · 一次只观察一种情况',name:'情况五：物在 F 内',title:'第五种：把物体放到 F 以内。',intro:'这次 u < f。右侧实际的光线没有相交；沿它们向后看，像好像来自左侧的一个更大的物体。这就是虚像。',mode:'case',u:7.5,note:'只记录这一行：<strong>u < f → 正立、放大、虚像；物像同侧</strong>。放大镜就是这种情形。虚线只辅助判断位置，不是光实际走的路。',question:'关于这个虚像，哪种说法正确？',options:['光屏能接到它','虚像就是谁也看不到','光屏接不到，但眼睛能透过透镜看见'],answer:2,why:'对。虚像的位置没有光实际会聚，所以不能接屏；但眼睛可以透过透镜看见它。',wrong:'“虚”不是“看不见”。想想放大镜里的字：眼睛能看到，但不能把这个虚像接在光屏上。'},
    {chapter:'四 · 把学过的行连起来',name:'现在才合并规律',title:'五种情况都见过了。现在才把它们放在一起。',intro:'你这道题有“光屏能接到”，所以先只留下三种实像。每行都是刚才单独观察过的一种情况，现在可以横着读。',mode:'table',note:'如果只知道“实像”，下面<strong>三行都可能</strong>，不能硬猜大小。但如果再给“v > 2f”，就能继续排除，找到唯一的一行。',question:'已知是实像，而且 v > 2f，符合哪一行？',options:['第一行：u > 2f','第二行：u = 2f','第三行：f < u < 2f'],answer:2,why:'对。先在“像距 v”这一列找到 v > 2f，再沿同一行向左读，物距就是 f < u < 2f。',wrong:'现在已知的是 v，请先看表格的“像距”那一列，别一上来就从 u 那一列猜。'},
    {chapter:'四 · 把学过的行连起来',name:'一步步推那四条',title:'已经找对了行。现在一个结论一个结论往下推。',intro:'我们不增加新规律。只用前面学过的内容，讲完你圈出的“v > 2f”那道题。每次只看当前这一小步。',mode:'guide'},
    {chapter:'五 · 最后独立作答',name:'自己补齐四格',title:'现在四项都认识了，再把它们一起写出来。',intro:'这才开始完整的“知一推四”。每题四格，保留原来的难度。先自己作答；哪格不懂，就看那一格的提示。',mode:'quiz'},
    {chapter:'完成 · 用自由实验巩固',name:'自由实验与完整规律表',title:'基础路线学完了。现在可以自由比较、自己验证。',intro:'前面刻意没有同时放出这些控制和整张表。现在你可以自由拖动蜡烛、调光屏，比较不同情况；遇到不确定的结论，回到对应的单步讲解。',mode:'sandbox'}
  ];
  let current=0,furthest=0,passed=new Set(),localU=30,showReceiver=false;
  const parts={guide:document.querySelector('.guide-grid'),mastery:$('mastery'),quizTabs:$('quiz-tabs'),quiz:document.querySelector('.quiz-paper'),completion:$('completion'),presets:document.querySelector('.preset-row'),bench:document.querySelector('.optical-bench'),metrics:document.querySelector('.metrics'),table:document.querySelector('.table-details'),clues:document.querySelector('.transfer')};
  function stash(){Object.values(parts).forEach(el=>{if(el)$('resource-bin').appendChild(el);});}
  const num=n=>Number(n.toFixed(3)),fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  const line=(x1,y1,x2,y2,color='#9eafa5',w=2,dash=false)=>`<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${color}" stroke-width="${w}" ${dash?'stroke-dasharray="7 6"':''}/>`;
  const text=(x,y,t,color='#2c5a50',size=25,small=false)=>`<text x="${num(x)}" y="${num(y)}" fill="${color}" text-anchor="middle" font-size="${size}" ${small?'data-small="true"':''}>${esc(t)}</text>`;
  const flame=(x,y,h=64,invert=false,virtual=false)=>`<g transform="translate(${num(x)} ${num(y)}) scale(1 ${invert?-1:1})"><rect x="${-h*.12}" y="${-h*.67}" width="${h*.24}" height="${h*.67}" rx="3" fill="${virtual?'none':'#4c7863'}" stroke="#4c7863" stroke-width="2" ${virtual?'stroke-dasharray="5 4"':''}/><path d="M0 ${-h} Q${-h*.24} ${-h*.7} 0 ${-h*.67} Q${h*.22} ${-h*.72} 0 ${-h}Z" fill="${virtual?'none':'#e8ad68'}" stroke="#987943" stroke-width="1.6" ${virtual?'stroke-dasharray="4 4"':''}/></g>`;
  const glass=(x,y)=>`<path d="M${x} ${y-115} Q${x-28} ${y} ${x} ${y+115} Q${x+28} ${y} ${x} ${y-115}Z" fill="#b9ded32b" stroke="#70a799" stroke-width="2.4"/>`;
  function dimension(a,b,y,t,color='#bd8831'){return line(a,y,b,y,color,3)+line(a,y-6,a,y+6,color)+line(b,y-6,b,y+6,color)+text((a+b)/2,y+31,t,color,24);}
  function drawScene(){
    const step=STEPS[current],mode=step.mode;if(!$('step-scene'))return;
    const U=step.slider?localU:(step.u||localU),m=model(U),O=450,Y=167;
    const variable=mode==='case',scale=variable?Math.min(8,350/Math.max(U,m.v===null?0:Math.abs(m.v),40)):8;
    const u=(mode==='u'||mode==='case')?U:mode==='inequality'?15:30;
    const mm=mode==='case'?m:model(u),v=mm.v;
    const h=variable?Math.min(64,125/Math.max(mm.m||1,1)):64;
    const X=O-u*scale,XI=v===null?null:O+v*scale;
    let s=`<defs><clipPath id="lesson-clip"><rect x="15" y="5" width="870" height="335"/></clipPath></defs><g clip-path="url(#lesson-clip)">`;
    s+=line(40,Y,860,Y,'#b4c5b9',1.3)+glass(O,Y)+text(O,28,'凸透镜','#2c5a50',25);
    const focusModes=['f','twof'];
    if(focusModes.includes(mode)){
      const xf=O+80;
      if(mode==='f'){s+=line(75,Y-56,O,Y-56,'#c27b3f',3)+line(O,Y-56,xf,Y,'#c27b3f',3)+line(75,Y+56,O,Y+56,'#568e81',3)+line(O,Y+56,xf,Y,'#568e81',3)+`<circle cx="${xf}" cy="${Y}" r="6" fill="#c98c35"/>`;}
      s+=line(xf,Y-6,xf,Y+6,'#538c76',2)+text(xf,Y+32,'F','#3f7f63',26)+dimension(O,xf,254,'f = 10 cm');
      if(mode==='twof'){s+=line(O+160,Y-6,O+160,Y+6,'#538c76',3)+text(O+160,Y+32,'2F','#3f7f63',26)+dimension(O,O+160,86,'2f = 20 cm','#4b846d')+text(724,199,'两倍远的位置','#527c65',24);}
    }else if(mode==='u'){
      s+=flame(X,Y,64)+text(X,Y-86,'物体')+dimension(X,O,252,`u = ${fmt(u)} cm`)+text(701,165,'这一步，先不看像。','#8b9b91',24);
    }else if(mode==='v'){
      const iv=O+120;s+=flame(210,Y,64)+text(210,Y-85,'物体','#a3b0a5',24)+`<rect x="${iv-3}" y="75" width="6" height="171" fill="#bac9b2"/>`+flame(iv,Y,32,true)+text(iv+34,97,'清晰的像','#327b70',26)+dimension(O,iv,267,'v = 15 cm','#347f73');
    }else if(mode==='inequality'){
      s+=`<rect x="290" y="65" width="80" height="173" rx="9" fill="#f2dfa0" opacity=".45"/>`;
      s+=flame(330,Y,64)+text(330,68,'物体')+line(370,Y-6,370,Y+6,'#6e9377',2)+line(290,Y-6,290,Y+6,'#6e9377',2)+text(370,Y+31,'F')+text(290,Y+31,'2F')+text(330,286,'10 < u = 15 < 20','#ad7627',26)+text(685,166,'只判断物体的位置。','#819889',24);
    }else{
      const isCase=mode==='case',isVirtual=isCase&&!mm.real&&v!==null;
      const rays=mode==='real'||(isCase&&(mm.regime==='inside'||mm.regime==='focus'));
      if(isCase){for(const sign of [-1,1])for(const k of [1,2]){const fx=O+sign*10*k*scale;s+=line(fx,Y-5,fx,Y+5,'#769781',2)+text(fx,Y+(k===1?29:53),k===1?'F':'2F','#4b7e67',22,true);}}
      if(rays){
        const xr=mm.real?XI:850,yr1=Y-h+h*((xr-O)/scale)/10,yr2=Y+h*((xr-O)/scale)/u;
        s+=line(X,Y-h,O,Y-h,'#cc8152',2.5)+line(O,Y-h,xr,yr1,'#cc8152',2.5)+line(X,Y-h,O,Y,'#4c9183',2.5)+line(O,Y,xr,yr2,'#4c9183',2.5);
        if(isVirtual)s+=line(O,Y-h,XI,Y+h*v/u,'#cc8152',2,true)+line(O,Y,XI,Y+h*v/u,'#4c9183',2,true);
      }
      const screenShown=mode==='objects'||mode==='v'||(mode==='real'&&showReceiver)||(isCase&&mm.real);
      if(screenShown&&XI!==null)s+=`<rect x="${num(XI-3)}" y="72" width="6" height="174" fill="#b2c1aa"/>`;
      s+=flame(X,Y,h)+text(X,Math.max(60,Y-h-22),'物体',mode==='objects'?'#245c44':'#3b6e58',25);
      if(v!==null){s+=flame(XI,Y,h*mm.m,mm.real,isVirtual);s+=text(XI,mm.real?Math.min(326,Y+h*mm.m+34):Math.max(21,Y-h*mm.m-16),isVirtual?'虚像':mode==='objects'?'蜡烛的像':'像','#ac742d',25);}
      if(mode==='real')s+=text(704,90,showReceiver?'光屏接到清晰的像':'光实际相交的地方','#357c66',24);
      if(mode==='orientation'){s+=`<circle cx="${X}" cy="${Y-h}" r="7" fill="#c1743e"/><circle cx="${XI}" cy="${Y+h*mm.m}" r="7" fill="#c1743e"/>`+text(715,92,'比较火焰的方向','#946b3c',24);}
      if(mode==='size'){s+=dimension(X-38,X-38,Y,'','#688f78');s+=line(X-38,Y-h,X-38,Y,'#688f78',3)+line(XI+37,Y,XI+37,Y+h*mm.m,'#ad864c',3)+text(734,94,'像更矮 → 缩小','#9b752f',25);}
      if(isCase){s+=text(X,316,`u = ${fmt(u)} cm`,'#4f7760',23);if(v!==null&&mm.real)s+=text(XI,89,`v = ${fmt(v)} cm`,'#ac742d',23);if(v===null)s+=text(696,307,'出射光平行','#ac742d',25);}
    }
    s+='</g>';$('step-scene').innerHTML=s;
    if($('simple-u-out'))$('simple-u-out').textContent=`${fmt(localU)} cm`;
  }
  function tableHTML(){return '<div class="built-table"><div class="table-scroll"><table><caption>先只比较刚学过的三种实像。已知 v，就先找像距这一列。</caption><thead><tr><th>已学过的行</th><th>物距 u</th><th>像距 v</th><th>像的性质</th><th>典型应用</th></tr></thead><tbody><tr><td>第一行</td><td>u &gt; 2f</td><td>f &lt; v &lt; 2f</td><td>倒立、缩小、实像</td><td>照相机</td></tr><tr><td>第二行</td><td>u = 2f</td><td>v = 2f</td><td>倒立、等大、实像</td><td>不必硬配</td></tr><tr><td>第三行</td><td>f &lt; u &lt; 2f</td><td>v &gt; 2f</td><td>倒立、放大、实像</td><td>投影仪</td></tr></tbody></table></div></div><p class="table-memory">手机上可左右滑动表格。焦点上与焦点内的两种情况仍保留，学完后可在完整规律表里复习。</p>';}
  function updateNavigation(){
    $('previous-step').disabled=current===0;
    const done=passed.has(current),last=current===STEPS.length-1;
    $('next-step').disabled=!done||last;$('next-step').textContent=last?'已完成本课 ✓':current===16?'去自由实验 →':'下一步 →';
    $('next-help').textContent=last?'需要复习时，可回看前面的单步。':done?'这一小步已完成。':STEPS[current].mode==='guide'?'先讲完当前这道题的五小步。':STEPS[current].mode==='quiz'?'六题通过后，进入自由实验。':'先判断这一题，再往前走。';
    $('visited-steps').innerHTML=STEPS.slice(0,furthest+1).map((s,i)=>`<button data-visit="${i}" aria-current="${i===current}">${passed.has(i)?'✓ ':''}${i+1}. ${s.name}</button>`).join('');
  }
  function render(scroll=true){
    stash();const step=STEPS[current];localU=step.slider?step.slider[2]:step.u||30;showReceiver=false;
    $('chapter-name').textContent=step.chapter;$('step-count').textContent=`小步 ${current+1} / ${STEPS.length}`;$('journey-fill').style.width=`${(current+1)/STEPS.length*100}%`;
    let html=`<div class="lesson-heading"><span class="tag">本步只学：${step.name}</span><h2 id="lesson-title">${step.title}</h2><p>${step.intro}</p></div>`;
    if(step.mode==='table')html+=tableHTML();
    else if(['guide','quiz','sandbox'].includes(step.mode))html+='<div id="embedded-content" class="embedded-lesson"></div>';
    else html+='<div class="one-scene"><svg id="step-scene" viewBox="0 0 900 350" role="img" aria-label="'+esc(step.name)+'的单一概念示意"></svg><p class="scene-caption">只看本步标出的信息。图为教学示意，不需要先用公式计算。</p></div>';
    if(step.slider)html+=`<div class="step-controls"><label><span>移动物体（只在本步范围内）<output id="simple-u-out"></output></span><input id="simple-u" type="range" min="${step.slider[0]}" max="${step.slider[1]}" value="${localU}" step="0.5" aria-label="本步物距"></label></div>`;
    if(step.screenButton)html+='<div class="step-controls"><button id="simple-screen" aria-pressed="false">把光屏放到相交处</button></div>';
    if(step.note)html+=`<div class="only-now">${step.note}</div>`;
    if(step.question)html+=`<div class="step-check"><span class="question-label">只判断当前这一件事</span><h3>${step.question}</h3><div class="step-options">${step.options.map((o,i)=>`<button data-step-answer="${i}">${o}</button>`).join('')}</div><p id="step-response" class="step-response" role="status">先选一次；答错会留在这一步解释。</p></div>`;
    $('lesson-content').innerHTML=html;drawScene();
    const container=$('embedded-content');
    if(step.mode==='guide'){
      container.classList.add('sequenced-guide');container.appendChild(parts.guide);api.setGuideStep(passed.has(current)?4:0);container.classList.toggle('complete-guide',api.getGuideStep()===4);
    }else if(step.mode==='quiz'){[parts.mastery,parts.quizTabs,parts.quiz,parts.completion].forEach(p=>container.appendChild(p));if(api.getSolved()===6)passed.add(current);}
    else if(step.mode==='sandbox'){
      [parts.presets,parts.bench,parts.metrics,parts.table,parts.clues].forEach(p=>container.appendChild(p));api.setU(30,true);api.renderLab();passed.add(current);
    }
    if($('simple-u'))$('simple-u').addEventListener('input',()=>{localU=Number($('simple-u').value);drawScene();});
    if($('simple-screen'))$('simple-screen').addEventListener('click',()=>{showReceiver=!showReceiver;$('simple-screen').setAttribute('aria-pressed',String(showReceiver));$('simple-screen').textContent=showReceiver?'移走光屏，再看光路':'把光屏放到相交处';drawScene();});
    if(passed.has(current)&&step.question){$('step-response').className='step-response good';$('step-response').textContent='这一步已完成。'+step.why;}
    updateNavigation();if(scroll)$('journey').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  $('lesson-content').addEventListener('click',e=>{
    const b=e.target.closest('[data-step-answer]');if(!b)return;const step=STEPS[current],correct=Number(b.dataset.stepAnswer)===step.answer;
    all('[data-step-answer]').forEach(el=>el.classList.remove('chosen-right','chosen-wrong'));b.classList.add(correct?'chosen-right':'chosen-wrong');
    $('step-response').className='step-response '+(correct?'good':'bad');$('step-response').textContent=correct?'✓ '+step.why:step.wrong;
    if(correct)passed.add(current);else passed.delete(current);updateNavigation();
  });
  function go(index){current=Math.max(0,Math.min(index,STEPS.length-1));furthest=Math.max(furthest,current);render();}
  $('previous-step').addEventListener('click',()=>go(current-1));$('next-step').addEventListener('click',()=>{if(passed.has(current))go(current+1);});
  $('visited-steps').addEventListener('click',e=>{const b=e.target.closest('[data-visit]');if(b)go(Number(b.dataset.visit));});
  ['guide-prev','guide-next'].forEach(id=>$(id).addEventListener('click',()=>{if(current!==15)return;const done=api.getGuideStep()===4;$('embedded-content').classList.toggle('complete-guide',done);if(done)passed.add(current);updateNavigation();}));
  // Quiz grading belongs to the existing component; observe only its public mastery state.
  const observer=new MutationObserver(()=>{if(current===16){if(api.getSolved()===6)passed.add(16);else passed.delete(16);updateNavigation();}});observer.observe($('mastery'),{childList:true,subtree:true});
  render(false);
})();
