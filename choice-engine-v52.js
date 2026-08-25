// V52 — strict contextual answer choices. Preserve authored distractors first; never mix answer types.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const textOf=q=>norm(q?.questionText||q?.question||'');
  const uniq=(arr,correct)=>{const seen=new Set([norm(correct)]),out=[];for(const x of arr||[]){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(String(x));}return out;};

  const ELEMENTS=['الذهب','الفضة','النحاس','الحديد','الزئبق','الألومنيوم','البلاتين','القصدير','الرصاص','النيكل','الزنك','الكوبالت','التنغستن','الكربون','الأكسجين','الهيدروجين','الهيليوم','الصوديوم','البوتاسيوم','الكالسيوم'];
  const PLANETS=['عطارد','الزهرة','الأرض','المريخ','المشتري','زحل','أورانوس','نبتون'];
  const OCEANS=['المحيط الهادئ','المحيط الأطلسي','المحيط الهندي','المحيط المتجمد الشمالي','المحيط الجنوبي'];
  const EMIRATES=['أبوظبي','دبي','الشارقة','عجمان','رأس الخيمة','الفجيرة','أم القيوين'];
  const CAPITALS=['الرياض','أبوظبي','الدوحة','الكويت','مسقط','المنامة','القاهرة','عمّان','بيروت','دمشق','بغداد','الرباط','الجزائر','تونس'];
  const SPORTS=['كرة القدم','كرة السلة','الكرة الطائرة','التنس','السباحة','ألعاب القوى','الملاكمة','الجودو','الغولف','الفورمولا 1'];
  const RELATIONS=['ابنته','أخته','زوجته','ابنة أخيه','ابنه','أخوه','زميله','صديقه'];
  const CHANNELS=['سبيستون','MBC3','براعم','ماجد','طيور الجنة','CN بالعربية'];
  const COUNTRIES=['السعودية','الإمارات','الكويت','قطر','البحرين','عُمان','مصر','الأردن','لبنان','العراق','المغرب','الجزائر','تونس','بريطانيا','فرنسا','ألمانيا','إسبانيا','إيطاليا','اليابان','كوريا الجنوبية','الصين','الهند','كندا','الولايات المتحدة','البرازيل','الأرجنتين'];

  function family(q){
    const t=textOf(q),sub=String(q?.subCategory||'').toLowerCase(),a=String(q?.correctAnswer||'').trim();
    // Very specific families first.
    if(/رمزه الكيميائي|رمز.*كيميائي|العنصر الذي رمزه|عنصر كيميائي/.test(t))return 'element';
    if(/أي كوكب|ما الكوكب|كوكب/.test(t))return 'planet';
    if(/أي محيط|ما المحيط|أكبر محيط/.test(t))return 'ocean';
    if(/أي إمارة|في أي إمارة/.test(t))return 'emirate';
    if(/عاصمة/.test(t))return 'capital';
    if(/أي دولة|أي بلد|من إنتاج أي دولة|من إنتاج أي بلد|الدولة الأصلية/.test(t)||sub==='country')return 'country';
    if(/في أي مدينة|ما المدينة|أي مدينة/.test(t))return 'city';
    if(/ما صلة|صلة .*ب/.test(t))return 'relation';
    if(/أي قناة|ما اسم القناة/.test(t)||sub==='channels')return 'channel';
    if(/أي رياضة|ما الرياضة|في أي رياضة/.test(t)||sub==='sports')return 'sport';
    if(/من غن|من صاحب أغنية/.test(t)||sub==='performer')return 'singer';
    if(/من لحن/.test(t)||sub==='composer')return 'composer';
    if(/من كتب|من كلمات|كتبها من/.test(t)&&q?.category==='songs')return 'lyricist';
    if(/من أخرج|المخرج/.test(t)||sub==='director')return 'director';
    // Creator MUST be checked before actor because stems such as Fleabag contain the word بطولة.
    if((/كاتب|كاتبة|مؤلف|مؤلفة|ابتكر|ابتكرت|كتبت|كتب .*مسلسل|أنشأ|أنشأت/.test(t)||sub==='creator')&&['tv','movies','cartoons'].includes(q?.category))return 'creator';
    if(/من أدى|من ادّى|من جسد|من جسّد|بطولة|بطل الفيلم|بطلة الفيلم|بطل المسلسل|بطلة المسلسل/.test(t)||sub==='actor')return 'actor';
    if(/ما اسم الشخصية|من الشخصية|ما اسم .*شخصية/.test(t)||sub==='characters'||sub==='character')return 'character';
    if(/أي فيلم|ما اسم الفيلم|أي مسلسل|ما اسم المسلسل|أي عمل|ما اسم العمل|أي أغنية|ما اسم الأغنية|أي برنامج|ما اسم البرنامج/.test(t)||['title','shows','originaltitles'].includes(sub))return 'title';
    if(/أي سنة|في أي سنة|أي عام|في أي عام/.test(t)||/^\d{4}$/.test(a))return 'year';
    if(/^[-+]?\d+(?:\.\d+)?\s*/.test(a))return 'numeric';
    return sub||'general';
  }

  function closeNumeric(q){
    const a=String(q?.correctAnswer||'').trim(),m=a.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);if(!m)return [];
    const n=Number(m[1]),unit=m[2].trim(),dp=(m[1].split('.')[1]||'').length;if(!Number.isFinite(n))return [];
    if(/عدد لاعبي.*كرة القدم/.test(textOf(q)))return ['10','12','9'];
    let vals=[];
    if(/^\d{4}$/.test(m[1]))vals=[n-2,n-1,n+1,n+2];
    else if(unit.includes('ثانية'))vals=[n+.05,n+.08,n+.11,n-.04];
    else if(dp>=2){const d=Math.pow(10,-dp)*Math.max(5,Math.round(Math.abs(n)*2));vals=[n-d,n+d,n+2*d,n-2*d];}
    else if(n>=20)vals=[n-2,n-1,n+1,n+2];
    else vals=[n-1,n+1,n+2,n-2];
    return vals.filter(v=>v>=0&&v!==n).map(v=>`${dp?Number(v).toFixed(dp):Math.round(v)}${unit?' '+unit:''}`);
  }

  function fallback(q){
    const fam=family(q);
    if(fam==='element')return ELEMENTS;
    if(fam==='planet')return PLANETS;
    if(fam==='ocean')return OCEANS;
    if(fam==='emirate')return EMIRATES;
    if(fam==='capital')return CAPITALS;
    if(fam==='sport')return SPORTS;
    if(fam==='relation')return RELATIONS;
    if(fam==='channel')return CHANNELS;
    if(fam==='country')return COUNTRIES;
    if(fam==='year'||fam==='numeric')return closeNumeric(q);
    return [];
  }

  function peers(q){
    const fam=family(q),sub=String(q?.subCategory||''),reg=String(q?.regionTag||''),era=String(q?.eraTag||'');
    return (window.QUESTIONS||[]).filter(x=>x!==q&&x?.correctAnswer&&family(x)===fam&&norm(x.correctAnswer)!==norm(q.correctAnswer))
      .map(x=>{
        let s=0;
        if(x.category===q.category)s+=20;
        if(sub&&x.subCategory===sub)s+=18;
        if(reg&&x.regionTag===reg)s+=12;
        if(era&&x.eraTag===era)s+=6;
        if(x.difficulty===q.difficulty)s+=3;
        return {a:x.correctAnswer,s:s+Math.random()};
      }).sort((a,b)=>b.s-a.s).map(x=>x.a);
  }

  function isOpenEnded(q){
    const t=textOf(q),a=norm(q?.correctAnswer||'');
    return /اذكر مثال|اذكر اسم .* غير|أعط مثال|اعط مثال|سمّ مثال|سمي مثال/.test(t)||/^مثل[:：]/.test(a)||q?.subCategory==='example'||q?.formatTag==='example';
  }

  function strictWrongs(q){
    if(!q||isOpenEnded(q))return [];
    const authored=uniq(q.wrongAnswers||[],q.correctAnswer);
    // Hand-authored choices are the gold standard. Never replace a complete authored set.
    if(authored.length>=3)return authored.slice(0,3);
    const curated=fallback(q);
    const sameFamily=peers(q);
    // Supplement only from exact answer family. Never fall back to category-wide random answers.
    return uniq([...authored,...curated,...sameFamily],q.correctAnswer).slice(0,3);
  }

  // Restore/lock known high-quality authored choices seen in live testing.
  const fleabag=(window.QUESTIONS||[]).find(q=>q.questionID==='gtv38-h04');
  if(fleabag)fleabag.wrongAnswers=['ميكايلا كويل','شارون هورغان','سالي وينرايت'];
  const au=(window.QUESTIONS||[]).find(q=>q.questionID==='fmt40-gen-m02');
  if(au)au.wrongAnswers=['الفضة','النحاس','الزئبق'];

  // Normal MCQ rendering: preserve authored choices; otherwise use strict contextual supplements.
  window.shuffledAnswers=function(q){
    if(q?.questionType!=='mcq')return [];
    const wrong=strictWrongs(q);
    if(wrong.length<3)return [...wrong,String(q.correctAnswer||'')].sort(()=>Math.random()-.5);
    return [...wrong.slice(0,3),String(q.correctAnswer||'')].sort(()=>Math.random()-.5);
  };

  // Add Choices assistance uses the exact same strict engine.
  window.buildChoiceAssist=function(q){return strictWrongs(q);};

  // Remove Add Choices from open-ended/example questions where a single MCQ answer would be misleading.
  const prevQuestion=window.question;
  if(typeof prevQuestion==='function'){
    window.question=function(){
      prevQuestion();
      const q=state?.currentQuestion;
      if(q&&isOpenEnded(q)){
        const btn=document.getElementById('giveChoices');
        if(btn)btn.remove();
      }
    };
  }

  console.info('Laffha V52 strict contextual choice engine ready');
})();