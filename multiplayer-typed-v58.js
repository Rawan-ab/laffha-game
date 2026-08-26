// V58 — typed answer support for visual/logo questions in multiplayer.
(function(){
  if(!window.LaffhaRealtime||typeof state==='undefined')return;
  const client=window.LaffhaRealtime.client;
  let channel=null,roomId=null;
  const handled=new Set();

  function norm(v){
    return String(v??'')
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
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

  function isVisual(){
    const q=state.currentQuestion;
    return !!q&&(q.questionType==='logo'||q.category==='logos');
  }

  function hideHostChoices(){
    if(state.playMode!=='multi'||state.screen!=='question'||!isVisual())return;
    document.querySelectorAll('.question-card .answers,[data-answer]').forEach(el=>el.style.display='none');
    const card=document.querySelector('.question-card');
    if(card&&!card.querySelector('.v58-phone-answer-note')){
      const note=document.createElement('div');
      note.className='v58-phone-answer-note';
      note.textContent='الإجابة تُكتب من جوال الفريق';
      note.style.cssText='margin:16px 0;padding:12px 14px;border:1px dashed #d6c7e9;border-radius:14px;text-align:center;color:#766a80;background:#faf7fd;font-weight:700';
      const lifelines=card.querySelector('.lifelines');
      if(lifelines)card.insertBefore(note,lifelines);else card.appendChild(note);
    }
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
        const typedEvent=a?.action_type==='typed_answer'||(a?.action_type==='answer'&&a?.payload?.typed===true);
        if(!a||!typedEvent||handled.has(a.id))return;
        handled.add(a.id);
        if(state.screen!=='question'||Number(a.team_no)!==state.currentTeam+1||Number(a.revision)!==Number(state.multiRevision))return;
        const q=state.currentQuestion;
        if(!q||!isVisual())return;
        const typed=String(a.payload?.answer??'');
        const ok=closeEnough(typed,q.correctAnswer);
        finishQuestion(ok?'correct':'wrong');
      })
      .subscribe();
  }

  const oldQuestion=window.question;
  if(typeof oldQuestion==='function'){
    window.question=function(){oldQuestion();setTimeout(hideHostChoices,0);};
  }

  setInterval(()=>{attach();hideHostChoices();},700);
  console.info('Laffha V58 typed visual answers ready');
})();