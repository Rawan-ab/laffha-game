// V65 — fast multiplayer: phones drive the game, laptop is display only.
(function(){
  const RT=window.LaffhaRealtime;
  if(!RT||typeof state==='undefined'||typeof render!=='function')return;
  const client=RT.client;
  let actionChannel=null, roomId=null, lastActionId=null, transitionBusy=false;

  const isMulti=()=>state.playMode==='multi'&&state.multiRoom?.id&&state.multiRoom?.status==='playing';
  const activeTeam=()=>Number(state.currentTeam||0)+1;
  const answerButtons=()=>[...document.querySelectorAll('[data-secure-answer],[data-answer]')];
  const answerValue=b=>String(b?.dataset?.secureAnswer??b?.dataset?.answer??'');

  function attach(){
    const room=state.multiRoom;
    if(!room?.id||room.status!=='playing')return;
    if(roomId===room.id&&actionChannel)return;
    if(actionChannel)client.removeChannel(actionChannel);
    roomId=room.id;
    actionChannel=client.channel(`laffha-fast-actions-v65-${room.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${room.id}`},e=>handle(e.new))
      .subscribe();
  }

  async function handle(a){
    if(!a||!isMulti()||a.id===lastActionId)return;
    if(Number(a.team_no)!==activeTeam()||Number(a.revision)!==Number(state.multiRevision))return;
    lastActionId=a.id;
    const type=a.action_type,p=a.payload||{};
    if(type==='spin'&&state.screen==='spin'){
      document.getElementById('spinBtn')?.click();
      return;
    }
    if(type==='start_question'&&state.screen==='spin'){
      const btn=document.getElementById('spinBtn');
      if(btn&&!btn.disabled)btn.click();
      return;
    }
    if(type==='answer'&&state.screen==='question'){
      if(p.typed===true){
        try{
          const ok=await window.laffhaSecureVerify(String(p.answer??''));
          if(state.screen==='question')finishQuestion(ok?'correct':'wrong');
        }catch(e){console.warn('V65 typed verify',e);if(typeof toast==='function')toast('تعذر التحقق من الإجابة');}
        return;
      }
      const wanted=String(p.answer??'');
      const btn=answerButtons().find(b=>answerValue(b)===wanted);
      if(btn)btn.click();
      return;
    }
    if(type==='next'&&state.screen==='result')document.getElementById('next')?.click();
  }

  // Start automatically as soon as every configured team has joined.
  const autoStartObserver=new MutationObserver(()=>{
    if(state.screen!=='multiLobby'||transitionBusy)return;
    const start=document.getElementById('multiStart');
    if(!start||start.disabled)return;
    transitionBusy=true;
    start.textContent='كل الفرق متصلة ✓ جاري البدء…';
    setTimeout(()=>{start.click();transitionBusy=false;},180);
  });
  autoStartObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','class']});

  // Make result -> next team automatic. Phones no longer need a second tap.
  const baseRender=window.render;
  window.render=function(){
    baseRender();
    attach();
    if(isMulti()&&state.screen==='result'){
      const stamp=`${state.multiRoom.id}:${state.currentRound}:${state.currentTeam}:${state.currentQuestion?.questionID||''}:${state.lastResult||''}`;
      if(state._v65AutoNext!==stamp){
        state._v65AutoNext=stamp;
        setTimeout(()=>{
          if(isMulti()&&state.screen==='result')document.getElementById('next')?.click();
        },850);
      }
    }
  };

  // Attach without a polling interval whenever the room becomes active.
  const roomWatch=new MutationObserver(attach);
  roomWatch.observe(document.documentElement,{subtree:true,childList:true});
  attach();
  console.info('Laffha V65 instant multiplayer flow ready');
})();
