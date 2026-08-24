// Stable category roulette: cards stay visible, the selected category remains visible in color,
// then the player explicitly continues to the points screen.
spin = function(){
  const cats=state.categories.map(k=>[k,CATS[k]]);
  gameLayout(`
    <div class="spin-copy">
      <div class="turn-label">الفئة العشوائية</div>
      <h2>اسحبوا لتحديد الفئة</h2>
    </div>
    <div class="reel-shell" id="reelShell">
      <div class="reel-pointer"></div>
      <div class="reel-window" id="reelWindow">
        <div class="reel-track stable-track" id="reelTrack">
          ${cats.map(([k,c])=>`<div class="reel-item" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
        </div>
      </div>
    </div>
    <div id="chosenCategory"></div>
    <button class="spin-action" id="spinBtn">اسحب الآن</button>
    <div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>
  `);

  const btn=document.getElementById('spinBtn');
  const items=[...document.querySelectorAll('.reel-item')];
  const chosenBox=document.getElementById('chosenCategory');

  btn.onclick=()=>{
    btn.disabled=true;
    chosenBox.innerHTML='';
    let steps=18+Math.floor(Math.random()*10);
    let current=0;
    const timer=setInterval(()=>{
      items.forEach(x=>x.classList.remove('reel-active'));
      items[current%items.length].classList.add('reel-active');
      current++;
      steps--;
      if(steps<=0){
        clearInterval(timer);
        const chosen=items[(current-1)%items.length];
        const key=chosen.dataset.key;
        const c=CATS[key];
        state.selectedCategory=key;
        items.forEach(x=>x.classList.remove('reel-active'));
        chosen.classList.add('reel-active');
        chosenBox.innerHTML=`
          <div class="chosen-category-card" style="background:${c.color}">
            <span class="chosen-category-emoji">${c.emoji}</span>
            <strong>${c.name}</strong>
          </div>
        `;
        btn.textContent='اختاروا النقاط';
        btn.disabled=false;
        btn.onclick=()=>{state.screen='difficulty';render();};
      }
    },95);
  };
};

// Points always appear in ascending order visually: 200 → 400 → 600.
difficulty = function(){
  const c=CATS[state.selectedCategory];
  gameLayout(`
    <div class="selected-cat">${c.emoji} ${c.name}</div>
    <h2 class="center-title">كم نقطة تبون؟</h2>
    <div class="difficulty-grid points-ascending">
      <button class="difficulty easy" data-diff="easy"><div class="points">200</div></button>
      <button class="difficulty medium" data-diff="medium"><div class="points">400</div></button>
      <button class="difficulty hard" data-diff="hard"><div class="points">600</div></button>
    </div>
  `);
  document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>pickQuestion(b.dataset.diff));
};
