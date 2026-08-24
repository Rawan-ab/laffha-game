// Multi-blank song completion questions. Short excerpts only; sourced from varied Arabic songs.
for (let i = QUESTIONS.length - 1; i >= 0; i--) {
  if (['song-fill-e-1','song-fill-m-1','song-fill-h-1'].includes(QUESTIONS[i].questionID)) QUESTIONS.splice(i,1);
}

QUESTIONS.push(
  {
    questionID:'song-fill-user-1',category:'songs',difficulty:'medium',points:400,questionType:'complete',
    questionText:'أكمل الكلمات:<br><br>جيتك من الإعصار<br>جفني ____ والنار<br>جمرة ____<br>والله الجفا ____ وقل الوفا برد',
    correctAnswer:'1) المطر    2) غضى    3) برد',wrongAnswers:[],hint:'ثلاث كلمات ناقصة.',countryRegionTags:['Gulf'],eraTag:'Classic'
  },
  {
    questionID:'song-fill-random-1',category:'songs',difficulty:'easy',points:200,questionType:'complete',
    questionText:'أكمل الكلمات:<br><br>الجو ____<br>ريحت ____<br>ماعندي ____<br>عايش بلا ____',
    correctAnswer:'1) صفالي    2) بالي    3) غالي    4) شوك',wrongAnswers:[],hint:'أربع كلمات قصيرة.',countryRegionTags:['Iraq','Arab'],eraTag:'Modern'
  },
  {
    questionID:'song-fill-random-2',category:'songs',difficulty:'medium',points:400,questionType:'complete',
    questionText:'أكمل الكلمات:<br><br>تمنيتك ____ يا حب<br>صدق ____ و____',
    correctAnswer:'1) تجي    2) ترضا    3) ترضيني',wrongAnswers:[],hint:'ثلاث كلمات ناقصة.',countryRegionTags:['Gulf','Arab'],eraTag:'Modern'
  },
  {
    questionID:'song-fill-random-3',category:'songs',difficulty:'hard',points:600,questionType:'complete',
    questionText:'أكمل الكلمات:<br><br>وش ____ فيني<br>ودك ____<br>وش بقى لك ____',
    correctAnswer:'1) بقى    2) تجرحه    3) ماخذيته',wrongAnswers:[],hint:'ثلاث كلمات ناقصة.',countryRegionTags:['Saudi','Gulf'],eraTag:'Modern'
  }
);