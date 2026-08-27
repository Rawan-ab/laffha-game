import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

const publicFiles=[
  'styles.css',
  'final-polish-v11.css',
  'setup-design-v15.css',
  'responsive-v22.css',
  'setup-header-v23.css',
  'team-roster-v31.css',
  'ordering-rank-v37.css',
  'logos-general-v50.css',
  'visual-category-v54.css',
  'multiplayer-v56.css',
  'public-question-bank.js',
  'app.js',
  'spin-fix.js',
  'game-patch-v4.js',
  'supabase-config.js',
  'secure-runtime-v62.js',
  'setup-design-v15.js',
  'question-rotation-secure-v62.js',
  'multiplayer-v56.js',
  'multiplayer-sync-v57.js',
  'multiplayer-typed-secure-v62.js',
  'multiplayer-replay-v61.js',
  'controller.html',
  'controller-prompt-v60.js'
];

for(const file of publicFiles){
  const src=path.join(root,file);
  if(!fs.existsSync(src))throw new Error(`Missing production asset: ${file}`);
  fs.copyFileSync(src,path.join(out,file));
}

let html=fs.readFileSync(path.join(root,'secure-v62.html'),'utf8');
html=html
  .replace('<title>لفّها — Secure V62</title>','<title>لفّها</title>')
  .replace('content="62-secure"','content="62"');
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'play-v12.html'),html);

const bank=fs.readFileSync(path.join(out,'public-question-bank.js'),'utf8');
for(const token of ['"correctAnswer"','"acceptedAnswers"','"aliases"','"wrongAnswers"']){
  if(bank.includes(token))throw new Error(`Sensitive question field leaked into production bank: ${token}`);
}

const forbiddenFiles=[
  'questions.js','extra-questions.js','tv-bank-v27.js','general-bank-v27.js','movies-bank-v29.js',
  'songs-bank-v29.js','artists-bank-v29.js','cartoons-bank-v29.js','sports-bank-v29.js','logos-bank-v29.js',
  'migration/question-bank-export.json'
];
for(const file of forbiddenFiles){
  if(fs.existsSync(path.join(out,file)))throw new Error(`Private source leaked into production: ${file}`);
}

const files=fs.readdirSync(out).sort();
console.log(`LAFFHA_V62_PRODUCTION_BUILD_OK ${files.length} public files`);
console.log(files.join('\n'));
