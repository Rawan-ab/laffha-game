const fs=require('fs');
const path=require('path');
const vm=require('vm');

module.exports=(req,res)=>{
  const root=process.cwd();
  const scripts=[
    'questions.js','extra-questions.js','tv-bank-v27.js','general-bank-v27.js','movies-bank-v29.js','songs-bank-v29.js','artists-bank-v29.js','cartoons-bank-v29.js','sports-bank-v29.js','sports-fix-v30.js','logos-bank-v29.js','no-truefalse.js',
    'song-fill-patch.js','bank-cleanup-v29.js','global-entertainment-v38.js','bank-audit-v30.js','question-history-v13.js','fair-points-v14.js','question-diversity-v27.js','question-quality-v34.js','question-audit-v37.js','logos-v38.js','question-diversity-v38.js','logos-v39.js','question-diversity-v39.js','format-variety-v40.js','content-expansion-v44.js','cartoon-balance-v41.js','question-quality-v42.js','entertainment-bias-v44.js','difficulty-hardening-v45.js'
  ];
  const store=new Map();
  const dummyEl=()=>({innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){}},appendChild(){},insertBefore(){},after(){},remove(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},dataset:{},disabled:false});
  const context={
    console:{log(){},info(){},warn(){},error(){},table(){}},
    Math,Date,JSON,Set,Map,Array,Object,String,Number,Boolean,RegExp,Promise,
    setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},
    localStorage:{getItem(k){return store.has(k)?store.get(k):null},setItem(k,v){store.set(k,String(v))},removeItem(k){store.delete(k)}},
    document:{getElementById(){return dummyEl()},querySelector(){return null},querySelectorAll(){return[]},createElement(){return dummyEl()},addEventListener(){},body:dummyEl()},
    state:{screen:'qa',teamCount:2,rounds:7,teams:[{lifelines:{}},{lifelines:{}}],categories:['tv','movies','songs','artists','cartoons','sports','general','logos'],currentTeam:0,currentRound:1,usedQuestions:new Set(),selectedCategory:'general',currentQuestion:null,drawnPoints:200,drawnDifficulty:'easy'},
    CATS:{tv:{},movies:{},songs:{},artists:{},cartoons:{},sports:{},general:{},logos:{}},
    setup(){},spin(){},difficulty(){},question(){},render(){},toast(){},finishQuestion(){},useLife(){},gameLayout(){},finalLogo(){return''},buildChoiceAssist(){return[]},
    pickQuestion(){},
  };
  context.window=context;
  context.globalThis=context;
  vm.createContext(context);
  const errors=[];
  for(const file of scripts){
    try{
      const p=path.join(root,file);
      if(!fs.existsSync(p)){errors.push({file,error:'missing'});continue;}
      vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:file,timeout:1500});
    }catch(e){errors.push({file,error:String(e&&e.message||e)});}
  }
  let qs=[];
  try{qs=JSON.parse(vm.runInContext('JSON.stringify(QUESTIONS)',context));}catch(e){errors.push({file:'QUESTIONS',error:String(e)});}
  const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  const cats=[...new Set(qs.map(q=>q.category))];
  const countBy=(arr,keyFn)=>arr.reduce((o,x)=>{const k=keyFn(x)||'unknown';o[k]=(o[k]||0)+1;return o;},{});
  const byCategory={};
  for(const c of cats){const a=qs.filter(q=>q.category===c);byCategory[c]={total:a.length,difficulty:countBy(a,q=>q.difficulty),type:countBy(a,q=>q.formatTag||q.questionType),regions:countBy(a,q=>q.regionTag||q.countryRegionTags?.[0]||'Other')};}
  const issues=[];
  const push=(severity,type,q,detail)=>issues.push({severity,type,id:q.questionID,category:q.category,difficulty:q.difficulty,question:q.questionText,answer:q.correctAnswer,detail});
  const genericWords=/^(برنامج مسابقات|كرتون فرنسي|مسلسل أمريكي|أنمي ياباني|ممثلة مصرية|مطربة لبنانية|مغنية مغربية|مذيعة خليجية|شركة طيران|قناة تلفزيونية|فندق عائلي)$/i;
  for(const q of qs){
    const text=norm(q.questionText),ans=norm(q.correctAnswer),wrong=q.wrongAnswers||[];
    if(q.questionType==='mcq'){
      const opts=[q.correctAnswer,...wrong].map(norm).filter(Boolean);
      if(new Set(opts).size<4)push('high','mcq_less_than_4_unique',q,`unique=${new Set(opts).size}`);
      if(wrong.length<3)push('high','mcq_less_than_3_wrongs',q,`wrongs=${wrong.length}`);
      if(/\d/.test(String(q.correctAnswer||'')) && wrong.some(x=>!(/\d/.test(String(x))))) push('high','numeric_option_type_mismatch',q,'numeric correct answer mixed with non-numeric distractor');
      if(wrong.some(x=>genericWords.test(String(x).trim())))push('medium','generic_distractor',q,'one or more distractors are generic labels rather than plausible peer answers');
    }
    if(q.difficulty==='easy'&&ans.length>=3&&text.includes(ans))push('high','answer_in_prompt_easy',q,'answer text appears in prompt');
    if(q.formatTag==='emoji'&&/🇸🇦|🇰🇼|🇦🇪|🇧🇭|🇶🇦|🇴🇲|🇱🇧|🇪🇬|🇸🇾|🇯🇴|🇲🇦|🇹🇳|🇩🇿|🇮🇶|🇬🇧|🇺🇸|🇫🇷|🇯🇵|🇰🇷|🇪🇸|🇩🇪/.test(String(q.questionText||''))) push('medium','emoji_country_giveaway',q,'emoji contains a country flag');
    if(q.category==='songs'&&q.questionType==='complete'){
      const blanks=(String(q.questionText||'').match(/_{2,}|____/g)||[]).length;
      if(blanks<3)push('high','song_completion_too_short',q,`blanks=${blanks}`);
      if(!q.singer)push('medium','song_completion_missing_singer',q,'singer metadata missing');
    }
    if(q.category==='logos'&&q.logoText&&norm(q.logoText).includes(ans)&&ans)push('high','logo_wordmark_reveals_answer',q,'logo text contains answer');
    if(q.hint&&ans.length>=4&&norm(q.hint).includes(ans))push('low','hint_contains_answer',q,'hint contains answer text');
  }
  // Duplicate exact content keys.
  const seen=new Map();
  for(const q of qs){const k=[q.category,norm(q.questionText),norm(q.correctAnswer)].join('::');if(seen.has(k))push('medium','duplicate_exact',q,`duplicates ${seen.get(k)}`);else seen.set(k,q.questionID);}

  // Franchise/topic concentration for cartoons.
  const cartoon=qs.filter(q=>q.category==='cartoons');
  const franchise=countBy(cartoon,q=>q.franchiseTag||'unlabeled');
  const topFranchise=Object.entries(franchise).sort((a,b)=>b[1]-a[1]).slice(0,12);

  // Simulate fair-point + shared-category decks (10000 matches each config).
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function buildTeamDeck(rounds,teamIndex){const base=Math.floor(rounds/3),rem=rounds%3,counts=[base,base,base];for(let r=0;r<rem;r++)counts[(teamIndex+r)%3]++;const deck=[];counts.forEach((n,i)=>{for(let j=0;j<n;j++)deck.push([200,400,600][i]);});return shuffle(deck);}
  function simConfig(teamCount,rounds,N=10000){
    const opp=Array.from({length:teamCount},()=>[]),uniqueCats=Array.from({length:teamCount},()=>[]);
    const active=['tv','movies','songs','artists','cartoons','sports','general'];
    for(let n=0;n<N;n++){
      const pointDecks=Array.from({length:teamCount},(_,i)=>buildTeamDeck(rounds,i));
      const seq=[];let last=null;
      while(seq.length<teamCount*rounds){let d=shuffle(active);if(d.length>1&&last&&d[0]===last){const j=d.findIndex((x,i)=>i>0&&x!==last);if(j>0)[d[0],d[j]]=[d[j],d[0]];}seq.push(...d);last=d[d.length-1];}
      const teamCats=Array.from({length:teamCount},()=>[]);
      for(let turn=0;turn<teamCount*rounds;turn++){const t=turn%teamCount;teamCats[t].push(seq[turn]);}
      for(let t=0;t<teamCount;t++){opp[t].push(pointDecks[t].reduce((a,b)=>a+b,0));uniqueCats[t].push(new Set(teamCats[t]).size);}
    }
    const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
    return {teamCount,rounds,pointOpportunity:opp.map(avg),avgUniqueCategoriesPerTeam:uniqueCats.map(avg),perfectAllCategoriesProbability:uniqueCats.map(a=>a.filter(x=>x===Math.min(rounds,7)).length/a.length)};
  }
  const simulations=[simConfig(2,5),simConfig(2,7),simConfig(2,10),simConfig(3,7),simConfig(4,7)];

  const severityCounts=countBy(issues,x=>x.severity);
  const typeCounts=countBy(issues,x=>x.type);
  const report={generatedAt:new Date().toISOString(),questionCount:qs.length,byCategory,evalErrors:errors,issueSummary:{severity:severityCounts,types:typeCounts,total:issues.length},topIssues:issues.filter(x=>x.severity==='high').slice(0,60),sampleMediumIssues:issues.filter(x=>x.severity==='medium').slice(0,40),cartoonTopFranchises:topFranchise,simulations};
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.statusCode=200;res.end(JSON.stringify(report,null,2));
};
