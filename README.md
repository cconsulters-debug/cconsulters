# Abschleppdienst Kanton Zürich – Website + Lead-Pipeline

Produktionsreife Website mit automatisierter Kundenakquise-Pipeline und Admin-Dashboard für einen 24h-Abschleppdienst im Kanton Zürich.

**Stack:** Vanilla HTML/CSS/JS · Firebase (Firestore, Auth, Storage) · Netlify Functions (Node.js) · Resend (E-Mail) · Telegram Bot API · Leaflet/OpenStreetMap

---

## Architektur / Lead-Flow

```
Formular (Notfall / Kontakt / B2B)
   │
   ├─► Firestore `leads`  ──► Admin-Dashboard (/admin, Realtime, Kanban + Karte)
   │
   └─► POST /api/send-notification (Netlify Function)
          ├─► Telegram-Bot   (🚨-Formatierung bei Notfall, Inline-Buttons)
          ├─► Resend-E-Mail  (an NOTIFY_TO_EMAIL)
          └─► WhatsApp Business API (vorbereitet, TODO im Code)

Scheduled Function (alle 10 Min): /netlify/functions/escalate-leads.js
   └─► Leads mit Status "neu" > 30 Min → zweite Telegram-Nachricht "⚠️ Noch offen"

Telegram-Button "✅ Als kontaktiert markieren"
   └─► GET /api/mark-contacted (HMAC-signiert) → Status + Reaktionszeit in Firestore

GET /api/stats → Ø Reaktionszeit der Woche (live auf der Startseite)
```

## Ordnerstruktur

```
/index.html, leistungen.html, servicegebiet.html, preise.html,
 ueber-uns.html, kontakt.html, impressum.html, datenschutz.html, 404.html
/admin/index.html            Dashboard (Firebase-Auth-geschützt)
/gebiete/*.html              10 Bezirks-Landingpages – werden beim Build generiert
/assets/css|js|img|data      Styles, Module, SVGs, Bezirksdaten (districts.json)
/netlify/functions           send-notification, escalate-leads, mark-contacted, stats
/scripts/partials.mjs        Header, Footer, <head>, JSON-LD – die eine Quelle
/scripts/build.mjs           Partial-Injection + Bezirksseiten + sitemap + robots
/scripts/og-cover.html       Quelle für das Social-Preview-Bild
/netlify.toml                Build, Functions, Cron, Redirects, Security-Header
/firestore.rules             Security Rules (create öffentlich, read/update nur Admin)
/storage.rules               Foto-Upload-Regeln
```

### Wie der Build funktioniert

Header, Footer und der `<head>`-Block stehen **nur** in `scripts/partials.mjs`.
`npm run build` schreibt sie in die Marker-Kommentare der HTML-Dateien:

```html
<!--@header-->   ... generierter Block ...   <!--/@header-->
```

Bearbeitet wird also entweder der Bereich **zwischen** den Markern (nie von Hand –
wird überschrieben) oder die Partial-Datei. Die generierten Blöcke sind
eingecheckt, damit die Seite auch ohne Build-Lauf vollständig ist.

Ebenfalls generiert: die Bezirksliste auf `servicegebiet.html` (`<!--@districts-->`),
alle Bezirksseiten, `sitemap.xml` und `robots.txt`.

Der Build bricht ab, wenn ein Marker fehlt oder ein interner Link ins Leere zeigt.

### Social-Preview-Bild neu erzeugen

`assets/img/og-cover.png` enthält die Telefonnummer – nach einem Nummernwechsel
neu rendern:

```bash
npx playwright screenshot --viewport-size=1200,630 scripts/og-cover.html assets/img/og-cover.png
```

---

## Setup (Schritt für Schritt)

### 1. Zentrale Konfiguration ausfüllen

