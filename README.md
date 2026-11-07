# DÜRREKRISE ’26 — Krisenstab Deutschland

Ein schnelles, grafisch kompaktes Krisenmanagement-Spiel mit **18 Tagen**, zwei optionalen Entscheidungen pro Tag und verbundenen Schäden durch **Dürre, Hitze, Waldbrände und Starkregen**. Inspiriert von der [LÜKEX-Berichterstattung der Tagesschau](https://www.tagesschau.de/inland/gesellschaft/hitze-duerre-ausnahmezustand-krisenmanagement-100.html). Alle simulierten Gefahrenwerte und Verkehrsbeeinträchtigungen sind **fiktiv**, keine Echtzeitinformationen und keine amtlichen Lageberichte.

**[Das Spiel öffnen](https://matthiaskainer.github.io/Climatewarming-manager/)**

## Ein Spieltag

- Der Bund beginnt mit **24 Mrd. € verfügbarem Krisenbudget**. Pro Folgetag fließen **5 Mrd. €** zu; laufender Unterhalt und Kreditlast werden abgezogen. Die Euro-Größenordnungen sind **abstrahierte Planspielgrößen**, ausdrücklich keine reale Kosten- oder Haushaltsschätzung.
- Maximal **zwei Beschlüsse pro Tag**. Nichtstun kostet keinen Beschluss und lässt Mittel für spätere Katastrophen übrig.
- Feuerwehren löschen Brände nur mit Wasser und Einsatzkräften; Personal erholt sich langsam. Konvois und Katastrophenschutz konkurrieren um Diesel, Strom, Logistik und Fahrzeuge.
- Bei Hitze entstehen Straßenschäden (Blow-ups). Der Rhein wird schwer befahrbar. Stromnetze, Gesundheitssystem, Lebensmittel und Vertrauen beeinflussen sich gegenseitig.
- **Starkregen** trifft auch ausgetrocknete Regionen. Ein lokales Gewitter kann die Brandgefahr verringern, zugleich aber Sturzfluten und Straßensperrungen auslösen. Unterführungen werden geflutet, Wasserwerke und Stromnetze belastet, Feuerwehr / KatS benötigt Pumpen und Sandsäcke.
- An den Tagen 5, 11 und 16 treffen modellierte Starkregenereignisse verschiedene Korridore; Ereignisentscheidungen kosten kein Beschlusslimit, aber ggf. Geld und andere Ressourcen.

## Kompaktes Lagebild

Die Karte ist **Deutschland mit tatsächlichen vereinfachten Ländergrenzen** (16 Bundesländer) und **47 geografisch verorteten Städten**. Darüber liegen farbige Verkehrsachsen (A1, A2, A3, A5, A7, A8, A9, A24 und Rhein) sowie symbolische Wasser-, Energie-, Logistik-, Krankenhaus-, Feuerwehr- und KatS-Standorte. Die Linien sind **geografisch verortete Korridore über echte Städte**, keine exakten Straßenverläufe oder digitalen Straßennetze. Ein Klick zeigt den Zustand und die Dauer einer modellierten Beeinträchtigung.

**Grün** = befahrbar; **Gelb** = eingeschränkt; **Rot** = kritisch/gesperrt. Straßenfarben ändern sich durch Hitze, Überflutungen, Brandlast und Ereignissperrungen. Animierte Frachtbewegungen, Radar-Ringe und Warnmarker sind rein visuelle Simulationselemente. Bei reduzierter Bewegung (`prefers-reduced-motion`) werden die Animationen ausgeschaltet.

Die Oberfläche ist für 1280–1440 px breite Desktops als ein einzelner Leitstand ausgelegt; nur die **interne Maßnahmenliste** scrollt. Auf mobilen Geräten stapelt sich die Darstellung.

### Modellierte Engpässe

Trinkwasser · Rhein/Transportwasser · Energie · Autobahnen · Logistik · Gesundheit · Lebensmittel · Feuerwehr & Katastrophenschutz · Gesellschaft. Separat werden Brandfront, Waldbrandgefahr und Überflutung modelliert. Das Krisenbudget ist die finanzielle Nebenbedingung.

19 operative Maßnahmen, 12 episodische Lageereignisse und einige wetterabhängige Schwankungen erzeugen Zielkonflikte. Entscheidungen haben Nebenwirkungen und häufig Folgekosten. Ein guter Verlauf benötigt **nicht** an jedem Tag einen Beschluss.

## Tests und Balance

```bash
npm test
node tests/balance.mjs
python3 tests/browser-v3.py  # optional, benötigt Python Playwright und Chromium
```

11 automatisierte Tests prüfen Budget, Abhängigkeiten, Feuerwehr, Sturzflut, Korridore und 150 wiederholbare Simulationsläufe pro Strategie. Zusätzlich wurden **500 Seeds je Strategie** getestet: abwägend **326 Siege / 500**, Daueraktionismus **0 / 500**, völlige Untätigkeit **0 / 500**. Die abwägende Strategie setzt etwa **9 Maßnahmen** ein und lässt etwa **10 Tage** ganz ohne Aktion verstreichen. Dies ist eine Bot-Balance, **keine** validierte menschliche Schwierigkeitsmessung.

Chromium prüft die Kartenmarker, Layer, Beschlussanzeige, Starkregenereignis, mehrere vollständige Partien sowie die mobile Breite. Der Browser-Smoke-Test verwendet zur Offline-Sichtprüfung einen kompatiblen Renderer; der produktive `pfusch`-Import wird über die GitHub-Pages-URL eingebunden.

## Lokal starten

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen. Kein Build, keine Telemetrie, keine Datenbank. Die [pfusch](https://github.com/MatthiasKainer/pfusch)-ESM-Importdatei wird zur Laufzeit aus GitHub Pages geladen, daher für die Produktions-UI eine Internetverbindung benötigt.

## Geodaten und fachliche Grundlagen

- **Bundesländer**: [isellsoap/deutschlandGeoJSON](https://github.com/isellsoap/deutschlandGeoJSON), `2_bundeslaender/4_niedrig.geo.json` (Unlicense, GIS-DATA). Für ein SVG mit 2,7 px Toleranz vereinfacht und ins lokale Bundle übernommen. Vereinfacht, nicht vermessungsgenau.
- **Autobahnrouten**: Hauptstadtkorridore und wichtige Verläufe anhand des [ADAC-Überblicks](https://www.adac.de/verkehr/recht/verkehrsvorschriften-deutschland/autobahnen-deutschland/) und der Städtegeografie. Die Kurven zwischen Städten sind **nicht** exakte Straßenachsen, Sperrungen rein spielintern.
- **Starkregenrisiko**: [BBK: Starkregen und Sturzfluten](https://www.bbk.bund.de/DE/Themen/Risikomanagement/Baulicher-Bevoelkerungsschutz/Schutz-vor-Naturgefahren/Starkregen/starkregen.html). Die Modellmechanik ist davon inspiriert, aber **keine hydrologische Prognose**.

## Deployment

`.github/workflows/deploy.yml` führt `npm test` aus und veröffentlicht danach genau einmal per GitHub Actions auf [GitHub Pages](https://matthiaskainer.github.io/Climatewarming-manager/). Kein Build-Dienst erforderlich; bewusst keine zusätzlichen Push-/Deploy-Schleifen.
