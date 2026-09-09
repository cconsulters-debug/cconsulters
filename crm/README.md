# Steuer-CRM (privat) – Kundendaten, Dokumenten-Konverter, Checklisten

Ein einziges HTML-File: `crm/index.html`. Kein Server, keine Installation, keine Cloud-Pflicht.
Alle Kundendaten bleiben in **deinem Browser** (IndexedDB) – auf Wunsch AES-256-verschlüsselt.
Optional zuschaltbar: Gmail-Versand, Beleg-Import aus Gmail und Ende-zu-Ende-verschlüsselte
Synchronisation über mehrere Geräte.

---

## 1. In 60 Sekunden starten

**Variante A – lokal** (für Erfassung und Ablage; ohne Scan-Erkennung, ohne Gmail/Sync)
1. Datei `crm/index.html` auf den Rechner kopieren (z. B. nach `Dokumente/Steuer-CRM/`).
2. Doppelklick → öffnet im Browser. **Chrome oder Edge verwenden** (Firefox blockiert die lokale Datenbank bei `file://`).
3. Lesezeichen setzen.

**Variante B – über die eigene Domain** (empfohlen: nötig für Scan-Erkennung, Gmail und Synchronisation)
Nach dem Deploy erreichbar unter `https://<deine-domain>/crm/`. Die Seite ist auf `noindex` gesetzt und
in `robots.txt` gesperrt; die Daten liegen weiterhin im Browser, nicht auf dem Server.

> Ohne aktivierte Synchronisation gilt: zwei Geräte = zwei getrennte Datenbestände (Abschnitt 6b).

---

## 2. Ersteinrichtung (einmalig, 5 Minuten)

1. **Einstellungen & Backup** öffnen → Kanzlei, Bearbeiter/in, E-Mail, Telefon, Standard-Steuerjahr, Standardfrist eintragen → Speichern.
   → Diese Angaben füllen automatisch alle E-Mail-Vorlagen.
2. **Einstellungen → Sicherheit → Verschlüsselung aktivieren** (Passwort vergeben) und den
   **Wiederherstellungsschlüssel ausdrucken**. Bei echten Kundendaten nicht optional.
3. **Kunden → + Neuer Kunde** → Stammdaten erfassen.
4. Im Block **Steuerprofil** ankreuzen, was auf den Kunden zutrifft (Wertschriften, Säule 3a, Kinder, Wohneigentum …).
   → **Das ist der wichtigste Schritt:** aus diesen Häkchen entsteht die komplette Checkliste und die Registerstruktur.

---

## 3. Der Arbeitsablauf pro Mandat

| Schritt | Wo | Ergebnis |
|---|---|---|
| 1. Kunde + Profil erfassen | Kunden | Checkliste entsteht automatisch |
| 2. Unterlagen anfordern | E-Mail-Vorlagen → „Unterlagen anfordern" | E-Mail mit den offenen Punkten, in Gmail geöffnet |
| 3. Belege ablegen | Dokumenten-Konverter (Drag & Drop) | Erkennung, Umbenennung, Register-Zuordnung |
| 4. Fortschritt prüfen | Dossier & Checkliste | erledigte Punkte haken sich selbst ab |
| 5. Dossier abgeben | Dossier → ZIP-Export | sortierter Ordner + Inhaltsverzeichnis |
| 6. Status pflegen | Dossier → Status | Übersicht zeigt alle Mandate im Blick |

---

## 4. Dokumenten-Konverter: was er macht

Beim Hineinziehen einer Datei passiert dreierlei:

