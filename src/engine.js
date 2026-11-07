// DÜRREKRISE '26 — fictional, transparent crisis simulation; not an official forecast.
export const DAYS = 18;
export const METRICS = [
  { id: 'water', label: 'Trinkwasser', unit: 'Versorgungssicherheit', icon: '◈', detail: 'Grundwasser, Aufbereitung, Netzverluste und Notversorgung.' },
  { id: 'river', label: 'Rhein / Transportwasser', unit: 'Schiffbarkeitsindex', icon: '≋', detail: 'Niedrigwasser schränkt die Binnenschifffahrt und Kraftwerkskühlung ein. Pegel sind nicht direkt kaufbar.' },
  { id: 'power', label: 'Energie', unit: 'Netzstabilität', icon: 'ϟ', detail: 'Spitzenlast und weniger Kühlwasser führen zu Drosselungen.' },
  { id: 'roads', label: 'Autobahnen', unit: 'Verfügbarkeit', icon: '⌁', detail: 'Hitzeschäden und Blow-ups führen zu Sperrungen und Umleitungen.' },
  { id: 'logistics', label: 'Logistik', unit: 'Lieferfähigkeit', icon: '➜', detail: 'Schiff, Schiene und Straße hängen voneinander ab.' },
  { id: 'health', label: 'Gesundheit', unit: 'Klinikreserve', icon: '+', detail: 'Freie Behandlungskapazität und Hitzeschutz für Risikogruppen.' },
  { id: 'food', label: 'Lebensmittel', unit: 'Versorgungsindex', icon: '◇', detail: 'Vorräte, Lieferketten, Ernteausfälle und Preisdruck.' },
  { id: 'trust', label: 'Gesellschaft', unit: 'Vertrauen', icon: '◎', detail: 'Akzeptanz von Maßnahmen und Glaubwürdigkeit der Kommunikation.' },
];
const INITIAL = { water: 71, river: 39, power: 79, roads: 86, logistics: 78, health: 81, food: 82, trust: 72 };
export const ACTIONS = [
  { id: 'leaks', group: 'wasser', name: 'Wasserwerke abdichten', desc: 'Weniger Leitungsverluste für fünf Tage.', cost: 14, cooldown: 5, effect: { water: 5 }, policy: ['leaks', 5], impact: 'Trinkwasser +5 · Verbrauch sinkt 5 Tage' },
  { id: 'trucks', group: 'wasser', name: 'Trinkwasser-Konvois', desc: 'Tankwagen in die gefährdeten Regionen schicken.', cost: 12, cooldown: 2, effect: { water: 11, trust: 2 }, impact: 'Trinkwasser +11 · Vertrauen +2' },
  { id: 'ration', group: 'wasser', name: 'Verbrauch beschränken', desc: 'Industrie und Haushalte sparen drei Tage Wasser.', cost: 4, cooldown: 3, effect: { trust: -5 }, policy: ['ration', 3], impact: 'Wasserverbrauch sinkt · Vertrauen −5' },
  { id: 'river', group: 'wasser', name: 'Entnahmen drosseln', desc: 'Flüsse entlasten, Industrie temporär zurückfahren.', cost: 6, cooldown: 4, effect: { power: -3, trust: -2 }, policy: ['river', 4], impact: 'Rheinpegel sinkt langsamer · Energie −3' },
  { id: 'generator', group: 'infrastruktur', name: 'Notstrom & Kühlketten', desc: 'Mobile Aggregate, Lastspitzen und Kühlhäuser sichern.', cost: 15, cooldown: 3, effect: { power: 12, health: 2 }, policy: ['grid', 3], impact: 'Energie +12 · Kliniken +2' },
  { id: 'load', group: 'infrastruktur', name: 'Strom rationieren', desc: 'Planbare Abschaltungen schützen das Netz.', cost: 3, cooldown: 3, effect: { power: 4, trust: -4 }, policy: ['load', 3], impact: 'Netz entlastet · Vertrauen −4' },
  { id: 'asphalt', group: 'infrastruktur', name: 'Autobahnen sanieren', desc: 'Aufbrüche reparieren und Schäden an Hotspots sichern.', cost: 14, cooldown: 3, effect: { roads: 15, logistics: 3 }, impact: 'Autobahnen +15 · Logistik +3' },
  { id: 'rail', group: 'infrastruktur', name: 'Schiene priorisieren', desc: 'Güter von Rhein und Straße auf Züge verlagern.', cost: 16, cooldown: 3, effect: { logistics: 15, food: 3 }, impact: 'Logistik +15 · Lebensmittel +3' },
  { id: 'clinics', group: 'gesellschaft', name: 'Notkliniken öffnen', desc: 'Zusätzliche Teams und Behandlungsplätze bereitstellen.', cost: 14, cooldown: 3, effect: { health: 14 }, impact: 'Klinikreserve +14' },
  { id: 'shelters', group: 'gesellschaft', name: 'Hitzeschutzräume', desc: 'Kühle Orte, Besuchsdienste und Trinkstationen.', cost: 9, cooldown: 4, effect: { health: 8, trust: 2 }, policy: ['protect', 4], impact: 'Gesundheit +8 · Hitzeschutz 4 Tage' },
  { id: 'food', group: 'versorgung', name: 'Lebensmittel-Korridore', desc: 'Importe und Notverteilung sichern die Regale.', cost: 15, cooldown: 3, effect: { food: 15, trust: 1 }, impact: 'Lebensmittel +15 · Vertrauen +1' },
  { id: 'message', group: 'gesellschaft', name: 'Lage offen kommunizieren', desc: 'Transparente Updates, Faktenchecks, Warnmeldungen.', cost: 5, cooldown: 2, effect: { trust: 11 }, impact: 'Vertrauen +11' },
  { id: 'credit', group: 'finanzen', name: 'Nachtragshaushalt', desc: 'Kreditlinie öffnen — politisch und finanziell teuer.', cost: 0, cooldown: 7, limit: 2, effect: { trust: -5 }, funds: 36, impact: 'Budget +36 Mrd. € · Vertrauen −5' },
];
export const EVENTS = {
  3: { title: 'A7: Fahrbahn wölbt sich auf', category: 'INFRASTRUKTUR', text: '45 °C auf der Fahrbahn. Auf mehreren Autobahnabschnitten werden Blow-ups gemeldet. Gütertransporte stehen still.', impact: { roads: -9, logistics: -3 }, choices: [
    { name: 'Notinstandsetzung', text: 'Teuer, aber verhindert Dominoeffekte.', cost: 12, effect: { roads: 9, logistics: 4, trust: 1 } },
    { name: 'Abschnitte sperren', text: 'Sichere Umleitung, längere Lieferzeiten.', cost: 0, effect: { roads: 3, logistics: -7, trust: -2 } },
  ] },
  5: { title: 'Rhein: Frachter können kaum fahren', category: 'TRANSPORTWASSER', text: 'Der Pegel fällt. Kohle, Chemie und Lebensmittel müssen auf alternative Transportwege ausweichen.', impact: { logistics: -9, food: -3 }, choices: [
    { name: 'Schiene zusätzlich buchen', text: 'Entlastet besonders die Lebensmittelversorgung.', cost: 12, effect: { logistics: 11, food: 3 } },
    { name: 'Industriefracht priorisieren', text: 'Sichert Strom, verknappt Konsumgüter.', cost: 0, effect: { power: 6, food: -5, trust: -3 } },
  ] },
  7: { title: 'Notaufnahmen am Anschlag', category: 'GESUNDHEIT', text: 'Die Zahl der Hitzeerkrankten steigt schneller als die Klinikreserven. Personal fällt selbst krankheitsbedingt aus.', impact: { health: -11 }, choices: [
    { name: 'Bundesweite Unterstützung', text: 'Hilfsorganisationen und mobile Teams koordinieren.', cost: 12, effect: { health: 11, trust: 2 } },
    { name: 'Planbare Eingriffe verschieben', text: 'Schnell, aber gesellschaftlich umstritten.', cost: 0, effect: { health: 7, trust: -5 } },
  ] },
  9: { title: 'Falsche Wasserwarnung im Umlauf', category: 'INFORMATION', text: 'Ein viraler Post behauptet, die Trinkwasserversorgung sei zusammengebrochen. Supermärkte melden Hamsterkäufe.', impact: { trust: -9, food: -2 }, choices: [
    { name: 'Gemeinsames Lagebriefing', text: 'Belegen, erklären, regelmäßig aktualisieren.', cost: 5, effect: { trust: 12 } },
    { name: 'Abwarten', text: 'Schont Mittel, kostet Vertrauen.', cost: 0, effect: { trust: -5 } },
  ] },
  11: { title: 'Kühlwassermangel im Kraftwerk', category: 'ENERGIE', text: 'Mehrere Kraftwerksblöcke reduzieren die Leistung. Gleichzeitig steigt der Bedarf an Kühlung.', impact: { power: -11 }, choices: [
    { name: 'Reservekraftwerke aktivieren', text: 'Stabilisiert das Netz, bindet hohe Mittel.', cost: 14, effect: { power: 12 } },
    { name: 'Industrie abschalten', text: 'Netz wird gestützt, Transportgüter fehlen.', cost: 0, effect: { power: 8, logistics: -5, trust: -3 } },
  ] },
  13: { title: 'Ernteausfälle und Preissprünge', category: 'ERNÄHRUNG', text: 'Die Dürre treibt Lebensmittelpreise. Großhandel und Tafeln warnen vor Engpässen.', impact: { food: -12, trust: -3 }, choices: [
    { name: 'Importe beschleunigen', text: 'Teure, aber wirksame Sonderlogistik.', cost: 12, effect: { food: 12, logistics: -2 } },
    { name: 'Gegen Preisspitzen helfen', text: 'Stützt Akzeptanz stärker als Vorräte.', cost: 0, effect: { food: 3, trust: 7 } },
  ] },
  15: { title: 'Vegetationsbrände im Südwesten', category: 'WALDBRAND', text: 'Rauch und Sperrungen belasten Kliniken und Straßen. Löschwasser fehlt.', impact: { health: -7, roads: -6, water: -3 }, choices: [
    { name: 'Überregionale Löschhilfe', text: 'Schützt Gesundheit und Infrastruktur.', cost: 11, effect: { health: 6, roads: 7, trust: 2 } },
    { name: 'Gebiete evakuieren', text: 'Menschen schützen, Logistik bremsen.', cost: 0, effect: { health: 6, logistics: -5, trust: -2 } },
  ] },
  17: { title: 'Wasserwerk meldet IT-Ausfall', category: 'KRITIS', text: 'Überhitzte Server unterbrechen die Steuerung mehrerer Wasserwerke. Notbetrieb ist möglich.', impact: { water: -8, trust: -2 }, choices: [
    { name: 'Manuellen Notbetrieb starten', text: 'Teams vor Ort überbrücken die Störung.', cost: 9, effect: { water: 8, trust: 2 } },
    { name: 'Versorgung einschränken', text: 'Günstiger, aber Vertrauen leidet.', cost: 0, effect: { water: 3, trust: -5 } },
  ] },
};

