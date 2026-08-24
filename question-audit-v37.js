// V37 — stricter question audit: remove self-revealing items, tighten distractors, and raise real difficulty.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const byId=id=>QUESTIONS.find(q=>q.questionID===id);
  const dropIds=new Set([
    // Cartoon questions where the answer is effectively stated in the title/question.
    'car29-e03','car29-e06','car29-e10','car29-e12','car29-e13','car29-e16',
    // Very obvious category-label questions that add little challenge.
    'car29-m08','car29-m10','car29-m20'
  ]);

  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(dropIds.has(String(QUESTIONS[i]?.questionID||''))) QUESTIONS.splice(i,1);
  }

  function patch(id,changes){const q=byId(id);if(q)Object.assign(q,changes);return q;}

  // -------- Explicit live-test fixes --------
  patch('car29-e08',{
    questionText:'أي سلسلة عالمية عُرفت عربيًا باسم «أبطال الديجيتال»؟',
    correctAnswer:'Digimon Adventure',
    wrongAnswers:['Pokémon','Monster Rancher','Beyblade'],
    hint:'عمل ياباني عن أطفال وعالم رقمي.',
    difficulty:'easy',points:200,subCategory:'shows'
  });

  patch('art29-h16',{
    wrongAnswers:['كرامة مرسال','محمد مرشد ناجي','أيوب طارش'],
    hint:'كل الخيارات أصوات يمنية بارزة؛ ركزوا على تريم واللون الحضرمي.'
  });

  // These are good questions, but not 600-level precision. Keep them at 400.
  ['art29-h14','art29-h15','art29-h17','art29-h18','art29-h19','art29-h20'].forEach(id=>{
    const q=byId(id);if(q){q.difficulty='medium';q.points=400;}
  });

  patch('spo29-m12',{
    wrongAnswers:['41.195 كم','42.500 كم','43.195 كم'],
    hint:'الرقم يبدأ بـ 42 كيلومترًا وكسور.'
  });
  patch('spo29-h06',{
    wrongAnswers:['9.63 ثانية','9.69 ثانية','9.72 ثانية'],
    hint:'كل الخيارات أقل من 10 ثوانٍ؛ الفرق أجزاء من الثانية.'
  });
  patch('spo29-h17',{
    wrongAnswers:['20.975 كم','21.195 كم','21.500 كم'],
    hint:'المسافة تزيد قليلًا على 21 كيلومترًا.'
  });
  patch('spo29-h15',{
    questionText:'أي بطولة من هذه هي بطولة منتخبات الرجال الدولية في التنس؟',
    correctAnswer:'كأس ديفيز',
    wrongAnswers:['كأس ليفر','كأس هوبمان','كأس بيلي جين كينغ'],
    hint:'إحداها مخصصة تاريخيًا لمنتخبات الرجال.'
  });
  patch('spo29-h16',{
    questionText:'أي جهاز في الجمباز الفني للرجال يُعرف بالإنجليزية باسم Pommel Horse؟',
    correctAnswer:'حصان الحلق',
    wrongAnswers:['حصان القفز','العقلة','المتوازي'],
    hint:'جهاز يعتمد على الارتكاز باليدين والحركات الدائرية.'
  });

  // Questions whose wording gives away the numeric answer are easier than 400.
  ['spo29-m18','spo29-m19'].forEach(id=>{const q=byId(id);if(q){q.difficulty='easy';q.points=200;}});

  // -------- Global MCQ hygiene --------
  function uniqueWrong(q){
    const seen=new Set([norm(q.correctAnswer)]),out=[];
    for(const x of (q.wrongAnswers||[])){
      const k=norm(x);if(!k||seen.has(k))continue;
      seen.add(k);out.push(String(x));
    }
    q.wrongAnswers=out.slice(0,3);
  }

  // For numeric answers, keep every distractor numeric, same unit, and deliberately close.
  function tightenNumeric(q){
    if(q.questionType!=='mcq')return;
    const a=String(q.correctAnswer||'').trim();
    const m=a.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);
    if(!m)return;
    const value=Number(m[1]),unit=m[2].trim();
    if(!Number.isFinite(value))return;
    // Leave explicitly curated decimals/distances above untouched.
    if(['spo29-m12','spo29-h06','spo29-h17'].includes(q.questionID))return;
    let vals=[];
    if(/^\d{4}$/.test(m[1])){
      vals=[value-2,value-1,value+1,value+2];
    }else if(Number.isInteger(value)){
      const step=value>=20?1:1;
      vals=[value-step,value+step,value+2*step,value-2*step].filter(v=>v>=0);
    }else{
      const dp=(m[1].split('.')[1]||'').length;
      const delta=dp>=3?Math.pow(10,-dp)*100:Math.max(Math.abs(value)*0.02,Math.pow(10,-Math.max(1,dp)));
      vals=[value-delta,value+delta,value+2*delta,value-2*delta];
    }
    const dp=(m[1].split('.')[1]||'').length;
    q.wrongAnswers=vals.filter(v=>v!==value).slice(0,3).map(v=>`${dp?Number(v).toFixed(dp):Math.round(v)}${unit?' '+unit:''}`);
  }

  QUESTIONS.forEach(q=>{
    if(q.questionType==='mcq'){
      uniqueWrong(q);
      tightenNumeric(q);
      uniqueWrong(q);
    }
  });

  // Final safeguard: if an MCQ somehow has fewer than 3 authored choices, use only very strict peers.
  QUESTIONS.forEach(q=>{
    if(q.questionType!=='mcq'||(q.wrongAnswers||[]).length>=3)return;
    const need=3-(q.wrongAnswers||[]).length;
    const peers=QUESTIONS.filter(x=>x!==q&&x.correctAnswer&&x.category===q.category&&x.subCategory===q.subCategory&&x.difficulty===q.difficulty)
      .map(x=>x.correctAnswer)
      .filter((x,i,a)=>a.indexOf(x)===i&&norm(x)!==norm(q.correctAnswer)&&!(q.wrongAnswers||[]).some(w=>norm(w)===norm(x)));
    q.wrongAnswers=[...(q.wrongAnswers||[]),...peers.slice(0,need)];
  });

  console.info('Laffha V37 question audit ready', {questions:QUESTIONS.length});
})();