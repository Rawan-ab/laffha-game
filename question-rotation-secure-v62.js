// V62 — repeat protection without storing or reading correct answers in the browser.
(function(){
  if(typeof QUESTIONS==='undefined'||typeof state==='undefined'||typeof render!=='function')return;
  const KEY='laffha-question-rotation-v62';
  const OLD='laffha-question-rotation-v60';
  const CLASSIC_TRIO=new Set(['أم كلثوم','فيروز','صباح']);
  const normText=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
  const qKey=q=>`${q.category||''}::${q.questionID||normText(q.questionText)}`;
  const parse=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}};
  const load=()=>parse(KEY)||{cats:{},migrated:false};
  const save=db=>{try{localStorage.setItem(KEY,JSON.stringify(db));}catch(_){}};
  const catStore=(db,cat)=>db.cats[cat]||(db.cats[cat]={seq:0,items:{},meta:[]});

  function migrateLegacy(){
    const db=load();if(db.migrated)return db;
    const old=parse(OLD);
    if(old?.cats){
      for(const [cat,src] of Object.entries(old.cats)){
        const dest=catStore(db,cat);dest.seq=Math.max(Number(dest.seq||0),Number(src?.seq||0));
        const qs=QUESTIONS.filter(q=>q.category===cat);
        for(const [legacyKey,item] of Object.entries(src?.items||{})){
          const prefix=`${cat}::`;if(!legacyKey.startsWith(prefix))continue;
          const rest=legacyKey.slice(prefix.length),cut=rest.lastIndexOf('::');const text=cut>=0?rest.slice(0,cut):rest;
          const matches=qs.filter(q=>normText(q.questionText||q.question)===normText(text));
          for(const q of matches){const k=qKey(q),d=dest.items[k]||{};d.last=Math.max(Number(d.last||0),Number(item?.last||0));d.correct=Math.max(Number(d.correct||0),Number(item?.correct||0));d.seen=Math.max(Number(d.seen||0),Number(item?.seen||0));d.correctCount=Math.max(Number(d.correctCount||0),Number(item?.correctCount||0));dest.items[k]=d;}
        }
      }
    }
    db.migrated=true;save(db);return db;
  }
  migrateLegacy();

  function cooldowns(n){return {seen:Math.min(40,Math.max(12,Math.floor(n*.45))),correct:Math.min(90,Math.max(30,Math.floor(n*.80)))};}
  const sameGameUsed=q=>state.usedQuestions?.has(qKey(q))||state.usedQuestions?.has(q.questionID);
  function recordSelection(q){const db=load(),s=catStore(db,q.category),k=qKey(q);s.seq=Number(s.seq||0)+1;const it=s.items[k]||{};it.last=s.seq;it.seen=(it.seen||0)+1;s.items[k]=it;s.meta=[...(s.meta||[]),{key:k,artist:q.focusArtist||'',group:q.musicGroup||'',region:q.regionTag||q.countryRegionTags?.[0]||'',sub:q.subCategory||'',topic:q.topicKey||q.topic_key||`${q.category}.${q.subCategory||'general'}`,entity:q.entityKey||q.entity_key||`${q.category}.${q.questionID}`,era:q.eraTag||''}].slice(-40);save(db);try{window.LaffhaContentGovernance?.record(q,'seen');}catch(_){}}
  function markCorrect(q){const db=load(),s=catStore(db,q.category),k=qKey(q),it=s.items[k]||{};it.correct=Number(s.seq||it.last||1);it.correctCount=(it.correctCount||0)+1;s.items[k]=it;save(db);}
  function score(q,meta){let x=Math.random()*8,last=meta.at(-1)||{},prev=meta.at(-2)||{};if(q.regionTag&&q.regionTag!==last.region)x+=7;else if(q.regionTag)x-=5;if(q.subCategory&&q.subCategory!==last.sub)x+=5;else if(q.subCategory)x-=3;if(q.eraTag&&q.eraTag!==last.era)x+=2;if(prev.region&&q.regionTag&&q.regionTag!==prev.region)x+=2;const topic=q.topicKey||q.topic_key||`${q.category}.${q.subCategory||'general'}`,entity=q.entityKey||q.entity_key||`${q.category}.${q.questionID}`;if(entity&&meta.slice(-5).some(m=>m.entity===entity))x-=90;if(topic&&meta.slice(-2).some(m=>m.topic===topic))x-=38;else if(topic)x+=6;try{x+=window.LaffhaContentGovernance?.quotaBoost(q,meta)||0;}catch(_){}if(q.category==='songs'){const artist=q.focusArtist||'',recent=meta.map(m=>m.artist).filter(Boolean);if(artist){if(recent.slice(-3).includes(artist))x-=90;else if(recent.slice(-7).includes(artist))x-=35;if(CLASSIC_TRIO.has(artist)&&recent.slice(-8).some(a=>CLASSIC_TRIO.has(a)))x-=70;}const groups=meta.slice(-10).map(m=>m.group).filter(Boolean),count=g=>groups.filter(x=>x===g).length;if(q.musicGroup==='Gulf')x+=count('Gulf')<3?16:-3;if(q.musicGroup==='Arab')x+=count('Arab')<5?10:0;if(q.musicGroup==='Foreign')x+=count('Foreign')<2?7:-20;}return x;}

  pickQuestion=function(diff,excludeCurrent=false){
    const cat=state.selectedCategory,current=state.currentQuestion?qKey(state.currentQuestion):null;
    let source=QUESTIONS.filter(q=>q.category===cat);
    if(state.playMode==='multi'&&state.multiRoom?.status==='playing')source=source.filter(q=>['mcq','logo'].includes(q.questionType));
    const unique=[];const seen=new Set();for(const q of source){const k=qKey(q);if(!seen.has(k)){seen.add(k);unique.push(q);}}
    if(!unique.length){toast('ما فيه سؤال متاح حاليًا');return;}
    const db=load(),s=catStore(db,cat),cd=cooldowns(unique.length),seq=Number(s.seq||0);
    const base=q=>!sameGameUsed(q)&&(!excludeCurrent||qKey(q)!==current);
    const strict=q=>{if(!base(q))return false;const it=s.items[qKey(q)];if(!it)return true;if(it.correct&&seq-it.correct<cd.correct)return false;if(it.last&&seq-it.last<cd.seen)return false;return true;};
    const protectCorrect=q=>{if(!base(q))return false;const it=s.items[qKey(q)];return !(it?.correct&&seq-it.correct<cd.correct);};
    const soft=q=>{if(!base(q))return false;const it=s.items[qKey(q)];if(it?.correct&&seq-it.correct<Math.min(18,cd.correct))return false;if(it?.last&&seq-it.last<Math.min(8,cd.seen))return false;return true;};
    const poolFor=fn=>{let p=unique.filter(q=>q.difficulty===diff&&fn(q));if(!p.length)p=unique.filter(fn);return p;};
    let pool=poolFor(strict);if(!pool.length)pool=poolFor(protectCorrect);if(!pool.length)pool=poolFor(soft);if(!pool.length)pool=unique.filter(base);if(!pool.length)pool=unique.filter(q=>!excludeCurrent||qKey(q)!==current);
    if(!pool.length){toast('ما فيه سؤال جديد متاح حاليًا');return;}
    const meta=(s.meta||[]).slice(-12);pool.sort((a,b)=>score(b,meta)-score(a,meta));const top=pool.slice(0,Math.max(1,Math.ceil(pool.length*.25)));state.currentQuestion=top[Math.floor(Math.random()*top.length)];
    state.usedQuestions?.add(qKey(state.currentQuestion));state.usedQuestions?.add(state.currentQuestion.questionID);recordSelection(state.currentQuestion);state.currentAwardPoints=state.drawnPoints||state.currentQuestion.points;state.usedChoiceAssist=false;state.deadline=Date.now()+60000;state.screen='question';render();
  };

  const oldFinish=window.finishQuestion;
  if(typeof oldFinish==='function')window.finishQuestion=function(status){const q=state.currentQuestion;if(status==='correct'&&q)markCorrect(q);try{if(q)window.LaffhaContentGovernance?.record(q,status);}catch(_){}return oldFinish(status);};
  window.laffhaSecureQuestionKey=qKey;
  console.info('Laffha V62 secure rotation ready');
})();