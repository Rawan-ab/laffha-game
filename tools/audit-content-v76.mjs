import fs from 'node:fs';
const file=new URL('../content-governance-v76.js',import.meta.url);
const src=fs.readFileSync(file,'utf8');
const a='/* V76_QUESTIONS_START */',b='/* V76_QUESTIONS_END */';
const start=src.indexOf(a),end=src.indexOf(b);
if(start<0||end<0)throw new Error('V76 question markers missing');
const qs=JSON.parse(src.slice(start+a.length,end));
const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase();
const ids=new Set(),prompts=new Set(),counts={};
for(const q of qs){
  if(ids.has(q.questionID))throw new Error(`Duplicate id: ${q.questionID}`);ids.add(q.questionID);
  const p=norm(q.questionText);if(prompts.has(p))throw new Error(`Duplicate prompt: ${q.questionText}`);prompts.add(p);
  if(!q.topicKey||!q.entityKey)throw new Error(`Missing topic/entity: ${q.questionID}`);
  if(!['easy','medium','hard'].includes(q.difficulty))throw new Error(`Bad difficulty: ${q.questionID}`);
  if(!Array.isArray(q.options)||q.options.length!==4||new Set(q.options.map(norm)).size!==4)throw new Error(`Bad options: ${q.questionID}`);
  if(Object.hasOwn(q,'correctAnswer')||Object.hasOwn(q,'wrongAnswers')||Object.hasOwn(q,'acceptedAnswers'))throw new Error(`Sensitive answer field leaked: ${q.questionID}`);
  counts[q.category]=(counts[q.category]||0)+1;
}
if(qs.length<50||qs.length>100)throw new Error(`Batch must be 50–100; got ${qs.length}`);
const expected=['tv','movies','songs','cartoons','general','sports','artists','countries'];
for(const c of expected)if(!counts[c])throw new Error(`Missing category: ${c}`);
console.log('LAFFHA_V76_CONTENT_AUDIT_OK',JSON.stringify({questions:qs.length,categories:counts}));
