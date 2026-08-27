// Laffha V56/V62 — integrated Host + phone-controller multiplayer mode.
// Compatible with legacy banks and the sanitized V62 bank.
(function(){
  const RT=window.LaffhaRealtime;
  if(!RT||typeof state==='undefined'||typeof render!=='function')return;
  const {client,ensureSession,readableError}=RT;
  const oldRender=render;
  const oldSetup=setup;
  const oldPickQuestion=pickQuestion;
  const oldNextTurn=nextTurn;
  let lobbyChannel=null;
  let actionChannel=null;
  let syncChain=Promise.resolve();
  let spinWatcher=null;

  state.playMode=state.playMode||'solo';
  state.multiRoom=state.multiRoom||null;
  state.multiUser=state.multiUser||null;
  state.multiRevision=Number(state.multiRevision||0);
  state.multiConnectedTeams=state.multiConnectedTeams||[];
  state.multiActiveTeams=state.multiActiveTeams||[];
  state.multiTestMode=!!state.multiTestMode;

  const teamPayload=()=>state.teams.map((t,i)=>({teamNo:i+1,name:t.name,color:t.color,members:t.members||[],score:t.score||0}));
  const isMulti=()=>state.playMode==='multi';
  const isMultiPlaying=()=>isMulti()&&state.multiRoom&&state.multiRoom.status==='playing';
  const code4=()=>String(Math.floor(1000+Math.random()*9000));
  const controllerBase=()=>new URL('controller.html',window.location.href).toString();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const answerButtons=()=>[...document.querySelectorAll('[data-secure-answer],[data-answer]')];
  const answerValue=b=>String(b?.dataset?.secureAnswer??b?.dataset?.answer??'');

  function currentControllerUrl(){
    if(!state.multiRoom)return controllerBase();
    const u=new URL(controllerBase());u.searchParams.set('room',state.multiRoom.code);return u.toString();
  }

  function clearMultiUi(){
    document.body.classList.remove('laffha-multi-host');
    document.getElementById('multiHostBadge')?.remove();
  }

  function injectPlayMode(){
    const begin=document.getElementById('begin');
    if(!begin||document.querySelector('.play-mode-switch'))return;
    const box=document.createElement('div');
    box.className='play-mode-switch';
    box.innerHTML=`<h3>طريقة اللعب</h3><div class="play-mode-options">
      <button class="play-mode-btn ${state.playMode==='solo'?'active':''}" data-play-mode="solo">🎮 لعب على جهاز واحد<small>نفس طريقة لفّها الحالية</small></button>
      <button class="play-mode-btn ${state.playMode==='multi'?'active':''}" data-play-mode="multi">📱 لعب بالجوالات<small>اللابتوب عرض والجوالات كنترول</small></button>
    </div>`;
    begin.parentNode.insertBefore(box,begin);
    box.querySelectorAll('[data-play-mode]').forEach(btn=>btn.onclick=()=>{state.playMode=btn.dataset.playMode;render();});
  }

  setup=function(){
    clearMultiUi();
    oldSetup();
    injectPlayMode();
    const begin=document.getElementById('begin');
    if(!begin)return;
    const soloBegin=begin.onclick;
    begin.textContent=state.playMode==='multi'?'أنشئ غرفة وابدأ 📱':'ابدأ اللعبة 🎉';
    begin.onclick=()=>{
      if(state.playMode!=='multi'){soloBegin&&soloBegin();return;}
      createMultiplayerRoom();
    };
  };

  async function createMultiplayerRoom(){
    const begin=document.getElementById('begin');
    if(begin){begin.disabled=true;begin.textContent='جاري إنشاء الغرفة…';}
    try{
      state.playerNamesText=document.getElementById('playerNames')?.value||state.playerNamesText||'';
      try{if(typeof laffhaPlayerNames==='function'&&laffhaPlayerNames().length&&typeof laffhaDistributionFresh==='function'&&!laffhaDistributionFresh()&&typeof laffhaDistributePlayers==='function')laffhaDistributePlayers();}catch(_){ }
      state.currentTeam=0;state.currentRound=1;state.usedQuestions=new Set();
      state.teams.forEach(t=>{t.score=0;t.lifelines={hint:true,fifty:true,time:true,change:true};});
      state.multiUser=await ensureSession();

      if(state.multiRoom?.id){try{await client.from('rooms').update({status:'finished'}).eq('id',state.multiRoom.id);}catch(_){}}
      let created=null,lastError=null;
      for(let i=0;i<10&&!created;i++){
        const {data,error}=await client.from('rooms').insert({code:code4(),host_user_id:state.multiUser.id,max_teams:state.teamCount}).select('*').single();
        if(!error)created=data;else if(error.code!=='23505'){lastError=error;break;}
      }
      if(!created)throw lastError||new Error('تعذر إنشاء رمز غرفة فريد');
      const lobbyPayload={teams:teamPayload(),rounds:state.rounds,mode:'multiplayer-v62'};
      const {error:gsError}=await client.from('game_state').insert({room_id:created.id,phase:'lobby',current_team:1,current_round:1,revision:1,question_payload:lobbyPayload});
      if(gsError){await client.from('rooms').delete().eq('id',created.id);throw gsError;}
      state.multiRoom=created;state.multiRevision=1;state.multiConnectedTeams=[];state.multiActiveTeams=[];state.multiTestMode=false;
      localStorage.setItem('laffhaMultiHostRoom',created.id);
      state.screen='multiLobby';
      await startLobbySubscription();
      render();
    }catch(error){
      toast(`تعذر إنشاء الغرفة: ${readableError(error)}`);
      if(begin){begin.disabled=false;begin.textContent='أنشئ غرفة وابدأ 📱';}
    }
  }

  async function startLobbySubscription(){
    if(!state.multiRoom)return;
    if(lobbyChannel)await client.removeChannel(lobbyChannel);
    lobbyChannel=client.channel(`laffha-lobby-${state.multiRoom.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'room_teams',filter:`room_id=eq.${state.multiRoom.id}`},loadLobbyTeams)
      .subscribe();
    await loadLobbyTeams();
  }

  async function loadLobbyTeams(){
    if(!state.multiRoom)return;
    const {data}=await client.from('room_teams').select('team_no,name,connected').eq('room_id',state.multiRoom.id).order('team_no');
    state.multiConnectedTeams=(data||[]).filter(x=>x.connected).map(x=>Number(x.team_no));
    updateLobbyDom();
  }

  function updateLobbyDom(){
    if(state.screen!=='multiLobby')return;
    state.teams.forEach((_,i)=>{
      const el=document.getElementById(`multiTeamStatus${i+1}`);if(!el)return;
      const yes=state.multiConnectedTeams.includes(i+1);el.textContent=yes?'متصل ✓':'في الانتظار';el.className=`multi-team-status ${yes?'connected':''}`;
    });
    const start=document.getElementById('multiStart');
    if(start)start.disabled=state.multiConnectedTeams.length<state.teamCount;
    const test=document.getElementById('multiTestStart');
    if(test)test.disabled=state.multiConnectedTeams.length<1||state.multiConnectedTeams.length>=state.teamCount;
  }

  function renderMultiLobby(){
    clearMultiUi();
    const url=currentControllerUrl();
    shell(`<div class="multi-lobby">
      <section class="card multi-lobby-card">
        <div class="turn-label">اللعب بالجوالات</div><h1>اربطوا جوالات الفرق</h1>
        <p class="muted">كل فريق يمسح الـQR أو يفتح الرابط ثم يختار فريقه. اللابتوب بيكون شاشة عرض فقط.</p>
        <div class="multi-team-list">${state.teams.map((t,i)=>`<div class="multi-team-row"><div class="multi-team-info"><span class="multi-team-dot" style="background:${t.color}"></span><div><strong>${esc(t.name)}</strong>${t.members?.length?`<small style="display:block;color:#8b8195;margin-top:3px">${t.members.map(esc).join(' • ')}</small>`:''}</div></div><span class="multi-team-status" id="multiTeamStatus${i+1}">في الانتظار</span></div>`).join('')}</div>
        <div class="multi-lobby-actions"><button class="btn btn-primary btn-lg" id="multiStart" disabled>ابدأ اللعبة بعد اتصال كل الفرق</button><button class="btn btn-soft" id="multiTestStart" disabled>تخطي الفرق الباقية — اختبار بجوال واحد</button></div>
        <div class="multi-test-note">زر التخطي للتجربة فقط. في اللعب الحقيقي لازم كل فريق يكون عنده جوال متصل.</div>
      </section>
      <aside class="card multi-code-card"><div class="label">رمز الغرفة</div><div class="multi-room-code">${state.multiRoom.code}</div><div class="multi-qr" id="multiQr"></div><button class="btn btn-soft" id="copyControllerLink">نسخ رابط الدخول</button><div class="multi-join-link">${esc(url)}</div></aside>
    </div>`);
    const qr=document.getElementById('multiQr');
    if(window.QRCode&&qr)new QRCode(qr,{text:url,width:166,height:166,correctLevel:QRCode.CorrectLevel.M});
    else if(qr)qr.innerHTML=`<a href="${esc(url)}">فتح رابط الدخول</a>`;
    document.getElementById('copyControllerLink').onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('تم نسخ رابط الدخول ✓');}catch(_){toast('انسخي الرابط الظاهر يدويًا');}};
    document.getElementById('multiStart').onclick=()=>beginRemoteGame(false);
    document.getElementById('multiTestStart').onclick=()=>beginRemoteGame(true);
    updateLobbyDom();
  }

  async function beginRemoteGame(testMode){
    const connected=[...state.multiConnectedTeams].sort((a,b)=>a-b);
    if(!connected.length){toast('لازم يتصل جوال واحد على الأقل');return;}
    if(!testMode&&connected.length<state.teamCount){toast('انتظروا اتصال كل الفرق');return;}
    state.multiTestMode=!!testMode;
    state.multiActiveTeams=testMode?connected:Array.from({length:state.teamCount},(_,i)=>i+1);
    if(!state.multiActiveTeams.includes(state.currentTeam+1))state.currentTeam=state.multiActiveTeams[0]-1;
    const {error}=await client.from('rooms').update({status:'playing'}).eq('id',state.multiRoom.id);
    if(error){toast(readableError(error));return;}
    state.multiRoom={...state.multiRoom,status:'playing'};
    if(lobbyChannel){await client.removeChannel(lobbyChannel);lobbyChannel=null;}
    subscribeActions();
    state.screen='spin';render();
  }

  function phaseForScreen(){
    if(state.screen==='spin'){
      const btn=document.getElementById('spinBtn');
      return btn&&(btn.classList.contains('points-ready')||/ابدأ السؤال/.test(btn.textContent||''))?'start_question':'spin';
    }
    if(state.screen==='question')return 'question';
    if(state.screen==='result')return 'result';
    if(state.screen==='final')return 'finished';
    return state.screen;
  }

  function payloadForPhase(phase){
    const base={teamNo:state.currentTeam+1,teamName:state.teams[state.currentTeam]?.name||'',round:state.currentRound,rounds:state.rounds,scores:teamPayload()};
    if(phase==='spin')return {...base,message:'دوركم — اضغطوا لفّها'};
    if(phase==='start_question')return {...base,category:CATS[state.selectedCategory]?.name||'',categoryEmoji:CATS[state.selectedCategory]?.emoji||'',points:state.drawnPoints||state.currentQuestion?.points||0,difficulty:state.drawnDifficulty||''};
    if(phase==='question'){
      const q=state.currentQuestion||{};
      const options=answerButtons().filter(b=>!b.classList.contains('hidden-answer')).map(answerValue).filter(Boolean);
      return {...base,questionText:q.questionText||'',questionType:q.questionType||'',category:CATS[q.category]?.name||'',points:Number(state.currentAwardPoints??q.points??0),options};
    }
    if(phase==='result')return {...base,status:state.lastResult,points:Number(state.currentAwardPoints??state.currentQuestion?.points??0)};
    if(phase==='finished')return {...base,ranking:[...state.teams].sort((a,b)=>b.score-a.score).map(t=>({name:t.name,score:t.score}))};
    return base;
  }

  function syncHostState(forcedPhase){
    if(!isMultiPlaying())return Promise.resolve();
    const phase=forcedPhase||phaseForScreen();
    const payload=payloadForPhase(phase);
    syncChain=syncChain.then(async()=>{
      const next=Number(state.multiRevision||0)+1;
      const q=state.currentQuestion||{};
      const {error}=await client.from('game_state').update({
        phase,current_team:state.currentTeam+1,current_round:state.currentRound,
        selected_category:state.selectedCategory||null,selected_difficulty:state.drawnDifficulty||q.difficulty||null,
        question_id:q.questionID||null,question_payload:payload,deadline:state.deadline?new Date(state.deadline).toISOString():null,
        revision:next,updated_at:new Date().toISOString()
      }).eq('room_id',state.multiRoom.id);
      if(!error)state.multiRevision=next;
      if(phase==='finished')await client.from('rooms').update({status:'finished'}).eq('id',state.multiRoom.id);
    }).catch(err=>console.warn('Laffha multiplayer sync',err));
    return syncChain;
  }

  function decorateHost(){
    document.body.classList.add('laffha-multi-host');
    if(!document.getElementById('multiHostBadge')){
      const badge=document.createElement('div');badge.id='multiHostBadge';badge.className='multi-host-badge';badge.textContent='📱 التحكم من جوال الفريق';document.body.appendChild(badge);
    }
  }

  function subscribeActions(){
    if(!state.multiRoom)return;
    if(actionChannel)client.removeChannel(actionChannel);
    actionChannel=client.channel(`laffha-actions-${state.multiRoom.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${state.multiRoom.id}`},event=>handleAction(event.new))
      .subscribe();
  }

  function handleAction(action){
    if(!isMultiPlaying())return;
    if(Number(action.team_no)!==state.currentTeam+1||Number(action.revision)!==Number(state.multiRevision))return;
    const type=action.action_type,payload=action.payload||{};
    if(type==='spin'&&state.screen==='spin'){
      const btn=document.getElementById('spinBtn');
      if(btn&&!btn.classList.contains('points-ready')){btn.click();watchSpinReady();}
      return;
    }
    if(type==='start_question'&&state.screen==='spin'){
      const btn=document.getElementById('spinBtn');if(btn&&(btn.classList.contains('points-ready')||/ابدأ السؤال/.test(btn.textContent||'')))btn.click();return;
    }
    if(type==='answer'&&state.screen==='question'){
      if(payload.typed===true)return; // V62 typed handler verifies it server-side.
      const wanted=String(payload.answer??'');
      const btn=answerButtons().find(b=>answerValue(b)===wanted);
      if(btn)btn.click();
      return;
    }
    if(type==='next'&&state.screen==='result')document.getElementById('next')?.click();
  }

  function watchSpinReady(){
    clearInterval(spinWatcher);
    let tries=0;
    spinWatcher=setInterval(()=>{
      tries++;
      if(state.screen!=='spin'||tries>80){clearInterval(spinWatcher);return;}
      const btn=document.getElementById('spinBtn');
      if(btn&&(btn.classList.contains('points-ready')||/ابدأ السؤال/.test(btn.textContent||''))){clearInterval(spinWatcher);syncHostState('start_question');}
    },100);
  }

  pickQuestion=function(diff,excludeCurrent=false){
    if(!isMultiPlaying())return oldPickQuestion(diff,excludeCurrent);
    const full=[...QUESTIONS];
    const compatible=full.filter(q=>q.category===state.selectedCategory&&q.difficulty===diff&&['mcq','logo'].includes(q.questionType));
    if(!compatible.length)return oldPickQuestion(diff,excludeCurrent);
    try{
      QUESTIONS.splice(0,QUESTIONS.length,...compatible);
      return oldPickQuestion(diff,excludeCurrent);
    }finally{
      QUESTIONS.splice(0,QUESTIONS.length,...full);
    }
  };

  nextTurn=function(){
    if(!isMultiPlaying()||!state.multiTestMode)return oldNextTurn();
    const active=state.multiActiveTeams||[];
    if(!active.length)return oldNextTurn();
    let team=state.currentTeam,round=state.currentRound,guard=0;
    do{
      team++;
      if(team>=state.teams.length){team=0;round++;}
      guard++;
    }while(!active.includes(team+1)&&guard<=state.teams.length+1);
    state.currentTeam=team;state.currentRound=round;
    state.screen=state.currentRound>state.rounds?'final':'spin';render();
  };

  render=function(){
    if(state.screen==='multiLobby'){renderMultiLobby();return;}
    oldRender();
    if(isMultiPlaying()&&['spin','question','result','final'].includes(state.screen)){
      decorateHost();
      if(!(state.screen==='spin'&&document.getElementById('spinBtn')?.classList.contains('points-ready')))setTimeout(()=>syncHostState(),0);
    }else if(!isMulti())clearMultiUi();
  };

  if(state.screen==='setup')render();
  console.info('Laffha V62-compatible multiplayer host ready');
})();