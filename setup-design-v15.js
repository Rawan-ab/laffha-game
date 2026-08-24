// V16 setup: direct setup screen with right-side helpers panel.
home=function(){state.screen='setup';setup();};

setup=function(){
  if(!state.teams.length)resetTeams();
  shell(`<div class="setup-page-v16">
    <main class="card setup-card setup-reference">
      <div class="setup-heading setup-heading-reference"><span>جاهزين؟</span><h1>جهزوا الفرق وابدؤوا</h1></div>
      <div class="field setup-field-reference"><h3 class="section-title">عدد الفرق</h3><div class="choice-row setup-choice-row">${[2,3,4,5,6].map(n=>`<button class="choice ${state.teamCount===n?'active':''}" data-teamcount="${n}">${n}</button>`).join('')}</div></div>
      <div class="field setup-field-reference"><h3 class="section-title">أسماء الفرق</h3><div class="team-inputs setup-team-inputs">${state.teams.map((t,i)=>`<label class="team-input"><span class="team-dot" style="background:${t.color}"></span><input value="${t.name}" data-team="${i}" /></label>`).join('')}</div></div>
      <div class="field setup-field-reference rounds-field"><h3 class="section-title">عدد الجولات</h3><div class="choice-row setup-choice-row rounds-row">${[5,7,10].map(n=>`<button class="choice ${state.rounds===n?'active':''}" data-rounds="${n}">${n} جولات</button>`).join('')}</div></div>
      <div class="field setup-field-reference categories-field"><h3 class="section-title">الفئات</h3><p class="field-note">كلها تدخل تلقائيًا في الاختيار.</p><div class="categories readonly setup-categories">${Object.values(CATS).map(c=>`<div class="cat-chip"><span class="emoji">${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div></div>
      <button class="btn btn-primary btn-lg setup-start-reference" id="begin">ابدأ اللعبة 🎉</button>
      <div class="setup-bottom-facts"><span>⏱️ 60 ثانية للسؤال</span><span>🎯 200 / 400 / 600 نقطة</span></div>
    </main>
    <aside class="setup-side-v16">
      <h3>المساعدات</h3>
      <div class="assist-side-item"><span class="assist-icon">🔄</span><div><b>غير السؤال</b><small>يبدّل السؤال بسؤال آخر من نفس الفئة والمستوى</small></div><em>2 متبقية</em></div>
      <div class="assist-side-item"><span class="assist-icon">✂️</span><div><b>50/50</b><small>يحذف خيارين خطأ في أسئلة الاختيارات</small></div><em>2 متبقية</em></div>
      <div class="assist-side-item"><span class="assist-icon">💡</span><div><b>تلميح</b><small>يعطيكم معلومة تساعد على الوصول للإجابة</small></div><em>2 متبقية</em></div>
      <div class="assist-side-item assist-choice"><span class="assist-icon">➕</span><div><b>إضافة خيارات</b><small>تحوّل السؤال المفتوح إلى 4 خيارات، وتصبح قيمته 50 نقطة</small></div><em>2 متبقية</em></div>
      <div class="side-rules">📕 <b>قواعد اللعبة</b></div>
    </aside>
  </div>`);
  document.querySelectorAll('[data-teamcount]').forEach(b=>b.onclick=()=>{state.teamCount=+b.dataset.teamcount;resetTeams();render();});
  document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{state.rounds=+b.dataset.rounds;render();});
  document.querySelectorAll('[data-team]').forEach(inp=>inp.oninput=()=>state.teams[+inp.dataset.team].name=inp.value||`الفريق ${+inp.dataset.team+1}`);
  begin.onclick=()=>{state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,fifty:true,time:true,change:true}});if(typeof buildFairPointSchedules==='function')buildFairPointSchedules();state.screen='spin';render();};
};
if(state.screen==='home'){state.screen='setup';render();}
