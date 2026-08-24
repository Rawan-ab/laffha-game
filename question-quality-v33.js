// V33 — preserve plausible curated distractors, tighten semantic choices, and make 400-point questions meaningfully harder.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const byText=(needle)=>QUESTIONS.find(q=>norm(q.questionText).includes(norm(needle)));
  const byId=id=>QUESTIONS.find(q=>q.questionID===id);

  // Specific weak 400-point questions seen in testing.
  const sesame=byId('car29-m12')||byText('عالم سمسم');
  if(sesame){
    sesame.difficulty='easy';
    sesame.points=200;
    sesame.questionText='في «عالم سمسم» المصري، ما اسم الشخصية الأنثوية الوردية؟';
    sesame.correctAnswer='خوخة';
    sesame.wrongAnswers=['فلفل','نمنم','نعمان'];
    sesame.subCategory='characters';
  }

  const poet=byText('شاعر المليون');
  if(poet){
    poet.difficulty='medium';
    poet.points=400;
    poet.questionType='mcq';
    poet.questionText='برنامج «شاعر المليون» يرتبط بأكاديمية الشعر في أي إمارة إماراتية؟';
    poet.correctAnswer='أبوظبي';
    poet.wrongAnswers=['دبي','الشارقة','عجمان'];
    poet.hint='البرنامج من أبرز مشاريع الشعر النبطي في دولة الإمارات.';
    poet.answerKind='emirate';
  }

  // Questions that are too obvious for 400 are moved to 200 instead of weakening the 400 tier.
  const obviousMediumIds=new Set(['car29-m08','car29-m09','car29-m10','car29-m20']);
  obviousMediumIds.forEach(id=>{const q=byId(id);if(q){q.difficulty='easy';q.points=200;}});

  function expectedKind(q){
    const t=norm(q.questionText);
    if(/نوع من الشعر|نوع الشعر|الشعر.*نوع/.test(t))return 'poetryGenre';
    if(/أي رياضة|ما الرياضة|حول أي رياضة|يدور.*رياضة/.test(t))return 'sport';
    if(/أي إمارة|في أي إمارة/.test(t))return 'emirate';
    if(/ما صلة|صلة .*ب|صلة .* بـ/.test(t))return 'relation';
    if(/أي قناة|ما القناة|قناة .*؟/.test(t))return 'channel';
    if(/أي بلد|أي دولة|من أي بلد|من أي دولة|إنتاج أي بلد|ينتمي.*بلد|ينتمي.*دولة/.test(t))return 'country';
    if(/أي مدينة|في أي مدينة|ما المدينة/.test(t))return 'city';
    if(/أي عام|أي سنة|في أي سنة|سنة كم|عام كم/.test(t))return 'year';
    if(/كم |عدد |كم مرة|كم لقب|كم هدف/.test(t))return 'number';
    if(/ما اسم الشخصية|من الشخصية|من بطل|من بطلة|من جسّد|من جسد|من أدى|من ادّى/.test(t))return 'person';
    if(/من مؤلف|من كتب|من أخرج|من قدّم|من قدم|من صاحب/.test(t))return 'person';
    if(/ما اسم (المسلسل|الفيلم|الأغنية|الاغنية|البرنامج|العمل)|اسم أي (مسلسل|فيلم|أغنية|برنامج)/.test(t))return 'title';
    return q.answerKind||'general';
  }

  const validators={
    poetryGenre:a=>/شعر|نبطي|فصيح|حر|عمودي/.test(norm(a)),
    sport:a=>/كرة|تنس|سباحة|ملاكمة|جودو|تايكوندو|فورمولا|هوكي|غولف|جري|رماية/.test(norm(a)),
    emirate:a=>['أبوظبي','دبي','الشارقة','عجمان','أم القيوين','رأس الخيمة','الفجيرة'].includes(String(a).trim()),
    relation:a=>/ابن|ابنة|أخ|أخت|زوج|زوجة|أب|أم|خال|عم|صديق|زميل/.test(norm(a)),
    year:a=>/^\d{4}$/.test(String(a).trim()),
    number:a=>/\d/.test(String(a)),
  };

  function curatedPlausible(q){
    const wrong=[...(q.wrongAnswers||[])].filter(Boolean).filter(x=>norm(x)!==norm(q.correctAnswer));
    if(wrong.length<3)return false;
    const kind=expectedKind(q),v=validators[kind];
    if(v&&!wrong.slice(0,3).every(v))return false;
    return true;
  }

  function semanticCandidates(q){
    const kind=expectedKind(q);
    let pool=QUESTIONS.filter(x=>x.questionID!==q.questionID&&x.correctAnswer&&norm(x.correctAnswer)!==norm(q.correctAnswer));
    pool=pool.filter(x=>expectedKind(x)===kind);
    const ranked=pool.map(x=>{
      let s=Math.random();
      if(x.category===q.category)s+=8;
      if(q.subCategory&&x.subCategory===q.subCategory)s+=7;
      if(q.regionTag&&x.regionTag===q.regionTag)s+=4;
      if(q.eraTag&&x.eraTag===q.eraTag)s+=2;
      if(x.difficulty===q.difficulty)s+=2;
      return {a:x.correctAnswer,s};
    }).sort((a,b)=>b.s-a.s);
    const out=[],seen=new Set([norm(q.correctAnswer)]);
    for(const r of ranked){const k=norm(r.a);if(!k||seen.has(k))continue;seen.add(k);out.push(r.a);if(out.length===3)break;}
    return out;
  }

  function controlledFallback(q){
    const kind=expectedKind(q);
    const pools={
      poetryGenre:['الشعر النبطي','الشعر الفصيح','الشعر الحر','الشعر العمودي'],
      sport:['كرة القدم','كرة السلة','الكرة الطائرة','التنس','السباحة'],
      emirate:['أبوظبي','دبي','الشارقة','عجمان','رأس الخيمة','الفجيرة'],
      relation:['ابنته','أخته','زوجته','ابنة أخيه','صديقه','زميله'],
    };
    const src=pools[kind]||[];return src.filter(x=>norm(x)!==norm(q.correctAnswer)).slice(0,3);
  }

  function getDistractors(q){
    // Prefer hand-curated distractors whenever they are semantically valid.
    if(curatedPlausible(q))return [...q.wrongAnswers].slice(0,3);
    let out=semanticCandidates(q);
    if(out.length<3)out=[...out,...controlledFallback(q).filter(x=>!out.some(y=>norm(y)===norm(x)))];
    const existing=(q.wrongAnswers||[]).filter(x=>x&&norm(x)!==norm(q.correctAnswer));
    for(const x of existing){if(out.length===3)break;if(!out.some(y=>norm(y)===norm(x)))out.push(x);}
    return out.slice(0,3);
  }

  // Rebuild normal MCQ choices. This runs after V32 and restores good curated options instead of replacing them with unrelated answers.
  QUESTIONS.forEach(q=>{
    q.answerKind=expectedKind(q);
    if(q.questionType==='mcq'){
      const d=getDistractors(q);
      if(d.length===3)q.wrongAnswers=d;
    }
  });

  shuffledAnswers=function(q){
    const d=getDistractors(q);
    return [...d,q.correctAnswer].sort(()=>Math.random()-.5);
  };
  buildChoiceAssist=function(q){return getDistractors(q);};

  // Additional 400-point quality gate: obvious prompts become 200 so medium remains clearly harder.
  const weak400=/يدور حول أي رياضة|أي كوكب.*ارتبط|أي كوكب.*محتوى|من بطل .*؟$|من بطلة .*؟$|ما نوع الحيوان|أي قناة .*تابعة|ما اسم .* الموجود في العنوان/;
  QUESTIONS.forEach(q=>{
    if(q.difficulty==='medium'&&weak400.test(norm(q.questionText))){q.difficulty='easy';q.points=200;}
  });

  console.info('Laffha V33 MCQ quality pass ready');
})();