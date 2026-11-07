# DÜRREKRISE '26 — Krisenstab Deutschland

Ein schnelles, deterministisches Browser-Strategiespiel über systemische Risiken während einer extremen Hitze- und Dürrekrise. Inspiriert vom [Tagesschau-Bericht zur bundesweiten LÜKEX-Übung vom 7. November 2026](https://www.tagesschau.de/inland/gesellschaft/hitze-duerre-ausnahmezustand-krisenmanagement-100.html).

**Spielziel:** 18 Tage mit höchstens drei Maßnahmen pro Tag überstehen — ohne das Vertrauen, die kritische Versorgung oder die Logistik in den Kollaps laufen zu lassen. Die Zustände sind abstrahierte Indizes (0–100), **keine offiziellen Prognosen, echten Pegelwerte oder Messdaten**. Die Budgetangaben in Milliarden sind ausdrücklich fiktive, für den Spielrhythmus skalierte Krisenmittel, keine Kostenkalkulation.

## Ressourcen

| Index | Was er abbildet | Wie er gekoppelt ist |
| --- | --- | --- |
| Trinkwasser | Verfügbarkeit von aufbereitetem Wasser | Stromausfall belastet Wasserwerke; Rationierung spart Wasser, kostet Vertrauen |
| Rhein / Transportwasser | Index der Schiffbarkeit, nicht Kubikmeter | Niedrigwasser stört Gütertransporte und die Kühlwasserversorgung |
| Energie | Reserve und Stabilität des Netzes | Hitzelast und Kühlwassermangel reduzieren die Versorgung |
| Autobahnen | Betriebsfähigkeit | Blow-ups, Sperrungen und Schäden mindern die Lieferfähigkeit |
| Logistik | Schiff, Straße und Schiene | Blockaden treiben Lebensmittelengpässe |
| Gesundheit | Verfügbare Klinikreserve | Hitze, Strom- und Wasserknappheit drücken die Kapazität |
| Lebensmittel | Versorgungsindex | Schlechtere Logistik und Wasserknappheit verschärfen die Lage |
| Gesellschaft | Vertrauen in die Handlungsfähigkeit | Engpässe, falsche Meldungen und harte Eingriffe senken Akzeptanz |
| Budget | Abstraktes Finanzpolster | Maßnahmen, Krisenentscheidungen und Kredite konkurrieren |

13 Maßnahmen mit Sperrfristen und direkten oder mehrtägigen Auswirkungen. Acht redaktionell gesetzte Lageereignisse mit je zwei Entscheidungen. Der Rheinpegel kann nicht einfach mit Haushaltsmitteln aufgefüllt werden; Entnahmerestriktionen bremsen die Verschlechterung, Güter werden stattdessen auf die Schiene verlagert.

**Spielregeln:** Für einen Erfolg muss am Ende der durchschnittliche Systemwert mindestens 56, der niedrigste Wert in Trinkwasser/Energie/Gesundheit/Lebensmitteln/Vertrauen mindestens 35 sowie Logistik und Vertrauen jeweils mindestens 32 bzw. 35 betragen. Kritische Frühabbrüche greifen bei Einzelwerten unter 14 oder drei Indizes unter 25 an zwei aufeinanderfolgenden Tagen. Der Zähler umfasst 18 simulierte Tage, die letzte Runde dient der Auswertung.

## Lokal starten

```sh
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen. **Kein Bundler und keine Abhängigkeiten beim Build.** Die Weboberfläche verwendet [pfusch](https://github.com/MatthiasKainer/pfusch) als ESM-Modul über die offizielle GitHub-Pages-URL und braucht deshalb zur Laufzeit Internetzugang.

## Automatisierte Durchläufe

```sh
npm test
```

Die Tests spielen mehrere vollständige Partien mit festem Seed, prüfen Sperrfristen, Effekte und Determinismus. Automatische Entscheidungsstrategien sind nur ein Balancing-Werkzeug, keine Garantie, dass eine Partie menschlich leicht oder schwer erscheint.

## GitHub Pages

`.github/workflows/deploy.yml` veröffentlicht bei Push auf `main` den statischen Inhalt über die offizielle Pages-Action (kein NPM-Build). Bei einem **privaten** Repository muss GitHub Pages im Repository unter **Settings → Pages → Build and deployment → Source: GitHub Actions** zugelassen sein. Die Workflow-Konfiguration versucht, die Einrichtung automatisch zu ermöglichen; ob dies funktioniert, hängt vom Repository-Plan und den Administrationsrechten ab.

Vorgesehene URL: `https://matthiaskainer.github.io/Climatewarming-manager/` (erst nach erfolgreicher Pages-Bereitstellung).

## Hinweise

Das Spiel ist ein **Fiktions- und Planspiel**, keine BBK-/LÜKEX-App. Aussagen und Mechaniken sind didaktisch vereinfacht; insbesondere Zahlen für Bundesbudget, Pegel und Versorgungsreserven sind frei gewählt. Kein Tracking, keine Nutzerdaten, keine Backend-API, keine bezahlten Deployments erforderlich.