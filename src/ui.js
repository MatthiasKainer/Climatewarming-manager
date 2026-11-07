import { pfusch, html } from 'https://matthiaskainer.github.io/pfusch/pfusch.min.js';
import { DAYS, METRICS, ACTIONS, createGame, available, takeAction, chooseEvent, advance, grade } from './engine.js';

let game=createGame();
const fmt=n=>Math.round(n).toLocaleString('de-DE');
const euro=n=>`${fmt(n)} Mrd.`;
const pct=n=>`${fmt(n)} %`;
const tone=n=>n<31?'danger':n<54?'warn':'ok';
const sign=n=>n>0?`+${fmt(n)}`:fmt(n);
const metric=id=>METRICS.find(m=>m.id===id);
const iconText={wasser:'W',infrastruktur:'I',gesellschaft:'G',versorgung:'V',finanzen:'€'};
const TOP=['water','power','health','trust'];
const TABS=[['alle','Alle Bereiche'],['wasser','Wasser'],['infrastruktur','Infrastruktur'],['gesellschaft','Menschen'],['versorgung','Versorgung'],['finanzen','Finanzen']];
const regionList=[
  {name:'NORD',x:80,y:63,risk:1,description:'Küste & Kühlwasserversorgung'},
  {name:'OST',x:169,y:110,risk:4,description:'Landwirtschaft und Waldbrand'},
  {name:'WEST',x:42,y:145,risk:3,description:'Rhein, Industrie, Schifffahrt'},
  {name:'MITTE',x:117,y:178,risk:3,description:'Autobahnen & Logistik'},
  {name:'SÜDWEST',x:65,y:272,risk:5,description:'Waldbrand, Grundwasser, Strom'},
  {name:'SÜD',x:162,y:275,risk:4,description:'Städtehitze & Kliniken'}
];

