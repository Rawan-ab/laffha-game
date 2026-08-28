import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const publicFiles=['styles.css','final-polish-v11.css','setup-design-v15.css','responsive-v22.css','setup-header-v23.css','team-roster-v31.css','ordering-rank-v37.css','logos-general-v50.css','visual-category-v54.css','multiplayer-v56.css','public-question-bank.js','app.js','spin-fix.js','game-patch-v4.js','supabase-config.js','ui-speed-v63.js','secure-runtime-v62.js','lifelines-once-v62.js','question-rotation-secure-v62.js','multiplayer-v56.js','multiplayer-sync-v57.js','multiplayer-typed-secure-v62.js','multiplayer-replay-v61.js','multiplayer-fast-v65.js','controller.html','controller-prompt-v60.js'];
for(const file of publicFiles){const src=path.join(root,file);if(!fs.existsSync(src))throw new Error(`Missing production asset: ${file}`);fs.copyFileSync(src,path.join(out,file));}
let html=fs.readFileSync(path.join(root,'secure-v62.html'),'utf8').replace('<title>لفّها — Secure V65</title>','<title>لفّها</title>').replace('content="65-secure"','content="65"');
fs.writeFileSync(path.join(out,'index.html'),html);fs.writeFileSync(path.join(out,'play-v12.html'),html);
const controllerPath=path.join(out,'controller.html');let controller=fs.readFileSync(controllerPath,'utf8');
controller=controller
 .replace('supabase-config.js?v=58','supabase-config.js?v=65')
 .replace('pollTimer=setInterval(refreshGameState,1500)','pollTimer=setInterval(refreshGameState,1000)')
 .replace("const isGuess=x.questionType==='logo'||x.category==='خمن الصورة';if(isGuess){","const isGuess=(x.questionType==='logo'||x.category==='خمن الصورة')&&!(Array.isArray(x.options)&&x.options.length);if(isGuess){")
 .replace("if(gameState.phase==='result'){const ok=x.status==='correct';content.innerHTML=`${header()}<div class=\"result\"><div class=\"result-icon ${ok?'ok':'no'}\">${ok?'✓':'✕'}</div><h2>${ok?'إجابة صحيحة':'إجابة خاطئة'}</h2><button class=\"btn primary big-btn\" id=\"nextAction\" style=\"margin-top:16px\">التالي</button></div>`;document.getElementById('nextAction').onclick=async e=>{e.currentTarget.disabled=true;e.currentTarget.textContent='لحظة…';await sendAction('next')};return}","if(gameState.phase==='result'){const ok=x.status==='correct';content.innerHTML=`${header()}<div class=\"result\"><div class=\"result-icon ${ok?'ok':'no'}\">${ok?'✓':'✕'}</div><h2>${ok?'إجابة صحيحة':'إجابة خاطئة'}</h2><div class=\"status\">جاري الانتقال للفريق التالي…</div></div>`;return}")
 .replace('</body></html>','<script src="ui-speed-v63.js?v=65"></script></body></html>');
fs.writeFileSync(controllerPath,controller);
const runtimePath=path.join(out,'secure-runtime-v62.js');let runtime=fs.readFileSync(runtimePath,'utf8').replace('state.timerId=setInterval(tick,200)','state.timerId=setInterval(tick,500)');fs.writeFileSync(runtimePath,runtime);
// Disable the old DB read-before-write reconciliation loop. V65 host pushes state directly; controller keeps a 1s fallback only.
const syncPath=path.join(out,'multiplayer-sync-v57.js');let sync=fs.readFileSync(syncPath,'utf8');
sync=sync.replace("observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});","observer.observe(document.documentElement,{subtree:true,childList:true});").replace('setInterval(()=>reconcile(true),1500);','setInterval(()=>reconcile(true),10000);');fs.writeFileSync(syncPath,sync);
const typedPath=path.join(out,'multiplayer-typed-secure-v62.js');let typed=fs.readFileSync(typedPath,'utf8').replace('setInterval(attach,700);','setInterval(attach,5000);');fs.writeFileSync(typedPath,typed);
const promptPath=path.join(out,'controller-prompt-v60.js');let prompt=fs.readFileSync(promptPath,'utf8').replace('setInterval(syncPrompt,800);setTimeout(syncPrompt,700);','setInterval(syncPrompt,5000);setTimeout(syncPrompt,1200);');fs.writeFileSync(promptPath,prompt);
const bank=fs.readFileSync(path.join(out,'public-question-bank.js'),'utf8');for(const token of ['"correctAnswer"','"acceptedAnswers"','"aliases"','"wrongAnswers"'])if(bank.includes(token))throw new Error(`Sensitive question field leaked: ${token}`);
for(const file of ['questions.js','extra-questions.js','tv-bank-v27.js','general-bank-v27.js','movies-bank-v29.js','songs-bank-v29.js','artists-bank-v29.js','cartoons-bank-v29.js','sports-bank-v29.js','logos-bank-v29.js','migration/question-bank-export.json'])if(fs.existsSync(path.join(out,file)))throw new Error(`Private source leaked: ${file}`);
if(!html.includes('content="65"')||!html.includes('multiplayer-fast-v65.js?v=65'))throw new Error('V65 runtime missing');
if(!controller.includes('pollTimer=setInterval(refreshGameState,1000)'))throw new Error('V65 controller fallback missing');
console.log(`LAFFHA_V65_PRODUCTION_BUILD_OK ${fs.readdirSync(out).length} public files`);
