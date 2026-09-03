# Steuer-CRM (privat) – Kundendaten, Dokumenten-Konverter, Checklisten

Ein einziges HTML-File: `crm/index.html`. Kein Server, keine Installation, keine Cloud.
Alle Kundendaten bleiben in **deinem Browser** (IndexedDB) – sie werden nie hochgeladen.

---

## 1. In 60 Sekunden starten

**Variante A – lokal (empfohlen für echte Kundendaten)**
1. Datei `crm/index.html` auf den Rechner kopieren (z. B. nach `Dokumente/Steuer-CRM/`).
2. Doppelklick → öffnet im Browser. **Chrome oder Edge verwenden** (Firefox blockiert die lokale Datenbank bei `file://`).
3. Lesezeichen setzen.

**Variante B – über die Website** (nur wenn du von mehreren Geräten arbeitest)
Nach dem Deploy erreichbar unter `https://<deine-domain>/crm/`. Die Seite ist auf `noindex` gesetzt und
in `robots.txt` gesperrt. Auch hier gilt: **Daten liegen pro Gerät im Browser**, sie synchronisieren nicht.

> Achtung: Zwei Geräte = zwei getrennte Datenbestände. Wer synchron arbeiten will, braucht die
> Ausbaustufe „Cloud" (siehe Abschnitt 7).

---

## 2. Ersteinrichtung (einmalig, 5 Minuten)

1. **Einstellungen & Backup** öffnen → Kanzlei, Bearbeiter/in, E-Mail, Telefon, Standard-Steuerjahr, Standardfrist eintragen → Speichern.
   → Diese Angaben füllen automatisch alle E-Mail-Vorlagen.
2. **Kunden → + Neuer Kunde** → Stammdaten erfassen.
3. Im Block **Steuerprofil** ankreuzen, was auf den Kunden zutrifft (Wertschriften, Säule 3a, Kinder, Wohneigentum …).
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

1. **Erkennen** – Dateiname + (bei PDF mit Internetverbindung) die ersten drei Seiten Text werden nach
   Stichwörtern durchsucht. Lange Stichwörter gewinnen gegen kurze („Lohnausweis" schlägt „Ausweis").
   Unsichere Treffer bekommen den Hinweis **„bitte prüfen"** – du korrigierst sie mit einem Klick im Dropdown.
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

---

## 5. Checklisten

- Werden aus dem **Steuerprofil** erzeugt – nichts von Hand anlegen.
- Ein Punkt hakt sich **automatisch** ab, sobald ein passendes Dokument im Dossier liegt.
- Zusätzlich pro Punkt möglich: manuell abhaken, „nicht nötig" setzen, Notiz hinterlegen.
- „+ Eigener Punkt" für Sonderfälle.
- Button **Offene Punkte kopieren** – für WhatsApp oder ein Telefonat.
- **Drucken** erzeugt eine saubere Checkliste ohne Bedienelemente.

---

## 6. E-Mail-Verknüpfung

Fünf Vorlagen: Unterlagen anfordern · Erinnerung · Entwurf zur Freigabe · Bestätigung Einreichung · Honorarrechnung.
Die offenen Checklistenpunkte werden automatisch in den Text eingesetzt.

- **„In Gmail öffnen"** – öffnet dein Gmail-Konto mit fertig ausgefülltem Entwurf (Empfänger, Betreff, Text).
  Anhänge fügst du dort an; vorher im Dossier das ZIP exportieren.
- **„Mit Mailprogramm öffnen"** – `mailto:` für Outlook / Apple Mail.
- **„Text kopieren"** – für alles andere.

Bewusst so gebaut: Das CRM verschickt **nichts** selbständig und hat **keinen** Zugriff auf dein Postfach.
Du siehst jede Mail vor dem Senden.

---

## 7. Datensicherung – bitte ernst nehmen

Die Daten liegen nur in diesem Browser. **Browserdaten löschen = CRM leer.**

- **Einstellungen → Backup exportieren (Stammdaten)**: Kunden, Dossiers, Checklisten, Dokumentenliste. Klein, monatlich machen.
- **Backup inkl. Dateien**: zusätzlich alle abgelegten Belege (wird gross, dafür vollständig). Vor jedem Gerätewechsel.
- **Backup einlesen** stellt alles wieder her (auch auf einem neuen Rechner).

Backups auf einer verschlüsselten Festplatte oder einem verschlüsselten USB-Stick ablegen – sie enthalten Kundendaten.

---

## 8. Grenzen und Ausbaustufen

| Ausbaustufe | Aufwand | Vorteil |
|---|---|---|
| **Heute:** lokal, ein Gerät, manuelle Backups | 0 | maximale Datenhoheit, keine Kosten, offline nutzbar |
| Passwortschutz + Verschlüsselung der lokalen Datenbank | ca. ½ Tag | schützt bei Diebstahl/geteiltem Rechner; Passwort vergessen = Daten weg |
| Cloud-Synchronisation (z. B. Firebase, Server in CH) | 1–2 Tage + laufende Kosten | mehrere Geräte, automatische Backups; Kundendaten liegen beim Anbieter → Auftragsverarbeitungsvertrag nötig |
| Gmail-API-Anbindung (Mails automatisch senden, Anhänge aus Kundenmails direkt einlesen) | 1–2 Tage + Google-Cloud-Projekt | Belege landen ohne Handarbeit im Dossier |
| Direkter Import in ZHprivateTax / eTax | offen | Doppelerfassung entfällt (offizielle Schnittstelle prüfen) |

**Bekannte Grenzen heute:**
- PDF-Inhaltserkennung braucht Internet (lädt pdf.js). Ohne Internet greift die Erkennung nur über den Dateinamen.
- Gescannte PDF ohne Textebene (reines Bild) werden nicht inhaltlich gelesen – dort zählt der Dateiname.
- Keine Steuerberechnung: Zahlen erfasst du weiterhin in der offiziellen Steuersoftware.
