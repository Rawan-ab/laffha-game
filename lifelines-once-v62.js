// V62 — each lifeline is available once per team for the whole game.
(function(){
  if(typeof state==='undefined')return;

  function hideUsedLifelines(){
    const team=state.teams?.[state.currentTeam];
    if(!team?.lifelines)return;
    document.querySelectorAll('[data-life-secure]').forEach(btn=>{
      const type=btn.dataset.lifeSecure;
      if(type && team.lifelines[type]===false)btn.remove();
    });
    const bar=document.querySelector('.lifelines');
    if(bar && !bar.querySelector('[data-life-secure]'))bar.remove();
  }

  // Hint/time/change update synchronously; 50/50 is confirmed by the server first.
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-life-secure]');
    if(!btn)return;
    setTimeout(hideUsedLifelines,0);
    setTimeout(hideUsedLifelines,300);
    setTimeout(hideUsedLifelines,1000);
  },true);

  const observer=new MutationObserver(()=>hideUsedLifelines());
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setInterval(hideUsedLifelines,500);
  hideUsedLifelines();

  console.info('Laffha V62 one-use lifelines ready');
})();