// V46 — non-destructive QA audit for the active question bank.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const report={generatedAt:new Date().toISOString(),total:QUESTIONS.length,errors:[],warnings:[],stats:{categories:{},difficulty:{},formats:{}}};
  const byId=new Map(),byKey=new Map();
  const push=(bucket,code,q,detail)=>report[bucket].push({code,id:q?.questionID||'',category:q?.category||'',detail});

  for(const q of QUESTIONS){
    report.stats.categories[q.category]=(report.stats.categories[q.category]||0)+1;
    report.stats.difficulty[q.difficulty]=(report.stats.difficulty[q.difficulty]||0)+1;
    const fmt=q.formatTag||q.questionType||'unknown';
    report.stats.formats[fmt]=(report.stats.formats[fmt]||0)+1;

    if(!q.questionID)push('errors','missing-id',q,'السؤال بدون questionID');
    else if(byId.has(q.questionID))push('errors','duplicate-id',q,`ID مكرر مع ${byId.get(q.questionID).questionID}`);
    else byId.set(q.questionID,q);

    const key=`${q.category}::${norm(q.questionText)}::${norm(q.correctAnswer)}`;
    if(byKey.has(key))push('warnings','duplicate-content',q,`نفس نص السؤال والجواب موجود في ${byKey.get(key).questionID}`);
    else byKey.set(key,q);

    if(!q.category||!q.difficulty||!q.questionType||!q.questionText||q.correctAnswer==null){
      push('errors','missing-core-field',q,'حقل أساسي ناقص');
    }

    if(q.questionType==='mcq'||q.questionType==='logo'){
      const wrong=(q.wrongAnswers||[]).map(norm).filter(Boolean);
      const all=[norm(q.correctAnswer),...wrong];
      if(wrong.length<3)push('errors','not-enough-distractors',q,`عدد المشتتات ${wrong.length} فقط`);
      if(new Set(all).size!==all.length)push('errors','duplicate-choice',q,'يوجد خيار مكرر أو الجواب الصحيح مكرر ضمن المشتتات');
    }

    const text=norm(q.questionText),answer=norm(q.correctAnswer),hint=norm(q.hint);
    if(answer.length>=4&&text.includes(answer)&&q.questionType!=='ordering'){
      push('warnings','answer-in-prompt',q,'الجواب ظاهر حرفيًا داخل السؤال');
    }
    if(answer.length>=4&&hint.includes(answer)){
      push('warnings','answer-in-hint',q,'التلميح يحتوي الجواب حرفيًا');
    }

    if(q.difficulty==='easy'){
      if(q.category==='artists'&&/^ما جنسية/.test(text))push('warnings','easy-nationality',q,'سؤال جنسية مباشر في 200');
      if(q.formatTag==='emoji'&&/🇸🇦|🇰🇼|🇦🇪|🇧🇭|🇶🇦|🇴🇲|🇱🇧|🇪🇬|🇸🇾|🇯🇴|🇲🇦|🇹🇳|🇩🇿|🇮🇶|🇬🇧|🇺🇸|🇫🇷|🇯🇵|🇰🇷|🇪🇸|🇩🇪/.test(q.questionText||'')){
        push('warnings','emoji-country-giveaway',q,'علم دولة داخل سؤال إيموجي 200 قد يكشف الإجابة');
      }
    }

    if(q.category==='songs'&&q.questionType==='complete'){
      const blanks=(String(q.questionText).match(/_{2,}|…|\.\.\./g)||[]).length;
      if(blanks<3)push('warnings','song-fill-too-short',q,`أكمل أغنية فيه ${blanks} فراغ/فراغات فقط`);
    }
  }

  // Concentration warnings by franchise / region per category.
  for(const cat of Object.keys(report.stats.categories)){
    const arr=QUESTIONS.filter(q=>q.category===cat);
    const tags={};
    arr.forEach(q=>{const t=q.franchiseTag||q.regionTag||q.subCategory||'other';tags[t]=(tags[t]||0)+1;});
    const top=Object.entries(tags).sort((a,b)=>b[1]-a[1])[0];
    if(top&&arr.length>=10&&top[1]/arr.length>.28){
      report.warnings.push({code:'content-concentration',category:cat,id:'',detail:`${top[0]} يمثل ${Math.round(top[1]/arr.length*100)}% من الفئة`});
    }
  }

  report.summary={errors:report.errors.length,warnings:report.warnings.length,score:Math.max(0,100-report.errors.length*4-report.warnings.length)};
  window.LAFFHA_QA_REPORT=report;
  window.runLaffhaQaAudit=()=>report;
  console.group('لفّها QA V46');
  console.log('Total questions:',report.total,'Score:',report.summary.score+'/100');
  console.log('Errors:',report.errors);console.log('Warnings:',report.warnings);console.log('Stats:',report.stats);
  console.groupEnd();
})();