// Final polish V11 — loaded last to override earlier patches safely.

const HISTORY_KEY='laffha-question-history-v1';
function loadQuestionHistory(){
  try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}')||{};}catch{return {};}
}
function saveQuestionHistory(history){
  try{localStorage.setItem(HISTORY_KEY,JSON.stringify(history));}catch{}
}
function rememberQuestion(q){
  const history=loadQuestionHistory();
  const key=q.category;
  const list=Array.isArray(history[key])?history[key]:[];
  const next=[...list.filter(id=>id!==q.questionID),q.questionID].slice(-100);
  history[key]=next;saveQuestionHistory(history);
}

shell=function(content){
  app.innerHTML=`<div class="shell"><div class="topbar"><div class="brand">لفّ<span>ها</span></div></div>${content}</div>`;
};

home=function(){
  shell(`<section class="hero"><div class="hero-inner"><h1>لفّها وخلو المعرفة تحسمها</h1><p class="hero-copy">كل جولة تعطيكم تحدّي مختلف، ولكم 60 ثانية للإجابة. اجمعوا أكبر عدد من النقاط وخلو الفوز للأذكى والأسرع.</p><div class="how-row"><span>🎯 200 / 400 / 600 نقطة</span><span>⏱️ 60 ثانية</span><span>🏆 الأعلى نقاط يفوز</span></div><button class="btn btn-primary btn-lg" id="start">ابدأ اللعبة</button></div></section>`);
  start.onclick=()=>{state.screen='setup';render();};
};

setup=function(){
  if(!state.teams.length)resetTeams();
  shell(`<div class="card setup-card setup-compact">
    <div class="setup-grid-top">
      <div class="field"><h3 class="section-title">عدد الفرق</h3><div class="choice-row">${[2,3,4,5,6].map(n=>`<button class="choice ${state.teamCount===n?'active':''}" data-teamcount="${n}">${n}</button>`).join('')}</div></div>
      <div class="field"><h3 class="section-title">عدد الجولات</h3><div class="choice-row">${[5,7,10].map(n=>`<button class="choice ${state.rounds===n?'active':''}" data-rounds="${n}">${n}</button>`).join('')}</div></div>
      <div class="field setup-time"><h3 class="section-title">مدة السؤال</h3><div class="static-setting">⏱️ 60 ثانية</div></div>
    </div>
    <div class="field"><h3 class="section-title">الفئات</h3><div class="categories readonly">${Object.values(CATS).map(c=>`<div class="cat-chip"><span class="emoji">${c.emoji}</span>${c.name}</div>`).join('')}</div></div>
    <div class="field"><h3 class="section-title">أسماء الفرق</h3><div class="team-inputs">${state.teams.map((t,i)=>`<label class="team-input"><span class="team-dot" style="background:${t.color}"></span><input value="${t.name}" data-team="${i}" /></label>`).join('')}</div></div>
    <div class="assist-explainer"><div><b>💡 تلميح</b><span>يكشف لكم معلومة تساعدكم</span></div><div><b>✂️ 50/50</b><span>يحذف خيارين خطأ في أسئلة الاختيارات</span></div><div><b>➕ إضافة خيارات</b><span>تحوّل السؤال المفتوح إلى 4 خيارات، وقيمته تصبح 50 نقطة</span></div><div><b>🔄 غير السؤال</b><span>يبدّل السؤال بنفس الفئة والمستوى</span></div></div>
    <button class="btn btn-primary btn-lg setup-start" id="begin">ابدأ اللعبة</button>
  </div>`);
  document.querySelectorAll('[data-teamcount]').forEach(b=>b.onclick=()=>{state.teamCount=+b.dataset.teamcount;resetTeams();render();});
  document.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{state.rounds=+b.dataset.rounds;render();});
  document.querySelectorAll('[data-team]').forEach(inp=>inp.oninput=()=>state.teams[+inp.dataset.team].name=inp.value||`الفريق ${+inp.dataset.team+1}`);
  begin.onclick=()=>{state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,fifty:true,time:true,change:true}});state.screen='spin';render();};
};

