# DÜRREKRISE ’26 — Krisenstab Deutschland

Ein schnelles, grafisch kompaktes Krisenmanagement-Spiel mit **18 Tagen**, zwei optionalen Entscheidungen pro Tag und verbundenen Schäden durch **Dürre, Hitze, Waldbrände und Starkregen**. Inspiriert von der [LÜKEX-Berichterstattung der Tagesschau](https://www.tagesschau.de/inland/gesellschaft/hitze-duerre-ausnahmezustand-krisenmanagement-100.html). Alle simulierten Gefahrenwerte und Verkehrsbeeinträchtigungen sind **fiktiv**, keine Echtzeitinformationen und keine amtlichen Lageberichte.

**[Das Spiel öffnen](https://matthiaskainer.github.io/Climatewarming-manager/)**

## Schwierigkeitsgrad

Vier Stufen sind in der **Topbar** auswählbar. Ein Wechsel gilt **erst ab „Neustart“ / „Neue Krise“**, damit keine laufende Partie heimlich verändert wird. „Nochmal“ wiederholt denselben Seed in der gewählten Stufe. Die Auswahl wird lokal gespeichert; `Standard` ist die bisherige V5-Spielbalance.

| Stufe | Startbudget | Einnahmen / Tag | Krisendruck |
| --- | ---: | ---: | --- |
| Leicht | 30 Mrd. € | 6,5 Mrd. € | Mehr Startreserven; Hitze, Schäden und Brände milder |
| Standard | 24 Mrd. € | 5 Mrd. € | Bisherige Balance |
| Schwer | 21 Mrd. € | 4,7 Mrd. € | Weniger Startreserven; höhere Verschleiß- und Ereignisschäden |
| Extrem | 20 Mrd. € | 4,5 Mrd. € | Noch stärkere Kettenreaktionen und langsamere Entwässerung |

Alle vier Stufen haben **identische Überlebensbedingungen**. Die Schwierigkeit verändert Budget, Einnahmen, Ausgangsreserven, Hitze, täglichen Verschleiß, Katastrophenintensität und Brandentwicklung, nicht die Ziellinie. Derselbe Seed erzeugt denselben Ereignisplan auf allen Stufen.

## Ein Spieltag

- Auf `Standard` beginnt der Bund mit **24 Mrd. € verfügbarem Krisenbudget**. Pro Folgetag fließen **5 Mrd. €** zu; laufender Unterhalt und Kreditlast werden abgezogen. Die Euro-Größenordnungen sind **abstrahierte Planspielgrößen**, ausdrücklich keine reale Kosten- oder Haushaltsschätzung.
- Maximal **zwei Beschlüsse pro Tag**. Nichtstun kostet keinen Beschluss und lässt Mittel für spätere Katastrophen übrig.
- Feuerwehren löschen Brände nur mit Wasser und Einsatzkräften; Personal erholt sich langsam. Konvois und Katastrophenschutz konkurrieren um Diesel, Strom, Logistik und Fahrzeuge.
- Bei Hitze entstehen Straßenschäden (Blow-ups). Der Rhein wird schwer befahrbar. Stromnetze, Gesundheitssystem, Lebensmittel und Vertrauen beeinflussen sich gegenseitig.
- **Starkregen** auf ausgetrocknetem Boden erhöht kurzfristig den oberflächlichen Abfluss. Im Rhein-Main-Ereignis erhält der Rhein **+9 Schifffahrts-Indexpunkte**, die über drei Tage zusätzlich abklingen. Die Trinkwasserversorgung kann gleichzeitig durch verschmutztes Rohwasser Schaden nehmen. Lokale Sturzfluten, überflutete Unterführungen, Stromschäden und Feuerwehr-/KatS-Einsätze bleiben ein Zielkonflikt. Regen in Norddeutschland erhöht dagegen nicht automatisch den Rheinpegel.
- Drei regionale Starkregenereignisse treffen unterschiedliche Korridore. **Ereignistage variieren** innerhalb von Krisenphasen, bleiben aber pro Seed reproduzierbar. Ereignisentscheidungen kosten kein Beschlusslimit, aber ggf. Geld und andere Ressourcen.

## Kompaktes Lagebild

Die Karte ist **Deutschland mit tatsächlichen vereinfachten Ländergrenzen** (16 Bundesländer) und **47 geografisch verorteten Städten**. Darüber liegen farbige Verkehrsachsen (A1, A2, A3, A5, A7, A8, A9, A24 und Rhein) sowie symbolische Wasser-, Energie-, Logistik-, Krankenhaus-, Feuerwehr- und KatS-Standorte. Die Linien sind **geografisch verortete Korridore über echte Städte**, keine exakten Straßenverläufe oder digitalen Straßennetze. Ein Klick zeigt den Zustand und die Dauer einer modellierten Beeinträchtigung.

**Grün** = befahrbar; **Gelb** = eingeschränkt; **Rot** = kritisch/gesperrt. Straßenfarben ändern sich durch Hitze, Überflutungen, Brandlast und Ereignissperrungen. Animierte Frachtbewegungen, Radar-Ringe und Warnmarker sind rein visuelle Simulationselemente. Bei reduzierter Bewegung (`prefers-reduced-motion`) werden die Animationen ausgeschaltet.

Die Oberfläche ist für 1280–1440 px breite Desktops als ein einzelner Leitstand ausgelegt; nur die **interne Maßnahmenliste** scrollt. **Lageentscheidungen** erscheinen direkt über dem Maßnahmenbereich; die Karte, alle neun Versorgungsindizes und ein kompakter Vergleich der vier schwächsten Systeme bleiben sichtbar. Währenddessen sind Maßnahmen, Fortschreiben, Layerwechsel und Neustart deaktiviert. Auf mobilen Geräten stapelt sich die Darstellung.

### Frühwarnung und wechselnde Ausgangslage

Jede neue Krise startet aus **einem von fünf Anfangsprofilen** (Hitze, Niedrigwasser, Waldbrand, Versorgungsengpass, wechselhaftes Wetter) mit geringfügiger deterministischer Variation von neun Ressourcen. Die Lageereignisse wechseln innerhalb von Phasen ihre Reihenfolge. „Dieselbe Krise erneut“ reproduziert hingegen denselben Seed.

Die Farbwarnung **STABIL → ANGESPANNT → ERNST → AKUTE KRISE** berücksichtigt Versorgungspuffer, Brände, Überflutung und akute Ausfallgefahr. **Gewonnen wird an Tag 18**, wenn die sieben Kernbereiche Trinkwasser, Strom, Gesundheit, Lebensmittel, Feuerwehr/KatS, Gesellschaft und Logistik jeweils mindestens **31 %** halten, Brandfront < 40 und Überflutung < 38 sind. Rhein und Autobahnen wirken über die Versorgungsketten, sind aber nicht allein ausschlaggebend. **47,5 % Durchschnitt ist ein Qualitätsziel und keine heimliche zusätzliche Verlustbedingung.** Kernwerte unter 14 %, zwei Tage mit drei extrem schwachen Systemen oder unkontrollierte Großbrände können vorher die Krise beenden.

Vor dem letzten Tag zeigt der Maßnahmenbereich eine **deterministische Vorschau auf Tag 18**. Der **Endbericht bleibt direkt über den Maßnahmen**, sodass Deutschlandkarte und die neun Ressourcenzustände sichtbar bleiben. Er enthält die drei Zielprüfungen, alle Endwerte und die Differenz zum Vortag. Die Karte kennt weiterhin Rot/Orange-Warnstufen, statt erst am Ende einen verdeckten Schwellenwert offenzulegen.

### Audio

- **Cuelume** v0.2.2 (MIT) wird im Browser bei Bedarf von `cdn.jsdelivr.net` geladen und liefert `press`/`release` und kontextuelle Rückmeldungen. Die Delegation erfolgt innerhalb von `pfusch`-Shadow-DOM. Falls das CDN nicht erreichbar ist, liefert Web Audio einen leisen Ersatzklick statt die UI zu blockieren.
- Die **optional zuschaltbare Hintergrundmusik** ist ein eigens komponiertes, im Browser generiertes 12-Sekunden-Ambientmotiv. Es wird **per nativem HTML-Audio** nach einem echten Klick abgespielt, statt in einem möglicherweise gesperrten Web-Audio-Kontext zu verharren. Es verwendet **keine externe Musikaufnahme** und keine fremden Melodien; kein Lizenz- oder Royalty-Risiko für ein Audioasset. Musik ist bei jedem Seitenaufruf zunächst **aus**. Soundeffekte können jederzeit über `TON AN/AUS` abgeschaltet werden; die Präferenz wird lokal gespeichert.
- Keine automatischen Töne vor Benutzerinteraktion, kein Tracking.

### Modellierte Engpässe

Trinkwasser · Rhein/Transportwasser · Energie · Autobahnen · Logistik · Gesundheit · Lebensmittel · Feuerwehr & Katastrophenschutz · Gesellschaft. Separat werden Brandfront, Waldbrandgefahr und Überflutung modelliert. Das Krisenbudget ist die finanzielle Nebenbedingung.

19 operative Maßnahmen, 12 episodische Lageereignisse und einige wetterabhängige Schwankungen erzeugen Zielkonflikte. Entscheidungen haben Nebenwirkungen und häufig Folgekosten. Ein guter Verlauf benötigt **nicht** an jedem Tag einen Beschluss.

## Tests und Balance

```bash
npm test
node tests/balance.mjs
python3 tests/browser-v6.py  # Schwierigkeitswahl, Neustarts, Viewports; Python Playwright und Chromium
```

19 automatisierte Tests prüfen Budget, Abhängigkeiten, Feuerwehr, Rheinpegel nach Starkregen, wechselnde Anfangsbedingungen, Verlustwarnung, Korridore und 150 wiederholbare Simulationsläufe pro Strategie. Mit der V5-Abschlussregel auf Standard: 150 Seeds je Strategie — **abwägend 98 Siege / 150**, Daueraktionismus **0 / 150**, völlige Untätigkeit **0 / 150**. Auf 220 Seeds mit derselben automatisierten Strategie gewinnt „Leicht“ 220-mal, „Standard“ 146-mal, „Schwer“ 32-mal und „Extrem“ 7-mal. Die Simulationen sind keine repräsentativen menschlichen Schwierigkeitsmessungen. Die abwägende Strategie setzt etwa **9 Maßnahmen** ein und lässt etwa **10 Tage** ganz ohne Aktion verstreichen. Dies ist eine Bot-Balance, **keine** validierte menschliche Schwierigkeitsmessung.

Chromium prüft die Kartenmarker, Ereignis-Overlay, den nichtmodalen Abschlussbericht, Ressourcentrends, echte HTML-Audio-Wiedergabe über einen Klick, Vollpartien sowie 1280–1440 px Viewports und mobile Breite. Der Browser-Smoke-Test verwendet zur Offline-Sichtprüfung einen kompatiblen Renderer; der produktive `pfusch`-Import wird über die GitHub-Pages-URL eingebunden.

## Lokal starten

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen. Kein Build, keine Telemetrie, keine Datenbank. Die [pfusch](https://github.com/MatthiasKainer/pfusch)-ESM-Importdatei wird zur Laufzeit aus GitHub Pages geladen, daher für die Produktions-UI eine Internetverbindung benötigt.

## Geodaten und fachliche Grundlagen

- **Bundesländer**: [isellsoap/deutschlandGeoJSON](https://github.com/isellsoap/deutschlandGeoJSON), `2_bundeslaender/4_niedrig.geo.json` (Unlicense, GIS-DATA). Für ein SVG mit 2,7 px Toleranz vereinfacht und ins lokale Bundle übernommen. Vereinfacht, nicht vermessungsgenau.
- **Autobahnrouten**: Hauptstadtkorridore und wichtige Verläufe anhand des [ADAC-Überblicks](https://www.adac.de/verkehr/recht/verkehrsvorschriften-deutschland/autobahnen-deutschland/) und der Städtegeografie. Die Kurven zwischen Städten sind **nicht** exakte Straßenachsen, Sperrungen rein spielintern.
- **Wasserbilanz**: [DKKV zu Abfluss und trockenen Böden](https://dkkv.org/en/topics/floods/) sowie [Umweltbundesamt zu Sturzfluten](https://www.umweltbundesamt.de/en/themen/klima-energie/klimafolgen-anpassung/folgen-des-klimawandels/monitoring-zur-das/das-handlungsfelder-indikatoren/bauwesen/bau-i-4-heavy-rain-in-residential-areas).
- **Audio**: [Cuelume](https://github.com/Danilaa1/cuelume), MIT, Benutzeroberflächen-Geräusche live per Web Audio.
- **Starkregenrisiko**: [BBK: Starkregen und Sturzfluten](https://www.bbk.bund.de/DE/Themen/Risikomanagement/Baulicher-Bevoelkerungsschutz/Schutz-vor-Naturgefahren/Starkregen/starkregen.html). Die Modellmechanik ist davon inspiriert, aber **keine hydrologische Prognose**.

## Deployment

`.github/workflows/deploy.yml` führt `npm test` aus und veröffentlicht danach genau einmal per GitHub Actions auf [GitHub Pages](https://matthiaskainer.github.io/Climatewarming-manager/). Kein Build-Dienst erforderlich; bewusst keine zusätzlichen Push-/Deploy-Schleifen.
