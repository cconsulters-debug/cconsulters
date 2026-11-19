/* ==================================================================
 * CREATE-CHECKOUT-SESSION — Stripe Checkout (Karte + TWINT) starten.
 * Verifiziert den Nutzer, erstellt eine Checkout-Session mit der
 * Kunden-uid als client_reference_id/metadata, gibt die Checkout-URL
 * zurück. Die eigentliche Gutschrift passiert NICHT hier, sondern erst
 * im stripe-webhook.js nach bestätigter Zahlung (nie dem Client trauen).
 *
 * POST /api/create-checkout-session   Body: { kind:"topup"|"abo", packageId? }
 * ================================================================== */
const { requireUser, httpError, json, handleError, TOPUP_PACKAGES, ABO_MONTHLY_PRICE } = require("./lib/core");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw httpError(500, "STRIPE_SECRET_KEY ist nicht gesetzt.");
  return require("stripe")(key);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const user = await requireUser(event);
    const stripe = getStripe();
    let body; try { body = JSON.parse(event.body || "{}"); } catch { throw httpError(400, "Ungültiger Body."); }
    const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
    if (!siteUrl) throw httpError(500, "SITE_URL ist nicht gesetzt.");

    let session;
    if (body.kind === "topup") {
      const pkg = TOPUP_PACKAGES[body.packageId];
      if (!pkg) throw httpError(400, "Unbekanntes Guthaben-Paket.");
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "twint"],
        line_items: [{
          price_data: {
            currency: "chf",
            unit_amount: Math.round(pkg.pay * 100),
            product_data: { name: `Guthaben-Paket CHF ${pkg.pay} (+ CHF ${(pkg.credit - pkg.pay).toFixed(2)} Bonus)` }
          },
          quantity: 1
        }],
        client_reference_id: user.uid,
        metadata: { uid: user.uid, kind: "topup", packageId: body.packageId, credit: String(pkg.credit) },
        success_url: `${siteUrl}/#shop?checkout=success`,
        cancel_url: `${siteUrl}/#shop?checkout=cancel`
      });
    } else if (body.kind === "abo") {
      const priceId = process.env.STRIPE_ABO_PRICE_ID; // in Stripe Dashboard angelegtes Abo-Produkt (CHF 24.90/Monat)
      if (!priceId) throw httpError(500, "STRIPE_ABO_PRICE_ID ist nicht gesetzt.");
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "twint"],
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: user.uid,
        metadata: { uid: user.uid, kind: "abo" },
        success_url: `${siteUrl}/#shop?checkout=success`,
        cancel_url: `${siteUrl}/#shop?checkout=cancel`
      });
    } else {
      throw httpError(400, "Unbekannter Bestelltyp (kind).");
    }

    return json(200, { url: session.url });
  } catch (e) {
    return handleError(e);
  }
};