// Keep the category/points draw mechanic, but remove "random draw" wording from the interface.
spin=function(){
  const cats=state.categories.map(k=>[k,CATS[k]]).filter(([,c])=>c);
  const values=[{points:200,diff:'easy',label:'سهل'},{points:400,diff:'medium',label:'متوسط'},{points:600,diff:'hard',label:'صعب'}];
  gameLayout(`<div class="spin-copy"><h2>اختاروا التحدي</h2><p class="reel-help">اضغطوا مرة واحدة لتحديد الفئة والنقاط</p></div><div class="category-draw-grid">${cats.map(([k,c])=>`<div class="draw-cat-card" data-key="${k}" style="background:${c.color}"><span>${c.emoji}</span><strong>${c.name}</strong></div>`).join('')}</div><div id="drawResult" class="picked-category"></div><button class="spin-action" id="spinBtn">ابدأ الاختيار</button><div class="rule-strip"><span>🎯 200 / 400 / 600</span><span>❌ الخطأ ينهي السؤال</span><span>⏱️ 60 ثانية</span></div>`);
  const btn=document.getElementById('spinBtn'),result=document.getElementById('drawResult'),cards=[...document.querySelectorAll('.draw-cat-card')];let running=false;
  btn.onclick=()=>{if(running)return;running=true;btn.disabled=true;result.innerHTML='';cards.forEach(c=>c.classList.remove('draw-active','draw-winner'));const finalIndex=Math.floor(Math.random()*cards.length),pointChoice=values[Math.floor(Math.random()*values.length)];let step=0,steps=18+Math.floor(Math.random()*7);const hop=()=>{cards.forEach(c=>c.classList.remove('draw-active'));const index=step<steps?step%cards.length:finalIndex;cards[index].classList.add('draw-active');if(step<steps){const delay=55+step*8;step++;setTimeout(hop,delay);return;}const winner=cards[finalIndex];cards.forEach(c=>c.classList.remove('draw-active'));winner.classList.add('draw-winner');state.selectedCategory=winner.dataset.key;state.drawnDifficulty=pointChoice.diff;state.drawnPoints=pointChoice.points;const c=CATS[state.selectedCategory];result.innerHTML=`<div class="picked-pill" style="--picked:${c.color}"><span>${c.emoji}</span><div><small>التحدي المختار</small><strong>${c.name} · ${pointChoice.points} نقطة · ${pointChoice.label}</strong></div></div>`;btn.textContent='ابدأ السؤال';btn.classList.add('points-ready');btn.disabled=false;running=false;btn.onclick=()=>pickQuestion(pointChoice.diff);};hop();};
};

// Avoid repeats across separate games by remembering the last 100 questions used in each category.
pickQuestion=function(diff,excludeCurrent=false){
  const history=loadQuestionHistory();
  const recent=new Set(history[state.selectedCategory]||[]);
  let base=QUESTIONS.filter(q=>q.category===state.selectedCategory&&q.difficulty===diff&&(!excludeCurrent||q.questionID!==state.currentQuestion?.questionID));
  let pool=base.filter(q=>!state.usedQuestions.has(q.questionID)&&!recent.has(q.questionID));
  if(!pool.length)pool=base.filter(q=>!state.usedQuestions.has(q.questionID));
  if(!pool.length)pool=base;
  if(!pool.length){toast('ما فيه سؤال متاح بهذا المستوى');return;}
  state.currentQuestion=pool[Math.floor(Math.random()*pool.length)];
  state.usedQuestions.add(state.currentQuestion.questionID);
  rememberQuestion(state.currentQuestion);
  state.currentAwardPoints=state.currentQuestion.points;
  state.usedChoiceAssist=false;
  state.deadline=Date.now()+60000;
  state.screen='question';render();
};

function buildChoiceAssist(q){
  const own=(q.wrongAnswers||[]).filter(x=>x&&x!==q.correctAnswer);
  const candidates=QUESTIONS.filter(x=>x.questionID!==q.questionID&&x.category===q.category&&x.correctAnswer&&x.correctAnswer!==q.correctAnswer).map(x=>x.correctAnswer).filter((x,i,a)=>a.indexOf(x)===i&&!own.includes(x));
  return [...own,...candidates.sort(()=>Math.random()-.5)].slice(0,3);
}
function finalReveal(q){return `<div class="reveal-answer-wrap"><button class="btn btn-primary" id="revealAnswer">إظهار الجواب</button><div id="revealedAnswer" style="display:none"><div class="answer-label">الجواب الصحيح</div><div class="revealed-text">${q.correctAnswer}</div><div class="direct-actions"><button class="btn correct-btn" id="correct">✓  صح</button><button class="btn wrong-btn" id="wrong">✕ خطاء </button></div></div></div>`;}
function finalLogo(q){if(q.mediaURL)return `<div class="logo-question"><div class="logo-media"><img src="${q.mediaURL}" alt="" onerror="this.parentElement.innerHTML='<div class=&quot;logo-fallback&quot;>${q.logoText||'؟'}</div>'"></div></div>`;return `<div class="logo-question"><div class="logo-fallback">${q.logoText||'؟'}</div>${q.logoSub?`<div class="logo-sub">${q.logoSub}</div>`:''}</div>`;}

