// Combined category + points draw — polished game-night flow
spin = function(){
  const cats=state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  const values=[{points:200,diff:'easy',label:'سهل'},{points:400,diff:'medium',label:'متوسط'},{points:600,diff:'hard',label:'صعب'}];
  gameLayout(`
    <div class="spin-copy">
      <div class="turn-label">السحب العشوائي</div>
      <h2>اسحبوا التحدي</h2>
      <p class="reel-help">ضغطة واحدة تختار الفئة والنقاط</p>
    </div>
    <div class="category-draw-grid" id="categoryDrawGrid">
      ${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
    </div>
    <div id="drawResult" class="picked-category"></div>
    <button class="spin-action" id="spinBtn">اسحب الآن</button>
    <div class="rule-strip"><span>🎯 النقاط عشوائية</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);
  const btn=document.getElementById('spinBtn'),result=document.getElementById('drawResult'),cards=[...document.querySelectorAll('.draw-cat-card')];
  let running=false;
  btn.onclick=()=>{
    if(running)return; running=true; btn.disabled=true; result.innerHTML='';
    cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));
    const finalIndex=Math.floor(Math.random()*cards.length), pointChoice=values[Math.floor(Math.random()*values.length)];
    let step=0,steps=20+Math.floor(Math.random()*7);
    const hop=()=>{
      cards.forEach(c=>c.classList.remove('draw-active'));
      const index=step<steps?step%cards.length:finalIndex; cards[index].classList.add('draw-active');
      if(step<steps){const delay=55+step*8;step++;setTimeout(hop,delay);return;}
      const winner=cards[finalIndex]; cards.forEach(c=>c.classList.remove('draw-active')); winner.classList.add('draw-winner');
      state.selectedCategory=winner.dataset.key; state.drawnDifficulty=pointChoice.diff; state.drawnPoints=pointChoice.points;
      const c=CATS[state.selectedCategory];
      result.innerHTML=`<div class="picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>التحدي المختار</small><strong>${c.name} · ${pointChoice.points} نقطة · ${pointChoice.label}</strong></div><b>✨</b></div>`;
      btn.textContent='ابدأ السؤال';btn.classList.add('points-ready');btn.disabled=false;running=false;
      btn.onclick=()=>pickQuestion(pointChoice.diff);
    };hop();
  };
};
difficulty=function(){pickQuestion(state.drawnDifficulty||'easy');};