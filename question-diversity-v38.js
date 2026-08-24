// V38 — stronger diversity for TV/movies: alternate Arab/global, country, era and question style.
(function(){
  const KEY='laffha-question-meta-v38';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x));}catch{}};
  const scopeOf=q=>q.contentScope==='global'?'global':'arab';
  const regionOf=q=>q.regionTag||q.countryRegionTags?.[0]||'Other';
  const stemOf=q=>{
    const t=String(q.questionText||'');
    if(/من أخرج|المخرج/.test(t))return 'director';
    if(/من أدى|من جسد|من جسّد|بطولة|بطل|بطلة/.test(t))return 'actor';
    if(/أي دولة|أي بلد|من إنتاج أي دولة|من إنتاج أي بلد/.test(t))return 'country';
    if(/في أي مدينة|أين تدور|مكان|بلدة|مدرسة/.test(t))return 'setting';
    if(/ما اسم|من هو|من هي/.test(t))return 'identity';
    if(/يدور|يتمحور|قصة|حول ماذا/.test(t))return 'plot';
    if(/كاتب|كتبت|مؤلف|مقتبس/.test(t))return 'creator';
    return q.subCategory||'other';
  };
  const meta=q=>({scope:scopeOf(q),region:regionOf(q),era:q.eraTag||'Any',sub:q.subCategory||'other',stem:stemOf(q),answer:String(q.correctAnswer||'')});
  const remember=q=>{const all=load(),cat=q.category,arr=Array.isArray(all[cat])?all[cat]:[];all[cat]=[...arr,meta(q)].slice(-18);save(all);};

  function choose(pool,cat){
    if(pool.length<=1)return pool[0];
    const hist=(load()[cat]||[]).slice(-6),last=hist.at(-1)||{},prev=hist.at(-2)||{};
    const entertainment=cat==='tv'||cat==='movies';
    const scored=pool.map(q=>{
      const m=meta(q);let s=Math.random()*3;
      if(entertainment){
        if(last.scope){s+=m.scope!==last.scope?14:-10;}
        if(hist.slice(-4).filter(x=>x.region===m.region).length) s-=9;
        else s+=7;
        if(last.stem){s+=m.stem!==last.stem?8:-8;}
        if(prev.stem&&m.stem!==prev.stem)s+=3;
      }else{
        if(last.region)s+=m.region!==last.region?7:-6;
        if(last.sub)s+=m.sub!==last.sub?4:-3;
      }
      if(last.era)s+=m.era!==last.era?3:-1;
      if(last.answer&&m.answer===last.answer)s-=8;
      return {q,s};
    }).sort((a,b)=>b.s-a.s);
    const top=scored.slice(0,Math.max(2,Math.ceil(scored.length*.22)));
    return top[Math.floor(Math.random()*top.length)].q;
  }

  pickQuestion=function(diff,excludeCurrent=false){
    const history=loadLaffhaHistory();
    const recent=new Set(history[state.selectedCategory]||[]);
    const currentKey=state.currentQuestion?laffhaQuestionKey(state.currentQuestion):null;
    const unique=[],seen=new Set();
    for(const q of QUESTIONS.filter(q=>q.category===state.selectedCategory)){
      const k=laffhaQuestionKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}
    }
    const eligible=q=>{
      const k=laffhaQuestionKey(q);
      return !recent.has(k)&&!state.usedQuestions.has(k)&&(!excludeCurrent||k!==currentKey)&&!q._brokenLogo;
    };
    let pool=unique.filter(q=>q.difficulty===diff&&eligible(q));
    if(!pool.length)pool=unique.filter(eligible);
    if(!pool.length){
      const keep=Math.min(99,Math.max(0,unique.length-1));
      const h=loadLaffhaHistory();h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);saveLaffhaHistory(h);
      const refreshed=new Set(h[state.selectedCategory]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey)&&!q._brokenLogo);
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}
    state.currentQuestion=choose(pool,state.selectedCategory);
    const key=laffhaQuestionKey(state.currentQuestion);
    state.usedQuestions.add(key);rememberLaffhaQuestion(state.currentQuestion);remember(state.currentQuestion);
    state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;
    state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };

  console.info('Laffha V38 diversity picker ready');
})();