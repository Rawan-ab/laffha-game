// V58 — typed answer support for visual/logo questions in multiplayer.
(function(){
  if(!window.LaffhaRealtime||typeof state==='undefined')return;
  const client=window.LaffhaRealtime.client;
  let channel=null,roomId=null;
  const handled=new Set();

  function norm(v){
    return String(v??'')
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670]/g,'')
      .replace(/[إأآٱ]/g,'ا')
      .replace(/ى/g,'ي')
      .replace(/ؤ/g,'و')
      .replace(/ئ/g,'ي')
      .replace(/ة/g,'ه')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function closeEnough(a,b){
    a=norm(a);b=norm(b);
    if(!a||!b)return false;
    if(a===b)return true;
    if(a.replace(/^ال\s*/,'')===b.replace(/^ال\s*/,''))return true;
    return false;
  }

  function attach(){
    const room=state.multiRoom;
    if(!room?.id||room.status!=='playing')return;
    if(roomId===room.id&&channel)return;
    if(channel)client.removeChannel(channel);
    roomId=room.id;
    channel=client.channel(`laffha-typed-v58-${room.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${room.id}`},event=>{
        const a=event.new;
        if(!a||a.action_type!=='typed_answer'||handled.has(a.id))return;
        handled.add(a.id);
        if(state.screen!=='question'||Number(a.team_no)!==state.currentTeam+1||Number(a.revision)!==Number(state.multiRevision))return;
        const q=state.currentQuestion;
        if(!q||q.questionType!=='logo')return;
        const typed=String(a.payload?.answer??'');
        const ok=closeEnough(typed,q.correctAnswer);
        finishQuestion(ok?'correct':'wrong');
      })
      .subscribe();
  }

  setInterval(attach,800);
  console.info('Laffha V58 typed visual answers ready');
})();