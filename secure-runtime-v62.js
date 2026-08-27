// V62 — secure client runtime. Correct answers never live in the browser bank.
(function(){
  if(typeof state==='undefined'||typeof render!=='function'||typeof QUESTIONS==='undefined')return;
  const RT=window.LaffhaRealtime;
  if(!RT)return;
  const {client,ensureSession,readableError}=RT;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  CATS.logos={name:'خمن الصورة',emoji:'🖼️',color:'#c9b8f4'};
  if(!state.categories.includes('logos'))state.categories.push('logos');

  shuffledAnswers=function(q){return Array.isArray(q?.options)?[...q.options]:[];};

  async function secureCall(answer='',mode='answer'){
    const q=state.currentQuestion;
    if(!q?.questionID)throw new Error('السؤال غير جاهز');
    await ensureSession();
    const {data,error}=await client.functions.invoke('laffha-answer',{body:{
      roomId:state.multiRoom?.id||null,
      questionId:q.questionID,
      answer:String(answer??''),
      teamNo:Number(state.currentTeam||0)+1,
      revision:state.multiRoom?.id?Number(state.multiRevision||0):null,
      mode
    }});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    return data||{};
  }
  window.laffhaSecureVerify=async answer=>!!(await secureCall(answer,'answer')).correct;

  async function verifyChoice(answer,button){
    if(state.screen!=='question')return;
    const all=[...document.querySelectorAll('[data-secure-answer]')];
    all.forEach(b=>b.disabled=true);if(button)button.classList.add('selected');
    try{const data=await secureCall(answer,'answer');finishQuestion(data.correct?'correct':'wrong');}
    catch(error){all.forEach(b=>b.disabled=false);toast(`تعذر التحقق: ${readableError(error)}`);}
  }

  async function secureFifty(button){
    const team=state.teams[state.currentTeam];if(!team?.lifelines?.fifty)return;
    button.disabled=true;
    try{
      const data=await secureCall('','fifty');
      const hide=new Set((data.hide||[]).map(String));
      document.querySelectorAll('[data-secure-answer]').forEach(b=>{if(hide.has(String(b.dataset.secureAnswer)))b.classList.add('hidden-answer');});
      team.lifelines.fifty=false;
    }catch(error){button.disabled=false;toast(`تعذر استخدام 50/50: ${readableError(error)}`);}
  }

  function logoMedia(q){
    if(!q.mediaURL)return '<div class="logo-fallback">؟</div>';
    const kind=q.visualKind==='landmark'?'visual-landmark':'visual-brand';
    const diff=q.difficulty==='hard'?'visual-hard':q.difficulty==='medium'?'visual-medium':'visual-easy';
    return `<div class="visual-question-v54 ${kind} ${diff}"><div class="visual-frame-v54"><img src="${esc(q.mediaURL)}" alt="صورة السؤال" referrerpolicy="no-referrer"></div></div>`;
  }
  function answerButtons(q){
    const options=Array.isArray(q.options)?q.options:[];
    return `<div class="answers">${options.map(a=>`<button class="answer-btn" data-secure-answer="${esc(a)}">${esc(a)}</button>`).join('')}</div>`;
  }

  question=function(){
    const q=state.currentQuestion,c=CATS[q.category]||{emoji:'❓',name:q.category||'سؤال'},team=state.teams[state.currentTeam];
    const isMCQ=q.questionType==='mcq',isLogo=q.questionType==='logo',isOrdering=q.questionType==='ordering';
    const multiVisual=isLogo&&state.playMode==='multi';
    const canFifty=isMCQ||(isLogo&&!multiVisual);
    let body='';
    if(isLogo){
      body=logoMedia(q)+(multiVisual?'<div class="v62-phone-answer-note">الإجابة تُكتب من جوال الفريق — عربي أو English</div>':answerButtons(q));
    }else if(isMCQ){body=answerButtons(q);}
    else if(isOrdering){
      body=`<div class="ordering-instruction">رتّبوا من <strong>${esc(q.orderLabel||'الأكثر إلى الأقل')}</strong></div><div class="ordering-list">${(q.items||[]).map((x,i)=>`<div><span>${i+1}</span>${esc(x)}</div>`).join('')}</div><div class="direct-actions"><button class="btn correct-btn" id="correct">✓ الترتيب صحيح</button><button class="btn wrong-btn" id="wrong">✕ الترتيب خطأ</button></div>`;
    }else{
      const sub=q.singer?`<div style="text-align:center;margin:0 0 10px;font-size:18px;font-weight:750;color:#6f46b8">🎤 ${esc(q.singer)}</div>`:'';
      body=`${sub}<div class="direct-actions"><button class="btn correct-btn" id="correct">✓ إجابة صحيحة</button><button class="btn wrong-btn" id="wrong">✕ إجابة خاطئة</button></div>`;
    }

    gameLayout(`<div class="question-shell"><div class="question-top"><div class="q-meta">${c.emoji} ${c.name} <b>${Number(state.currentAwardPoints??q.points??0)} نقطة</b></div><div class="timer" id="timer"><strong id="timeText">60</strong><small>ثانية</small></div></div><div class="question-card"><div class="question-text">${q.questionText||''}</div>${body}<div class="lifelines"><button class="life-btn" data-life-secure="hint" ${team.lifelines.hint?'':'disabled'}>💡 تلميح</button><button class="life-btn" data-life-secure="fifty" ${team.lifelines.fifty&&canFifty?'':'disabled'}>✂️ 50/50</button><button class="life-btn" data-life-secure="time" ${team.lifelines.time?'':'disabled'}>⏱️ +15 ثانية</button><button class="life-btn" data-life-secure="change" ${team.lifelines.change?'':'disabled'}>🔄 غير السؤال</button></div><div id="hintBox"></div></div></div>`);

    document.querySelectorAll('[data-secure-answer]').forEach(b=>b.onclick=()=>verifyChoice(b.dataset.secureAnswer,b));
    const correct=document.getElementById('correct'),wrong=document.getElementById('wrong');if(correct)correct.onclick=()=>finishQuestion('correct');if(wrong)wrong.onclick=()=>finishQuestion('wrong');
    document.querySelectorAll('[data-life-secure]').forEach(b=>b.onclick=()=>{const type=b.dataset.lifeSecure;if(type==='fifty')secureFifty(b);else useLife(type);});
    tick();state.timerId=setInterval(tick,200);
  };

  const style=document.createElement('style');style.textContent='.v62-phone-answer-note{margin:16px 0;padding:12px 14px;border:1px dashed #d6c7e9;border-radius:14px;text-align:center;color:#766a80;background:#faf7fd;font-weight:700}.answer-btn.selected{transform:scale(.99);opacity:.85}';document.head.appendChild(style);
  console.info('Laffha V62 secure answer runtime ready');
})();