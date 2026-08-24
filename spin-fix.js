// Ensure the category stored in game state is exactly the category shown under the reel pointer.
spin = function(){
  const cats=state.categories.map(k=>[k,CATS[k]]);
  gameLayout(`<div class="spin-copy"><div class="turn-label">اختاروا الفئة</div><h2>اسحبوا لتحديد الفئة العشوائية</h2></div><div class="reel-shell"><div class="reel-pointer"></div><div class="reel-window" id="reelWindow"><div class="reel-track" id="reelTrack">${[...cats,...cats,...cats].map(([k,c])=>`<div class="reel-item" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div></div></div><button class="spin-action" id="spinBtn">اسحب الآن</button><div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);

  const btn=document.getElementById('spinBtn');
  const track=document.getElementById('reelTrack');
  const win=document.getElementById('reelWindow');

  btn.onclick=()=>{
    btn.disabled=true;
    const idx=Math.floor(Math.random()*state.categories.length);
    const middleIndex=state.categories.length+idx;
    const items=[...track.querySelectorAll('.reel-item')];
    const targetItem=items[middleIndex];

    // Center the exact chosen DOM item under the fixed pointer.
    const winCenter=win.clientWidth/2;
    const itemCenter=targetItem.offsetLeft+(targetItem.offsetWidth/2);
    const translate=winCenter-itemCenter;
    track.style.transform=`translateX(${translate}px)`;

    setTimeout(()=>{
      // Read the category from the exact element that was centered visually.
      state.selectedCategory=targetItem.dataset.key;
      state.screen='difficulty';
      render();
    },2200);
  };
};