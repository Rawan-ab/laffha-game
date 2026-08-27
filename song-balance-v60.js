// V60 — broader song mix: Gulf + modern Arab + a small international share.
(function(){
  if(typeof QUESTIONS==='undefined')return;
  const rows=[
    ['song60-e01','easy','من غنّى «تتنفسك دنياي»؟','عبدالمجيد عبدالله',['راشد الماجد','رابح صقر','خالد عبدالرحمن'],'Saudi','Gulf'],
    ['song60-e02','easy','من غنّى «أنت ملك»؟','رابح صقر',['عبدالمجيد عبدالله','راشد الماجد','ماجد المهندس'],'Saudi','Gulf'],
    ['song60-e03','easy','من غنّى «بالبنط العريض»؟','حسين الجسمي',['ماجد المهندس','راشد الماجد','فؤاد عبدالواحد'],'UAE','Gulf'],
    ['song60-e04','easy','من غنّت «عايشالك»؟','إليسا',['نانسي عجرم','نوال الزغبي','هيفاء وهبي'],'Lebanon','Arab'],
    ['song60-e05','easy','من غنّت «يا مجنون»؟','أصالة',['أنغام','شيرين عبدالوهاب','آمال ماهر'],'Syria','Arab'],
    ['song60-e06','easy','من غنّى «قرب حبيبي»؟','تامر حسني',['محمد حماقي','رامي صبري','رامي جمال'],'Egypt','Arab'],

    ['song60-m01','medium','من غنّت «تدري ليش أزعل عليك»؟','أحلام',['نوال الكويتية','بلقيس','ذكرى'],'UAE','Gulf'],
    ['song60-m02','medium','من غنّت «قدرت تنام»؟','نوال الكويتية',['أحلام','ذكرى','أسماء لمنور'],'Kuwait','Gulf'],
    ['song60-m03','medium','من غنّت «انتهى»؟','بلقيس',['أصالة','أنغام','نوال الزغبي'],'Yemen','Gulf'],
    ['song60-m04','medium','من غنّى «لو حبنا غلطة»؟','وائل كفوري',['راغب علامة','عاصي الحلاني','رامي عياش'],'Lebanon','Arab'],
    ['song60-m05','medium','من غنّت «يوم ورا يوم»؟','سميرة سعيد',['لطيفة','أنغام','أصالة'],'Morocco','Arab'],
    ['song60-m06','medium','من غنّت «إن شاء الله»؟','لطيفة',['سميرة سعيد','أنغام','أصالة'],'Tunisia','Arab'],

    ['song60-h01','hard','من غنّت «Rolling in the Deep»؟','Adele',['Sia','P!nk','Kelly Clarkson'],'UK','Foreign'],
    ['song60-h02','hard','من غنّى «Blinding Lights»؟','The Weeknd',['Bruno Mars','Harry Styles','Justin Timberlake'],'Canada','Foreign'],
    ['song60-h03','hard','من غنّت «Shake It Off»؟','Taylor Swift',['Katy Perry','Ariana Grande','Selena Gomez'],'US','Foreign']
  ];
  const pts=d=>d==='easy'?200:d==='medium'?400:600;
  for(const r of rows){
    if(QUESTIONS.some(q=>q.questionID===r[0]||String(q.questionText||'')===r[2]))continue;
    QUESTIONS.push({questionID:r[0],category:'songs',difficulty:r[1],points:pts(r[1]),questionType:'mcq',questionText:r[2],correctAnswer:r[3],wrongAnswers:r[4],hint:'ركزوا على الفنان المرتبط بالأغنية.',regionTag:r[5],musicGroup:r[6],subCategory:'performer',eraTag:r[6]==='Foreign'?'Modern':'2000s+',focusArtist:r[3],contentScope:'song-balance-v60'});
  }

  const artistNames=[
    'أم كلثوم','فيروز','صباح','عبدالحليم حافظ','محمد عبده','طلال مداح','راشد الماجد','عبدالمجيد عبدالله','رابح صقر','حسين الجسمي','أحلام','نوال الكويتية','بلقيس','ماجد المهندس','كاظم الساهر','عمرو دياب','تامر حسني','محمد حماقي','شيرين عبدالوهاب','أنغام','أصالة','إليسا','نانسي عجرم','نوال الزغبي','وائل كفوري','راغب علامة','عاصي الحلاني','سميرة سعيد','لطيفة','وردة الجزائرية','نجاة الصغيرة','Adele','The Weeknd','Taylor Swift','Bruno Mars','Ed Sheeran'
  ].sort((a,b)=>b.length-a.length);
  const gulfRegions=new Set(['Saudi','UAE','Kuwait','Bahrain','Qatar','Oman']);
  const foreignRegions=new Set(['US','UK','Canada','Australia','France','Germany','Spain','Italy','Korea','Japan']);
  for(const q of QUESTIONS){
    if(q.category!=='songs')continue;
    const hay=`${q.questionText||''} ${q.correctAnswer||''} ${q.singer||''}`.toLowerCase();
    if(!q.focusArtist){const found=artistNames.find(a=>hay.includes(a.toLowerCase()));if(found)q.focusArtist=found;}
    if(!q.musicGroup){q.musicGroup=gulfRegions.has(q.regionTag)?'Gulf':foreignRegions.has(q.regionTag)?'Foreign':'Arab';}
  }
  console.info('Laffha V60 song balance ready');
})();