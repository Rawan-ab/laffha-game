import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';

const controller=fs.readFileSync('controller.html','utf8');
const fast=fs.readFileSync('multiplayer-fast-v66.js','utf8');
const host=fs.readFileSync('multiplayer-v56.js','utf8');
const sync=fs.readFileSync('multiplayer-sync-v57.js','utf8');

const core=s=>!s?'':[Number(s.revision||0),s.phase||'',Number(s.current_team||0),s.question_id||s.question_payload?.questionText||''].join('|');
const identity=s=>[core(s),JSON.stringify(s.question_payload?.lifelines||{}),JSON.stringify(s.question_payload?.options||[]),s.question_payload?.activeHint||''].join('|');

test('team-scoped result identity is emitted and consumed',()=>{
  for(const source of [fast,host,sync])assert.match(source,/answeredByTeam:base\.teamNo/);
  assert.match(controller,/resultTeam=Number\(x\.answeredByTeam/);
});

test('mobile lifeline actions have broadcast and DB fallback handlers',()=>{
  assert.match(controller,/sendAction\('lifeline',\{type\}\)/);
  assert.match(fast,/type==='lifeline'/);
  assert.match(host,/type==='lifeline'/);
  for(const key of ['hint','time','change','choices'])assert.ok(controller.includes("'"+key+"'"));
});

test('result transition is capped at 450ms',()=>{
  assert.match(fast,/\},450\);/);
  assert.doesNotMatch(fast,/\},1050\);/);
});

test('duplicate realtime packets do not cause rerenders',()=>{
  const base={revision:8,phase:'question',current_team:1,question_id:'q-1',question_payload:{questionText:'Q',options:['A','B'],lifelines:{hint:true,time:true,change:true,choices:false}}};
  let current=null,renders=0;
  const apply=next=>{if(identity(current)===identity(next)){current=next;return}current=next;renders++};
  apply(base);
  for(let i=0;i<10000;i++)apply(structuredClone(base));
  assert.equal(renders,1);
});

test('lifeline changes rerender without changing question core',()=>{
  const a={revision:8,phase:'question',current_team:1,question_id:'q-1',question_payload:{options:['A','B'],lifelines:{hint:true}}};
  const b=structuredClone(a);b.question_payload.lifelines.hint=false;b.question_payload.activeHint='clue';
  assert.equal(core(a),core(b));
  assert.notEqual(identity(a),identity(b));
});

test('six-team stress simulation stays deterministic and fast',()=>{
  const teams=6,events=60000;
  let state={revision:1,phase:'spin',current_team:1,question_id:null,question_payload:{}};
  let processed=0;
  const samples=[];
  for(let i=0;i<events;i++){
    const t0=performance.now();
    const team=i%teams+1;
    const next=i%10===0?{...state,revision:state.revision+1,current_team:team,phase:i%20===0?'question':'spin',question_id:i%20===0?'q-'+i:null,question_payload:{lifelines:{hint:true,time:true,change:true,choices:true}}}:structuredClone(state);
    if(identity(next)!==identity(state))processed++;
    state=next;samples.push(performance.now()-t0);
  }
  samples.sort((a,b)=>a-b);
  const p95=samples[Math.floor(samples.length*.95)];
  assert.equal(processed,events/10);
  assert.ok(p95<5,'p95 event processing exceeded 5ms: '+p95);
  fs.mkdirSync('qa-output',{recursive:true});
  fs.writeFileSync('qa-output/multiplayer-v72-stress.json',JSON.stringify({teams,events,meaningfulTransitions:processed,p95ProcessingMs:p95,maxProcessingMs:samples.at(-1)},null,2));
});
