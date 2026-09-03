# Gmail-Anbindung einrichten (einmalig, ca. 20 Minuten)

Damit kann das CRM **direkt senden** (inkl. Dossier-ZIP als Anhang) und **Anhänge aus Kundenmails**
in den Konverter laden. Ohne diese Einrichtung funktioniert weiterhin alles über
„In Gmail öffnen" / „Mailprogramm" – nur eben mit einem Klick mehr.

> **Voraussetzung:** Das CRM muss über `https://…` (deine Domain) oder `http://localhost` laufen.
> Google verweigert die Anmeldung bei lokal geöffneten Dateien (`file://`).

## Schritt für Schritt

1. **Google-Cloud-Projekt anlegen** → [console.cloud.google.com](https://console.cloud.google.com) →
   oben Projektauswahl → „Neues Projekt" → Name z. B. `steuer-crm` → erstellen.
2. **Gmail API aktivieren** → „APIs & Dienste" → „Bibliothek" → „Gmail API" suchen → **Aktivieren**.
3. **OAuth-Zustimmungsbildschirm** → „APIs & Dienste" → „OAuth-Zustimmungsbildschirm":
   - Nutzertyp **Extern** (bei Google Workspace: **Intern**, dann entfällt die Verifizierung)
   - App-Name, Support-E-Mail, Entwickler-E-Mail ausfüllen
   - **Bereiche (Scopes) hinzufügen:** `gmail.send` und `gmail.readonly`
   - Bei „Extern": unter **Testnutzer** die eigene Gmail-Adresse eintragen
     (dann läuft die App im Testmodus – für den Eigengebrauch ausreichend; das Token muss
     alle 7 Tage erneuert werden. Wer das nicht will, lässt die App von Google verifizieren
     oder nutzt Workspace/Intern.)
4. **Client-ID erstellen** → „Anmeldedaten" → „Anmeldedaten erstellen" → **OAuth-Client-ID** →
   Typ **Webanwendung**:
   - **Autorisierte JavaScript-Quellen:** exakt die Adresse, unter der das CRM läuft,
     z. B. `https://crm.deine-domain.ch` (und optional `http://localhost:8080` zum Testen)
   - Weiterleitungs-URIs braucht es **nicht**
   - Erstellen → Client-ID kopieren (endet auf `.apps.googleusercontent.com`)
5. **Im CRM eintragen** → *Einstellungen → Gmail-Anbindung* → Client-ID einfügen →
   **Verbindung testen** → Google-Fenster bestätigen. Steht dort „Verbindung steht", ist alles bereit.

## Nutzung

- **E-Mail-Vorlagen → „Direkt über Gmail senden"** – optional mit Häkchen „Dossier-ZIP anhängen".
  Die Mail landet in deinem Gmail-Ordner „Gesendet"; der Dossier-Status springt auf *angefordert*.
- **Konverter → „Belege aus Gmail holen"** – sucht Anhänge in Mails der Kundenadresse
  (letzte 12 Monate), du wählst aus, das CRM erkennt und sortiert sie automatisch ein.

## Typische Fehler

| Meldung | Ursache / Lösung |
|---|---|
| „redirect_uri_mismatch" / „origin not allowed" | Die Adresse in **Autorisierte JavaScript-Quellen** stimmt nicht exakt (https, kein Schrägstrich am Ende). |
| „Google erlaubt die Anmeldung nur über https" | Datei wurde lokal geöffnet (`file://`) – gehostete Version verwenden. |
| „Zugriff blockiert: App nicht verifiziert" | Eigene Adresse als **Testnutzer** eintragen, oder Workspace-intern veröffentlichen. |
| Anmeldung läuft nach 7 Tagen ab | Normal im Testmodus – „Verbindung testen" erneut klicken oder App verifizieren lassen. |
