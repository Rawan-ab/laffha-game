// Laffha V58 — typed answers for خمن الصورة in multiplayer mode.
(function(){
  const RT=window.LaffhaRealtime;
  if(!RT||!RT.client)return;
  const client=RT.client;
  let channel=null,roomId=null;
  const seen=new Set();

  const norm=s=>String(s??'')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
    .replace(/[أإآٱ]/g,'ا')
    .replace(/ى/g,'ي')
    .replace(/ة/g,'ه')
    .replace(/ؤ/g,'و')
    .replace(/ئ/g,'ي')
    .replace(/[^\p{L}\p{N}]+/gu,'')
    .trim();

  function equivalent(a,b){
    const x=norm(a),y=norm(b);
    if(!x||!y)return false;
    if(x===y)return true;
    const noAl=z=>z.replace(/^ال/,'');
    return noAl(x)===noAl(y);
  }

  function isGuessQuestion(){
    const q=window.state?.currentQuestion;
    return !!q&&(q.category==='logos'||q.questionType==='logo');
  }

  function hideHostChoices(){
    if(!window.state||state.playMode!=='multi'||state.screen!=='question'||!isGuessQuestion())return;
    document.querySelectorAll('.question-card .answers,[data-answer]').forEach(el=>{el.style.display='none';});
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

  async function connect(){
    const room=window.state?.multiRoom;
    if(!room?.id||room.status!=='playing'||room.id===roomId)return;
    roomId=room.id;
    if(channel)await client.removeChannel(channel);
    channel=client.channel(`laffha-v58-logo-${roomId}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${roomId}`},evt=>{
        const a=evt.new;
        if(!a||a.action_type!=='answer'||seen.has(a.id))return;
        seen.add(a.id);
        if(!window.state||state.screen!=='question'||!isGuessQuestion())return;
        if(Number(a.team_no)!==Number(state.currentTeam)+1)return;
        const typed=String(a.payload?.answer??'').trim();
        if(!typed)return;
        const correct=equivalent(typed,state.currentQuestion?.correctAnswer);
        if(typeof window.finishQuestion==='function')window.finishQuestion(correct?'correct':'wrong');
      }).subscribe();
  }

  const oldQuestion=window.question;
  if(typeof oldQuestion==='function'){
    window.question=function(){
      oldQuestion();
      setTimeout(hideHostChoices,0);
    };
  }

  setInterval(()=>{connect();hideHostChoices();},700);
  console.info('Laffha V58 typed Guess the Image answers ready');
})();