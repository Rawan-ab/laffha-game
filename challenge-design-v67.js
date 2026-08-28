// V67 — restore the approved colorful challenge-selection screen without changing multiplayer transport.
(function(){
  if(typeof window==='undefined')return;
  function install(){
    if(typeof window.spin!=='function'||typeof window.gameLayout!=='function'||typeof window.state==='undefined'||typeof window.CATS==='undefined')return false;
    window.spin=function(){
      const cats=state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
      const values=[{points:200,diff:'easy',label:'سهل'},{points:400,diff:'medium',label:'متوسط'},{points:600,diff:'hard',label:'صعب'}];
      gameLayout(`
        <div class="spin-copy approved-challenge-head">
          <h2>اختاروا التحدي</h2>
          <p class="reel-help">اضغطوا مرة واحدة لتحديد الفئة والنقاط</p>
        </div>
        <div class="category-draw-grid approved-challenge-grid" id="categoryDrawGrid">
          ${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}
        </div>
        <div id="drawResult" class="picked-category approved-picked"></div>
        <button class="spin-action approved-start" id="spinBtn">اختاروا التحدي</button>
        <div class="rule-strip approved-rules"><span>✨ نفس فرص النقاط لكل فريق</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);
      const btn=document.getElementById('spinBtn'),result=document.getElementById('drawResult'),cards=[...document.querySelectorAll('.draw-cat-card')];
      let running=false;
      btn.onclick=()=>{
        if(running)return;running=true;btn.disabled=true;result.innerHTML='';
        cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));
        const finalIndex=Math.floor(Math.random()*cards.length),pointChoice=values[Math.floor(Math.random()*values.length)];
        let step=0,steps=16+Math.floor(Math.random()*5);
        const hop=()=>{
          cards.forEach(c=>c.classList.remove('draw-active'));
          const index=step<steps?step%cards.length:finalIndex;cards[index].classList.add('draw-active');
          if(step<steps){const delay=38+step*5;step++;setTimeout(hop,delay);return;}
          const winner=cards[finalIndex];cards.forEach(c=>c.classList.remove('draw-active'));winner.classList.add('draw-winner');
          state.selectedCategory=winner.dataset.key;state.drawnDifficulty=pointChoice.diff;state.drawnPoints=pointChoice.points;
          const c=CATS[state.selectedCategory];
          result.innerHTML=`<div class="picked-pill approved-picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>التحدي المختار</small><strong>${c.name} · ${pointChoice.points} نقطة · ${pointChoice.label}</strong></div></div>`;
          btn.textContent='ابدأ السؤال';btn.classList.add('points-ready');btn.disabled=false;running=false;
          btn.onclick=()=>pickQuestion(pointChoice.diff);
        };hop();
      };
    };
    return true;
  }
  if(!install())window.addEventListener('load',install,{once:true});
})();