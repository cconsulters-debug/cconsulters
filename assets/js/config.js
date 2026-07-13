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
  // ⚠️ TESTPHASE: Anrufe gehen auf die Testnummer.
  // Für den Livegang die beiden Zeilen unten einkommentieren und die Testnummer entfernen.
  phone: "+41795096630",                    // TEST-Nummer
  phoneDisplay: "079 509 66 30",            // TEST-Anzeige
  // phone: "+41443125550",                 // PRODUKTION: 24h-Hotline
  // phoneDisplay: "044 312 55 50",         // PRODUKTION: Anzeige
  whatsapp: "41796865191",                  // WhatsApp 079 686 51 91 (wa.me-Format ohne "+"; leer lassen blendet alle WhatsApp-Buttons aus)
  email: "info@abschleppdienstwinti.ch",    // öffentliche Kontakt-Adresse

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
