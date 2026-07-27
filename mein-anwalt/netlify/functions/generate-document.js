/* ==================================================================
 * GENERATE-DOCUMENT — Kern-Function: erzeugt das Dokument serverseitig
 * und liefert NUR das fertige Ergebnis zurück (nie den Prompt).
 *
 * Ablauf:
 *   1) Firebase-ID-Token verifizieren (requireUser)
 *   2) Preis/Berechtigung ermitteln (Guthaben, Abo+Fair-Use-Cap,
 *      Gratis-Testdokument, Treue-Rabatt) — serverseitig, nie vom
 *      Client vertraut
 *   3) Firestore-Transaction: Guthaben/Zähler ATOMAR abbuchen
 *      (verhindert Doppelklick-Race-Conditions)
 *   4) Anthropic API aufrufen mit serverseitig gebautem Prompt
 *   5) Dokument in Firestore/Storage ablegen, Ergebnis zurückgeben
 *
 * POST /api/generate-document
 * Body: { docKey, kanton, partei, ziel, sachverhalt, uploadText? }
 * ================================================================== */
const {
  getDb, requireUser, httpError, json, handleError,
  TIER, ABO_FAIR_USE_CAP, LOYALTY_DISCOUNT_FROM_PAID, LOYALTY_DISCOUNT_RATE,
  MAX_UPLOAD_CHARS, currentPeriod
} = require("./lib/core");
const { SYSTEM_PROMPT, DOC_TYPES, buildUserPrompt } = require("./lib/prompts");

const RATE_LIMIT_PER_HOUR = 30; // pro Kunde — grobe Missbrauchs-/Kosten-Bremse

async function callAnthropic(userPrompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw httpError(500, "ANTHROPIC_API_KEY ist nicht gesetzt.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  if (!res.ok) {
    // Rohtext/Details NIE an den Client durchreichen — nur ins Server-Log.
    console.error("Anthropic-API-Fehler:", res.status, await res.text());
    throw httpError(502, "Dokumenterstellung derzeit nicht möglich. Bitte später erneut versuchen.");
  }
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n").trim();
  if (!text) throw httpError(502, "Leere Antwort erhalten. Bitte erneut versuchen.");
  return text;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const user = await requireUser(event);
    const db = getDb();
    if (!db) throw httpError(500, "Datenbank nicht konfiguriert.");

    let body;
    try { body = JSON.parse(event.body || "{}"); } catch { throw httpError(400, "Ungültiger Request-Body."); }
    const { docKey, kanton, partei, ziel, sachverhalt, uploadText } = body;
    if (!DOC_TYPES[docKey] || !TIER[docKey]) throw httpError(400, "Unbekannter Dokumenttyp.");
    if (!kanton || !sachverhalt) throw httpError(400, "Kanton und Sachverhalt sind Pflichtfelder.");
    const cleanUpload = typeof uploadText === "string" ? uploadText.slice(0, MAX_UPLOAD_CHARS) : "";

    const custRef = db.collection("customers").doc(user.uid);
    const period = currentPeriod();

    // --- Schritt 1: Preis/Berechtigung + Abbuchung ATOMAR in einer Transaction ---
    const { pricedZero, priceCharged, docId } = await db.runTransaction(async (tx) => {
      const snap = await tx.get(custRef);
      if (!snap.exists) throw httpError(404, "Kein Kundenprofil gefunden. Bitte zuerst Konto erstellen.");
      const c = snap.data();

      // Grobes Rate-Limiting: Zeitstempel der letzten Stunde zählen
      const recentTs = (c.recentGenerations || []).filter((t) => Date.now() - t < 3600_000);
      if (recentTs.length >= RATE_LIMIT_PER_HOUR) {
        throw httpError(429, "Zu viele Anfragen in kurzer Zeit. Bitte später erneut versuchen.");
      }

      const tier = TIER[docKey];
      let price = tier.price;
      let freeReason = null;

      if ((c.freeDocs || 0) > 0) { price = 0; freeReason = "test"; }
      else if (c.abo && c.aboPeriod === period && (c.aboUsed || 0) < ABO_FAIR_USE_CAP) { price = 0; freeReason = "abo"; }
      else if (c.abo && c.aboPeriod !== period) { price = 0; freeReason = "abo"; } // neue Periode: Zähler wird unten zurückgesetzt
      else if ((c.paidDocsCount || 0) >= LOYALTY_DISCOUNT_FROM_PAID) { price = +(tier.price * (1 - LOYALTY_DISCOUNT_RATE)).toFixed(2); }

      if (price > 0 && (c.balanceChf || 0) < price) {
        throw httpError(402, `Guthaben zu tief (benötigt CHF ${price.toFixed(2)}). Bitte Guthaben aufladen.`);
      }

      const update = { recentGenerations: [...recentTs, Date.now()] };
      if (freeReason === "test") update.freeDocs = (c.freeDocs || 1) - 1;
      if (freeReason === "abo") {
        update.aboPeriod = period;
        update.aboUsed = c.aboPeriod === period ? (c.aboUsed || 0) + 1 : 1;
      }
      if (price > 0) update.balanceChf = +((c.balanceChf || 0) - price).toFixed(2);
      if (!freeReason || freeReason === "abo") update.paidDocsCount = (c.paidDocsCount || 0) + 1;

      tx.update(custRef, update);
      const newDocRef = db.collection("documents").doc();
      return { pricedZero: price === 0, priceCharged: price, docId: newDocRef.id };
    });

    // --- Schritt 2: Prompt bauen (nur serverseitig) + KI aufrufen ---
    const fields = { kanton, partei: partei || "[Rolle/Partei]", ziel: ziel || "[Ziel]", sachverhalt, uploadText: cleanUpload };
    const userPrompt = buildUserPrompt(docKey, fields);
    const generated = await callAnthropic(userPrompt);

    const now = new Date();
    const finalDoc = `MEIN RECHTSHELFER & ASSISTENT\n${"=".repeat(52)}\n`
      + `Dokumenttyp: ${DOC_TYPES[docKey].title}\nKanton: ${kanton}   Erstellt: ${now.toLocaleString("de-CH")}\n`
      + `${"=".repeat(52)}\n\n${generated}\n\n${"-".repeat(52)}\n`
      + `Allgemeine rechtliche Information, keine verbindliche Beratung. Zentrale Fundstellen auf fedlex.admin.ch / bger.ch prüfen. Bei Fristen/Strafsachen zugelassene Anwältin/Anwalt beiziehen.\n`;

    // --- Schritt 3: Dokument ablegen (fürs Archiv) ---
    await db.collection("documents").doc(docId).set({
      customerId: user.uid, docKey, title: DOC_TYPES[docKey].title,
      kanton, price: priceCharged, createdAt: Date.now(), text: finalDoc
    });

    return json(200, { docId, price: priceCharged, free: pricedZero, document: finalDoc });
  } catch (e) {
    return handleError(e);
  }
};
