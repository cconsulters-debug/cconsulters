/* ==================================================================
 * MAIN.JS – auf jeder öffentlichen Seite geladen (defer, kein Modul)
 * Aufgaben: Config-Hydration, Navigation, Scroll-Reveals, Zahlen-
 * Ticker, Live-Statistiken (/api/stats), Schema.org JSON-LD.
 * ================================================================== */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};

  /* ---------- 1) Config-Hydration -------------------------------
   * Alle Firmen-/Kontaktdaten kommen aus config.js (eine Quelle).
   * data-cfg="key"  → Textinhalt ersetzen
   * data-href="tel|wa|mail" → Link-Ziel setzen
   * --------------------------------------------------------------- */
  var textMap = {
    companyName: CFG.companyName,
    legalName: CFG.legalName,
    phoneDisplay: CFG.phoneDisplay,
    email: CFG.email,
    addressStreet: CFG.address && CFG.address.street,
    addressCity: CFG.address && (CFG.address.zip + " " + CFG.address.city)
  };
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = textMap[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });

  var waText = encodeURIComponent(
    "Hallo " + (CFG.companyName || "") + ", ich brauche Hilfe. Mein Standort: "
  );
  var hrefMap = {
    tel: "tel:" + (CFG.phone || ""),
    wa: "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + waText,
    mail: "mailto:" + (CFG.email || "")
  };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    var v = hrefMap[el.getAttribute("data-href")];
    if (v) el.setAttribute("href", v);
  });

  /* ---------- 2) Mobile Navigation ------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  // Aktive Seite in der Navigation markieren
  var path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });

  /* ---------- 3) Scroll-Reveals (IntersectionObserver) ----------- */
  if ("IntersectionObserver" in window) {
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

  /* ---------- 4) Zahlen-Ticker (Count-Up für Stat-Cards) --------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (!target || el.dataset.counted) return;
    el.dataset.counted = "1";
    var start = null;
    var dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("de-CH");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 5) Live-Statistiken --------------------------------
   * Holt Ø Reaktionszeit & Einsatzzahl von /api/stats (Netlify
   * Function → Firestore). Fällt still auf config-Werte zurück.
   * --------------------------------------------------------------- */
  var fb = CFG.fallbackStats || {};
  function setStat(name, value) {
    if (value == null) return;
    document.querySelectorAll('[data-stat="' + name + '"]').forEach(function (el) {
      el.textContent = value;
      if (el.hasAttribute("data-count")) el.setAttribute("data-count", value);
    });
  }
  setStat("reaction", fb.avgReactionMinutes);
  setStat("arrival", fb.avgArrivalMinutes);
  fetch("/api/stats")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      if (d.avgReactionMinutes) setStat("reaction", d.avgReactionMinutes);
      if (d.casesHandled) setStat("cases", d.casesHandled);
    })
    .catch(function () { /* offline/Demo-Modus: Fallback bleibt stehen */ });

  /* ---------- 6) Schema.org LocalBusiness + EmergencyService ----- */
  var districts = ["Zürich", "Winterthur", "Uster", "Meilen", "Horgen", "Dietikon", "Bülach", "Affoltern", "Pfäffikon", "Dielsdorf"];
  var ld = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EmergencyService", "AutomotiveBusiness"],
    name: CFG.companyName,
    legalName: CFG.legalName,
    telephone: CFG.phone,
    email: CFG.email,
    url: location.origin,
    address: {
      "@type": "PostalAddress",
      streetAddress: CFG.address && CFG.address.street,
      postalCode: CFG.address && CFG.address.zip,
      addressLocality: CFG.address && CFG.address.city,
      addressRegion: "ZH",
      addressCountry: "CH"
    },
    geo: CFG.baseLocation && {
      "@type": "GeoCoordinates",
      latitude: CFG.baseLocation.lat,
      longitude: CFG.baseLocation.lng
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    },
    areaServed: districts.map(function (d) {
      return { "@type": "AdministrativeArea", name: d + ", Kanton Zürich" };
    }),
    priceRange: "CHF",
    slogan: "24h Abschleppdienst & Pannenhilfe im Kanton Zürich"
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  /* ---------- 7) Kleinkram ---------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
