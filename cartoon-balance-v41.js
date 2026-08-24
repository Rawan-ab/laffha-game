// V41 — Cartoon franchise balance. Limit Detective Conan and avoid repeating one franchise.
(function(){
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();

  function isDetectiveConan(q){
    const s=norm([q.questionText,q.correctAnswer,q.hint,...(q.wrongAnswers||[])].join(' '));
    return /المحقق كونان|كونان إيدوغاوا|شينتشي|ران موري|كوغورو|المنظمة السوداء|غوشو أوياما|هايبرا|كايتو كيد|كيتو كيد/.test(s) || norm(q.correctAnswer)==='كونان';
  }

  // Keep only one Conan question per difficulty across the whole active bank.
  const preferred={easy:'car29-e02',medium:'car29-m01',hard:'car29-h01'};
  for(const diff of ['easy','medium','hard']){
    const matches=QUESTIONS.filter(q=>q.category==='cartoons'&&q.difficulty===diff&&isDetectiveConan(q));
    if(matches.length<=1)continue;
    const keep=matches.find(q=>q.questionID===preferred[diff])||matches[0];
    const remove=new Set(matches.filter(q=>q!==keep).map(q=>q.questionID));
    for(let i=QUESTIONS.length-1;i>=0;i--){
      if(remove.has(QUESTIONS[i]?.questionID))QUESTIONS.splice(i,1);
    }
  }

  function franchiseOf(q){
    const s=norm([q.questionText,q.correctAnswer,q.hint,...(q.wrongAnswers||[])].join(' '));
    if(isDetectiveConan(q))return 'detective-conan';
    if(/ناروتو|ساسكي|ساكورا|كاكاشي|هوكاغي|أوتشيها|الأكاتسوكي/.test(s))return 'naruto';
    if(/ون بيس|لوفي|زورو|سانجي|قبعة القش|أوسوب|تشوبر/.test(s))return 'one-piece';
    if(/دراغون بول|غوكو|فيجيتا|غوهان|سايان/.test(s))return 'dragon-ball';
    if(/بوكيمون|بيكاتشو|آش|فريق روكيت|جيسي|جيمس/.test(s))return 'pokemon';
    if(/سبيستون|كوكب|زمردة|بون بون/.test(s))return 'spacetoon';
    if(/أبطال الديجيتال|digimon/.test(s))return 'digimon';
    if(/غريندايزر|دايسكي/.test(s))return 'grendizer';
    if(/الكابتن ماجد|ماجد|تسوباسا/.test(s))return 'captain-tsubasa';
    if(/عدنان ولينا|future boy/.test(s))return 'future-boy-conan';
    if(/دورايمون|نوبيتا/.test(s))return 'doraemon';
    if(/افتح يا سمسم|عالم سمسم|نعمان|خوخة/.test(s))return 'sesame-arabic';
    if(/سالي/.test(s))return 'sally';
    if(/هايدي/.test(s))return 'heidi';
    if(/ريمي/.test(s))return 'remi';
    if(/عهد الأصدقاء/.test(s))return 'romeos-blue-skies';
    if(/أنا وأخي/.test(s))return 'baby-and-me';
    if(/سلام دانك/.test(s))return 'slam-dunk';
    if(q.formatTag==='emoji')return 'emoji-other';
    return q.franchiseTag||q.subCategory||q.regionTag||'other';
  }

  QUESTIONS.filter(q=>q.category==='cartoons').forEach(q=>{q.franchiseTag=franchiseOf(q);});

  const previousPick=pickQuestion;
  const KEY='laffha-cartoon-franchise-v41';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')||[];}catch{return [];}};
  const save=a=>{try{localStorage.setItem(KEY,JSON.stringify(a.slice(-16)));}catch{}};

  pickQuestion=function(diff,excludeCurrent=false){
    if(state.selectedCategory!=='cartoons')return previousPick(diff,excludeCurrent);

    const history=loadLaffhaHistory();
    const recent=new Set(history[state.selectedCategory]||[]);
    const currentKey=state.currentQuestion?laffhaQuestionKey(state.currentQuestion):null;
    const unique=[],seen=new Set();
    for(const q of QUESTIONS.filter(q=>q.category==='cartoons')){
      const k=laffhaQuestionKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}
    }
    const eligible=q=>{
      const k=laffhaQuestionKey(q);
      return !recent.has(k)&&!state.usedQuestions.has(k)&&(!excludeCurrent||k!==currentKey);
    };
    let pool=unique.filter(q=>q.difficulty===diff&&eligible(q));
    if(!pool.length)pool=unique.filter(eligible);
    if(!pool.length){
      const keep=Math.min(99,Math.max(0,unique.length-1));
      const h=loadLaffhaHistory();h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);saveLaffhaHistory(h);
      const refreshed=new Set(h[state.selectedCategory]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey));
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}

    const hist=load();
    const last=hist.at(-1)||{};
    const recentFranchises=hist.slice(-6).map(x=>x.franchise);
    const recentRegions=hist.slice(-5).map(x=>x.region);
    const recentFormats=hist.slice(-4).map(x=>x.format);

    const scored=pool.map(q=>{
      const franchise=franchiseOf(q);
      const region=q.regionTag||q.countryRegionTags?.[0]||'Other';
      const format=q.formatTag||q.questionType||'other';
      let score=Math.random()*3;
      if(franchise!==last.franchise)score+=14;else score-=22;
      const fc=recentFranchises.filter(x=>x===franchise).length;
      score-=fc*12;
      if(!recentRegions.includes(region))score+=5;else score-=3;
      if(!recentFormats.includes(format))score+=5;else score-=2;
      // Conan should be occasional, not dominant.
      if(franchise==='detective-conan')score-=8;
      return {q,score,franchise,region,format};
    }).sort((a,b)=>b.score-a.score);

    const top=scored.slice(0,Math.max(2,Math.min(5,Math.ceil(scored.length*.18))));
    const chosen=top[Math.floor(Math.random()*top.length)];
    state.currentQuestion=chosen.q;
    const key=laffhaQuestionKey(chosen.q);
    state.usedQuestions.add(key);rememberLaffhaQuestion(chosen.q);
    save([...hist,{franchise:chosen.franchise,region:chosen.region,format:chosen.format}]);
    state.currentAwardPoints=state.drawnPoints||chosen.q.points;
    state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };

  console.info('Laffha V41 cartoon balance ready',{
    cartoons:QUESTIONS.filter(q=>q.category==='cartoons').length,
    conan:QUESTIONS.filter(q=>q.category==='cartoons'&&isDetectiveConan(q)).length
  });
})();