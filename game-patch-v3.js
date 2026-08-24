// V3: song fill-in questions + optional answer choices worth a fixed 50 points.

QUESTIONS.push(
  {questionID:'song-fill-e-1',category:'songs',difficulty:'easy',points:200,questionType:'complete',questionText:'أكمل: تتنفسك ____',correctAnswer:'دنياي',wrongAnswers:[],hint:'الكلمة تعني عالمي أو حياتي.',countryRegionTags:['Saudi'],eraTag:'Modern'},
  {questionID:'song-fill-m-1',category:'songs',difficulty:'medium',points:400,questionType:'complete',questionText:'أكمل اسم الأغنية: ____ خميس',correctAnswer:'ليلة',wrongAnswers:[],hint:'من أشهر أغاني محمد عبده.',countryRegionTags:['Saudi'],eraTag:'Classic'},
  {questionID:'song-fill-h-1',category:'songs',difficulty:'hard',points:600,questionType:'complete',questionText:'أكمل: يا ابن ____',correctAnswer:'الأوادم',wrongAnswers:[],hint:'من أغاني محمد عبده.',countryRegionTags:['Saudi'],eraTag:'Classic'}
);

state.currentAwardPoints = null;
state.usedChoiceAssist = false;

const previousPickQuestionV3 = pickQuestion;
pickQuestion = function(diff, excludeCurrent=false){
  previousPickQuestionV3(diff, excludeCurrent);
  if (state.currentQuestion) {
    state.currentAwardPoints = state.currentQuestion.points;
    state.usedChoiceAssist = false;
  }
};

function buildDistractors(q){
  const own=(q.wrongAnswers||[]).filter(x=>x && x!==q.correctAnswer);
  const pool=QUESTIONS.filter(x=>x.questionID!==q.questionID && x.category===q.category && x.correctAnswer && x.correctAnswer!==q.correctAnswer).map(x=>x.correctAnswer).filter((x,i,a)=>a.indexOf(x)===i && !own.includes(x));
  return [...own,...pool.sort(()=>Math.random()-.5)].slice(0,3);
}

function revealBlock(q){
  return `<div class="reveal-answer-wrap" style="text-align:center;margin-top:18px"><button class="btn btn-primary" id="revealAnswer">إظهار الجواب</button><div id="revealedAnswer" style="display:none;margin-top:18px"><div style="color:#817b89;font-size:14px;margin-bottom:6px">الجواب الصحيح</div><div style="font-size:30px;font-weight:800;margin-bottom:18px">${q.correctAnswer}</div><div class="direct-actions"><button class="btn correct-btn" id="correct">✓ جاوبوا صح</button><button class="btn wrong-btn" id="wrong">✕ ما عرفوه</button></div></div></div>`;
}

