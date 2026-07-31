# Calisthenics Trainer

Eine kostenlose Calisthenics-App: 12-Wochen-Trainingsplan, Übungsdatenbank mit
Technik-Hinweisen, Satz- und Pausen-Timer, Fortschritts-Tracking.

**Kein Konto. Kein Abo. Kein Server. Keine Werbung.** Alles läuft im Browser,
alle Daten bleiben auf deinem Gerät.

---

## Sofort loslegen

**Variante 1 – einfach doppelklicken**
`index.html` im Browser öffnen. Fertig. Funktioniert auch ohne Internet.

**Variante 2 – als App aufs Handy**
Damit die Offline-Funktion und das Icon auf dem Homescreen greifen, braucht es
einen kleinen Webserver (Service Worker laufen nicht über `file://`):

```bash
cd calisthenics
npx serve .            # oder: python3 -m http.server 8080
```

Dann im Handy-Browser die Adresse öffnen und über das Browser-Menü
„Zum Startbildschirm hinzufügen“ wählen. Ab dann startet sie wie eine
normale App – auch im Flugmodus.

**Variante 3 – online stellen**
Der Ordner ist statisch. Er läuft unverändert auf Netlify, GitHub Pages,
Vercel oder jedem beliebigen Webspace.

---

## Was die App macht

| Bereich | Funktion |
|---|---|
| **Heute** | Der nächste fällige Trainingstag mit allen Übungen, Sätzen und Pausen |
| **Plan** | Alle 12 Wochen im Überblick, jeder Tag einzeln startbar |
| **Übungen** | 69 Übungen mit Ausführung, typischen Fehlern und Progressionskette |
| **Fortschritt** | Bestwerte je Übung, Trainingsverlauf, Serie, Gesamtvolumen |

**Im Training:** grosse Zielvorgabe, Eingabefeld für die tatsächlich
geschafften Wiederholungen, automatischer Pausen-Timer mit Countdown-Ton und
Vibration, Countdown für Halteübungen und ein Umschalter „Leichter / Schwerer“,
mit dem du jede Übung mitten im Satz an deine Tagesform anpasst.

---

## Wie der Plan entsteht

Beim ersten Start beantwortest du vier Fragen: Fitnesslevel, Ziel,
Trainingstage pro Woche und verfügbare Ausrüstung. Daraus baut
`assets/plan.js` einen 12-Wochen-Plan:

* **Split nach Trainingstagen** – 2–3 Tage Ganzkörper, 4 Tage Ober-/Unterkörper,
  5–6 Tage Push/Pull/Legs plus ein Skill-Tag.
* **Bewegungsmuster statt fester Übungen** – jeder Platz im Training ist ein
  Muster (horizontal drücken, vertikal ziehen, Kniebeugen, Hüftstreckung, Rumpf).
  Welche konkrete Übung dort landet, entscheidet dein Level *und* deine
  Ausrüstung. Ohne Stange bekommst du Rudern am Tisch statt Klimmzüge.
* **Progression über Wiederholungen** – innerhalb eines 4-Wochen-Blocks steigen
  Wiederholungen und Sätze, danach geht es eine Übungsstufe höher.
* **Entlastungswochen** – Woche 4, 8 und 12 laufen mit reduziertem Volumen,
  damit der Körper die Anpassung tatsächlich einbaut.
* **Ziel steuert Satzschema** – Maximalkraft 4–8 Wdh. bei 150 s Pause,
  Muskelaufbau 8–14 bei 90 s, Kraftausdauer 14–22 bei 45 s.

---

## Aufbau

```
calisthenics/
├── index.html               App-Grundgerüst
├── manifest.webmanifest     Installierbar als App
├── sw.js                    Service Worker (Offline-Cache)
└── assets/
    ├── data.js              Übungskatalog, Splits, Ziele
    ├── store.js             Zustand, localStorage, Export/Import
    ├── plan.js              Plan-Generator und Progressionslogik
    ├── app.js               Views, Router, Trainings-Player
    ├── app.css              Styles
    └── icon.svg             App-Icon
```

Kein Build-Schritt, keine Abhängigkeiten, kein Framework – reines
HTML/CSS/JavaScript.

---

## Deine Daten

Gespeichert wird ausschliesslich in `localStorage` deines Browsers unter dem
Schlüssel `calisthenics.state.v1`. Es gibt keine Netzwerkanfragen, kein
Analytics, keine Drittanbieter.

Das heisst aber auch: **Browserdaten löschen = Trainingsverlauf weg.** Unter
Einstellungen (⚙︎) kannst du deine Daten als JSON sichern und auf einem anderen
Gerät wieder einspielen.

---

## Anpassen

Eigene Übung ergänzen – in `assets/data.js` an das Array `EXERCISES` anhängen:

```js
{
  id: 'meine_uebung', name: 'Meine Übung', cat: 'push', level: 3, type: 'reps',
  equip: 'keine', muscles: ['Brust'],
  cues: ['Erster Hinweis', 'Zweiter Hinweis'],
  mistakes: ['Typischer Fehler'],
  easier: 'pushup', harder: 'diamond_pushup'
}
```

Damit sie auch im generierten Plan auftaucht, trägst du ihre `id` an der
passenden Stelle in `SLOT_POOLS` ein. Wichtig: **jeder Pool hat genau fünf
Einträge** – Position 1 entspricht Level 1, Position 5 dem Level 5.

---

## Hinweis

Trainingsinhalte sind allgemeine Information, keine medizinische Beratung. Bei
Vorerkrankungen, Schmerzen oder nach Verletzungen vorher ärztlich abklären. Im
Zweifel lieber eine Stufe leichter – Technik geht immer vor Wiederholungszahl.
