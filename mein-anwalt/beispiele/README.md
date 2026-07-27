# Beispiel-PDFs — Qualitätsnachweis der Dokumentenpalette

10 Flaggschiff-Dokumente (eines je Themenkategorie + ein allgemeines Werkzeug), erstellt mit
**fiktiven Personen und Daten**, um Qualität, Aufbau und Tiefe der 80-teiligen Dokumentenpalette
zu zeigen (siehe `../dokumentenpalette-strategie.md`).

| Datei | Kategorie | Dokument |
|---|---|---|
| `01-miete-kuendigung-anfechten.pdf` | Miete & Wohnen | Kündigung durch Vermieter anfechten |
| `02-arbeit-kuendigung-anfechten.pdf` | Arbeit & Anstellung | Kündigung anfechten (Missbräuchlichkeit) |
| `03-konsum-inkasso-bestreiten.pdf` | Kauf & Konsum | Unberechtigte Inkassoforderung bestreiten |
| `04-schulden-rechtsvorschlag.pdf` | Geld & Betreibung | Rechtsvorschlag gegen Betreibung |
| `05-nachbarschaft-immissionen.pdf` | Nachbarschaft & Eigentum | Beschwerde wegen Immissionen |
| `06-verkehr-einsprache-ordnungsbusse.pdf` | Verkehr & Bussen | Einsprache gegen Ordnungsbusse |
| `07-datenschutz-auskunftsbegehren.pdf` | Datenschutz & Digitales | Auskunftsbegehren nach Datenschutzgesetz |
| `08-versicherung-einsprache.pdf` | Versicherung & Sozialversicherung | Einsprache gegen Versicherungsentscheid |
| `09-kmu-rechnung-mahnung.pdf` | Freelance & KMU | Rechnung & Mahnung fürs eigene Gewerbe |
| `10-werkzeuge-rechtsgutachten.pdf` | Allgemeine Werkzeuge | Rechtsgutachten / Fallanalyse |

**Format je Dokument:** Markenkopf, Titel/Preisstufe, Fallangaben, kurze Einordnung, Sachverhalt,
Rechtsfrage(n), typischerweise einschlägige Normen (als Prüfhinweis gekennzeichnet), Würdigung,
konkreter Schreiben-/Gesuchsentwurf, nächste Schritte, Fristenwarnung wo relevant, Haftungs-Fusszeile.

**Erzeugt mit:** `../scripts/generate_examples.py` (Python + reportlab). Zum Neu-Generieren:
```bash
cd mein-anwalt && python3 scripts/generate_examples.py
```

**Nächster Schritt:** Für die restlichen 70 Dokumenttypen fehlen noch eigene Beispiel-PDFs — auf
Wunsch als weitere Charge nachziehbar, priorisiert nach den in
`dokumentenpalette-strategie.md` als "gewählt" markierten Dokumenten.