const clamp = (x, a=0, b=100) => Math.min(b, Math.max(a, x));
function rand(s) { let x = s.rng >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; s.rng = x >>> 0; return s.rng / 4294967296; }
function temperature(s) { return Math.round((38.3 + 3.1 * Math.sin((s.day + 1) * .74) + 2.6 * rand(s)) * 10) / 10; }
function log(s, title, body, kind='info') { s.log.unshift({ day: s.day, title, body, kind }); s.log.length = Math.min(s.log.length, 24); }
function record(s) { s.history.push({ day: s.day, heat: s.temp, budget: Math.round(s.budget), ...s.metrics }); }
function syncToday(s) { const last=s.history.at(-1); if(last?.day===s.day) Object.assign(last, { budget:Math.round(s.budget), ...s.metrics }); }
export function createGame(seed=20261107) {
  const s = { seed, rng: (seed >>> 0) || 1, day: 1, temp: 40, budget: 124, debt: 0, ops: 3,
    metrics: { ...INITIAL }, policy: {}, lastUsed: {}, used: {}, log: [], history: [], pending: null,
    over: false, outcome: null, criticalDays: 0, endedReason: '', actionCount: 0 };
  s.temp = temperature(s);
  log(s, 'LÜKEX: Krisenstab übernimmt', 'Fünf Dürrejahre. 18 Tage Extremhitze stehen bevor. Priorität: kritische Versorgung sichern.');
  record(s);
  return s;
}
export function applyEffects(s, effects={}) { for (const [k,v] of Object.entries(effects)) if (k in s.metrics) s.metrics[k] = clamp(s.metrics[k]+v); }
export function available(s, action) {
  if (s.over || s.pending) return 'Zuerst die Lageentscheidung treffen';
  if (s.ops <= 0) return 'Keine Maßnahmen mehr heute';
  if (s.budget < action.cost) return 'Budget reicht nicht';
  if ((s.used[action.id] || 0) >= (action.limit ?? Infinity)) return 'Maximalzahl erreicht';
  if (s.lastUsed[action.id] && s.day - s.lastUsed[action.id] < action.cooldown) return `Noch ${action.cooldown - (s.day-s.lastUsed[action.id])} Tag(e) Sperrfrist`;
  return '';
}
export function takeAction(s, id) {
  const a = ACTIONS.find(x => x.id === id);
  if (!a) return false;
  if (available(s,a)) return false;
  s.budget -= a.cost;
  s.budget += a.funds || 0;
  if (a.funds) s.debt += a.funds;
  applyEffects(s, a.effect);
  if (a.policy) s.policy[a.policy[0]] = Math.max(s.policy[a.policy[0]] || 0, a.policy[1]);
  s.lastUsed[a.id] = s.day;
  s.used[a.id] = (s.used[a.id] || 0) + 1;
  s.ops--;
  s.actionCount++;
  log(s, a.name, a.impact, 'action');
  syncToday(s);
  return true;
}
export function chooseEvent(s, index) {
  if (!s.pending || s.over) return false;
  const choice = s.pending.choices[index];
  if (!choice || s.budget < choice.cost) return false;
  s.budget -= choice.cost;
  applyEffects(s, choice.effect);
  log(s, `Entscheidung: ${choice.name}`, choice.text, 'decision');
  s.pending = null;
  syncToday(s);
  return true;
}
function pressure(s) {
  const m = s.metrics, hot = Math.max(0, s.temp - 39), low = (k,t=55) => Math.max(0, (t-m[k])/25);
  const p=s.policy;
  const changes = {
    water: -1.55 - .24*hot - .38*low('power') + (p.ration?2.3:0) + (p.leaks?1.25:0),
    river: -.95 - .16*hot + (p.river?.9:0),
    power: -1.25 - .26*hot - .72*low('river',44) + (p.grid?1.85:0) + (p.load?1.6:0),
    roads: -.78 - .26*Math.max(0,s.temp-41),
    logistics: -1.05 - .78*low('river',50) - .78*low('roads') + (p.rail?0.7:0),
    health: -1.22 - .26*hot - .67*low('water') - .7*low('power') + (p.protect?1.45:0),
    food: -1.02 - .66*low('logistics') - .35*low('water'),
    trust: -.58 - .55*low('water') - .6*low('food') - .3*low('power') - (p.ration?.25:0) - (p.load?.3:0),
  };
  for (const [k,v] of Object.entries(changes)) m[k] = clamp(m[k] + v);
  // Occasional beneficial, clearly reported weather — never pretend to control Rhine water level with money.
  if (rand(s) < .13) {
    m.river = clamp(m.river + 2.6);
    m.water = clamp(m.water + 1.2);
    log(s, 'Kurzer Gewitterregen', 'Lokal etwas Entlastung. Die mehrjährige Dürre bleibt bestehen.', 'weather');
  }
  for (const k of Object.keys(p)) if (p[k] > 0) p[k]--;
  s.budget = Math.max(0, Math.round((s.budget + 5.4) * 10) / 10);
}
function assess(s) {
  const m=s.metrics;
  const severe = ['water','power','health','food','trust'].filter(k=>m[k]<14);
  const collapsing = Object.values(m).filter(x=>x<25).length;
  s.criticalDays = collapsing>=3?s.criticalDays+1:0;
  if (severe.length || s.criticalDays>=2) {
    s.over=true; s.outcome='loss'; s.endedReason=severe.length ? `Systemversagen: ${METRICS.find(x=>x.id===severe[0]).label}` : 'Drei kritische Systeme über mehrere Tage';
  } else if (s.day>=DAYS) {
    s.over=true;
    const avg=Object.values(m).reduce((a,b)=>a+b,0)/8;
    const vital=Math.min(m.water,m.power,m.health,m.food,m.trust);
    const stabilized=avg>=56 && vital>=35 && m.logistics>=32 && m.trust>=35;
    s.outcome=stabilized?'win':'loss';
    s.endedReason=stabilized
      ? 'Die 18-tägige Hitzephase ist überstanden. Kritische Versorgung und gesellschaftliche Stabilität bleiben tragfähig.'
      : 'Die Hitzephase endet, aber Versorgung und gesellschaftliche Stabilität sind nicht ausreichend gesichert.';
  }
}
export function advance(s) {
  if (s.over || s.pending || s.day>=DAYS) return false;
  s.day++;
  s.ops=3;
  s.temp=temperature(s);
  pressure(s);
  const e = EVENTS[s.day];
  if (e) {
    applyEffects(s, e.impact);
    s.pending=e;
    log(s,e.title,e.text,'event');
  } else if (s.temp>=43) {
    log(s,'Hitzewarnung',`Tagesmaximum ${s.temp.toFixed(1).replace('.',',')} °C. Wasser, Stromnetz und Kliniken unter Druck.`, 'weather');
  }
  assess(s);
  record(s);
  return true;
}
export function grade(s) {
  const m=s.metrics, avg=Object.values(m).reduce((a,b)=>a+b,0)/8;
  const safety=Math.min(m.water,m.power,m.health,m.food,m.trust);
  const score=Math.round(clamp(avg*.66 + safety*.24 + Math.max(-20,Math.min(20,s.budget))/4 + (s.outcome==='win'?8:0) - s.debt*.08,0,100));
  return { score, avg:Math.round(avg), safety:Math.round(safety), rank: score>=75?'Vorausschauend':score>=60?'Stabilisiert':score>=45?'Auf Kante':'Kritisch' };
}