`assets/js/config.js` ist die **einzige Stelle** für Firmenname, Domain, Telefon,
WhatsApp, E-Mail und Adresse. Die Datei wird sowohl vom Browser als auch vom Build
gelesen – eine Änderung schlägt damit bis in die statischen Fallback-Links,
Canonicals, JSON-LD und die Sitemap durch:

```js
companyName: "Abschleppdienst Winti",
siteUrl:     "https://www.dqv.ch",   // Basis für Canonicals/Sitemap
phone:       "+41795096630",
whatsapp:    "41795096630",          // ohne "+"; leer = Buttons ausblenden
email:       "…",
```

Nach jeder Änderung `npm run build` laufen lassen (macht Netlify automatisch).

Preise stehen in `preise.html` (Preiskarten **und** die Kalkulator-Konstanten im
Script-Block unten – beide müssen zusammenpassen), Bezirks-Texte in
`assets/data/districts.json`.

### Testphase → Livegang

Aktuell laufen alle Kontaktkanäle und die Domain auf Testwerte. Vor dem Livegang
in `config.js` umstellen (die Produktionswerte stehen dort auskommentiert):
`phone`, `phoneDisplay`, `whatsapp`, `email`, `siteUrl` – danach das
OG-Bild neu rendern und `npm run build` ausführen.

### 2. Firebase-Projekt anlegen

