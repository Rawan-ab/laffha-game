// V15 setup screen: open directly on game setup and match the selected light premium reference.
home=function(){state.screen='setup';setup();};

setup=function(){
  if(!state.teams.length)resetTeams();
  shell(`<div class="card setup-card setup-reference">
    <div class="setup-heading setup-heading-reference">
      <span>جاهزين؟</span>
      <h1>جهزوا الفرق وابدؤوا</h1>
    </div>

    <div class="field setup-field-reference">
      <h3 class="section-title">عدد الفرق</h3>
      <div class="choice-row setup-choice-row">${[2,3,4,5,6].map(n=>`<button class="choice ${state.teamCount===n?'active':''}" data-teamcount="${n}">${n}</button>`).join('')}</div>
    </div>

    <div class="field setup-field-reference">
      <h3 class="section-title">أسماء الفرق</h3>
      <div class="team-inputs setup-team-inputs">${state.teams.map((t,i)=>`<label class="team-input"><span class="team-dot" style="background:${t.color}"></span><input value="${t.name}" data-team="${i}" /></label>`).join('')}</div>
    </div>

    <div class="field setup-field-reference rounds-field">
      <h3 class="section-title">عدد الجولات</h3>
      <div class="choice-row setup-choice-row rounds-row">${[5,7,10].map(n=>`<button class="choice ${state.rounds===n?'active':''}" data-rounds="${n}">${n} جولات</button>`).join('')}</div>
    </div>

    <div class="field setup-field-reference categories-field">
      <h3 class="section-title">الفئات</h3>
      <p class="field-note">كلها تدخل تلقائيًا في الاختيار.</p>
      <div class="categories readonly setup-categories">${Object.values(CATS).map(c=>`<div class="cat-chip"><span class="emoji">${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div>
    </div>

    <div class="choice-helper-note">➕ <b>إضافة خيارات:</b> تحوّل السؤال المفتوح إلى 4 خيارات، وتصبح قيمة السؤال 50 نقطة.</div>
    <button class="btn btn-primary btn-lg setup-start-reference" id="begin">ابدأ اللعبة</button>
  </div>`);

  document.querySelectorAll('[data-teamcount]').forEach(b=>b.onclick=()=>{state.teamCount=+b.dataset.teamcount;resetTeams();render();});
  document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{state.rounds=+b.dataset.rounds;render();});
  document.querySelectorAll('[data-team]').forEach(inp=>inp.oninput=()=>state.teams[+inp.dataset.team].name=inp.value||`الفريق ${+inp.dataset.team+1}`);
  begin.onclick=()=>{
    state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();
    state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,fifty:true,time:true,change:true}});
    if(typeof buildFairPointSchedules==='function')buildFairPointSchedules();
    state.screen='spin';render();
  };
};

// The site should open on setup, not on a separate landing page.
if(state.screen==='home'){
  state.screen='setup';
  render();
}
