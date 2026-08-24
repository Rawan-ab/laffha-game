// V34 — preserve curated MCQ answers, create close/credible choices only when needed, and tighten difficulty.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const allQuestions=()=>Array.isArray(QUESTIONS)?QUESTIONS:[];
  const byText=needle=>allQuestions().filter(q=>norm(q.questionText).includes(norm(needle)));
  const byId=id=>allQuestions().find(q=>q.questionID===id);

  // -------- Explicit fixes from live testing --------
  byText('100 متر').filter(q=>/بولت|يوسين/.test(q.questionText)).forEach(q=>{
    q.questionType='mcq'; q.correctAnswer='9.58 ثانية';
    q.wrongAnswers=['9.63 ثانية','9.69 ثانية','9.72 ثانية'];
    q.difficulty='hard'; q.points=600;
  });

  byText('أمم أفريقيا 2019').forEach(q=>{
    if(norm(q.correctAnswer).includes('الجزائر')){
      q.wrongAnswers=['مصر','تونس','المغرب'];
      q.difficulty='medium'; q.points=400;
    }
  });

  byText('صبري قليل').forEach(q=>{
    q.correctAnswer='شيرين عبدالوهاب';
    q.wrongAnswers=['أنغام','آمال ماهر','أصالة'];
    q.difficulty='medium'; q.points=400;
    q.subCategory='performer'; q.regionTag='Egypt'; q.eraTag='2000s';
  });

  const sesame=byId('car29-m12');
  if(sesame){
    sesame.difficulty='easy'; sesame.points=200;
    sesame.correctAnswer='خوخة'; sesame.wrongAnswers=['فلفل','نمنم','نعمان'];
  }

  byText('شاعر المليون').forEach(q=>{
    q.questionType='mcq'; q.difficulty='medium'; q.points=400;
    q.questionText='برنامج «شاعر المليون» يرتبط بأكاديمية الشعر في أي إمارة إماراتية؟';
    q.correctAnswer='أبوظبي'; q.wrongAnswers=['دبي','الشارقة','عجمان'];
    q.hint='من أبرز مشاريع الشعر النبطي في دولة الإمارات.';
  });

  // -------- Logo safety: never reveal the brand name in the question area --------
  const revealingLogoIds=new Set([
    'log29-e09','log29-e14','log29-e15','log29-e18',
    'log29-m03','log29-m06','log29-m07','log29-m09','log29-m12','log29-m13','log29-m14','log29-m15','log29-m16','log29-m19','log29-m20',
    'log29-h01','log29-h03','log29-h04','log29-h05','log29-h08','log29-h13','log29-h14','log29-h15','log29-h20'
  ]);
  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(revealingLogoIds.has(String(QUESTIONS[i]?.questionID||'')))QUESTIONS.splice(i,1);
  }
  QUESTIONS.forEach(q=>{if(q.questionType==='logo'){q.logoSub='';q.logoText='؟';q.questionText='وش هذا الشعار؟';}});

  // -------- Difficulty policy --------
  // 600 should test precise knowledge, not simply identify a famous performer.
  QUESTIONS.forEach(q=>{
    const t=norm(q.questionText);
    if(q.category==='songs' && q.difficulty==='hard' && /من غن[ّىت]|من صاحب أغنية/.test(t)){
      q.difficulty='medium'; q.points=400;
    }
    if(q.difficulty==='medium' && /ما نوع الحيوان|أي قناة .*تابعة|أي كوكب.*محتوى|يدور حول أي رياضة|في أي رياضة اشتهر/.test(t)){
      q.difficulty='easy'; q.points=200;
    }
  });

  // -------- Choice families --------
  const COUNTRY_POOLS={
    Saudi:['السعودية','الإمارات','الكويت','قطر','البحرين','عُمان'],
    Gulf:['السعودية','الإمارات','الكويت','قطر','البحرين','عُمان'],
    Egypt:['مصر','السودان','ليبيا','تونس','الأردن'],
    Maghreb:['المغرب','الجزائر','تونس','ليبيا','موريتانيا'],
    Morocco:['المغرب','الجزائر','تونس','مصر','موريتانيا'],
    Algeria:['الجزائر','المغرب','تونس','مصر','ليبيا'],
    Tunisia:['تونس','الجزائر','المغرب','ليبيا','مصر'],
    Levant:['سوريا','لبنان','الأردن','فلسطين','العراق'],
    Lebanon:['لبنان','سوريا','الأردن','فلسطين','مصر'],
    Syria:['سوريا','لبنان','الأردن','العراق','فلسطين'],
    Iraq:['العراق','سوريا','الأردن','الكويت','السعودية'],
    World:['البرازيل','الأرجنتين','فرنسا','ألمانيا','إسبانيا','إيطاليا','البرتغال','هولندا']
  };
  const EMIRATES=['أبوظبي','دبي','الشارقة','عجمان','رأس الخيمة','الفجيرة','أم القيوين'];
  const ARAB_CAPITALS=['الرياض','أبوظبي','الدوحة','الكويت','مسقط','المنامة','القاهرة','عمّان','بيروت','دمشق','بغداد','الرباط','الجزائر','تونس','الخرطوم'];
  const SPORTS=['كرة القدم','كرة السلة','الكرة الطائرة','التنس','السباحة','ألعاب القوى','الملاكمة','الجودو','الغولف','الفورمولا 1'];
  const RELATIONS=['ابنته','أخته','زوجته','ابنة أخيه','ابنه','أخوه','زميله','صديقه'];
  const CHANNELS=['سبيستون','MBC3','براعم','ماجد','طيور الجنة','CN بالعربية'];
  const SURFACES=['العشبية','الترابية','الصلبة','المطاطية'];
  const POETRY=['الشعر النبطي','الشعر الفصيح','الشعر الحر','الشعر العمودي'];

  function regionOf(q){return q.regionTag||q.countryRegionTags?.[0]||'World';}
  function inferFamily(q){
    const t=norm(q.questionText),a=String(q.correctAnswer||'').trim();
    if(/أي إمارة|في أي إمارة/.test(t))return 'emirate';
    if(/عاصمة/.test(t))return 'capital';
    if(/أي دولة|أي بلد|من أي دولة|من أي بلد|إنتاج أي بلد|ينتمي.*دولة|ينتمي.*بلد/.test(t))return 'country';
    if(/أي رياضة|ما الرياضة|في أي رياضة|حول أي رياضة/.test(t))return 'sport';
    if(/أرضية/.test(t))return 'surface';
    if(/ما صلة|صلة .*ب/.test(t))return 'relation';
    if(/أي قناة|ما اسم القناة|قناة .*؟/.test(t))return 'channel';
    if(/نوع من الشعر|نوع الشعر/.test(t))return 'poetry';
    if(/أي سنة|في أي سنة|أي عام|في أي عام/.test(t)||/^\d{4}$/.test(a))return 'year';
    if(/100 متر/.test(t)&&/ثانية/.test(a))return 'seconds';
    if(/كم|عدد|طول|مسافة|رقم قياسي/.test(t)&&/\d/.test(a))return 'numeric';
    if(q.category==='songs'&&/من غن|من صاحب أغنية/.test(t))return 'singer';
    if(q.category==='songs'&&/من لحن/.test(t))return 'composer';
    if(q.category==='songs'&&/من كتب|من كلمات/.test(t))return 'lyricist';
    if((q.category==='tv'||q.category==='movies')&&/من جسد|من جسّد|من أدى|من بطل|من بطلة/.test(t))return 'actor';
    if((q.category==='tv'||q.category==='movies')&&/من أخرج/.test(t))return 'director';
    if((q.category==='tv'||q.category==='movies')&&/من كتب|من مؤلف/.test(t))return 'writer';
    if(/ما اسم الشخصية|من الشخصية/.test(t))return 'character';
    if(/ما اسم (المسلسل|الفيلم|الأغنية|الاغنية|البرنامج|العمل)/.test(t))return 'title';
    return q.subCategory||'general';
  }

  function closeNumericChoices(q){
    const a=String(q.correctAnswer||'').trim();
    const m=a.match(/(-?\d+(?:\.\d+)?)\s*(.*)/);
    if(!m)return [];
    const value=Number(m[1]),unit=m[2].trim();
    if(!Number.isFinite(value))return [];
    let vals=[];
    if(/^\d{4}$/.test(m[1])) vals=[value-4,value-2,value+2,value+4];
    else if(unit.includes('ثانية')) vals=[value+0.05,value+0.11,value+0.14,value-0.04];
    else if(Math.abs(value)<=10) vals=[value-1,value+1,value+2,value-2];
    else vals=[value*.95,value*1.05,value*.9,value*1.1];
    const dp=(m[1].split('.')[1]||'').length;
    return vals.filter(v=>v!==value).map(v=>`${dp?Number(v).toFixed(dp):Math.round(v)}${unit?' '+unit:''}`);
  }

  function sameFamilyCandidates(q){
    const fam=inferFamily(q),reg=regionOf(q);
    const pool=QUESTIONS.filter(x=>x!==q&&x.correctAnswer&&norm(x.correctAnswer)!==norm(q.correctAnswer)&&inferFamily(x)===fam);
    return pool.map(x=>({a:x.correctAnswer,score:(x.category===q.category?8:0)+(x.subCategory&&x.subCategory===q.subCategory?7:0)+(regionOf(x)===reg?5:0)+(x.eraTag&&x.eraTag===q.eraTag?3:0)+(x.difficulty===q.difficulty?2:0)+Math.random()})).sort((a,b)=>b.score-a.score).map(x=>x.a);
  }

  function fallbackPool(q){
    const fam=inferFamily(q),reg=regionOf(q),a=String(q.correctAnswer||'').trim();
    if(fam==='emirate')return EMIRATES;
    if(fam==='capital')return ARAB_CAPITALS;
    if(fam==='sport')return SPORTS;
    if(fam==='relation')return RELATIONS;
    if(fam==='channel')return CHANNELS;
    if(fam==='surface')return SURFACES;
    if(fam==='poetry')return POETRY;
    if(fam==='country')return COUNTRY_POOLS[reg]||COUNTRY_POOLS.World;
    if(fam==='year'||fam==='numeric'||fam==='seconds')return closeNumericChoices(q);
    return [];
  }

  function unique3(list,correct){
    const seen=new Set([norm(correct)]),out=[];
    for(const x of list){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x);if(out.length===3)break;}
    return out;
  }

  // IMPORTANT: Standard MCQs keep their authored bank choices. No automatic replacement.
  shuffledAnswers=function(q){
    const authored=unique3(q.wrongAnswers||[],q.correctAnswer);
    let wrong=authored;
    if(wrong.length<3)wrong=unique3([...sameFamilyCandidates(q),...fallbackPool(q)],q.correctAnswer);
    return [...wrong.slice(0,3),q.correctAnswer].sort(()=>Math.random()-.5);
  };

  // "Add choices" is the only place where the engine generates new distractors.
  buildChoiceAssist=function(q){
    return unique3([...sameFamilyCandidates(q),...fallbackPool(q),...(q.wrongAnswers||[])],q.correctAnswer);
  };

  finalLogo=function(q){
    if(q.mediaURL)return `<div class="logo-question"><div class="logo-media"><img src="${q.mediaURL}" alt="" aria-label="شعار بدون اسم" onerror="this.parentElement.innerHTML='<div class=&quot;logo-fallback&quot;>؟</div>'"></div></div>`;
    return `<div class="logo-question"><div class="logo-fallback">؟</div></div>`;
  };

  console.info('Laffha V34 curated choice engine ready');
})();