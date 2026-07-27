/* ==================================================================
 * Gemeinsame Helfer für alle Netlify Functions von "Mein Rechtshelfer
 * & Assistent": Firebase-Admin-Init (Auth + Firestore), Stripe-Client,
 * Antwort-Helfer, Preis-/Fair-Use-Konstanten (Single Source of Truth
 * für Server UND kachel-Anzeige im Frontend).
 * ================================================================== */

let _admin = null;
function getAdmin() {
  if (_admin) return _admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null; // ohne Service-Account keine Functions-Ausführung möglich
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  }
  _admin = admin;
  return admin;
}
function getDb() {
  const admin = getAdmin();
  return admin ? admin.firestore() : null;
}

/* ---------- Auth: Firebase-ID-Token aus Authorization-Header prüfen ---------- */
async function requireUser(event) {
  const admin = getAdmin();
  if (!admin) throw httpError(500, "FIREBASE_SERVICE_ACCOUNT ist nicht gesetzt.");
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw httpError(401, "Kein Authorization-Bearer-Token übermittelt.");
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    throw httpError(401, "Ungültiges oder abgelaufenes Token.");
  }
}

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}
/* WICHTIG: Fehlermeldungen an den Client dürfen NIE die interne Fehlermeldung
 * (Stacktrace, Prompt-Inhalt) enthalten — nur eine generische Meldung.
 * Details ausschliesslich über console.error ins Server-Log. */
function handleError(e) {
  console.error(e);
  const status = e.statusCode || 500;
  const publicMessage = status < 500 ? e.message : "Interner Fehler. Bitte später erneut versuchen.";
  return json(status, { error: publicMessage });
}

/* ---------- Preise & Fair-Use — Single Source of Truth (Server) ---------- */
// Schlüsselbasiert (statt Index-Zählung), muss mit den Schlüsseln in
// lib/prompts.js DOC_TYPES sowie mit DOCS/TIER im Frontend
// (mein-anwalt-aurum.html) übereinstimmen. Preisstufen: Info 9.90 /
// Standard 19.90 / Premium 39.90 (bewusst nicht verändert, siehe
// dokumentenpalette-strategie.md Abschnitt 5).
const STUFE_PRICE = { Info: 9.90, Standard: 19.90, Premium: 39.90 };
const TIER = {
  // Miete & Wohnen
  "miete-maengelruege": { stufe: "Info" },
  "miete-mietzinsherabsetzung": { stufe: "Standard" },
  "miete-kuendigung-anfechten": { stufe: "Premium" },
  "miete-nebenkosten-beanstanden": { stufe: "Standard" },
  "miete-kaution-rueckfordern": { stufe: "Standard" },
  // Arbeit & Anstellung
  "arbeit-kuendigung-anfechten": { stufe: "Premium" },
  "arbeit-fristlose-kuendigung": { stufe: "Premium" },
  "arbeit-zeugnis-korrektur": { stufe: "Standard" },
  "arbeit-lohnforderung": { stufe: "Standard" },
  "arbeit-kuendigungsfrist-check": { stufe: "Info" },
  // Kauf & Konsum
  "konsum-maengelruege-kauf": { stufe: "Info" },
  "konsum-widerruf-haustuergeschaeft": { stufe: "Info" },
  "konsum-reklamation-online-kauf": { stufe: "Standard" },
  // Geld & Betreibung
  "schulden-mahnung-fristsetzung": { stufe: "Info" },
  "schulden-rechtsvorschlag": { stufe: "Standard" },
  "schulden-ratenzahlung": { stufe: "Standard" },
  // Nachbarschaft & Eigentum
  "nachbarschaft-immissionen": { stufe: "Info" },
  // Verkehr & Bussen
  "verkehr-einsprache-ordnungsbusse": { stufe: "Info" },
  "verkehr-fuehrerausweis-entzug": { stufe: "Premium" },
  // Datenschutz & Digitales
  "datenschutz-auskunftsbegehren": { stufe: "Info" },
  // Versicherung & Sozialversicherung
  "versicherung-einsprache": { stufe: "Premium" },
  // Freelance & KMU
  "kmu-rechnung-mahnung": { stufe: "Info" },
  "kmu-freelance-werkvertrag": { stufe: "Standard" },
  // Allgemeine Werkzeuge
  "rechtsgutachten": { stufe: "Premium" },
  "vertrag-entwerfen": { stufe: "Premium" },
  "vertrag-pruefen": { stufe: "Premium" },
  "rechtsrecherche": { stufe: "Standard" },
  "schreiben": { stufe: "Standard" },
  "klartext": { stufe: "Info" },
  "fristen-check": { stufe: "Standard" },
  "argumente": { stufe: "Premium" },
  "zusammenfassung": { stufe: "Standard" },
  "kosten-vorgehen": { stufe: "Info" }
};
// price direkt anhängen, damit TIER[key].price wie bisher funktioniert
Object.keys(TIER).forEach((k) => { TIER[k].price = STUFE_PRICE[TIER[k].stufe]; });
const ABO_MONTHLY_PRICE = 24.90;
const ABO_FAIR_USE_CAP = 15; // Dokumente pro Kalendermonat, danach regulärer Preis
const REFERRAL_BONUS_CHF = 3;
const REFERRAL_MAX_PER_MONTH = 3;
const LOYALTY_DISCOUNT_FROM_PAID = 4; // ab dem 5. bezahlten Dokument (Index 4, 0-basiert)
const LOYALTY_DISCOUNT_RATE = 0.10;
const TOPUP_PACKAGES = {
  pack20: { pay: 20, credit: 22 },
  pack50: { pay: 50, credit: 57 },
  pack100: { pay: 100, credit: 118 }
};
const MAX_UPLOAD_CHARS = 12000; // Fair-Use gegen KI-Kostenexplosion bei langen Uploads

function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

module.exports = {
  getAdmin, getDb, requireUser, httpError, json, handleError,
  TIER, ABO_MONTHLY_PRICE, ABO_FAIR_USE_CAP, REFERRAL_BONUS_CHF, REFERRAL_MAX_PER_MONTH,
  LOYALTY_DISCOUNT_FROM_PAID, LOYALTY_DISCOUNT_RATE, TOPUP_PACKAGES, MAX_UPLOAD_CHARS, currentPeriod
};
