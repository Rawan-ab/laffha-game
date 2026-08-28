// V69 — make the approved consolidated setup screen the first screen.
(function(){
  if(typeof state==='undefined'||typeof render!=='function'||typeof setup!=='function')return;
  let firstBoot=true;
  const approvedBoot=()=>{
    if(!firstBoot)return;
    firstBoot=false;
    state.teamCount=2;
    state.rounds=5;
    state.playMode='multi';
    if(!state.teams?.length||state.teams.length!==2){
      state.teamCount=2;
      if(typeof resetTeams==='function')resetTeams();
    }
    state.screen='setup';
    render();
  };
  home=function(){state.screen='setup';setup();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',approvedBoot,{once:true});
  else queueMicrotask(approvedBoot);
})();
