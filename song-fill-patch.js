// Multi-blank song completion question kept as a special open-answer format.
// The main songs bank uses titles/performers/credits; this verified example keeps the lyric-completion mechanic.
for (let i = QUESTIONS.length - 1; i >= 0; i--) {
  if (String(QUESTIONS[i].questionID||'').startsWith('song-fill-')) QUESTIONS.splice(i,1);
}
QUESTIONS.push({
  questionID:'song-fill-user-1',category:'songs',difficulty:'medium',points:400,questionType:'complete',
  singer:'محمد عبده',songTitle:'جمرة غضى',
  questionText:'أكمل الكلمات:<br><br>جيتك من الإعصار<br>جفني ____ والنار<br>جمرة ____<br>والله الجفا ____ وقل الوفا برد',
  correctAnswer:'1) المطر    2) غضى    3) برد',wrongAnswers:[],hint:'ثلاث كلمات ناقصة.',
  regionTag:'Saudi',countryRegionTags:['Saudi','Gulf'],eraTag:'Classic',subCategory:'completion'
});