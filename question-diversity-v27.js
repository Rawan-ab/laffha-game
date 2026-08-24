// V29 — content diversity picker for every category.
// Repeat protection + region/topic/era balancing keeps consecutive questions feeling different.
(function(){
  const META_KEY='laffha-question-meta-v29';
  function loadMeta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch(e){return {};}}
  function saveMeta(m){try{localStorage.setItem(META_KEY,JSON.stringify(m));}catch(e){}}
  function metaFor(q){return {region:q.regionTag||q.countryRegionTags?.[0]||'Other',sub:q.subCategory||'other',era:q.eraTag||'Any',answer:String(q.correctAnswer||''),id:q.questionID||''};}
  function rememberMeta(q){const all=loadMeta(),cat=q.category,m=metaFor(q);const arr=Array.isArray(all[cat])?all[cat]:[];all[cat]=[...arr,m].slice(-14);saveMeta(all);}
  function diversifiedPick(pool,cat){
    if(pool.length<=1)return pool[0];
    const hist=(loadMeta()[cat]||[]).slice(-5),last=hist[hist.length-1]||{},prev=hist[hist.length-2]||{};
    const scored=pool.map(q=>{const m=metaFor(q);let score=Math.random()*4;
      if(m.region!==last.region)score+=8;else score-=8;
      if(m.region!==prev.region)score+=3;
      if(m.sub!==last.sub)score+=5;else score-=3;
      if(m.era!==last.era)score+=2;
      if(m.answer&&m.answer!==last.answer)score+=2;else if(m.answer)score-=4;
      if(q.regionTag&&q.subCategory)score+=4;
      return {q,score};
    }).sort((a,b)=>b.score-a.score);
    const top=scored.slice(0,Math.max(2,Math.ceil(scored.length*.30)));
    return top[Math.floor(Math.random()*top.length)].q;
  }

  pickQuestion=function(diff,excludeCurrent=false){
    const history=loadLaffhaHistory();
    const recent=new Set(history[state.selectedCategory]||[]);
    const currentKey=state.currentQuestion?laffhaQuestionKey(state.currentQuestion):null;
    const inCategory=QUESTIONS.filter(q=>q.category===state.selectedCategory);
    const unique=[];const seen=new Set();
    for(const q of inCategory){const k=laffhaQuestionKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}}
    const eligible=q=>{const k=laffhaQuestionKey(q);return !recent.has(k)&&!state.usedQuestions.has(k)&&(!excludeCurrent||k!==currentKey);};
    let pool=unique.filter(q=>q.difficulty===diff&&eligible(q));
    if(!pool.length)pool=unique.filter(eligible);
    if(!pool.length){
      const keep=Math.min(99,Math.max(0,unique.length-1));
      const h=loadLaffhaHistory();h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);saveLaffhaHistory(h);
      const refreshed=new Set(h[state.selectedCategory]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey));
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}
    state.currentQuestion=diversifiedPick(pool,state.selectedCategory);
    const key=laffhaQuestionKey(state.currentQuestion);state.usedQuestions.add(key);rememberLaffhaQuestion(state.currentQuestion);rememberMeta(state.currentQuestion);
    state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };
})();