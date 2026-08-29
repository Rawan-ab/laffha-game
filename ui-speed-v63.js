// V72 — clearer selected-answer state + lightweight client warmup.
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .answer-btn,.option{touch-action:manipulation;transition:background-color .12s ease,border-color .12s ease,color .12s ease,transform .12s ease,box-shadow .12s ease!important}
    .answer-btn.selected,.answer-btn.selected:disabled,
    .option.selected,.option.selected:disabled{
      background:#5f35a7!important;
      border-color:#5f35a7!important;
      color:#fff!important;
      opacity:1!important;
      box-shadow:0 8px 20px rgba(95,53,167,.22)!important;
      transform:translateY(-1px)!important;
    }
    .answer-btn:disabled:not(.selected),.option:disabled:not(.selected){opacity:.58!important}
    .answer-btn.selected::after,.option.selected::after{content:' ✓';font-weight:900}
    .answer-btn,.option,.btn{ -webkit-tap-highlight-color:transparent; }
  `;
  document.head.appendChild(style);

  function markSelected(btn){
    if(!btn)return;
    const scope=btn.closest('.answers,.options')||document;
    scope.querySelectorAll('.answer-btn.selected,.option.selected').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
  }
  document.addEventListener('pointerdown',event=>{
    const btn=event.target.closest?.('[data-secure-answer],[data-option]');
    if(btn&&!btn.disabled)markSelected(btn);
  },true);
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-secure-answer],[data-option]');
    if(btn&&!btn.disabled)markSelected(btn);
  },true);

  // Pre-create the anonymous session while players are on setup/home so the first
  // server-verified answer does not also pay the authentication startup cost.
  try{
    const rt=window.LaffhaRealtime;
    rt?.ensureSession?.().then(()=>{
      const q=(typeof QUESTIONS!=='undefined'&&QUESTIONS[0])||null;
      if(q?.questionID)return rt.client.functions.invoke('laffha-answer',{body:{questionId:q.questionID,answer:'',teamNo:0,roomId:null,revision:null,mode:'answer'}}).catch(()=>{});
    }).catch(()=>{});
  }catch(_){ }

  console.info('Laffha V72 answer feedback + speed warmup ready');
})();