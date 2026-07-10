/* ==================================================================
 * ESCALATE-LEADS – Netlify Scheduled Function (Cron: alle 10 Min,
 * konfiguriert in netlify.toml).
 * Follow-up-Automation: Leads mit Status "neu", die seit über
 * 30 Minuten unbearbeitet sind, werden per Telegram erneut
 * eskaliert ("⚠️ Noch offen") und als eskaliert markiert, damit
 * die Warnung nur einmal kommt.
 * ================================================================== */
const { getDb, sendTelegram, signLeadAction, CAT_LABEL, esc, siteUrl } = require("./lib/pipeline");

const ESCALATE_AFTER_MS = 30 * 60 * 1000; // 30 Minuten

exports.handler = async () => {
  const db = getDb();
  if (!db) {
    console.warn("Eskalation übersprungen: FIREBASE_SERVICE_ACCOUNT nicht gesetzt.");
    return { statusCode: 200, body: JSON.stringify({ ok: true, skipped: "no-db" }) };
  }

  // Nur Gleichheits-Filter → kein Composite-Index nötig;
  // Alter & Eskalations-Flag werden im Code geprüft.
  const cutoff = Date.now() - ESCALATE_AFTER_MS;
  const snap = await db.collection("leads")
    .where("status", "==", "neu")
    .limit(100)
    .get();

  const base = siteUrl();
  let escalated = 0;

  for (const doc of snap.docs) {
    const lead = doc.data();
    if (lead.escalatedAt) continue;        // bereits gewarnt
    if (!lead.timestamp || lead.timestamp > cutoff) continue; // noch keine 30 Min alt

    const mins = Math.round((Date.now() - lead.timestamp) / 60000);
    const text = [
      `⚠️ <b>NOCH OFFEN seit ${mins} Minuten!</b>`,
      "",
      `🎫 ${esc(lead.ticket || doc.id)}`,
      `🏷 ${esc(CAT_LABEL[lead.kategorie] || lead.kategorie)}`,
      `📞 <b>${esc(lead.telefon)}</b>`,
      `📍 ${esc(lead.standort?.adresse || lead.bezirk || "kein Standort")}`,
      "",
      "Bitte sofort kontaktieren oder Status im Dashboard aktualisieren."
    ].join("\n");

    const buttons = base ? [[
      { text: "📊 Dashboard", url: `${base}/admin/` },
      ...(process.env.ACTION_SECRET ? [{
        text: "✅ Kontaktiert",
        url: `${base}/api/mark-contacted?id=${encodeURIComponent(doc.id)}&token=${signLeadAction(doc.id)}`
      }] : [])
    ]] : null;

    const ok = await sendTelegram(text, buttons);
    if (ok) {
      await doc.ref.update({ escalatedAt: Date.now() });
      escalated++;
    }
  }

  console.log(`Eskalation: ${escalated} von ${snap.size} geprüften Leads gemeldet.`);
  return { statusCode: 200, body: JSON.stringify({ ok: true, escalated }) };
};
