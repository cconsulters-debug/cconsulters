# Backend-Setup — «Mein Rechtshelfer & Assistent»

Dieses Dokument beschreibt, was **du** einmalig einrichten musst, damit das Backend
(`mein-anwalt/netlify/functions/`) läuft. Ich kann diese Konten nicht für dich anlegen — sie
gehören dir (E-Mail, Zahlungsdaten, Rechtsverhältnis mit den Anbietern).

## Was bereits fertig ist (Code)

- `netlify/functions/lib/core.js` — Auth-Prüfung, Preis-/Fair-Use-Konstanten (Single Source of
  Truth, synchron zum Frontend-Prototyp: CHF 9.90/19.90/39.90, Abo 24.90 mit 15er-Cap, Treue-
  Rabatt ab 5. Dokument, Referral max. 3×/Monat)
- `netlify/functions/lib/prompts.js` — **geschützte** Fach-Prompts (nie an den Client ausgeliefert)
- `generate-document.js` — Guthaben/Abo/Treue serverseitig prüfen & abbuchen (Firestore-
  Transaction, verhindert Doppelklick-Race-Conditions), Claude-API aufrufen, nur Ergebnis liefern
- `account.js` — Kundennummer-Vergabe, Profil, Referral-Einlösung
- `create-checkout-session.js` / `stripe-webhook.js` — Stripe Checkout (Karte + TWINT) mit
  Idempotenz-Schutz gegen doppelte Gutschrift
- `firestore.rules` — Guthaben/Preisfelder sind für den Client nur lesbar, nie beschreibbar

## Was noch fehlt (Code, nächster Schritt)

- **Frontend-Anbindung:** Der Prototyp (`app/mein-anwalt-aurum.html`) rechnet aktuell noch lokal
  im Browser (Demo/Testmodus). Er muss auf Firebase Auth (Login) + die `/api/*`-Endpunkte
  umgestellt werden, statt `localStorage`.
- **Upload-Verarbeitung für PDF/Word:** Aktuell ist nur reiner Text vorgesehen. Für echte
  PDF/DOCX-Extraktion braucht es zusätzliche Pakete (z. B. `pdf-parse`, `mammoth`) plus eine
  eigene `upload-parse.js`-Function mit Firebase-Storage-Anbindung und automatischer Löschung.
- **Scheduled Cleanup** für hochgeladene Originaldateien (analog zum bestehenden
  `escalate-leads.js`-Cron-Muster im Abschleppdienst-Projekt).

## Schritt-für-Schritt-Einrichtung

### 1. Firebase-Projekt
1. [console.firebase.google.com](https://console.firebase.google.com) → neues Projekt (Region
   z. B. `europe-west6` Zürich).
2. **Authentication** aktivieren → Anmeldemethode «E-Mail/Link» oder «E-Mail/Passwort».
3. **Firestore Database** erstellen → Regeln aus `mein-anwalt/firestore.rules` einfügen.
4. **Projekteinstellungen → Dienstkonten** → «Neuen privaten Schlüssel generieren» → den
   JSON-Inhalt **einzeilig** als `FIREBASE_SERVICE_ACCOUNT` hinterlegen.

### 2. Stripe-Konto (Zahlung inkl. TWINT)
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Konto erstellen (Schweiz als Land).
2. **TWINT aktivieren lassen** — dies erfordert bei Stripe eine gesonderte Freischaltung für
   Schweizer Accounts; im Dashboard unter Zahlungsmethoden anfragen bzw. mit Stripe-Support klären.
3. **API-Keys** (Developers → API keys) → `STRIPE_SECRET_KEY`.
4. **Abo-Produkt anlegen** (Products → Add product): «Flatrate», wiederkehrend CHF 24.90/Monat →
   die erzeugte Price-ID als `STRIPE_ABO_PRICE_ID`.
5. **Webhook einrichten** (Developers → Webhooks → Add endpoint): Ziel-URL
   `https://<deine-domain>/api/stripe-webhook`, Events `checkout.session.completed` und
   `invoice.paid` abonnieren → das erzeugte Signing Secret als `STRIPE_WEBHOOK_SECRET`.

### 3. Anthropic API-Key
1. [console.anthropic.com](https://console.anthropic.com) → API Keys → neuen Key erstellen →
   `ANTHROPIC_API_KEY`.

### 4. Deployment
```bash
cd mein-anwalt
npm install
cp .env.example .env   # lokal ausfüllen zum Testen
npx netlify dev        # lokaler Test mit echten Functions
```
Für den Live-Betrieb: eigene Netlify-Site aus dem `mein-anwalt/`-Ordner erstellen (oder als
Subdomain/eigenes Repo), alle Variablen aus `.env.example` unter **Site settings → Environment
variables** eintragen, eigene `.ch`-Domain verbinden.

### 5. Vor dem Livegang
- [ ] Rechtstexte (`recht/`-Ordner) mit echten Angaben ausfüllen und anwaltlich prüfen lassen
- [ ] Datenschutzerklärung um Stripe + tatsächlichen KI-Anbieter/Verarbeitungsort ergänzen
- [ ] Berufshaftpflichtversicherung klären
- [ ] Testlauf: Konto anlegen → Guthaben aufladen (Stripe-Testmodus) → Dokument erstellen →
      Webhook-Zustellung in Stripe-Dashboard-Logs prüfen → Idempotenz testen (Event erneut senden)
