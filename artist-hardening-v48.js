// V48 — Remove giveaway 400-point artist questions and replace the Ahlam full-name prompt with a real knowledge question.
(function(){
  const removeIds=new Set([
    'art29-m05', // Ahlam full name — too obvious for 400
    'art29-m07','art29-m08','art29-m09','art29-m10','art29-m11','art29-m12', // famous nicknames — too easy for 400
    'art29-m13','art29-m14','art29-m15' // duplicated/easy character & nickname prompts
  ]);

  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(removeIds.has(QUESTIONS[i].questionID)) QUESTIONS.splice(i,1);
  }

  QUESTIONS.push({
    questionID:'v48-art-m01',
    category:'artists',
    difficulty:'medium',
    points:400,
    questionType:'mcq',
    questionText:'أغنية أحلام «تدري ليش» صدرت ضمن أي ألبوم؟',
    correctAnswer:'مع السلامة',
    wrongAnswers:['كيف أرضى','ما يصح إلا الصحيح','طبيعي'],
    hint:'الألبوم صدر في التسعينات.',
    regionTag:'UAE',
    eraTag:'90s',
    subCategory:'albums',
    qualityTag:'v48-reviewed'
  });

  QUESTIONS.push({
    questionID:'v48-art-h01',
    category:'artists',
    difficulty:'hard',
    points:600,
    questionType:'mcq',
    questionText:'من لحّن أغنية أحلام «تدري ليش»؟',
    correctAnswer:'عارف الزياني',
    wrongAnswers:['ناصر الصالح','خالد الشيخ','صالح الشهري'],
    hint:'ملحن بحريني تعاون مع عدد من نجوم الخليج.',
    regionTag:'Gulf',
    eraTag:'90s',
    subCategory:'composers',
    qualityTag:'v48-reviewed'
  });

  console.info('Laffha V48 artist difficulty hardening ready');
})();