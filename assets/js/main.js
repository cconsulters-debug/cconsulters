/* ==================================================================
 * MAIN.JS – auf jeder öffentlichen Seite geladen (defer, kein Modul)
 * Aufgaben: Config-Hydration, Navigation, Scroll-Reveals, Zahlen-
 * Ticker, Live-Statistiken (/api/stats).
 *
 * Wichtig: Kontaktlinks stehen bereits korrekt im HTML (der Build
 * rendert sie aus config.js). Dieses Skript korrigiert sie nur noch,
 * falls config.js zur Laufzeit abweicht – die Seite ist also auch
 * ohne JavaScript vollständig bedienbar.
 * ================================================================== */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};

  /* ---------- 1) Config-Hydration -------------------------------
   * data-cfg="key"          → Textinhalt setzen
   * data-href="tel|wa|mail" → Link-Ziel setzen
   * --------------------------------------------------------------- */
  var addr = CFG.address || {};
  var textMap = {
    companyName: CFG.companyName,
    legalName: CFG.legalName,
    phoneDisplay: CFG.phoneDisplay,
    email: CFG.email,
    uid: CFG.uid,
    officeHours: CFG.officeHours,
    addressStreet: addr.street,
    addressCity: addr.zip && addr.city ? addr.zip + " " + addr.city : null
  };
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = textMap[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });

  var waText = encodeURIComponent(
    "Hallo " + (CFG.companyName || "") + ", ich brauche Hilfe. Mein Standort: "
  );
  var hrefMap = {
    tel: CFG.phone ? "tel:" + CFG.phone : null,
    wa: CFG.whatsapp ? "https://wa.me/" + CFG.whatsapp + "?text=" + waText : null,
    mail: CFG.email ? "mailto:" + CFG.email : null
  };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    var key = el.getAttribute("data-href");
    var v = hrefMap[key];
    if (v) {
      el.setAttribute("href", v);
    } else if (key === "wa") {
      // Kein WhatsApp konfiguriert → Button/Link komplett ausblenden
      el.remove();
    }
  });

  /* ---------- 2) Mobile Navigation ------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
    };

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    // Escape schliesst und gibt den Fokus zurück auf den Button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Klick ausserhalb schliesst das Menü
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    // Navigation innerhalb der Seite (Anker) schliesst das Menü ebenfalls
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  // Aktive Seite in der Navigation markieren
  var path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });

  /* ---------- 3) Scroll-Reveals (IntersectionObserver) ----------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 4) Live-Statistiken --------------------------------
   * Holt Ø Reaktionszeit von /api/stats (Netlify Function → Firestore).
   * Fällt still auf die Werte aus config.js zurück.
   * --------------------------------------------------------------- */
  var fb = CFG.fallbackStats || {};
  function setStat(name, value) {
    if (value == null) return;
    var text = typeof value === "number" ? value.toLocaleString("de-CH") : String(value);
    document.querySelectorAll('[data-stat="' + name + '"]').forEach(function (el) {
      el.textContent = text;
    });
  }
  setStat("reaction", fb.avgReactionMinutes);
  setStat("arrival", fb.avgArrivalMinutes);

  fetch("/api/stats")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      setStat("reaction", d.avgReactionMinutes);
      setStat("arrival", d.avgArrivalMinutes);
    })
    .catch(function () { /* offline/Demo-Modus: Fallback bleibt stehen */ });

  /* ---------- 5) Kleinkram ---------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
