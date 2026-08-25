import { chromium } from 'playwright';
import fs from 'fs';

const BASE='https://laffha-game-qpoc.vercel.app/';
const OUT='qa-output';
fs.mkdirSync(OUT,{recursive:true});
const norm=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const countBy=(arr,fn)=>arr.reduce((o,x)=>{const k=fn(x)||'unknown';o[k]=(o[k]||0)+1;return o;},{});

function auditBank(qs){
  const issues=[];
  const add=(severity,type,q,detail='')=>issues.push({severity,type,id:q.questionID,category:q.category,difficulty:q.difficulty,question:q.questionText,answer:q.correctAnswer,detail});
  const exact=new Map();
  for(const q of qs){
    const t=norm(q.questionText),a=norm(q.correctAnswer),w=q.wrongAnswers||[];
    const key=`${q.category}::${t}::${a}`;
    if(exact.has(key))add('medium','duplicate_exact',q,`duplicates ${exact.get(key)}`);else exact.set(key,q.questionID);
    if(q.questionType==='mcq'){
      const opts=[q.correctAnswer,...w].map(norm).filter(Boolean);
      if(w.length<3)add('high','mcq_fewer_than_3_wrongs',q,`wrongs=${w.length}`);
      if(new Set(opts).size<4)add('high','mcq_fewer_than_4_unique_options',q,`unique=${new Set(opts).size}`);
      if(/\d/.test(String(q.correctAnswer||''))&&w.some(x=>!/\d/.test(String(x))))add('high','numeric_mixed_with_non_numeric',q);
    }
    if(q.difficulty==='easy'&&a.length>=3&&t.includes(a))add('high','easy_answer_in_prompt',q);
    if(q.difficulty==='easy'&&/^ما جنسية/.test(t))add('high','easy_direct_nationality',q);
    if(q.formatTag==='emoji'&&/🇸🇦|🇰🇼|🇦🇪|🇧🇭|🇶🇦|🇴🇲|🇱🇧|🇪🇬|🇸🇾|🇯🇴|🇲🇦|🇹🇳|🇩🇿|🇮🇶|🇬🇧|🇺🇸|🇫🇷|🇯🇵|🇰🇷|🇪🇸|🇩🇪/.test(String(q.questionText||'')))add('medium','emoji_flag_giveaway',q);
    if(q.category==='songs'&&q.questionType==='complete'){
      const raw=String(q.questionText||'');
      const blanks=(raw.match(/_{3,}/g)||[]).length;
      if(blanks<3)add('high','song_fill_under_3_blanks',q,`blanks=${blanks}`);
      if(!q.singer)add('medium','song_fill_no_singer',q);
    }
    if(q.category==='logos'&&q.logoText&&a&&norm(q.logoText).includes(a))add('high','logo_wordmark_reveals_answer',q);
  }
  const byCategory={};
  for(const cat of [...new Set(qs.map(q=>q.category))]){
    const a=qs.filter(q=>q.category===cat);
    byCategory[cat]={total:a.length,difficulty:countBy(a,q=>q.difficulty),type:countBy(a,q=>q.formatTag||q.questionType),region:countBy(a,q=>q.regionTag||q.countryRegionTags?.[0]||'Other')};
  }
  const cartoon=qs.filter(q=>q.category==='cartoons');
  const franchise=Object.entries(countBy(cartoon,q=>q.franchiseTag||'unlabeled')).sort((a,b)=>b[1]-a[1]).slice(0,15);
  return {questionCount:qs.length,byCategory,issueCounts:countBy(issues,x=>x.type),severity:countBy(issues,x=>x.severity),highIssues:issues.filter(x=>x.severity==='high').slice(0,100),mediumIssues:issues.filter(x=>x.severity==='medium').slice(0,100),cartoonTopFranchises:franchise};
}

function pointCounts(rounds,teamIndex){const base=Math.floor(rounds/3),rem=rounds%3,c=[base,base,base];for(let r=0;r<rem;r++)c[(teamIndex+r)%3]++;return c;}
function pointFairness(){
  const configs=[];
  for(const rounds of [5,7,10,15]){
    for(const teams of [2,3,4,5,6]){
      const rows=Array.from({length:teams},(_,i)=>{const c=pointCounts(rounds,i);return {team:i+1,easy:c[0],medium:c[1],hard:c[2],maxOpportunity:c[0]*200+c[1]*400+c[2]*600};});
      const vals=rows.map(x=>x.maxOpportunity);configs.push({rounds,teams,rows,gap:Math.max(...vals)-Math.min(...vals)});
    }
  }
  return configs;
}

function categorySimulation(teams=2,rounds=7,N=20000){
  const cats=['tv','movies','songs','artists','cartoons','sports','general'];
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a};
  const uniq=Array.from({length:teams},()=>[]);
  for(let n=0;n<N;n++){
    const seq=[];let last=null;
    while(seq.length<teams*rounds){let d=shuffle(cats);if(last&&d.length>1&&d[0]===last){const j=d.findIndex((x,i)=>i>0&&x!==last);if(j>0)[d[0],d[j]]=[d[j],d[0]];}seq.push(...d);last=d[d.length-1];}
    const per=Array.from({length:teams},()=>[]);for(let i=0;i<teams*rounds;i++)per[i%teams].push(seq[i]);
    per.forEach((a,i)=>uniq[i].push(new Set(a).size));
  }
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  return {teams,rounds,avgUniqueCategoriesPerTeam:uniq.map(avg),allUniqueProbability:uniq.map(a=>a.filter(x=>x===Math.min(rounds,cats.length)).length/a.length)};
}

