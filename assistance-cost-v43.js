// V43 — assistance scoring: normal assists cap the question at 100 points; Add Choices caps it at 50.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();

  function setAward(points, reason){
    const current=Number(state.currentAwardPoints ?? state.currentQuestion?.points ?? points);
    state.currentAwardPoints=Math.min(current, points);
    const el=document.getElementById('awardPoints');
    if(el)el.textContent=state.currentAwardPoints;
    if(reason)toast(reason);
  }

  function unique(list, correct){
    const seen=new Set([norm(correct)]),out=[];
    for(const x of list||[]){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(String(x));if(out.length===3)break;}
    return out;
  }

  function orderingChoices(q){
    const items=[...(q.items||[])];
    if(items.length<3)return [];
    const correct=String(q.correctAnswer||items.join('، '));
    const out=[];let guard=0;
    while(out.length<3&&guard++<40){
      const a=[...items];
      for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
      const s=a.join('، ');
      if(norm(s)!==norm(correct)&&!out.some(x=>norm(x)===norm(s)))out.push(s);
    }
    return out;
  }

  function genericChoicePool(q){
    if(q.questionType==='ordering')return orderingChoices(q);
    if(typeof buildChoiceAssist==='function'){
      const built=buildChoiceAssist(q);
      if(Array.isArray(built)&&built.length>=3)return unique(built,q.correctAnswer);
    }
    const own=unique(q.wrongAnswers||[],q.correctAnswer);
    const peers=QUESTIONS
      .filter(x=>x!==q&&x.category===q.category&&x.correctAnswer&&norm(x.correctAnswer)!==norm(q.correctAnswer))
      .sort((a,b)=>{
        const sa=(a.subCategory===q.subCategory?8:0)+(a.regionTag===q.regionTag?5:0)+(a.eraTag===q.eraTag?3:0)+(a.difficulty===q.difficulty?2:0)+Math.random();
        const sb=(b.subCategory===q.subCategory?8:0)+(b.regionTag===q.regionTag?5:0)+(b.eraTag===q.eraTag?3:0)+(b.difficulty===q.difficulty?2:0)+Math.random();
        return sb-sa;
      })
      .map(x=>x.correctAnswer);
    return unique([...own,...peers],q.correctAnswer);
  }

  // Override the common lifeline handler so every normal assistance use makes the current question worth at most 100.
  useLife=function(type){
    const team=state.teams[state.currentTeam],q=state.currentQuestion;
    if(!team?.lifelines?.[type])return;

    if(type==='hint'){
      team.lifelines.hint=false;
      setAward(100,'استخدمتوا التلميح — قيمة السؤال الآن 100 نقطة');
      const box=document.getElementById('hintBox');
      if(box)box.innerHTML=`<div class="hint-box"><strong>💡 تلميح</strong><span>${q.hint||'ركزوا على تفاصيل السؤال.'}</span></div>`;
    }
    if(type==='time'){
      team.lifelines.time=false;
      setAward(100,'استخدمتوا +15 ثانية — قيمة السؤال الآن 100 نقطة');
      state.deadline+=15000;
    }
    if(type==='fifty'&&['mcq','logo'].includes(q.questionType)){
      team.lifelines.fifty=false;
      setAward(100,'استخدمتوا 50/50 — قيمة السؤال الآن 100 نقطة');
      [...document.querySelectorAll('[data-answer]')]
        .filter(b=>b.dataset.answer!==q.correctAnswer)
        .sort(()=>Math.random()-.5)
        .slice(0,2)
        .forEach(b=>b.classList.add('hidden-answer'));
    }
    if(type==='change'){
      team.lifelines.change=false;
      state._assistanceCarry100=true;
      pickQuestion(q.difficulty,true);
      state.currentAwardPoints=Math.min(Number(state.currentAwardPoints??100),100);
      state._assistanceCarry100=false;
      render();
      setTimeout(()=>toast('استخدمتوا غير السؤال — السؤال الجديد قيمته 100 نقطة'),20);
      return;
    }

    document.querySelectorAll('[data-life]').forEach(b=>{
      const t=b.dataset.life;
      b.disabled=!team.lifelines[t]||(t==='fifty'&&!['mcq','logo'].includes(q.questionType));
    });
  };

  // Preserve 100-point penalty if another picker rerenders after using Change Question.
  const oldPick=pickQuestion;
  pickQuestion=function(diff,excludeCurrent=false){
    const carry=!!state._assistanceCarry100;
    oldPick(diff,excludeCurrent);
    if(carry&&state.currentQuestion)state.currentAwardPoints=Math.min(Number(state.currentAwardPoints??100),100);
  };

  // Wrap the latest question renderer and inject Add Choices for EVERY question that does not already show normal MCQ choices.
  const oldQuestion=question;
  question=function(){
    oldQuestion();
    const q=state.currentQuestion;
    if(!q||state.screen!=='question')return;

    // Cost labels on standard assistance buttons.
    document.querySelectorAll('.life-btn[data-life="hint"],.life-btn[data-life="fifty"],.life-btn[data-life="time"],.life-btn[data-life="change"]').forEach(btn=>{
      if(!btn.querySelector('.assist-cost'))btn.insertAdjacentHTML('beforeend','<small class="assist-cost">100 نقطة</small>');
    });

    const already=document.getElementById('giveChoices');
    const hasNormalChoices=q.questionType==='mcq';
    if(hasNormalChoices||already)return;

    const lifelines=document.querySelector('.lifelines');
    if(!lifelines)return;
    const add=document.createElement('button');
    add.className='life-btn choice-assist';
    add.id='giveChoices';
    add.innerHTML='➕ إضافة خيارات <small>50 نقطة</small>';
    lifelines.insertBefore(add,lifelines.querySelector('[data-life="change"]'));

    add.onclick=()=>{
      if(state.usedChoiceAssist)return;
      const wrongs=genericChoicePool(q);
      if(wrongs.length<3){toast('ما فيه خيارات مناسبة كفاية لهذا السؤال');return;}
      state.usedChoiceAssist=true;
      setAward(50,'استخدمتوا إضافة خيارات — قيمة السؤال الآن 50 نقطة');
      add.disabled=true;
      const correct=String(q.correctAnswer||'');
      const choices=[correct,...wrongs.slice(0,3)].sort(()=>Math.random()-.5);

      // Hide the original interaction/reveal area and replace it with four choices.
      const card=document.querySelector('.question-card');
      const selectors=['.answers','.direct-actions','.reveal-answer-wrap','.ordering-rank-wrap','.ordering-list','.ordering-instruction','.logo-question','.complete-note'];
      selectors.forEach(sel=>card?.querySelectorAll(sel).forEach(el=>el.style.display='none'));
      let area=document.getElementById('v43ChoiceArea');
      if(!area){area=document.createElement('div');area.id='v43ChoiceArea';const ll=document.querySelector('.lifelines');card.insertBefore(area,ll);}
      area.innerHTML=`<div class="choice-cost-note">إضافة خيارات — قيمة السؤال 50 نقطة</div><div class="answers">${choices.map(a=>`<button class="answer-btn" data-v43-choice="${a.replace(/"/g,'&quot;')}">${a}</button>`).join('')}</div>`;
      area.querySelectorAll('[data-v43-choice]').forEach(b=>b.onclick=()=>finishQuestion(b.dataset.v43Choice===correct?'correct':'wrong'));
    };
  };

  // Add the rule clearly to the first/setup page, without changing its layout.
  const oldSetup=setup;
  setup=function(){
    oldSetup();
    document.querySelectorAll('.assist-side-item').forEach(item=>{
      const title=item.querySelector('b')?.textContent||'';
      const small=item.querySelector('small');
      if(!small)return;
      if(title.includes('إضافة خيارات')) small.innerHTML='تحوّل السؤال إلى 4 خيارات <b>وقيمته تصبح 50 نقطة</b>';
      else if(title.includes('غير السؤال')||title.includes('50/50')||title.includes('تلميح')) small.innerHTML+= ' · <b>قيمة السؤال تصبح 100 نقطة</b>';
    });
    const side=document.querySelector('.setup-side-v16');
    if(side&&!side.querySelector('.assist-side-item.time-assist-rule')){
      const change=[...side.querySelectorAll('.assist-side-item')].find(x=>(x.textContent||'').includes('غير السؤال'));
      const item=document.createElement('div');item.className='assist-side-item time-assist-rule';
      item.innerHTML='<span class="assist-icon">⏱️</span><div><b>+15 ثانية</b><small>تضيف 15 ثانية للسؤال · <b>قيمة السؤال تصبح 100 نقطة</b></small></div>';
      if(change)change.after(item); else side.appendChild(item);
    }
    const main=document.querySelector('.setup-reference');
    if(main&&!main.querySelector('.assistance-rule-banner')){
      const banner=document.createElement('div');banner.className='assistance-rule-banner';
      banner.innerHTML='<strong>قانون المساعدات:</strong> استخدام أي مساعدة يجعل قيمة السؤال <b>100 نقطة</b>، أما <b>إضافة خيارات</b> فتجعل قيمته <b>50 نقطة</b>.';
      const start=document.getElementById('begin');
      if(start)main.insertBefore(banner,start);
    }
  };

  if(state.screen==='setup')render();
  console.info('Laffha V43 assistance scoring ready');
})();