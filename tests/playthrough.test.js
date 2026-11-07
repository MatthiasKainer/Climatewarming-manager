import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, finance, ACTIONS, EVENTS, START_BUDGET, DAILY_INCOME, MAX_ACTIONS, available, takeAction, advance, chooseEvent, DAYS, grade,routeCondition,SCENARIOS,outlook,endCriteria,finalDayPreview} from '../src/engine.js';
import {run} from './balance.mjs';
import {STATES,CITIES,CITY_BY_NAME,ROUTES,NODES} from '../src/geography.js';

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
 const baseline=createGame(41);baseline.fires=0;
 assert.equal(available(baseline,ACTIONS.find(a=>a.id==='dispatch')),'Keine ausreichend gro\u00dfe Brandfront');
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

test('Rhein-Main downpour briefly refills the Rhine but burdens drinking-water treatment',()=>{
 const s=createGame(21);
 let found=false,priorRiver=0,priorWater=0;
 for(let day=2;day<=6;day++){
  if(s.pending)assert.ok(chooseEvent(s,1));
  priorRiver=s.metrics.river;priorWater=s.metrics.water;
  assert.ok(advance(s));
  if(s.pending?.title==='Starkregenfront über Rhein-Main'){found=true;break;}
 }
 assert.ok(found,'Rhein-Main event appears in early crisis phase');
 assert.equal(s.pending.category,'STARKREGEN');
 assert.ok(s.metrics.river>priorRiver+5,'more water enters the Rhine');
 assert.ok(s.metrics.water<priorWater,'raw-water pollution stresses treatment');
 assert.ok(s.riverPulseDays>0,'run-off increase is temporary');
 assert.ok(s.flood>=15);
 assert.ok(s.storm>=75);
 assert.ok(s.routeIncidents.A3.penalty>=20);
 assert.ok(routeCondition(s,'A3').score<routeCondition(s,'A9').score);
 const fireRisk=s.fireRisk, floodBefore=s.flood;
 assert.ok(chooseEvent(s,1));
 assert.ok(s.flood<floodBefore);
 assert.equal(available(s,ACTIONS.find(a=>a.id==='pumps')),'');
 assert.ok(takeAction(s,'pumps'));
 assert.ok(s.flood<floodBefore-10);
 assert.ok(s.metrics.fire<80);
 assert.ok(s.fireRisk<=fireRisk+1);
 const high=s.metrics.river;
 if(!s.over)assert.ok(advance(s));
 assert.ok(s.metrics.river<high,'pulse recedes rather than permanently ending the drought');
});

test('new crisis seeds produce genuinely different opening problems and event timing',()=>{
 const a=createGame(41),b=createGame(42),same=createGame(41);
 assert.deepEqual(a.metrics,same.metrics);
 assert.equal(a.scenario,same.scenario);
 assert.deepEqual(Object.entries(a.timeline).map(([k,v])=>[k,v.title]),Object.entries(same.timeline).map(([k,v])=>[k,v.title]));
 assert.notEqual(a.scenario,b.scenario);
 assert.notDeepEqual(a.metrics,b.metrics);
 assert.equal(Object.keys(a.timeline).length,Object.keys(EVENTS).length);
 assert.ok(SCENARIOS.length>=4);
});

test('at 40 percent, warning text shows proximity to failure thresholds',()=>{
 const s=createGame(21);
 for(const id of Object.keys(s.metrics))s.metrics[id]=40;
 let risk=outlook(s);
 assert.ok(risk.level>=2);
 assert.equal(risk.weakestValue,40);
 s.metrics.water=19;s.metrics.health=22;s.metrics.fire=21;
 risk=outlook(s);
 assert.equal(risk.level,3);
 assert.equal(risk.criticalCount,3);
 assert.ok(risk.margin<=8);
 assert.match(risk.statement,/Ausfallschwelle/);
});

test('German geometry has 16 real federal states, cities, and a real corridor graph',()=>{
 assert.equal(STATES.length,16);
 assert.equal(new Set(STATES.map(x=>x.id)).size,16);
 assert.ok(CITIES.length>=45);
 assert.equal(ROUTES.length,9);
 assert.equal(NODES.filter(x=>x.metric==='fire').length,3);
 for(const state of STATES){assert.match(state.d,/^M\d/);assert.ok(state.d.length>40)}
 for(const city of CITIES){assert.ok(city.x>=0&&city.x<=490);assert.ok(city.y>=0&&city.y<=620)}
 for(const road of ROUTES){for(const name of road.cities)assert.ok(CITY_BY_NAME[name],`${road.id} missing ${name}`)}
});


test('day-18 screenshot with 45.2 % average is a narrow survival, not a sudden loss',()=>{
 const s=createGame(20261107);
 // Recreate the visible terminal values from the reported screenshot.
 Object.assign(s.metrics,{water:39,river:33,power:38,roads:60,logistics:50,health:51,food:51,fire:48,trust:37});
 s.fires=0;s.flood=0;
 const result=endCriteria(s);
 assert.ok(result.avg<47.5, 'quality target missed');
 assert.ok(result.pass, 'the actual survival thresholds are all satisfied');
 assert.equal(result.checks.filter(x=>!x.pass).length,0);
 s.metrics.logistics=30.9;
 assert.equal(endCriteria(s).pass,false);
 assert.match(endCriteria(s).checks[0].detail,/Logistik/);
});

test('final-day preview is deterministic, non-mutating and agrees with the real day 18',()=>{
 const s=createGame(21);
 s.day=17;s.pending=null;s.over=false;
 Object.assign(s.metrics,{water:46,river:42,power:47,roads:58,logistics:51,health:53,food:55,fire:50,trust:44});
 s.fires=8;s.flood=4;
 const before=JSON.stringify(s);
 const forecast=finalDayPreview(s);
 assert.ok(forecast);
 assert.equal(JSON.stringify(s),before,'forecast never advances the actual game');
 assert.ok(advance(s));
 assert.equal(s.day,18);
 assert.equal(s.outcome,forecast.outcome);
 assert.deepEqual(s.metrics,forecast.metrics);
 assert.equal(endCriteria(s).pass,forecast.criteria.pass);
});

test('quality target is not an instant-failure threshold; survival still requires real reserves',()=>{
 const s=createGame(4);
 Object.assign(s.metrics,{water:35,river:10,power:35,roads:15,logistics:35,health:35,food:35,fire:35,trust:35});
 assert.equal(endCriteria(s).pass,true,'low transport index and roads can be compensated by effective logistics');
 s.fires=40;
 assert.equal(endCriteria(s).pass,false,'out-of-control fire prevents survival');
 s.fires=0;s.flood=38;
 assert.equal(endCriteria(s).pass,false,'flood threshold remains binding');
});
