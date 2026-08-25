// V44 — TV/movie selection balance: keep Arabic strong, but make US/UK the dominant share of non-Arabic questions.
(function(){
  const previousPick=pickQuestion;
  const KEY='laffha-entertainment-market-v44';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x));}catch{}};
  const regionOf=q=>String(q.regionTag||q.countryRegionTags?.[0]||'Other');
  const marketOf=q=>{
    if(q.contentScope!=='global')return 'Arab';
    if(q.marketTag==='USUK')return 'USUK';
    const r=regionOf(q).toLowerCase();
    if(/usa|united states|america|uk|united kingdom|britain|england|scotland|wales/.test(r))return 'USUK';
    return 'OtherGlobal';
  };
  const formatOf=q=>q.formatTag||q.questionType||'other';
  const subOf=q=>q.subCategory||'other';

  pickQuestion=function(diff,excludeCurrent=false){
    if(state.selectedCategory!=='tv'&&state.selectedCategory!=='movies')return previousPick(diff,excludeCurrent);

    const cat=state.selectedCategory;
    const history=loadLaffhaHistory();
    const recent=new Set(history[cat]||[]);
    const currentKey=state.currentQuestion?laffhaQuestionKey(state.currentQuestion):null;
    const unique=[],seen=new Set();
    for(const q of QUESTIONS.filter(q=>q.category===cat)){
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
      const h=loadLaffhaHistory();
      h[cat]=(h[cat]||[]).slice(-keep);saveLaffhaHistory(h);
      const refreshed=new Set(h[cat]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey));
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}

    const allMeta=load();
    const hist=Array.isArray(allMeta[cat])?allMeta[cat]:[];
    const last=hist.at(-1)||{},prev=hist.at(-2)||{};
    const recent6=hist.slice(-6);

    const scored=pool.map(q=>{
      const market=marketOf(q),region=regionOf(q),format=formatOf(q),sub=subOf(q);
      let score=Math.random()*3;

      // Keep Arabic/global alternating when possible, so Arabic content is never pushed out.
      if(last.market==='Arab') score+=market!=='Arab'?12:-7;
      else if(last.market==='USUK'||last.market==='OtherGlobal') score+=market==='Arab'?11:-5;

      // Among GLOBAL questions, US/UK should dominate roughly 3:1 over other foreign markets.
      if(market==='USUK')score+=13;
      if(market==='OtherGlobal')score-=3;
      if(last.market==='OtherGlobal'&&market==='USUK')score+=8;

      // Rotate USA and UK rather than repeating the exact market/country pattern.
      const sameRegion=recent6.filter(x=>x.region===region).length;
      if(sameRegion===0)score+=7; else score-=sameRegion*6;
      if(last.region===region)score-=8;
      if(prev.region===region)score-=3;

      // Rotate question shape and subject inside entertainment.
      const sameFormat=hist.slice(-4).filter(x=>x.format===format).length;
      const sameSub=hist.slice(-4).filter(x=>x.sub===sub).length;
      if(!sameFormat)score+=5;else score-=sameFormat*4;
      if(!sameSub)score+=5;else score-=sameSub*4;

      return {q,score,market,region,format,sub};
    }).sort((a,b)=>b.score-a.score);

    const take=Math.max(2,Math.min(5,Math.ceil(scored.length*.14)));
    const top=scored.slice(0,take);
    const chosen=top[Math.floor(Math.random()*top.length)];
    state.currentQuestion=chosen.q;
    const key=laffhaQuestionKey(chosen.q);
    state.usedQuestions.add(key);
    rememberLaffhaQuestion(chosen.q);
    allMeta[cat]=[...hist,{market:chosen.market,region:chosen.region,format:chosen.format,sub:chosen.sub,id:chosen.q.questionID}].slice(-24);
    save(allMeta);
    state.currentAwardPoints=state.drawnPoints||chosen.q.points;
    state.usedChoiceAssist=false;
    state.deadline=Date.now()+60000;
    state.screen='question';render();
  };

  console.info('Laffha V44 entertainment market balance ready');
})();