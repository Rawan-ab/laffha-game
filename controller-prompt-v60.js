// V60 — mirror the explicit visual prompt on the phone controller.
(function(){
  if(!/controller\.html$/i.test(location.pathname)||!window.LaffhaRealtime)return;
  const client=window.LaffhaRealtime.client;
  const roomCode=(new URLSearchParams(location.search).get('room')||'').trim().toUpperCase();
  let roomId=null,lastRevision=null;
  async function room(){if(roomId)return roomId;if(roomCode.length!==4)return null;const {data}=await client.from('rooms').select('id').eq('code',roomCode).maybeSingle();roomId=data?.id||null;return roomId;}
  async function syncPrompt(){
    const id=await room();if(!id)return;
    const {data}=await client.from('game_state').select('phase,revision,question_payload').eq('room_id',id).maybeSingle();
    if(!data||data.phase!=='question')return;
    const p=data.question_payload||{};if(p.questionType!=='logo')return;
    const prompt=String(p.questionText||'').trim();if(!prompt||prompt==='خمن الصورة')return;
    const el=document.querySelector('#gameContent .question-text');
    if(el&&['ما هو المعلم؟','ما هو الشعار؟'].includes(prompt))el.textContent=prompt;
    lastRevision=data.revision;
  }
  setInterval(syncPrompt,800);setTimeout(syncPrompt,700);
})();