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

  async function verifyTyped(input,button,answerOverride=null){
    if(state.screen!=='question')return;
    const answer=answerOverride!==null?String(answerOverride):String(input?.value||'').trim();
    if(!answer)return;
    if(button){button.disabled=true;button.textContent='جاري التحقق…';}
    if(input)input.disabled=true;
    try{const data=await secureCall(answer,'answer');finishQuestion(data.correct?'correct':'wrong');}
    catch(error){if(button){button.disabled=false;button.textContent='تأكيد الإجابة';}if(input)input.disabled=false;toast(`تعذر التحقق: ${readableError(error)}`);}
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
  function typedBlock(q){
    const label=q.questionType==='complete'?'اكتبوا الكلمة أو الإجابة الناقصة':'اكتبوا الإجابة';
    return `<div class="secure-open-wrap"><input class="secure-open-input" id="secureOpenAnswer" type="text" autocomplete="off" placeholder="${label}"><button class="btn btn-primary secure-submit" id="secureSubmit">تأكيد الإجابة</button></div>`;
  }
  function orderingBlock(q){
    const items=Array.isArray(q.items)?q.items:[];
    return `<div class="ordering-instruction">رتّبوا من <strong>${esc(q.orderLabel||'الترتيب الصحيح')}</strong></div><div class="secure-order-list" id="secureOrderList">${items.map((x,i)=>`<div class="secure-order-item" data-order-item="${esc(x)}"><span class="secure-order-num">${i+1}</span><strong>${esc(x)}</strong><span class="secure-order-actions"><button type="button" data-move="up" aria-label="تحريك للأعلى">↑</button><button type="button" data-move="down" aria-label="تحريك للأسفل">↓</button></span></div>`).join('')}</div><button class="btn btn-primary secure-submit" id="secureOrderSubmit">تأكيد الترتيب</button>`;
  }

  question=function(){
    const q=state.currentQuestion,c=CATS[q.category]||{emoji:'❓',name:q.category||'سؤال'},team=state.teams[state.currentTeam];
    const isMCQ=q.questionType==='mcq',isLogo=q.questionType==='logo',isOrdering=q.questionType==='ordering';
    const multiVisual=isLogo&&state.playMode==='multi';
    const canFifty=isMCQ||(isLogo&&!multiVisual);
    let body='';
    if(isLogo){
      body=logoMedia(q)+(multiVisual?'<div class="v62-phone-answer-note">الإجابة تُكتب من جوال الفريق — عربي أو English</div>':typedBlock(q));
    }else if(isMCQ){body=answerButtons(q);}
    else if(isOrdering){body=orderingBlock(q);}
    else{
      const sub=q.singer?`<div style="text-align:center;margin:0 0 10px;font-size:18px;font-weight:750;color:#6f46b8">🎤 ${esc(q.singer)}</div>`:'';
      body=sub+typedBlock(q);
    }

    gameLayout(`<div class="question-shell"><div class="question-top"><div class="q-meta">${c.emoji} ${c.name} <b>${Number(state.currentAwardPoints??q.points??0)} نقطة</b></div><div class="timer" id="timer"><strong id="timeText">60</strong><small>ثانية</small></div></div><div class="question-card"><div class="question-text">${q.questionText||''}</div>${body}<div class="lifelines"><button class="life-btn" data-life-secure="hint" ${team.lifelines.hint?'':'disabled'}>💡 تلميح</button><button class="life-btn" data-life-secure="fifty" ${team.lifelines.fifty&&canFifty?'':'disabled'}>✂️ 50/50</button><button class="life-btn" data-life-secure="time" ${team.lifelines.time?'':'disabled'}>⏱️ +15 ثانية</button><button class="life-btn" data-life-secure="change" ${team.lifelines.change?'':'disabled'}>🔄 غير السؤال</button></div><div id="hintBox"></div></div></div>`);

    document.querySelectorAll('[data-secure-answer]').forEach(b=>b.onclick=()=>verifyChoice(b.dataset.secureAnswer,b));
    const input=document.getElementById('secureOpenAnswer'),submit=document.getElementById('secureSubmit');
    if(input&&submit){submit.onclick=()=>verifyTyped(input,submit);input.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click();});setTimeout(()=>input.focus(),50);}
    const orderList=document.getElementById('secureOrderList'),orderSubmit=document.getElementById('secureOrderSubmit');
    if(orderList){
      const renumber=()=>[...orderList.querySelectorAll('.secure-order-item')].forEach((el,i)=>{const n=el.querySelector('.secure-order-num');if(n)n.textContent=String(i+1);});
      orderList.querySelectorAll('[data-move]').forEach(btn=>btn.onclick=()=>{const item=btn.closest('.secure-order-item');if(!item)return;if(btn.dataset.move==='up'&&item.previousElementSibling)orderList.insertBefore(item,item.previousElementSibling);if(btn.dataset.move==='down'&&item.nextElementSibling)orderList.insertBefore(item.nextElementSibling,item);renumber();});
      if(orderSubmit)orderSubmit.onclick=()=>{const answer=[...orderList.querySelectorAll('.secure-order-item')].map(el=>el.dataset.orderItem).join('، ');verifyTyped(null,orderSubmit,answer);};
    }
    document.querySelectorAll('[data-life-secure]').forEach(b=>b.onclick=()=>{const type=b.dataset.lifeSecure;if(type==='fifty')secureFifty(b);else useLife(type);});
    tick();state.timerId=setInterval(tick,200);
  };

  const style=document.createElement('style');style.textContent=`
    .v62-phone-answer-note{margin:16px 0;padding:12px 14px;border:1px dashed #d6c7e9;border-radius:14px;text-align:center;color:#766a80;background:#faf7fd;font-weight:700}
    .answer-btn.selected{transform:scale(.99);opacity:.85}
    .secure-open-wrap{display:grid;gap:12px;margin:18px auto;max-width:560px}.secure-open-input{width:100%;border:2px solid #ded1eb;background:#fff;border-radius:18px;padding:17px 16px;font:inherit;font-size:18px;font-weight:700;outline:none;text-align:right}.secure-open-input:focus{border-color:#6b42ac;box-shadow:0 0 0 4px rgba(107,66,172,.08)}.secure-submit{width:100%}
    .secure-order-list{display:grid;gap:9px;margin:18px 0}.secure-order-item{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;border:1px solid #e3d9e8;border-radius:15px;padding:10px 12px;background:#fff}.secure-order-num{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f2ebfa;color:#633ba4;font-weight:800}.secure-order-actions{display:flex;gap:5px}.secure-order-actions button{border:0;border-radius:10px;width:34px;height:34px;background:#f3eef8;color:#633ba4;font-size:19px;cursor:pointer}
  `;document.head.appendChild(style);
  console.info('Laffha V62 secure answer runtime ready');
})();