// V6: random category draw followed by an equally random points draw.
// 200 -> easy, 400 -> medium, 600 -> hard. The team no longer chooses the value.
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
      btn.textContent='اسحبوا النقاط';btn.disabled=false;btn.classList.add('points-ready');running=false;
      btn.onclick=()=>{state.screen='difficulty';render();};
    };
    hop();
  };
};

// Points are now a second random draw instead of a manual choice.
difficulty = function(){
  const c=CATS[state.selectedCategory];
  const values=[
    {points:200,diff:'easy',label:'سهل',cls:'easy'},
    {points:400,diff:'medium',label:'متوسط',cls:'medium'},
    {points:600,diff:'hard',label:'صعب',cls:'hard'}
  ];
  gameLayout(`
    <div class="selected-cat">${c.emoji} ${c.name}</div>
    <div class="spin-copy simple-spin-copy points-copy">
      <div class="turn-label">النقاط العشوائية</div>
      <h2>اسحبوا لتحديد النقاط</h2>
      <p class="reel-help">200 أو 400 أو 600 — لكل قيمة فرصة متساوية</p>
    </div>
    <div class="difficulty-grid random-points-grid" id="pointsDrawGrid">
      ${values.map(v=>`<div class="difficulty ${v.cls} point-draw-card" data-points="${v.points}" data-diff="${v.diff}"><div class="points">${v.points}</div><small>${v.label}</small></div>`).join('')}
    </div>
    <div id="pickedPoints" class="picked-category simple-picked"></div>
    <button class="spin-action simple-spin-action" id="pointsSpinBtn">اسحب النقاط</button>
  `);

  const btn=document.getElementById('pointsSpinBtn');
  const cards=[...document.querySelectorAll('.point-draw-card')];
  const picked=document.getElementById('pickedPoints');
  let running=false;
  btn.onclick=()=>{
    if(running)return;
    running=true;btn.disabled=true;picked.innerHTML='';
    cards.forEach(x=>x.classList.remove('draw-active','draw-winner'));
    const finalIndex=Math.floor(Math.random()*values.length);
    const steps=12+Math.floor(Math.random()*7);
    let step=0;
    const hop=()=>{
      cards.forEach(x=>x.classList.remove('draw-active'));
      const index=step<steps ? step%cards.length : finalIndex;
      cards[index].classList.add('draw-active');
      if(step<steps){step++;setTimeout(hop,90+step*14);return;}
      const winner=cards[finalIndex],choice=values[finalIndex];
      winner.classList.add('draw-winner');
      picked.innerHTML=`<div class="picked-pill simple-picked-pill"><span>🎯</span><div><small>النقاط المختارة</small><strong>${choice.points} نقطة</strong></div><b>✨</b></div>`;
      btn.textContent='ابدأ السؤال';btn.disabled=false;running=false;
      btn.onclick=()=>pickQuestion(choice.diff);
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