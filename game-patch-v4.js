// V4: centered slot-style category draw. The gold frame, not an ambiguous arrow, defines the winner.
spin = function(){
  const cats = state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  gameLayout(`
    <div class="spin-copy"><div class="turn-label">الفئة العشوائية</div><h2>اسحبوا لتحديد الفئة</h2><p class="reel-help">اسحبوا الزر ليبدأ سحب الفئة</p></div>
    <div class="reel-shell slot-reel">
      <div class="reel-center-frame" aria-hidden="true"></div>
      <div class="reel-pointer" aria-hidden="true"></div>
      <div class="reel-window" id="reelWindow">
        <div class="reel-track" id="reelTrack">
          ${[...cats,...cats,...cats].map(([k,c])=>`<div class="reel-item" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
        </div>
      </div>
    </div>
    <div id="pickedCategory" class="picked-category"></div>
    <button class="spin-action" id="spinBtn">اسحب الآن</button>
    <div class="reel-motion-hint" aria-hidden="true"><span>‹‹‹</span><span>›››</span></div>
    <div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>
  `);

  const btn=document.getElementById('spinBtn'),track=document.getElementById('reelTrack'),win=document.getElementById('reelWindow'),picked=document.getElementById('pickedCategory');
  const centerInitial=()=>{
    const items=[...track.querySelectorAll('.reel-item')];
    const target=items[cats.length+Math.floor(cats.length/2)];
    const translate=win.clientWidth/2-(target.offsetLeft+target.offsetWidth/2);
    track.style.transition='none'; track.style.transform=`translateX(${translate}px)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>track.style.transition='transform 2.2s cubic-bezier(.12,.72,.16,1)'));
  };
  centerInitial();

  btn.onclick=()=>{
    btn.disabled=true; picked.innerHTML='';
    const idx=Math.floor(Math.random()*cats.length), targetIndex=cats.length+idx;
    const items=[...track.querySelectorAll('.reel-item')],targetItem=items[targetIndex];
    items.forEach(el=>el.classList.remove('winner-item'));
    const translate=win.clientWidth/2-(targetItem.offsetLeft+targetItem.offsetWidth/2);
    track.style.transform=`translateX(${translate}px)`;
    setTimeout(()=>{
      targetItem.classList.add('winner-item');
      state.selectedCategory=targetItem.dataset.key;
      const c=CATS[state.selectedCategory];
      picked.innerHTML=`<div class="picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>الفئة المختارة</small><strong>${c.name}</strong></div></div>`;
      btn.textContent='اختاروا النقاط'; btn.disabled=false; btn.classList.add('points-ready');
      btn.onclick=()=>{state.screen='difficulty';render();};
    },2250);
  };
};

// If a team asks for answer choices on an open question, the question becomes worth exactly 50 points.
document.addEventListener('click',(event)=>{
  const button=event.target.closest('#giveChoices'); if(!button)return;
  setTimeout(()=>{if(!state.usedChoiceAssist)return;state.currentAwardPoints=50;const pointsEl=document.getElementById('awardPoints');if(pointsEl)pointsEl.textContent='50';const area=document.getElementById('openAnswerArea');if(area){const notices=[...area.querySelectorAll('div')];const notice=notices.find(el=>el.textContent.includes('قيمة السؤال الآن'));if(notice)notice.textContent='استخدمتوا الخيارات — قيمة السؤال الآن 50 نقطة';}},0);
});