import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const bankCode=fs.readFileSync('public-question-bank.js','utf8');
for(const token of ['"correctAnswer"','"acceptedAnswers"','"wrongAnswers"']){
  if(bankCode.includes(token)) throw new Error(`Public bank leaks ${token}`);
}
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="app"></div></body></html>',{url:'https://secure.test/',runScripts:'outside-only',pretendToBeVisual:true});
const ctx=dom.getInternalVMContext();
ctx.console=console;ctx.setInterval=()=>0;ctx.clearInterval=()=>{};ctx.setTimeout=cb=>{try{cb();}catch{}return 0};ctx.clearTimeout=()=>{};ctx.requestAnimationFrame=cb=>{try{cb(0);}catch{}return 0};ctx.cancelAnimationFrame=()=>{};
ctx.LaffhaRealtime={client:{functions:{invoke:async()=>({data:{correct:true,hide:[]},error:null})}},ensureSession:async()=>({id:'smoke-user'}),readableError:e=>String(e?.message||e)};
for(const file of ['public-question-bank.js','app.js','spin-fix.js','game-patch-v4.js','secure-runtime-v62.js','setup-design-v15.js','question-rotation-secure-v62.js']){
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file}).runInContext(ctx);
}
new vm.Script(`
  if(QUESTIONS.length!==575)throw new Error('Expected 575 questions, got '+QUESTIONS.length);
  if(QUESTIONS.some(q=>Object.prototype.hasOwnProperty.call(q,'correctAnswer')))throw new Error('correctAnswer leaked');
  if(!QUESTIONS.some(q=>q.category==='logos'))throw new Error('Missing visual category');
  const choice=QUESTIONS.find(q=>q.questionType==='mcq'&&Array.isArray(q.options)&&q.options.length>=2);if(!choice)throw new Error('No secure MCQ options');
  state.currentQuestion=choice;state.currentAwardPoints=choice.points;state.deadline=Date.now()+60000;state.screen='question';question();
  if(document.querySelectorAll('[data-secure-answer]').length<2)throw new Error('MCQ buttons not rendered');

  const visual=QUESTIONS.find(q=>q.category==='logos'&&q.mediaURL);if(!visual)throw new Error('No visual question with image');state.currentQuestion=visual;state.currentAwardPoints=visual.points;state.deadline=Date.now()+60000;state.screen='question';question();if(!document.querySelector('.visual-frame-v54 img'))throw new Error('Visual image not rendered');if(!document.getElementById('secureOpenAnswer'))throw new Error('Solo visual typed input missing');

  const direct=QUESTIONS.find(q=>!['mcq','logo','ordering'].includes(q.questionType));if(!direct)throw new Error('No direct question');state.currentQuestion=direct;state.currentAwardPoints=direct.points;state.deadline=Date.now()+60000;state.screen='question';question();if(!document.getElementById('secureOpenAnswer')||!document.getElementById('secureSubmit'))throw new Error('Direct secure input missing');

  const ordering=QUESTIONS.find(q=>q.questionType==='ordering'&&Array.isArray(q.items)&&q.items.length>2);if(!ordering)throw new Error('No ordering question');state.currentQuestion=ordering;state.currentAwardPoints=ordering.points;state.deadline=Date.now()+60000;state.screen='question';question();if(document.querySelectorAll('.secure-order-item').length!==ordering.items.length||!document.getElementById('secureOrderSubmit'))throw new Error('Secure ordering controls missing');

  globalThis.__SMOKE__={total:QUESTIONS.length,choice:choice.questionID,visual:visual.questionID,direct:direct.questionID,ordering:ordering.questionID};
`).runInContext(ctx);
console.log('SECURE_V62_SMOKE_OK',ctx.__SMOKE__);
