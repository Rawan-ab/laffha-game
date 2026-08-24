// Stable gameplay patch: reel -> selected category -> points -> question.
// Also removes true/false and makes logo questions open-answer only.

// 1) Never allow true/false questions into the playable bank.
for (let i = QUESTIONS.length - 1; i >= 0; i--) {
  if (QUESTIONS[i].questionType === 'truefalse') QUESTIONS.splice(i, 1);
}

// 2) Add a dedicated logos category.
CATS.logos = {name:'شعارات', emoji:'🔎', color:'#efacd0'};
if (!state.categories.includes('logos')) state.categories.push('logos');

// 3) Add clear logo questions. No answer choices are shown for this type.
QUESTIONS.push(
  {questionID:'logo-e-apple',category:'logos',difficulty:'easy',points:200,questionType:'logo',questionText:'وش اسم هذا الشعار؟',correctAnswer:'Apple',wrongAnswers:[],hint:'شركة تقنية أمريكية.',mediaURL:'https://cdn.simpleicons.org/apple/111111'},
  {questionID:'logo-e-netflix',category:'logos',difficulty:'easy',points:200,questionType:'logo',questionText:'وش اسم هذا الشعار؟',correctAnswer:'Netflix',wrongAnswers:[],hint:'منصة مشاهدة عالمية.',mediaURL:'https://cdn.simpleicons.org/netflix/E50914'},
  {questionID:'logo-m-spotify',category:'logos',difficulty:'medium',points:400,questionType:'logo',questionText:'تعرفون هذا الشعار؟',correctAnswer:'Spotify',wrongAnswers:[],hint:'تطبيق موسيقى وبودكاست.',mediaURL:'https://cdn.simpleicons.org/spotify/1DB954'},
  {questionID:'logo-m-github',category:'logos',difficulty:'medium',points:400,questionType:'logo',questionText:'وش اسم المنصة من شعارها؟',correctAnswer:'GitHub',wrongAnswers:[],hint:'منصة مشهورة للمطورين.',mediaURL:'https://cdn.simpleicons.org/github/181717'},
  {questionID:'logo-h-adidas',category:'logos',difficulty:'hard',points:600,questionType:'logo',questionText:'وش اسم هذه العلامة؟',correctAnswer:'Adidas',wrongAnswers:[],hint:'علامة رياضية ألمانية.',mediaURL:'https://cdn.simpleicons.org/adidas/111111'},
  {questionID:'logo-h-nike',category:'logos',difficulty:'hard',points:600,questionType:'logo',questionText:'وش اسم هذه العلامة؟',correctAnswer:'Nike',wrongAnswers:[],hint:'علامة رياضية أمريكية.',mediaURL:'https://cdn.simpleicons.org/nike/111111'}
);

// 4) Pick only a question from the category that the reel actually selected.
pickQuestion = function(diff, excludeCurrent=false){
  let pool = QUESTIONS.filter(q =>
    q.questionType !== 'truefalse' &&
    q.category === state.selectedCategory &&
    q.difficulty === diff &&
    !state.usedQuestions.has(q.questionID)
  );
  if (excludeCurrent && state.currentQuestion) {
    pool = pool.filter(q => q.questionID !== state.currentQuestion.questionID);
  }
  if (!pool.length) {
    pool = QUESTIONS.filter(q =>
      q.questionType !== 'truefalse' &&
      q.category === state.selectedCategory &&
      q.difficulty === diff &&
      (!excludeCurrent || q.questionID !== state.currentQuestion?.questionID)
    );
  }
  if (!pool.length) {
    toast('ما فيه سؤال متاح بهذا المستوى في هذه الفئة');
    return;
  }
  state.currentQuestion = pool[Math.floor(Math.random()*pool.length)];
  state.usedQuestions.add(state.currentQuestion.questionID);
  state.deadline = Date.now()+60000;
  state.screen = 'question';
  render();
};

