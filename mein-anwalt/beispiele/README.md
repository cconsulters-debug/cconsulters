# Beispiel-PDFs — vollständiger Qualitätsnachweis der Dokumentenpalette

**Alle 80 Dokumenttypen** haben jetzt ein eigenes Beispiel-PDF mit **fiktiven Personen und
Daten**, das Qualität und Aufbau zeigt (siehe `../dokumentenpalette-strategie.md` für die
Kuration). Dateien 01-80, nummeriert in der Reihenfolge der Kategorien: Miete & Wohnen (01,
11-17), Arbeit & Anstellung (02, 18-24), Kauf & Konsum (03, 25-31), Geld & Betreibung (04,
32-38), Nachbarschaft & Eigentum (05, 39-45), Verkehr & Bussen (06, 46-52), Datenschutz &
Digitales (07, 53-59), Versicherung & Sozialversicherung (08, 60-66), Freelance & KMU (09,
67-73), Allgemeine Werkzeuge (10, 74-80).

**Format je Dokument:** Markenkopf, Titel/Preisstufe, Fallangaben, kurze Einordnung, Sachverhalt,
je nach Komplexität 3–6 Abschnitte (Rechtsfrage, typischerweise einschlägige Normen als
Prüfhinweis gekennzeichnet, Würdigung), konkreter Schreiben-/Gesuchsentwurf, nächste Schritte,
Fristenwarnung wo relevant, Haftungs-Fusszeile. Premium-Dokumente (z. B. Kündigungsanfechtungen,
Rechtsgutachten) erhalten die volle Gutachten-Struktur; Info-Dokumente (einfache Schreiben)
bleiben bewusst kompakter — Tiefe proportional zum Preis und zur Komplexität des Anliegens.

**Erzeugt mit:** `../scripts/generate_examples.py` (Python + reportlab). Zum Neu-Generieren:
```bash
cd mein-anwalt && python3 scripts/generate_examples.py
```

**Qualitätssicherung:** Alle 80 Nummern (01–80) sind vorhanden, keine Duplikate, jede Datei
entspricht genau einem Schlüssel aus `../netlify/functions/lib/prompts.js` (DOC_TYPES) bzw.
`../app/mein-anwalt-aurum.html` (DOCS).
