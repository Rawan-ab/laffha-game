// Fair points V14 — balances 200/400/600 per team while keeping draw order unpredictable.
(function(){
  const LEVELS=[
    {points:200,diff:'easy',label:'سهل'},
    {points:400,diff:'medium',label:'متوسط'},
    {points:600,diff:'hard',label:'صعب'}
  ];

  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  function buildTeamDeck(rounds,teamIndex){
    const base=Math.floor(rounds/3), remainder=rounds%3;
    const counts=[base,base,base];
    // Rotate extras by team so the same level is not favored for everyone.
    for(let r=0;r<remainder;r++) counts[(teamIndex+r)%3]++;
    const deck=[];
    counts.forEach((count,idx)=>{for(let i=0;i<count;i++) deck.push(LEVELS[idx]);});
    return shuffle(deck);
  }

  function prepareFairDecks(){
    state.fairPointDecks=state.teams.map((_,i)=>buildTeamDeck(state.rounds,i));
    state.fairPointPositions=state.teams.map(()=>0);
  }

  function nextFairLevel(){
    if(!state.fairPointDecks||!state.fairPointDecks.length) prepareFairDecks();
    const team=state.currentTeam;
    let pos=state.fairPointPositions[team]||0;
    const deck=state.fairPointDecks[team]||[];
    if(pos>=deck.length){state.fairPointDecks[team]=buildTeamDeck(state.rounds,team);state.fairPointPositions[team]=0;pos=0;}
    const value=state.fairPointDecks[team][pos]||LEVELS[Math.floor(Math.random()*LEVELS.length)];
    state.fairPointPositions[team]=pos+1;
    return value;
  }

  // Rebuild fair decks whenever a new match starts from setup.
  const oldSetup=setup;
  setup=function(){
    oldSetup();
    const begin=document.getElementById('begin');
    if(begin){
      const original=begin.onclick;
      begin.onclick=()=>{
        prepareFairDecks();
        original&&original();
      };
    }
  };

  // Keep category draw visual, but points come from the current team's fair hidden deck.
  spin=function(){
    const cats=state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
    gameLayout(`<div class="spin-copy"><h2>اختاروا التحدي</h2><p class="reel-help">اضغطوا مرة واحدة لتحديد الفئة والنقاط</p></div><div class="category-draw-grid">${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div><div id="drawResult" class="picked-category"></div><button class="spin-action" id="spinBtn">ابدأ الاختيار</button><div class="rule-strip"><span>⚖️ توزيع النقاط عادل بين الفرق</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);
    const btn=document.getElementById('spinBtn'),result=document.getElementById('drawResult'),cards=[...document.querySelectorAll('.draw-cat-card')];
    let running=false;
    btn.onclick=()=>{
      if(running)return;
      running=true;btn.disabled=true;result.innerHTML='';cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));
      const finalIndex=Math.floor(Math.random()*cards.length),pointChoice=nextFairLevel();
      let step=0,steps=18+Math.floor(Math.random()*7);
      const hop=()=>{
        cards.forEach(c=>c.classList.remove('draw-active'));
        const index=step<steps?step%cards.length:finalIndex;cards[index].classList.add('draw-active');
        if(step<steps){const delay=55+step*8;step++;setTimeout(hop,delay);return;}
        const winner=cards[finalIndex];cards.forEach(c=>c.classList.remove('draw-active'));winner.classList.add('draw-winner');
        state.selectedCategory=winner.dataset.key;state.drawnDifficulty=pointChoice.diff;state.drawnPoints=pointChoice.points;
        const c=CATS[state.selectedCategory];
        result.innerHTML=`<div class="picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>التحدي المختار</small><strong>${c.name} · ${pointChoice.points} نقطة · ${pointChoice.label}</strong></div></div>`;
        btn.textContent='ابدأ السؤال';btn.classList.add('points-ready');btn.disabled=false;running=false;btn.onclick=()=>pickQuestion(pointChoice.diff);
      };
      hop();
    };
  };
})();