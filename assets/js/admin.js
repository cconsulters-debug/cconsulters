/* ==================================================================
 * ADMIN.JS – Lead-Dashboard (ES-Modul)
 * Firebase Auth (Login) + Firestore Realtime-Listener (kein Reload),
 * Kanban mit Drag&Drop, Leaflet-Kartenansicht, KPI-Berechnung,
 * Reaktionszeit-Tracking bei Statuswechsel neu → kontaktiert.
 * ================================================================== */
const CFG = window.SITE_CONFIG || {};
const CDN = "https://www.gstatic.com/firebasejs/10.12.2";

const STATUSES = ["neu", "kontaktiert", "angebot", "gewonnen", "verloren"];
const CAT_LABEL = {
  unfall: "🚨 Unfall", panne: "🔧 Panne", falschparker: "🅿️ Falschparker",
  transport: "🚚 Transport", b2b: "🏢 B2B", sonstiges: "📋 Sonstiges"
};

const $ = (id) => document.getElementById(id);
let db, fs, auth, authMod;
let allLeads = [];          // aktueller Realtime-Snapshot
let currentLeadId = null;   // im Modal geöffneter Lead
let adminMap = null, mapMarkers = [];

/* ---------- Demo-Modus-Hinweis ---------- */
if (CFG.isDemo) $("demo-note").hidden = false;

