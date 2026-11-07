import { pfusch, html, script } from 'https://matthiaskainer.github.io/pfusch/pfusch.min.js';
import { DAYS, MAX_ACTIONS, METRICS, ACTIONS, DIFFICULTIES, difficultyConfig, createGame, finance, available, takeAction, chooseEvent, advance, grade, routeCondition, outlook, endCriteria, finalDayPreview } from './engine.js';
import { STATES, CITIES, CITY_BY_NAME, ROUTES, NODES, ROUTE_INCIDENT_CENTERS } from './geography.js';
import { attachSounds, playCue, audioPrefs, toggleEffects, toggleMusic } from './audio.js';

const prefKey='duerrekrise.difficulty.v1';
function startingDifficulty(){try{return difficultyConfig(localStorage.getItem(prefKey)).id;}catch{return 'standard';}}
const defaultDifficulty=startingDifficulty();
let game=createGame(20261107,defaultDifficulty);
const fmt=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:1});
const money=n=>`${fmt(n)} Mrd. €`;
const unit=n=>`${Math.round(n)} %`;
const tone=n=>n<34?'danger':n<57?'warn':'ok';
const metric=id=>METRICS.find(x=>x.id===id);
const TABS=[['alle','Alle'],['wasser','Wasser'],['infrastruktur','Netze'],['feuerwehr','Feuerwehr'],['gesellschaft','Menschen'],['versorgung','Nahrung'],['finanzen','Finanzen']];
const LAYERS=[['alle','Gesamt'],['verkehr','Verkehr'],['versorgung','Versorgung'],['einsatz','Feuerwehr / KatS']];
const STATE_RISK={'DE-BW':4,'DE-BY':3,'DE-BE':3,'DE-BB':5,'DE-HB':2,'DE-HH':2,'DE-HE':3,'DE-MV':3,'DE-NI':3,'DE-NW':4,'DE-RP':4,'DE-SL':4,'DE-ST':4,'DE-SN':4,'DE-SH':2,'DE-TH':4};
const arrow=n=>n>0?`+${fmt(n)}`:fmt(n);
const ROUTE_LABELS={A1:[144,208],A2:[302,244],A3:[257,397],A5:[155,477],A7:[216,327],A8:[266,524],A9:[337,378],A24:[319,163],RHEIN:[112,420]};
const roadStroke=t=>t==='danger'?'#ff6974':t==='warn'?'#f5bb74':'#58d7bd';
const forecast=()=>{const f=finance(game);return `${f.net>=0?'+':''}${money(f.net)} netto / Tag`};
const currentSelection=sel=>{
 if(!sel)return {label:'LAGEKARTE',name:'Deutschland',description:'Verkehrsachsen oder Einsatzpunkte auswählen.',status:'ÜBERSICHT'};
 if(sel.kind==='route') { const r=ROUTES.find(x=>x.id===sel.id);if(!r)return currentSelection(null);const c=routeCondition(game,r.id);return {label:'VERKEHRSKORRIDOR',name:`${r.id} · ${r.name}`,description:`${r.notes}. Verfügbarkeit: ${unit(c.score)}.${c.incident?` Störung: ${c.incident} (${c.days} Tag(e)).`:''}`,status:c.status.toUpperCase(),tone:c.tone}; }
 if(sel.kind==='node'){const n=NODES.find(x=>x.id===sel.id);if(!n)return currentSelection(null);const m=metric(n.metric);return {label:'VERSORGUNGS- / EINSATZPUNKT',name:n.name,description:`${m.detail} Reserve: ${unit(game.metrics[n.metric])}.`,status:tone(game.metrics[n.metric])==='danger'?'KRITISCH':tone(game.metrics[n.metric])==='warn'?'ANGESPANNT':'STABIL',tone:tone(game.metrics[n.metric])};}
 if(sel.kind==='state'){const land=STATES.find(x=>x.id===sel.id);const risk=STATE_RISK[sel.id]||3;return {label:'BUNDESLAND · RISIKOPROFIL',name:land?.name||sel.id,description:`Belastungsstufe ${risk}/5.`,status:risk>=5?'ERHÖHTE ANFÄLLIGKEIT':'REGION IM MODELL',tone:risk>=5?'warn':'ok'};}
 if(sel.kind==='city'){const n=CITY_BY_NAME[sel.id];return {label:'STADT / KNOTENPUNKT',name:n?.name||sel.id,description:'Verkehrsknoten und Versorgungsregion.',status:'LAGEPUNKT'};}
 return currentSelection(null);
};
function position(cityName){const c=CITY_BY_NAME[cityName];return c?`${c.x},${c.y}`:'';}
function cityXY(name){return CITY_BY_NAME[name]||{x:260,y:290};}
function routePath(r){return r.cities.map((c,i)=>`${i?'L':'M'}${position(c)}`).join('');}
function routeIcon(r){let center=ROUTE_INCIDENT_CENTERS[r.id];const p=cityXY(center);return {x:p.x,y:p.y};}
const CORE_THRESHOLD_IDS=['water','power','health','food','fire','trust','logistics'];
const INSTANT_FAILURE_IDS=['water','power','health','food','fire','trust'];
function thresholdFor(id){return CORE_THRESHOLD_IDS.includes(id)?31:null;}
function pill(id){
 const m=metric(id),v=game.metrics[id],threshold=thresholdFor(id);
 const dangerText=INSTANT_FAILURE_IDS.includes(id)?'Unter 14 %: Systemausfall.':'Unter 14 %: akute Versorgungsstörung.';
 return html.div({class:`res res-${tone(v)} ${v<30?'res-urgent':''}`,title:`${m.detail} ${threshold===null?'':`Mindestziel ${threshold} %. `}${dangerText}`},
  html.div({class:'res-head'},html.span(m.label),html.strong(unit(v))),
  html.div({class:'mini-track',role:'meter','aria-label':`${m.label}: ${unit(v)}. ${threshold===null?'':`Mindestziel ${threshold} %. `}Kritische Zone unter 14 %.`, 'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Math.round(v)},
   html.i({style:`width:${v}%`}),
   html.b({class:'failure-zone','aria-hidden':'true'}),
   threshold===null?null:html.b({class:'target-line',style:`left:${threshold}%`,title:`Mindestziel ${threshold} %`,'aria-hidden':'true'})));
}
function markNode(n,select,show){const c=cityXY(n.city),v=game.metrics[n.metric];if(!show)return null;return html.g({class:`net-node net-${tone(v)}`,role:'button',tabindex:'0','aria-label':`${n.name}, ${unit(v)}`,click:()=>select('node',n.id),keydown:e=>{if(e.key==='Enter')select('node',n.id);}},
 html.circle({cx:c.x,cy:c.y,r:13,class:'node-halo'}),
 html.circle({cx:c.x,cy:c.y,r:8,class:'node-core'}),
 html.text({x:c.x,y:c.y+3.5,'text-anchor':'middle','font-size':10,'font-weight':900,fill:'#0a1b26'},n.symbol),
 html.title(`${n.name}: ${unit(v)}`));}
function markCity(c,select,show){return show?html.g({class:`city-point ${c.important?'major':''}`,role:'button',tabindex:'0','aria-label':c.name,click:()=>select('city',c.name),keydown:e=>{if(e.key==='Enter')select('city',c.name);}},
 html.circle({cx:c.x,cy:c.y,r:c.important?2.7:1.3}),
 c.important?html.text({x:c.x+6,y:c.y-5,'font-size':9.5,'font-weight':700},c.name):null,
 html.title(c.name)):null;}
function drawRoute(r,select,show){if(!show)return null;const c=routeCondition(game,r.id),p=routePath(r),color=roadStroke(c.tone),isRiver=r.kind==='river';const a=routeIcon(r);return html.g({class:`route route-${c.tone} ${isRiver?'river-route':''}`,role:'button',tabindex:'0','aria-label':`${r.id} ${r.name}: ${c.status}`,click:()=>select('route',r.id),keydown:e=>{if(e.key==='Enter')select('route',r.id);}},
 html.path({d:p,stroke:'#06121d','stroke-width':isRiver?7:6,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'}),
 html.path({d:p,stroke:color,'stroke-width':isRiver?3.8:2.8,fill:'none','stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':isRiver?'2 5':undefined}),
 !isRiver?html.path({d:p,stroke:'#e9fff4','stroke-opacity':.36,'stroke-width':1.3,fill:'none',class:'route-flow','stroke-linecap':'round','stroke-dasharray':'2 12'}):null,
 c.tone!=='ok'&&['A3','A5','A7','A2','A8','A9'].includes(r.id)?html.g({class:'route-alert'},html.circle({cx:a.x,cy:a.y,r:6,fill:color,stroke:'#0a1b26','stroke-width':2}),html.text({x:a.x,y:a.y+2.7,'text-anchor':'middle',fill:'#061824','font-size':8,'font-weight':800},'!')):null,
 html.path({d:p,stroke:'transparent','stroke-width':12,fill:'none','pointer-events':'stroke',class:'route-hit'}),
 ROUTE_LABELS[r.id]?html.g({class:'route-tag'},html.rect({x:ROUTE_LABELS[r.id][0]-13,y:ROUTE_LABELS[r.id][1]-10,width:r.id==='RHEIN'?36:26,height:17,rx:2,fill:'#0b2029',stroke:color,'stroke-width':.9}),html.text({x:ROUTE_LABELS[r.id][0],y:ROUTE_LABELS[r.id][1]+1,'text-anchor':'middle','font-size':r.id==='RHEIN'?7:9,'font-weight':800,fill:'#e1f2e9'},r.id)):null,
 html.title(`${r.id}: ${c.status} (${unit(c.score)})${c.incident?' · '+c.incident:''}`));}
function mapView(state){
 const risk=outlook(game);
 const showRoad=state.layer==='alle'||state.layer==='verkehr';
 const showNodes=state.layer==='alle'||state.layer==='versorgung'||state.layer==='einsatz';
 const showCities=state.layer==='alle'||state.layer==='verkehr';
 const showFire=state.layer==='alle'||state.layer==='einsatz';
 const select=(kind,id)=>{state.inspect={kind,id};};
 const stormCenter=cityXY(game.stormZone);
 const highlighted=state.inspect?.kind==='route'?state.inspect.id:null;
 const countries=STATES.map((s,i)=>html.path({class:`state-area ${risk.level>=2?'state-threat':''}`,d:s.d,fill:game.storm>18&&(['DE-HE','DE-ST','DE-NW','DE-BY'].includes(s.id))?'#244653':risk.level>=3?`hsl(${8+(i%3)*3} 35% ${16+(i%4)*1.4}%)`:risk.level===2?`hsl(${17+(i%3)*4} 29% ${17+(i%4)*1.4}%)`:`hsl(${196-(STATE_RISK[s.id]||3)*3} 24% ${19+(i%4)*1.4}%)`,'data-state':s.id,role:'button',tabindex:'0',click:()=>select('state',s.id),keydown:e=>{if(e.key==='Enter')select('state',s.id);}},html.title(s.name)));
 return html.div({class:`map-stage urgency-${risk.level}`},
 html.svg({viewBox:'0 0 490 620',class:`germany-map layer-${state.layer}`,role:'img','aria-label':'Deutschlandkarte mit Verkehr und Versorgungsnetzen'},
   html.defs(
    html.pattern({id:'gridlines',width:24,height:24,patternUnits:'userSpaceOnUse'},html.path({d:'M24 0H0V24',stroke:'#233947','stroke-width':.45,fill:'none'})),
    html.radialGradient({id:'storm-glow'},html.stop({offset:'0%','stop-color':'#65a9df','stop-opacity':.40}),html.stop({offset:'100%','stop-color':'#65a9df','stop-opacity':0}))
   ),
   html.rect({x:0,y:0,width:490,height:620,fill:'url(#gridlines)'}),
   ...countries,
   game.storm>8?html.g({class:'radar-storm'},html.circle({cx:stormCenter.x,cy:stormCenter.y,r:50,fill:'url(#storm-glow)'}),html.circle({cx:stormCenter.x,cy:stormCenter.y,r:24,fill:'none',stroke:'#9dcaff','stroke-width':1.2,'stroke-dasharray':'3 7',class:'radar-ring'}),html.circle({cx:stormCenter.x,cy:stormCenter.y,r:7,fill:'#9dccfd','fill-opacity':.9}),html.text({x:stormCenter.x+16,y:stormCenter.y+22,class:'storm-label'},`STARKREGEN ${Math.round(game.storm)} %`)):null,
   ...ROUTES.map(r=>drawRoute(r,select,showRoad)),
   ...CITIES.map(c=>markCity(c,select,showCities)),
   ...NODES.filter(n=>state.layer!=='einsatz'||n.metric==='fire').map(n=>markNode(n,select,showNodes)),
   showFire&&game.fires>4?html.g({class:'wildfire-point'},html.circle({cx:405,cy:253,r:8+game.fires*.30,fill:'#ea704e','fill-opacity':.09,class:'fire-pulse'}),html.circle({cx:405,cy:253,r:6.5,fill:'#ff8b57'}),html.text({x:416,y:248,class:'fire-label'},'BRAND')):null,
   risk.level>=2?html.g({class:'map-threat-layer','aria-hidden':'true'},
      ...NODES.filter(n=>game.metrics[n.metric]<38).map(n=>{const c=cityXY(n.city);return html.g({class:`threat-pulse threat-${risk.level}`},html.circle({cx:c.x,cy:c.y,r:17+Math.max(0,38-game.metrics[n.metric])*.35,fill:'none',stroke:game.metrics[n.metric]<24?'#fb566a':'#f4a65c','stroke-width':1.8,class:'threat-ring'}),html.circle({cx:c.x,cy:c.y,r:13,fill:'#ed576a','fill-opacity':.12}));})):null,
   showFire&&game.fires>15?html.circle({cx:170,cy:530,r:6,fill:'#f7a05e',class:'fire-pulse'}):null,
   null
 ),
 html.div({class:'map-risk-label risk-'+risk.level},html.strong(risk.level>=2&&!risk.onCourse?'MINDESTZIEL GEFÄHRDET · '+risk.label:risk.label),html.span(risk.level>=2?`${risk.weakest} ${Math.round(risk.weakestValue)} % · ${fmt(risk.margin)} Pkt. bis Ausfall`:`Engpass: ${risk.bottleneck} ${Math.round(risk.bottleneckValue)} %`)),
 html.div({class:'map-key'},html.span(html.i({class:'key-dot green'}),'frei'),html.span(html.i({class:'key-dot amber'}),'eng'),html.span(html.i({class:'key-dot red'}),'kritisch')),
 html.div({class:'map-selection'},
  html.span({class:'map-selection-label'},currentSelection(state.inspect).label),
  html.strong(currentSelection(state.inspect).name),
  html.p(currentSelection(state.inspect).description),
  html.span({class:`selection-status ${currentSelection(state.inspect).tone||'ok'}`},currentSelection(state.inspect).status)
 ),
 highlighted?html.span({class:'selected-route-label'},`AKTIV: ${highlighted}`):null
 );
}
function actionRow(a,refresh){const reason=available(game,a),can=!reason;const color=a.funds?'gain':'cost';return html.button({class:`action-row ${can?'':'locked'}`,type:'button',disabled:!can,'data-cuelume-press':'','data-cuelume-release':'',click:()=>{if(takeAction(game,a.id)){playCue('success');refresh();}},title:reason||a.desc},
 html.span({class:'action-left'},html.strong(a.name),html.small(a.desc)),
 html.span({class:'action-right'},html.strong({class:color},a.funds?`+${money(a.funds)}`:money(a.cost)),html.small(reason||a.impact)),
 );}
function eventPanel(e,refresh){
 const risk=outlook(game);
 const danger=[...METRICS].sort((a,b)=>game.metrics[a.id]-game.metrics[b.id]).slice(0,4);
 return html.div({class:'event-panel',role:'dialog','aria-modal':'false','aria-label':`Lageentscheidung: ${e.title}`},
  html.div({class:'incident-line'},html.span({class:'blink'}),'LAGEENTSCHEIDUNG',html.span(e.category)),
  html.h2(e.title),html.p({class:'event-explain'},e.text),
  html.div({class:'event-status-heading'},html.strong('AKTUELLE LAGE · VOR DER ENTSCHEIDUNG'),html.span(`${money(game.budget)} verfügbar`)),
  html.div({class:'event-status'},...danger.map(m=>html.div({class:`event-metric em-${tone(game.metrics[m.id])}`},html.span(m.label),html.strong(`${Math.round(game.metrics[m.id])} %`)))),
  html.div({class:'event-choices'},...e.choices.map((c,i)=>html.button({class:'choice',type:'button',disabled:game.budget<c.cost,'data-cuelume-press':'','data-cuelume-release':'',click:()=>{if(chooseEvent(game,i)){playCue('success');refresh();}}},
   html.div({class:'choice-title'},html.strong(c.name),html.span(c.cost?money(c.cost):'0 €')),
   html.p(c.text),html.small([...Object.entries(c.effect||{}).map(([k,v])=>`${metric(k).label}: ${arrow(v)}`),...(c.flood?[`Überflutung ${arrow(c.flood)}`]:[]),...(c.fires?[`Brandfront ${arrow(c.fires)}`]:[])].join(' · '))))),
  html.div({class:'event-note'},html.strong(risk.label),html.span('Entscheide nach Netzlage und verfügbaren Mitteln.')));
}
function resultPanel(restart){
 const g=grade(game),ending=endCriteria(game),win=game.outcome==='win';
 const previous=game.history.find(x=>x.day===game.day-1);
 return html.div({class:`end-panel ${win?'end-win':'end-loss'}`,role:'region','aria-label':'Abschlusslage'},
  html.div({class:'end-eyebrow'},win?'KRISENLAGE ÜBERSTANDEN':'KRISENMANAGEMENT GESCHEITERT',html.span(`TAG ${game.day}/${DAYS} · ${difficultyConfig(game.difficulty).name.toUpperCase()}`)),
  html.h2(win?'Deutschland hält durch.':'Die Krise überfordert das System.'),
  html.p({class:'end-reason'},game.endedReason),
  html.div({class:'end-score'},html.strong(`${g.score}/100`),html.div(html.span('LEISTUNGSINDEX'),html.b(`Ø ${fmt(ending.avg)} % Versorgung`),html.small(ending.qualityReached?'Qualitätsziel 47,5 % erreicht':'Qualitätsziel 47,5 % nicht erreicht · kein automatisches Scheitern'))),
  html.div({class:'end-section-title'},'ÜBERLEBENSKRITERIEN'),
  html.div({class:'end-checks'},...ending.checks.map(c=>html.div({class:`end-check ${c.pass?'pass':'fail'}`},html.strong(c.pass?'✓':'!'),html.span(c.label),html.small(c.detail)))),
  html.div({class:'end-section-title'},'ENDLAGE ALLER BEREICHE',html.span(`Veränderung seit Tag ${game.day-1}`)),
  html.div({class:'end-areas'},...METRICS.map(m=>{
   const v=game.metrics[m.id],delta=previous?Math.round((v-previous[m.id])*10)/10:0;
   return html.div({class:`end-area end-${['water','power','health','food','fire','trust','logistics'].includes(m.id)&&v<31?'low':v<47?'warn':'good'}`},
    html.span(m.label),html.strong(`${fmt(v)} %`),html.small({class:delta<0?'neg':'pos'},`${delta>0?'+':''}${fmt(delta)} Pkt.`));
  })),
  html.div({class:'end-actions'},
   html.div(html.strong(`Restbudget: ${money(game.budget)}`),html.small(`${game.actionCount} Beschlüsse · ${money(game.debt)} Notkredite`)),
   html.button({class:'primary','data-cuelume-press':'',click:()=>restart(false)},'Neue Krise'),
   html.button({class:'outline','data-cuelume-press':'',click:()=>restart(true)},'Nochmal')));
}
function helpOverlay(state){return html.div({class:'modal-backdrop'},html.div({class:'help-modal',role:'dialog','aria-modal':'true'},
 html.div({class:'eyebrow'},'SO FUNKTIONIERT ES'),html.h2('18 Tage. Begrenzte Eingriffe.'),
 html.p('Klicke auf Korridore und Netzknoten. Wähle höchstens zwei Maßnahmen am Tag; sparen kann die beste Entscheidung sein.'),
 html.p(`Schwierigkeit: ${difficultyConfig(game.difficulty).name}. ${money(difficultyConfig(game.difficulty).budget)} Startbudget; ${money(difficultyConfig(game.difficulty).income)} täglicher Zufluss abzüglich laufender Kosten. Stufe für den nächsten Neustart oben auswählen.`),
 html.p('Tag 18: Sieben Kernbereiche (Wasser, Strom, Gesundheit, Lebensmittel, Feuerwehr, Gesellschaft und Logistik) müssen ≥ 31 % halten; Brandfront < 40 und Überflutung < 38. Rhein, Autobahnen und Durchschnitt beeinflussen die Qualität, aber nicht allein das Überleben.'),
 html.p('Unter 14 % bei einem Kernsystem droht der sofortige Kollaps. Drei Systeme unter 24 % über zwei Tage können ebenfalls zur Niederlage führen.'),
 html.button({class:'primary','data-cuelume-press':'',click:()=>{state.help=false;}},'Zurück zum Krisenstab')));}
function topStat(label,value,detail,extra=''){return html.div({class:`top-stat ${extra}`},html.span(label),html.strong(value),detail?html.small(detail):null);}
function systemCard(){const risk=outlook(game);return html.div({class:`situation-rail rail-urgency-${risk.level}`},
 html.div({class:'rail-title'},html.span('NETZ- & EINSATZSTATUS')), ...METRICS.map(m=>pill(m.id)),
 html.div({class:`risk-warning risk-${risk.level}`,role:'status'},html.strong(risk.label),html.span(!risk.onCourse?`${risk.weakest}: ${fmt(risk.weakestValue)} % · nötig ≥ 31 % in den sieben Kernbereichen`:`Alle Mindestziele aktuell erreicht · Ø ${fmt(risk.avg)} %`)),
 html.div({class:'risk-summary'},
 html.div(html.span('BRANDFRONT'),html.strong(`${Math.round(game.fires)}/100`)),
 html.div(html.span('ÜBERFLUTUNG'),html.strong(`${Math.round(game.flood)}/100`))));}
function dispatchLog(s){return html.div({class:`alert-row log-${s.kind}`},html.span(`T${s.day}`),html.div(html.strong(s.title),html.small(s.body)));}

pfusch('crisis-game',{version:0,tab:'alle',layer:'alle',inspect:null,help:false,difficultyChoice:defaultDifficulty},state=>{
 const refresh=()=>{state.version++;};
 const restart=(repeat=false)=>{
  game=createGame(repeat?game.seed:game.seed+1,state.difficultyChoice);
  state.inspect=null;state.tab='alle';state.layer='alle';state.help=false;refresh();
 };
 const cash=finance(game);
 const selected=currentSelection(state.inspect);
 const risk=outlook(game),audio=audioPrefs(),lastDay=finalDayPreview(game);
 const options=ACTIONS.filter(a=>state.tab==='alle'||a.group===state.tab);
 return [
  script(function(){attachSounds(this.shadowRoot);}),
  html.div({class:`app urgency-${risk.level}`},
   html.header({class:'topbar'},
    html.div({class:'brand'},html.span({class:'brand-mark'},'D/26'),html.div(html.strong('DÜRREKRISE'),html.small('KRISENSTAB · DEUTSCHLAND'))),
    html.div({class:'top-stats'},
     topStat('TAG',`${game.day} / ${DAYS}`,null,'day-stat'),
     topStat('TAGESMAX.',`${fmt(game.temp)} °C`,'Hitze'),
     topStat('VERFÜGBARES BUDGET',money(game.budget),forecast(),'budget-stat'),
     topStat('BESCHLÜSSE',`${game.actionsToday} / ${MAX_ACTIONS}`,`${game.ops} verfügbar`),
     topStat('SYSTEMRISIKO',risk.label,risk.level>=2&&!risk.onCourse?`${risk.weakest}: ${fmt(risk.weakestValue)} % · Minimum 31 %`:`${risk.bottleneck}: ${Math.round(risk.bottleneckValue)} %`,`status-stat risk-${risk.level}`)),
    html.div({class:'top-links'},
      html.label({class:`difficulty-control ${state.difficultyChoice!==game.difficulty?'queued':''}`,title:'Auswahl gilt ab der nächsten Krise'},
       html.span('STUFE'),
       html.select({'aria-label':'Schwierigkeitsgrad für die nächste Krise',value:state.difficultyChoice,
        change:e=>{const id=difficultyConfig(e.target.value).id;state.difficultyChoice=id;try{localStorage.setItem(prefKey,id);}catch{};},
        },...DIFFICULTIES.map(d=>html.option({value:d.id,selected:d.id===state.difficultyChoice},d.name))),
       state.difficultyChoice!==game.difficulty?html.small('BEIM NEUSTART'):null),
      html.button({class:`text-button sound-switch ${audio.effects?'active':''}`,title:'Cuelume-Press-Töne an/aus','aria-pressed':audio.effects,'data-cuelume-press':'',click:()=>{toggleEffects();refresh();}},audio.effects?'TON AN':'TON AUS'),html.button({class:`text-button sound-switch ${audio.music?'active':''}`,title:audio.error||'Leise Hintergrundmusik an/aus','aria-pressed':audio.music,'data-cuelume-press':'',click:async()=>{await toggleMusic();refresh();}},audio.error?'MUSIK FEHLER':audio.music?'MUSIK AN':'MUSIK AUS'),html.button({class:'text-button',disabled:!!game.pending,click:()=>{state.help=!state.help;}},'REGELN'),html.button({class:'text-button',disabled:!!game.pending,click:()=>restart(false)},'NEUSTART'))),
   html.main({class:'dashboard'},
    html.section({class:`map-panel panel map-urgency-${risk.level}`},
     html.div({class:'panel-head'},html.div(html.span({class:'eyebrow'},'STRATEGISCHES LAGEBILD'),html.h1('Deutschland · Infrastruktur')),html.div({class:'layer-tabs'},...LAYERS.map(([id,label])=>html.button({type:'button',class:`layer-tab ${state.layer===id?'selected':''}`,disabled:!!game.pending,click:()=>{state.layer=id;}},label)))),
     html.div({class:'map-body'},mapView(state),systemCard()),
     html.div({class:'map-foot'},html.span(`SZENARIO: ${game.scenarioName.toUpperCase()} · STUFE: ${difficultyConfig(game.difficulty).name.toUpperCase()}`),html.span('ZIEL: KERN 7 ≥ 31 % · BRAND < 40 · FLUT < 38'))),
    html.section({class:`decision-panel panel ${game.pending?'decision-pending':''} ${game.over?'decision-finished':''}`},
     html.div({class:'panel-head'},html.div(html.span({class:'eyebrow'},'FÜHRUNGSSTAB'),html.h2(game.over?'Abschlusslage':game.pending?'Lageentscheidung':'Maßnahmen')),html.span({class:'decisions-badge'},game.over?'KRISENENDE':game.pending?'SOFORTENTSCHEIDUNG':`${game.actionsToday}/${MAX_ACTIONS} BESCHLOSSEN`)),
     html.div({class:'filters'},...TABS.map(([id,label])=>html.button({type:'button',class:`tab ${state.tab===id?'selected':''}`,disabled:game.over||!!game.pending,click:()=>{state.tab=id;}},label))),
     html.div({class:'action-list',inert:game.over||!!game.pending,'aria-hidden':game.over||!!game.pending},...options.map(a=>actionRow(a,refresh))),
     html.div({class:'decision-footer'},
      html.div(html.strong(lastDay?`TAG 18: ${lastDay.outcome==='win'?'Stabilisierung erwartet':'Mindestziele in Gefahr'}`:'Lage fortschreiben'),html.small(lastDay?`Prognose: Ø ${fmt(lastDay.avg)} % · ${lastDay.criteria.weak.map(x=>x.label).join(', ')||'alle Mindestwerte tragfähig'}`:`Täglich ${money(cash.income)} Einnahmen · ${money(cash.upkeep+cash.debtService)} laufende Kosten`)),
      html.button({type:'button',class:'advance primary',disabled:game.over||!!game.pending,'data-cuelume-press':'','data-cuelume-release':'',click:()=>{if(advance(game)){playCue(game.pending?'error':'page');if(game.pending)state.layer='alle';refresh();}}},`TAG ${Math.min(DAYS,game.day+1)} →`)),
     html.div({class:'alerts'},html.div({class:'alerts-label'},html.span('LETZTE MELDUNGEN'),html.span(`${game.log.length} IM PROTOKOLL`)),...game.log.slice(0,2).map(dispatchLog)),
     game.pending&&!game.over?eventPanel(game.pending,refresh):null,
     game.over?resultPanel(restart):null
    )),
   html.footer({class:'footer'},html.span('DÜRREKRISE ’26 · EIN FIKTIVES PLANSPIEL'),html.span('Geometrie: isellsoap/deutschlandGeoJSON · Cuelume (MIT) · Originalton · ',html.a({href:'https://github.com/MatthiasKainer/pfusch',target:'_blank',rel:'noopener noreferrer'},'mit pfusch')))
  ),
  state.help?helpOverlay(state):null,
  null
 ];
});
