/* ==================================================================
 * ACCOUNT — Kundenprofil lesen, bei Erstzugriff anlegen, Referral
 * einlösen. Guthaben/Preis-Felder werden NUR hier bzw. in
 * generate-document.js / stripe-webhook.js geschrieben — nie direkt
 * vom Client (Firestore-Rules verbieten das, siehe firestore.rules).
 *
 * GET  /api/account                       → Profil (legt bei Erstzugriff an)
 * POST /api/account  { action:"redeem", code } → Referral-Code einlösen
 * ================================================================== */
const { getDb, requireUser, httpError, json, handleError, REFERRAL_BONUS_CHF, REFERRAL_MAX_PER_MONTH, currentPeriod } = require("./lib/core");

function genKnr() {
  const y = new Date().getUTCFullYear();
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `MR-${y}-${s}`;
}

async function ensureCustomer(db, uid) {
  const ref = db.collection("customers").doc(uid);
  const snap = await ref.get();
  if (snap.exists) return { ref, data: snap.data() };
  const data = {
    knr: genKnr(), createdAt: Date.now(),
    balanceChf: 0, freeDocs: 1, paidDocsCount: 0,
    abo: false, aboPeriod: null, aboUsed: 0,
    referralPeriod: null, referralUses: 0
  };
  await ref.set(data);
  return { ref, data };
}

exports.handler = async (event) => {
  try {
    const user = await requireUser(event);
    const db = getDb();
    if (!db) throw httpError(500, "Datenbank nicht konfiguriert.");
    const { ref, data } = await ensureCustomer(db, user.uid);

    if (event.httpMethod === "GET") {
      const docsSnap = await db.collection("documents").where("customerId", "==", user.uid).orderBy("createdAt", "desc").limit(50).get();
      const history = docsSnap.docs.map((d) => ({ id: d.id, title: d.data().title, kanton: d.data().kanton, price: d.data().price, createdAt: d.data().createdAt }));
      return json(200, { profile: data, history });
    }

    if (event.httpMethod === "POST") {
      let body; try { body = JSON.parse(event.body || "{}"); } catch { throw httpError(400, "Ungültiger Body."); }
      if (body.action === "redeem") {
        const code = String(body.code || "").trim().toUpperCase();
        if (!code) throw httpError(400, "Code fehlt.");
        if (code === data.knr) throw httpError(400, "Eigener Code kann nicht eingelöst werden.");
        const period = currentPeriod();
        const uses = data.referralPeriod === period ? (data.referralUses || 0) : 0;
        if (uses >= REFERRAL_MAX_PER_MONTH) throw httpError(429, `Monatslimit von ${REFERRAL_MAX_PER_MONTH} Einlösungen erreicht.`);

        const referrerSnap = await db.collection("customers").where("knr", "==", code).limit(1).get();
        if (referrerSnap.empty) throw httpError(404, "Unbekannter Einladungscode.");
        const referrerRef = referrerSnap.docs[0].ref;

        await db.runTransaction(async (tx) => {
          const [meSnap, themSnap] = await Promise.all([tx.get(ref), tx.get(referrerRef)]);
          const me = meSnap.data(), them = themSnap.data();
          tx.update(ref, {
            balanceChf: +((me.balanceChf || 0) + REFERRAL_BONUS_CHF).toFixed(2),
            referralPeriod: period, referralUses: uses + 1
          });
          tx.update(referrerRef, { balanceChf: +((them.balanceChf || 0) + REFERRAL_BONUS_CHF).toFixed(2) });
        });
        return json(200, { credited: REFERRAL_BONUS_CHF, usesThisMonth: uses + 1 });
      }
      throw httpError(400, "Unbekannte Aktion.");
    }

    return json(405, { error: "Method not allowed" });
  } catch (e) {
    return handleError(e);
  }
};
