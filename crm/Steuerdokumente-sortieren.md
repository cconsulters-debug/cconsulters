# Anweisungen: Steuerdokumente sortieren (C Consulters)

Diese Datei enthält die Regeln zum Sortieren gescannter/gelieferter Kundendokumente.
**Du (Claude) liest und befolgst diese Datei automatisch.** Der Kunde kann sie jederzeit
in einem Texteditor bearbeiten, um die Regeln zu ändern.

## Ziel / Ablauf
- Eingang: ein gescanntes Kunden-PDF **oder** mehrere Einzeldateien im Kundenordner
  unter `AA Kundenscans\<Kunde>\`.
- Jedes Dokument als **einzelnes benanntes PDF** speichern, in den Unterordner
  `Sortiert - <Kunde>`, und zusätzlich in eine ZIP `<Kunde>.zip` im Kundenordner packen.
- Umlaute in Dateinamen sind erlaubt. Auf Pfadlänge (< 260 Zeichen) achten.
- **Duplikate** (identische Dateien / gleiche Rechnungsnummer) nur einmal aufnehmen.
- **Leere Scan-Seiten** weglassen.
- **Mehrseitige Belege** (z.B. Lohnausweis + Zusatzblatt, Bestätigung + Detailliste)
  zu EINEM PDF zusammenfassen.
- Deckblatt „Zugangsdaten Online-Steuererklärung" gehört in keine Rubrik →
  separates PDF `0 Zugangsdaten Online-Steuererklärung <Jahr> - <Name>`.
- Nach dem Erstellen: kurze Übersicht + Hinweise auf Auffälligkeiten / fehlende Belege.

## Namensschema je Kategorie (Präfix = Kategorienummer)

### 1. Einkommen
- **Lohnausweis:** Name Person + Arbeitgeber + Gültigkeitsdatum (von.-bis.JJJJ) + Nettolohn + mit oder ohne ( X ) bei Punkt F (Unentgeltliche Beförderung) + mit oder ohne ( X ) bei Punkt G (Kantinenverpflegung)
  Bei mehreren Lohnausweisen pro Person mit 1, 2, 3 … nummerieren.
- **Ersatzeinkünfte** (Taggelder IV/ALV/Unfall/Krankheit, Mutterschaft): Name Person.
- **AHV-/IV-/Pensionskassen-Rentenbescheinigung:** Name Person (+ Betrag).
- **Nebenerwerb / Verwaltungsratshonorare / Erwerbsausfall:** Name Person.

### 2. Wertschriften / Vermögen
- **Konten** (Zins-/Saldobescheinigungen Bank & Post, 31.12.): Name Person, Institut,
  IBAN + **Saldo, Zins, Kosten**.
- **Krypto-Bestände** (31.12.): Name Person.
- **Darlehen / Beteiligungen / Lebensversicherung (Rückkaufswert):** Name Person +
  Versicherer/Institut, Höhe der Schuld am 31.12. + bezahlte Zinsen.

### 3. Abzüge
- **Säule 3a** (gebundene Vorsorge): Name Person + Versicherer + Höhe des Abzugs.
- **Einkauf Pensionskasse (2. Säule):** Name Person + Versicherer + Höhe des Einkaufs.
- **Krankenkassen-Prämien & Police:** Name Person + Höhe der Jahresprämien.
- **Krankheits- & Unfallkosten (selbst getragen):** Name Person + Höhe;
  wenn nicht zuordenbar als „Krankheitskosten" bezeichnen.
- **Berufsauslagen** (ÖV-Abo/Fahrtkosten, ausw. Verpflegung): als „Fahrtkosten"
  bezeichnen, Name Person. Monatliche ÖV-Abo-Rechnungen zu einem PDF zusammenfassen
  (nur Rechnungsseite), Jahrestotal im Namen.
- **Weiterbildungskosten:** Name Person + Höhe; sonst als „Weiterbildung" bezeichnen.
- **Spendenbescheinigungen:** mit Gesamtspenden.
- **Mitgliederbeiträge politische Parteien:** als „Mitgliederbeiträge" + Gesamtbetrag.
- **Kinderbetreuung (Kita, Tagesmutter):** als „Kita" bezeichnen + Höhe der Beiträge.
- **Alimente / Unterhaltsbeiträge:** Höhe der Alimente/Unterhaltsbeiträge.

### 4. Schulden
- **Schuldenverzeichnis & Schuldzinsen** (Kredite, Hypotheken, Kreditkarten) per 31.12.:
  Institut + Schuld + Schuldzinsen. Kreditkarten-/Kontosaldi „zu Gunsten der Bank /
  a nostro favore / en notre faveur" = Schulden.

### 5. Liegenschaften
- **Eigenmietwert / Mieteinnahmen:** Neutral.
- **Hypothekarzinsbescheinigung:** Name Institut / IBAN + Schuld + bezahlte Hypothekarzinsen.
- **Belege Unterhalts- & Renovationskosten:** Neutral (auch ausländische Liegenschaften,
  z.B. Kondominiums-/Verwalter-Belege).
- **Liegenschaftssteuer / Nebenkosten:** Name Institut / IBAN.

### 6. Weiteres
- Eigenmietwert / Mieteinnahmen: gemäss Beschreibung.
- Hypothekarzinsbescheinigung: Schuld am 31.12. + bezahlte Zinsen.
- Belege Unterhalts- & Renovationskosten: Neutral.
- Liegenschaftssteuer / Nebenkosten: Name Institut / IBAN.

## Hinweis
„Neutral" bedeutet: nur als Über-Titel (ohne Personennamen) bezeichnen.
