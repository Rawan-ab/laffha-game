// V13 — robust repeat protection.
// A question is identified by its actual text/content, not only questionID.
// Keep the last 100 DISTINCT questions per category across separate games.
const LAFFHA_HISTORY_V13='laffha-question-history-v13';

function laffhaQuestionKey(q){
  const text=String(q.questionText||q.question||q.logoText||'').trim().replace(/\s+/g,' ').toLowerCase();
  const answer=String(q.correctAnswer||'').trim().replace(/\s+/g,' ').toLowerCase();
  return `${q.category||''}::${text}::${answer}`;
}
function loadLaffhaHistory(){
  try{return JSON.parse(localStorage.getItem(LAFFHA_HISTORY_V13)||'{}')||{};}catch(e){return {};}
}
function saveLaffhaHistory(h){try{localStorage.setItem(LAFFHA_HISTORY_V13,JSON.stringify(h));}catch(e){}}
function rememberLaffhaQuestion(q){
  const h=loadLaffhaHistory(),cat=q.category,key=laffhaQuestionKey(q);
  const old=Array.isArray(h[cat])?h[cat]:[];
  h[cat]=[...old.filter(x=>x!==key),key].slice(-100);
  saveLaffhaHistory(h);
}

// Override the older picker. Never fall back to a recently used question merely
// because one difficulty ran out. Instead, use another unseen question from the
// SAME category and award the points that were drawn for this turn.
pickQuestion=function(diff,excludeCurrent=false){
  const history=loadLaffhaHistory();
  const recent=new Set(history[state.selectedCategory]||[]);
  const currentKey=state.currentQuestion?laffhaQuestionKey(state.currentQuestion):null;
  const inCategory=QUESTIONS.filter(q=>q.category===state.selectedCategory);
  const unique=[]; const seen=new Set();
  for(const q of inCategory){const k=laffhaQuestionKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}}

  const eligible=q=>{
    const k=laffhaQuestionKey(q);
    return !recent.has(k) && !state.usedQuestions.has(k) && (!excludeCurrent || k!==currentKey);
  };
  let pool=unique.filter(q=>q.difficulty===diff && eligible(q));
  if(!pool.length) pool=unique.filter(eligible);

  // Only after 100 distinct category questions (or the whole category if it has
  // fewer than 100) have been exhausted do we release the oldest history.
  if(!pool.length){
    const keep=Math.min(99,Math.max(0,unique.length-1));
    const h=loadLaffhaHistory();
    h[state.selectedCategory]=(h[state.selectedCategory]||[]).slice(-keep);
    saveLaffhaHistory(h);
    const refreshed=new Set(h[state.selectedCategory]||[]);
    pool=unique.filter(q=>!refreshed.has(laffhaQuestionKey(q)) && (!excludeCurrent||laffhaQuestionKey(q)!==currentKey));
  }
  if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}

  state.currentQuestion=pool[Math.floor(Math.random()*pool.length)];
  const key=laffhaQuestionKey(state.currentQuestion);
  state.usedQuestions.add(key);
  rememberLaffhaQuestion(state.currentQuestion);
  state.currentAwardPoints=state.drawnPoints || state.currentQuestion.points;
  state.usedChoiceAssist=false;
  state.deadline=Date.now()+60000;
  state.screen='question';render();
};
