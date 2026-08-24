// V39 — TV/movies balance by content scope + macro world region + country + question style.
(function(){
  const KEY='laffha-question-meta-v39';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x));}catch{}};

  const scopeOf=q=>q.contentScope==='global'?'global':'arab';
  const regionOf=q=>String(q.regionTag||q.countryRegionTags?.[0]||'Other');
  const macroOf=q=>{
    if(scopeOf(q)==='arab')return 'Arab';
    const r=regionOf(q).toLowerCase();
    if(/japan|south korea|korea|china|taiwan|hong kong/.test(r))return 'EastAsia';
    if(/india|pakistan|bangladesh|sri lanka|nepal/.test(r))return 'SouthAsia';
    if(/turkey|iran/.test(r))return 'WestAsia';
    if(/usa|canada|america/.test(r))return 'NorthAmerica';
    if(/mexico|brazil|argentina|colombia|chile/.test(r))return 'LatinAmerica';
    if(/uk|france|germany|spain|italy|denmark|sweden|norway|finland|iceland|europe/.test(r))return 'Europe';
    if(/australia|new zealand/.test(r))return 'Oceania';
    return 'OtherGlobal';
  };
  const stemOf=q=>{
    const t=String(q.questionText||'');
    if(/من أخرج|المخرج/.test(t))return 'director';
    if(/من أدى|من جسد|من جسّد|بطولة|بطل|بطلة/.test(t))return 'actor';
    if(/أي دولة|أي بلد|من إنتاج أي دولة|من إنتاج أي بلد/.test(t))return 'country';
    if(/في أي مدينة|أين تدور|بلدة|مدرسة|مكان/.test(t))return 'setting';
    if(/يدور|يتمحور|قصة|حول ماذا|مجال/.test(t))return 'plot';
    if(/كاتب|كتبت|مؤلف|مقتبس|ابتكر/.test(t))return 'creator';
    if(/ما اسم/.test(t))return 'identity';
    return q.subCategory||'other';
  };
  const meta=q=>({
    scope:scopeOf(q),macro:macroOf(q),region:regionOf(q),era:q.eraTag||'Any',
    stem:stemOf(q),sub:q.subCategory||'other',answer:String(q.correctAnswer||''),id:q.questionID||''
  });
  const remember=q=>{
    const all=load(),cat=q.category,arr=Array.isArray(all[cat])?all[cat]:[];
    all[cat]=[...arr,meta(q)].slice(-24);save(all);
  };

  function choose(pool,cat){
    if(pool.length<=1)return pool[0];
    const hist=(load()[cat]||[]).slice(-10);
    const last=hist.at(-1)||{},prev=hist.at(-2)||{};
    const entertainment=cat==='tv'||cat==='movies';
    const scored=pool.map(q=>{
      const m=meta(q);let s=Math.random()*2.5;
      if(entertainment){
        // Alternate Arab/global when possible.
        if(last.scope)s+=m.scope!==last.scope?13:-8;

        // Strong macro-region rotation: Japan and Korea count as the SAME East Asia group.
        const macroRecent=hist.slice(-5).filter(x=>x.macro===m.macro).length;
        if(macroRecent===0)s+=13;
        else s-=macroRecent*13;
        if(last.macro===m.macro)s-=15;
        if(prev.macro===m.macro)s-=7;

        // Avoid repeating the same country/market even inside a different question.
        const countryRecent=hist.slice(-7).filter(x=>x.region===m.region).length;
        if(countryRecent===0)s+=7;
        else s-=countryRecent*9;

        // Rotate the way we ask: actor -> plot -> country -> setting -> director, etc.
        const stemRecent=hist.slice(-4).filter(x=>x.stem===m.stem).length;
        if(stemRecent===0)s+=8;
        else s-=stemRecent*8;
      }else{
        if(last.region)s+=m.region!==last.region?6:-5;
        if(last.sub)s+=m.sub!==last.sub?4:-3;
      }
      if(last.era)s+=m.era!==last.era?2:-1;
      if(last.answer&&m.answer===last.answer)s-=10;
      return {q,s};
    }).sort((a,b)=>b.s-a.s);

    // Select from only the strongest candidates so balance actually affects play.
    const take=Math.max(2,Math.min(5,Math.ceil(scored.length*.15)));
    const top=scored.slice(0,take);
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
      const h=loadLaffhaHistory();
      h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);
      saveLaffhaHistory(h);
      const refreshed=new Set(h[state.selectedCategory]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey)&&!q._brokenLogo);
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}

    state.currentQuestion=choose(pool,state.selectedCategory);
    const key=laffhaQuestionKey(state.currentQuestion);
    state.usedQuestions.add(key);
    rememberLaffhaQuestion(state.currentQuestion);
    remember(state.currentQuestion);
    state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;
    state.usedChoiceAssist=false;
    state.deadline=Date.now()+60000;
    state.screen='question';render();
  };

  console.info('Laffha V39 macro-region diversity ready');
})();