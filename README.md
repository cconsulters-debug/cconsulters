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
/index.html, leistungen.html, servicegebiet.html, preise.html, ueber-uns.html, kontakt.html
/admin/index.html            Dashboard (Firebase-Auth-geschützt)
/gebiete/*.html              10 Bezirks-Landingpages – werden beim Build generiert
/assets/css|js|img|data      Styles, Module, SVGs, Bezirksdaten (districts.json)
/netlify/functions           send-notification, escalate-leads, mark-contacted, stats
/scripts/build-gebiete.mjs   Generator für Bezirksseiten + sitemap.xml
/netlify.toml                Build, Functions, Cron, Redirects (/api/*)
/firestore.rules             Security Rules (create öffentlich, read/update nur Admin)
/storage.rules               Foto-Upload-Regeln
```

---

## Setup (Schritt für Schritt)

### 1. Zentrale Konfiguration ausfüllen

`assets/js/config.js` ist die **einzige Stelle** für Firmenname, Telefon, WhatsApp, E-Mail, Adresse:

```js
companyName: "[FIRMENNAME]",     // ← hier ändern
phone: "+41791234567",           // [TELEFON]
whatsapp: "41791234567",         // ohne "+"
email: "…",                      // [EMAIL]
```

Beispielpreise stehen in `preise.html` (Kalkulator-Konstanten im Script-Block unten), Platzhalter-Testimonials in `index.html`, Bezirks-Texte in `assets/data/districts.json`.

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

## Business-Agenten

Unter `.claude/agents/` liegen 26 spezialisierte KI-Agenten für die Unternehmensführung —
Strategie, Marketing, Vertrieb, Kundenservice, Finanzen, Recht, Betrieb, Daten.
Übersicht und Anleitung: **[`docs/business-agenten.md`](docs/business-agenten.md)**.

Vor dem ersten Einsatz `docs/firmenprofil.md` ausfüllen — alle Agenten lesen diese Datei
als gemeinsame Wissensbasis. Wer nicht weiss, welcher Agent passt, startet mit
`business-orchestrator`.

---

## Hinweise

- **Platzhalter:** Alles, was ersetzt werden muss, ist im UI sichtbar als „Platzhalter“ markiert (Testimonials, Preise, Fuhrpark-Fotos, Partner-Logos, Referenz-Einsätze in `districts.json`).
- **Telegram-Buttons:** Telegram erlaubt in Inline-Keyboards nur http(s)-Links (kein `tel:`); die Telefonnummer steht deshalb prominent im Nachrichtentext und ist dort direkt antippbar.
- **Foto-Platzhalter:** Wo echte Fotos hingehören, steht eine Beschreibung des Motivs (z. B. „Plateau-Fahrzeug bei Nacht mit Warnlicht“).
- **Sicherheit:** Firestore Rules erlauben anonym nur das *Erstellen* valider Leads; Lesen/Ändern nur mit Admin-Login. Aktions-Links aus Telegram sind HMAC-signiert (`ACTION_SECRET`). Keine Secrets im Frontend – die Firebase-Web-Config ist öffentlich by design.
- **Performance:** Kein Framework, Critical CSS inline, Firebase wird erst beim Formular-Submit nachgeladen, Leaflet nur auf Karten-Seiten. Ziel Lighthouse Mobile > 90.
