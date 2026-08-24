// V30 — final bank integrity pass for the shared build.
(function(){
  const seenIds=new Set(),seenContent=new Set();
  for(let i=QUESTIONS.length-1;i>=0;i--){
    const q=QUESTIONS[i];
    if(!q||!q.questionID||!q.category||!q.correctAnswer||!q.questionText){QUESTIONS.splice(i,1);continue;}
    if(q.questionType==='truefalse'){QUESTIONS.splice(i,1);continue;}
    const id=String(q.questionID);
    const content=`${q.category}|${String(q.questionText).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim().toLowerCase()}|${String(q.correctAnswer).replace(/\s+/g,' ').trim().toLowerCase()}`;
    if(seenIds.has(id)||seenContent.has(content)){QUESTIONS.splice(i,1);continue;}
    seenIds.add(id);seenContent.add(content);
    q.wrongAnswers=Array.isArray(q.wrongAnswers)?q.wrongAnswers:[];
    q.points=q.difficulty==='easy'?200:q.difficulty==='medium'?400:600;
  }
  const stats={};
  for(const q of QUESTIONS){
    stats[q.category]??={total:0,easy:0,medium:0,hard:0};
    stats[q.category].total++;
    if(stats[q.category][q.difficulty]!==undefined)stats[q.category][q.difficulty]++;
  }
  window.LAFFHA_BANK_STATS=stats;
  console.info('Laffha question bank ready',stats);
})();