// V36 — interactive ordering questions for mouse + touch.
(function(){
  function norm(v){return String(v??'').replace(/\s+/g,' ').trim();}
  function sameOrder(a,b){return a.length===b.length && a.every((v,i)=>norm(v)===norm(b[i]));}
  function shuffleDifferent(items){
    const original=[...items];
    const out=[...items];
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    if(out.length>1 && sameOrder(out,original)) [out[0],out[1]]=[out[1],out[0]];
    return out;
  }
  function expectedOrder(q){
    if(Array.isArray(q.correctOrder)&&q.correctOrder.length) return [...q.correctOrder];
    if(Array.isArray(q.items)&&q.items.length) return [...q.items];
    return String(q.correctAnswer||'').split(/\s*[،,]\s*/).filter(Boolean);
  }
  function currentOrder(list){return [...list.querySelectorAll('.ordering-item')].map(el=>el.dataset.value);}
  function renumber(list){
    [...list.querySelectorAll('.ordering-item')].forEach((el,i)=>{
      const n=el.querySelector('.ordering-number');
      if(n)n.textContent=i+1;
    });
  }

  function enhanceOrdering(){
    const q=state.currentQuestion;
    if(!q || q.questionType!=='ordering') return;
    const oldList=document.querySelector('.ordering-list');
    if(!oldList || oldList.dataset.enhanced==='1')return;

    const expected=expectedOrder(q);
    const start=shuffleDifferent(expected);
    oldList.dataset.enhanced='1';
    oldList.classList.add('ordering-interactive');
    oldList.innerHTML=start.map((x,i)=>`<div class="ordering-item" data-value="${String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" draggable="true"><span class="ordering-number">${i+1}</span><strong>${x}</strong><span class="ordering-grip" aria-hidden="true">☰</span></div>`).join('');

    const oldActions=document.querySelector('.direct-actions');
    if(oldActions) oldActions.outerHTML=`<div class="ordering-actions"><button class="btn ordering-check-btn" id="checkOrder">تأكد من الترتيب</button><div class="ordering-feedback" id="orderingFeedback" aria-live="polite"></div></div>`;

    const list=oldList;
    let dragged=null;

    // Desktop HTML5 drag and drop.
    list.addEventListener('dragstart',e=>{
      const item=e.target.closest('.ordering-item');
      if(!item)return;
      dragged=item;
      item.classList.add('dragging');
      try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',item.dataset.value);}catch(_){ }
    });
    list.addEventListener('dragover',e=>{
      e.preventDefault();
      if(!dragged)return;
      const target=e.target.closest('.ordering-item');
      if(!target||target===dragged)return;
      const r=target.getBoundingClientRect();
      const after=e.clientY>r.top+r.height/2;
      list.insertBefore(dragged,after?target.nextSibling:target);
      renumber(list);
    });
    list.addEventListener('dragend',()=>{
      if(dragged)dragged.classList.remove('dragging');
      dragged=null;renumber(list);
    });

    // Pointer sorting for phones/tablets.
    let pointerItem=null,pointerId=null;
    list.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse')return;
      const item=e.target.closest('.ordering-item');
      if(!item)return;
      pointerItem=item;pointerId=e.pointerId;
      item.classList.add('dragging','touch-dragging');
      try{item.setPointerCapture(pointerId);}catch(_){ }
      e.preventDefault();
    });
    list.addEventListener('pointermove',e=>{
      if(!pointerItem||e.pointerId!==pointerId)return;
      const el=document.elementFromPoint(e.clientX,e.clientY);
      const target=el&&el.closest?el.closest('.ordering-item'):null;
      if(!target||target===pointerItem||!list.contains(target))return;
      const r=target.getBoundingClientRect();
      const after=e.clientY>r.top+r.height/2;
      list.insertBefore(pointerItem,after?target.nextSibling:target);
      renumber(list);
      e.preventDefault();
    });
    const endPointer=e=>{
      if(!pointerItem||e.pointerId!==pointerId)return;
      pointerItem.classList.remove('dragging','touch-dragging');
      try{pointerItem.releasePointerCapture(pointerId);}catch(_){ }
      pointerItem=null;pointerId=null;renumber(list);
    };
    list.addEventListener('pointerup',endPointer);
    list.addEventListener('pointercancel',endPointer);

    const check=document.getElementById('checkOrder');
    if(check)check.onclick=()=>{
      if(check.disabled)return;
      const actual=currentOrder(list);
      const ok=sameOrder(actual,expected);
      check.disabled=true;
      const feedback=document.getElementById('orderingFeedback');
      [...list.querySelectorAll('.ordering-item')].forEach((el,i)=>{
        el.classList.add(ok?'order-correct':(norm(el.dataset.value)===norm(expected[i])?'order-position-correct':'order-wrong'));
      });
      if(feedback){
        feedback.textContent=ok?'✓ الترتيب صحيح':'✕ الترتيب غير صحيح';
        feedback.className=`ordering-feedback ${ok?'ok':'no'}`;
      }
      setTimeout(()=>finishQuestion(ok?'correct':'wrong'),650);
    };
  }

  const originalQuestion=question;
  question=function(){
    originalQuestion();
    enhanceOrdering();
  };
})();