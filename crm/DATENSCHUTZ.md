# Datenschutz: Was Käuferinnen und Käufer wissen müssen

> Arbeitsdokument, keine Rechtsberatung. Einmalig anwaltlich prüfen lassen.
> Massgebend: revidiertes Schweizer Datenschutzgesetz (revDSG), bei EU-Bezug zusätzlich DSGVO.

## 1. Wer ist wofür verantwortlich

| Rolle | Wer | Verantwortung |
|---|---|---|
| Verantwortliche Person | **Die Kanzlei**, die das CRM einsetzt | Rechtmässigkeit der Bearbeitung, Information der Kundschaft, Auskunftsrechte, Sicherheit |
| Softwarelieferantin | **[Deine Firma]** | Liefert das Programm; **kein Zugriff auf Daten**, kein Serverbetrieb |
| Auftragsbearbeiter | nur falls Cloud-Sync aktiv: **Google (Firebase)** | Speichert ausschliesslich verschlüsselte Datensätze |

Solange die Software rein lokal betrieben wird, gibt es **keine Datenweitergabe an Dritte** –
weder an die Lieferantin noch an einen Hoster.

## 2. Welche Daten bearbeitet werden

Personendaten der Steuerkundschaft: Name, Adresse, Geburtsdatum, AHV-Nummer, Zivilstand, Kinder,
Arbeitgeber, Einkommens- und Vermögensangaben, Belege. Das sind **besonders schützenswerte
Personendaten** im Sinne des revDSG (u. a. Gesundheitskosten). Entsprechend gilt:

- Zugriff nur für befugte Personen → **Verschlüsselung im CRM aktivieren** (Einstellungen → Sicherheit)
- Gerät mit Betriebssystem-Passwort und Festplattenverschlüsselung (BitLocker / FileVault) betreiben
- Backups nur auf verschlüsselte Datenträger; Backup-Passwort getrennt aufbewahren
- Automatische Sperre nach Inaktivität aktiviert lassen (Standard 15 Minuten)

## 3. Aufbewahrung und Löschung

Steuerunterlagen: in der Regel **10 Jahre** aufbewahren (OR 958f für Geschäftsunterlagen; für
Privatmandate vertraglich regeln). Danach Mandat im CRM löschen – die Löschung entfernt Kunde,
Dossiers und Belege; bei aktiver Synchronisation wird sie auf alle Geräte übertragen.

## 4. Cloud-Synchronisation (optional)

Wer die Synchronisation nutzt, sollte:

- die Firebase-Region **`europe-west6` (Zürich)** wählen,
- mit Google einen **Auftragsbearbeitungsvertrag** abschliessen (Google Cloud Data Processing
  Addendum – wird beim Anlegen des Projekts akzeptiert),
- im Verzeichnis der Bearbeitungstätigkeiten festhalten, dass verschlüsselte Sicherungskopien
  bei Google Cloud (Schweiz) liegen.

Da die Daten das Gerät nur **verschlüsselt** verlassen (AES-256-GCM, Schlüssel bleibt beim Kunden),
handelt es sich um eine technisch abgesicherte Auslagerung; die Verantwortung bleibt bei der Kanzlei.

## 5. Muster: Auftragsbearbeitungsvereinbarung (nur bei Support mit Dateneinsicht)

> Zwischen **[Kanzlei]** (Verantwortliche) und **[Deine Firma]** (Auftragsbearbeiterin)
>
> 1. **Gegenstand:** technische Unterstützung an der Software „[Produktname]".
> 2. **Art der Daten:** Kunden- und Steuerdaten der Verantwortlichen, inkl. besonders
>    schützenswerter Personendaten.
> 3. **Weisungsbindung:** Die Auftragsbearbeiterin bearbeitet Daten ausschliesslich auf Weisung
>    der Verantwortlichen und nur so lange, wie der Supportfall dauert.
> 4. **Vertraulichkeit:** Alle beteiligten Personen sind zur Geheimhaltung verpflichtet.
> 5. **Sicherheit:** Datenzugriff nur über verschlüsselte Verbindungen und verschlüsselte Geräte;
>    keine Kopien ausserhalb des Supportfalls.
> 6. **Unterauftragsverhältnisse:** nur mit vorgängiger schriftlicher Zustimmung.
> 7. **Rückgabe/Löschung:** Nach Abschluss werden alle erhaltenen Daten gelöscht; die Löschung
>    wird auf Verlangen bestätigt.
> 8. **Kontrolle:** Die Verantwortliche darf die Einhaltung überprüfen.

## 6. Textbaustein für die Kundschaft der Kanzlei

> „Ihre Unterlagen werden ausschliesslich zur Erstellung Ihrer Steuererklärung bearbeitet und in
> einem verschlüsselten System auf unseren eigenen Geräten gespeichert. Eine Weitergabe an Dritte
> erfolgt nur, soweit für die Einreichung bei den Steuerbehörden erforderlich oder gesetzlich
> vorgeschrieben. Sie können jederzeit Auskunft über die zu Ihnen gespeicherten Daten verlangen."
