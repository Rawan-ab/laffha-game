// V32 — question quality pass: stronger distractors, slightly harder tiers, and no text-revealing logos.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();

  // Simple Icons entries that are primarily wordmarks / contain the answer visibly.
  const revealingLogoIds=new Set([
    'log29-e09','log29-e14','log29-e15','log29-e18',
    'log29-m03','log29-m06','log29-m07','log29-m09','log29-m12','log29-m13','log29-m14','log29-m15','log29-m16','log29-m19','log29-m20',
    'log29-h01','log29-h03','log29-h04','log29-h05','log29-h08','log29-h13','log29-h14','log29-h15','log29-h20'
  ]);
  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(revealingLogoIds.has(String(QUESTIONS[i]?.questionID||'')))QUESTIONS.splice(i,1);
  }

  function answerKind(q){
    const t=norm(q.questionText),a=norm(q.correctAnswer);
    if((/ثنائي|بطلا|بطولة مشتركة|الثنائي/.test(t))&&/\sو\s/.test(a))return 'pair';
    if(/أي عام|أي سنة|في أي سنة|متى |عام كم|سنة كم/.test(t)||/^\d{4}$/.test(a))return 'year';
    if(/كم |عدد |كم مرة|كم هدف|كم لقب|كم دولة/.test(t)&&/\d/.test(a))return 'number';
    if(/عاصمة/.test(t))return 'capital';
    if(/أي مدينة|في أي مدينة|ما المدينة|مدينة ماذا/.test(t))return 'city';
    if(/أي بلد|أي دولة|من أي بلد|من أي دولة|إنتاج أي بلد|ينتمي.*بلد|ينتمي.*دولة/.test(t))return 'country';
    if(/أي قناة|أي منصة|أي شركة|أي نادي|أي فريق|أي منتخب/.test(t))return 'entity';
    if(/من |من هو|من هي|أي ممثل|أي ممثلة|أي فنان|أي فنانة|من جسّد|من جسد|من أدى|من ادّى|من بطل|من بطلة|من قدّم|من قدم|من كتب|من أخرج|من صاحب|لمن تعود|لمن يعود/.test(t))return 'person';
    if(/ما اسم (المسلسل|الفيلم|الأغنية|الاغنية|البرنامج|العمل|الشخصية)|اسم أي (مسلسل|فيلم|أغنية|برنامج)/.test(t))return 'title';
    if(/أي رياضة|ما الرياضة/.test(t))return 'sport';
    return 'general';
  }

  QUESTIONS.forEach(q=>{q.answerKind=answerKind(q);});

  function sameRegion(a,b){
    const ar=a.regionTag||a.countryRegionTags?.[0]||'',br=b.regionTag||b.countryRegionTags?.[0]||'';
    return ar&&br&&ar===br;
  }
  function plausiblePool(q){
    const kind=q.answerKind||answerKind(q);
    const all=QUESTIONS.filter(x=>x.questionID!==q.questionID&&x.correctAnswer&&norm(x.correctAnswer)!==norm(q.correctAnswer));
    let pool=all.filter(x=>x.category===q.category&&(x.answerKind||answerKind(x))===kind);
    if(pool.length<8)pool=[...pool,...all.filter(x=>x.category!==q.category&&(x.answerKind||answerKind(x))===kind)];
    const seen=new Set();
    return pool.filter(x=>{const k=norm(x.correctAnswer);if(!k||seen.has(k))return false;seen.add(k);return true;});
  }
  function rankedDistractors(q,n=3){
    const kind=q.answerKind||answerKind(q);
    let candidates=plausiblePool(q).map(x=>{
      let score=Math.random()*1.5;
      if(x.category===q.category)score+=7;
      if(q.subCategory&&x.subCategory===q.subCategory)score+=7;
      if(sameRegion(q,x))score+=4;
      if(x.difficulty===q.difficulty)score+=2;
      if(q.eraTag&&x.eraTag===q.eraTag)score+=1.5;
      if(x.questionType===q.questionType)score+=1;
      const la=String(q.correctAnswer||'').length,lb=String(x.correctAnswer||'').length;
      if(Math.abs(la-lb)<=Math.max(3,Math.round(la*.45)))score+=1;
      return {answer:x.correctAnswer,score};
    }).sort((a,b)=>b.score-a.score);

    const answers=[];const used=new Set([norm(q.correctAnswer)]);
    for(const c of candidates.slice(0,Math.max(12,n*5))){
      const k=norm(c.answer);if(!k||used.has(k))continue;used.add(k);answers.push(c.answer);if(answers.length===n)break;
    }

    // Existing curated distractors are a safer fallback for broad/general questions.
    for(const a of (q.wrongAnswers||[])){
      const k=norm(a);if(!k||used.has(k))continue;
      if(kind==='year'&&!/^\d{4}$/.test(k))continue;
      if(kind==='number'&&!/\d/.test(k))continue;
      if(kind==='pair'&&!/\sو\s/.test(k))continue;
      used.add(k);answers.push(a);if(answers.length===n)break;
    }
    return answers.slice(0,n);
  }
  window.LAFFHA_GET_DISTRACTORS=rankedDistractors;

  // Refresh all MCQ distractors so the wrong choices come from the same answer family/topic.
  QUESTIONS.forEach(q=>{
    if(q.questionType==='mcq'){
      const d=rankedDistractors(q,3);
      if(d.length===3)q.wrongAnswers=d;
    }
    if(q.questionType==='logo'){
      q.logoSub='';
      q.logoText='؟';
      q.questionText='وش هذا الشعار؟';
    }
  });

  // Slight difficulty lift: promote only the most obvious EASY MCQs while keeping a healthy 200-point pool.
  function obviousScore(q){
    const t=norm(q.questionText);let s=0;
    if(q.questionType==='mcq')s+=2;
    if(/من بطل|من بطلة|من قدّم برنامج|من قدم برنامج|من يؤدي شخصية|يتصدر بطولة|ما عاصمة|أكبر محيط|أي كوكب|كم عدد القارات|تنتمي أساسًا إلى أي نوع/.test(t))s+=4;
    if(/أي بلد|أي دولة/.test(t)&&q.questionType==='mcq')s+=1;
    if(String(q.correctAnswer||'').length<=5)s+=.5;
    return s;
  }
  const cats=[...new Set(QUESTIONS.map(q=>q.category))];
  for(const cat of cats){
    const easy=QUESTIONS.filter(q=>q.category===cat&&q.difficulty==='easy');
    const maxPromote=Math.max(0,easy.length-12);
    easy.filter(q=>q.questionType==='mcq').map(q=>({q,s:obviousScore(q)})).filter(x=>x.s>=4).sort((a,b)=>b.s-a.s).slice(0,maxPromote).forEach(({q})=>{q.difficulty='medium';q.points=400;});
  }

  // Use the improved distractors both for normal MCQs and the "Add choices" helper.
  shuffledAnswers=function(q){
    const wrong=rankedDistractors(q,3);
    const source=wrong.length===3?wrong:(q.wrongAnswers||[]).slice(0,3);
    return [...source,q.correctAnswer].sort(()=>Math.random()-.5);
  };
  buildChoiceAssist=function(q){return rankedDistractors(q,3);};

  // Logo view never prints category/name text around the image. If the image fails, show a neutral placeholder only.
  finalLogo=function(q){
    if(q.mediaURL)return `<div class="logo-question"><div class="logo-media"><img src="${q.mediaURL}" alt="" aria-label="شعار بدون اسم" onerror="this.parentElement.innerHTML='<div class=&quot;logo-fallback&quot;>؟</div>'"></div></div>`;
    return `<div class="logo-question"><div class="logo-fallback">؟</div></div>`;
  };

  // Refresh stats after the quality pass.
  const stats={};
  for(const q of QUESTIONS){stats[q.category]??={total:0,easy:0,medium:0,hard:0};stats[q.category].total++;if(stats[q.category][q.difficulty]!==undefined)stats[q.category][q.difficulty]++;}
  window.LAFFHA_BANK_STATS=stats;
  console.info('Laffha V32 question quality ready',stats);
})();