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
// Reihenfolge/Indizes müssen mit DOCS/TIER im Frontend (mein-anwalt-aurum.html) übereinstimmen.
const TIER = [
  { doc: "rechtsgutachten", stufe: "Premium", price: 39.90 },
  { doc: "vertrag-entwerfen", stufe: "Premium", price: 39.90 },
  { doc: "vertrag-pruefen", stufe: "Premium", price: 39.90 },
  { doc: "rechtsrecherche", stufe: "Standard", price: 19.90 },
  { doc: "schreiben", stufe: "Standard", price: 19.90 },
  { doc: "klartext", stufe: "Info", price: 9.90 },
  { doc: "fristen-check", stufe: "Standard", price: 19.90 },
  { doc: "argumente", stufe: "Premium", price: 39.90 },
  { doc: "zusammenfassung", stufe: "Standard", price: 19.90 },
  { doc: "kosten-vorgehen", stufe: "Info", price: 9.90 }
];
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
