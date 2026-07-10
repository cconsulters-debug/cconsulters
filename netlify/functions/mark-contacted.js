/* ==================================================================
 * MARK-CONTACTED – Ziel des "✅ Als kontaktiert markieren"-Buttons
 * in der Telegram-Nachricht (GET /api/mark-contacted?id=…&token=…).
 * Der Link ist HMAC-signiert (ACTION_SECRET), damit niemand fremde
 * Leads umstellen kann. Erfasst automatisch die Reaktionszeit.
 * ================================================================== */
const { getDb, verifyLeadAction } = require("./lib/pipeline");

function page(title, body, ok) {
  return {
    statusCode: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0b0e12;color:#f2f5f9;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:20px}
.card{background:#151a22;border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:40px;max-width:420px}
h1{font-size:1.4rem}a{color:#ffb300}</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p><a href="/admin/">→ Zum Dashboard</a></div></body></html>`
  };
}

exports.handler = async (event) => {
  const { id, token } = event.queryStringParameters || {};
  if (!id || !token || !process.env.ACTION_SECRET || !verifyLeadAction(id, token)) {
    return page("Ungültiger Link", "Dieser Aktions-Link ist ungültig oder abgelaufen.", false);
  }

  const db = getDb();
  if (!db) return page("Nicht konfiguriert", "FIREBASE_SERVICE_ACCOUNT ist nicht gesetzt.", false);

  const ref = db.collection("leads").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return page("Nicht gefunden", "Dieser Lead existiert nicht (mehr).", false);

  const lead = doc.data();
  if (lead.status !== "neu") {
    return page("Bereits bearbeitet", `Der Lead ${lead.ticket || id} hat bereits den Status «${lead.status}».`, true);
  }

  const now = Date.now();
  const { FieldValue } = require("firebase-admin").firestore;
  await ref.update({
    status: "kontaktiert",
    kontaktiertAt: lead.kontaktiertAt || now,
    statusHistory: FieldValue.arrayUnion({ status: "kontaktiert", at: now, via: "telegram" })
  });

  const mins = Math.round((now - lead.timestamp) / 60000);
  return page("✅ Als kontaktiert markiert", `Lead ${lead.ticket || id} wurde umgestellt. Reaktionszeit: ${mins} Minuten.`, true);
};
