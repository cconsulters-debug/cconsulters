/* ==============================================================
 * ZENTRALE KONFIGURATION – die EINZIGE Stelle, an der Firmenname,
 * Telefon, WhatsApp & Firebase-Zugangsdaten gepflegt werden.
 * Alle Seiten (inkl. Admin-Dashboard) lesen aus window.SITE_CONFIG.
 * ============================================================== */
window.SITE_CONFIG = {
  // --- Firma ---------------------------------------------------
  companyName: "[FIRMENNAME]",              // z. B. "Blitz Abschleppdienst Zürich"
  legalName: "[FIRMENNAME] GmbH",           // für Impressum/Schema.org

  // --- Kontakt -------------------------------------------------
  phone: "+41440000000",                    // [TELEFON] im tel:-Format, z. B. +41791234567
  phoneDisplay: "044 000 00 00",            // menschenlesbare Anzeige
  whatsapp: "41790000000",                  // WhatsApp-Nummer OHNE "+" (wa.me-Format)
  email: "cconsulters@gmail.com",           // [EMAIL] – öffentliche Kontakt-Adresse

  // --- Standort / NAP (lokales SEO) -----------------------------
  address: {
    street: "Musterstrasse 12",             // PLATZHALTER – echte Adresse eintragen
    zip: "8005",
    city: "Zürich",
    canton: "ZH",
    country: "CH"
  },

  // Basis-Standort der Einsatzzentrale (für Anfahrtszeit-Schätzung)
  baseLocation: { lat: 47.3886, lng: 8.5169 },

  // Durchschnittliche Einsatz-Kennzahlen (Fallback, wenn /api/stats
  // noch keine Live-Daten liefert – klar als Richtwerte kommuniziert)
  fallbackStats: {
    avgReactionMinutes: 8,
    avgArrivalMinutes: 25,
    casesHandled: 4800,
    rating: 4.9
  },

  // --- Firebase (Web-App-Konfiguration, KEIN Geheimnis) ----------
  // Firebase Console → Projekteinstellungen → "Web-App" → Konfiguration kopieren.
  // Solange apiKey mit "YOUR_" beginnt, läuft die Seite im Demo-Modus
  // (Formulare senden nur an die Netlify Function, ohne Firestore).
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:xxxxxxxxxxxxxxxx"
  }
};

/* Kleiner Helfer: true, solange Firebase noch nicht konfiguriert ist */
window.SITE_CONFIG.isDemo = window.SITE_CONFIG.firebase.apiKey.indexOf("YOUR_") === 0;
