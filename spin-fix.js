// Stable category roulette: the pointer visibly lands on and highlights the selected category.
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
  const track=document.getElementById('reelTrack');
  const win=document.getElementById('reelWindow');

  const centerOn=(item,animate=true)=>{
    const target=item.offsetLeft + item.offsetWidth/2;
    const center=win.clientWidth/2;
    track.style.transition=animate?'transform .28s cubic-bezier(.2,.8,.2,1)':'none';
    track.style.transform=`translateX(${center-target}px)`;
  };

  btn.onclick=()=>{
    btn.disabled=true;
    chosenBox.innerHTML='';
    let steps=18+Math.floor(Math.random()*10);
    let current=0;
    const timer=setInterval(()=>{
      items.forEach(x=>x.classList.remove('reel-active'));
      const active=items[current%items.length];
      active.classList.add('reel-active');
      centerOn(active,true);
      current++;steps--;
      if(steps<=0){
        clearInterval(timer);
        const chosen=items[(current-1)%items.length];
        const key=chosen.dataset.key,c=CATS[key];
        state.selectedCategory=key;
        items.forEach(x=>x.classList.remove('reel-active','reel-winner'));
        chosen.classList.add('reel-active','reel-winner');
        centerOn(chosen,true);
        chosenBox.innerHTML=`<div class="chosen-category-card" style="background:${c.color}"><span class="chosen-category-emoji">${c.emoji}</span><strong>${c.name}</strong></div>`;
        btn.textContent='اختاروا النقاط';btn.disabled=false;
        btn.onclick=()=>{state.screen='difficulty';render();};
      }
    },95);
  };
};

// Points always appear in ascending order visually: 200 → 400 → 600.
difficulty = function(){
  const c=CATS[state.selectedCategory];
  gameLayout(`<div class="selected-cat">${c.emoji} ${c.name}</div><h2 class="center-title">كم نقطة تبون؟</h2><div class="difficulty-grid points-ascending"><button class="difficulty easy" data-diff="easy"><div class="points">200</div></button><button class="difficulty medium" data-diff="medium"><div class="points">400</div></button><button class="difficulty hard" data-diff="hard"><div class="points">600</div></button></div>`);
  document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>pickQuestion(b.dataset.diff));
};
