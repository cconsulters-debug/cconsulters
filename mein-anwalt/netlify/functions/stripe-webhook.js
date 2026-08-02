/* ==================================================================
 * STRIPE-WEBHOOK — verifiziert Stripe-Events und schreibt Guthaben/
 * Abo-Status GUTGESCHRIEBEN erst nach echter Zahlungsbestätigung.
 *
 * Kritisch: Stripe garantiert "at-least-once"-Zustellung — dasselbe
 * Event kann mehrfach ankommen. Daher Idempotenz über
 * processedStripeEvents/{eventId} (Firestore-Transaction: nur wenn
 * das Event noch nicht verarbeitet ist, wird gutgeschrieben).
 *
 * In Stripe Dashboard registrieren auf: /api/stripe-webhook
 * Events: checkout.session.completed, invoice.paid (Abo-Verlängerung)
 * ================================================================== */
const { getDb, httpError, json, handleError, currentPeriod } = require("./lib/core");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw httpError(500, "STRIPE_SECRET_KEY ist nicht gesetzt.");
  return require("stripe")(key);
}

exports.handler = async (event) => {
  try {
    const stripe = getStripe();
    const sig = event.headers["stripe-signature"];
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!whSecret) throw httpError(500, "STRIPE_WEBHOOK_SECRET ist nicht gesetzt.");

    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
    } catch (e) {
      console.error("Stripe-Signaturprüfung fehlgeschlagen:", e.message);
      return json(400, { error: "Invalid signature" });
    }

    const db = getDb();
    if (!db) throw httpError(500, "Datenbank nicht konfiguriert.");
    const eventRef = db.collection("processedStripeEvents").doc(stripeEvent.id);

    const applied = await db.runTransaction(async (tx) => {
      const already = await tx.get(eventRef);
      if (already.exists) return false; // bereits verarbeitet — nichts tun (Idempotenz)

      if (stripeEvent.type === "checkout.session.completed") {
        const s = stripeEvent.data.object;
        const uid = s.metadata && s.metadata.uid;
        if (!uid) throw new Error("checkout.session.completed ohne uid in metadata.");
        const custRef = db.collection("customers").doc(uid);
        const custSnap = await tx.get(custRef);
        if (!custSnap.exists) throw new Error(`Kunde ${uid} nicht gefunden.`);
        const c = custSnap.data();

        if (s.metadata.kind === "topup") {
          const credit = parseFloat(s.metadata.credit || "0");
          tx.update(custRef, { balanceChf: +((c.balanceChf || 0) + credit).toFixed(2) });
          tx.set(db.collection("transactions").doc(), {
            customerId: uid, type: "topup", amountRappen: Math.round(credit * 100),
            stripeEventId: stripeEvent.id, createdAt: Date.now()
          });
        } else if (s.metadata.kind === "abo") {
          tx.update(custRef, { abo: true, aboPeriod: currentPeriod(), aboUsed: 0 });
          tx.set(db.collection("transactions").doc(), {
            customerId: uid, type: "abo_start", stripeEventId: stripeEvent.id, createdAt: Date.now()
          });
        }
      } else if (stripeEvent.type === "invoice.paid") {
        // Monatliche Abo-Verlängerung: Fair-Use-Zähler für die neue Periode zurücksetzen.
        const inv = stripeEvent.data.object;
        const uid = inv.subscription_details && inv.subscription_details.metadata && inv.subscription_details.metadata.uid;
        if (uid) {
          const custRef = db.collection("customers").doc(uid);
          tx.update(custRef, { aboPeriod: currentPeriod(), aboUsed: 0 });
        }
      }

      tx.set(eventRef, { processedAt: Date.now(), type: stripeEvent.type });
      return true;
    });

    return json(200, { received: true, applied });
  } catch (e) {
    return handleError(e);
  }
};
