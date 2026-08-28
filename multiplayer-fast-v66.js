// V66 — broadcast-first multiplayer. Phones drive the game instantly; DB is fallback only.
(function(){
  const RT=window.LaffhaRealtime;
  if(!RT||typeof state==='undefined'||typeof render!=='function')return;
  const client=RT.client;
  let fastChannel=null,roomId=null,transitionBusy=false,broadcastTimer=null;
  const seen=new Set();

  const isMulti=()=>state.playMode==='multi'&&state.multiRoom?.id&&state.multiRoom?.status==='playing';
  const activeTeam=()=>Number(state.currentTeam||0)+1;
  const esc=s=>String(s??'');
  const answerButtons=()=>[...document.querySelectorAll('[data-secure-answer],[data-answer]')];
  const answerValue=b=>String(b?.dataset?.secureAnswer??b?.dataset?.answer??'');
  const teamPayload=()=>state.teams.map((t,i)=>({teamNo:i+1,name:t.name,color:t.color,members:t.members||[],score:t.score||0}));

  function phase(){
    if(state.screen==='spin'){
      const b=document.getElementById('spinBtn');
      return b&&(b.classList.contains('points-ready')||/ابدأ السؤال/.test(b.textContent||''))?'start_question':'spin';
    }
    if(state.screen==='question')return 'question';
    if(state.screen==='result')return 'result';
    if(state.screen==='final')return 'finished';
    return state.screen;
  }

  function payloadFor(ph){
    const q=state.currentQuestion||{};
    const base={teamNo:activeTeam(),teamName:state.teams[state.currentTeam]?.name||'',round:state.currentRound,rounds:state.rounds,scores:teamPayload()};
    if(ph==='spin')return {...base,message:'دوركم — اضغطوا لفّها'};
    if(ph==='start_question')return {...base,category:CATS[state.selectedCategory]?.name||'',categoryEmoji:CATS[state.selectedCategory]?.emoji||'',points:state.drawnPoints||q.points||0,difficulty:state.drawnDifficulty||''};
    if(ph==='question'){
      const options=answerButtons().filter(b=>!b.classList.contains('hidden-answer')).map(answerValue).filter(Boolean);
      return {...base,questionText:q.questionText||'',questionType:q.questionType||'',category:CATS[q.category]?.name||'',points:Number(state.currentAwardPoints??q.points??0),options};
    }
    if(ph==='result')return {...base,status:state.lastResult,points:Number(state.currentAwardPoints??q.points??0)};
    if(ph==='finished')return {...base,ranking:[...state.teams].sort((a,b)=>b.score-a.score).map(t=>({name:t.name,score:t.score}))};
    return base;
  }

  function attach(){
    const room=state.multiRoom;
    if(!room?.id||room.status!=='playing')return;
    if(roomId===room.id&&fastChannel)return;
    if(fastChannel)client.removeChannel(fastChannel);
    roomId=room.id;
    fastChannel=client.channel(`laffha-fast-v66-${room.id}`)
      .on('broadcast',{event:'action'},event=>handle(event.payload,true))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${room.id}`},event=>handle(event.new,false))
      .subscribe(status=>{
        if(status==='SUBSCRIBED')scheduleBroadcast(0);
      });
  }

  function actionKey(a){return String(a?.payload?.__fastId||a?.id||'');}
  async function handle(a,fromBroadcast){
    if(!a||!isMulti())return;
    const key=actionKey(a);if(key&&seen.has(key))return;if(key){seen.add(key);setTimeout(()=>seen.delete(key),12000);}
    // V66 intentionally does not block an action only because a DB revision reached one device first.
    if(Number(a.team_no)!==activeTeam())return;
    const type=a.action_type,p=a.payload||{};
    if(type==='spin'&&state.screen==='spin'){
      const btn=document.getElementById('spinBtn');if(btn&&!btn.disabled)btn.click();
      scheduleBroadcast(40);return;
    }
    if(type==='start_question'&&state.screen==='spin'){
      const btn=document.getElementById('spinBtn');if(btn&&!btn.disabled)btn.click();
      scheduleBroadcast(20);return;
    }
    if(type==='answer'&&state.screen==='question'){
      if(p.typed===true){
        try{const ok=await window.laffhaSecureVerify(String(p.answer??''));if(state.screen==='question')finishQuestion(ok?'correct':'wrong');}
        catch(e){console.warn('V66 typed verify',e);if(typeof toast==='function')toast('تعذر التحقق من الإجابة');}
        return;
      }
      const wanted=String(p.answer??'');
      const btn=answerButtons().find(b=>answerValue(b)===wanted);
      if(btn)btn.click();
      return;
    }
    if(type==='next'&&state.screen==='result')document.getElementById('next')?.click();
  }

  function broadcastState(){
    if(!isMulti()||!fastChannel)return;
    const ph=phase();
    fastChannel.send({type:'broadcast',event:'state',payload:{
      phase:ph,current_team:activeTeam(),current_round:state.currentRound,
      question_payload:payloadFor(ph),deadline:state.deadline?new Date(state.deadline).toISOString():null,
      revision:Number(state.multiRevision||0),sent_at:Date.now()
    }}).catch(()=>{});
  }
  function scheduleBroadcast(delay=25){clearTimeout(broadcastTimer);broadcastTimer=setTimeout(broadcastState,delay);}

  // Auto-start once every configured team is connected. Laptop remains display-only.
  const autoStartObserver=new MutationObserver(()=>{
    attach();
    if(state.screen!=='multiLobby'||transitionBusy)return;
    const start=document.getElementById('multiStart');
    if(!start||start.disabled)return;
    transitionBusy=true;start.textContent='كل الفرق متصلة ✓ جاري البدء…';
    setTimeout(()=>{start.click();transitionBusy=false;},120);
  });
  autoStartObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','class']});

  const baseRender=window.render;
  window.render=function(){
    baseRender();attach();scheduleBroadcast(10);
    if(isMulti()&&state.screen==='result'){
      const stamp=`${state.multiRoom.id}:${state.currentRound}:${state.currentTeam}:${state.currentQuestion?.questionID||''}:${state.lastResult||''}`;
      if(state._v66AutoNext!==stamp){
        state._v66AutoNext=stamp;
        setTimeout(()=>{if(isMulti()&&state.screen==='result')document.getElementById('next')?.click();},1050);
      }
    }
  };

  // Spin animation changes the DOM without a full render; debounce a broadcast when it reaches ready state.
  const appObserver=new MutationObserver(()=>{if(isMulti())scheduleBroadcast(35);});
  appObserver.observe(document.getElementById('app')||document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});

  attach();
  console.info('Laffha V66 broadcast-first multiplayer ready');
})();
