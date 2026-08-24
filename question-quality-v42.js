// V42 — stricter answer relevance + proper multi-blank song completion.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const textOf=q=>norm(q.questionText||q.question||'');
  const regionOf=q=>String(q.regionTag||q.countryRegionTags?.[0]||'World');
  const uniq=(arr,correct)=>{const seen=new Set([norm(correct)]),out=[];for(const x of arr||[]){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(String(x));}return out;};

  function family(q){
    const t=textOf(q),sub=String(q.subCategory||'').toLowerCase(),a=String(q.correctAnswer||'').trim();
    if(/أي إمارة|في أي إمارة/.test(t))return 'emirate';
    if(/عاصمة/.test(t))return 'capital';
    if(/أي دولة|أي بلد|من إنتاج أي دولة|من إنتاج أي بلد|الدولة الأصلية/.test(t)||sub==='country')return 'country';
    if(/في أي مدينة|ما المدينة|أي مدينة/.test(t))return 'city';
    if(/ما صلة|صلة .*ب/.test(t))return 'relation';
    if(/أي قناة|ما اسم القناة/.test(t)||sub==='channels')return 'channel';
    if(/أي رياضة|ما الرياضة|في أي رياضة/.test(t)||sub==='sports')return 'sport';
    if(/من غن|من صاحب أغنية/.test(t)||sub==='performer')return 'singer';
    if(/من لحن/.test(t)||sub==='composer')return 'composer';
    if(/من كتب|من كلمات|كتبها من/.test(t)&&q.category==='songs')return 'lyricist';
    if(/من أخرج|المخرج/.test(t)||sub==='director')return 'director';
    if(/من أدى|من ادّى|من جسد|من جسّد|بطولة|بطل الفيلم|بطلة الفيلم|بطل المسلسل|بطلة المسلسل/.test(t)||sub==='actor')return 'actor';
    if((/كاتب|مؤلف|ابتكر/.test(t)||sub==='creator')&&(q.category==='tv'||q.category==='movies'||q.category==='cartoons'))return 'creator';
    if(/ما اسم الشخصية|من الشخصية|ما اسم .*شخصية/.test(t)||sub==='characters'||sub==='character')return 'character';
    if(/أي فيلم|ما اسم الفيلم|أي مسلسل|ما اسم المسلسل|أي عمل|ما اسم العمل|أي أغنية|ما اسم الأغنية|أي برنامج|ما اسم البرنامج/.test(t)||['title','shows','originaltitles'].includes(sub))return 'title';
    if(/أي سنة|في أي سنة|أي عام|في أي عام/.test(t)||/^\d{4}$/.test(a))return 'year';
    if(/^[-+]?\d+(?:\.\d+)?\s*/.test(a))return 'numeric';
    return sub||'general';
  }

  function macroRegion(r){
    r=String(r||'').toLowerCase();
    if(/saudi|gulf|uae|kuwait|qatar|bahrain|oman/.test(r))return 'Gulf';
    if(/egypt|sudan|libya/.test(r))return 'EgyptArea';
    if(/lebanon|syria|jordan|palestine|iraq|levant/.test(r))return 'Levant';
    if(/morocco|algeria|tunisia|maghreb|mauritania/.test(r))return 'Maghreb';
    if(/japan|korea|china|taiwan|hong kong/.test(r))return 'EastAsia';
    if(/india|pakistan|bangladesh|nepal|sri lanka/.test(r))return 'SouthAsia';
    if(/turkey|iran/.test(r))return 'WestAsia';
    if(/usa|canada|america/.test(r))return 'NorthAmerica';
    if(/mexico|brazil|argentina|colombia|chile/.test(r))return 'LatinAmerica';
    if(/uk|france|germany|spain|italy|denmark|sweden|norway|finland|iceland|europe/.test(r))return 'Europe';
    return 'World';
  }

  const COUNTRY_POOLS={
    Gulf:['السعودية','الإمارات','الكويت','قطر','البحرين','عُمان'],
    EgyptArea:['مصر','السودان','ليبيا','تونس','الأردن'],
    Levant:['لبنان','سوريا','الأردن','فلسطين','العراق'],
    Maghreb:['المغرب','الجزائر','تونس','ليبيا','موريتانيا'],
    EastAsia:['اليابان','كوريا الجنوبية','الصين','تايوان','هونغ كونغ'],
    SouthAsia:['الهند','باكستان','بنغلاديش','نيبال','سريلانكا'],
    WestAsia:['تركيا','إيران','أذربيجان','جورجيا','أرمينيا'],
    NorthAmerica:['الولايات المتحدة','كندا','المكسيك'],
    LatinAmerica:['البرازيل','الأرجنتين','المكسيك','تشيلي','كولومبيا'],
    Europe:['بريطانيا','فرنسا','ألمانيا','إسبانيا','إيطاليا','الدنمارك','السويد','هولندا'],
    World:['البرازيل','الأرجنتين','فرنسا','ألمانيا','إسبانيا','إيطاليا','اليابان','كوريا الجنوبية']
  };
  const EMIRATES=['أبوظبي','دبي','الشارقة','عجمان','رأس الخيمة','الفجيرة','أم القيوين'];
  const CAPITALS=['الرياض','أبوظبي','الدوحة','الكويت','مسقط','المنامة','القاهرة','عمّان','بيروت','دمشق','بغداد','الرباط','الجزائر','تونس'];
  const SPORTS=['كرة القدم','كرة السلة','الكرة الطائرة','التنس','السباحة','ألعاب القوى','الملاكمة','الجودو','الغولف','الفورمولا 1'];
  const RELATIONS=['ابنته','أخته','زوجته','ابنة أخيه','ابنه','أخوه','زميله','صديقه'];
  const CHANNELS=['سبيستون','MBC3','براعم','ماجد','طيور الجنة','CN بالعربية'];

  function closeNumeric(q){
    const a=String(q.correctAnswer||'').trim(),m=a.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/);if(!m)return [];
    const n=Number(m[1]),unit=m[2].trim(),dp=(m[1].split('.')[1]||'').length;if(!Number.isFinite(n))return [];
    let vals=[];
    if(/^\d{4}$/.test(m[1]))vals=[n-2,n-1,n+1,n+2];
    else if(unit.includes('ثانية'))vals=[n+.05,n+.08,n+.11,n-.04];
    else if(dp>=2){const d=Math.pow(10,-dp)*Math.max(5,Math.round(Math.abs(n)*2));vals=[n-d,n+d,n+2*d,n-2*d];}
    else if(n>=20)vals=[n-2,n-1,n+1,n+2];
    else vals=[n-1,n+1,n+2,n-2];
    return vals.filter(v=>v>=0&&v!==n).map(v=>`${dp?Number(v).toFixed(dp):Math.round(v)}${unit?' '+unit:''}`);
  }

  function franchise(q){
    const s=norm(`${q.questionText||''} ${q.correctAnswer||''}`);
    const maps=[
      ['conan',/كونان|شينتشي|ران موري|كوغورو|المنظمة السوداء|غوشو أوياما/],
      ['doraemon',/دورايمون|نوبيتا|دورامي/],
      ['pokemon',/بوكيمون|بيكاتشو|آش|روكيت/],
      ['onepiece',/ون بيس|لوفي|زورو|سانجي|قبعة القش/],
      ['naruto',/ناروتو|ساسكي|ساكورا|كاكاشي|أوتشيها/],
      ['dragonball',/دراغون بول|غوكو|فيجيتا|سايان/]
    ];
    return (maps.find(x=>x[1].test(s))||[])[0]||'';
  }

  function peerAnswers(q){
    const fam=family(q),reg=regionOf(q),macro=macroRegion(reg),fr=franchise(q);
    return QUESTIONS.filter(x=>x!==q&&x.correctAnswer&&family(x)===fam&&norm(x.correctAnswer)!==norm(q.correctAnswer))
      .map(x=>{
        let score=0;
        if(x.category===q.category)score+=14;
        if(x.subCategory&&x.subCategory===q.subCategory)score+=12;
        if(regionOf(x)===reg)score+=8;
        else if(macroRegion(regionOf(x))===macro)score+=5;
        if(x.eraTag&&x.eraTag===q.eraTag)score+=4;
        if(x.difficulty===q.difficulty)score+=2;
        if(fr&&franchise(x)===fr)score+=18;
        return {a:x.correctAnswer,score:score+Math.random()};
      }).sort((a,b)=>b.score-a.score).map(x=>x.a);
  }

  function fallback(q){
    const fam=family(q),macro=macroRegion(regionOf(q));
    if(fam==='emirate')return EMIRATES;
    if(fam==='capital')return CAPITALS;
    if(fam==='sport')return SPORTS;
    if(fam==='relation')return RELATIONS;
    if(fam==='channel')return CHANNELS;
    if(fam==='country')return COUNTRY_POOLS[macro]||COUNTRY_POOLS.World;
    if(fam==='year'||fam==='numeric')return closeNumeric(q);
    return [];
  }

  // Specific live-test fix: all options are now robotic/animated cat-like characters.
  const dora=QUESTIONS.find(q=>q.questionID==='car29-m18');
  if(dora){
    dora.wrongAnswers=['دورامي','روبونيان','كورو-تشان'];
    dora.hint='كل الخيارات شخصيات آلية/قطط من أعمال رسوم يابانية؛ ركزوا على الأشهر.';
  }

  // Remove weak song-title completions. A song completion must be a real multi-line, multi-blank lyric challenge.
  for(let i=QUESTIONS.length-1;i>=0;i--){
    const q=QUESTIONS[i];
    if(q?.category!=='songs'||q.questionType!=='complete')continue;
    const raw=String(q.questionText||'');
    const blanks=(raw.match(/_{3,}/g)||[]).length;
    const words=norm(raw.replace(/_{3,}/g,' ')).split(/\s+/).filter(Boolean).length;
    const rich=blanks>=3&&words>=10&&q.singer;
    if(!rich)QUESTIONS.splice(i,1);
  }

  // Keep the user-approved lyric-completion pattern: more context, multiple blanks, singer shown.
  const fill=QUESTIONS.find(q=>q.questionID==='song-fill-user-1');
  if(fill){
    Object.assign(fill,{
      difficulty:'hard',points:600,formatTag:'complete',lyricsFill:true,
      singer:'محمد عبده',songTitle:'جمرة غضى',
      questionText:'<div class="song-singer-v42">🎤 محمد عبده</div><div class="song-fill-head-v42">أكمل كلمات الأغنية</div><br>جيتك من ____<br>جفني ____ والنار<br>جمرة ____<br>والله الجفا ____ وقل الوفا برد',
      correctAnswer:'1) الإعصار    2) المطر    3) غضى    4) برد',
      hint:'أربعة فراغات من نفس المقطع.'
    });
  }

  // Final choice engine: use same-answer-family peers first so distractors stay genuinely related.
  shuffledAnswers=function(q){
    if(q.questionType!=='mcq')return [];
    const fam=family(q),authored=uniq(q.wrongAnswers||[],q.correctAnswer);
    let pool=[];

    // Numeric/geographic/fixed families are rebuilt every time from close pools.
    if(['numeric','year','country','emirate','capital','sport','relation','channel'].includes(fam)){
      pool=[...fallback(q),...peerAnswers(q),...authored];
    }
    // People, characters and titles use real answers from matching questions first, then authored choices.
    else if(['singer','composer','lyricist','actor','director','creator','character','title'].includes(fam)){
      pool=[...peerAnswers(q),...authored];
    }
    // Other questions keep carefully authored choices unless they are incomplete.
    else pool=[...authored,...peerAnswers(q),...fallback(q)];

    let wrong=uniq(pool,q.correctAnswer).slice(0,3);
    if(wrong.length<3)wrong=uniq([...wrong,...authored,...peerAnswers(q),...fallback(q)],q.correctAnswer).slice(0,3);
    return [...wrong,q.correctAnswer].sort(()=>Math.random()-.5);
  };

  buildChoiceAssist=function(q){
    return uniq([...peerAnswers(q),...fallback(q),...(q.wrongAnswers||[])],q.correctAnswer).slice(0,3);
  };

  console.info('Laffha V42 answer relevance + rich song fill ready');
})();