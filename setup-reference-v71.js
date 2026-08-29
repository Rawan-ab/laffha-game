// V71 reference-matched setup: player names + balanced random team distribution + current lifeline rules.
home=function(){state.screen='setup';setup();};

function laffhaPlayerNames(){
  return String(state.playerNamesText||'')
    .split(/[\n,،]+/)
    .map(x=>x.trim())
    .filter(Boolean);
}
function laffhaShuffle(list){
  const a=[...list];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function laffhaDistributePlayers(){
  const names=laffhaShuffle(laffhaPlayerNames());
  state.teams.forEach(t=>t.members=[]);
  names.forEach((name,i)=>state.teams[i%state.teams.length].members.push(name));
  state.playerDistributionSource=String(state.playerNamesText||'').trim();
  state.playerDistributionTeamCount=state.teamCount;
  return names.length;
}
function laffhaDistributionFresh(){
  return state.playerDistributionSource===String(state.playerNamesText||'').trim() && state.playerDistributionTeamCount===state.teamCount;
}

setup=function(){
  if(!state.teams.length)resetTeams();
  state.playerNamesText=state.playerNamesText||'';
  state.teams.forEach(t=>{if(!Array.isArray(t.members))t.members=[];});
  const classByKey={tv:'cat-blue',movies:'cat-coral',songs:'cat-yellow',artists:'cat-purple',cartoons:'cat-violet',sports:'cat-green',general:'cat-lilac',logos:'cat-pink'};
  const playerCount=laffhaPlayerNames().length;

  shell(`<div class="setup-page-v16">
    <main class="card setup-card setup-reference">
      <div class="setup-corner-brand">لفّها</div>
      <div class="setup-intro-line">اختاروا التحدي، <b>فكروا بسرعة</b>، والعبوا للفوز!</div>

      <div class="setup-controls-top">
        <div class="field setup-field-reference team-count-field"><h3 class="section-title">عدد الفرق</h3><div class="choice-row setup-choice-row">${[2,3,4,5,6].map(n=>`<button class="choice ${state.teamCount===n?'active':''}" data-teamcount="${n}">${n}</button>`).join('')}</div></div>
        <div class="field setup-field-reference rounds-field"><h3 class="section-title">عدد الجولات</h3><div class="choice-row setup-choice-row rounds-row">${[5,7,10,15].map(n=>`<button class="choice ${state.rounds===n?'active':''}" data-rounds="${n}">${n}</button>`).join('')}</div></div>
        <div class="field setup-field-reference timer-field"><h3 class="section-title">مدة السؤال</h3><div class="timer-display"><span>⏱️</span><b>60 ثانية</b><span class="timer-chevron">⌄</span></div></div>
      </div>

      <div class="field setup-field-reference categories-field"><h3 class="section-title centered-title">الفئات المشاركة</h3><div class="categories readonly setup-categories">${Object.entries(CATS).filter(([k])=>k!=='logos').map(([k,c])=>`<div class="cat-chip ${classByKey[k]||'cat-lilac'}"><span class="emoji">${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div></div>

      <div class="player-builder">
        <div class="player-builder-head"><div><h3>أسماء اللاعبين</h3><p>اكتبوا كل اسم في سطر أو افصلوا الأسماء بفاصلة، وبنوزعهم بالتساوي عشوائيًا.</p></div><span class="player-count">${playerCount} لاعب</span></div>
        <div class="player-builder-row">
          <textarea id="playerNames" placeholder="مثال:&#10;روان&#10;سارة&#10;محمد&#10;عبدالله">${state.playerNamesText}</textarea>
          <button class="shuffle-players-btn" id="shufflePlayers">🎲 وزّع الأسماء عشوائيًا</button>
        </div>
      </div>

      <div class="field setup-field-reference teams-field"><h3 class="section-title centered-title">الفرق</h3><div class="team-roster-grid">${state.teams.map((t,i)=>`<div class="team-roster-card" style="--team-color:${t.color}"><label class="team-input"><span class="team-dot" style="background:${t.color}"></span><input value="${t.name}" data-team="${i}" /></label><div class="team-members">${t.members.length?t.members.map(m=>`<span>${m}</span>`).join(''):'<small>أسماء اللاعبين بتظهر هنا</small>'}</div></div>`).join('')}</div></div>

      <button class="btn btn-primary btn-lg setup-start-reference" id="begin">ابدأ اللعبة 🎉</button>
      <div class="setup-bottom-facts"><span>⏱️ 60 ثانية للسؤال</span><span>🎯 200 / 400 / 600 نقطة</span></div>
    </main>

    <aside class="setup-side-v16">
      <div class="setup-score-preview">
        <small>الدور الآن</small>
        <strong>${state.teams[0]?.name||'الفريق 1'}</strong>
        ${state.teams[0]?.members?.length?`<div class="preview-current-members">${state.teams[0].members.join(' • ')}</div>`:''}
        <span>الجولة 1 من ${state.rounds}</span>
        <div class="preview-score-list">${state.teams.map((t,i)=>`<div class="preview-team ${i===0?'current':''}"><div class="preview-team-info"><div><span class="team-dot" style="background:${t.color}"></span>${t.name}</div>${t.members.length?`<small>${t.members.join(' • ')}</small>`:''}</div><b>0</b></div>`).join('')}</div>
      </div>
      <div class="side-divider"></div>
      <h3>المساعدات</h3>
      <div style="font-size:12px;color:#8b8193;line-height:1.7;margin:-5px 0 10px">كل مساعدة متاحة <b>مرة واحدة لكل فريق</b> في اللعبة.</div>
      <div class="assist-side-item"><span class="assist-icon">🔄</span><div><b>غير السؤال</b><small>يبدّل السؤال بسؤال آخر من نفس الفئة والمستوى</small></div></div>
      <div class="assist-side-item assist-choice"><span class="assist-icon">🧩</span><div><b>خيارات</b><small>تحوّل السؤال إلى اختيارات وتخفض قيمته للنصف: 200→100، 400→200، 600→300</small></div></div>
      <div class="assist-side-item"><span class="assist-icon">💡</span><div><b>تلميح</b><small>يعطيكم معلومة تساعد على الوصول للإجابة</small></div></div>
      <div class="assist-side-item"><span class="assist-icon">⏱️</span><div><b>+15 ثانية</b><small>تضيف 15 ثانية لوقت السؤال الحالي</small></div></div>
    </aside>
  </div>`);

  const setupTopbar=document.querySelector('.topbar');
  if(setupTopbar) setupTopbar.remove();

  const namesBox=document.getElementById('playerNames');
  if(namesBox) namesBox.oninput=()=>{state.playerNamesText=namesBox.value;state.playerDistributionSource=null;};

  document.querySelectorAll('[data-teamcount]').forEach(b=>b.onclick=()=>{
    state.teamCount=+b.dataset.teamcount;
    resetTeams();
    state.teams.forEach(t=>t.members=[]);
    if(laffhaPlayerNames().length)laffhaDistributePlayers();
    render();
  });
  document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{state.rounds=+b.dataset.rounds;render()});
  document.querySelectorAll('[data-team]').forEach(inp=>inp.oninput=()=>state.teams[+inp.dataset.team].name=inp.value||`الفريق ${+inp.dataset.team+1}`);

  const shuffleBtn=document.getElementById('shufflePlayers');
  if(shuffleBtn)shuffleBtn.onclick=()=>{
    state.playerNamesText=namesBox?.value||state.playerNamesText||'';
    const count=laffhaDistributePlayers();
    render();
    setTimeout(()=>toast(count?`تم توزيع ${count} لاعب على ${state.teamCount} فرق`:'اكتبوا أسماء اللاعبين أول'),30);
  };

  begin.onclick=()=>{
    state.playerNamesText=namesBox?.value||state.playerNamesText||'';
    if(laffhaPlayerNames().length&&!laffhaDistributionFresh())laffhaDistributePlayers();
    state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();
    state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,choices:true,time:true,change:true}});
    if(typeof buildFairPointSchedules==='function')buildFairPointSchedules();
    state.screen='spin';render();
  };
};

// Show team members below each team name during the game.
scoreboard=function(){
  return `<aside class="card score-card"><div class="turn-label">الدور الآن</div><div class="turn-name side-name">${state.teams[state.currentTeam].name}</div>${state.teams[state.currentTeam].members?.length?`<div class="active-team-members">${state.teams[state.currentTeam].members.join(' • ')}</div>`:''}<div class="round-badge">الجولة ${state.currentRound} من ${state.rounds}</div><div class="score-list">${state.teams.map((t,i)=>`<div class="score-team ${i===state.currentTeam?'current':''}"><div class="team-meta"><span class="team-dot" style="background:${t.color}"></span><div class="score-team-copy"><span>${t.name}</span>${t.members?.length?`<small>${t.members.join(' • ')}</small>`:''}</div></div><span class="score-num">${t.score}</span></div>`).join('')}</div></aside>`;
};

if(state.screen==='home'){state.screen='setup';render();}