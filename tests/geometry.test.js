import test from 'node:test';
import assert from 'node:assert/strict';
import {platonic,counts,tunnelMesh,cubeSphere,proofStages,hanoi,treasure,sieve} from '../src/geometry.js';
test('渲染六种多面体的实际计数',()=>{
 const expected=[[4,6,4],[8,12,6],[6,12,8],[12,30,20],[20,30,12],[21,45,26]];
 expected.forEach(([V,E,F],i)=>assert.deepEqual(counts(platonic(i)),{V,E,F,chi:2}));
});
test('变形与贯穿孔的欧拉值',()=>{
 for(const t of [0,.1,.5,1])assert.equal(counts(cubeSphere(t)).chi,2);
 for(const holes of [1,2])assert.equal(counts(tunnelMesh(holes)).chi,2-2*holes);
});
test('证明过程中保持平面欧拉值，终态是三角形',()=>{
 const stages=proofStages();for(const stage of stages)assert.equal(counts(stage).chi,1);
 assert.deepEqual(counts(stages.at(-1)),{V:3,E:3,F:1,chi:1});
});
test('汉诺塔每次合法且完成搬移',()=>{
 for(let n=1;n<=6;n++){
  const towers=[Array.from({length:n},(_,i)=>n-i),[],[]],moves=hanoi(n);
  assert.equal(moves.length,2**n-1);
  for(const [from,to] of moves){assert.ok(towers[from].length);const d=towers[from].pop();assert.ok(!towers[to].length||towers[to].at(-1)>d);towers[to].push(d)}
  assert.equal(towers[0].length,0);assert.equal(towers[1].length,0);assert.equal(towers[2].length,n);
 }
});
test('寻宝中点不依赖绞架，路线转弯后等长',()=>{
 for(const a of [-1.4,0,.8])for(const b of [-1,.2,2]){
  const {first,second}=treasure(a,b);
  assert.ok(Math.abs((first[0]+second[0])/2)<1e-10);
  assert.ok(Math.abs((first[1]+second[1])/2-1)<1e-10);
  assert.ok(Math.abs(Math.hypot(first[0]+1,first[1])-Math.hypot(a+1,b))<1e-10);
  assert.ok(Math.abs(Math.hypot(second[0]-1,second[1])-Math.hypot(1-a,b))<1e-10);
 }
});
test('百以内素数数量及现代定义',()=>{const ps=sieve();assert.equal(ps.length,25);assert.equal(ps[0],2);assert.equal(ps.at(-1),97);assert.ok(!ps.includes(1));});
