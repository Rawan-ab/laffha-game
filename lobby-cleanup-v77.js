// V77 hotfix — keep the original multiplayer handlers intact while hiding test-only UI.
(function(){
  function cleanLobby(){
    const start=document.getElementById('multiStart');
    if(start&&start.textContent!=='ابدأ اللعبة')start.textContent='ابدأ اللعبة';

    // Do not remove this button: multiplayer-v56.js attaches its handler after rendering.
    // Hiding it preserves the existing render flow without exposing test mode to players.
    const test=document.getElementById('multiTestStart');
    if(test&&test.style.display!=='none'){
      test.style.display='none';
      test.setAttribute('aria-hidden','true');
      test.tabIndex=-1;
    }

    document.querySelectorAll('.multi-test-note').forEach(el=>{
      if(el.style.display!=='none'){
        el.style.display='none';
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  const observer=new MutationObserver(()=>cleanLobby());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanLobby,{once:true});
  else cleanLobby();
})();
