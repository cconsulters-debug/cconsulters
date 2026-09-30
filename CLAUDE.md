# Projekt: Steuer-CRM (C Consulters)

Die App ist eine einzelne Datei: `crm/index.html` (reines Browser-JavaScript, keine Build-Schritte).
Auslieferung: Branch `claude/private-tax-crm-iyy00a` → GitHub Action → Branch `crm-live` → Netlify.

## Sortieren und Bezeichnen der Steuerdokumente – verbindlich

**Vor jeder Änderung am Konverter oder an der Benennung `crm/Steuerdokumente-sortieren.md` lesen
und befolgen.** Diese Datei ist die Anweisung der Kundin; sie kann sie jederzeit ändern.

Das Zielformat der Dateinamen ist durch bereits sortierte Kundenordner belegt (Referenz):

```
0 Zugangsdaten Online-Steuererklärung 2025 - Mike Münzner
1 Einkommen - Lohnausweis 1 - Mike Münzner - SV (Schweiz) AG - 01.01.-31.12.2025 - Nettolohn 48316
1 Einkommen - Lohnausweis 2 - Mike Münzner - Universitätsklinik Balgrist - 16.06.-31.12.2025 - Nettolohn 1355
1 Einkommen - Lohnausweis 3 - Mike Münzner - Coople (Schweiz) AG - 11.04.-03.12.2025 - Nettolohn 3363
2 Wertschriften - Mike Münzner - UBS Privatkonto CH23 0029 1291 8175 3740 M - Saldo -298.60, Zins 2.85, Kosten 39.00
2 Wertschriften - Mike Münzner - UBS Sparkonto CH12 0029 1291 8175 37M1 D - Saldo 0.10
3 Abzüge - Alimente Unterhaltsbeiträge - Mike Münzner (für Lea Barbara Maurer) - 3000.00
3 Abzüge - Krankenkasse - Mike Münzner - Concordia - Prämien 6011.40, Krankheitskosten 357.25
4 Schulden - Mike Münzner - UBS Kartenkonto - Schuld 2866.18, Schuldzinsen 359.91
```

Daraus abgeleitete Regeln (umgesetzt in `BEZ`, `KAT_TITEL`, `KAT_DATEI`, `bezTeile`, `buildName`):

- `<Nr> <Kategorie> - <Titel>[ <Nr>] - <Vorname Name> - <Institut Kontoart IBAN> - <Zeitraum> - <Beträge>`
- Kategorienamen im Dateinamen: Einkommen, Wertschriften, Abzüge, Schulden, Liegenschaften, Weiteres.
- Konten (Kat. 2) und Schulden (Kat. 4) ohne eigenen Titel; Institut, Kontoart und IBAN (in
  Vierergruppen) bilden einen Teil.
- Beträge ohne «CHF» und ohne Tausender-Apostroph, mit Rappen; Nettolohn in ganzen Franken;
  Saldo mit Vorzeichen. Mehrere Beträge in einem Teil, durch Komma getrennt.
- Personen als «Vorname Name»; Alimente mit «(für <Empfänger/in>)».
- Mehrere Lohnausweise pro Person: «Lohnausweis 1, 2, 3 …», je ein eigenes PDF.
- Lohnausweis Punkt F/G: erscheint im Namen nur, wenn angekreuzt («F mit X») – so wie in der Referenz.
- «Neutral» (Liegenschaften): nur Über-Titel, ohne Personennamen.

Bei Abweichungen zwischen Anweisung und Referenz: nachfragen, nicht raten.

## Tests

Browser-Tests laufen mit Playwright (Chromium unter `/opt/pw-browsers`). Nach Änderungen am
Konverter mindestens einen Stapel-Scan mit Duplikaten, Leerseite und mehreren Lohnausweisen prüfen.
