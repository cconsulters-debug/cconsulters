/* ==================================================================
 * LEAD-FORM.JS (ES-Modul)
 * Steuert das Notfall-Schnellanfrage-Formular (#quick-form) und das
 * Kontakt-/B2B-Formular (#contact-form).
 *
 * Lead-Flow:
 *   1. Lead in Firestore `leads` speichern (Realtime fürs Dashboard)
 *   2. Foto optional in Firebase Storage hochladen
 *   3. Netlify Function /api/send-notification → E-Mail + Telegram
 *   4. Sofort-Bestätigung mit Ticket-Nummer + geschätzter Reaktionszeit
 *
 * Demo-Modus: Solange Firebase in config.js nicht konfiguriert ist,
 * wird Schritt 1+2 übersprungen – die Notification-Function läuft
 * trotzdem, damit der Flow sofort testbar ist.
 * ================================================================== */
const CFG = window.SITE_CONFIG || {};
const FIREBASE_VERSION = "10.12.2";
const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

let districtsCache = null;
async function loadDistricts() {
  if (districtsCache) return districtsCache;
  try {
    const res = await fetch("/assets/data/districts.json");
    districtsCache = (await res.json()).districts;
  } catch { districtsCache = []; }
  return districtsCache;
}

/* ---------- Geometrie-Helfer ------------------------------------- */
function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Grobe Anfahrtszeit: Luftlinie × 1.35 Routenfaktor bei ~50 km/h + 8 Min Dispo */
function estimateEtaMinutes(coords) {
  if (!coords || !CFG.baseLocation) return CFG.fallbackStats?.avgArrivalMinutes || 25;
  const km = haversineKm(CFG.baseLocation, coords) * 1.35;
  return Math.max(10, Math.round(8 + (km / 50) * 60));
}

async function nearestDistrict(coords) {
  if (!coords) return null;
  const list = await loadDistricts();
  let best = null, bestD = Infinity;
  for (const d of list) {
    const dist = haversineKm(coords, d);
    if (dist < bestD) { bestD = dist; best = d; }
  }
  return best ? best.name : null;
}

/* ---------- Firebase (lazy, nur bei Bedarf laden) ----------------- */
let fbPromise = null;
function getFirebase() {
  if (CFG.isDemo) return Promise.resolve(null);
  if (!fbPromise) {
    fbPromise = (async () => {
      const [{ initializeApp }, fs, st] = await Promise.all([
        import(`${CDN}/firebase-app.js`),
        import(`${CDN}/firebase-firestore.js`),
        import(`${CDN}/firebase-storage.js`)
      ]);
      const app = initializeApp(CFG.firebase);
      return { app, fs, st };
    })().catch((err) => {
      console.warn("Firebase nicht verfügbar – Demo-Modus:", err);
      return null;
    });
  }
  return fbPromise;
}

