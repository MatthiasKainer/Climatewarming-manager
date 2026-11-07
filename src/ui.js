import { pfusch, html } from 'https://matthiaskainer.github.io/pfusch/pfusch.min.js';
import { DAYS, MAX_ACTIONS, METRICS, ACTIONS, createGame, finance, available, takeAction, chooseEvent, advance, grade, routeCondition } from './engine.js';
import { STATES, CITIES, CITY_BY_NAME, ROUTES, NODES, ROUTE_INCIDENT_CENTERS } from './geography.js';

let game=createGame();
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
 if(!sel)return {label:'LAGEKARTE',name:'Deutschland',description:'Korridore, Städte und Versorgungspunkte anklicken. Leitungs- und Einsatznetz sind strategisch vereinfacht.',status:'SIMULATION'};
 if(sel.kind==='route') { const r=ROUTES.find(x=>x.id===sel.id);if(!r)return currentSelection(null);const c=routeCondition(game,r.id);return {label:'VERKEHRSKORRIDOR',name:`${r.id} · ${r.name}`,description:`${r.notes}. Modellierte Verfügbarkeit: ${unit(c.score)}.${c.incident?` Störung: ${c.incident} (${c.days} Tag(e)).`:''}`,status:c.status.toUpperCase(),tone:c.tone}; }
 if(sel.kind==='node'){const n=NODES.find(x=>x.id===sel.id);if(!n)return currentSelection(null);const m=metric(n.metric);return {label:'VERSORGUNGS- / EINSATZPUNKT',name:n.name,description:`${m.detail} Bundesweite Reserve: ${unit(game.metrics[n.metric])}. Standort symbolisiert eine Region, keine einzelne echte Anlage.`,status:tone(game.metrics[n.metric])==='danger'?'KRITISCH':tone(game.metrics[n.metric])==='warn'?'ANGESPANNT':'STABIL',tone:tone(game.metrics[n.metric])};}
 if(sel.kind==='state'){const land=STATES.find(x=>x.id===sel.id);const risk=STATE_RISK[sel.id]||3;return {label:'BUNDESLAND · RISIKOPROFIL',name:land?.name||sel.id,description:`Illustrative Belastungsstufe ${risk}/5. Die farbige Fläche ist eine Modellannahme und kein aktueller Gefahrenbericht.`,status:risk>=5?'ERHÖHTE ANFÄLLIGKEIT':'REGION IM MODELL',tone:risk>=5?'warn':'ok'};}
 if(sel.kind==='city'){const n=CITY_BY_NAME[sel.id];return {label:'STADT / KNOTENPUNKT',name:n?.name||sel.id,description:'Geografisch verorteter Orientierungspunkt. Störungen sind Spielsimulationen, keine Echtzeitmeldungen.',status:'LAGEPUNKT'};}
 return currentSelection(null);
};
function position(cityName){const c=CITY_BY_NAME[cityName];return c?`${c.x},${c.y}`:'';}
function cityXY(name){return CITY_BY_NAME[name]||{x:260,y:290};}
function routePath(r){return r.cities.map((c,i)=>`${i?'L':'M'}${position(c)}`).join('');}
function routeIcon(r){let center=ROUTE_INCIDENT_CENTERS[r.id];const p=cityXY(center);return {x:p.x,y:p.y};}
function pill(id){const m=metric(id),v=game.metrics[id];return html.div({class:`res res-${tone(v)}`,title:m.detail},
 html.div({class:'res-head'},html.span(m.label),html.strong(unit(v))),
 html.div({class:'mini-track'},html.i({style:`width:${v}%`})));
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
 const showRoad=state.layer==='alle'||state.layer==='verkehr';
 const showNodes=state.layer==='alle'||state.layer==='versorgung'||state.layer==='einsatz';
 const showCities=state.layer==='alle'||state.layer==='verkehr';
 const showFire=state.layer==='alle'||state.layer==='einsatz';
 const select=(kind,id)=>{state.inspect={kind,id};};
 const stormCenter=cityXY(game.stormZone);
 const highlighted=state.inspect?.kind==='route'?state.inspect.id:null;
 const countries=STATES.map((s,i)=>html.path({class:'state-area',d:s.d,fill:game.storm>18&&(['DE-HE','DE-ST','DE-NW','DE-BY'].includes(s.id))?'#244653':`hsl(${196-(STATE_RISK[s.id]||3)*3} 24% ${19+(i%4)*1.4}%)`,'data-state':s.id,role:'button',tabindex:'0',click:()=>select('state',s.id),keydown:e=>{if(e.key==='Enter')select('state',s.id);}},html.title(s.name)));
 return html.div({class:'map-stage'},
 html.svg({viewBox:'0 0 490 620',class:`germany-map layer-${state.layer}`,role:'img','aria-label':'Geografisch verortete Deutschlandkarte mit Bundesländern, Autobahnen, Rhein, Städten und Krisenstandorten'},
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
   showFire&&game.fires>15?html.circle({cx:170,cy:530,r:6,fill:'#f7a05e',class:'fire-pulse'}):null,
   html.text({x:16,y:26,class:'map-coord'},'DEUTSCHLAND // 16 LÄNDER'),
   html.text({x:16,y:603,class:'map-coord'},'KORRIDORE GEOGRAFISCH VEREINFACHT · MODELLWERTE')
 ),
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
function actionRow(a,refresh){const reason=available(game,a),can=!reason;const color=a.funds?'gain':'cost';return html.button({class:`action-row ${can?'':'locked'}`,type:'button',disabled:!can,click:()=>{if(takeAction(game,a.id))refresh();},title:reason||a.desc},
 html.span({class:'action-left'},html.strong(a.name),html.small(a.desc)),
 html.span({class:'action-right'},html.strong({class:color},a.funds?`+${money(a.funds)}`:money(a.cost)),html.small(reason||a.impact)),
 );}
function eventOverlay(e,refresh){return html.div({class:'modal-backdrop'},html.div({class:'event-modal',role:'dialog','aria-modal':'true','aria-label':e.title},
 html.div({class:'incident-line'},html.span({class:'blink'}),'EILMELDUNG',html.span(e.category)),
 html.h2(e.title),html.p(e.text),
 html.div({class:'event-choices'},...e.choices.map((c,i)=>html.button({class:'choice',type:'button',disabled:game.budget<c.cost,click:()=>{if(chooseEvent(game,i))refresh();}},
  html.div({class:'choice-title'},html.strong(c.name),html.span(c.cost?money(c.cost):'0 €')),
  html.p(c.text),html.small([...Object.entries(c.effect||{}).map(([k,v])=>`${metric(k).label}: ${arrow(v)}`),...(c.flood?[`Überflutung ${arrow(c.flood)}`]:[]),...(c.fires?[`Brandfront ${arrow(c.fires)}`]:[])].join(' · '))))),
 html.small('Sofortentscheidung: Sie kostet keinen regulären Beschluss, verbraucht aber das verfügbare Budget.')));}
function gameOverlay(refresh){const g=grade(game);return html.div({class:'modal-backdrop'},html.div({class:'result-modal',role:'dialog','aria-modal':'true'},
 html.div({class:'eyebrow'},game.outcome==='win'?'LAGE STABILISIERT':'KRISENMANAGEMENT GESCHEITERT'),
 html.h2(game.outcome==='win'?'Deutschland hält durch.':'Die Krise überfordert das System.'),html.p(game.endedReason),
 html.div({class:'score'},html.strong(`${g.score}/100`),html.span(`${g.rank} · Ø ${g.avg} % Versorgung`)),
 html.p(`Nach ${game.day} Tagen, ${game.actionCount} Beschlüssen und ${money(game.debt)} Notkredit. Restbudget: ${money(game.budget)}.`),
 html.div({class:'buttons'},html.button({class:'primary',click:()=>{game=createGame(game.seed+1);refresh();}},'Neue Krise spielen'),html.button({class:'outline',click:()=>{game=createGame(game.seed);refresh();}},'Dieselbe Krise erneut')),html.small('Fiktives Planspiel, keine amtliche Lagebeurteilung.')));}
function helpOverlay(state){return html.div({class:'modal-backdrop'},html.div({class:'help-modal',role:'dialog','aria-modal':'true'},
 html.div({class:'eyebrow'},'SO FUNKTIONIERT ES'),html.h2('18 Tage. Begrenzte Eingriffe.'),
 html.p('Du kontrollierst die Krisenlage anhand geografisch verorteter Korridore, symbolischer Standorte und bundesweiter Versorgungsscores. Klicke Routen oder Netzknoten, um ihren Zustand zu prüfen.'),
 html.p('Die Simulationskasse beginnt bei 24 Mrd. €, nimmt täglich 5 Mrd. € ein, verliert aber Unterhalts- und Zinszahlungen. Diese Größenordnungen sind bewusst abstrahiert und keine realen Bundeshaushaltsdaten.'),
 html.p('Zwei Beschlüsse maximal pro Tag. Nichts tun ist erlaubt und oft richtig. Starkregen kann bei Dürre Sturzfluten auslösen: weniger Waldbrandgefahr, dafür überflutete Straßen, belastete Trinkwasserwerke und Katastrophenschutz.'),
 html.p('Autobahnlinien sind vereinfachte Korridore über echte Städte. Verkehrsfarben und Gefahrenlagen stammen allein aus dem Spielmodell, nicht aus Live-Daten.'),
 html.button({class:'primary',click:()=>{state.help=false;}},'Zurück zum Krisenstab')));}
function topStat(label,value,detail,extra=''){return html.div({class:`top-stat ${extra}`},html.span(label),html.strong(value),detail?html.small(detail):null);}
function systemCard(){return html.div({class:'situation-rail'},
 html.div({class:'rail-title'},html.span('NETZ- & EINSATZSTATUS'),html.span('MODELL')), ...METRICS.map(m=>pill(m.id)),
 html.div({class:'risk-summary'},
 html.div(html.span('BRANDFRONT'),html.strong(`${Math.round(game.fires)}/100`)),
 html.div(html.span('ÜBERFLUTUNG'),html.strong(`${Math.round(game.flood)}/100`))));}
function dispatchLog(s){return html.div({class:`alert-row log-${s.kind}`},html.span(`T${s.day}`),html.div(html.strong(s.title),html.small(s.body)));}

pfusch('crisis-game',{version:0,tab:'alle',layer:'alle',inspect:null,help:false},state=>{
 const refresh=()=>{state.version++;};
 const cash=finance(game);
 const selected=currentSelection(state.inspect);
 const options=ACTIONS.filter(a=>state.tab==='alle'||a.group===state.tab);
 return [
  html.div({class:'app'},
   html.header({class:'topbar'},
    html.div({class:'brand'},html.span({class:'brand-mark'},'D/26'),html.div(html.strong('DÜRREKRISE'),html.small('KRISENSTAB · DEUTSCHLAND'))),
    html.div({class:'top-stats'},
     topStat('TAG',`${game.day} / ${DAYS}`,null,'day-stat'),
     topStat('TAGESMAX.',`${fmt(game.temp)} °C`,'Hitze'),
     topStat('VERFÜGBARES BUDGET',money(game.budget),forecast(),'budget-stat'),
     topStat('BESCHLÜSSE',`${game.actionsToday} / ${MAX_ACTIONS}`,`${game.ops} verfügbar`),
     topStat('BRAND / STURZFLUT',`${Math.round(game.fires)} / ${Math.round(game.flood)}`,'Index 0–100')),
    html.div({class:'top-links'},html.button({class:'text-button',click:()=>{state.help=!state.help;}},'REGELN'),html.button({class:'text-button',click:()=>{game=createGame(game.seed+1);state.inspect=null;refresh();}},'NEUSTART'))),
   html.main({class:'dashboard'},
    html.section({class:'map-panel panel'},
     html.div({class:'panel-head'},html.div(html.span({class:'eyebrow'},'STRATEGISCHES LAGEBILD'),html.h1('Deutschland · Infrastruktur')),html.div({class:'layer-tabs'},...LAYERS.map(([id,label])=>html.button({type:'button',class:`layer-tab ${state.layer===id?'selected':''}`,click:()=>{state.layer=id;}},label)))),
     html.div({class:'map-body'},mapView(state),systemCard()),
     html.div({class:'map-foot'},html.span('SIMULATION · KEINE ECHTZEITDATEN'),html.span('Bundesländer nach GeoJSON · Korridore schematisch'))),
    html.section({class:'decision-panel panel'},
     html.div({class:'panel-head'},html.div(html.span({class:'eyebrow'},'FÜHRUNGSSTAB'),html.h2('Maßnahmen')),html.span({class:'decisions-badge'},`${game.actionsToday}/${MAX_ACTIONS} BESCHLOSSEN`)),
     html.div({class:'filters'},...TABS.map(([id,label])=>html.button({type:'button',class:`tab ${state.tab===id?'selected':''}`,click:()=>{state.tab=id;}},label))),
     html.div({class:'action-list'},...options.map(a=>actionRow(a,refresh))),
     html.div({class:'decision-footer'},
      html.div(html.strong('Lage fortschreiben'),html.small(`Täglich ${money(cash.income)} Einnahmen · ${money(cash.upkeep+cash.debtService)} laufende Kosten`)),
      html.button({type:'button',class:'advance primary',disabled:game.over||!!game.pending,click:()=>{if(advance(game))refresh();}},`TAG ${Math.min(DAYS,game.day+1)} →`)),
     html.div({class:'alerts'},html.div({class:'alerts-label'},html.span('LETZTE MELDUNGEN'),html.span(`${game.log.length} IM PROTOKOLL`)),...game.log.slice(0,2).map(dispatchLog))
    )),
   html.footer({class:'footer'},html.span('DÜRREKRISE ’26 · EIN FIKTIVES PLANSPIEL'),html.span('Geometrie: isellsoap/deutschlandGeoJSON · ',html.a({href:'https://github.com/MatthiasKainer/pfusch',target:'_blank',rel:'noopener noreferrer'},'mit pfusch')))
  ),
  state.help?helpOverlay(state):null,
  game.pending&&!game.over?eventOverlay(game.pending,refresh):null,
  game.over?gameOverlay(refresh):null
 ];
});
