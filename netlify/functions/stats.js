/* ==================================================================
 * STATS – öffentliche Kennzahlen für die Website (GET /api/stats).
 * Berechnet die Ø Reaktionszeit (neu → kontaktiert) der laufenden
 * Woche und die Gesamtzahl der Einsätze aus Firestore, damit die
 * Startseite "Ø Reaktionszeit diese Woche: X Min" LIVE anzeigen kann.
 * Gibt bewusst keine personenbezogenen Daten heraus.
 * ================================================================== */
const { getDb } = require("./lib/pipeline");

exports.handler = async () => {
  const headers = {
    "Content-Type": "application/json",
    // 5 Minuten am CDN cachen – schont Firestore-Reads
    "Cache-Control": "public, max-age=0, s-maxage=300"
  };

  const db = getDb();
  if (!db) {
    return { statusCode: 200, headers, body: JSON.stringify({ demo: true }) };
  }

  try {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = dayStart - ((now.getDay() + 6) % 7) * 864e5; // Montag 00:00

    const snap = await db.collection("leads")
      .where("timestamp", ">=", weekStart)
      .get();

    let sum = 0, n = 0;
    snap.forEach((doc) => {
      const l = doc.data();
      if (l.kontaktiertAt && l.timestamp) {
        sum += l.kontaktiertAt - l.timestamp;
        n++;
      }
    });

    const countSnap = await db.collection("leads").count().get();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        avgReactionMinutes: n ? Math.max(1, Math.round(sum / n / 60000)) : null,
        leadsThisWeek: snap.size,
        casesHandled: countSnap.data().count || null
      })
    };
  } catch (e) {
    console.error("Stats-Fehler:", e.message);
    return { statusCode: 200, headers, body: JSON.stringify({ error: true }) };
  }
};
