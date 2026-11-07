// DURREKRISE '26: a deterministic, fictional crisis-management model, not a forecast.
export const DAYS = 18;
export const MAX_ACTIONS = 2;
export const START_BUDGET = 24;
export const DAILY_INCOME = 5;
export const METRICS = [
  { id:'water', label:'Trinkwasser', unit:'Versorgungssicherheit', icon:'\u25c8', detail:'Aufbereitung, Netze und Trinkwasserreserven. Auch die Feuerwehr braucht Wasser.' },
  { id:'river', label:'Rhein / Transportwasser', unit:'Schiffbarkeitsindex', icon:'\u224b', detail:'Niedrigwasser erschwert Schiffstransport und Kraftwerksk\u00fchlung.' },
  { id:'power', label:'Energie', unit:'Netzstabilit\u00e4t', icon:'\u03df', detail:'Hitze und niedrige Flusspegel belasten Kraftwerke, Wasserwerke und K\u00fchlketten.' },
  { id:'roads', label:'Autobahnen', unit:'Verf\u00fcgbarkeit', icon:'\u2301', detail:'Blow-ups, Sperrungen und Br\u00e4nde unterbrechen den Verkehr.' },
  { id:'logistics', label:'Logistik', unit:'Lieferf\u00e4higkeit', icon:'\u279c', detail:'Stra\u00dfe, Bahn und Rhein sind nicht beliebig austauschbar.' },
  { id:'health', label:'Gesundheit', unit:'Freie Klinikreserve', icon:'+', detail:'Hitzenotf\u00e4lle, Rauch und knappe Rettungsdienste belasten das Gesundheitssystem.' },
  { id:'food', label:'Lebensmittel', unit:'Versorgungsindex', icon:'\u25c7', detail:'Ernteausfall, gest\u00f6rte Lieferketten und Preisdruck.' },
  { id:'fire', label:'Feuerwehr & KatS', unit:'Einsatzreserve', icon:'\u25b2', detail:'L\u00f6schz\u00fcge, freiwillige Feuerwehr, Hilfsorganisationen und Katastrophenschutz. Beanspruchte Kr\u00e4fte erholen sich nur langsam.' },
  { id:'trust', label:'Gesellschaft', unit:'Vertrauen', icon:'\u25ce', detail:'Akzeptanz, Informationslage und Belastbarkeit der Bev\u00f6lkerung.' },
];
const INITIAL = { water:74,river:45,power:82,roads:84,logistics:80,health:82,food:83,fire:77,trust:75 };
// Numbers represent simplified billions of euros of discretionary crisis funding, not actual budget estimates.
export const ACTIONS = [
 { id:'leaks', group:'wasser', name:'Wasserwerke abdichten',desc:'Einmal investieren, f\u00fcnf Tage geringere Leitungsverluste. Bindet Wartungspersonal.', cost:12,cooldown:6,effect:{water:3,roads:-2},policy:['leaks',5],upkeep:1,upkeepDays:5,impact:'Wasser +3 und t\u00e4glich Entlastung; Stra\u00dfen \u22122; 5 Tage Unterhalt' },
 { id:'trucks',group:'wasser',name:'Trinkwasser-Konvois',desc:'Schnelle Hilfe auf Kosten knapper Lkw und Diesel.',cost:9,cooldown:3,effect:{water:10,logistics:-5},impact:'Wasser +10; Logistik \u22125' },
 { id:'ration',group:'wasser',name:'Wasser rationieren',desc:'Vier Tage Verbrauch senken. Wenig Geld, viel politischer Schaden.',cost:2,cooldown:5,effect:{trust:-8,food:-2},policy:['ration',4],impact:'Wasserverbrauch \u2193; Vertrauen \u22128, Nahrung \u22122' },
 { id:'river',group:'wasser',name:'Wasserentnahmen begrenzen',desc:'Industrieproduktion reduzieren, damit weniger Flusswasser verbraucht wird.',cost:3,cooldown:5,effect:{power:-5,logistics:-2,trust:-2},policy:['river',4],impact:'Rhein stabilisiert; Strom \u22125, Logistik \u22122, Vertrauen \u22122' },
 { id:'generator',group:'infrastruktur',name:'Notstrom & K\u00fchlketten',desc:'Dieselaggregate entlasten das Netz, ben\u00f6tigen aber Wasser, Logistik und Wartung.',cost:13,cooldown:5,effect:{power:10,water:-4,logistics:-2},policy:['grid',4],upkeep:2,upkeepDays:4,impact:'Strom +10; Wasser \u22124, Logistik \u22122; laufende Kosten' },
 { id:'load',group:'infrastruktur',name:'Planbare Stromabschaltungen',desc:'Netz vor Blackout sch\u00fctzen, Betriebe und Bev\u00f6lkerung belasten.',cost:1,cooldown:4,effect:{power:5,trust:-7,food:-2},policy:['load',3],impact:'Strom +5 und Entlastung; Vertrauen \u22127, Nahrung \u22122' },
 { id:'asphalt',group:'infrastruktur',name:'Autobahnen notsanieren',desc:'Sperrungen beseitigen. Reparaturtrupps fehlen dann andernorts.',cost:12,cooldown:4,effect:{roads:14,logistics:2,fire:-4},impact:'Stra\u00dfen +14, Logistik +2; Einsatzreserve \u22124' },
 { id:'rail',group:'infrastruktur',name:'Schiene priorisieren',desc:'Fracht vom Rhein auf die Bahn verlagern. Das kostet Strom und Slots.',cost:12,cooldown:5,effect:{logistics:13,food:2,power:-5},policy:['rail',4],upkeep:1.5,upkeepDays:4,impact:'Logistik +13; Strom \u22125; 4 Tage Unterhalt' },
 { id:'clinics',group:'gesellschaft',name:'Mobile Notkliniken',desc:'Klinikreserven aufstocken, Rettungsdienst und Einsatzpersonal umverteilen.',cost:12,cooldown:5,effect:{health:13,fire:-6,logistics:-2},upkeep:2,upkeepDays:4,impact:'Gesundheit +13; Feuerwehr/KatS \u22126, Logistik \u22122; Unterhalt' },
 { id:'shelters',group:'gesellschaft',name:'Hitzeschutzr\u00e4ume',desc:'Dauerhafte Entlastung f\u00fcr vulnerable Gruppen, aber zus\u00e4tzlicher Strombedarf.',cost:9,cooldown:5,effect:{health:6,trust:2,power:-4},policy:['protect',5],upkeep:1.5,upkeepDays:5,impact:'Gesundheit +6; Strom \u22124; 5 Tage Unterhalt' },
 { id:'food',group:'versorgung',name:'Lebensmittel-Korridore',desc:'Priorit\u00e4t f\u00fcr Lebensmittel-Lkw statt andere Nottransporte.',cost:11,cooldown:4,effect:{food:13,logistics:-5,fire:-2},impact:'Lebensmittel +13; Logistik \u22125, Einsatzreserve \u22122' },
 { id:'message',group:'gesellschaft',name:'Lage offen kommunizieren',desc:'Schnell wirksam, doch ohne reale Hilfe sinkt Vertrauen erneut.',cost:4,cooldown:4,effect:{trust:8},impact:'Vertrauen +8; keine direkte Versorgung' },
 { id:'watch',group:'feuerwehr',name:'Waldbrand\u00fcberwachung',desc:'Fr\u00fche Erkennung, Luftaufkl\u00e4rung und Brandschutzberatung.',cost:8,cooldown:6,policy:['firewatch',5],fireRisk:-10,upkeep:1,upkeepDays:5,impact:'Brandgefahr \u221210 und 5 Tage D\u00e4mpfung; laufende Kosten' },
 { id:'dispatch',group:'feuerwehr',name:'L\u00f6schz\u00fcge entsenden',desc:'Aktive Br\u00e4nde eind\u00e4mmen, verbraucht L\u00f6schwasser und ersch\u00f6pft Kr\u00e4fte.',cost:6,cooldown:2,minFires:4,effect:{fire:-10,water:-5,roads:-2},fires:-19,policy:['fireline',2],impact:'Brandfront \u221219; Feuerwehr \u221210, Wasser \u22125' },
 { id:'mutual',group:'feuerwehr',name:'\u00dcberregionale Einsatzhilfe',desc:'Kolonnen aus weniger belasteten Regionen. Bindet Notfall-Transportkapazit\u00e4t.',cost:12,cooldown:5,effect:{fire:19,logistics:-5,trust:1},policy:['mutual',4],upkeep:1.5,upkeepDays:4,impact:'Feuerwehr/KatS +19; Logistik \u22125; 4 Tage Unterhalt' },
 { id:'firebreak',group:'feuerwehr',name:'Brandschneisen & Sperrzonen',desc:'Brandfront bremsen, Siedlungen sch\u00fctzen; Stra\u00dfen und Versorgung verlieren Kapazit\u00e4t.',cost:5,cooldown:4,minFires:8,effect:{roads:-5,logistics:-3,trust:-2},fires:-12,fireRisk:-4,impact:'Brandfront \u221212; Stra\u00dfen \u22125, Logistik \u22123' },
 { id:'pumps',group:'feuerwehr',name:'Mobile Hochwasserpumpen',desc:'Überflutete Unterführungen entwässern. Bindet Feuerwehr, Diesel und Strom.',cost:8,cooldown:3,minFlood:7,effect:{fire:-7,power:-2,roads:3},flood:-17,impact:'Überflutung −17; Feuerwehr −7; Strom −2; Straßen +3' },
 { id:'drain',group:'infrastruktur',name:'Verkehrswege freipumpen',desc:'Brücken, Unterführungen und Zufahrten räumen. Kostet Einsatzkräfte.',cost:10,cooldown:4,minFlood:12,effect:{roads:8,logistics:4,fire:-4},flood:-12,impact:'Überflutung −12; Straßen +8; Logistik +4; Feuerwehr −4' },
 { id:'credit',group:'finanzen',name:'Notkredit beschlie\u00dfen',desc:'Nur einmal m\u00f6glich. Heute fl\u00fcssig, bis Krisenende Zinslast und Vertrauensverlust.',cost:0,cooldown:30,limit:1,effect:{trust:-10},funds:24,impact:'Fonds +24 Mrd. €; Vertrauen \u221210; 1,5 Mrd. € pro Tag Zinsen' },
];
export const EVENTS = {
 5:{title:'Starkregenfront über Rhein-Main',category:'STARKREGEN',text:'Auf ausgetrocknetem Boden fließt Wasser oberflächlich ab. Unterführungen laufen voll; Stromstationen und Notwasserstellen sind bedroht.',impact:{water:-3,power:-1,roads:-4,logistics:-3,fire:-4},flood:19,storm:80,stormZone:'Frankfurt',routes:[{id:'A3',penalty:24,days:4},{id:'A5',penalty:13,days:3}],choices:[
  {name:'Pumpen und Sandsäcke bündeln',text:'Begrenzt die Flut, schwächt aber den übrigen Feuerwehr- und Katastrophenschutz.',cost:10,effect:{roads:4,water:2,fire:-7},flood:-18},
  {name:'Unterführungen sperren',text:'Geringere Unfallgefahr. Überflutungen bleiben, Lieferketten leiden.',cost:0,effect:{roads:3,logistics:-4,trust:-2},flood:-5}
 ]},
 11:{title:'Gewitterlinie über Norddeutschland',category:'STARKREGEN',text:'Sturzfluten setzen Knotenpunkte an A2 und A24 unter Wasser. Die Feuerwehr ist zugleich mit Vegetationsbränden beschäftigt.',impact:{roads:-4,logistics:-4,fire:-4,power:-1,water:-2},flood:20,storm:92,stormZone:'Magdeburg',routes:[{id:'A2',penalty:26,days:4},{id:'A24',penalty:19,days:4}],choices:[
  {name:'KatS in den Norden verlegen',text:'Öffnet Wege schneller, entzieht anderen Regionen Einsatzkräfte.',cost:11,effect:{roads:8,logistics:4,fire:-8},flood:-19},
  {name:'Umleitungen & Evakuierungen',text:'Kostet wenig Geld, aber blockiert Warenströme und Unterkünfte.',cost:0,effect:{health:2,logistics:-4,trust:-3},flood:-7}
 ]},
 16:{title:'Sturzflut auf den südlichen Autobahnen',category:'STARKREGEN',text:'Starkregen nach extremer Hitze: Rampen und Unterführungen werden überflutet. Löschkräfte müssen technische Hilfe leisten.',impact:{roads:-3,logistics:-3,power:-1,fire:-3},flood:16,storm:70,stormZone:'Ulm',routes:[{id:'A8',penalty:25,days:3},{id:'A7',penalty:15,days:3}],choices:[
  {name:'Notinstandsetzung starten',text:'Schützt Transportkorridore, verschlingt die letzten Haushaltsreserven.',cost:9,effect:{roads:7,logistics:4,fire:-5},flood:-13},
  {name:'Regionale Sperrungen anordnen',text:'Risiko für Verkehrsteilnehmer sinkt, Logistik bleibt fragil.',cost:0,effect:{roads:2,logistics:-3,trust:-2},flood:-5}
 ]},
 3:{title:'A7: Betonplatten w\u00f6lben sich auf',category:'AUTOBAHNEN',text:'Blow-ups bremsen den G\u00fcterverkehr. Reparaturkolonnen k\u00f6nnten stattdessen Wasseranlagen sichern.',impact:{roads:-9,logistics:-3},choices:[
  {name:'Sofort reparieren',text:'Teure Sofortma\u00dfnahme. Spezialkolonnen werden gebunden.',cost:11,effect:{roads:9,logistics:3,fire:-4}},
  {name:'Abschnitte sperren',text:'Sicherer, aber Umwege belasten Fracht und Pendler.',cost:0,effect:{roads:3,logistics:-7,trust:-2}}
 ]},
 4:{title:'B\u00f6schungsbrand an der A5',category:'FEUERWEHR',text:'Mehrere Vegetationsbr\u00e4nde gleichzeitig. Wasserfahrzeuge und L\u00f6schz\u00fcge werden knapp.',impact:{fire:-6,roads:-4},fires:13,fireRisk:5,choices:[
  {name:'Luft- und Bodenhilfe b\u00fcndeln',text:'Brandfront schrumpft, doch Wasser und Personal leiden.',cost:8,effect:{water:-4,fire:-3,roads:3},fires:-12},
  {name:'Sperrzonen einrichten',text:'Bev\u00f6lkerung sch\u00fctzen, Verkehr ausweichen lassen.',cost:0,effect:{logistics:-5,trust:-3},fires:-5}
 ]},
 6:{title:'Rhein: Frachter fahren mit halber Ladung',category:'TRANSPORTWASSER',text:'Transportkette und Kraftwerksversorgung stehen unter Druck.',impact:{logistics:-9,food:-3},choices:[
  {name:'Schienenkorridor anmieten',text:'Schont die Regale, aber belastet den Strommarkt.',cost:10,effect:{logistics:10,food:3,power:-3}},
  {name:'Industrieg\u00fcter vorziehen',text:'Frachtraum f\u00fcr Kraftwerke, weniger f\u00fcr Lebensmittel.',cost:0,effect:{power:5,food:-6,trust:-3}}
 ]},
 8:{title:'Notaufnahmen sind \u00fcberf\u00fcllt',category:'GESUNDHEIT',text:'Hitzekranke, Rauchbelastung und ersch\u00f6pftes Personal treffen aufeinander.',impact:{health:-10},choices:[
  {name:'Mobile Hilfsteams entsenden',text:'Hilft Kliniken, reduziert die Katastrophenschutz-Reserve.',cost:10,effect:{health:11,fire:-7}},
  {name:'Planbare Eingriffe verschieben',text:'Sofortige Entlastung, aber Vertrauensverlust.',cost:0,effect:{health:6,trust:-6}}
 ]},
 10:{title:'Ger\u00fccht: Trinkwasser sei vergiftet',category:'INFORMATION',text:'Hamsterk\u00e4ufe und Panik besch\u00e4digen den Versorgungstakt.',impact:{trust:-9,food:-2},choices:[
  {name:'Messungen & Pressebriefing',text:'Zeitnahe Daten helfen, kosten aber Geld.',cost:5,effect:{trust:11}},
  {name:'Nur Warnlage best\u00e4tigen',text:'Spart heute, kostet Vertrauen.',cost:0,effect:{trust:-5}}
 ]},
 12:{title:'Kraftwerke melden K\u00fchlprobleme',category:'ENERGIE',text:'Niedrigwasser und Klimatisierung treiben den Strombedarf. Kliniken melden erste Lastwarnungen.',impact:{power:-11},choices:[
  {name:'Notstrom vernetzen',text:'Sichert Kliniken, bindet Diesel und Logistikkapazit\u00e4t.',cost:12,effect:{power:11,logistics:-3,water:-2}},
  {name:'Industrie drosseln',text:'Netz kurzfristig stabil, weniger Waren und Vertrauen.',cost:0,effect:{power:7,logistics:-5,trust:-4}}
 ]},
 14:{title:'Ernteausf\u00e4lle treiben Preise',category:'ERN\u00c4HRUNG',text:'Regionaler Getreidemangel und teure Umwege entleeren Versorgungspuffer.',impact:{food:-12,trust:-3},choices:[
  {name:'Lebensmittelimporte priorisieren',text:'Versorgung auf Kosten anderer Frachten.',cost:11,effect:{food:12,logistics:-4}},
  {name:'Preisspitzen abfedern',text:'Sozialer Frieden ohne zus\u00e4tzliche Ware.',cost:0,effect:{food:2,trust:6}}
 ]},
 15:{title:'Gro\u00dfbrand im S\u00fcdwesten',category:'WALDBRAND',text:'Feuerfronten bedrohen Ortsteile und Umspannwerke; die L\u00f6schwasserversorgung wird eng.',impact:{fire:-10,health:-6,roads:-5,water:-3},fires:21,fireRisk:7,choices:[
  {name:'\u00dcberregionale L\u00f6schhilfe',text:'Verringert die Front, aber braucht Wasser und Notfalllogistik.',cost:12,effect:{fire:9,water:-5,logistics:-3,health:2},fires:-19},
  {name:'Ortschaften evakuieren',text:'Menschenleben sch\u00fctzen, Feuer brennt weiter.',cost:0,effect:{health:5,logistics:-6,trust:-3},fires:-4}
 ]},
 17:{title:'Wasserwerk f\u00e4llt in den Notbetrieb',category:'KRITIS',text:'\u00dcberhitzte Steuerungstechnik drosselt mehrere Wasserwerke.',impact:{water:-8,trust:-2},choices:[
  {name:'Manuell und mobil \u00fcberbr\u00fccken',text:'Spezialisten und Transportfahrzeuge werden gebunden.',cost:9,effect:{water:9,logistics:-2}},
  {name:'Wasserabgabe einschr\u00e4nken',text:'Zwangsreduktion rettet Reste der Reserve.',cost:0,effect:{water:4,trust:-6}}
 ]}
};
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*10)/10;
function rand(s) { let x=s.rng>>>0; x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296; }
function temperature(s) {return round(38.5 + 2.8*Math.sin((s.day+1)*.76)+2.5*rand(s));}
function log(s,title,body,kind='info') {s.log.unshift({day:s.day,title,body,kind});s.log.length=Math.min(36,s.log.length);}
function record(s) {s.history.push({day:s.day,heat:s.temp,budget:round(s.budget),fires:round(s.fires),fireRisk:round(s.fireRisk),flood:round(s.flood),...s.metrics});}
function syncToday(s) {const last=s.history.at(-1); if(last?.day===s.day) Object.assign(last,{budget:round(s.budget),fires:round(s.fires),fireRisk:round(s.fireRisk),flood:round(s.flood),...s.metrics});}
export function createGame(seed=20261107){
 const s={seed,rng:(seed>>>0)||1,day:1,temp:40,budget:START_BUDGET,debt:0,ops:MAX_ACTIONS,actionsToday:0,
 metrics:{...INITIAL},fires:0,fireRisk:44,flood:0,storm:0,stormZone:'',routeIncidents:{},policy:{},upkeep:[],lastUsed:{},used:{},log:[],history:[],pending:null,
 over:false,outcome:null,criticalDays:0,endedReason:'',actionCount:0,shortfallDays:0};
 s.temp=temperature(s);log(s,'Krisenstab \u00fcbernimmt','24 Mrd. € frei verfügbar, 5 Mrd. € je neuem Tag (vereinfachtes Modell). G\u00fcnstige Entscheidungen haben oft harte Nebenwirkungen. Reserven sind wichtig.');record(s);return s;
}
export function finance(s){
 const upkeep=round(s.upkeep.reduce((sum,item)=>sum+item.amount,0));
 const debtService=s.debt?1.5:0;
 return {income:DAILY_INCOME,upkeep,debtService,net:round(DAILY_INCOME-upkeep-debtService)};
}
export function applyEffects(s,effects={}){for(const [k,v] of Object.entries(effects))if(k in s.metrics)s.metrics[k]=round(clamp(s.metrics[k]+v));}
function special(s,x){
 if(x.policy) s.policy[x.policy[0]]=Math.max(s.policy[x.policy[0]]||0,x.policy[1]);
 if(x.fireRisk) s.fireRisk=round(clamp(s.fireRisk+x.fireRisk));
 if(x.fires) s.fires=round(clamp(s.fires+x.fires));
 if(x.flood){
  s.flood=round(clamp(s.flood+x.flood));
  // Heavy rainfall can lower wildfire risk, even as run-off floods roads and basements.
  if(x.flood>0){s.fireRisk=round(clamp(s.fireRisk-x.flood*.44));s.fires=round(clamp(s.fires-x.flood*.12));}
 }
 if(x.storm) {s.storm=round(clamp(x.storm));s.stormZone=x.stormZone||s.stormZone;}
 if(x.routes) for(const r of x.routes) s.routeIncidents[r.id]={penalty:r.penalty,days:r.days,reason:x.title||'Verkehrsstörung'};
 if(x.upkeep) s.upkeep.push({id:x.id||'krisenlage',amount:x.upkeep,days:x.upkeepDays||3});
}
export function available(s,a){
 if(!a)return 'Unbekannte Ma\u00dfnahme';
 if(s.over)return 'Krisenlage abgeschlossen';
 if(s.pending)return 'Zuerst die Lageentscheidung treffen';
 if(s.ops<=0)return 'Heute keine Beschl\u00fcsse mehr';
 if(s.budget<a.cost)return `Es fehlen ${round(a.cost-s.budget)} Mrd. €`;
 if((s.used[a.id]||0)>=(a.limit??Infinity))return 'Bereits ausgesch\u00f6pft';
 if(s.lastUsed[a.id]&&s.day-s.lastUsed[a.id]<a.cooldown)return `Noch ${a.cooldown-(s.day-s.lastUsed[a.id])} Tag(e) gesperrt`;
 if(a.minFires&&s.fires<a.minFires)return 'Keine ausreichend gro\u00dfe Brandfront';
 return '';
}
export function takeAction(s,id){
 const a=ACTIONS.find(x=>x.id===id);
 if(!a||available(s,a))return false;
 s.budget=round(s.budget-a.cost+(a.funds||0));
 if(a.funds)s.debt+=a.funds;
 applyEffects(s,a.effect);special(s,a);
 s.lastUsed[a.id]=s.day;s.used[a.id]=(s.used[a.id]||0)+1;
 s.ops--;s.actionsToday++;s.actionCount++;
 log(s,a.name,a.impact,'action');syncToday(s);return true;
}
export function chooseEvent(s,index){
 if(!s.pending||s.over)return false;
 const x=s.pending.choices[index];if(!x||s.budget<x.cost)return false;
 s.budget=round(s.budget-x.cost);applyEffects(s,x.effect);special(s,x);
 log(s,`Lageentscheidung: ${x.name}`,x.text,'decision');s.pending=null;syncToday(s);return true;
}
function pressure(s,didAct){
 const m=s.metrics,p=s.policy,hot=Math.max(0,s.temp-39),low=(k,t=55)=>Math.max(0,(t-m[k])/25);
 const d={
 water:-1.45-.19*hot-.38*low('power')-.005*s.flood+(p.ration?2.0:0)+(p.leaks?1.35:0),
 river:-1.0-.16*hot+(p.river?0.9:0),
 power:-1.2-.21*hot-.68*low('river',52)-.018*s.fires+(p.grid?1.6:0)+(p.load?1.4:0),
 roads:-.75-.22*Math.max(0,s.temp-41)-.045*s.fires-.018*s.flood,
 logistics:+.30-.25*low('river',55)-.25*low('roads')-.12*low('power')-.01*s.flood+(p.rail?1.1:0),
 health:-1.1-.22*hot-.65*low('water')-.45*low('power')-.075*s.fires+(p.protect?1.35:0),
 food:-1.0-.65*low('logistics')-.3*low('water'),
 fire:-.55-.17*hot-.14*s.fires-.015*s.flood+(s.fires<6?1.6:0)+(p.mutual?1.75:0),
 trust:-.45-.38*low('water')-.48*low('food')-.25*low('power')-(p.ration?.32:0)-(p.load?.45:0)
 };
 for(const [key,delta]of Object.entries(d))m[key]=round(clamp(m[key]+delta));
 const rain=rand(s)<.11;
 s.fireRisk=round(clamp(s.fireRisk+1.55+.27*hot+.38*low('river',55)-(p.firewatch?2.4:0)-(rain?11:0)));
 const ignition=Math.max(0,(s.fireRisk-46)/8.2)+Math.max(0,(52-m.fire)/12)+rand(s)*1.2;
 const suppression=1.4+m.fire/28+(p.fireline?3.2:0)+(p.mutual?1:0);
 s.fires=round(clamp(s.fires+ignition-suppression));
 s.flood=round(clamp(s.flood-(s.storm?6:9)));
 s.storm=round(clamp(s.storm-32));
 for(const key of Object.keys(s.routeIncidents)) {if(--s.routeIncidents[key].days<=0)delete s.routeIncidents[key];}
 if(s.fires>12){m.roads=round(clamp(m.roads-.06*s.fires));m.health=round(clamp(m.health-.035*s.fires));}
 if(rain){m.river=round(clamp(m.river+2.4));m.water=round(clamp(m.water+1.2));log(s,'Gewitterzelle zieht durch','Lokal kurze Entlastung. Die D\u00fcrre ist damit nicht beendet.','weather');}
 const finances=finance(s),next=round(s.budget+finances.net);
 if(next<0){s.shortfallDays++;s.budget=0;applyEffects(s,{trust:-4,power:-2,fire:-2});log(s,'Krisenfonds \u00fcberzogen','Der laufende Betrieb bindet mehr Mittel als eingehen. Notbetrieb und Vertrauensverlust.','warning');}
 else s.budget=next;
 for(const k of Object.keys(p)) if(p[k]>0)p[k]--;
 s.upkeep=s.upkeep.filter(item=>--item.days>0);
 if(finances.net>=2.5&&!didAct)log(s,'Reserven geschont',`Keine neue Ausgabe. Krisenfonds ${finances.net>=0?'+':''}${finances.net.toFixed(1).replace('.',',')} Mrd. €, Spielraum f\u00fcr kommende Notlagen.`,'finance');
}
function assess(s){
 const m=s.metrics;
 const severe=['water','power','health','food','fire','trust'].filter(k=>m[k]<14);
 const collapsing=Object.values(m).filter(x=>x<24).length;
 s.criticalDays=collapsing>=3?s.criticalDays+1:0;
 if(severe.length||s.criticalDays>=2||s.fires>=88){s.over=true;s.outcome='loss';s.endedReason=severe.length?`Systemversagen: ${METRICS.find(x=>x.id===severe[0]).label}`:s.fires>=88?'Gro\u00dfbr\u00e4nde au\u00dfer Kontrolle':'Drei kritische Systeme \u00fcber mehrere Tage';}
 else if(s.day>=DAYS){
  s.over=true;
  const avg=Object.values(m).reduce((a,b)=>a+b,0)/METRICS.length;
  const vital=Math.min(m.water,m.power,m.health,m.food,m.fire,m.trust);
  const stabilized=avg>=49&&vital>=32&&m.logistics>=32.5&&s.fires<40&&s.flood<38;
  s.outcome=stabilized?'win':'loss';
  s.endedReason=stabilized?'Die Hitzephase ist \u00fcberstanden. Versorgung und Einsatzf\u00e4higkeit sind noch tragf\u00e4hig.':'Die Hitze endet, aber mindestens ein kritisches System bleibt instabil.';
 }
}
export function advance(s){
 if(s.over||s.pending||s.day>=DAYS)return false;
 const didAct=s.actionsToday>0;
 s.day++;s.ops=MAX_ACTIONS;s.temp=temperature(s);
 pressure(s,didAct);s.actionsToday=0;const e=EVENTS[s.day];
 if(e){applyEffects(s,e.impact);special(s,e);s.pending=e;log(s,e.title,e.text,'event');}
 else if(s.flood>=20){log(s,'Hochwasser-Einsätze dauern an',`Überflutung ${Math.round(s.flood)}/100. Pumpen und Feuerwehren bleiben gebunden.`,'warning');}
 else if(s.fires>=26){log(s,'Brandfronten wachsen',`Aktive Br\u00e4nde ${Math.round(s.fires)}/100. Wasser und Einsatzkr\u00e4fte reichen nicht mehr \u00fcberall.`,'warning');}
 else if(s.temp>=42){log(s,'Hitzewarnung',`Tagesmaximum ${s.temp.toFixed(1)} \u00b0C. Wasser, Netz und Kliniken unter Druck.`,'weather');}
 assess(s);record(s);return true;
}
export function grade(s){
 const vals=Object.values(s.metrics),avg=vals.reduce((a,b)=>a+b,0)/vals.length;
 const safety=Math.min(s.metrics.water,s.metrics.power,s.metrics.health,s.metrics.food,s.metrics.fire,s.metrics.trust);
 const score=Math.round(clamp(avg*.62+safety*.27+Math.min(18,s.budget)/4+(s.outcome==='win'?8:0)-s.debt*.15-s.shortfallDays*2-s.fires*.12-s.flood*.09));
 return {score,avg:Math.round(avg),safety:Math.round(safety),rank:score>=76?'Vorausschauend':score>=61?'Stabilisiert':score>=45?'Auf Kante':'Kritisch'};
}

// Statewide, intentionally simplified throughput estimate. The rendered lines follow major cities,
// not exact motorway geometry. Real-world live traffic data is NOT used.
export function routeCondition(s,id){
 const incident=s.routeIncidents[id];
 const isRiver=id==='RHEIN';
 let score=isRiver?s.metrics.river*.9+s.metrics.logistics*.1:s.metrics.roads*.78+s.metrics.logistics*.22;
 if(!isRiver){score-=s.flood*.10; if(id==='A5'||id==='A7')score-=s.fires*.085;}
 score=round(clamp(score-(incident?.penalty||0)));
 return {id,score,status:score<34?'Gesperrt':score<49?'Kritisch':score<68?'Eingeschränkt':'Befahrbar',tone:score<49?'danger':score<68?'warn':'ok',incident:incident?.reason||'',days:incident?.days||0};
}
