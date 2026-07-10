/* ==================================================================
 * SEND-NOTIFICATION – wird vom Frontend nach jedem Formular-Submit
 * aufgerufen (POST /api/send-notification).
 * Sendet PARALLEL:
 *   1. Telegram-Nachricht (bei Notfall mit 🚨-Formatierung) inkl.
 *      Inline-Buttons "Dashboard öffnen" + "Als kontaktiert markieren"
 *   2. E-Mail via Resend
 *   3. WhatsApp Business API → vorbereitet als TODO (siehe unten)
 * ================================================================== */
const { sendTelegram, sendEmail, signLeadAction, CAT_LABEL, isEmergency, esc, siteUrl } = require("./lib/pipeline");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let lead;
  try {
    lead = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Minimal-Validierung (die harte Validierung machen die Firestore Rules)
  const telefon = String(lead.telefon || "").trim();
  if (telefon.replace(/\D/g, "").length < 7 || !lead.kategorie) {
    return { statusCode: 400, body: JSON.stringify({ error: "telefon/kategorie fehlen" }) };
  }

  const emergency = isEmergency(lead);
  const cat = CAT_LABEL[lead.kategorie] || lead.kategorie;
  const adresse = lead.standort?.adresse || "keine Adresse";
  const coords = lead.standort?.lat
    ? `https://www.google.com/maps?q=${lead.standort.lat},${lead.standort.lng}`
    : null;
  const base = siteUrl();

  /* ---------- 1) Telegram ---------- */
  // Notfall: 🚨-Prefix + dringliche Formatierung, damit die Push-Nachricht sofort auffällt
  const head = emergency
    ? `🚨🚨 <b>NOTFALL-LEAD: ${esc(cat).toUpperCase()}</b> 🚨🚨`
    : `📋 <b>Neue Anfrage: ${esc(cat)}</b>`;
  const lines = [
    head,
    "",
    `🎫 Ticket: <b>${esc(lead.ticket || "–")}</b>`,
    `📞 Telefon: <b>${esc(telefon)}</b>  (antippen zum Anrufen)`,
    `📍 Standort: ${esc(adresse)}${lead.bezirk ? " (" + esc(lead.bezirk) + ")" : ""}`,
    coords ? `🗺 Karte: ${coords}` : null,
    lead.name ? `👤 ${esc([lead.name, lead.firma].filter(Boolean).join(" · "))}` : null,
    lead.nachricht ? `💬 ${esc(lead.nachricht)}` : null,
    lead.foto_url ? `📷 Foto: ${lead.foto_url}` : null,
    `🔀 Quelle: ${esc(lead.quelle || "–")}`
  ].filter(Boolean);

  // Inline-Buttons: Telegram erlaubt nur http(s)-URLs (kein tel:) –
  // die Telefonnummer im Text ist in Telegram direkt antippbar.
  const buttons = [];
  if (base) {
    const row = [{ text: "📊 Dashboard öffnen", url: `${base}/admin/` }];
    if (lead.leadId && process.env.ACTION_SECRET) {
      row.push({
        text: "✅ Als kontaktiert markieren",
        url: `${base}/api/mark-contacted?id=${encodeURIComponent(lead.leadId)}&token=${signLeadAction(lead.leadId)}`
      });
    }
    buttons.push(row);
  }

  /* ---------- 2) E-Mail (Resend) ---------- */
  const subject = emergency
    ? `🚨 NOTFALL-Lead: ${cat} – ${telefon}`
    : `Neue Anfrage: ${cat} – ${lead.ticket || ""}`;
  const emailHtml = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2 style="color:${emergency ? "#c81e14" : "#111"}">${emergency ? "🚨 " : ""}${esc(cat)}</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-size:15px">
        <tr><td><b>Ticket</b></td><td>${esc(lead.ticket || "–")}</td></tr>
        <tr><td><b>Telefon</b></td><td><a href="tel:${esc(telefon)}">${esc(telefon)}</a></td></tr>
        <tr><td><b>Standort</b></td><td>${esc(adresse)}${lead.bezirk ? " (" + esc(lead.bezirk) + ")" : ""}</td></tr>
        ${coords ? `<tr><td><b>Karte</b></td><td><a href="${coords}">Google Maps öffnen</a></td></tr>` : ""}
        ${lead.name ? `<tr><td><b>Kontakt</b></td><td>${esc([lead.name, lead.firma, lead.email].filter(Boolean).join(" · "))}</td></tr>` : ""}
        ${lead.wunschtermin ? `<tr><td><b>Wunschtermin</b></td><td>${esc(lead.wunschtermin)}</td></tr>` : ""}
        ${lead.nachricht ? `<tr><td><b>Nachricht</b></td><td>${esc(lead.nachricht)}</td></tr>` : ""}
        <tr><td><b>Quelle</b></td><td>${esc(lead.quelle || "–")}</td></tr>
      </table>
      ${lead.foto_url ? `<p><a href="${lead.foto_url}">📷 Schadenfoto ansehen</a></p>` : ""}
      ${base ? `<p><a href="${base}/admin/" style="background:#ffb300;color:#1a1200;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Dashboard öffnen</a></p>` : ""}
    </div>`;

  /* ---------- 3) WhatsApp Business API (vorbereitet) ----------
   * TODO: Sobald ein WhatsApp-Business-API-Zugang (Meta Cloud API)
   * vorhanden ist: WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID in
   * den ENV-Variablen setzen und den Block unten einkommentieren.
   *
   * async function sendWhatsApp(lead) {
   *   const token = process.env.WHATSAPP_API_TOKEN;
   *   const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
   *   if (!token || !phoneId) return false;
   *   return fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
   *     method: "POST",
   *     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
   *     body: JSON.stringify({
   *       messaging_product: "whatsapp",
   *       to: process.env.WHATSAPP_NOTIFY_NUMBER,
   *       type: "template",           // eigenes, freigegebenes Template nötig
   *       template: { name: "new_lead", language: { code: "de" } }
   *     })
   *   });
   * }
   * ------------------------------------------------------------- */

  const [tgOk, mailOk] = await Promise.all([
    sendTelegram(lines.join("\n"), buttons.length ? buttons : null).catch((e) => { console.error(e); return false; }),
    sendEmail(subject, emailHtml).catch((e) => { console.error(e); return false; })
  ]);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, telegram: tgOk, email: mailOk })
  };
};