// 5) Points selection is always a separate screen.
difficulty = function(){
  const c = CATS[state.selectedCategory];
  gameLayout(`
    <div style="text-align:center;margin-bottom:12px;color:#817b89">الفئة المختارة</div>
    <div class="selected-cat" style="font-size:32px">${c.emoji} ${c.name}</div>
    <h2 class="center-title">اختاروا النقاط</h2>
    <div class="difficulty-grid">
      <button class="difficulty hard" data-diff="hard"><div class="points">600</div></button>
      <button class="difficulty medium" data-diff="medium"><div class="points">400</div></button>
      <button class="difficulty easy" data-diff="easy"><div class="points">200</div></button>
    </div>
  `);
  document.querySelectorAll('[data-diff]').forEach(b=>{
    b.onclick=()=>pickQuestion(b.dataset.diff);
  });
};

// 6) Reel stores exactly the DOM item that visually lands under the pointer.
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
    <div id="pickedCategory" style="height:42px;margin-top:18px;font-weight:800;font-size:22px"></div>
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
      picked.textContent=`${c.emoji} ${c.name}`;
      btn.textContent='اختاروا النقاط';
      btn.disabled=false;
      btn.onclick=()=>{
        state.screen='difficulty';
        render();
      };
    },2200);
  };
};

// 7) Question renderer: logos and direct questions are answered by the team themselves.
question = function(){
  const q=state.currentQuestion;
  const c=CATS[q.category];
  const team=state.teams[state.currentTeam];
  const isMCQ=q.questionType==='mcq';
  const answers=isMCQ?shuffledAnswers(q):[];
  let body='';

  if(q.questionType==='ordering'){
    body=`<div class="ordering-instruction">رتّبوا من <strong>${q.orderLabel||'الأكثر إلى الأقل'}</strong></div><div class="ordering-list">${q.items.map((x,i)=>`<div><span>${i+1}</span>${x}</div>`).join('')}</div><div class="direct-actions"><button class="btn correct-btn" id="correct">✓ صحيح</button><button class="btn wrong-btn" id="wrong">✕ خطأ</button></div>`;
  } else if(q.questionType==='logo'){
    body=`<div class="logo-question" style="text-align:center;margin:12px 0 28px"><div style="min-height:180px;display:grid;place-items:center"><img src="${q.mediaURL}" alt="شعار للسؤال" style="max-width:220px;max-height:150px;object-fit:contain"></div></div><div class="direct-actions"><button class="btn correct-btn" id="correct">✓ جاوبوا صح</button><button class="btn wrong-btn" id="wrong">✕ ما عرفوه</button></div>`;
  } else if(isMCQ){
    body=`<div class="answers">${answers.map(a=>`<button class="answer-btn" data-answer="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;
  } else {
    body=`<div class="direct-actions"><button class="btn correct-btn" id="correct">✓ جاوبوا صح</button><button class="btn wrong-btn" id="wrong">✕ ما عرفوه</button></div>`;
  }

  gameLayout(`<div class="question-shell"><div class="question-top"><div class="q-meta">${c.emoji} ${c.name} <b>${q.points} نقطة</b></div><div class="timer" id="timer"><strong id="timeText">60</strong><small>ثانية</small></div></div><div class="question-card"><div class="question-text">${q.questionText}</div>${body}<div class="lifelines"><button class="life-btn" data-life="hint" ${team.lifelines.hint?'':'disabled'}>💡 تلميح</button><button class="life-btn" data-life="fifty" ${team.lifelines.fifty&&isMCQ?'':'disabled'}>✂️ 50/50</button><button class="life-btn" data-life="time" ${team.lifelines.time?'':'disabled'}>⏱️ +15 ثانية</button><button class="life-btn" data-life="change" ${team.lifelines.change?'':'disabled'}>🔄 غير السؤال</button></div><div id="hintBox"></div></div></div>`);

  if(isMCQ){
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.answer===q.correctAnswer?'correct':'wrong'));
  } else {
    document.getElementById('correct').onclick=()=>finishQuestion('correct');
    document.getElementById('wrong').onclick=()=>finishQuestion('wrong');
  }
  document.querySelectorAll('[data-life]').forEach(b=>b.onclick=()=>useLife(b.dataset.life));
  tick();
  state.timerId=setInterval(tick,200);
};

// Refresh the initial screen so the new category appears in setup too.
render();
