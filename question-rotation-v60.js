// V60 — persistent rotation across separate games and browser returns.
// Recently seen questions cool down; correctly answered questions cool down much longer.
(function(){
  if(typeof QUESTIONS==='undefined'||typeof state==='undefined'||typeof render!=='function')return;
  const KEY='laffha-question-rotation-v60';
  const CLASSIC_TRIO=new Set(['أم كلثوم','فيروز','صباح']);
  const safeParse=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"cats":{}}')||{cats:{}};}catch(_){return {cats:{}};}};
  const save=d=>{try{localStorage.setItem(KEY,JSON.stringify(d));}catch(_){}};
  const qKey=q=>typeof laffhaQuestionKey==='function'?laffhaQuestionKey(q):`${q.category||''}::${q.questionID||q.questionText||''}::${q.correctAnswer||''}`;
  const catStore=(db,cat)=>db.cats[cat]||(db.cats[cat]={seq:0,items:{},meta:[]});
  const recentMeta=(cat,n=10)=>{const db=safeParse(),s=catStore(db,cat);return (s.meta||[]).slice(-n);};
  const sameGameUsed=q=>state.usedQuestions?.has(qKey(q))||state.usedQuestions?.has(q.questionID);

  function cooldowns(uniqueCount){
    return {
      seen:Math.min(40,Math.max(12,Math.floor(uniqueCount*.45))),
      correct:Math.min(90,Math.max(30,Math.floor(uniqueCount*.80)))
    };
  }
  function infoFor(cat,key){const db=safeParse(),s=catStore(db,cat);return {db,s,item:s.items[key]||null};}
  function recordSelection(q){
    const key=qKey(q),db=safeParse(),s=catStore(db,q.category);s.seq=Number(s.seq||0)+1;
    const item=s.items[key]||{};item.last=s.seq;item.seen=(item.seen||0)+1;s.items[key]=item;
    const m={key,answer:String(q.correctAnswer||''),artist:q.focusArtist||'',group:q.musicGroup||'',region:q.regionTag||'',sub:q.subCategory||'',era:q.eraTag||''};
    s.meta=[...(s.meta||[]),m].slice(-40);
    const entries=Object.entries(s.items);if(entries.length>400){entries.sort((a,b)=>(b[1].last||0)-(a[1].last||0));s.items=Object.fromEntries(entries.slice(0,400));}
    save(db);
    try{if(typeof rememberLaffhaQuestion==='function')rememberLaffhaQuestion(q);}catch(_){ }
  }
  function markCorrect(q){
    const key=qKey(q),db=safeParse(),s=catStore(db,q.category),item=s.items[key]||{};item.correct=s.seq||item.last||1;item.correctCount=(item.correctCount||0)+1;s.items[key]=item;save(db);
  }

  function artistScore(q,meta){
    if(q.category!=='songs')return 0;
    let score=0;const artist=q.focusArtist||'';const recentArtists=meta.map(x=>x.artist).filter(Boolean);
    if(artist){
      if(recentArtists.slice(-3).includes(artist))score-=90;
      else if(recentArtists.slice(-7).includes(artist))score-=35;
      if(CLASSIC_TRIO.has(artist)&&recentArtists.slice(-8).some(a=>CLASSIC_TRIO.has(a)))score-=70;
    }
    const groups=meta.slice(-10).map(x=>x.group).filter(Boolean);
    const count=g=>groups.filter(x=>x===g).length;
    if(q.musicGroup==='Gulf')score+=count('Gulf')<3?16:-3;
    if(q.musicGroup==='Arab')score+=count('Arab')<5?10:0;
    if(q.musicGroup==='Foreign')score+=count('Foreign')<2?7:-20;
    return score;
  }
  function diversityScore(q,meta){
    let score=Math.random()*8;const last=meta[meta.length-1]||{},prev=meta[meta.length-2]||{};
    const ans=String(q.correctAnswer||'');
    if(ans&&meta.slice(-8).some(x=>x.answer===ans))score-=25;
    if(q.regionTag&&q.regionTag!==last.region)score+=7;else if(q.regionTag)score-=5;
    if(q.subCategory&&q.subCategory!==last.sub)score+=5;else if(q.subCategory)score-=3;
    if(q.eraTag&&q.eraTag!==last.era)score+=2;
    if(prev.region&&q.regionTag&&q.regionTag!==prev.region)score+=2;
    score+=artistScore(q,meta);
    return score;
  }

  pickQuestion=function(diff,excludeCurrent=false){
    const cat=state.selectedCategory,currentKey=state.currentQuestion?qKey(state.currentQuestion):null;
    let source=QUESTIONS.filter(q=>q.category===cat);
    if(state.playMode==='multi'&&state.multiRoom?.status==='playing')source=source.filter(q=>['mcq','logo'].includes(q.questionType));
    const unique=[];const seen=new Set();for(const q of source){const k=qKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}}
    if(!unique.length){toast('ما فيه سؤال متاح حاليًا');return;}
    const db=safeParse(),s=catStore(db,cat),cd=cooldowns(unique.length),seq=Number(s.seq||0);
    const baseOk=q=>!sameGameUsed(q)&&(!excludeCurrent||qKey(q)!==currentKey);
    const strict=q=>{if(!baseOk(q))return false;const it=s.items[qKey(q)];if(!it)return true;if(it.correct&&seq-it.correct<cd.correct)return false;if(it.last&&seq-it.last<cd.seen)return false;return true;};
    const keepCorrect=q=>{if(!baseOk(q))return false;const it=s.items[qKey(q)];return !(it?.correct&&seq-it.correct<cd.correct);};
    const soft=q=>{if(!baseOk(q))return false;const it=s.items[qKey(q)];if(it?.correct&&seq-it.correct<Math.min(18,cd.correct))return false;if(it?.last&&seq-it.last<Math.min(8,cd.seen))return false;return true;};
    const choosePool=(fn)=>{let p=unique.filter(q=>q.difficulty===diff&&fn(q));if(!p.length)p=unique.filter(fn);return p;};
    let pool=choosePool(strict);if(!pool.length)pool=choosePool(keepCorrect);if(!pool.length)pool=choosePool(soft);if(!pool.length)pool=unique.filter(baseOk);if(!pool.length)pool=unique.filter(q=>!excludeCurrent||qKey(q)!==currentKey);
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}
    const meta=(s.meta||[]).slice(-12);pool.sort((a,b)=>diversityScore(b,meta)-diversityScore(a,meta));
    const top=pool.slice(0,Math.max(1,Math.ceil(pool.length*.25)));state.currentQuestion=top[Math.floor(Math.random()*top.length)];
    const key=qKey(state.currentQuestion);state.usedQuestions?.add(key);recordSelection(state.currentQuestion);
    state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };

  const oldFinish=window.finishQuestion;
  if(typeof oldFinish==='function')window.finishQuestion=function(status){const q=state.currentQuestion;if(status==='correct'&&q)markCorrect(q);return oldFinish(status);};
  console.info('Laffha V60 persistent question rotation ready');
})();