# Verkaufsleitfaden: Steuer-CRM als Produkt

Kurz und umsetzbar. Reihenfolge = Reihenfolge des Tuns.

---

## 1. Was du eigentlich verkaufst

Nicht „ein CRM" – davon gibt es hunderte. Du verkaufst:

> **„Vom Belegchaos zum sortierten Steuerdossier – ohne dass Kundendaten die Kanzlei verlassen."**

Drei Argumente, die im Verkaufsgespräch tragen:

1. **Zeit:** Belege sortieren und benennen fällt weg (realistisch 15–30 Min. pro Mandat) – das CRM
   liest den Inhalt der PDFs, auch wenn die Datei `Scan_0007.pdf` heisst.
2. **Datenhoheit:** läuft lokal, verschlüsselt, keine Cloud-Pflicht – das Gegenargument gegen jedes
   US-SaaS-Angebot, und für Treuhänder das stärkste Argument überhaupt.
3. **Kein Projekt:** eine Datei, Doppelklick, keine IT, keine Migration, keine Schulungswoche.

## 2. Zielkunden (in dieser Reihenfolge ansprechen)

| Segment | Warum es passt | Wo finden |
|---|---|---|
| Einzeltreuhänder, 50–300 Privatmandate | grösster Schmerz, schnellste Entscheidung | Treuhand-Kammer-Verzeichnisse, lokale Netzwerke, Google Maps |
| Kleine Treuhandbüros (2–5 Personen) | brauchen Sync, zahlen mehr | wie oben, plus Empfehlungen |
| Steuerberatung im Nebenerwerb | preissensibel, aber viele | Facebook-/LinkedIn-Gruppen, Gewerbevereine |
| Buchhaltungsbüros mit Steuermandaten | Zusatzgeschäft | Kaltakquise mit Demo |

**Nicht** Zielkunde: grosse Kanzleien mit bestehender Software (Abacus, Dr. Tax) – dort verkaufst du
höchstens die Dokumentensortierung als Ergänzung.

## 3. Preisgestaltung (Schweizer Markt, Richtwerte)

| Paket | Inhalt | Preis |
|---|---|---|
| **Basis** | Lizenz, eigenes Branding, Einrichtung per Videocall (1 Std.), Handbuch | **CHF 890** einmalig |
| **Plus** | Basis + Gmail-Anbindung eingerichtet + Cloud-Sync eingerichtet | **CHF 1'490** einmalig |
| **Wartung** | Updates, neue Steuerperiode, 4 Supportanfragen/Jahr | **CHF 240/Jahr** |
| **Rechnungsmodul** | im Preis enthalten: Tarifliste, MwSt, Nummernkreis, Rechnungsdruck | – |
| **Kantonspaket** | Ziffern eines weiteren Kantons erfasst und geprüft | **CHF 290** einmalig |
| **Anpassung** | eigene Register, Sonderwünsche | **CHF 140/Std.** |

Rechnung für den Kunden: 20 Minuten pro Mandat × 150 Mandate = 50 Stunden pro Jahr. Bei einem
Stundenansatz von CHF 120 sind das CHF 6'000 – das Paket amortisiert sich im ersten Monat der Saison.
**Diese Rechnung gehört in jedes Angebot.**

## 4. Verkaufsgespräch (20 Minuten, erprobter Ablauf)

1. **Frage statt Pitch:** „Wie kommen die Belege heute bei Ihnen an – und wer benennt sie?"
2. **Demo-Daten laden** (Einstellungen → Demo-Daten) → Übersicht mit drei Mandaten zeigen.
3. **Der Moment, der verkauft:** Belege in den Konverter ziehen – am besten **frisch eingescannt**
   mit Namen wie `IMG_20250115_0001.png`, damit sichtbar wird, dass der **Inhalt** gelesen wird und
   nicht der Dateiname. Zusehen, wie sie erkannt, umbenannt und einsortiert werden; danach ZIP
   exportieren und den Ordner öffnen. Das ist der Moment, in dem Treuhänder nicken.
