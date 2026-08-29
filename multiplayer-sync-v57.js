// V57/V62 — multiplayer state sync guard without exposing correct answers.
(function(){
  const RT=window.LaffhaRealtime;
  if(!RT||typeof state==='undefined')return;
  const {client}=RT;
  let syncing=false;
  let lastSignature='';

  const isPlaying=()=>state.playMode==='multi'&&state.multiRoom?.id&&state.multiRoom?.status==='playing';
  const teamPayload=()=>state.teams.map((t,i)=>({teamNo:i+1,name:t.name,color:t.color,members:t.members||[],score:t.score||0}));
  const answerButtons=()=>[...document.querySelectorAll('[data-secure-answer],[data-answer]')];
  const answerValue=b=>String(b?.dataset?.secureAnswer??b?.dataset?.answer??'');

  function detectPhase(){
    if(state.screen==='spin'){
      const btn=document.getElementById('spinBtn');
      if(btn&&(btn.classList.contains('points-ready')||/ابدأ السؤال/.test(btn.textContent||'')))return 'start_question';
      return 'spin';
    }
    if(state.screen==='question')return 'question';
    if(state.screen==='result')return 'result';
    if(state.screen==='final')return 'finished';
    return null;
  }

  function payload(phase){
    const base={teamNo:state.currentTeam+1,teamName:state.teams[state.currentTeam]?.name||'',round:state.currentRound,rounds:state.rounds,scores:teamPayload()};
    if(phase==='spin')return {...base,message:'دوركم — اضغطوا لفّها'};
    if(phase==='start_question')return {...base,category:CATS[state.selectedCategory]?.name||'',categoryEmoji:CATS[state.selectedCategory]?.emoji||'',points:state.drawnPoints||state.currentQuestion?.points||0,difficulty:state.drawnDifficulty||''};
    if(phase==='question'){
      const q=state.currentQuestion||{};
      const options=answerButtons().filter(b=>!b.classList.contains('hidden-answer')).map(answerValue).filter(Boolean);
      const life=state.teams[state.currentTeam]?.lifelines||{};
      const lifelines={hint:life.hint!==false,time:life.time!==false,change:life.change!==false,choices:q.questionType!=='mcq'&&life.choices!==false};
      const activeHint=document.getElementById('hintBox')?.innerText?.replace(/^💡\s*تلميح\s*/,'').trim()||'';
      return {...base,questionText:q.questionText||'',questionType:q.questionType||'',category:CATS[q.category]?.name||'',points:Number(state.currentAwardPoints??q.points??0),options,lifelines,activeHint};
    }
    if(phase==='result')return {...base,status:state.lastResult,answeredByTeam:base.teamNo,points:Number(state.currentAwardPoints??state.currentQuestion?.points??0)};
    if(phase==='finished')return {...base,ranking:[...state.teams].sort((a,b)=>b.score-a.score).map(t=>({name:t.name,score:t.score}))};
    return base;
  }

  async function reconcile(force=false){
    if(syncing||!isPlaying())return;
    const phase=detectPhase();if(!phase)return;
    const signature=[phase,state.currentTeam,state.currentRound,state.selectedCategory||'',state.currentQuestion?.questionID||'',state.lastResult||''].join('|');
    if(!force&&signature===lastSignature&&phase!=='start_question')return;
    syncing=true;
    try{
      const {data:db,error:readError}=await client.from('game_state').select('phase,revision,current_team,current_round,question_id,selected_category').eq('room_id',state.multiRoom.id).maybeSingle();
      if(readError||!db)return;
      state.multiRevision=Number(db.revision||state.multiRevision||0);
      const same=db.phase===phase&&Number(db.current_team)===state.currentTeam+1&&Number(db.current_round)===state.currentRound&&String(db.question_id||'')===String(state.currentQuestion?.questionID||'')&&String(db.selected_category||'')===String(state.selectedCategory||'');
      if(same){lastSignature=signature;return;}
      const next=Number(db.revision||0)+1;
      const q=state.currentQuestion||{};
      const {error}=await client.from('game_state').update({
        phase,
        current_team:state.currentTeam+1,
        current_round:state.currentRound,
        selected_category:state.selectedCategory||null,
        selected_difficulty:state.drawnDifficulty||q.difficulty||null,
        question_id:q.questionID||null,
        question_payload:payload(phase),
        deadline:state.deadline?new Date(state.deadline).toISOString():null,
        revision:next,
        updated_at:new Date().toISOString()
      }).eq('room_id',state.multiRoom.id);
      if(error){console.warn('Laffha V57 sync guard update failed',error);return;}
      state.multiRevision=next;
      lastSignature=signature;
    }catch(err){console.warn('Laffha V57 sync guard',err);}finally{syncing=false;}
  }

  const observer=new MutationObserver(()=>reconcile());
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
  setInterval(()=>reconcile(true),1500);
  window.addEventListener('focus',()=>reconcile(true));
  console.info('Laffha V62-safe multiplayer sync guard ready');
})();