1. [console.firebase.google.com](https://console.firebase.google.com) → Projekt erstellen (Analytics optional).
2. **Web-App hinzufügen** (</>-Symbol) → die angezeigte `firebaseConfig` in `assets/js/config.js` unter `firebase:` eintragen. *(Solange dort `YOUR_…` steht, läuft die Seite im Demo-Modus: Formulare senden nur Notifications, kein Firestore.)*
3. **Firestore Database** erstellen (Region z. B. `europe-west6` Zürich) → Regeln aus `firestore.rules` einfügen (Tab „Regeln“).
4. **Authentication** → Sign-in-Methode „E-Mail/Passwort“ aktivieren → unter „Users“ den Admin-Benutzer anlegen (dieser Login gilt für `/admin`).
5. **Storage** aktivieren (für Foto-Uploads) → Regeln aus `storage.rules` einfügen. *(Optional – ohne Storage wird der Upload still übersprungen.)*
6. **Service Account** für die Functions: Projekteinstellungen → Dienstkonten → „Neuen privaten Schlüssel generieren“. Den JSON-Inhalt **einzeilig** als ENV-Variable `FIREBASE_SERVICE_ACCOUNT` hinterlegen.

### 3. Resend (E-Mail)

1. [resend.com](https://resend.com) → API-Key erstellen → `RESEND_API_KEY`.
2. Eigene Domain verifizieren und `NOTIFY_FROM_EMAIL` setzen (zum Testen geht `onboarding@resend.dev`).
3. `NOTIFY_TO_EMAIL` = Adresse, die die Lead-Mails erhalten soll.

### 4. Telegram-Bot

1. In Telegram **@BotFather** → `/newbot` → Token kopieren → `TELEGRAM_BOT_TOKEN`.
2. Dem Bot eine Nachricht schreiben (oder ihn in eine Gruppe holen).
3. Chat-ID ermitteln: `https://api.telegram.org/bot<TOKEN>/getUpdates` aufrufen → `chat.id` → `TELEGRAM_CHAT_ID`.

### 5. Netlify deployen

```bash
npm install
npm run build          # generiert /gebiete + sitemap.xml (macht Netlify auch selbst)
npx netlify deploy --prod
```

Unter **Site settings → Environment variables** alle Variablen aus `.env.example` setzen (`RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `NOTIFY_TO_EMAIL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `FIREBASE_SERVICE_ACCOUNT`, `ACTION_SECRET`, `SITE_URL`). Für lokale Tests: `.env.example` → `.env` kopieren und `npx netlify dev` starten.

Die Scheduled Function (Eskalation alle 10 Min) ist in `netlify.toml` konfiguriert und läuft automatisch.

### 6. Funktionstest nach dem Deploy

1. Startseite → Schnellanfrage ausfüllen → Telegram-Push + E-Mail müssen eintreffen, Ticket-Nummer erscheint.
2. `/admin` → Login → Lead liegt in Spalte „Neu“ (ohne Reload).
3. Lead per Drag&Drop auf „Kontaktiert“ ziehen → KPI „Ø Reaktionszeit“ aktualisiert sich; nach ≤ 5 Min Cache zeigt auch die Startseite den Live-Wert.
4. Einen Lead 30+ Minuten auf „Neu“ lassen → „⚠️ Noch offen“-Telegram kommt (Cron alle 10 Min).
5. In der Telegram-Nachricht „✅ Als kontaktiert markieren“ tippen → Status wechselt, Reaktionszeit wird erfasst.

---

## Offene Punkte vor dem Livegang

- **Juristische Prüfung:** `impressum.html` und `datenschutz.html` sind inhaltlich
  auf die tatsächlich eingebundenen Dienste abgestimmt, aber nicht anwaltlich
  geprüft. Im Impressum fehlen noch Handelsregister-Nummer und zeichnungsberechtigte
  Person.
- **Fotos:** Auf `ueber-uns.html` steht eine Redaktionsnotiz mit den drei fehlenden
  Fuhrpark-Bildern. Die Notizen (`.editor-note`) vor dem Livegang entfernen.
- **Bewertungen:** Es stehen bewusst **keine** Kundenstimmen auf der Seite. Sobald
  echte Google-Bewertungen vorliegen, können sie mit Quellenangabe ergänzt werden –
  erfundene Zitate wären nach UWG problematisch.
- **Referenz-Einsätze** in `districts.json` sind noch als „Platzhalter“ formuliert.
- **Kennzahlen:** In `config.js` stehen unter `fallbackStats` nur Werte, die auch
  belegbar sind. Wer dort etwas einträgt, veröffentlicht eine Aussage.

## Hinweise
- **Ohne JavaScript nutzbar:** Alle Anruf-, WhatsApp- und Mail-Links stehen fertig
  im HTML (vom Build aus `config.js` gerendert); JavaScript korrigiert sie nur noch,
  falls `config.js` zur Laufzeit abweicht. Für einen Notfalldienst ist das die
  wichtigste Eigenschaft der Seite – bitte bei Änderungen nicht auf `href="#"`
  zurückfallen. Auch die Bezirksliste steht statisch im HTML.
- **Telegram-Buttons:** Telegram erlaubt in Inline-Keyboards nur http(s)-Links (kein `tel:`); die Telefonnummer steht deshalb prominent im Nachrichtentext und ist dort direkt antippbar.
- **Sicherheit:** Firestore Rules erlauben anonym nur das *Erstellen* valider Leads;
  Lesen/Ändern nur mit Admin-Login. Aktions-Links aus Telegram sind HMAC-signiert
  (`ACTION_SECRET`). Keine Secrets im Frontend – die Firebase-Web-Config ist
  öffentlich by design. `netlify.toml` setzt CSP, HSTS und Permissions-Policy;
  die CSP listet genau die genutzten Fremd-Herkünfte – wer einen neuen Dienst
  einbindet, muss sie ergänzen.
- **Performance:** Kein Framework, Critical CSS inline, Fonts laden nicht
  render-blockierend, Firebase erst beim Formular-Submit, Leaflet erst wenn eine
  Karte in Sichtweite kommt. Hochgeladene Fotos werden im Browser auf max. 1600 px
  gerechnet, bevor sie übers Mobilfunknetz gehen.
- **Layout-Robustheit:** Weil die Fonts nicht blockierend laden, rendert die Seite
  kurz im System-Fallback, der breiter baut. Deshalb `min-width: 0` auf allen
  Flex-/Grid-Kindern und `overflow-wrap` auf den Überschriften – sonst läuft die
  Seite auf schmalen Handys seitlich aus dem Bild.
