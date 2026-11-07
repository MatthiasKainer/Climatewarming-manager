import {createGame,ACTIONS,available,takeAction,chooseEvent,advance,DAYS,grade,finance} from '../src/engine.js';
const weights={water:1.7,river:.25,power:1.55,roads:.7,logistics:1.0,health:1.8,food:1.5,fire:1.4,trust:1.1};
function evaluation(s,a){
 if(a.id==='credit')return s.budget<8&&s.day<14&&Math.min(s.metrics.water,s.metrics.power,s.metrics.health,s.metrics.food,s.metrics.fire)<44?18:-80;
 const gain=Object.entries(a.effect||{}).reduce((v,[key,delta])=>v+delta*(weights[key]||1)*(delta>0?Math.max(.35,1+(57-s.metrics[key])/38):1),0);
 const policy=a.policy?({ration:11,leaks:8,river:4,grid:8,load:6,rail:4,protect:8,firewatch:5,fireline:7,mutual:5}[a.policy[0]]||0):0;
 const fireBonus=-(a.fires||0)*(s.fires>8?1.5:0.4) - (a.fireRisk||0)*.45;
 return gain+policy+fireBonus - a.cost*.8 -(a.upkeep||0)*(a.upkeepDays||0)*.7;
}
function eventDecision(s,mode){
 const [a,b]=s.pending.choices;
 const gain=c=>Object.entries(c.effect||{}).reduce((v,[k,d])=>v+d*(weights[k]||1)*(d>0?Math.max(.3,1+(55-s.metrics[k])/38):1),0) - (c.fires||0)*1.0-c.cost*.85;
 if(mode==='austerity'||mode==='idle')return 1;
 if(s.budget>=a.cost+(mode==='prudent'?8:0) && gain(a)>gain(b)+(mode==='aggressive'?-7:3))return 0;
 return 1;
}
export function run(seed,mode){
 const s=createGame(seed);let guards=0;
 let totalSkipped=0;
 while(!s.over){ if(++guards>32)throw Error('stuck '+JSON.stringify({seed,mode,day:s.day}));
  if(s.pending)chooseEvent(s,eventDecision(s,mode));
  const max=mode==='idle'?0:mode==='prudent'?1:2;
  let n=0;
  while(n<max){
   const options=ACTIONS.filter(a=>!available(s,a)).map(a=>({a,score:evaluation(s,a)})).sort((a,b)=>b.score-a.score);
   if(!options.length)break;
   const {a,score}=options[0];
   const min=mode==='aggressive'?-10:mode==='balanced'?3:mode==='prudent'?7:10;
   const reserve=mode==='aggressive'?0:mode==='balanced'?7:mode==='prudent'?10:13;
   if(score<=min || (a.id!=='credit' && s.budget-a.cost<reserve))break;
   if(!takeAction(s,a.id))throw Error('failed action '+a.id);
   n++;
  }
  if(n===0)totalSkipped++;
  if(s.pending)chooseEvent(s,eventDecision(s,mode));
  if(!s.over&&!advance(s))throw Error('cant advance');
 }
 return {seed,mode,win:s.outcome==='win',score:grade(s).score,day:s.day,m:s.metrics,fires:s.fires,budget:s.budget,debt:s.debt,acts:s.actionCount,skips:totalSkipped};
}
if(process.argv[1]?.endsWith('/balance.mjs'))for(const mode of ['idle','austerity','prudent','balanced','aggressive']){
 const all=Array.from({length:150},(_,i)=>run(i+1,mode));
 const avg=k=>Math.round(all.reduce((n,x)=>n+x[k],0)/all.length*10)/10;
 const wins=all.filter(x=>x.win).length;
 const ended=all.reduce((a,x)=>(a[x.day]=(a[x.day]||0)+1,a),{});
 console.log(mode,'win',wins+'/150','avgScore',avg('score'),'acts',avg('acts'),'skipped',avg('skips'),'budget',avg('budget'),'day',avg('day'),'ends',JSON.stringify(ended));
 for(const seed of [1,2,42]){const s=all.find(x=>x.seed===seed);console.log('  SAMPLE',seed,JSON.stringify({outcome:s.win,score:s.score,day:s.day,budget:s.budget,acts:s.acts,skips:s.skips,fires:s.fires,m:s.m}));}
}