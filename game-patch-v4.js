// V5: simple reliable category draw. All categories stay visible; a highlight hops between cards and stops on the actual selected category.
spin = function(){
  const cats = state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  gameLayout(`
    <div class="spin-copy simple-spin-copy">
      <div class="turn-label">الفئة العشوائية</div>
      <h2>اسحبوا لتحديد الفئة</h2>
      <p class="reel-help">اضغطوا على اسحب الآن وسيتم اختيار فئة عشوائياً</p>
    </div>
    <div class="category-draw-grid" id="categoryDrawGrid">
      ${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="--cat:${c.color};background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
    </div>
    <div id="pickedCategory" class="picked-category simple-picked"></div>
    <button class="spin-action simple-spin-action" id="spinBtn">اسحب الآن</button>
    <div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>
  `);

  const btn=document.getElementById('spinBtn');
  const picked=document.getElementById('pickedCategory');
  const cards=[...document.querySelectorAll('.draw-cat-card')];
  let running=false;

  btn.onclick=()=>{
    if(running)return;
    running=true;btn.disabled=true;picked.innerHTML='';
    cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));
    const finalIndex=Math.floor(Math.random()*cards.length);
    const steps=18+Math.floor(Math.random()*7);
    let step=0;
    const hop=()=>{
      cards.forEach(c=>c.classList.remove('draw-active'));
      const index=step<steps ? step%cards.length : finalIndex;
      cards[index].classList.add('draw-active');
      if(step<steps){
        const delay=70+Math.floor(step*9);
        step++;setTimeout(hop,delay);return;
      }
      const winner=cards[finalIndex];
      cards.forEach(c=>c.classList.remove('draw-active'));
      winner.classList.add('draw-winner');
      state.selectedCategory=winner.dataset.key;
      const c=CATS[state.selectedCategory];
      picked.innerHTML=`<div class="picked-pill simple-picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>الفئة المختارة</small><strong>${c.name}</strong></div><b>✨</b></div>`;
      btn.textContent='اختاروا النقاط';btn.disabled=false;btn.classList.add('points-ready');running=false;
      btn.onclick=()=>{state.screen='difficulty';render();};
    };
    hop();
  };
};

// If a team asks for answer choices on an open question, the question becomes worth exactly 50 points.
document.addEventListener('click',(event)=>{
  const button=event.target.closest('#giveChoices');if(!button)return;
  setTimeout(()=>{
    if(!state.usedChoiceAssist)return;
    state.currentAwardPoints=50;
    const pointsEl=document.getElementById('awardPoints');if(pointsEl)pointsEl.textContent='50';
    const area=document.getElementById('openAnswerArea');
    if(area){const notices=[...area.querySelectorAll('div')];const notice=notices.find(el=>el.textContent.includes('قيمة السؤال الآن'));if(notice)notice.textContent='استخدمتوا الخيارات — قيمة السؤال الآن 50 نقطة';}
  },0);
});