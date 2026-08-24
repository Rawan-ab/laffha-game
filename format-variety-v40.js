// V40 — varied question formats + stronger TV/movie world-region rotation.
(function(){
  const add=q=>QUESTIONS.push(q);
  const pts=d=>d==='easy'?200:d==='medium'?400:600;
  const mcq=(id,cat,d,text,ans,wrong,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,points:pts(d),questionType:'mcq',questionText:text,correctAnswer:ans,wrongAnswers:wrong,hint,...meta});
  const direct=(id,cat,d,text,ans,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,points:pts(d),questionType:'direct',questionText:text,correctAnswer:ans,wrongAnswers:[],hint,...meta});
  const complete=(id,cat,d,text,ans,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,points:pts(d),questionType:'complete',questionText:text,correctAnswer:ans,wrongAnswers:[],hint,...meta});
  const ordering=(id,cat,d,text,items,answer,label,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,points:pts(d),questionType:'ordering',questionText:text,items,correctAnswer:answer,orderLabel:label,wrongAnswers:[],hint,...meta});

  // ---------- TV / SERIES: MCQ + ordering + complete + emoji + open ----------
  mcq('fmt40-tv-e01','tv','easy','📄🏢😂 أي مسلسل تمثله هذه الإيموجيات؟','The Office',['Friends','Suits','Brooklyn Nine-Nine'],'الكوميديا تدور في شركة ورق.',{formatTag:'emoji',contentScope:'global',regionTag:'USA',eraTag:'2000s',subCategory:'emoji'});
  mcq('fmt40-tv-m01','tv','medium','👑🇬🇧📺 أي مسلسل تمثله هذه الإيموجيات؟','The Crown',['Downton Abbey','Bridgerton','Victoria'],'دراما عن العائلة المالكة البريطانية.',{formatTag:'emoji',contentScope:'global',regionTag:'UK',eraTag:'2010s',subCategory:'emoji'});
  complete('fmt40-tv-e02','tv','easy','أكمل اسم المسلسل: «باب ___»','الحارة','مسلسل شامي شهير.',{formatTag:'complete',contentScope:'arab',regionTag:'Syria',eraTag:'2000s',subCategory:'title'});
  complete('fmt40-tv-m02','tv','medium','أكمل اسم المسلسل العالمي: «Better Call ___»','Saul','مسلسل مشتق من Breaking Bad.',{formatTag:'complete',contentScope:'global',regionTag:'USA',eraTag:'2010s',subCategory:'title'});
  ordering('fmt40-tv-h01','tv','hard','رتّب هذه المسلسلات حسب بداية عرضها من الأقدم إلى الأحدث.',['Friends','The Office (US)','Breaking Bad','Stranger Things'],'Friends، The Office (US)، Breaking Bad، Stranger Things','الأقدم إلى الأحدث','ابدؤوا بمسلسل التسعينات.',{formatTag:'ordering',contentScope:'global',regionTag:'USA',eraTag:'Mixed',subCategory:'ordering'});
  direct('fmt40-tv-m03','tv','medium','اذكر مثالًا لمسلسل كوري حقق انتشارًا عالميًا على نتفلكس.','مثل: Squid Game أو The Glory','أي مثال صحيح من المسلسلات الكورية العالمية يُقبل.',{formatTag:'example',contentScope:'global',regionTag:'South Korea',eraTag:'2020s',subCategory:'example'});
  direct('fmt40-tv-h02','tv','hard','اذكر اسم مسلسل إسباني عالمي غير «La Casa de Papel».','مثل: Elite أو Vis a Vis','يكفي مثال صحيح لمسلسل إسباني معروف عالميًا.',{formatTag:'example',contentScope:'global',regionTag:'Spain',eraTag:'Modern',subCategory:'example'});

  // ---------- MOVIES ----------
  mcq('fmt40-mov-e01','movies','easy','🚢🧊💔 أي فيلم تمثله هذه الإيموجيات؟','Titanic',['The Notebook','Cast Away','Pearl Harbor'],'سفينة شهيرة ورحلة تنتهي بكارثة.',{formatTag:'emoji',contentScope:'global',regionTag:'USA',eraTag:'90s',subCategory:'emoji'});
  mcq('fmt40-mov-m01','movies','medium','🌀😴🏙️ أي فيلم تمثله هذه الإيموجيات؟','Inception',['Interstellar','Tenet','The Matrix'],'الفيلم مرتبط بالأحلام داخل الأحلام.',{formatTag:'emoji',contentScope:'global',regionTag:'USA-UK',eraTag:'2010s',subCategory:'emoji'});
  complete('fmt40-mov-e02','movies','easy','أكمل اسم الفيلم: «عسل ___»','أسود','فيلم مصري بطولة أحمد حلمي.',{formatTag:'complete',contentScope:'arab',regionTag:'Egypt',eraTag:'2010s',subCategory:'title'});
  complete('fmt40-mov-m02','movies','medium','أكمل اسم الفيلم: «The Grand Budapest ___»','Hotel','فيلم لويس أندرسون الشهير.',{formatTag:'complete',contentScope:'global',regionTag:'Europe-USA',eraTag:'2010s',subCategory:'title'});
  ordering('fmt40-mov-h01','movies','hard','رتّب الأفلام حسب سنة الإصدار من الأقدم إلى الأحدث.',['The Godfather','Pulp Fiction','The Dark Knight','Parasite'],'The Godfather، Pulp Fiction، The Dark Knight، Parasite','الأقدم إلى الأحدث','الترتيب يبدأ من السبعينات وينتهي في 2019.',{formatTag:'ordering',contentScope:'global',regionTag:'Global',eraTag:'Mixed',subCategory:'ordering'});
  direct('fmt40-mov-m03','movies','medium','اذكر مثالًا لفيلم عربي فاز بجائزة أو شارك في مهرجان عالمي كبير.','مثل: كفرناحوم أو ذيب أو ريش','أي مثال صحيح ومشهور يُقبل.',{formatTag:'example',contentScope:'arab',regionTag:'Arab',eraTag:'Modern',subCategory:'example'});
  direct('fmt40-mov-h02','movies','hard','اذكر اسم فيلم غير أمريكي فاز بأوسكار أفضل فيلم دولي.','مثل: Parasite أو Drive My Car أو The Great Beauty','أي مثال صحيح يُقبل.',{formatTag:'example',contentScope:'global',regionTag:'Global',eraTag:'Modern',subCategory:'example'});

  // ---------- GENERAL ----------
  mcq('fmt40-gen-e01','general','easy','🗼🇫🇷 أي مدينة تمثلها هذه الإيموجيات؟','باريس',['ليون','بروكسل','جنيف'],'المعلم من أشهر رموز فرنسا.',{formatTag:'emoji',regionTag:'Europe',eraTag:'Geography',subCategory:'emoji'});
  mcq('fmt40-gen-m01','general','medium','🌷🚲🌊 أي دولة ترتبط أكثر بهذه الإيموجيات؟','هولندا',['بلجيكا','الدنمارك','سويسرا'],'الزهور والدراجات والقنوات المائية.',{formatTag:'emoji',regionTag:'Europe',eraTag:'Geography',subCategory:'emoji'});
  complete('fmt40-gen-e02','general','easy','أكمل: أكبر محيط على الأرض هو المحيط ___.','الهادئ','يغطي مساحة أكبر من أي محيط آخر.',{formatTag:'complete',regionTag:'World',eraTag:'Geography',subCategory:'complete'});
  complete('fmt40-gen-m02','general','medium','أكمل: العنصر الذي رمزه الكيميائي Au هو ___.','الذهب','رمز لاتيني قديم.',{formatTag:'complete',regionTag:'World',eraTag:'Science',subCategory:'complete'});
  ordering('fmt40-gen-h01','general','hard','رتّب هذه المدن حسب خطوط العرض من الشمال إلى الجنوب.',['لندن','باريس','روما','القاهرة'],'لندن، باريس، روما، القاهرة','من الشمال إلى الجنوب','كلها في نصف الكرة الشمالي.',{formatTag:'ordering',regionTag:'World',eraTag:'Geography',subCategory:'ordering'});
  direct('fmt40-gen-m03','general','medium','اذكر مثالًا لدولة يمر بها خط الاستواء.','مثل: الإكوادور أو كينيا أو إندونيسيا','أي دولة يمر بها خط الاستواء تُقبل.',{formatTag:'example',regionTag:'World',eraTag:'Geography',subCategory:'example'});

  // ---------- SPORTS ----------
  mcq('fmt40-sp-e01','sports','easy','🏀🇺🇸🏆 أي دوري تمثله هذه الإيموجيات؟','NBA',['NFL','MLB','NHL'],'أشهر دوري كرة سلة في أمريكا الشمالية.',{formatTag:'emoji',regionTag:'USA',eraTag:'Modern',subCategory:'emoji'});
  mcq('fmt40-sp-m01','sports','medium','🎾🌱🇬🇧 أي بطولة تمثلها هذه الإيموجيات؟','ويمبلدون',['رولان غاروس','أمريكا المفتوحة','أستراليا المفتوحة'],'البطولة الكبرى الوحيدة على العشب.',{formatTag:'emoji',regionTag:'UK',eraTag:'Modern',subCategory:'emoji'});
  complete('fmt40-sp-e02','sports','easy','أكمل: عدد لاعبي فريق كرة القدم داخل الملعب هو ___.','11','من ضمنهم حارس المرمى.',{formatTag:'complete',regionTag:'World',eraTag:'Rules',subCategory:'complete'});
  complete('fmt40-sp-m02','sports','medium','أكمل: المسافة الرسمية لسباق الماراثون هي ___ كم.','42.195','الرقم يزيد قليلًا على 42.',{formatTag:'complete',regionTag:'World',eraTag:'Records',subCategory:'complete'});
  ordering('fmt40-sp-h01','sports','hard','رتّب هذه البطولات من الأقدم تأسيسًا إلى الأحدث.',['ويمبلدون','كأس العالم لكرة القدم','دوري أبطال أوروبا','بطولة أمم أوروبا'],'ويمبلدون، كأس العالم لكرة القدم، دوري أبطال أوروبا، بطولة أمم أوروبا','الأقدم تأسيسًا إلى الأحدث','ابدؤوا ببطولة التنس من القرن التاسع عشر.',{formatTag:'ordering',regionTag:'World',eraTag:'History',subCategory:'ordering'});
  direct('fmt40-sp-m03','sports','medium','اذكر مثالًا لرياضة أولمبية تُلعب بمضرب.','مثل: التنس أو تنس الطاولة أو الريشة الطائرة','أي مثال صحيح يُقبل.',{formatTag:'example',regionTag:'World',eraTag:'Olympics',subCategory:'example'});

  // ---------- CARTOONS ----------
  mcq('fmt40-car-e01','cartoons','easy','🐭🏰✨ أي شخصية/عالم كرتوني تمثله هذه الإيموجيات؟','ميكي ماوس / ديزني',['توم وجيري','سبونج بوب','بوكيمون'],'الفأر الأشهر في عالم الرسوم المتحركة.',{formatTag:'emoji',regionTag:'USA',eraTag:'Classic',subCategory:'emoji'});
  mcq('fmt40-car-m01','cartoons','medium','⚡🐭🔴 أي شخصية تمثلها هذه الإيموجيات؟','بيكاتشو',['سونك','دورايمون','توتورو'],'شخصية كهربائية شهيرة من بوكيمون.',{formatTag:'emoji',regionTag:'Japan',eraTag:'90s',subCategory:'emoji'});
  complete('fmt40-car-e02','cartoons','easy','أكمل اسم العمل: «المحقق ___»','كونان','أنمي بوليسي شهير.',{formatTag:'complete',regionTag:'Japan',eraTag:'90s',subCategory:'title'});
  complete('fmt40-car-m02','cartoons','medium','أكمل اسم العمل: «Avatar: The Last ___»','Airbender','مسلسل رسوم أمريكي مستوحى من فنون وثقافات آسيوية.',{formatTag:'complete',regionTag:'USA',eraTag:'2000s',subCategory:'title'});
  ordering('fmt40-car-h01','cartoons','hard','رتّب هذه الأعمال حسب بداية عرضها من الأقدم إلى الأحدث.',['Tom and Jerry','Dragon Ball','Pokémon','Naruto'],'Tom and Jerry، Dragon Ball، Pokémon، Naruto','الأقدم إلى الأحدث','ابدؤوا بالكرتون الأمريكي الكلاسيكي.',{formatTag:'ordering',regionTag:'Global',eraTag:'Mixed',subCategory:'ordering'});
  direct('fmt40-car-m03','cartoons','medium','اذكر مثالًا لأنمي رياضي مشهور.','مثل: Captain Tsubasa أو Slam Dunk أو Haikyuu!!','أي مثال صحيح يُقبل.',{formatTag:'example',regionTag:'Japan',eraTag:'Mixed',subCategory:'example'});

  // ---------- ARTISTS ----------
  mcq('fmt40-art-e01','artists','easy','🎤🇱🇧🌟 أي وصف أقرب لفنانة مثل فيروز؟','مطربة لبنانية',['ممثلة مصرية','مغنية مغربية','مذيعة خليجية'],'من أشهر الأصوات اللبنانية والعربية.',{formatTag:'emoji',regionTag:'Lebanon',eraTag:'Classic',subCategory:'emoji'});
  complete('fmt40-art-e02','artists','easy','أكمل الاسم: عبدالحليم ___.','حافظ','العندليب الأسمر.',{formatTag:'complete',regionTag:'Egypt',eraTag:'Classic',subCategory:'name'});
  complete('fmt40-art-m01','artists','medium','أكمل الاسم الفني: كاظم ___.','الساهر','مطرب عراقي معروف بلقب القيصر.',{formatTag:'complete',regionTag:'Iraq',eraTag:'90s-Modern',subCategory:'name'});
  ordering('fmt40-art-h01','artists','hard','رتّب هؤلاء الفنانين تقريبًا حسب بداية مسيرتهم الفنية من الأقدم إلى الأحدث.',['أم كلثوم','فيروز','محمد عبده','كاظم الساهر'],'أم كلثوم، فيروز، محمد عبده، كاظم الساهر','الأقدم مسيرة إلى الأحدث','ابدؤوا بسيدة الغناء العربي.',{formatTag:'ordering',regionTag:'Arab',eraTag:'Mixed',subCategory:'ordering'});
  direct('fmt40-art-m02','artists','medium','اذكر مثالًا لفنان عربي جمع بين التمثيل والغناء.','مثل: عبدالحليم حافظ أو محمد فوزي أو دنيا سمير غانم','أي مثال صحيح معروف في المجالين يُقبل.',{formatTag:'example',regionTag:'Arab',eraTag:'Mixed',subCategory:'example'});

  // ---------- SONGS: avoid long copyrighted lyrics; use titles/credits only ----------
  mcq('fmt40-song-e01','songs','easy','🌙❤️🎵 أي عنوان أغنية يبدو الأقرب لهذه الإيموجيات؟','على بالي',['سهر الليالي','نور العين','تملي معاك'],'فكروا في عنوان عاطفي قصير.',{formatTag:'emoji',regionTag:'Arab',eraTag:'Modern',subCategory:'emoji'});
  complete('fmt40-song-e02','songs','easy','أكمل عنوان الأغنية: «نور ___»','العين','أغنية عربية شهيرة لعمرو دياب.',{formatTag:'complete',regionTag:'Egypt',eraTag:'90s',subCategory:'title'});
  complete('fmt40-song-m01','songs','medium','أكمل عنوان الأغنية: «الأماكن كلها ___»','مشتاقة لك','من أشهر أغاني محمد عبده.',{formatTag:'complete',regionTag:'Saudi',eraTag:'2000s',subCategory:'title'});
  ordering('fmt40-song-h01','songs','hard','رتّب هذه الأغاني تقريبًا من الأقدم إلى الأحدث بحسب إصدارها.',['قارئة الفنجان','الأماكن','تملي معاك','3 دقات'],'قارئة الفنجان، تملي معاك، الأماكن، 3 دقات','الأقدم إلى الأحدث','قارئة الفنجان من السبعينات، و3 دقات من 2017.',{formatTag:'ordering',regionTag:'Arab',eraTag:'Mixed',subCategory:'ordering'});
  direct('fmt40-song-m02','songs','medium','اذكر مثالًا لأغنية عربية عنوانها يحتوي اسم مكان أو مدينة.','مثل: بيروت أو بنت الجيران لا تُقبل لأنها ليست مكانًا؛ يقبل أي عنوان صحيح واضح','المطلوب عنوان أغنية حقيقي يحتوي مكانًا أو مدينة.',{formatTag:'example',regionTag:'Arab',eraTag:'Mixed',subCategory:'example'});

  // ---------- FORMAT-BALANCED PICKER ----------
  const KEY='laffha-format-meta-v40';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x));}catch{}};
  const scopeOf=q=>q.contentScope==='global'?'global':'arab';
  const regionOf=q=>String(q.regionTag||q.countryRegionTags?.[0]||'Other');
  const macroOf=q=>{
    if((q.category==='tv'||q.category==='movies')&&scopeOf(q)==='arab')return 'Arab';
    const r=regionOf(q).toLowerCase();
    if(/japan|south korea|korea|china|taiwan|hong kong/.test(r))return 'EastAsia';
    if(/india|pakistan|bangladesh|sri lanka|nepal/.test(r))return 'SouthAsia';
    if(/turkey|iran/.test(r))return 'WestAsia';
    if(/usa|canada|america/.test(r))return 'NorthAmerica';
    if(/mexico|brazil|argentina|colombia|chile/.test(r))return 'LatinAmerica';
    if(/uk|france|germany|spain|italy|denmark|sweden|norway|finland|iceland|europe/.test(r))return 'Europe';
    return regionOf(q)||'Other';
  };
  const formatOf=q=>q.formatTag||(q.questionType==='ordering'?'ordering':q.questionType==='complete'?'complete':q.questionType==='direct'?'open':q.questionType==='logo'?'logo':'mcq');
  const meta=q=>({format:formatOf(q),scope:scopeOf(q),macro:macroOf(q),region:regionOf(q),sub:q.subCategory||'other',id:q.questionID||''});
  const remember=q=>{const all=load(),cat=q.category,arr=Array.isArray(all[cat])?all[cat]:[];all[cat]=[...arr,meta(q)].slice(-24);save(all);};

  function choose(pool,cat){
    if(pool.length<=1)return pool[0];
    const hist=(load()[cat]||[]).slice(-10),last=hist.at(-1)||{},prev=hist.at(-2)||{};
    const entertainment=cat==='tv'||cat==='movies';
    const scored=pool.map(q=>{
      const m=meta(q);let s=Math.random()*2;
      // Strongly rotate question presentation itself.
      const sameFmt=hist.slice(-4).filter(x=>x.format===m.format).length;
      if(sameFmt===0)s+=14;else s-=sameFmt*12;
      if(last.format===m.format)s-=12;
      if(prev.format===m.format)s-=5;

      if(entertainment){
        if(last.scope)s+=m.scope!==last.scope?10:-6;
        const sameMacro=hist.slice(-5).filter(x=>x.macro===m.macro).length;
        if(sameMacro===0)s+=11;else s-=sameMacro*12;
        if(last.macro===m.macro)s-=14;
        const sameCountry=hist.slice(-7).filter(x=>x.region===m.region).length;
        if(sameCountry===0)s+=6;else s-=sameCountry*7;
      }else{
        if(last.region)s+=m.region!==last.region?5:-4;
        if(last.sub)s+=m.sub!==last.sub?4:-2;
      }
      return {q,s};
    }).sort((a,b)=>b.s-a.s);
    const top=scored.slice(0,Math.max(2,Math.min(5,Math.ceil(scored.length*.15))));
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
    const eligible=q=>{const k=laffhaQuestionKey(q);return !recent.has(k)&&!state.usedQuestions.has(k)&&(!excludeCurrent||k!==currentKey)&&!q._brokenLogo;};
    let pool=unique.filter(q=>q.difficulty===diff&&eligible(q));
    if(!pool.length)pool=unique.filter(eligible);
    if(!pool.length){
      const keep=Math.min(99,Math.max(0,unique.length-1));
      const h=loadLaffhaHistory();h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);saveLaffhaHistory(h);
      const refreshed=new Set(h[state.selectedCategory]||[]);
      pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q))&&(!excludeCurrent||laffhaQuestionKey(q)!==currentKey)&&!q._brokenLogo);
    }
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}
    state.currentQuestion=choose(pool,state.selectedCategory);
    const key=laffhaQuestionKey(state.currentQuestion);
    state.usedQuestions.add(key);rememberLaffhaQuestion(state.currentQuestion);remember(state.currentQuestion);
    state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;
    state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };

  console.info('Laffha V40 format variety ready');
})();