// V77 — production lobby cleanup: one clear start action only.
(function(){
  function cleanLobby(){
    const start=document.getElementById('multiStart');
    if(start)start.textContent='ابدأ اللعبة';
    document.getElementById('multiTestStart')?.remove();
    document.querySelectorAll('.multi-test-note').forEach(el=>el.remove());
  }
  const observer=new MutationObserver(cleanLobby);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanLobby,{once:true});
  else cleanLobby();
})();