// V29 — Share-ready bank cleanup.
// Keep the curated banks only so old repetitive/easy legacy questions do not leak back into play.
(function(){
  const keepPrefixes={
    tv:['tv27-'],
    general:['gen27-'],
    movies:['mov29-'],
    songs:['song29-','song-fill-user-1'],
    artists:['art29-'],
    cartoons:['car29-'],
    sports:['spo29-'],
    logos:['log29-']
  };
  for(let i=QUESTIONS.length-1;i>=0;i--){
    const q=QUESTIONS[i],rules=keepPrefixes[q.category];
    if(!rules)continue;
    const id=String(q.questionID||'');
    const keep=rules.some(prefix=>id===prefix||id.startsWith(prefix));
    if(!keep)QUESTIONS.splice(i,1);
  }
})();