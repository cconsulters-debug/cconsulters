/* ==================================================================
 * SERVICEGEBIET.JS – Leaflet-Karte (OpenStreetMap, kein API-Key)
 * Rendert die Kanton-Zürich-Karte mit Bezirks-Pins in #home-map
 * (Startseite) und #service-map (Servicegebiet-Seite).
 * ================================================================== */
(function () {
  "use strict";

  function initMap(el, options) {
    if (!el || typeof L === "undefined") return;
    var opts = options || {};

    var map = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true
    }).setView([47.41, 8.55], opts.zoom || 10);

    // Dunkle, ruhige Kartenoptik passend zum Design (Carto Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18
    }).addTo(map);

    fetch("/assets/data/districts.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var bounds = [];
        data.districts.forEach(function (d) {
          bounds.push([d.lat, d.lng]);
          var icon = L.divIcon({
            className: "",
            html: '<span class="district-pin">' + d.name + " · ~" + d.eta + "&prime;</span>",
            iconSize: [0, 0]
          });
          L.marker([d.lat, d.lng], { icon: icon })
            .addTo(map)
            .bindPopup(
              "<strong>" + d.label + "</strong><br>Anfahrt ca. " + d.eta +
              ' Min.<br><a href="/gebiete/' + d.slug + '.html" style="color:#ffb300">Details &rarr;</a>'
            );
        });
        if (bounds.length) map.fitBounds(bounds, { padding: [36, 36] });

        // Einsatzzentrale markieren
        var base = (window.SITE_CONFIG || {}).baseLocation;
        if (base) {
          L.circleMarker([base.lat, base.lng], {
            radius: 8, color: "#ff3b30", fillColor: "#ff3b30", fillOpacity: 0.85, weight: 2
          }).addTo(map).bindPopup("<strong>Einsatzzentrale</strong>");
        }
      })
      .catch(function (e) { console.warn("Karte: Bezirksdaten fehlen", e); });

    return map;
  }

  function boot() {
    initMap(document.getElementById("home-map"), { zoom: 10 });
    initMap(document.getElementById("service-map"), { zoom: 10 });
  }

  // Leaflet lädt mit defer – je nach Reihenfolge ist L schon da oder nicht
  if (typeof L !== "undefined") boot();
  else window.addEventListener("load", boot);
})();