4. **Checkliste zeigen:** Profil ankreuzen → Checkliste entsteht → „Unterlagen anfordern" → fertige
   E-Mail mit genau den fehlenden Punkten.
5. **Sicherheit:** Verschlüsselung aktivieren, sperren, entsperren. Ein Satz: „Ihre Daten verlassen
   dieses Gerät nur, wenn Sie es wollen."
6. **Abrechnung zeigen:** aus dem Dossier heraus eine Rechnung erzeugen, Position aus der Tarifliste
   wählen, drucken. Treuhänder erkennen dort sofort, dass die Saison damit vollständig abgedeckt ist.
6. **Abschluss:** „Soll ich es Ihnen bis Freitag mit Ihrem Logo und Ihren Farben einrichten?"

**Vor der Demo immer:** Demo-Daten laden, echte Kundendaten vorher entfernen oder ein separates
Browserprofil verwenden.

## 5. Auslieferung an einen Kunden (Checkliste)

- [ ] Ordner `crm/` kopieren, `index.html` bleibt unverändert
- [ ] Beim Kunden: *Einstellungen* → Kanzlei, Bearbeiter, E-Mail, Telefon, Standardjahr, Frist
- [ ] *Erscheinungsbild*: Produktname, Haupt-/Akzentfarbe, Lizenzschlüssel `[Kundenkürzel]-[Jahr]-[Nr]`
- [ ] **Verschlüsselung aktivieren**, Wiederherstellungsschlüssel ausdrucken und übergeben lassen
- [ ] Automatische Sperre auf 15 Minuten
- [ ] Erstes Backup gemeinsam exportieren – und zeigen, wo es liegt
- [ ] Optional: Gmail (`SETUP-GMAIL.md`) und Sync (`SETUP-SYNC.md`) einrichten
- [ ] `README.md` ausgedruckt oder als PDF übergeben
- [ ] Lizenzvertrag (`LIZENZ.md`) unterschrieben, Rechnung gestellt
- [ ] Termin für Folgetermin nach 2 Wochen setzen (macht aus Käufern Referenzen)

## 6. Was du vor dem ersten Verkauf noch erledigen musst

1. **Lizenzvertrag und Datenschutzunterlagen anwaltlich prüfen lassen** (einmalig, ca. CHF 500–900).
2. **Eigene Mandate 2–3 Wochen damit führen** – jede Rückfrage aus der Praxis macht das Produkt besser
   und liefert dir die Sätze für das Verkaufsgespräch.
3. **Referenzkunde:** die erste Lizenz stark vergünstigt gegen ein schriftliches Testimonial.
4. **Landingpage** – ist fertig: `steuer-crm/index.html` mit echten Screenshots, Preisen und FAQ.
   Vor dem Veröffentlichen nur den Block `KONTAKT` am Ende der Datei ausfüllen (Firma, E-Mail, Telefon).
   Die Seite ist indexierbar; die App selbst (`/crm/`) bleibt auf `noindex`.

## 7. Ehrliche Grenzen – im Gespräch offen nennen

Das schafft Vertrauen und verhindert Reklamationen:

- Keine Steuerberechnung und keine Übermittlung ans Steueramt – die Zahlen werden weiterhin in
  ZHprivateTax/eTax erfasst.
- Mitgeliefert sind die Ziffern des Kantons Zürich. Andere Kantone werden im CRM erfasst
  (Einstellungen → Kantons-Profile) – als Kantonspaket verkaufbar; erfundene Ziffern gibt es nicht.
- Die Scan-Erkennung ist mitgeliefert und läuft auf dem Server des Kunden, aber nur in der
  gehosteten Version – bei einer lokal geöffneten Datei erkennt das CRM nur digitale PDF.
  Deshalb gehört das Hosting in jedes Angebot (Paket Plus).
- Kein Mehrbenutzerbetrieb mit gleichzeitigem Zugriff auf dasselbe Mandat.
