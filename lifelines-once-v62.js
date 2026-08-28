// V64 — lifelines stay visible; each one is usable once per team per game.
// 50/50 is replaced by "Choices": convert the current non-MCQ question to choices
// and reduce only that question's value to half.
(function(){
  if(typeof state==='undefined'||typeof question!=='function')return;
  const RT=window.LaffhaRealtime;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function ensureTeamLifelines(team){
    if(!team)return null;
    team.lifelines=team.lifelines||{};
    if(typeof team.lifelines.hint!=='boolean')team.lifelines.hint=true;
    if(typeof team.lifelines.time!=='boolean')team.lifelines.time=true;
    if(typeof team.lifelines.change!=='boolean')team.lifelines.change=true;
    if(typeof team.lifelines.choices!=='boolean')team.lifelines.choices=team.lifelines.fifty!==false;
    return team.lifelines;
  }
  function currentTeam(){const team=state.teams?.[state.currentTeam];ensureTeamLifelines(team);return team;}
  function choiceSupported(q){return !!q && q.questionType!=='mcq';}
  function updatePointsLabel(){
    const value=Number(state.currentAwardPoints??state.currentQuestion?.points??0);
    const qMeta=document.querySelector('.q-meta b');if(qMeta)qMeta.textContent=`${value} نقطة`;
    const award=document.getElementById('awardPoints');if(award)award.textContent=String(value);
  }
  function refreshLifelines(){
    const team=currentTeam();if(!team?.lifelines)return;
    document.querySelectorAll('[data-life-secure]').forEach(btn=>{
      const type=btn.dataset.lifeSecure;
      const used=team.lifelines[type]===false;
      const unavailable=type==='choices'&&!choiceSupported(state.currentQuestion);
      btn.disabled=used||unavailable;
      btn.classList.toggle('used-lifeline',used);
      btn.classList.toggle('not-applicable',unavailable&&!used);
      if(type==='choices')btn.title=unavailable?'السؤال أصلاً اختيارات':used?'استخدمت مرة واحدة في هذه اللعبة':'تحويل السؤال إلى اختيارات بنصف النقاط';
      else btn.title=used?'استخدمت مرة واحدة في هذه اللعبة':'';
    });
  }

  async function serverChoices(){
    const q=state.currentQuestion;
    if(!q?.questionID||!RT)throw new Error('السؤال غير جاهز');
    await RT.ensureSession();
    const {data,error}=await RT.client.functions.invoke('laffha-answer',{body:{
      roomId:state.multiRoom?.id||null,
      questionId:q.questionID,
      answer:'',
      teamNo:Number(state.currentTeam||0)+1,
      revision:state.multiRoom?.id?Number(state.multiRevision||0):null,
      mode:'choices'
    }});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    return Array.isArray(data?.options)?data.options.map(String):[];
  }

  function showChoiceArea(options){
    const card=document.querySelector('.question-card');
    const lifelines=document.querySelector('.lifelines');
    if(!card||!lifelines)return;
    card.querySelectorAll('.secure-open-wrap,.secure-order-list,.ordering-instruction,#secureOrderSubmit,.v62-phone-answer-note').forEach(el=>el.style.display='none');
    let area=document.getElementById('v64ChoiceArea');
    if(!area){area=document.createElement('div');area.id='v64ChoiceArea';card.insertBefore(area,lifelines);}
    area.innerHTML=`<div class="v64-choice-note">🧩 استخدمتوا «خيارات» — قيمة السؤال صارت <b>${Number(state.currentAwardPoints||0)} نقطة</b></div><div class="answers">${options.map(a=>`<button class="answer-btn" data-secure-answer="${esc(a)}">${esc(a)}</button>`).join('')}</div>`;
    area.querySelectorAll('[data-secure-answer]').forEach(btn=>btn.onclick=async()=>{
      if(btn.disabled||state.screen!=='question')return;
      const all=[...area.querySelectorAll('[data-secure-answer]')];
      all.forEach(x=>x.disabled=true);btn.classList.add('selected');
      try{
        const correct=await window.laffhaSecureVerify(btn.dataset.secureAnswer||'');
        finishQuestion(correct?'correct':'wrong');
      }catch(error){
        all.forEach(x=>x.disabled=false);
        if(typeof toast==='function')toast(`تعذر التحقق: ${RT?.readableError?.(error)||error?.message||error}`);
      }
    });
  }

  async function useChoices(button){
    const team=currentTeam(),q=state.currentQuestion;
    if(!team?.lifelines?.choices||!choiceSupported(q))return;
    button.disabled=true;button.classList.add('life-loading');
    const oldText=button.innerHTML;button.innerHTML='🧩 جاري تجهيز الخيارات…';
    try{
      const options=await serverChoices();
      if(options.length<2)throw new Error('choices_unavailable');
      team.lifelines.choices=false;
      team.lifelines.fifty=false; // compatibility with older reset/state code
      const before=Number(state.currentAwardPoints??q.points??0);
      state.currentAwardPoints=Math.max(0,Math.floor(before/2));
      updatePointsLabel();
      showChoiceArea(options);
      button.innerHTML='🧩 خيارات';
      refreshLifelines();
      if(typeof toast==='function')toast(`صارت قيمة السؤال ${state.currentAwardPoints} نقطة`);
    }catch(error){
      button.disabled=false;button.classList.remove('life-loading');button.innerHTML=oldText;
      const message=String(error?.message||error);
      if(typeof toast==='function')toast(message.includes('choices_unavailable')?'ما قدرنا نكوّن خيارات مناسبة لهذا السؤال':`تعذر تجهيز الخيارات: ${RT?.readableError?.(error)||message}`);
    }
  }

  // Override standard lifeline behavior so all helpers are once-per-team and stay visible.
  window.useLife=function(type){
    const team=currentTeam(),q=state.currentQuestion;
    if(!team?.lifelines?.[type])return;
    if(type==='hint'){
      team.lifelines.hint=false;
      const box=document.getElementById('hintBox');
      if(box)box.innerHTML=`<div class="hint-box"><strong>💡 تلميح</strong><span>${q?.hint||'ركزوا على تفاصيل السؤال.'}</span></div>`;
    }else if(type==='time'){
      team.lifelines.time=false;
      state.deadline=(state.deadline||Date.now())+15000;
      if(typeof toast==='function')toast('تمت إضافة 15 ثانية');
    }else if(type==='change'){
      team.lifelines.change=false;
      refreshLifelines();
      pickQuestion(q?.difficulty||state.drawnDifficulty||'easy',true);
      return;
    }
    refreshLifelines();
  };

  const baseQuestion=window.question;
  window.question=function(){
    const team=currentTeam();
    baseQuestion();
    if(!team||state.screen!=='question')return;

    // Replace the old 50/50 button with the single Choices helper.
    const old=document.querySelector('[data-life-secure="fifty"]');
    if(old){
      const replacement=old.cloneNode(true);
      replacement.dataset.lifeSecure='choices';
      replacement.innerHTML='🧩 خيارات';
      old.replaceWith(replacement);
      replacement.onclick=()=>useChoices(replacement);
    }

    // Replace standard handlers so used buttons remain visible but disabled.
    document.querySelectorAll('[data-life-secure]').forEach(btn=>{
      const type=btn.dataset.lifeSecure;
      if(type==='choices')return;
      btn.onclick=()=>window.useLife(type);
    });
    refreshLifelines();
  };

  // Award the reduced value when Choices was used. Normal questions are unaffected.
  const baseFinish=window.finishQuestion;
  if(typeof baseFinish==='function')window.finishQuestion=function(status){
    const q=state.currentQuestion;
    if(!q||status!=='correct'||!Number.isFinite(Number(state.currentAwardPoints)))return baseFinish(status);
    const original=q.points;
    q.points=Number(state.currentAwardPoints);
    try{return baseFinish(status);}finally{q.points=original;}
  };

  const style=document.createElement('style');style.textContent=`
    .life-btn.used-lifeline{opacity:.48!important;filter:saturate(.45);cursor:not-allowed!important;position:relative}
    .life-btn.used-lifeline::after{content:'✓ مستخدمة';display:block;font-size:10px;margin-top:4px;font-weight:800}
    .life-btn.not-applicable{opacity:.42!important;cursor:not-allowed!important}
    .life-btn.life-loading{opacity:.72!important}
    .v64-choice-note{margin:14px 0 10px;padding:11px 13px;border-radius:13px;background:#f4eefb;color:#5f35a7;text-align:center;font-weight:700;font-size:13px}
  `;document.head.appendChild(style);

  console.info('Laffha V64 visible one-use lifelines + half-value choices ready');
})();