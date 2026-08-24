// V8: fresh combined draw file to avoid stale cached scripts.
spin = function(){
  const cats=state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  const values=[
    {points:200,diff:'easy',label:'سهل'},
    {points:400,diff:'medium',label:'متوسط'},
    {points:600,diff:'hard',label:'صعب'}
  ];
  gameLayout(`
    <div class="spin-copy simple-spin-copy">
      <div class="turn-label">السحب العشوائي</div>
      <h2>اسحبوا لتحديد الفئة والنقاط</h2>
      <p class="reel-help">ضغطة واحدة تختار الفئة وقيمة السؤال</p>
    </div>
    <div class="category-draw-grid" id="categoryDrawGrid">
      ${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="--cat:${c.color};background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
    </div>
    <div id="drawResult" class="picked-category simple-picked"></div>
    <button class="spin-action simple-spin-action" id="spinBtn">اسحب الآن</button>
    <div class="rule-strip"><span>🎯 النقاط عشوائية</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>
  `);

  const btn=document.getElementById('spinBtn');
  const result=document.getElementById('drawResult');
  const cards=[...document.querySelectorAll('.draw-cat-card')];
  let running=false;

  btn.onclick=()=>{
    if(running)return;
    running=true;btn.disabled=true;result.innerHTML='';
    cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));
    const finalIndex=Math.floor(Math.random()*cards.length);
    const pointChoice=values[Math.floor(Math.random()*values.length)];
    const steps=18+Math.floor(Math.random()*7);
    let step=0;
    const hop=()=>{
      cards.forEach(c=>c.classList.remove('draw-active'));
      const index=step<steps ? step%cards.length : finalIndex;
      cards[index].classList.add('draw-active');
      if(step<steps){const delay=70+Math.floor(step*9);step++;setTimeout(hop,delay);return;}
      const winner=cards[finalIndex];
      cards.forEach(c=>c.classList.remove('draw-active'));
      winner.classList.add('draw-winner');
      state.selectedCategory=winner.dataset.key;
      state.drawnDifficulty=pointChoice.diff;
      state.drawnPoints=pointChoice.points;
      const c=CATS[state.selectedCategory];
      result.innerHTML=`<div class="picked-pill simple-picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>السحب اختار</small><strong>${c.name} · ${pointChoice.points} نقطة</strong></div><b>✨</b></div>`;
      btn.textContent='ابدأ السؤال';btn.disabled=false;running=false;
      btn.onclick=()=>pickQuestion(pointChoice.diff);
    };
    hop();
  };
};

// Safety fallback only; this screen should not be used in the normal flow.
difficulty=function(){pickQuestion(state.drawnDifficulty||'easy');};