function tinyChart(id) {
 const values=game.history.slice(-12).map(h=>h[id]), w=190,h=36;
 const points=values.map((v,i)=>`${(i/(Math.max(values.length-1,1))*w).toFixed(1)},${(h-(v/100*h)).toFixed(1)}`).join(' ');
 const color=game.metrics[id]<31?'#fb6e76':game.metrics[id]<54?'#efba72':'#6de1c6';
 return html.svg({viewBox:`0 0 ${w} ${h}`,class:'spark','aria-hidden':'true'},
  html.line({x1:0,y1:h*.5,x2:w,y2:h*.5,stroke:'#213643','stroke-dasharray':'4 4'}),
  html.polyline({points,fill:'none',stroke:color,'stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
}
function valueCard(id) {
 const m=metric(id),v=game.metrics[id],prev=game.history.at(-2)?.[id] ?? v,delta=v-prev;
 return html.div({class:`kpi kpi-${tone(v)}`},
  html.div({class:'kpi-head'},html.span({class:'kpi-title'},m.label),html.span({class:'level'},tone(v)==='danger'?'KRITISCH':tone(v)==='warn'?'ANGESPANNT':'STABIL')),
  html.div({class:'kpi-main'},html.strong(pct(v)),html.span({class:`delta ${delta<0?'fall':'rise'}`},`${sign(delta)} seit gestern`)),
  tinyChart(id),
  html.div({class:'track'},html.div({class:`fill ${tone(v)}`,style:`width:${v.toFixed(1)}%`})),
  html.small(m.unit));
}
function systemRow(id) {
 const m=metric(id),v=game.metrics[id];
 return html.div({class:'system-row',title:m.detail},
   html.div({class:'system-top'},html.span({class:'system-name'},html.span({class:'sys-glyph'},m.icon),m.label),html.strong(pct(v))),
   html.div({class:'track'},html.div({class:`fill ${tone(v)}`,style:`width:${v.toFixed(1)}%`})),
   html.small(m.detail));
}
function actionCard(a, update) {
  const reason=available(game,a), used=!!reason;
  return html.button({class:`action ${used?'inactive':''}`,type:'button',disabled:!!reason,click:()=>{if(takeAction(game,a.id))update();}, title:reason||a.desc},
    html.div({class:'action-heading'},html.span({class:'action-sigil'},iconText[a.group]),html.strong(a.name),html.span({class:'action-cost'},a.funds?`+${a.funds} Mrd.`:`−${a.cost} Mrd.`)),
    html.p(a.desc),
    html.div({class:'action-foot'},html.span(a.impact),html.span({class:'action-ready'},reason||'EINSETZEN')));
}
function heatMap() {
 const heat=Math.max(0,game.temp-38)/8;
 const colors=['#57949b','#dcad68','#ec8d51','#eb7149','#d84c42','#a83242'];
 const heatTone=(risk)=>colors[Math.min(5,Math.max(0,Math.round(risk + heat*1.4 -1)))];
 return html.svg({viewBox:'0 0 270 350',class:'germany-map',role:'img','aria-label':'Schematische Lagekarte Deutschland mit sechs Hitzeregionen'},
    html.defs(html.pattern({id:'map-grid',width:18,height:18,patternUnits:'userSpaceOnUse'},html.path({d:'M 18 0 L 0 0 0 18',fill:'none',stroke:'#1c3541','stroke-width':'.6'}))),
    html.rect({x:0,y:0,width:270,height:350,fill:'url(#map-grid)'}),
    html.path({d:'M120 22 L138 19 144 35 162 29 171 42 188 42 181 57 196 67 186 91 203 102 195 120 220 131 204 153 224 172 211 190 217 208 198 224 209 243 199 260 215 281 197 296 205 312 184 322 160 314 139 333 117 326 98 338 79 323 58 325 50 302 36 288 46 264 36 248 45 228 32 209 49 187 38 163 57 145 52 124 62 106 57 82 75 70 78 52 102 50 107 28 Z',fill:'#20313a',stroke:'#708d93','stroke-width':2,'stroke-linejoin':'round'}),
    ...[
     {d:'M83 47 L118 40 146 45 174 58 173 92 153 110 108 100 77 83 Z',n:0},
     {d:'M174 58 L195 89 191 118 218 141 202 171 165 167 153 110 173 92 Z',n:1},
     {d:'M77 83 L108 100 110 157 83 202 45 192 42 164 57 145 52 124 62 106 Z',n:2},
     {d:'M108 100 L153 110 165 167 189 198 156 234 110 213 83 202 110 157 Z',n:3},
     {d:'M83 202 L110 213 114 259 131 297 99 333 78 319 54 320 47 293 35 281 45 254 35 245 45 228 Z',n:4},
     {d:'M110 213 L156 234 189 198 209 246 199 262 214 283 198 297 203 310 181 320 157 312 138 330 131 297 114 259 Z',n:5},
    ].map(p=>html.path({d:p.d,fill:heatTone(regionList[p.n].risk),'fill-opacity':'.91',stroke:'#263a41','stroke-width':1.8,'stroke-linejoin':'round'})),
    ...regionList.map(r=>html.g(
      html.circle({cx:r.x+9,cy:r.y,r:12,fill:'#0a1a23','fill-opacity':'.78',stroke:'#c6d3cc','stroke-width':.7}),
      html.circle({cx:r.x+9,cy:r.y,r:3.2,fill:'#f6e2ba'}),
      html.text({x:r.x+9,y:r.y+25,'text-anchor':'middle',fill:'#f2eee3','font-size':9,'font-weight':700,'letter-spacing':1},r.name)
    ))
 );
}
function logRow(entry) {
 return html.div({class:`log-item log-${entry.kind}`},
  html.div({class:'log-date'},`TAG ${String(entry.day).padStart(2,'0')}`),
  html.div({class:'log-text'},html.strong(entry.title),html.p(entry.body)));
}
function eventPanel(e,update){
 return html.div({class:'modal-backdrop'},html.div({class:'event-modal',role:'dialog','aria-modal':'true','aria-label':e.title},
    html.div({class:'eyebrow event-alert'},'● EILMELDUNG  /  ',e.category),
    html.h2(e.title),html.p({class:'event-description'},e.text),
    html.div({class:'event-choices'},...e.choices.map((c,i)=>html.button({class:'choice',type:'button',disabled:game.budget<c.cost,click:()=>{if(chooseEvent(game,i))update();}},
      html.span({class:'choice-title'},html.strong(c.name),html.span(c.cost?`−${c.cost} Mrd.`:'0 Mrd.')),
      html.span(c.text),html.small(Object.entries(c.effect).map(([k,v])=>`${metric(k).label} ${v>0?'+':''}${v}`).join(' · '))))),
    html.small({class:'event-footnote'},'Diese Entscheidung verbraucht keinen Maßnahmen-Slot. Die Lage entwickelt sich danach weiter.')
  ));
}
function overlay(update){
 const g=grade(game);
 return html.div({class:'modal-backdrop'},html.div({class:'result-modal',role:'dialog','aria-modal':'true'},
  html.div({class:'eyebrow'},game.outcome==='win'?'LAGE STABILISIERT':'KRISENMANAGEMENT GESCHEITERT'),
  html.h2(game.outcome==='win'?'Deutschland hält durch.':'Die Krise überfordert das System.'),
  html.p(game.endedReason),
  html.div({class:'result-score'},html.strong(`${g.score}/100`),html.span(`${g.rank} · Ø ${g.avg} % Versorgung`)),
  html.p({class:'result-summary'},`Nach ${game.day} Tagen, ${game.actionCount} Maßnahmen und ${game.debt} Mrd. € zusätzlicher Kreditlinie.`),
  html.div({class:'buttons'},html.button({click:()=>{game=createGame(game.seed+1);update();},class:'primary'},'Neue Lage spielen'),html.button({click:()=>{game=createGame(game.seed);update();},class:'outline'},'Gleiche Lage erneut')),
  html.small('Modellwerte und Ereignisse sind fiktiv. Keine reale Katastrophenprognose.')
  ));
}

pfusch('crisis-game',{version:0,tab:'alle',help:false},state=>{
 const update=()=>{state.version++;};
 const readiness=game.pending?'LAGEENTSCHEIDUNG OFFEN':game.over?'ABSCHLUSS':game.ops===0?'TAGESKONTINGENT ERSCHÖPFT':'KRISENSTAB HANDLUNGSFÄHIG';
 const average=Object.values(game.metrics).reduce((a,b)=>a+b,0)/8;
 return [
  html.div({class:'app'},
   html.header({class:'topbar'},
    html.div({class:'brand'},html.span({class:'brand-mark'},'D/26'),html.div(html.strong('DÜRREKRISE'),html.small('KRISENSTAB DEUTSCHLAND'))),
    html.div({class:'top-status'},html.span({class:'led'}),readiness),
    html.div({class:'top-actions'},html.button({class:'text-button',click:()=>{state.help=!state.help;}},'SPIELREGELN'),html.button({class:'text-button',click:()=>{game=createGame(game.seed+1);update();}},'NEUSTART'))),
   html.section({class:'intro'},
    html.div(html.div({class:'eyebrow'},'LÜKEX-INSPIRIERT / SIMULATION / NICHT AMTLICH'),html.h1('18 Tage am Limit.'),html.p('Nach fünf Dürrejahren trifft eine extreme Hitzewelle auf Deutschlands kritische Infrastruktur. Jede Entscheidung zählt.')),
    html.div({class:'day-count'},html.span('LAGE · TAG'),html.strong(`${String(game.day).padStart(2,'0')} / ${DAYS}`),html.div({class:'days-progress'},html.span({style:`width:${100*game.day/DAYS}%`})) )),
   html.section({class:'ticker'},
    html.div(html.span({class:'ticker-label'},'TAGESMAXIMUM'),html.strong(`${game.temp.toFixed(1).replace('.',',')} °C`),html.small('Extremhitze')),
    html.div(html.span({class:'ticker-label'},'EINSATZBUDGET'),html.strong(euro(game.budget)),html.small('Modellwerte · kein Bundeshaushalt')),
    html.div(html.span({class:'ticker-label'},'MASSNAHMEN HEUTE'),html.strong(`${game.ops} / 3`),html.small('Pro Tag erneuert')),
    html.div(html.span({class:'ticker-label'},'SYSTEMSTABILITÄT'),html.strong(pct(average)),html.small('Durchschnitt aller Sektoren'))),
   html.section({class:'kpi-grid'},...TOP.map(valueCard)),
   html.div({class:'main-grid'},
    html.div({class:'left-stack'},
     html.section({class:'panel map-panel'},
      html.div({class:'panel-head'},html.div(html.div({class:'eyebrow'},'01 / LAGEBILD'),html.h2('Deutschland unter Hitze')),html.span({class:'chip'},'SCHEMATISCH')),
      html.div({class:'map-layout'},html.div({class:'map-holder'},heatMap()),html.div({class:'map-insights'},
        html.strong('Regionale Gefährdung'),html.p('Die Karte visualisiert Hotspots, keine echten Messstationen oder Ländergrenzen.'),
        ...regionList.map(r=>html.div({class:'region-row'},html.span({class:`region-dot level-${r.risk}`}),html.div(html.strong(r.name),html.small(r.description)))))),
      html.div({class:'panel-bottom'},html.span('GERINGERE BELASTUNG'),html.div({class:'heat-scale'},...['#57949b','#dcad68','#ec8d51','#eb7149','#d84c42','#a83242'].map(c=>html.i({style:`background:${c}`}))),html.span('AKUTE HITZE'))),
     html.section({class:'panel systems-panel'},
      html.div({class:'panel-head'},html.div(html.div({class:'eyebrow'},'02 / KRITIS'),html.h2('Versorgungsnetze')),html.span({class:'chip'},'LIVE · MODELL')),
      html.div({class:'systems-grid'},...['river','roads','logistics','food'].map(systemRow)))
    ),
    html.div({class:'right-stack'},
     html.section({class:'panel decision-panel'},
      html.div({class:'panel-head'},html.div(html.div({class:'eyebrow'},'03 / KRISENMANAGEMENT'),html.h2('Maßnahmen anordnen')),html.span({class:'ops-badge'},`${game.ops} FREI`)),
      html.p({class:'decision-copy'},'Maximal drei Maßnahmen täglich. Geld, Sperrfristen und Nebenwirkungen begrenzen deine Optionen.'),
      html.div({class:'tab-bar'},...TABS.map(([id,label])=>html.button({class:`tab ${state.tab===id?'selected':''}`,type:'button',click:()=>{state.tab=id;}},label))),
      html.div({class:'action-list'},...ACTIONS.filter(a=>state.tab==='alle'||a.group===state.tab).map(a=>actionCard(a,update))),
      html.div({class:'advance-wrap'},html.div(html.strong('Nächsten Tag simulieren'),html.small('Wasserstände, Temperatur und Kettenreaktionen entwickeln sich weiter.')),
       html.button({class:'primary advance',type:'button',disabled:game.over||!!game.pending,click:()=>{if(advance(game))update();}},`TAG ${Math.min(game.day+1,DAYS)}  →`))),
     html.section({class:'panel log-panel'},
       html.div({class:'panel-head'},html.div(html.div({class:'eyebrow'},'04 / LAGEPROTOKOLL'),html.h2('Meldungen')),html.span({class:'chip'},`${game.log.length} EINTRÄGE`)),
       html.div({class:'log-list'},...game.log.slice(0,7).map(logRow))))),
   html.footer({class:'footer'},html.span('DÜRREKRISE ’26 · EIN FIKTIVES SYSTEMRISIKO-SPIEL'),
     html.span('Inspiriert von der ',html.a({href:'https://www.tagesschau.de/inland/gesellschaft/hitze-duerre-ausnahmezustand-krisenmanagement-100.html',target:'_blank',rel:'noopener noreferrer'},'LÜKEX-Berichterstattung'),' · ',html.a({href:'https://github.com/MatthiasKainer/pfusch',target:'_blank',rel:'noopener noreferrer'},'gebaut mit pfusch')))
  ),
  state.help?html.div({class:'modal-backdrop'},html.div({class:'help-modal',role:'dialog','aria-modal':'true'},
   html.div({class:'eyebrow'},'KURZANLEITUNG'),html.h2('Die Lage ist ernst. Aber nicht aussichtslos.'),
   html.p('Du übernimmst 18 Tage lang die Leitung eines bundesweiten Krisenstabs. Wähle bis zu drei Maßnahmen pro Tag und entscheide bei Eilmeldungen.'),
   html.p('Wichtig: Energie und Kühlwasser, Logistik und Lebensmittel, Trinkwasser und Gesundheit beeinflussen sich gegenseitig. Einige Eingriffe sparen heute Ressourcen, kosten aber Vertrauen.'),
   html.p('Gewonnen ist die Lage nur, wenn Versorgung und gesellschaftliche Stabilität am Ende tragfähig sind. Geld ist ein vereinfachter Spielwert; das Modell ist keine Prognose.'),
   html.button({class:'primary',click:()=>{state.help=false;}},'Lage übernehmen'))):null,
  game.pending && !game.over?eventPanel(game.pending,update):null,
  game.over?overlay(update):null
 ];
});