/* ---------- Firebase laden & Auth-Flow ---------- */
async function boot() {
  if (CFG.isDemo) return; // Login bleibt sichtbar, Hinweis wird angezeigt
  const [{ initializeApp }, authM, fsM] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`)
  ]);
  authMod = authM; fs = fsM;
  const app = initializeApp(CFG.firebase);
  auth = authM.getAuth(app);
  db = fsM.getFirestore(app);

  authM.onAuthStateChanged(auth, (user) => {
    if (user) {
      $("login-view").style.display = "none";
      $("app-view").classList.add("active");
      $("user-email").textContent = user.email || "";
      subscribeLeads();
    } else {
      $("login-view").style.display = "grid";
      $("app-view").classList.remove("active");
    }
  });
}
boot();

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("login-error");
  err.textContent = "";
  if (CFG.isDemo) { err.textContent = "Firebase ist noch nicht konfiguriert (config.js)."; return; }
  try {
    await authMod.signInWithEmailAndPassword(auth, $("login-email").value.trim(), $("login-pass").value);
  } catch {
    err.textContent = "Login fehlgeschlagen – E-Mail/Passwort prüfen.";
  }
});
$("logout-btn").addEventListener("click", () => authMod?.signOut(auth));

/* ---------- Realtime-Listener ---------- */
let unsubscribe = null;
function subscribeLeads() {
  if (unsubscribe) return;
  const q = fs.query(fs.collection(db, "leads"), fs.orderBy("timestamp", "desc"), fs.limit(500));
  unsubscribe = fs.onSnapshot(q, (snap) => {
    allLeads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (e) => console.error("Firestore-Listener:", e));
}

/* ---------- Filter ---------- */
function getFiltered() {
  const search = $("f-search").value.trim().toLowerCase();
  const kat = $("f-kategorie").value;
  const bezirk = $("f-bezirk").value;
  const zeitraum = $("f-zeitraum").value;
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = dayStart - ((now.getDay() + 6) % 7) * 864e5; // Montag
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  return allLeads.filter((l) => {
    if (kat && l.kategorie !== kat) return false;
    if (bezirk && l.bezirk !== bezirk) return false;
    if (zeitraum === "today" && l.timestamp < dayStart) return false;
    if (zeitraum === "week" && l.timestamp < weekStart) return false;
    if (zeitraum === "month" && l.timestamp < monthStart) return false;
    if (search) {
      const hay = [l.ticket, l.telefon, l.name, l.firma, l.notizen, l.nachricht,
        l.standort?.adresse, l.bezirk].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}
["f-search", "f-kategorie", "f-bezirk", "f-zeitraum"].forEach((id) =>
  $(id).addEventListener("input", render)
);

/* ---------- Rendering ---------- */
function fmtTime(ts) {
  if (!ts) return "–";
  return new Date(ts).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `vor ${m} Min`;
  if (m < 1440) return `vor ${Math.round(m / 60)} Std`;
  return `vor ${Math.round(m / 1440)} Tg`;
}

function render() {
  const leads = getFiltered();
  renderKpis();
  renderBezirkFilter();
  renderKanban(leads);
  renderMap(leads);
}

function renderBezirkFilter() {
  const sel = $("f-bezirk");
  const current = sel.value;
  const bezirke = [...new Set(allLeads.map((l) => l.bezirk).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Alle Bezirke</option>' +
    bezirke.map((b) => `<option value="${b}">${b}</option>`).join("");
  sel.value = current;
}

function renderKpis() {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = dayStart - ((now.getDay() + 6) % 7) * 864e5;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  $("kpi-today").textContent = allLeads.filter((l) => l.timestamp >= dayStart).length;
  $("kpi-week").textContent = allLeads.filter((l) => l.timestamp >= weekStart).length;
  $("kpi-month").textContent = allLeads.filter((l) => l.timestamp >= monthStart).length;

  // Ø Reaktionszeit (neu → kontaktiert) dieser Woche
  const reacted = allLeads.filter((l) => l.kontaktiertAt && l.timestamp >= weekStart);
  if (reacted.length) {
    const avg = reacted.reduce((s, l) => s + (l.kontaktiertAt - l.timestamp), 0) / reacted.length / 60000;
    $("kpi-reaction").textContent = `${Math.round(avg)} Min`;
  } else $("kpi-reaction").textContent = "–";

  const decided = allLeads.filter((l) => ["gewonnen", "verloren"].includes(l.status));
  const won = allLeads.filter((l) => l.status === "gewonnen");
  $("kpi-conversion").textContent = decided.length
    ? `${Math.round((won.length / decided.length) * 100)}%` : "–";

  const revenue = won.reduce((s, l) => s + (Number(l.preis) || 0), 0);
  $("kpi-revenue").textContent = revenue ? `CHF ${revenue.toLocaleString("de-CH")}` : "–";
}

function leadCard(l) {
  const card = document.createElement("article");
  card.className = "lead-card";
  card.draggable = true;
  card.dataset.id = l.id;
  const esc = l.escalatedAt ? '<span class="esc-flag">⚠️ eskaliert</span>' : "";
  card.innerHTML = `
    <div class="lc-head">
      <span class="lc-cat ${l.kategorie}">${CAT_LABEL[l.kategorie] || l.kategorie}</span>
      <span class="lc-time" title="${fmtTime(l.timestamp)}">${fmtAgo(l.timestamp)}</span>
    </div>
    <div class="lc-loc">${l.standort?.adresse || l.bezirk || "Kein Standort"}</div>
    <div class="lc-loc" style="color:var(--text)">${l.ticket || ""} · ${l.telefon || ""}</div>
    ${esc}
    <div class="lc-actions">
      <a href="tel:${l.telefon}" onclick="event.stopPropagation()">📞</a>
      <a href="https://wa.me/${(l.telefon || "").replace(/\D/g, "").replace(/^0/, "41")}" target="_blank" rel="noopener" onclick="event.stopPropagation()">💬</a>
      <button data-open>Details</button>
    </div>`;
  card.addEventListener("click", () => openModal(l.id));
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", l.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  return card;
}

function renderKanban(leads) {
  document.querySelectorAll(".kanban-col").forEach((col) => {
    const status = col.dataset.status;
    const body = col.querySelector(".col-body");
    body.innerHTML = "";
    const items = leads.filter((l) => l.status === status);
    col.querySelector(".count").textContent = items.length;
    items.forEach((l) => body.appendChild(leadCard(l)));
  });
}

/* Drag&Drop: Spalten als Drop-Zonen */
document.querySelectorAll(".kanban-col").forEach((col) => {
  col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drag-over"); });
  col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/plain");
    if (id) setStatus(id, col.dataset.status);
  });
});

/* ---------- Status-Wechsel (inkl. Reaktionszeit-Tracking) ---------- */
async function setStatus(id, status) {
  const lead = allLeads.find((l) => l.id === id);
  if (!lead || lead.status === status || !STATUSES.includes(status)) return;
  const patch = {
    status,
    statusHistory: fs.arrayUnion({ status, at: Date.now() })
  };
  // Reaktionszeit: erster Wechsel weg von "neu" zählt als "kontaktiert"
  if (!lead.kontaktiertAt && lead.status === "neu" && status !== "neu") {
    patch.kontaktiertAt = Date.now();
  }
  try {
    await fs.updateDoc(fs.doc(db, "leads", id), patch);
  } catch (e) { console.error("Status-Update fehlgeschlagen:", e); }
}

/* ---------- Kartenansicht ---------- */
$("view-kanban").addEventListener("click", () => switchView("kanban"));
$("view-map").addEventListener("click", () => switchView("map"));
function switchView(v) {
  $("view-kanban").classList.toggle("active", v === "kanban");
  $("view-map").classList.toggle("active", v === "map");
  $("kanban").classList.toggle("hidden-view", v === "map");
  $("admin-map").classList.toggle("active", v === "map");
  if (v === "map") {
    initAdminMap();
    setTimeout(() => adminMap?.invalidateSize(), 60);
  }
}

function initAdminMap() {
  if (adminMap || typeof L === "undefined") return;
  adminMap = L.map("admin-map").setView([47.41, 8.55], 10);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: "abcd", maxZoom: 18
  }).addTo(adminMap);
  renderMap(getFiltered());
}

function renderMap(leads) {
  if (!adminMap) return;
  mapMarkers.forEach((m) => m.remove());
  mapMarkers = [];
  // Nur offene Anfragen pinnen (gewonnen/verloren sind erledigt)
  leads.filter((l) => l.standort?.lat && !["gewonnen", "verloren"].includes(l.status))
    .forEach((l) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="map-pin-lead ${l.status}">${(CAT_LABEL[l.kategorie] || l.kategorie).split(" ")[0]} ${l.ticket || ""}</span>`,
        iconSize: [0, 0]
      });
      const m = L.marker([l.standort.lat, l.standort.lng], { icon }).addTo(adminMap);
      m.on("click", () => openModal(l.id));
      mapMarkers.push(m);
    });
}