question = function(){
  const q=state.currentQuestion,c=CATS[q.category],team=state.teams[state.currentTeam];
  const isMCQ=q.questionType==='mcq',isLogo=q.questionType==='logo',isComplete=q.questionType==='complete',isOrdering=q.questionType==='ordering';
  const canAskChoices=!isMCQ&&!isLogo&&!isComplete&&!isOrdering;
  const answers=isMCQ?shuffledAnswers(q):[];
  state.currentAwardPoints=state.currentAwardPoints??q.points;
  let body='';
  if(isOrdering){body=`<div class="ordering-instruction">رتّبوا من <strong>${q.orderLabel||'الأكثر إلى الأقل'}</strong></div><div class="ordering-list">${q.items.map((x,i)=>`<div><span>${i+1}</span>${x}</div>`).join('')}</div>`+revealBlock(q);}
  else if(isLogo){body=`<div class="logo-question" style="text-align:center;margin:12px 0 28px"><div style="min-height:180px;display:grid;place-items:center"><img src="${q.mediaURL}" alt="شعار للسؤال" style="max-width:220px;max-height:150px;object-fit:contain"></div></div>`+revealBlock(q);}
  else if(isComplete){body=`<div style="text-align:center;margin:8px 0 24px;color:#817b89;font-size:14px">كملوا الفراغ من نفسكم</div>${revealBlock(q)}`;}
  else if(isMCQ){body=`<div class="answers">${answers.map(a=>`<button class="answer-btn" data-answer="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;}
  else {body=`<div id="openAnswerArea">${revealBlock(q)}</div>`;}

  gameLayout(`<div class="question-shell"><div class="question-top"><div class="q-meta">${c.emoji} ${c.name} <b><span id="awardPoints">${state.currentAwardPoints}</span> نقطة</b></div><div class="timer" id="timer"><strong id="timeText">60</strong><small>ثانية</small></div></div><div class="question-card"><div class="question-text">${q.questionText}</div>${body}<div class="lifelines"><button class="life-btn" data-life="hint" ${team.lifelines.hint?'':'disabled'}>💡 تلميح</button><button class="life-btn" data-life="fifty" ${team.lifelines.fifty&&isMCQ?'':'disabled'}>✂️ 50/50</button><button class="life-btn" data-life="time" ${team.lifelines.time?'':'disabled'}>⏱️ +15 ثانية</button>${canAskChoices?`<button class="life-btn" id="giveChoices">🎯 عطني خيارات</button>`:''}<button class="life-btn" data-life="change" ${team.lifelines.change?'':'disabled'}>🔄 غير السؤال</button></div><div id="hintBox"></div></div></div>`);

  if(isMCQ){document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.answer===q.correctAnswer?'correct':'wrong'));}
  else {
    const reveal=document.getElementById('revealAnswer');
    if(reveal) reveal.onclick=()=>{reveal.style.display='none';const box=document.getElementById('revealedAnswer');if(box)box.style.display='block';const correct=document.getElementById('correct'),wrong=document.getElementById('wrong');if(correct)correct.onclick=()=>finishQuestion('correct');if(wrong)wrong.onclick=()=>finishQuestion('wrong');};
    const giveChoices=document.getElementById('giveChoices');
    if(giveChoices) giveChoices.onclick=()=>{
      if(state.usedChoiceAssist)return;
      const distractors=buildDistractors(q);if(distractors.length<3){toast('ما فيه خيارات كفاية لهذا السؤال');return;}
      state.usedChoiceAssist=true;
      state.currentAwardPoints=50;
      const pointsEl=document.getElementById('awardPoints');if(pointsEl)pointsEl.textContent='50';
      giveChoices.disabled=true;
      const choices=[q.correctAnswer,...distractors].sort(()=>Math.random()-.5),area=document.getElementById('openAnswerArea');
      if(area){area.innerHTML=`<div style="text-align:center;color:#b56b23;font-weight:700;margin-bottom:14px">استخدمتوا الخيارات — قيمة السؤال الآن 50 نقطة</div><div class="answers">${choices.map(a=>`<button class="answer-btn" data-choice-answer="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;document.querySelectorAll('[data-choice-answer]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.choiceAnswer===q.correctAnswer?'correct':'wrong'));}
    };
  }
  document.querySelectorAll('[data-life]').forEach(b=>b.onclick=()=>useLife(b.dataset.life));tick();state.timerId=setInterval(tick,200);
};

finishQuestion=function(status){clearInterval(state.timerId);if(state.screen!=='question')return;if(status==='correct')state.teams[state.currentTeam].score+=(state.currentAwardPoints??state.currentQuestion.points);state.lastResult=status;state.screen='result';render();};
result=function(){const q=state.currentQuestion,ok=state.lastResult==='correct',earned=ok?(state.currentAwardPoints??q.points):0;gameLayout(`<div class="result minimal-result"><div class="result-icon ${ok?'ok':'no'}">${ok?'✓':'✕'}</div>${ok?`<div class="delta">+${earned}</div>`:''}<button class="btn btn-primary" id="next">التالي</button></div>`);next.onclick=nextTurn;};
