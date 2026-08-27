// V62 — typed visual answers are verified server-side.
(function(){
  if(!window.LaffhaRealtime||typeof state==='undefined')return;
  const client=window.LaffhaRealtime.client;
  let channel=null,roomId=null;
  const handled=new Set();
  const isVisual=()=>!!state.currentQuestion&&(state.currentQuestion.questionType==='logo'||state.currentQuestion.category==='logos');

  function attach(){
    const room=state.multiRoom;
    if(!room?.id||room.status!=='playing')return;
    if(roomId===room.id&&channel)return;
    if(channel)client.removeChannel(channel);
    roomId=room.id;
    channel=client.channel(`laffha-typed-secure-v62-${room.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${room.id}`},async event=>{
        const a=event.new;
        const typed=a?.action_type==='typed_answer'||(a?.action_type==='answer'&&a?.payload?.typed===true);
        if(!a||!typed||handled.has(a.id))return;
        handled.add(a.id);
        if(state.screen!=='question'||!isVisual())return;
        if(Number(a.team_no)!==state.currentTeam+1||Number(a.revision)!==Number(state.multiRevision))return;
        try{
          const ok=await window.laffhaSecureVerify(String(a.payload?.answer??''));
          finishQuestion(ok?'correct':'wrong');
        }catch(error){console.warn('Secure typed verification failed',error);toast('تعذر التحقق من الإجابة، حاولوا مرة ثانية');}
      }).subscribe();
  }
  setInterval(attach,700);
  console.info('Laffha V62 secure typed answers ready');
})();