/* ---------- Standort-Erkennung (Browser-Geolocation, Opt-in) ------ */
function initGeoButton(btn, input, hint, state) {
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      hint.textContent = "Standort-Erkennung nicht verfügbar – bitte Adresse eintippen.";
      hint.className = "geo-hint err";
      return;
    }
    hint.textContent = "Standort wird ermittelt …";
    hint.className = "geo-hint";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.coords = coords;
        const eta = estimateEtaMinutes(coords);
        hint.textContent = `✓ Standort erkannt – geschätzte Anfahrt: ca. ${eta} Min.`;
        hint.className = "geo-hint ok";
        // Reverse-Geocoding via OpenStreetMap Nominatim (kostenlos, kein Key)
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=de`,
            { headers: { Accept: "application/json" } }
          );
          const d = await r.json();
          const a = d.address || {};
          const parts = [
            [a.road, a.house_number].filter(Boolean).join(" "),
            [a.postcode, a.village || a.town || a.city].filter(Boolean).join(" ")
          ].filter(Boolean);
          if (parts.length) input.value = parts.join(", ");
        } catch {
          input.value = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        }
      },
      () => {
        hint.textContent = "Kein Zugriff auf den Standort – bitte Adresse manuell eingeben.";
        hint.className = "geo-hint err";
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

/* ---------- Foto verkleinern --------------------------------------
 * Handy-Fotos sind 3–12 MB. Am Strassenrand hängt der Upload sonst
 * minutenlang am Mobilfunknetz – oder scheitert. Wir rechnen das Bild
 * vorher auf max. 1600 px herunter (meist < 500 KB).
 * Schlägt etwas fehl, wird die Originaldatei verwendet.
 * ------------------------------------------------------------------ */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

async function downscaleImage(file) {
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.size < 600 * 1024) return file;           // schon klein genug
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch (e) {
    console.warn("Foto konnte nicht verkleinert werden – Original wird gesendet:", e);
    return file;
  }
}

/* ---------- Lead absenden ----------------------------------------- */
function makeTicket() {
  // Kurze, gut vorlesbare Ticket-Nummer: ZH- + Zeitbasis36 + Zufall
  const t = Date.now().toString(36).slice(-4).toUpperCase();
  const r = Math.floor(Math.random() * 36 ** 2).toString(36).padStart(2, "0").toUpperCase();
  return `ZH-${t}${r}`;
}

async function submitLead(lead, photoFile) {
  const ticket = makeTicket();
  lead.ticket = ticket;
  lead.status = "neu";
  lead.timestamp = Date.now();

  let leadId = null;
  const fb = await getFirebase();

  // 1) Firestore-Write (Dashboard sieht den Lead in Echtzeit)
  if (fb) {
    try {
      const db = fb.fs.getFirestore(fb.app);
      const ref = await fb.fs.addDoc(fb.fs.collection(db, "leads"), {
        ...lead,
        statusHistory: [{ status: "neu", at: lead.timestamp }],
        escalatedAt: null,
        kontaktiertAt: null,
        notizen: "",
        preis: null
      });
      leadId = ref.id;

      // 2) Foto-Upload (optional) → URL am Lead nachtragen
      if (photoFile) {
        try {
          const upload = await downscaleImage(photoFile);
          const storage = fb.st.getStorage(fb.app);
          const path = `leads/${leadId}/${Date.now()}-${upload.name.replace(/[^\w.\-]/g, "_")}`;
          const snap = await fb.st.uploadBytes(fb.st.ref(storage, path), upload);
          const url = await fb.st.getDownloadURL(snap.ref);
          await fb.fs.updateDoc(ref, { foto_url: url });
          lead.foto_url = url;
        } catch (e) { console.warn("Foto-Upload fehlgeschlagen:", e); }
      }
    } catch (e) {
      console.warn("Firestore-Write fehlgeschlagen – Notification läuft trotzdem:", e);
    }
  }

  // 3) Benachrichtigungs-Pipeline (E-Mail + Telegram) – darf den
  //    Nutzer-Flow nie blockieren, deshalb eigener try/catch.
  try {
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, leadId })
    });
  } catch (e) { console.warn("Notification fehlgeschlagen:", e); }

  return { ticket, leadId };
}

/* ---------- Schnellanfrage-Formular (Startseite) ------------------- */
function initQuickForm() {
  const form = document.getElementById("quick-form");
  if (!form) return;
  const state = { kategorie: null, coords: null };

  // Kategorie-Buttons (grosse Icon-Buttons, Single-Select)
  const catBtns = form.querySelectorAll(".cat-btn");
  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      catBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      state.kategorie = btn.dataset.cat;
    });
  });

  initGeoButton(
    document.getElementById("qf-geo"),
    document.getElementById("qf-standort"),
    document.getElementById("qf-geo-hint"),
    state
  );

  // Foto-Label mit Dateiname aktualisieren
  const foto = document.getElementById("qf-foto");
  foto?.addEventListener("change", () => {
    const label = document.getElementById("qf-foto-label");
    if (label) label.textContent = foto.files[0] ? `✓ ${foto.files[0].name}` : "Foto vom Fahrzeug/Schaden (optional)";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("qf-error");
    errEl.textContent = "";

    // Honeypot: Bots füllen das unsichtbare Feld aus
    if (form.elements.firma_hp?.value) return;

    const telefon = form.elements.telefon.value.trim();
    if (!state.kategorie) { errEl.textContent = "Bitte wählen Sie aus, was passiert ist."; return; }
    if (telefon.replace(/\D/g, "").length < 7) { errEl.textContent = "Bitte geben Sie eine gültige Telefonnummer an."; return; }

    const submitBtn = document.getElementById("qf-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet …";

    const standort = form.elements.standort.value.trim();
    const lead = {
      kategorie: state.kategorie,
      telefon,
      standort: { adresse: standort || null, lat: state.coords?.lat ?? null, lng: state.coords?.lng ?? null },
      bezirk: (await nearestDistrict(state.coords)) || null,
      nachricht: "",
      quelle: "notfall",
      foto_url: null
    };

    try {
      const { ticket } = await submitLead(lead, foto?.files[0] || null);
      // 4) Sofort-Bestätigung – gibt dem gestressten Kunden Kontrolle
      form.hidden = true;
      const confirm = document.getElementById("qf-confirm");
      document.getElementById("qf-ticket").textContent = ticket;
      document.getElementById("qf-eta").textContent = String(
        Math.min(estimateEtaMinutes(state.coords), CFG.fallbackStats?.avgReactionMinutes + 4 || 12)
      );
      confirm.hidden = false;
      confirm.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      errEl.textContent = "Senden fehlgeschlagen – bitte rufen Sie uns direkt an.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Hilfe anfordern";
    }
  });
}

/* ---------- Kontakt-/B2B-Formular (kontakt.html) -------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const state = { coords: null };

  initGeoButton(
    document.getElementById("cf-geo"),
    document.getElementById("cf-standort"),
    document.getElementById("cf-geo-hint"),
    state
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("cf-error");
    errEl.textContent = "";
    if (form.elements.firma_hp?.value) return;

    const telefon = form.elements.telefon.value.trim();
    const kategorie = form.elements.kategorie.value;
    if (!kategorie) { errEl.textContent = "Bitte wählen Sie ein Anliegen."; return; }
    if (telefon.replace(/\D/g, "").length < 7) { errEl.textContent = "Bitte geben Sie eine gültige Telefonnummer an."; return; }

    const submitBtn = document.getElementById("cf-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet …";

    const lead = {
      kategorie,
      telefon,
      name: form.elements.name.value.trim() || null,
      email: form.elements.email.value.trim() || null,
      firma: form.elements.firma.value.trim() || null,
      wunschtermin: form.elements.wunschtermin.value || null,
      standort: { adresse: form.elements.standort.value.trim() || null, lat: state.coords?.lat ?? null, lng: state.coords?.lng ?? null },
      bezirk: (await nearestDistrict(state.coords)) || null,
      nachricht: form.elements.nachricht.value.trim(),
      quelle: kategorie === "b2b" ? "b2b" : "kontaktformular",
      foto_url: null
    };

    try {
      const { ticket } = await submitLead(lead, null);
      form.hidden = true;
      const confirm = document.getElementById("cf-confirm");
      document.getElementById("cf-ticket").textContent = ticket;
      confirm.hidden = false;
      confirm.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      errEl.textContent = "Senden fehlgeschlagen – bitte kontaktieren Sie uns telefonisch.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Anfrage senden";
    }
  });
}

initQuickForm();
initContactForm();