/* ---------- Detail-Modal ---------- */
function openModal(id) {
  const l = allLeads.find((x) => x.id === id);
  if (!l) return;
  currentLeadId = id;
  $("m-ticket").textContent = l.ticket || l.id.slice(0, 8);
  $("m-kategorie").textContent = CAT_LABEL[l.kategorie] || l.kategorie;
  $("m-quelle").textContent = l.quelle || "–";
  $("m-time").textContent = fmtTime(l.timestamp);
  $("m-bezirk").textContent = l.bezirk || "–";
  $("m-telefon").textContent = l.telefon || "–";
  $("m-kontakt").textContent = [l.name, l.firma, l.email].filter(Boolean).join(" · ") || "–";
  $("m-standort").textContent = l.standort?.adresse ||
    (l.standort?.lat ? `${l.standort.lat.toFixed(5)}, ${l.standort.lng.toFixed(5)}` : "–");
  $("m-nachricht").textContent = l.nachricht || "–";
  $("m-preis").value = l.preis ?? "";
  $("m-notizen").value = l.notizen || "";

  const foto = $("m-foto");
  if (l.foto_url) { foto.src = l.foto_url; foto.hidden = false; } else foto.hidden = true;

  $("m-call").href = `tel:${l.telefon}`;
  $("m-wa").href = `https://wa.me/${(l.telefon || "").replace(/\D/g, "").replace(/^0/, "41")}`;

  document.querySelectorAll("#m-status-pills button").forEach((b) =>
    b.classList.toggle("active", b.dataset.s === l.status)
  );

  $("m-history").innerHTML = (l.statusHistory || [])
    .slice().sort((a, b) => a.at - b.at)
    .map((h) => `<li>${fmtTime(h.at)} – ${h.status}</li>`).join("") || "<li>Kein Verlauf</li>";

  $("modal-backdrop").classList.add("open");
}

$("modal-close").addEventListener("click", closeModal);
$("modal-backdrop").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
function closeModal() { $("modal-backdrop").classList.remove("open"); currentLeadId = null; }

document.querySelectorAll("#m-status-pills button").forEach((b) =>
  b.addEventListener("click", async () => {
    if (!currentLeadId) return;
    await setStatus(currentLeadId, b.dataset.s);
    document.querySelectorAll("#m-status-pills button").forEach((x) =>
      x.classList.toggle("active", x === b));
  })
);

$("m-save").addEventListener("click", async () => {
  if (!currentLeadId) return;
  const preis = $("m-preis").value === "" ? null : Number($("m-preis").value);
  try {
    await fs.updateDoc(fs.doc(db, "leads", currentLeadId), {
      notizen: $("m-notizen").value,
      preis
    });
    $("m-save").textContent = "✓ Gespeichert";
    setTimeout(() => ($("m-save").textContent = "Speichern"), 1500);
  } catch (e) { console.error("Speichern fehlgeschlagen:", e); }
});
