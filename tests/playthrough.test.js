import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, finance, ACTIONS, EVENTS, START_BUDGET, DAILY_INCOME, MAX_ACTIONS, available, takeAction, advance, chooseEvent, DAYS, grade} from '../src/engine.js';
import {run} from './balance.mjs';

test('tight opening budget and exact action counter',()=>{
 const s=createGame(42);
 assert.equal(s.budget,START_BUDGET);
 assert.equal(s.ops,MAX_ACTIONS);
 assert.equal(s.actionsToday,0);
 assert.ok(ACTIONS.filter(a=>a.cost<=s.budget).length>=7);
 assert.ok(takeAction(s,'generator'));
 assert.equal(s.actionsToday,1);
 assert.equal(s.ops,1);
 assert.ok(takeAction(s,'ration'));
 assert.equal(s.actionsToday,2);
 assert.equal(s.ops,0);
 assert.equal(takeAction(s,'message'),false);
 assert.equal(advance(s),true);
 assert.equal(s.actionsToday,0);
 assert.equal(s.ops,MAX_ACTIONS);
});

test('budget grows slowly at rest and maintenance makes overcommitting costly',()=>{
 const empty=createGame(8);
 assert.equal(finance(empty).net,DAILY_INCOME);
 assert.ok(advance(empty));
 assert.equal(empty.budget,START_BUDGET+DAILY_INCOME);
 const s=createGame(8);
 assert.ok(takeAction(s,'generator'));
 assert.equal(s.budget,11);
 assert.equal(finance(s).upkeep,2);
 assert.equal(finance(s).net,DAILY_INCOME-2);
 assert.ok(advance(s));
 assert.equal(s.budget,14);
 assert.equal(s.actionsToday,0);
 assert.ok(advance(s));
 assert.equal(s.budget,17);
 assert.ok(s.pending);
 assert.equal(advance(s),false);
 assert.equal(chooseEvent(s,1),true);
 assert.equal(advance(s),true);
 assert.ok(s.pending);
 assert.equal(chooseEvent(s,1),true);
 assert.equal(advance(s),true);
 assert.equal(finance(s).upkeep,0);
});

test('spending all money blocks emergency options without negative balances',()=>{
 const s=createGame(13);
 assert.ok(takeAction(s,'generator'));
 assert.ok(takeAction(s,'shelters'));
 assert.equal(s.budget,2);
 const costly=ACTIONS.find(a=>a.id==='mutual');
 assert.match(available(s,costly),/Heute keine Beschl|fehlen/);
 assert.equal(takeAction(s,'mutual'),false);
 s.pending=EVENTS[15];
 assert.equal(chooseEvent(s,0),false);
 assert.ok(chooseEvent(s,1));
 assert.ok(s.budget>=0);
});

test('fires are an actionable crisis with genuine operational tradeoffs',()=>{
 const s=createGame(42);
 s.fires=31;s.fireRisk=81;
 const water=s.metrics.water,crew=s.metrics.fire;
 assert.ok(takeAction(s,'dispatch'));
 assert.equal(s.fires,12);
 assert.equal(s.metrics.water,water-5);
 assert.equal(s.metrics.fire,crew-10);
 assert.ok(s.policy.fireline>0);
 assert.equal(takeAction(s,'dispatch'),false);
 assert.equal(available(createGame(),ACTIONS.find(a=>a.id==='dispatch')),'Keine ausreichend gro\u00dfe Brandfront');
});

test('firefighting and logistics have coupled consequences',()=>{
 const s=createGame(12);
 s.day=15;s.pending=EVENTS[15];
 const water=s.metrics.water;
 assert.ok(chooseEvent(s,0));
 assert.equal(s.metrics.water,water-5);
 const s2=createGame(12);s2.day=15;s2.pending=EVENTS[15];
 assert.ok(chooseEvent(s2,1));
 assert.ok(s2.metrics.logistics<s.metrics.logistics);
});

test('the emergency loan is once-only and delays future recovery',()=>{
 const s=createGame();
 assert.ok(takeAction(s,'credit'));
 assert.equal(s.budget,START_BUDGET+24);
 assert.equal(s.debt,24);
 assert.equal(finance(s).net,DAILY_INCOME-1.5);
 assert.equal(takeAction(s,'credit'),false);
 for(let i=0;i<3;i++){
  if(s.pending)chooseEvent(s,1);
  if(!s.over)advance(s);
 }
 assert.equal(s.used.credit,1);
});

test('seeded results are deterministic',()=>{
 const a=run(42,'balanced'),b=run(42,'balanced');
 assert.deepEqual(a,b);
 assert.equal(a.day,DAYS);
});

test('balanced crisis management can win but blind inaction does not',()=>{
 const seeds=Array.from({length:150},(_,i)=>i+1);
 const scenarios={};
 for(const style of ['idle','balanced','aggressive']){
  const scores=seeds.map(seed=>run(seed,style));
  scenarios[style]={wins:scores.filter(x=>x.win).length,acts:scores.reduce((n,x)=>n+x.acts,0)/scores.length,skips:scores.reduce((n,x)=>n+x.skips,0)/scores.length};
 }
 assert.equal(scenarios.idle.wins,0);
 assert.ok(scenarios.balanced.wins>=65 && scenarios.balanced.wins<=135,JSON.stringify(scenarios));
 assert.ok(scenarios.balanced.skips>=6,JSON.stringify(scenarios));
 assert.ok(scenarios.aggressive.wins<scenarios.balanced.wins/3,JSON.stringify(scenarios));
 assert.ok(scenarios.aggressive.acts>scenarios.balanced.acts*1.5,JSON.stringify(scenarios));
 console.log('BALANCE',JSON.stringify(scenarios));
});

test('day 18 ends play and final grading is bounded',()=>{
 for(const seed of [3,15,42]){
  const s=createGame(seed);
  while(!s.over){if(s.pending)chooseEvent(s,1);advance(s);}
  assert.ok(s.day<=DAYS);
  assert.ok(['win','loss'].includes(s.outcome));
  assert.ok(grade(s).score>=0&&grade(s).score<=100);
 }
});