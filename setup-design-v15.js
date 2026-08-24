// V26 setup: corner brand, compact intro, responsive setup layout.
home=function(){state.screen='setup';setup();};
setup=function(){
  if(!state.teams.length)resetTeams();
  const classByKey={tv:'cat-blue',movies:'cat-coral',songs:'cat-yellow',artists:'cat-purple',cartoons:'cat-violet',sports:'cat-green',general:'cat-lilac',logos:'cat-pink'};
  shell(`<div class="setup-page-v16">
    <main class="card setup-card setup-reference">
      <div class="setup-corner-brand">لفّها</div>
      <div class="setup-intro-line">اختاروا التحدي، <b>فكروا بسرعة</b>، والعبوا للفوز!</div>

      <div class="setup-controls-top">
        <div class="field setup-field-reference team-count-field"><h3 class="section-title">عدد الفرق</h3><div class="choice-row setup-choice-row">${[2,3,4,5,6].map(n=>`<button class="choice ${state.teamCount===n?'active':''}" data-teamcount="${n}">${n}</button>`).join('')}</div></div>
        <div class="field setup-field-reference rounds-field"><h3 class="section-title">عدد الجولات</h3><div class="choice-row setup-choice-row rounds-row">${[5,7,10,15].map(n=>`<button class="choice ${state.rounds===n?'active':''}" data-rounds="${n}">${n}</button>`).join('')}</div></div>
        <div class="field setup-field-reference timer-field"><h3 class="section-title">مدة السؤال</h3><div class="timer-display"><span>⏱️</span><b>60 ثانية</b><span class="timer-chevron">⌄</span></div></div>
      </div>

      <div class="field setup-field-reference categories-field"><h3 class="section-title centered-title">الفئات المشاركة</h3><div class="categories readonly setup-categories">${Object.entries(CATS).map(([k,c])=>`<div class="cat-chip ${classByKey[k]||'cat-lilac'}"><span class="emoji">${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div></div>

      <div class="field setup-field-reference teams-field"><h3 class="section-title centered-title">أسماء الفرق</h3><div class="team-inputs setup-team-inputs">${state.teams.map((t,i)=>`<label class="team-input"><span class="team-dot" style="background:${t.color}"></span><input value="${t.name}" data-team="${i}" /></label>`).join('')}</div></div>

      <button class="btn btn-primary btn-lg setup-start-reference" id="begin">ابدأ اللعبة 🎉</button>
      <div class="setup-bottom-facts"><span>⏱️ 60 ثانية للسؤال</span><span>🎯 200 / 400 / 600 نقطة</span></div>
    </main>

    <aside class="setup-side-v16">
      <div class="setup-score-preview">
        <small>الدور الآن</small>
        <strong>${state.teams[0]?.name||'الفريق 1'}</strong>
        <span>الجولة 1 من ${state.rounds}</span>
        <div class="preview-score-list">${state.teams.map((t,i)=>`<div class="preview-team ${i===0?'current':''}"><div><span class="team-dot" style="background:${t.color}"></span>${t.name}</div><b>0</b></div>`).join('')}</div>
      </div>
      <div class="side-divider"></div>
      <h3>المساعدات</h3>
      <div class="assist-side-item"><span class="assist-icon">🔄</span><div><b>غير السؤال</b><small>يبدّل السؤال بسؤال آخر من نفس الفئة والمستوى</small></div></div>
      <div class="assist-side-item"><span class="assist-icon">✂️</span><div><b>50/50</b><small>يحذف خيارين خطأ في أسئلة الاختيارات</small></div></div>
      <div class="assist-side-item"><span class="assist-icon">💡</span><div><b>تلميح</b><small>يعطيكم معلومة تساعد على الوصول للإجابة</small></div></div>
      <div class="assist-side-item assist-choice"><span class="assist-icon">➕</span><div><b>إضافة خيارات</b><small>تحوّل السؤال المفتوح إلى 4 خيارات، وتصبح قيمته 50 نقطة</small></div></div>
    </aside>
  </div>`);

  const setupTopbar=document.querySelector('.topbar');
  if(setupTopbar) setupTopbar.remove();

  document.querySelectorAll('[data-teamcount]').forEach(b=>b.onclick=()=>{state.teamCount=+b.dataset.teamcount;resetTeams();render();});
  document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{state.rounds=+b.dataset.rounds;render();});
  document.querySelectorAll('[data-team]').forEach(inp=>inp.oninput=()=>state.teams[+inp.dataset.team].name=inp.value||`الفريق ${+inp.dataset.team+1}`);
  begin.onclick=()=>{state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,fifty:true,time:true,change:true}});if(typeof buildFairPointSchedules==='function')buildFairPointSchedules();state.screen='spin';render();};
};
if(state.screen==='home'){state.screen='setup';render();}