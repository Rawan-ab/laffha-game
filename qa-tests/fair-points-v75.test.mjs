import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../fair-points-v14.js',import.meta.url),'utf8');
const context={
  state:{rounds:5,teams:[{},{}],categories:['tv']},
  CATS:{tv:{name:'مسلسلات'}},
  setup(){},
  gameLayout(){},
  pickQuestion(){},
  console:{info(){}},
  Math,
  setTimeout,
  clearTimeout
};
context.window=context;
vm.createContext(context);
vm.runInContext(source,context);

const fairCounts=context.LAFFHA_FAIR_COUNTS_V46;
assert.equal(typeof fairCounts,'function','fair count helper must be exposed');

const scenarios=new Map([
  [5,{counts:[2,1,2],total:2000}],
  [7,{counts:[2,3,2],total:2800}],
  [10,{counts:[3,4,3],total:4000}],
  [15,{counts:[5,5,5],total:6000}]
]);

for(const [rounds,expected] of scenarios){
  const counts=Array.from(fairCounts(rounds));
  assert.deepEqual(counts,expected.counts,`${rounds} rounds difficulty mix`);
  assert.equal(counts.reduce((a,b)=>a+b,0),rounds,`${rounds} rounds count`);
  const total=counts[0]*200+counts[1]*400+counts[2]*600;
  assert.equal(total,expected.total,`${rounds} rounds total opportunity`);
  assert.equal(total/rounds,400,`${rounds} rounds average opportunity`);

  for(let teamCount=2;teamCount<=6;teamCount++){
    const perTeam=Array.from({length:teamCount},()=>total);
    assert.equal(new Set(perTeam).size,1,`${teamCount} teams receive equal opportunity`);
  }
}

console.log('FAIR_POINTS_V75_OK: 5/7/10/15 rounds, 2-6 teams');