1. **Erkennen** – Dateiname **und PDF-Inhalt** werden nach Stichwörtern durchsucht. Die Textextraktion
   ist fest eingebaut und läuft **ohne Internet** – ein Beleg namens `Scan_0007.pdf` wird am Inhalt als
   Lohnausweis erkannt, samt Steuerjahr. Lange Stichwörter gewinnen gegen kurze („Lohnausweis" schlägt
   „Ausweis"). Unsichere Treffer bekommen den Hinweis **„bitte prüfen"** – ein Klick im Dropdown korrigiert sie.
2. **Umbenennen** nach festem Schema:
   `Jahr_Register_Ziffer_Dokumenttyp_Kunde_Nr.pdf`
   Beispiel: `2024_02_1.1_Lohnausweis-Haupterwerb_Mueller-Anna_01.pdf`
3. **Einsortieren** in die Register des Steuerdossiers (Aufbau der Steuererklärung Kanton Zürich):

| Reg. | Inhalt | Ziffern |
|---|---|---|
| 00 | Steuererklärung & Formulare, Vollmacht, Zugangsdaten | – |
| 01 | Personalien & Familienverhältnisse | Seite 1 |
| 02 | Einkünfte (Lohn, Renten, Taggelder, Wertschriftenertrag) | 1–7 |
| 03 | Abzüge (Schuldzinsen, Alimente, Säule 3a, PK-Einkauf) | 11–18 |
| 04 | Einkommensberechnung (Spenden, Krankheitskosten, Kinderbetreuung) | 19–27 |
| 05 | Vermögen (Rückkaufswerte, Fahrzeuge, Schulden, Erbschaft) | 30–37 |
| 06 | Wertschriften- & Guthabenverzeichnis (Konti, Depot, Krypto) | 30.1 |
| 07 | Berufsauslagen (Hilfsformular: Fahrkosten, Verpflegung, Weiterbildung) | 11 |
| 08 | Versicherungsprämien (Hilfsformular) | 15 |
| 09 | Liegenschaften (Eigenmietwert, Hypothek, Unterhalt) | 7 / 12 / 17 |
| 10 | Aufstellungen & Bemerkungen | – |
| 11 | Korrespondenz Steueramt (Fristerstreckung, Veranlagung) | – |
| 99 | Unklar – manuell zuordnen | – |

**ZIP-Export** erzeugt genau diese Ordnerstruktur plus `00_Inhaltsverzeichnis.txt`
(Deckblatt, Dokumentenliste je Register, offene Checklistenpunkte).

### Andere Kantone

Die mitgelieferten **Ziffern** stammen aus der Steuererklärung **Kanton Zürich**. Beim Kunden wird der
Kanton hinterlegt; für jeden weiteren Kanton erfasst du die Ziffern einmalig unter
*Einstellungen → Kantons-Profile* („Zürcher Ziffern als Startwert übernehmen" spart Tipparbeit).
Register, Checklisten und Dateinamen richten sich danach automatisch nach dem Kanton des Kunden.
Profile lassen sich exportieren und einlesen – so gibst du ein fertiges Kantonspaket an weitere
Installationen (oder Kunden) weiter. Ohne hinterlegtes Profil erscheint schlicht keine Ziffer;
es werden **keine Ziffern erfunden**.

---

## 5. Checklisten

- Werden aus dem **Steuerprofil** erzeugt – nichts von Hand anlegen.
- Ein Punkt hakt sich **automatisch** ab, sobald ein passendes Dokument im Dossier liegt.
- Zusätzlich pro Punkt möglich: manuell abhaken, „nicht nötig" setzen, Notiz hinterlegen.
- „+ Eigener Punkt" für Sonderfälle.

### Checkliste weitergeben – vier Wege

| Knopf | Ergebnis | Wofür |
|---|---|---|
| **Drucken / PDF** | eigenständiges A4-Blatt mit Kanzleikopf, Kundendaten, Frist, Kästchen zum Ankreuzen | dem Kunden mitgeben oder als PDF anhängen |
| **Ansicht: Register / Kundensicht** | schaltet die Checkliste am Bildschirm um | intern nach Registern arbeiten, Kundensicht kontrollieren |
| **Text (.txt)** | dieselbe Liste als Datei mit `[x] / [ ] / [–]` | E-Mail-Anhang, Ablage, Weiterverarbeitung |
| **Excel (.csv)** | eine Zeile je Unterlage mit Register, Ziffer, Status, Notiz | Auswertung über alle Mandate, Excel-Filter |
| **Offene Punkte kopieren** | nur die fehlenden Punkte in der Zwischenablage | WhatsApp, Telefonnotiz |

Zusätzlich: **Per E-Mail** springt direkt in die Vorlage „Unterlagen anfordern" mit den offenen
Punkten im Text, und jeder **ZIP-Export** des Dossiers enthält die Checkliste als `00_Checkliste.txt`.

**Zwei Sichten auf dieselbe Liste:**

- **Register 00–11** (Standard am Bildschirm) folgen dem Aufbau der Steuererklärung und steuern die
  Dokumentenablage sowie die Ordner im ZIP.
- **Kundensicht** – Einkommen · Wertschriften & Vermögen · Abzüge · Schulden · Liegenschaften ·
  Weiteres – ist die Gliederung, die Kundinnen und Kunden von einer Unterlagenliste kennen.
  **Alles, was den Kunden erreicht** (Ausdruck/PDF, Text, CSV, E-Mail), ist so gegliedert;
  am Bildschirm schaltest du mit einem Klick um.

Im Druck erscheint nur das Checklistenblatt – keine Knöpfe, keine Navigation, keine Dokumentenliste.

---

## 6. E-Mail-Verknüpfung

Fünf Vorlagen: Unterlagen anfordern · Erinnerung · Entwurf zur Freigabe · Bestätigung Einreichung · Honorarrechnung.
Die offenen Checklistenpunkte werden automatisch in den Text eingesetzt.

**Ohne Einrichtung (funktioniert sofort):**
- **„In Gmail öffnen"** – öffnet dein Gmail mit fertigem Entwurf (Empfänger, Betreff, Text).
- **„Mailprogramm"** – `mailto:` für Outlook / Apple Mail. **„Text kopieren"** – für alles andere.

**Mit Gmail-Anbindung** (eigene Google-Client-ID, Anleitung in `SETUP-GMAIL.md`):
- **„Direkt über Gmail senden"** – versendet aus dem CRM, auf Wunsch **mit Dossier-ZIP im Anhang**;
  der Dossier-Status springt automatisch auf *angefordert*.
- **Konverter → „Belege aus Gmail holen"** – durchsucht die Mails des Kunden der letzten 12 Monate
  nach Anhängen, du wählst aus, das CRM erkennt und sortiert sie ein. Das spart pro Mandat den
  gesamten Download-und-Umbenennen-Schritt.

Das CRM verschickt nie etwas ohne Klick, und ohne Gmail-Anbindung hat es **keinerlei** Zugriff auf dein Postfach.

## 6a. Sicherheit: Passwortschutz und Verschlüsselung

*Einstellungen → Sicherheit → Verschlüsselung aktivieren.* Danach gilt:

- Alle Kundendaten **und alle Belege** liegen AES-256-verschlüsselt in der Browser-Datenbank.
  Wer die Datenbank ausliest, sieht nur Zeitstempel und Grössen – keine Namen, keine Beträge.
- Beim Öffnen erscheint ein **Sperrbildschirm**; nach Inaktivität (Standard 15 Minuten) sperrt sich das CRM selbst.
- Beim Aktivieren erhältst du **einmalig einen Wiederherstellungsschlüssel** (`ABCDE-FGHIJ-…`).
  **Ausdrucken und getrennt vom Rechner aufbewahren** – damit kommst du auch bei vergessenem
  Passwort wieder an die Daten und setzt ein neues Passwort.
- Passwort ändern, neuen Wiederherstellungsschlüssel erzeugen und Verschlüsselung wieder aufheben
  sind jederzeit möglich (alles unter *Sicherheit*).

> Passwort **und** Wiederherstellungsschlüssel verloren = Daten unwiederbringlich weg.
> Das ist kein Fehler, sondern der Zweck der Verschlüsselung.

## 6b. Synchronisation über mehrere Geräte (optional)

*Einstellungen → Synchronisation.* Setzt aktivierte Verschlüsselung voraus – hochgeladen werden
**ausschliesslich verschlüsselte Datensätze**, der Cloud-Anbieter sieht keine Inhalte.
Einrichtung mit eigenem Firebase-Projekt (Region Zürich): `SETUP-SYNC.md`.
Zweites Gerät: „Dieses Gerät mit bestehendem Konto verbinden", danach mit dem Passwort des ersten
Geräts entsperren.

## 6c. White-Label (für den Weiterverkauf)

*Einstellungen → Erscheinungsbild*: Produktname, Hauptfarbe, Akzentfarbe und Lizenzschlüssel pro
Kunde setzen – Titel, Logo-Kürzel, Navigation und Sperrbildschirm übernehmen das sofort.
*Einstellungen → Demo & Statistik → Demo-Daten laden* erzeugt drei fiktive Mandate für
Verkaufsgespräche (und entfernt sie auf Knopfdruck wieder).

## 6c1. Steuervergleich (Vorjahr / neues Jahr)

*Steuervergleich* im Menü, oder im Dossier über den Knopf „⇅ Steuervergleich".

- Stellt die Positionen beider Steuererklärungen **nebeneinander** (Ziff. 1–7, 11–18, 19–27, 30–37)
  und rechnet daraus steuerbares Einkommen, Vermögen und – im Tarifmodus – die Steuerbelastung
  in Bund, Kanton, Gemeinde und Kirche.
- **Zwei Rechenarten:** *Tarifberechnung* mit hinterlegten Tarifen (Bund und Kanton Zürich, Steuerfüsse
  je Gemeinde) oder *Grenzsatz-Schätzung*, wenn für einen Kanton kein Tarif hinterlegt ist – dort genügt
  der geschätzte Grenzsteuersatz.
- **Einzahlungen durchrechnen:** je Variante Säule 3a, PK-Einkauf oder weitere Abzüge eintragen; das CRM
  zeigt Steuerersparnis und wie viel Prozent jedes einbezahlten Frankens zurückkommen.
- **Einkauf staffeln:** vergleicht einmaligen Einkauf mit der Verteilung über mehrere Jahre und weist den
  Vorteil aus dem Progressionsbruch aus – inklusive Hinweis auf die dreijährige Sperrfrist (Art. 79b BVG).
- **Steuererklärung oder Veranlagung einlesen:** PDF hineinziehen, das CRM liest die Positionen (Scans per
  OCR), zeigt **jeden Wert mit Fundstelle im Beleg** zur Kontrolle und übernimmt nur, was du bestätigst.
  Summenzeilen werden bewusst nicht als Position gelesen. Kontrollwerte aus einer Veranlagung
  (steuerbares Einkommen/Vermögen) dienen dem **Abgleich**: Weicht die eigene Rechnung ab, steht das im Bericht.
- **Ausgabe – Standard ist beides:** Der Knopf **„Bericht erstellen (Word + PDF)"** speichert den
  Bericht in einem Durchgang als `.docx` **und** als `.pdf`. Beide Dateien haben denselben Aufbau:
  Kanzleikopf, Grundlagen, alle Tabellen, Szenarien, Staffelung, Bemerkungen und Pflichthinweise.
  Daneben gibt es „nur Word", „nur PDF" und den normalen Druck.
- Die PDF wird **direkt erzeugt** – kein Umweg über den Druckdialog, keine fremde Bibliothek, auch
  offline. Sie bringt Kopfzeile auf jeder Seite, rechtsbündige Beträge, automatischen Seitenumbruch
  und Seitenzahlen mit.

> **Vor der ersten Mandantenauswertung die Tarifwerte prüfen** (im Code unter `TARIFE`, Stand 2024).
> Tarife und Sozialabzüge ändern jährlich; die Berechnung bleibt provisorisch – massgebend ist die
> Veranlagung des Steueramts. Wer nichts pflegen will, arbeitet im Grenzsatz-Modus.

## 6d. Honorar & Rechnungen

*Honorar & Rechnungen* im Menü, oder direkt im Dossier über „+ Rechnung für <Jahr>".

- Positionen aus der **Tarifliste** (Einstellungen → Rechnungsstellung) oder frei erfassen,
  Menge × Ansatz wird gerechnet, MwSt optional.
- **Nummernkreis** frei wählbar (`R-{jahr}-{nr}`), die nächste Nummer vergibt das CRM.
- Status **Entwurf → Offen → Gemahnt → Bezahlt**; überfällige Rechnungen werden markiert.
- **Drucken / als PDF speichern** erzeugt eine saubere A4-Rechnung mit Kanzleikopf, Adresse,
  Positionen, Total, Zahlungsziel und IBAN – im Druck erscheint nur der Rechnungsbeleg.
- Die Übersicht und die Seite „Honorar & Rechnungen" zeigen **offene Forderungen**,
  überfällige Rechnungen und den bezahlten Jahresumsatz.
- Die E-Mail-Vorlage „Honorarrechnung" zieht Rechnungsnummer, Betrag und Fälligkeit automatisch.

> Schweizer QR-Rechnung ist bewusst **nicht** enthalten – eine fehlerhafte QR-Rechnung wäre schlimmer
> als keine. Die Rechnung nennt IBAN und Rechnungsnummer im Text; für Kleinmandate genügt das.
> Eine echte QR-Rechnung ist eine mögliche Ausbaustufe.

## 6e. Eingescannte Belege (OCR)

**Ziel: Du scannst, das CRM erkennt und ordnet ein – ohne Handarbeit.**

- Die Texterkennung ist **mitgeliefert** (`crm/vendor/tesseract/`, rund 5 MB) und läuft von deinem
  eigenen Server. Kein fremdes CDN, keine Daten an Dritte, kein 15-MB-Download beim ersten Mal.
- Sie ist **standardmässig eingeschaltet**: Enthält ein PDF keine Textebene oder ist es ein Foto
  bzw. JPG/PNG, wird es automatisch gelesen, klassifiziert und einsortiert.
- Mitgelieferte Sprachen: **Deutsch und Französisch**. Italienisch/Englisch werden bei bestehender
  Internetverbindung nachgeladen.
- Ein Scan von zwei Belegen dauert wenige Sekunden.

> **Wichtig:** Die Scan-Erkennung funktioniert **nur in der gehosteten Version** (`https://…` oder
> `http://localhost`). Wird die Datei per Doppelklick geöffnet (`file://`), verbietet der Browser das
> Laden der Erkennung – das CRM sagt das dann klar an und legt den Beleg in Register 99 ab.
> **Wer regelmässig scannt, arbeitet mit der gehosteten Version.**

### Wie das Steuerjahr bestimmt wird

Aus dem **Belegtext**, nicht aus dem Dateinamen: Eine Angabe wie „Steuerperiode 2024",
„31.12.2024" oder „Lohnausweis 2024" schlägt jedes Datum. Erst danach zählen Jahreszahlen im
Dateinamen – und ein Scanner-Name wie `IMG_20250115_0001.png` wird als Datum erkannt und **nicht**
als Steuerjahr verwendet. Landen Belege in verschiedenen Jahren, sagt das CRM es und öffnet das
Dossier mit den meisten Belegen.

### Umlaute und Schreibweisen

Erkennung und Stichwortsuche laufen normalisiert: „Prämienbescheinigung", „Praemienbescheinigung"
und ein vom Scanner falsch gelesenes „Pramienbescheinigung" führen zum selben Ergebnis.

## 7. Datensicherung – bitte ernst nehmen

Ohne Synchronisation liegen die Daten nur in diesem Browser. **Browserdaten löschen = CRM leer.**

- **Einstellungen → Backup exportieren (Stammdaten)**: Kunden, Dossiers, Checklisten, Dokumentenliste. Klein, monatlich machen.
- **Backup inkl. Dateien**: zusätzlich alle abgelegten Belege (wird gross, dafür vollständig). Vor jedem Gerätewechsel.
- **Backup einlesen** stellt alles wieder her (auch auf einem neuen Rechner).
- Bei aktivierter Verschlüsselung wird das Backup mit einem eigenen Passwort geschützt, das du beim
  Export festlegst – notiere es zusammen mit dem Wiederherstellungsschlüssel.

Backups auf einer verschlüsselten Festplatte oder einem verschlüsselten USB-Stick ablegen – sie enthalten Kundendaten.

---

## 8. Grenzen und Ausbaustufen

**Enthalten und einsatzbereit:** Inhaltserkennung von PDFs ohne Internet · mitgelieferte Scan-Erkennung (OCR) ·
Kantons-Profile · Steuervergleich mit Word-Bericht · Honorar und Rechnungen ·
lokale Verschlüsselung mit Sperrbildschirm und Wiederherstellungsschlüssel · verschlüsselte Backups ·
Gmail-Versand und Beleg-Import · Ende-zu-Ende-verschlüsselte Cloud-Synchronisation · White-Label · Demo-Modus.

| Nächste Ausbaustufe | Aufwand | Vorteil |
|---|---|---|
| Schweizer QR-Rechnung im Rechnungsdruck | 2–3 Tage | Zahlung per Banking-App scannbar |
| Mehrseitige Scans automatisch in Einzelbelege trennen | 2–3 Tage | ein Stapel-Scan wird zu mehreren Dokumenten |
| Direkter Import in ZHprivateTax / eTax | offen – Schnittstelle prüfen | Doppelerfassung entfällt |
| Mehrbenutzerbetrieb mit Rollen | 3–5 Tage | Kanzleien ab 3 Personen |
| Tarife weiterer Kantone im Steuervergleich | ½ Tag pro Kanton | Tarifberechnung ausserhalb ZH |

**Bekannte Grenzen heute:**
- Die Scan-Erkennung braucht die gehostete Version; bei einer per Doppelklick geöffneten Datei
  zählt bei Bildern nur der Dateiname (das CRM weist darauf hin).
- Sehr schlechte Scans (schief, unscharf, unter 200 dpi) werden schlechter gelesen – 300 dpi
  Graustufen ist die sichere Einstellung am Scanner.
- Sehr exotisch eingebettete Schriften können unlesbaren Text liefern; mit Internetverbindung
  springt automatisch pdf.js als Reserve ein.
- Gmail und Synchronisation funktionieren nur über `https://` oder `http://localhost`, nicht bei
  lokal geöffneten Dateien (`file://`). Rein lokaler Betrieb bleibt ohne diese beiden Funktionen möglich.
- Keine Steuerberechnung: Zahlen erfasst du weiterhin in der offiziellen Steuersoftware.
- Kein gleichzeitiges Arbeiten zweier Geräte am selben Mandat (der spätere Speichervorgang gewinnt).

## 9. Weiterverkauf

| Dokument | Inhalt |
|---|---|
| `VERKAUF.md` | Positionierung, Zielkunden, Preise, Gesprächsleitfaden, Auslieferungs-Checkliste |
| `../steuer-crm/index.html` | fertige Verkaufs-Landingpage mit echten Screenshots (nur Kontaktblock ausfüllen) |
| `LIZENZ.md` | Lizenzvertrag als Vorlage + ehrliche Einordnung zum Kopierschutz |
| `DATENSCHUTZ.md` | Rollenverteilung nach revDSG, Aufbewahrung, AVV-Muster, Textbaustein für Endkunden |
| `SETUP-GMAIL.md` / `SETUP-SYNC.md` | Einrichtungsanleitungen für die Zusatzfunktionen |
| `firestore.crm.rules` / `storage.crm.rules` | Sicherheitsregeln für die Cloud-Synchronisation |

Vor dem ersten Verkauf: Lizenz- und Datenschutzunterlagen einmalig anwaltlich prüfen lassen.
