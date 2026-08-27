import fs from 'node:fs';

const src = JSON.parse(fs.readFileSync('migration/question-bank-export.json','utf8'));
const questions = Array.isArray(src.questions) ? src.questions : [];

function seededShuffle(values, seedText){
  let h=2166136261;
  for(const ch of String(seedText)) h=(h^ch.charCodeAt(0))*16777619>>>0;
  const a=[...values];
  for(let i=a.length-1;i>0;i--){
    h=(h*1664525+1013904223)>>>0;
    const j=h%(i+1);[a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function uniqueStrings(arr){return [...new Set(arr.filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='').map(v=>String(v)))];}
function shuffledDifferent(values,seed){
  const source=uniqueStrings(values),out=seededShuffle(source,seed);
  if(out.length>1&&out.every((v,i)=>v===source[i]))out.push(out.shift());
  return out;
}

const sensitive = new Set(['correctAnswer','acceptedAnswers','aliases','correctOrder','expectedOrder','correctSequence','solution']);
const publicQuestions = questions.map((q,i)=>{
  const out={};
  for(const [k,v] of Object.entries(q)) if(!sensitive.has(k)&&k!=='wrongAnswers') out[k]=v;
  out.questionID=String(q.questionID||`generated-${i+1}`);
  out.secureAnswer=true;
  if(['mcq','logo'].includes(String(q.questionType||''))){
    out.options=seededShuffle(uniqueStrings([...(Array.isArray(q.wrongAnswers)?q.wrongAnswers:[]),q.correctAnswer]),out.questionID);
  }
  if(String(q.questionType||'')==='ordering'){
    out.items=shuffledDifferent(Array.isArray(q.items)?q.items:[],`${out.questionID}:ordering`);
  }
  return out;
});

const js = `// AUTO-GENERATED from private question bank. No correct answers are stored in this file.\nconst QUESTIONS = ${JSON.stringify(publicQuestions)};\n`;
for(const forbidden of ['"correctAnswer"','"acceptedAnswers"','"aliases"','"wrongAnswers"']){
  if(js.includes(forbidden)) throw new Error(`Sensitive field leaked into public bank: ${forbidden}`);
}
fs.writeFileSync('public-question-bank.js',js);

const html=fs.readFileSync('index.html','utf8');
const scriptNames=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(x=>!/^https?:/i.test(x));
const audit=[];
for(const name of scriptNames){
  if(!fs.existsSync(name)) continue;
  const code=fs.readFileSync(name,'utf8');
  const hits=[];
  for(const token of ['correctAnswer','acceptedAnswers','wrongAnswers']) if(code.includes(token)) hits.push(token);
  if(hits.length) audit.push({file:name,hits});
}
fs.writeFileSync('migration/security-audit.json',JSON.stringify({sourceVersion:src.sourceVersion,total:publicQuestions.length,audit},null,2));
console.log(`Built public bank with ${publicQuestions.length} questions; sensitive references in ${audit.length} loaded scripts.`);
