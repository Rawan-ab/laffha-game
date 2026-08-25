// V45 — Raise the floor for 200-point questions and remove giveaway emoji/nationality prompts.
(function(){
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const removeIds=new Set([
    // V40 giveaway/one-word easy prompts.
    'fmt40-tv-e01','fmt40-tv-e02','fmt40-mov-e01','fmt40-mov-e02','fmt40-gen-e01','fmt40-gen-e02','fmt40-sp-e01','fmt40-sp-e02','fmt40-car-e01','fmt40-car-e02','fmt40-art-e01','fmt40-art-e02',
    // V44 emoji questions that practically reveal the title.
    'v44-dis-e01','v44-dis-e03','v44-nick-e01','v44-sp-e03'
  ]);

  function tooEasy(q){
    if(q.difficulty!=='easy')return false;
    const text=norm(q.questionText);
    const answer=norm(q.correctAnswer);
    if(removeIds.has(q.questionID))return true;
    // Direct nationality questions are too cheap for 200.
    if(q.category==='artists' && /^ما جنسية/.test(text))return true;
    // Most direct nickname questions from the old artist easy bank are too obvious.
    if(q.category==='artists' && /المعروف بلقب|المعروفة بلقب/.test(text))return true;
    // A 200 question should not literally contain its answer in the prompt.
    if(answer && answer.length>=3 && text.includes(answer))return true;
    // Emoji + country flag + explicit profession is a giveaway.
    if(q.formatTag==='emoji' && /🇸🇦|🇰🇼|🇦🇪|🇧🇭|🇶🇦|🇴🇲|🇱🇧|🇪🇬|🇸🇾|🇯🇴|🇲🇦|🇹🇳|🇩🇿|🇮🇶|🇬🇧|🇺🇸|🇫🇷|🇯🇵|🇰🇷|🇪🇸|🇩🇪/.test(q.questionText||''))return true;
    return false;
  }

  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(tooEasy(QUESTIONS[i]))QUESTIONS.splice(i,1);
  }

  const pts=d=>d==='easy'?200:d==='medium'?400:600;
  const add=q=>QUESTIONS.push({...q,points:q.points||pts(q.difficulty),v45Quality:true});
  const mcq=(id,cat,d,text,answer,wrong,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,questionType:'mcq',questionText:text,correctAnswer:answer,wrongAnswers:wrong,hint,...meta});
  const ordering=(id,cat,d,text,items,answer,label,hint,meta={})=>add({questionID:id,category:cat,difficulty:d,questionType:'ordering',questionText:text,items,correctAnswer:answer,wrongAnswers:[],orderLabel:label,hint,...meta});

  // ---------- ARTISTS: 200 now tests actual works, not nationality ----------
  mcq('v45-art-e01','artists','easy','أي فنان سعودي ارتبط بأغنية «الأماكن»؟','محمد عبده',['عبدالمجيد عبدالله','راشد الماجد','رابح صقر'],'من أشهر أغاني فنان العرب.',{regionTag:'Saudi',eraTag:'Modern',subCategory:'songs'});
  mcq('v45-art-e02','artists','easy','أي صوت ارتبط بأغنية «نسم علينا الهوى»؟','فيروز',['صباح','ماجدة الرومي','وديع الصافي'],'أغنية لبنانية شهيرة من مدرسة الرحابنة.',{regionTag:'Lebanon',eraTag:'Classic',subCategory:'songs'});
  mcq('v45-art-e03','artists','easy','من غنّى «زيديني عشقًا»؟','كاظم الساهر',['صابر الرباعي','ماجد المهندس','راغب علامة'],'قصيدة غنائية شهيرة من أعمال القيصر.',{regionTag:'Iraq',eraTag:'90s',subCategory:'songs'});
  mcq('v45-art-e04','artists','easy','من جسّد شخصية «غوار الطوشة»؟','دريد لحام',['ياسر العظمة','أيمن زيدان','سلوم حداد'],'شخصية كوميدية سورية كلاسيكية.',{regionTag:'Syria',eraTag:'Classic',subCategory:'characters'});
  mcq('v45-art-e05','artists','easy','من شارك ناصر القصبي بطولة «طاش ما طاش» لسنوات طويلة؟','عبدالله السدحان',['يوسف الجراح','حبيب الحبيب','فايز المالكي'],'ثنائي كوميدي سعودي شهير.',{regionTag:'Saudi',eraTag:'90s-2000s',subCategory:'actors'});
  mcq('v45-art-e06','artists','easy','أي فنانة من هؤلاء ارتبط اسمها بأغنية «كلمات»؟','ماجدة الرومي',['نجوى كرم','نوال الزغبي','إليسا'],'أغنية من الأعمال العربية الكلاسيكية الحديثة.',{regionTag:'Lebanon',eraTag:'90s',subCategory:'songs'});

  // ---------- CARTOONS: familiar, but requires knowledge beyond the title ----------
  mcq('v45-car-e01','cartoons','easy','في «Toy Story»، ما اسم الطفل الذي يملك وودي وباز في الأفلام الأولى؟','آندي',['سيد','آل','بوني'],'اسمه مكتوب على حذاء وودي في أحد أشهر المشاهد.',{regionTag:'USA',eraTag:'90s',subCategory:'characters',franchiseTag:'disney-toy-story',studioTag:'Disney-Pixar'});
  mcq('v45-car-e02','cartoons','easy','ما اسم المدينة التي يعيش فيها سبونج بوب؟','قاع الهامور - Bikini Bottom',['ريتروفيل','ديمسديل','أميتي بارك'],'مدينة خيالية تحت البحر.',{regionTag:'USA',eraTag:'2000s',subCategory:'setting',franchiseTag:'nick-spongebob',studioTag:'Nickelodeon'});
  mcq('v45-car-e03','cartoons','easy','في «Avatar: The Last Airbender»، من أخت سوكا؟','كاتارا',['توف','أزولا','تاي لي'],'من قبيلة الماء الجنوبية.',{regionTag:'USA',eraTag:'2000s',subCategory:'relations',franchiseTag:'nick-avatar',studioTag:'Nickelodeon'});
  mcq('v45-car-e04','cartoons','easy','أي عمل تدور قصته حول فتى اسمه «غون فريكس»؟','القناص - Hunter x Hunter',['ناروتو','أبطال الديجيتال','هزيم الرعد'],'يسعى للحصول على رخصة الصياد.',{regionTag:'Japan-Arab',eraTag:'2000s',subCategory:'characters',franchiseTag:'spacetoon-hunter',studioTag:'Spacetoon'});
  mcq('v45-car-e05','cartoons','easy','في «Finding Nemo»، ما نوع السمكة التي ينتمي إليها نيمو؟','سمكة المهرج',['البلو تانغ','سمكة الأسد','سمكة الملاك'],'مارلن من النوع نفسه.',{regionTag:'USA',eraTag:'2000s',subCategory:'detail',franchiseTag:'disney-finding-nemo',studioTag:'Disney-Pixar'});
  mcq('v45-car-e06','cartoons','easy','في «The Lion King»، من الشخصية التي تتولى إرشاد سيمبا روحيًا؟','رافكي',['زازو','تيمون','بومبا'],'قرد حكيم يحمل عصًا.',{regionTag:'USA',eraTag:'90s',subCategory:'characters',franchiseTag:'disney-lion-king',studioTag:'Disney'});
  ordering('v45-car-e07','cartoons','easy','رتّب هذه الأعمال من الأقدم إلى الأحدث حسب بداية عرضها/إصدارها.',['Toy Story','SpongeBob SquarePants','Avatar: The Last Airbender','Frozen'],'Toy Story، SpongeBob SquarePants، Avatar: The Last Airbender، Frozen','الأقدم إلى الأحدث','بدأت من التسعينات وانتهت في 2013.',{formatTag:'ordering',regionTag:'USA',eraTag:'Mixed',subCategory:'ordering',franchiseTag:'mixed-us-animation'});

  // ---------- TV / MOVIES: accessible but not giveaway ----------
  mcq('v45-tv-e01','tv','easy','في «Friends»، من يعمل في مجال الحفريات والآثار؟','روس',['تشاندلر','جوي','مايك'],'وظيفته أكاديمية أكثر من بقية المجموعة.',{contentScope:'global',regionTag:'USA',eraTag:'90s',subCategory:'characters',marketTag:'USUK'});
  mcq('v45-tv-e02','tv','easy','في النسخة الأمريكية من «The Office»، ما اسم الشركة التي يعمل فيها الموظفون؟','Dunder Mifflin',['Waystar Royco','Sterling Cooper','Pearson Hardman'],'شركة ورق خيالية.',{contentScope:'global',regionTag:'USA',eraTag:'2000s',subCategory:'setting',marketTag:'USUK'});
  mcq('v45-tv-e03','tv','easy','في «Sherlock» من BBC، من يؤدي دور الدكتور واطسون؟','مارتن فريمان',['ديفيد تينانت','أندرو سكوت','توم هيدلستون'],'ممثل بريطاني ظهر أيضًا في The Hobbit.',{contentScope:'global',regionTag:'UK',eraTag:'2010s',subCategory:'actor',marketTag:'USUK'});
  mcq('v45-mov-e01','movies','easy','في «The Matrix»، أي لون من الحبتين يختاره نيو لمعرفة الحقيقة؟','الحمراء',['الزرقاء','الخضراء','البيضاء'],'اختيار يغيّر فهمه للعالم.',{contentScope:'global',regionTag:'USA',eraTag:'90s',subCategory:'detail',marketTag:'USUK'});
  mcq('v45-mov-e02','movies','easy','من أدى شخصية جاك سبارو في سلسلة «Pirates of the Caribbean»؟','جوني ديب',['أورلاندو بلوم','جود لو','كولين فاريل'],'قرصان بحركات وأسلوب مميزين.',{contentScope:'global',regionTag:'USA-UK',eraTag:'2000s',subCategory:'actor',marketTag:'USUK'});
  mcq('v45-mov-e03','movies','easy','في «Harry Potter»، إلى أي منزل ينتمي دراكو مالفوي؟','Slytherin',['Gryffindor','Ravenclaw','Hufflepuff'],'المنزل المرتبط غالبًا بالطموح والدهاء.',{contentScope:'global',regionTag:'UK',eraTag:'2000s',subCategory:'detail',marketTag:'USUK'});

  // ---------- GENERAL: 200 should still require a fact ----------
  mcq('v45-gen-e01','general','easy','ما العنصر الأكثر وفرة في الغلاف الجوي للأرض؟','النيتروجين',['الأكسجين','الأرجون','ثاني أكسيد الكربون'],'يشكل نحو أربعة أخماس الهواء.',{regionTag:'World',eraTag:'Science',subCategory:'science'});
  mcq('v45-gen-e02','general','easy','ما عاصمة أستراليا؟','كانبيرا',['سيدني','ملبورن','بريزبن'],'ليست أكبر مدن البلاد.',{regionTag:'Oceania',eraTag:'Geography',subCategory:'capital'});
  mcq('v45-gen-e03','general','easy','أي بحر يفصل جنوب أوروبا عن شمال أفريقيا؟','البحر المتوسط',['البحر الأسود','بحر البلطيق','بحر العرب'],'يقع بين ثلاث قارات.',{regionTag:'World',eraTag:'Geography',subCategory:'geography'});
  mcq('v45-gen-e04','general','easy','أي دولة أوروبية تحد البرتغال برًا؟','إسبانيا',['فرنسا','إيطاليا','أندورا'],'للبرتغال جار بري واحد فقط.',{regionTag:'Europe',eraTag:'Geography',subCategory:'borders'});

  // ---------- SPORTS ----------
  mcq('v45-sp-e01','sports','easy','في التنس، ماذا يسمى التعادل عند 40-40؟','Deuce',['Love','Ace','Break Point'],'مصطلح يسبق حسم الشوط بنقطتين.',{regionTag:'World',eraTag:'Rules',subCategory:'rules'});
  mcq('v45-sp-e02','sports','easy','أي منتخب فاز بكأس العالم لكرة القدم 2010؟','إسبانيا',['هولندا','ألمانيا','إيطاليا'],'النهائي حُسم بهدف في الوقت الإضافي.',{regionTag:'World',eraTag:'2010s',subCategory:'football'});
  mcq('v45-sp-e03','sports','easy','كم ربعًا تتكون منه مباراة كرة السلة في NBA؟','4',['2','3','5'],'كل ربع مدته 12 دقيقة.',{regionTag:'USA',eraTag:'Rules',subCategory:'basketball'});

  // Prefer the curated V45 easy pool when there are enough candidates, while preserving all existing anti-repeat logic.
  const previousPick=pickQuestion;
  pickQuestion=function(diff,excludeCurrent=false){
    if(diff!=='easy')return previousPick(diff,excludeCurrent);
    const curated=QUESTIONS.filter(q=>q.difficulty==='easy'&&q.category===state.selectedCategory&&q.v45Quality);
    if(curated.length>=3){
      const unused=curated.filter(q=>!state.usedQuestions.has(q.questionID)&&(!excludeCurrent||q.questionID!==state.currentQuestion?.questionID));
      const pool=unused.length?unused:curated.filter(q=>!excludeCurrent||q.questionID!==state.currentQuestion?.questionID);
      if(pool.length){
        state.currentQuestion=pool[Math.floor(Math.random()*pool.length)];
        state.usedQuestions.add(state.currentQuestion.questionID);
        if(typeof rememberQuestion==='function')rememberQuestion(state.currentQuestion);
        if(typeof rememberLaffhaQuestion==='function')rememberLaffhaQuestion(state.currentQuestion);
        state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;
        state.usedChoiceAssist=false;
        state.deadline=Date.now()+60000;
        state.screen='question';render();return;
      }
    }
    return previousPick(diff,excludeCurrent);
  };

  console.info('Laffha V45 difficulty hardening ready',{
    easy:QUESTIONS.filter(q=>q.difficulty==='easy').length,
    curatedEasy:QUESTIONS.filter(q=>q.difficulty==='easy'&&q.v45Quality).length
  });
})();