# DÜRREKRISE '26 - Krisenstab Deutschland

Ein schnelles, aber bewusst unbequemes Browser-Strategiespiel über systemische Hitze- und Dürrefolgen. Es orientiert sich an der [Tagesschau-Berichterstattung zur LÜKEX-Übung](https://www.tagesschau.de/inland/gesellschaft/hitze-duerre-ausnahmezustand-krisenmanagement-100.html). Das Spiel ist **keine** behördliche Lageeinschätzung, echte Pegelprognose oder Kostenkalkulation.

## Spielidee

Du musst 18 Tage Extremhitze überstehen. Der Bund kann nicht gleichzeitig alles reparieren. Es gibt nur **24 Krisenmittel (KM) am Anfang** und **5 KM pro Folgetag**, abzüglich laufender Vertragskosten und Kreditzinsen. KM sind bewusst erfundene Spielpunkte, keine Euro-Schätzungen.

Du darfst **höchstens zwei Maßnahmen je Tag** anordnen. Eine teure Anlage kostet nicht nur heute etwas, sondern oft auch an jedem Folgetag Unterhalt. Notkredite sind nur einmal möglich und senken das Vertrauen. Durch Nichtstun bleibt das finanzielle Polster für spätere Ereignisse erhalten. Es gibt **keinen Bonus für verbrauchte Beschluss-Slots**.

### Zehn gekoppelte Engpässe

| Anzeige | Bedeutung und Folgen |
| --- | --- |
| Trinkwasser | Versorgung, Wasserwerke, Löschwasserkonkurrenz |
| Rhein/Transportwasser | Niedrigwasser stört Fracht und Kraftwerkskühlung |
| Energie | Kraftwerksdrosselung, Klimatisierung, Wasseraufbereitung |
| Autobahnen | Blow-ups, Umleitungen und brandschutzbedingte Sperrungen |
| Logistik | Lieferkapazität auf Straße, Schiene und Rhein |
| Gesundheit | Freie Klinikreserve und Hitzekranke |
| Lebensmittel | Warenversorgung bei Ernteschäden und gestörter Logistik |
| Feuerwehr & Katastrophenschutz | Ausrückbare Mannschaften, Überlastung, langsamere Erholung |
| Gesellschaft | Vertrauen, Konflikte und Folgen von Rationierung |
| Brandfront / Waldbrandgefahr | Getrennte Krisenwerte: aktive Brände können wachsen; Vorbeugung und Löschen sind verschieden |

Dazu kommt der **Krisenfonds** als elfte, finanzielle Nebenbedingung.

### Entscheidungen, die wehtun

- Trinkwasser-Konvois helfen dem Wasserindex, nehmen aber Lkw aus der Logistik.
- Löschzüge dämmen Brandfronten, benötigen Trinkwasser und erschöpfen Feuerwehrleute.
- Notkliniken sichern Gesundheitsreserven, binden aber Einsatzkräfte.
- Hitzeschutzräume helfen Menschen, belasten Strom und verursachen Unterhalt.
- Strom- und Wasserrationierung sind billig, kosten Vertrauen und Produktion.
- Feuerwehrprävention wirkt langfristig, aber nicht unmittelbar gegen eine große Brandfront.
- Kredit finanziert Notlagen, verringert die nachfolgenden täglichen Zuflüsse und schadet der Glaubwürdigkeit.

17 operative Maßnahmen und 9 feste Lageereignisse bilden die Dramaturgie, während Temperatur, lokale Entlastung und Feuerentwicklung innerhalb eines Seeds deterministisch simuliert werden. Jeder Seed ist wiederholbar. Der Spieler kann an manchen Tagen sinnvoll nichts anordnen.

## Gewinnen und Scheitern

Am Ende müssen der Durchschnitt der neun Versorgungsindizes mindestens 53, die schwächsten Kernsysteme mindestens 32 und die Logistik mindestens 32 erreichen. Die aktive Brandlast muss unter 40 bleiben. Vorzeitiges Systemversagen bei einzelnen Kernsystemen unter 14, längerem Mehrfachkollaps oder Bränden außer Kontrolle.

## Lokal starten

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen. Keine Build-Toolchain und kein Server-Backend. Das UI nutzt [pfusch](https://github.com/MatthiasKainer/pfusch) direkt als ESM-Modul über dessen GitHub-Pages-URL; eine Internetverbindung zum CDN wird benötigt.

## Tests und Balancing

```bash
npm test
node tests/balance.mjs
```

Der eingebaute Test-Bot spielt 150 verschiedene Seeds in mehreren Stilen. Bei der abgestimmten Version gewinnt eine abwägende Strategie **83/150**, mit im Mittel **9,6 Maßnahmen** und an **9,5 Tagen ohne neue Maßnahme**. Absoluter Aktionismus (knapp 18 Eingriffe je Partie) und vollständige Untätigkeit gewinnen in diesem Test nicht. Das beweist keine menschliche Schwierigkeitskurve, ist aber ein reproduzierbarer Check gegen "Button-Spam ist immer optimal".

Für einen optischen Chromium-Smoke-Test mit Playwright (lokal optional):

```bash
python3 tests/browser-v2.py
```

Dieser Browser-Smoke-Test benutzt einen kompatiblen kleinen Renderer statt der Produktionsversion von `pfusch`. Er prüft die Buttons, den Beschlusszähler, Ereignisse, Feuerwehr-Tab und mobile Breite. Der echte CDN-Pfad bleibt eine separate Integrationsprüfung.

## GitHub Pages

`.github/workflows/deploy.yml` publiziert automatisch bei Push auf `main`. Einmalig in den GitHub-Repository-Einstellungen unter **Pages > Source: GitHub Actions** aktivieren. Der GitHub-App-Token kann eine noch nicht eingerichtete Pages-Site nicht selbst anlegen.

Zieladresse: `https://matthiaskainer.github.io/Climatewarming-manager/`

Das Modell verwendet fiktive Indizes und hypothetische Entscheidungen, keine behördlichen Prognosedaten. Kein Tracking, keine Nutzerkonten, keine Bezahl-APIs.