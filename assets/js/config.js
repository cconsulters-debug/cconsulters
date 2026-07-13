/* ==============================================================
 * ZENTRALE KONFIGURATION – die EINZIGE Stelle, an der Firmenname,
 * Telefon, WhatsApp & Firebase-Zugangsdaten gepflegt werden.
 * Alle Seiten (inkl. Admin-Dashboard) lesen aus window.SITE_CONFIG.
 * ============================================================== */
window.SITE_CONFIG = {
  // --- Firma ---------------------------------------------------
  // Quelle: Handelsregister (Zefix) – Abschleppdienst Winti GmbH,
  // UID CHE-239.815.669, gegründet 20.07.2017
  companyName: "Abschleppdienst Winti",
  legalName: "Abschleppdienst Winti GmbH",  // für Impressum/Schema.org
  uid: "CHE-239.815.669",                   // UID/MWST (Schema.org vatID)

  // --- Kontakt -------------------------------------------------
  phone: "+41443125550",                    // 24h-Hotline (lt. Website)
  phoneDisplay: "044 312 55 50",            // menschenlesbare Anzeige
  whatsapp: "41443125550",                  // WhatsApp OHNE "+" – TODO: prüfen, ob eigene WhatsApp-Nummer existiert
  email: "info@abschleppdienstwinti.ch",    // öffentliche Kontakt-Adresse – TODO: verifizieren

  // --- Standort / NAP (lokales SEO) -----------------------------
  address: {
    street: "Schlachthofstrasse 6",
    zip: "8406",
    city: "Winterthur",
    canton: "ZH",
    country: "CH"
  },

  // Basis-Standort der Einsatzzentrale (für Anfahrtszeit-Schätzung)
  // Schlachthofstrasse 6, Winterthur – direkt am A1-Anschluss
  baseLocation: { lat: 47.4936, lng: 8.7115 },

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
