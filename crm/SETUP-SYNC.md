# Synchronisation über mehrere Geräte (optional, ca. 30 Minuten)

Ohne Synchronisation liegen die Daten nur im Browser eines Geräts. Mit Synchronisation
arbeitest du auf Notebook, Büro-PC und Tablet am gleichen Bestand – und hast ein automatisches
Zweitexemplar in der Cloud.

**Sicherheitsmodell:** Das CRM lädt **ausschliesslich bereits verschlüsselte Datensätze** hoch
(AES-256-GCM, Schlüssel aus deinem Passwort). Google sieht nur Zeitstempel und Dateigrössen –
keine Namen, keine Beträge, keine Belege. Deshalb ist die Synchronisation **nur mit aktivierter
Verschlüsselung** möglich; das CRM sperrt sie sonst.

## Schritt für Schritt

1. **Firebase-Projekt** → [console.firebase.google.com](https://console.firebase.google.com) →
   Projekt erstellen (Analytics nicht nötig). **Region `europe-west6` (Zürich)** wählen – Daten bleiben in der Schweiz.
2. **Web-App hinzufügen** (`</>`-Symbol) → die angezeigte `firebaseConfig` als JSON kopieren:
   ```json
   {"apiKey":"…","authDomain":"…","projectId":"…","storageBucket":"…","messagingSenderId":"…","appId":"…"}
   ```
3. **Authentication** → Sign-in-Methode **E-Mail/Passwort** aktivieren → unter „Users" ein Konto
   für dich anlegen (dieses Login verwendest du im CRM).
4. **Firestore Database** erstellen (Region `europe-west6`) → Tab „Regeln" → Inhalt von
   `crm/firestore.crm.rules` einfügen → veröffentlichen.
5. **Storage** aktivieren → Tab „Regeln" → Inhalt von `crm/storage.crm.rules` einfügen → veröffentlichen.
6. **Im CRM** → *Einstellungen → Synchronisation*: JSON einfügen → „Konfiguration speichern" →
   E-Mail/Passwort aus Schritt 3 eintragen → **Jetzt synchronisieren**.
7. **Zweites Gerät anschliessen** – dort die Verschlüsselung **nicht** neu aktivieren, sondern:
   *Einstellungen → Synchronisation* → dieselbe Firebase-Konfiguration einfügen → speichern →
   E-Mail/Passwort eintragen → **„Dieses Gerät mit bestehendem Konto verbinden"**.
   Das CRM holt den (mit deinem Passwort geschützten) Schlüsselcontainer, sperrt sich, und du
   entsperrst mit dem Passwort von Gerät A. Danach einmal **Jetzt synchronisieren** – fertig.

> **Wichtig:** Alle Geräte verwenden dasselbe Passwort. Änderst du es auf Gerät A, wird der neue
> Schlüsselcontainer beim nächsten Abgleich übertragen; Gerät B verlangt danach das neue Passwort.

## Wie der Abgleich arbeitet

- Jeder Datensatz trägt einen Zeitstempel (`rev`). Der **neuere gewinnt** (Last-Write-Wins).
- Gelöschte Datensätze hinterlassen einen Grabstein, damit die Löschung auf allen Geräten ankommt.
- Der Abgleich läuft **auf Knopfdruck**, nicht dauernd im Hintergrund – so bleibt nachvollziehbar,
  wann Daten übertragen wurden.
- Zwei Geräte gleichzeitig am selben Mandat zu bearbeiten, sollte man vermeiden: die spätere
  Speicherung überschreibt die frühere.

## Kosten

Für eine Einzelkanzlei liegt die Nutzung praktisch immer im kostenlosen Firebase-Kontingent
(Spark). Bei vielen gescannten Belegen kann Storage kostenpflichtig werden (Blaze-Tarif,
wenige Franken pro Monat). Rechne mit ~1 GB pro 500 Dossiers mit Scans.
