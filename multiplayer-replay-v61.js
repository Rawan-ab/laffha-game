// V61 — replay multiplayer in the SAME room without reconnecting phones.
(function(){
  if(!window.LaffhaRealtime || typeof state==='undefined' || typeof finalScreen!=='function') return;
  const client=window.LaffhaRealtime.client;
  const oldFinalScreen=finalScreen;

  const isMultiRoom=()=>state.playMode==='multi' && !!state.multiRoom?.id;
  const teamPayload=()=>state.teams.map((t,i)=>({
    teamNo:i+1,
    name:t.name,
    color:t.color,
    members:t.members||[],
    score:t.score||0
  }));

  async function replaySameRoom(button){
    if(!isMultiRoom()) return;
    if(button){button.disabled=true;button.textContent='جاري بدء لعبة جديدة…';}

    try{
      const active=(Array.isArray(state.multiActiveTeams)&&state.multiActiveTeams.length)
        ? [...state.multiActiveTeams]
        : Array.from({length:state.teamCount||state.teams.length},(_,i)=>i+1);
      const firstTeam=active.includes(1)?1:active[0]||1;

      state.currentTeam=firstTeam-1;
      state.currentRound=1;
      state.usedQuestions=new Set();
      state.currentQuestion=null;
      state.selectedCategory=null;
      state.drawnDifficulty=null;
      state.drawnPoints=null;
      state.currentAwardPoints=null;
      state.lastResult=null;
      state.deadline=null;
      state.teams.forEach(t=>{
        t.score=0;
        t.lifelines={hint:true,fifty:true,time:true,change:true};
      });

      const nextRevision=Number(state.multiRevision||0)+1;
      const payload={
        teamNo:firstTeam,
        teamName:state.teams[firstTeam-1]?.name||`الفريق ${firstTeam}`,
        round:1,
        rounds:state.rounds,
        scores:teamPayload(),
        message:'دوركم — اضغطوا لفّها',
        replay:true
      };
      const expires=new Date(Date.now()+12*60*60*1000).toISOString();

      const {error:roomError}=await client.from('rooms')
        .update({status:'playing',expires_at:expires})
        .eq('id',state.multiRoom.id);
      if(roomError) throw roomError;

      const {error:gameError}=await client.from('game_state').update({
        phase:'spin',
        current_team:firstTeam,
        current_round:1,
        selected_category:null,
        selected_difficulty:null,
        question_id:null,
        question_payload:payload,
        deadline:null,
        revision:nextRevision,
        updated_at:new Date().toISOString()
      }).eq('room_id',state.multiRoom.id);
      if(gameError) throw gameError;

      state.multiRevision=nextRevision;
      state.multiRoom={...state.multiRoom,status:'playing',expires_at:expires};
      state.screen='spin';
      render();
      if(typeof toast==='function')toast('بدأت لعبة جديدة بنفس الغرفة ✓');
    }catch(error){
      console.warn('Laffha V61 replay error',error);
      if(typeof toast==='function')toast('تعذر بدء اللعبة الجديدة. حاولوا مرة ثانية.');
      if(button){button.disabled=false;button.textContent='العبوا مرة ثانية بنفس الغرفة';}
    }
  }

  finalScreen=function(){
    oldFinalScreen();
    if(!isMultiRoom()) return;

    const again=document.getElementById('again');
    const setupAgain=document.getElementById('setupAgain');

    if(again){
      again.textContent='العبوا مرة ثانية بنفس الغرفة';
      again.onclick=()=>replaySameRoom(again);
    }

    if(setupAgain){
      setupAgain.textContent='غرفة جديدة / تغيير الإعدادات';
      setupAgain.onclick=async()=>{
        try{
          if(state.multiRoom?.id) await client.from('rooms').update({status:'finished'}).eq('id',state.multiRoom.id);
        }catch(_){ }
        state.multiRoom=null;
        state.multiRevision=0;
        state.multiConnectedTeams=[];
        state.multiActiveTeams=[];
        state.multiTestMode=false;
        localStorage.removeItem('laffhaMultiHostRoom');
        state.screen='setup';
        render();
      };
    }
  };

  console.info('Laffha V61 same-room replay ready');
})();