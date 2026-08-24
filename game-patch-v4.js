// V4: centered slot-style category draw with RTL-safe positioning.
spin = function(){
  const cats = state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  gameLayout(`
    <div class="spin-copy"><div class="turn-label">الفئة العشوائية</div><h2>اسحبوا لتحديد الفئة</h2><p class="reel-help">اسحبوا الزر ليبدأ سحب الفئة</p></div>
    <div class="reel-shell slot-reel">
      <div class="reel-center-frame" aria-hidden="true"></div><div class="reel-pointer" aria-hidden="true"></div>
      <div class="reel-window" id="reelWindow"><div class="reel-track" id="reelTrack">${[...cats,...cats,...cats].map(([k,c])=>`<div class="reel-item" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div></div>
    </div>
    <div id="pickedCategory" class="picked-category"></div>
    <button class="spin-action" id="spinBtn">اسحب الآن</button>
    <div class="reel-motion-hint" aria-hidden="true"><span>‹‹‹</span><span>›››</span></div>
    <div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);

  const btn=document.getElementById('spinBtn'),track=document.getElementById('reelTrack'),win=document.getElementById('reelWindow'),picked=document.getElementById('pickedCategory');
  const items=[...track.querySelectorAll('.reel-item')];
  const itemStep=()=>items[0].getBoundingClientRect().width+10;
  const centerIndex=cats.length+Math.floor(cats.length/2);
  const positionFor=(index)=>win.clientWidth/2-(index*itemStep()+items[index].getBoundingClientRect().width/2);
  track.style.transition='none';
  track.style.transform=`translate3d(${positionFor(centerIndex)}px,0,0)`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>track.style.transition='transform 2.2s cubic-bezier(.12,.72,.16,1)'));

  btn.onclick=()=>{
    btn.disabled=true;picked.innerHTML='';items.forEach(el=>el.classList.remove('winner-item'));
    const idx=Math.floor(Math.random()*cats.length),targetIndex=cats.length+idx,targetItem=items[targetIndex];
    track.style.transform=`translate3d(${positionFor(targetIndex)}px,0,0)`;
    setTimeout(()=>{
      targetItem.classList.add('winner-item');state.selectedCategory=targetItem.dataset.key;const c=CATS[state.selectedCategory];
      picked.innerHTML=`<div class="picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>الفئة المختارة</small><strong>${c.name}</strong></div></div>`;
      btn.textContent='اختاروا النقاط';btn.disabled=false;btn.classList.add('points-ready');btn.onclick=()=>{state.screen='difficulty';render();};
    },2250);
  };
};

document.addEventListener('click',(event)=>{const button=event.target.closest('#giveChoices');if(!button)return;setTimeout(()=>{if(!state.usedChoiceAssist)return;state.currentAwardPoints=50;const pointsEl=document.getElementById('awardPoints');if(pointsEl)pointsEl.textContent='50';const area=document.getElementById('openAnswerArea');if(area){const notices=[...area.querySelectorAll('div')],notice=notices.find(el=>el.textContent.includes('قيمة السؤال الآن'));if(notice)notice.textContent='استخدمتوا الخيارات — قيمة السؤال الآن 50 نقطة';}},0);});