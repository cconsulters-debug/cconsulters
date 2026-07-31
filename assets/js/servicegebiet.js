/* ==================================================================
 * SERVICEGEBIET.JS – Leaflet-Karte (OpenStreetMap, kein API-Key)
 *
 * Leaflet (~150 KB CSS+JS) wird erst geladen, wenn eine Karte in
 * Sichtweite kommt. Vorher kostet die Karte auf der Startseite nichts
 * – dort ist sie reine Dekoration, während der Notfall-Button oben
 * sofort da sein muss.
 * ================================================================== */
(function () {
  "use strict";

  var LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  var LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  var leafletPromise = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      document.head.appendChild(css);

      var js = document.createElement("script");
      js.src = LEAFLET_JS;
      js.async = true;
      js.onload = function () { resolve(window.L); };
      js.onerror = function () { reject(new Error("Leaflet konnte nicht geladen werden")); };
      document.head.appendChild(js);
    });
    return leafletPromise;
  }

  var districtsPromise = null;
  function loadDistricts() {
    if (!districtsPromise) {
      districtsPromise = fetch("/assets/data/districts.json")
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (d) { return d.districts || []; });
    }
    return districtsPromise;
  }

  function renderMap(L, el, districts) {
    el.textContent = "";  // Platzhaltertext entfernen
    el.classList.remove("is-loading");

    var map = L.map(el, { scrollWheelZoom: false, attributionControl: true })
      .setView([47.41, 8.55], 10);

    // Dunkle, ruhige Kartenoptik passend zum Design (Carto Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18
    }).addTo(map);

    var bounds = [];
    districts.forEach(function (d) {
      bounds.push([d.lat, d.lng]);
      var pin = document.createElement("span");
      pin.className = "district-pin";
      pin.textContent = d.name + " · ~" + d.eta + "′";

      var popup = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = d.label;
      var link = document.createElement("a");
      link.href = "/gebiete/" + encodeURIComponent(d.slug) + ".html";
      link.className = "link-amber";
      link.textContent = "Details →";
      popup.appendChild(title);
      popup.appendChild(document.createElement("br"));
      popup.appendChild(document.createTextNode("Anfahrt ca. " + d.eta + " Min."));
      popup.appendChild(document.createElement("br"));
      popup.appendChild(link);

      L.marker([d.lat, d.lng], {
        icon: L.divIcon({ className: "", html: pin.outerHTML, iconSize: [0, 0] }),
        alt: "Abschleppdienst " + d.name
      })
        .addTo(map)
        .bindPopup(popup);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [36, 36] });

    // Einsatzzentrale markieren
    var base = (window.SITE_CONFIG || {}).baseLocation;
    if (base) {
      L.circleMarker([base.lat, base.lng], {
        radius: 8, color: "#ff3b30", fillColor: "#ff3b30", fillOpacity: 0.85, weight: 2
      })
        .addTo(map)
        .bindPopup("<strong>Einsatzzentrale</strong>");
    }
  }

  function activate(el) {
    if (el.dataset.mapReady) return;
    el.dataset.mapReady = "1";
    el.classList.add("is-loading");

    Promise.all([loadLeaflet(), loadDistricts()])
      .then(function (res) { renderMap(res[0], el, res[1]); })
      .catch(function (e) {
        console.warn("Karte konnte nicht geladen werden:", e);
        el.classList.remove("is-loading");
        el.innerHTML =
          '<p class="map-fallback">Die Karte ist gerade nicht verfügbar. ' +
          'Alle Bezirke mit Anfahrtszeiten finden Sie auf der ' +
          '<a href="/servicegebiet.html">Servicegebiet-Seite</a>.</p>';
      });
  }

  var maps = document.querySelectorAll("[data-map-lazy]");
  if (!maps.length) return;

  if ("IntersectionObserver" in window) {
    // 300 px Vorlauf: die Karte steht, bevor der Nutzer sie erreicht
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            io.unobserve(e.target);
            activate(e.target);
          }
        });
      },
      { rootMargin: "300px" }
    );
    maps.forEach(function (el) { io.observe(el); });
  } else {
    maps.forEach(activate);
  }
})();
