/* ==================================================================
 * Gemeinsame Helfer für alle Netlify Functions:
 * Firebase-Admin-Init, Telegram, Resend-E-Mail, Link-Signierung.
 * ================================================================== */
const crypto = require("crypto");

/* ---------- Firebase Admin (Firestore-Serverzugriff) ---------- */
let _db = null;
function getDb() {
  if (_db) return _db;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null; // Demo-Modus: Functions laufen auch ohne Firestore
  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    }
    _db = admin.firestore();
    return _db;
  } catch (e) {
    console.error("Firebase-Admin-Init fehlgeschlagen:", e.message);
    return null;
  }
}

/* ---------- Telegram Bot API ---------- */
async function sendTelegram(text, inlineKeyboard) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Telegram nicht konfiguriert (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID fehlen).");
    return false;
  }
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };
  if (inlineKeyboard) body.reply_markup = { inline_keyboard: inlineKeyboard };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) console.error("Telegram-Fehler:", await res.text());
  return res.ok;
}

/* ---------- Resend (E-Mail) ---------- */
async function sendEmail(subject, html) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO_EMAIL;
  if (!key || !to) {
    console.warn("Resend nicht konfiguriert (RESEND_API_KEY / NOTIFY_TO_EMAIL fehlen).");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL || "onboarding@resend.dev",
      to: [to],
      subject,
      html
    })
  });
  if (!res.ok) console.error("Resend-Fehler:", await res.text());
  return res.ok;
}

/* ---------- Signierte Aktions-Links (Telegram-Button) ---------- */
function signLeadAction(leadId) {
  const secret = process.env.ACTION_SECRET || "";
  return crypto.createHmac("sha256", secret).update(String(leadId)).digest("hex").slice(0, 32);
}
function verifyLeadAction(leadId, token) {
  const expected = signLeadAction(leadId);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(token || "")));
  } catch { return false; }
}

/* ---------- Formatierung ---------- */
const CAT_LABEL = {
  unfall: "Unfall", panne: "Panne", falschparker: "Falschparker",
  transport: "Transport", b2b: "B2B", sonstiges: "Sonstiges"
};
const EMERGENCY_CATS = ["unfall", "panne", "falschparker"];

function isEmergency(lead) {
  return lead.quelle === "notfall" || EMERGENCY_CATS.includes(lead.kategorie);
}
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function siteUrl() {
  return (process.env.SITE_URL || process.env.URL || "").replace(/\/$/, "");
}

module.exports = { getDb, sendTelegram, sendEmail, signLeadAction, verifyLeadAction, CAT_LABEL, isEmergency, esc, siteUrl };
