// V37 — ordering questions use simple rank numbers instead of drag-and-drop.
(function(){
  function norm(v){return String(v??'').replace(/\s+/g,' ').trim();}
  function sameOrder(a,b){return a.length===b.length&&a.every((v,i)=>norm(v)===norm(b[i]));}
  function shuffleDifferent(items){
    const original=[...items],out=[...items];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    if(out.length>1&&sameOrder(out,original))[out[0],out[1]]=[out[1],out[0]];
    return out;
  }
  function expectedOrder(q){
    if(Array.isArray(q.correctOrder)&&q.correctOrder.length)return [...q.correctOrder];
    if(Array.isArray(q.items)&&q.items.length)return [...q.items];
    return String(q.correctAnswer||'').split(/\s*[،,]\s*/).filter(Boolean);
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function enhanceOrdering(){
    const q=state.currentQuestion;
    if(!q||q.questionType!=='ordering')return;
    const list=document.querySelector('.ordering-list');
    if(!list||list.dataset.rankEnhanced==='1')return;

    const expected=expectedOrder(q);
    const shown=shuffleDifferent(expected);
    list.dataset.rankEnhanced='1';
    list.className='ordering-list ordering-rank-list';
    list.innerHTML=shown.map((item,i)=>`
      <div class="ordering-rank-item" data-value="${esc(item)}">
        <div class="ordering-rank-text">${esc(item)}</div>
        <label class="ordering-rank-control">
          <span>الترتيب</span>
          <select class="rank-select" data-rank-for="${i}" aria-label="ترتيب ${esc(item)}">
            <option value="">—</option>
            ${expected.map((_,n)=>`<option value="${n+1}">${n+1}</option>`).join('')}
          </select>
        </label>
      </div>`).join('');

    const reveal=document.querySelector('.reveal-answer-wrap');
    if(reveal){
      reveal.outerHTML=`<div class="ordering-rank-actions"><div class="ordering-rank-note">حطّوا رقم ترتيب لكل خيار، وكل رقم يُستخدم مرة واحدة.</div><button class="btn ordering-check-btn" id="checkOrder" disabled>تأكد من الترتيب</button><div id="orderingFeedback" class="ordering-feedback" aria-live="polite"></div></div>`;
    }

    const selects=[...document.querySelectorAll('.rank-select')];
    const check=document.getElementById('checkOrder');

    function refresh(){
      const values=selects.map(s=>s.value).filter(Boolean);
      if(check)check.disabled=values.length!==selects.length||new Set(values).size!==selects.length;
      selects.forEach(s=>s.closest('.ordering-rank-item')?.classList.toggle('rank-set',!!s.value));
    }

    selects.forEach(sel=>{
      sel.addEventListener('change',()=>{
        const v=sel.value;
        if(v){
          selects.forEach(other=>{if(other!==sel&&other.value===v)other.value='';});
        }
        refresh();
      });
    });
    refresh();

    if(check)check.onclick=()=>{
      if(check.disabled)return;
      const ranked=selects.map(sel=>({rank:Number(sel.value),value:sel.closest('.ordering-rank-item')?.dataset.value||''})).sort((a,b)=>a.rank-b.rank).map(x=>x.value);
      const ok=sameOrder(ranked,expected);
      check.disabled=true;
      const feedback=document.getElementById('orderingFeedback');
      document.querySelectorAll('.ordering-rank-item').forEach(row=>{
        const sel=row.querySelector('.rank-select');
        const rank=Number(sel?.value||0);
        const right=rank>0&&norm(row.dataset.value)===norm(expected[rank-1]);
        row.classList.add(ok?'order-correct':(right?'order-position-correct':'order-wrong'));
        if(sel)sel.disabled=true;
      });
      if(feedback){feedback.textContent=ok?'✓ الترتيب صحيح':'✕ الترتيب غير صحيح';feedback.className=`ordering-feedback ${ok?'ok':'no'}`;}
      setTimeout(()=>finishQuestion(ok?'correct':'wrong'),700);
    };
  }

  const previousQuestion=question;
  question=function(){previousQuestion();enhanceOrdering();};
})();