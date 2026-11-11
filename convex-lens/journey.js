'use strict';
(() => {
  const $=id=>document.getElementById(id),api=window.LensLesson;
  const STEPS=[
    {chapter:'一 · 先认识画面里的东西',name:'物体和像',title:'右边的小蜡烛，是怎样出现的？',intro:'先看一段动画，不需要答题。跟着光走，再分清“蜡烛”和“蜡烛的像”。',clip:'objects',note:'物体是实际放着的蜡烛；像是光形成的图像。光屏只负责承接它。'},
    {chapter:'一 · 先认识画面里的东西',name:'物距 u',title:'蜡烛动起来，物距就好懂了。',intro:'这一段只看左边：蜡烛到透镜的距离。先不加入其他字母。',clip:'u',note:'物距 u：物体到透镜的距离。物体越远，u 越大。'},
    {chapter:'一 · 先认识画面里的东西',name:'像距 v',title:'换到右边：这次量的是像。',intro:'像距从透镜开始，量到像的位置。光屏要去找它，不是把它推着走。',clip:'v',note:'像距 v：像到透镜的距离。只有光屏接到清晰像时，才能把透镜到光屏的距离读作实像的像距。'},
    {chapter:'一 · 先认识画面里的东西',name:'焦点 F 与焦距 f',title:'看平行的光，会在哪里碰到一起？',intro:'暂时拿走蜡烛，只看平行光经过透镜。焦点是一个位置，焦距是一段距离。',clip:'f',note:'焦点叫 F；透镜到 F 的距离叫 f。本课 f 固定为 10 cm，移动蜡烛不改变它。'},
    {chapter:'一 · 先认识画面里的东西',name:'两倍焦距 2f',title:'再接上一段同样长的距离，就是 2f。',intro:'不是新公式，就是两个 10 cm。看标尺怎样从 F 延长到 2F。',clip:'twof',note:'f = 10 cm，2f = 20 cm；F、2F 是距透镜一倍、两倍焦距的位置标记。'},
    {chapter:'一 · 先认识画面里的东西',name:'把条件读成位置',title:'让蜡烛走进“F 与 2F 之间”。',intro:'图看明白后，再把这段位置写成 f < u < 2f。先有画面，再有符号。',clip:'interval',note:'f < u < 2f 描述的是物体在 F 与 2F 之间；等于 F 或 2F 的情况要单独讨论。'},
    {chapter:'二 · 先学会看懂一个像',name:'光为什么能成实像',title:'先让光会聚，再把光屏放过去。',intro:'追踪火焰顶端的两条代表性光线。看完还可以移走光屏，观察光的会聚位置有没有变化。',clip:'real',note:'实际光线会聚形成实像，可以用光屏承接。移走光屏，原来的实像位置并不消失。'},
    {chapter:'二 · 先学会看懂一个像',name:'为什么是倒立',title:'盯住火焰顶端，看它成像到了哪里。',intro:'金色的点始终表示火焰顶端。这一次只看方向，不比较大小。',clip:'orientation',note:'物体的上方成像到下方，上下颠倒，叫倒立。正倒与大小是两个不同的问题。'},
    {chapter:'二 · 先学会看懂一个像',name:'怎样判断大小',title:'不看方向了，只比两根高度标尺。',intro:'还是刚才同一个像。先比较高度，再把“方向、大小、虚实”这三个描述合起来。',clip:'size',note:'这个例子是倒立、缩小的实像：倒立回答方向；缩小回答大小；实像回答光是否实际会聚、能否接屏。'},
    {chapter:'三 · 每段只看一种成像',name:'物体在 2F 外',title:'蜡烛更远，像却更近、更小。',intro:'只在 2F 外移动物体。观察另一侧的像始终待在哪一段。',clip:'far',note:'u > 2f → f < v < 2f → 倒立、缩小、实像。典型应用：照相机。'},
    {chapter:'三 · 每段只看一种成像',name:'物体恰好在 2F',title:'停在 2F，看两边怎样对上。',intro:'从远处慢慢移近，到 2F 就停。特别注意“等于”这个边界。',clip:'double',note:'u = 2f → v = 2f → 倒立、等大、实像。等大不是正立；这一行不必硬配常用仪器。'},
    {chapter:'三 · 每段只看一种成像',name:'物体在 F 与 2F 之间',title:'蜡烛靠近，像向远处长大。',intro:'只在 F 与 2F 之间移动。把“投影仪为什么能投大”与眼前的变化连起来。',clip:'between',note:'f < u < 2f → v > 2f → 倒立、放大、实像。典型应用：投影仪。'},
    {chapter:'三 · 每段只看一种成像',name:'物体恰好在 F',title:'这一次，出射光不再相交。',intro:'u = f 要单独看。两条光线变成平行光，在有限的位置找不到会聚点。',clip:'focus',note:'u = f 时，不成有限远的像。在有限距离放光屏，接不到清晰的像。'},
    {chapter:'三 · 每段只看一种成像',name:'物体在 F 内',title:'光没有会聚，为什么仍能看到放大的像？',intro:'先看实际光线，再出现虚线辅助定位。“虚”不是看不见，而是像的位置没有光实际会聚。',clip:'inside',note:'u < f → 正立、放大、虚像；物像同侧。眼睛从透镜另一侧看得到，光屏接不到。典型应用：放大镜。'},
    {chapter:'四 · 看懂后，再连起规律',name:'把三种实像串起来',title:'现在，把三段熟悉的动画连起来。',intro:'远处缩小 → 2F 等大 → F 与 2F 之间放大。先看连续变化，表格放在下面，想整理时再展开。',clip:'compare',mode:'table',note:'“物近像远像变大”的前提：同一块凸透镜，且 u > f，始终在成实像。不要直接套到虚像。'},
    {chapter:'四 · 看懂后，再连起规律',name:'跟着推“已知一条”',title:'看到 v > 2f，怎样顺着推出另外四条？',intro:'现在再讲你圈出的那一题。不提问、不打分，点击“推下一步”，每次只展开一个结论。这里已知光屏能接到实像。',mode:'guide'},
    {chapter:'五 · 自己动手，再去练习',name:'自由实验',title:'自己移动蜡烛，复现刚才看到的变化。',intro:'想在一个位置停多久都可以。移动物体后，再把光屏移到清晰处。完整规律表和条件筛选器留作复习工具。',mode:'sandbox'},
    {chapter:'六 · 最后才是练习',name:'学懂以后，补齐四格',title:'已经看懂现象，现在再独立推一次。',intro:'这里保留原来的六道题和推理难度。练习不锁住任何动画；卡住时随时回看，不必靠猜过关。',mode:'quiz'}
  ];
  let current=0;
  const parts={guide:document.querySelector('.guide-grid'),mastery:$('mastery'),quizTabs:$('quiz-tabs'),quiz:document.querySelector('.quiz-paper'),completion:$('completion'),presets:document.querySelector('.preset-row'),bench:document.querySelector('.optical-bench'),metrics:document.querySelector('.metrics'),table:document.querySelector('.table-details'),clues:document.querySelector('.transfer')};
  function stash(){Object.values(parts).forEach(el=>{if(el)$('resource-bin').appendChild(el);});}
  function tableHTML(){return '<details class="review-table"><summary>看完动画，再展开三种实像的对照表</summary><div class="built-table"><div class="table-scroll"><table><caption>已知 v，先找像距这一列；找到符合的行，再横着读。</caption><thead><tr><th>物距 u</th><th>像距 v</th><th>像的性质</th><th>典型应用</th></tr></thead><tbody><tr><td>u &gt; 2f</td><td>f &lt; v &lt; 2f</td><td>倒立、缩小、实像</td><td>照相机</td></tr><tr><td>u = 2f</td><td>v = 2f</td><td>倒立、等大、实像</td><td>不必硬配</td></tr><tr><td>f &lt; u &lt; 2f</td><td>v &gt; 2f</td><td>倒立、放大、实像</td><td>投影仪</td></tr></tbody></table></div></div><p>只知道“实像”，三行都可能；再知道 v &gt; 2f，才能确定第三行。手机上表格可横向滑动。</p></details>';}
  function navigation(){
    $('previous-step').disabled=current===0;$('next-step').disabled=false;
    $('next-step').textContent=current===17?'回到动画开头 ↺':current===16?'学懂了，去练习 →':current===14?'跟着推一题 →':'下一段 →';
    $('next-help').textContent=current<15?'先看懂，不答题；随时回看。':current===17?'练习可稍后做，不会锁住动画。':'不用过关，按自己的节奏看。';
    $('visited-steps').innerHTML=STEPS.map((s,i)=>`<button data-visit="${i}" aria-current="${i===current?'step':'false'}">${i+1}. ${s.name}</button>`).join('');
  }
  function render(scroll=true){
    window.LensCinema.destroy();stash();const step=STEPS[current];
    $('chapter-name').textContent=step.chapter;$('step-count').textContent=`${step.clip?'动画':step.mode==='quiz'?'练习':'课堂'} ${current+1} / ${STEPS.length}`;
    $('journey-fill').style.width=`${(current+1)/STEPS.length*100}%`;
    let html=`<div class="lesson-heading"><span class="tag">${step.clip?'先观察 · ':''}${step.name}</span><h2 id="lesson-title" tabindex="-1">${step.title}</h2><p>${step.intro}</p></div>`;
    if(step.clip)html+='<div id="teaching-cinema"></div>';else html+='<div id="embedded-content" class="embedded-lesson"></div>';
    if(step.note)html+=`<details class="review-table"><summary>把这一段记成一句话</summary><p>${step.note}</p></details>`;
    if(step.mode==='table')html+=tableHTML();$('lesson-content').innerHTML=html;
    if(step.clip)window.LensCinema.mount($('teaching-cinema'),step.clip);
    const container=$('embedded-content');
    if(step.mode==='guide'){container.classList.add('sequenced-guide');container.appendChild(parts.guide);api.setGuideStep(0);}
    else if(step.mode==='sandbox'){[parts.presets,parts.bench,parts.metrics,parts.table,parts.clues].forEach(p=>container.appendChild(p));parts.table.open=false;api.setU(30,true);api.renderLab();}
    else if(step.mode==='quiz'){
      [parts.mastery,parts.quizTabs,parts.quiz,parts.completion].forEach(p=>container.appendChild(p));
      const back=document.createElement('div');back.className='practice-route';back.innerHTML='<button data-rewatch="11">↺ 回看放大实像的动画</button><button data-rewatch="15">↺ 跟着推一次 v &gt; 2f</button>';container.prepend(back);
    }
    navigation();if(scroll){$('journey').scrollIntoView({behavior:'instant',block:'start'});$('lesson-title').focus({preventScroll:true});}
  }
  function go(index){current=Math.max(0,Math.min(index,STEPS.length-1));render();}
  $('previous-step').addEventListener('click',()=>go(current-1));$('next-step').addEventListener('click',()=>go(current===17?0:current+1));
  $('visited-steps').addEventListener('click',e=>{const b=e.target.closest('[data-visit]');if(b)go(Number(b.dataset.visit));});
  $('lesson-content').addEventListener('click',e=>{const b=e.target.closest('[data-rewatch]');if(b)go(Number(b.dataset.rewatch));});
  ['guide-prev','guide-next'].forEach(id=>$(id).addEventListener('click',()=>{if(current===15)$('embedded-content').classList.toggle('complete-guide',api.getGuideStep()===4);}));
  $('start-animation').addEventListener('click',()=>go(0));
  $('open-outline').addEventListener('click',()=>{document.querySelector('.visited-nav').open=true;document.querySelector('.visited-nav').scrollIntoView({behavior:'instant',block:'start'});});
  render(false);
})();