question=function(){
  const q=state.currentQuestion,c=CATS[q.category],team=state.teams[state.currentTeam];
  const isMCQ=q.questionType==='mcq',isLogo=q.questionType==='logo',isComplete=q.questionType==='complete',isOrdering=q.questionType==='ordering';
  const canAddChoices=!isMCQ&&!isLogo&&!isComplete&&!isOrdering;
  const answers=isMCQ?shuffledAnswers(q):[];
  let body='';
  if(isOrdering)body=`<div class="ordering-instruction">رتّبوا من <strong>${q.orderLabel||'الأكثر إلى الأقل'}</strong></div><div class="ordering-list">${q.items.map((x,i)=>`<div><span>${i+1}</span>${x}</div>`).join('')}</div>${finalReveal(q)}`;
  else if(isLogo)body=`${finalLogo(q)}${finalReveal(q)}`;
  else if(isComplete)body=`${q.singer?`<div class="singer-name">🎤 ${q.singer}</div>`:''}<div class="complete-note">كملوا الفراغات من نفسكم</div>${finalReveal(q)}`;
  else if(isMCQ)body=`<div class="answers">${answers.map(a=>`<button class="answer-btn" data-answer="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;
  else body=`<div id="openAnswerArea">${finalReveal(q)}</div>`;

  gameLayout(`<div class="question-shell tv-question"><div class="question-top"><div class="q-meta">${c.emoji} ${c.name} <b><span id="awardPoints">${state.currentAwardPoints}</span> نقطة</b></div><div class="timer" id="timer"><strong id="timeText">60</strong><small>ثانية</small></div></div><div class="question-card"><div class="question-text">${q.questionText}</div>${body}<div class="lifelines"><button class="life-btn" data-life="hint" ${team.lifelines.hint?'':'disabled'}>💡 تلميح</button><button class="life-btn" data-life="fifty" ${team.lifelines.fifty&&isMCQ?'':'disabled'}>✂️ 50/50</button><button class="life-btn" data-life="time" ${team.lifelines.time?'':'disabled'}>⏱️ +15 ثانية</button>${canAddChoices?`<button class="life-btn choice-assist" id="giveChoices">➕ إضافة خيارات <small>القيمة تصبح 50</small></button>`:''}<button class="life-btn" data-life="change" ${team.lifelines.change?'':'disabled'}>🔄 غير السؤال</button></div><div id="hintBox"></div></div></div>`);

  if(isMCQ)document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.answer===q.correctAnswer?'correct':'wrong'));
  else{
    const reveal=document.getElementById('revealAnswer');
    if(reveal)reveal.onclick=()=>{reveal.style.display='none';const box=document.getElementById('revealedAnswer');if(box)box.style.display='block';const correct=document.getElementById('correct'),wrong=document.getElementById('wrong');if(correct)correct.onclick=()=>finishQuestion('correct');if(wrong)wrong.onclick=()=>finishQuestion('wrong');};
    const give=document.getElementById('giveChoices');
    if(give)give.onclick=()=>{if(state.usedChoiceAssist)return;const wrongs=buildChoiceAssist(q);if(wrongs.length<3){toast('ما فيه خيارات كفاية لهذا السؤال');return;}state.usedChoiceAssist=true;state.currentAwardPoints=50;document.getElementById('awardPoints').textContent='50';give.disabled=true;const choices=[q.correctAnswer,...wrongs].sort(()=>Math.random()-.5);document.getElementById('openAnswerArea').innerHTML=`<div class="choice-cost-note">استخدمتوا إضافة خيارات — قيمة السؤال الآن 50 نقطة</div><div class="answers">${choices.map(a=>`<button class="answer-btn" data-choice-answer="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;document.querySelectorAll('[data-choice-answer]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.choiceAnswer===q.correctAnswer?'correct':'wrong'));};
  }
  document.querySelectorAll('[data-life]').forEach(b=>b.onclick=()=>useLife(b.dataset.life));tick();state.timerId=setInterval(tick,200);
};

finishQuestion=function(status){clearInterval(state.timerId);if(state.screen!=='question')return;if(status==='correct')state.teams[state.currentTeam].score+=(state.currentAwardPoints??state.currentQuestion.points);state.lastResult=status;state.screen='result';render();};
