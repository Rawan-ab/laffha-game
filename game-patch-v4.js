// V4: after the roulette stops, show the selected category briefly, then automatically open points selection.
spin = function(){
  const cats = state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  gameLayout(`
    <div class="spin-copy"><div class="turn-label">الفئة العشوائية</div><h2>اسحبوا لتحديد الفئة</h2></div>
    <div class="reel-shell">
      <div class="reel-pointer"></div>
      <div class="reel-window" id="reelWindow">
        <div class="reel-track" id="reelTrack">
          ${[...cats,...cats,...cats].map(([k,c])=>`<div class="reel-item" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
        </div>
      </div>
    </div>
    <div id="pickedCategory" style="min-height:58px;margin-top:18px;font-weight:800;font-size:28px;display:grid;place-items:center"></div>
    <button class="spin-action" id="spinBtn">اسحب الآن</button>
    <div class="rule-strip"><span>🛡️ السؤال ما ينتقل</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>
  `);

  const btn = document.getElementById('spinBtn');
  const track = document.getElementById('reelTrack');
  const win = document.getElementById('reelWindow');
  const picked = document.getElementById('pickedCategory');

  btn.onclick=()=>{
    btn.disabled=true;
    const idx=Math.floor(Math.random()*cats.length);
    const targetIndex=cats.length+idx;
    const items=[...track.querySelectorAll('.reel-item')];
    const targetItem=items[targetIndex];
    const winCenter=win.clientWidth/2;
    const itemCenter=targetItem.offsetLeft+targetItem.offsetWidth/2;
    const translate=winCenter-itemCenter;
    track.style.transform=`translateX(${translate}px)`;

    setTimeout(()=>{
      state.selectedCategory=targetItem.dataset.key;
      const c=CATS[state.selectedCategory];
      picked.innerHTML=`<div style="padding:10px 22px;border-radius:18px;background:${c.color};display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 20px rgba(0,0,0,.06)"><span>${c.emoji}</span><strong>${c.name}</strong></div>`;
      btn.style.visibility='hidden';
      setTimeout(()=>{
        state.screen='difficulty';
        render();
      },1100);
    },2200);
  };
};

// If a team asks for answer choices on an open question, the question becomes worth exactly 50 points.
document.addEventListener('click', (event) => {
  const button = event.target.closest('#giveChoices');
  if (!button) return;

  setTimeout(() => {
    if (!state.usedChoiceAssist) return;
    state.currentAwardPoints = 50;

    const pointsEl = document.getElementById('awardPoints');
    if (pointsEl) pointsEl.textContent = '50';

    const area = document.getElementById('openAnswerArea');
    if (area) {
      const notices = [...area.querySelectorAll('div')];
      const notice = notices.find(el => el.textContent.includes('قيمة السؤال الآن'));
      if (notice) notice.textContent = 'استخدمتوا الخيارات — قيمة السؤال الآن 50 نقطة';
    }
  }, 0);
});