async function getQuestions(page){
  return await page.evaluate(()=>{
    try{
      const qs=eval('QUESTIONS');
      return qs.map(q=>({questionID:q.questionID,category:q.category,difficulty:q.difficulty,points:q.points,questionType:q.questionType,formatTag:q.formatTag,questionText:q.questionText,correctAnswer:q.correctAnswer,wrongAnswers:q.wrongAnswers||[],hint:q.hint,singer:q.singer,regionTag:q.regionTag,countryRegionTags:q.countryRegionTags,eraTag:q.eraTag,subCategory:q.subCategory,contentScope:q.contentScope,marketTag:q.marketTag,franchiseTag:q.franchiseTag,logoText:q.logoText,mediaURL:q.mediaURL}));
    }catch(e){return {__error:String(e)}}
  });
}

async function samplePicker(page){
  const results={};
  for(const cat of ['tv','movies','songs','artists','cartoons','sports','general','logos']){
    results[cat]={};
    for(const [diff,pts] of [['easy',200],['medium',400],['hard',600]]){
      const arr=[];
      for(let i=0;i<12;i++){
        const q=await page.evaluate(({cat,diff,pts})=>{
          try{
            return eval(`(()=>{state.selectedCategory=${JSON.stringify(cat)};state.drawnDifficulty=${JSON.stringify(diff)};state.drawnPoints=${pts};pickQuestion(${JSON.stringify(diff)});const q=state.currentQuestion;return q?{id:q.questionID,text:q.questionText,answer:q.correctAnswer,type:q.formatTag||q.questionType,region:q.regionTag||q.countryRegionTags?.[0]||'Other'}:null})()`);
          }catch(e){return {error:String(e)}}
        },{cat,diff,pts});
        if(q)arr.push(q);
      }
      const ids=arr.filter(x=>x.id).map(x=>x.id);results[cat][diff]={draws:arr.length,uniqueIds:new Set(ids).size,repeats:ids.length-new Set(ids).size,sample:arr.slice(0,12)};
    }
  }
  return results;
}

async function smokeFlow(page,label){
  const out={label,errors:[],steps:[]};
  page.on('pageerror',e=>out.errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')out.errors.push(`console: ${m.text()}`)});
  await page.goto(BASE+'?qa='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  out.steps.push({name:'loaded',url:page.url(),title:await page.title(),scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth),innerWidth:await page.evaluate(()=>innerWidth)});
  const start=page.locator('#start');if(await start.count())await start.click();
  await page.waitForTimeout(300);
  const begin=page.locator('#begin');
  if(await begin.count()){await begin.click();out.steps.push({name:'begin_clicked'});}else out.errors.push('begin button not found');
  await page.waitForTimeout(500);
  const spin=page.locator('#spinBtn');
  if(await spin.count()){
    await spin.click();out.steps.push({name:'spin_clicked'});
    await page.waitForFunction(()=>{const b=document.getElementById('spinBtn');return b&&/ابدأ السؤال/.test(b.textContent||'')},{timeout:12000}).catch(()=>{});
    if(await spin.count()){await spin.click().catch(()=>{});out.steps.push({name:'question_start_clicked'});}
    await page.waitForTimeout(1200);
    out.steps.push({name:'question_visible',question:await page.locator('.question-text').first().textContent().catch(()=>null),meta:await page.locator('.q-meta').first().textContent().catch(()=>null),answers:await page.locator('.answer-btn').allTextContents().catch(()=>[])});
  }else out.errors.push('spin button not found');
  return out;
}

const browser=await chromium.launch({headless:true});
const desktop=await browser.newContext({viewport:{width:1440,height:900}});const dp=await desktop.newPage();
const desktopFlow=await smokeFlow(dp,'desktop');await dp.screenshot({path:`${OUT}/desktop.png`,fullPage:true});
let qs=await getQuestions(dp);if(qs&&qs.__error)throw new Error(qs.__error);
const bankAudit=auditBank(qs);
const pickerSamples=await samplePicker(dp);
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mobile.newPage();
const mobileFlow=await smokeFlow(mp,'mobile');await mp.screenshot({path:`${OUT}/mobile.png`,fullPage:true});
await browser.close();

const report={generatedAt:new Date().toISOString(),base:BASE,desktopFlow,mobileFlow,bankAudit,pickerSamples,pointFairness:pointFairness(),categorySimulations:[categorySimulation(2,5),categorySimulation(2,7),categorySimulation(2,10),categorySimulation(3,7),categorySimulation(4,7)]};
fs.writeFileSync(`${OUT}/qa-report.json`,JSON.stringify(report,null,2));
const summary={
  questionCount:bankAudit.questionCount,
  severity:bankAudit.severity,
  issueCounts:bankAudit.issueCounts,
  desktopErrors:desktopFlow.errors,
  mobileErrors:mobileFlow.errors,
  pointFairnessGaps:report.pointFairness.filter(x=>x.teams===2).map(x=>({rounds:x.rounds,gap:x.gap,opportunity:x.rows.map(r=>r.maxOpportunity)})),
  category2x7:report.categorySimulations.find(x=>x.teams===2&&x.rounds===7),
  pickerRepeatSummary:Object.fromEntries(Object.entries(pickerSamples).map(([cat,d])=>[cat,Object.fromEntries(Object.entries(d).map(([diff,v])=>[diff,{unique:v.uniqueIds,repeats:v.repeats}]))]))
};
console.log('QA_REPORT_START');
console.log(JSON.stringify(summary,null,2));
console.log('QA_REPORT_END');
