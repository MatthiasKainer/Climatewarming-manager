import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, ACTIONS, EVENTS, available, takeAction, advance, chooseEvent, DAYS, grade } from '../src/engine.js';

const weights={water:1.6,power:1.5,health:1.6,food:1.3,trust:1.1,logistics:1.0,roads:.7,river:.2};
function bot(seed,style='balanced') {
  const s=createGame(seed);
  let guard=0; while(!s.over && s.day<=DAYS) { if(++guard>40)throw Error(`stuck ${style} seed ${seed} day ${s.day} pending ${s.pending?.title} budget ${s.budget}`);
    if(s.pending) {const i=style==='austerity'?1:0; chooseEvent(s, s.budget>=s.pending.choices[i].cost?i:1);}
    const turns=style==='austerity'?2:3;
    for(let n=0;n<turns;n++) {
      let viable=ACTIONS.filter(a=>!available(s,a));
      const urgency=Object.entries(s.metrics).reduce((t,[k,v])=>t+weights[k]*Math.max(0,50-v),0);
      const score=a=>{
        if(a.id==='credit') return (s.budget<16 && s.used.credit<2?100: -100) + (urgency>60?6:0);
        const gains=Object.entries(a.effect||{}).reduce((t,[k,v])=>t+(weights[k]||1)*v*(.2+Math.max(0,85-s.metrics[k])/55),0);
        const policyGain=a.policy ? ({ration:8,leaks:6,grid:8,protect:6,river:3,load:4}[a.policy[0]]||0)*(.5+ Math.max(0,75-s.metrics[a.policy[0]==='protect'?'health':a.policy[0]==='grid'||a.policy[0]==='load'?'power':a.policy[0]==='river'?'river':'water'])/75):0;
        return gains+policyGain-a.cost*.48+(a.id==='credit'?-30:0);
      };
      viable.sort((a,b)=>score(b)-score(a));
      if(!viable.length || score(viable[0])<0)break;
      takeAction(s,viable[0].id);
    }
    if(!s.over) {if(s.pending) chooseEvent(s, s.budget>=s.pending.choices[0].cost?0:1); advance(s);}
  }
  return s;
}

test('basic validity and guardrails',()=>{
  const s=createGame();
  assert.equal(s.ops,3);
  assert.equal(advance(s),true);
  assert.equal(s.day,2);
  assert.equal(takeAction(s,'unknown'),false);
  assert.ok(s.metrics.water<=100 && s.metrics.water>=0);
  while(s.day<3) advance(s);
  assert.ok(s.pending);
  assert.equal(takeAction(s,'trucks'),false);
  assert.ok(chooseEvent(s,0));
  assert.equal(s.pending,null);
  assert.ok(grade(s).score>=0);
});

test('actions apply cooldown, policies and budget constraints',()=>{
  const s=createGame();
  const first=s.metrics.water;
  assert.ok(takeAction(s,'trucks'));
  assert.ok(s.metrics.water>first);
  assert.equal(takeAction(s,'trucks'),false);
  const original=s.budget;
  assert.ok(takeAction(s,'ration'));
  assert.ok(s.policy.ration>0);
  assert.ok(s.budget<original);
});

test('seeded replay is deterministic',()=>{
  const a=bot(42),b=bot(42);
  assert.deepEqual(a.history,b.history);
  assert.equal(a.outcome,b.outcome);
});

test('event decisions never produce negative money',()=>{
  const s=createGame(42);s.day=5;s.budget=0;s.pending=EVENTS[5];
  assert.equal(chooseEvent(s,0),false);
  assert.equal(chooseEvent(s,1),true);
  // Events must always provide a free fallback if money has run out.
});

test('thoughtful play survives across 60 seeded climates',()=>{
  const wins=Array.from({length:60},(_,i)=>bot(i+1,'balanced')).filter(x=>x.outcome==='win').length;
  assert.ok(wins>=45, `Expected at least 45 survivals, got ${wins}`);
});

test('doing nothing does not meet the success condition',()=>{
  const s=createGame(30);
  while(!s.over){if(s.pending)chooseEvent(s,1);if(!s.over)advance(s);}
  assert.equal(s.outcome,'loss');
});

const summary={};
for(const style of ['balanced','austerity']) {
 const scores=[];let wins=0;let ends={};let samples=[];
 for(let seed=1;seed<=60;seed++) {let s=bot(seed,style);scores.push(grade(s).score);if(s.outcome==='win')wins++;ends[s.day]=(ends[s.day]||0)+1;if(seed<6)samples.push({seed,day:s.day,win:s.outcome,score:grade(s).score,budget:s.budget,stats:s.metrics});}
 summary[style]={wins,average:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),ends,samples};
}
console.log('PLAYTHROUGHS',JSON.stringify(summary));
