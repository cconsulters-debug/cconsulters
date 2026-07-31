/* ==================================================================
 * PARTIALS – die eine Quelle für Header, Footer, Notfall-Leiste,
 * <head>-Boilerplate und JSON-LD.
 *
 * Warum: Header und Footer standen vorher in sechs HTML-Dateien und
 * zusätzlich im Bezirks-Generator. Die Kopien waren bereits
 * auseinandergelaufen (unterschiedliche Footer-Links pro Seite).
 * Jetzt existiert jeder Block genau einmal; scripts/build.mjs
 * schreibt ihn in die Marker-Kommentare der Seiten zurück.
 *
 * Wichtig: Kontaktlinks werden hier statisch aus config.js gerendert.
 * Ohne JavaScript funktionieren Anruf-, WhatsApp- und Mail-Buttons
 * dadurch trotzdem – für einen Notfalldienst nicht verhandelbar.
 * ================================================================== */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- config.js im Node-Kontext auswerten ------------------- */
function loadConfig() {
  const src = readFileSync(join(root, "assets/js/config.js"), "utf8");
  const window = {};
  new Function("window", src)(window);
  return window.SITE_CONFIG;
}

export const CFG = loadConfig();
export const SITE_URL = (process.env.SITE_URL || CFG.siteUrl || "").replace(/\/$/, "");

/* ---------- kleine Helfer ----------------------------------------- */
export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const telHref = `tel:${CFG.phone}`;
export const mailHref = `mailto:${CFG.email}`;
export const waHref = CFG.whatsapp
  ? `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(
      `Hallo ${CFG.companyName}, ich brauche Hilfe. Mein Standort: `
    )}`
  : null;

/* WhatsApp-Buttons verschwinden komplett, wenn keine Nummer gesetzt ist */
const wa = (cls, label, extra = "") =>
  waHref
    ? `<a class="${cls}" data-href="wa" href="${esc(waHref)}" target="_blank" rel="noopener"${extra}>${label}</a>`
    : "";

const ICON_PHONE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z"/></svg>';

const ICON_WA =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.2-.3.3-.5v-.5L9.8 7.6c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.8 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.5-.3Z"/></svg>';

const LOGO_SVG =
  '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M3 27h22V15h6l6 7v5h-2" stroke="#ffb300" stroke-width="2.6" stroke-linejoin="round"/><circle cx="11" cy="29" r="3.4" stroke="#f2f5f9" stroke-width="2.4"/><circle cx="29" cy="29" r="3.4" stroke="#f2f5f9" stroke-width="2.4"/><path d="M8 15l9-6v6" stroke="#ffb300" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 6l2 3M24 4l2 3" stroke="#ff3b30" stroke-width="2.2" stroke-linecap="round"/></svg>';

/* ==================================================================
 * <head>: Fonts, Stylesheet, Skripte, Social-Preview
 * ================================================================== */
export function head({ path, title, description, noindex = false }) {
  const canonical = SITE_URL + path;
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
${noindex ? '  <meta name="robots" content="noindex, follow">\n' : ""}  <meta name="theme-color" content="#0b0e12">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/img/favicon.svg">

  <!-- Social-Preview: entscheidend, weil Anfragen per WhatsApp geteilt werden -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(CFG.companyName)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:locale" content="de_CH">
  <meta property="og:image" content="${esc(SITE_URL)}/assets/img/og-cover.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(CFG.companyName)} – 24h Abschleppdienst und Pannenhilfe im Kanton Zürich">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Fonts nicht render-blockierend: erst als print laden, dann aktivieren -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&amp;family=Inter:wght@400;600;700&amp;display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&amp;family=Inter:wght@400;600;700&amp;display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&amp;family=Inter:wght@400;600;700&amp;display=swap"></noscript>

  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="/assets/js/config.js"></script>
  <script src="/assets/js/main.js" defer></script>`;
}

/* ==================================================================
 * Header
 * ================================================================== */
export function header() {
  return `  <a class="skip-link" href="#main">Zum Inhalt springen</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="Startseite">
        ${LOGO_SVG}
        <span><span data-cfg="companyName">${esc(CFG.companyName)}</span><span class="logo-24">&nbsp;24H</span></span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="mainnav" aria-label="Menü öffnen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <nav class="main-nav" id="mainnav" aria-label="Hauptnavigation">
        <a href="/leistungen.html">Leistungen</a>
        <a href="/servicegebiet.html">Servicegebiet</a>
        <a href="/preise.html">Preise</a>
        <a href="/ueber-uns.html">Über uns</a>
        <a href="/kontakt.html">Kontakt</a>
      </nav>
      <div class="header-cta">
        ${wa("btn btn-ghost btn-sm", "WhatsApp")}
        <a class="btn btn-primary btn-sm pulse" data-href="tel" href="${esc(telHref)}" aria-label="Notfall-Hotline anrufen: ${esc(CFG.phoneDisplay)}">
          ${ICON_PHONE}
          <span data-cfg="phoneDisplay">${esc(CFG.phoneDisplay)}</span>
        </a>
      </div>
    </div>
  </header>`;
}

/* ==================================================================
 * Footer + mobile Notfall-Leiste
 * `districtLinks` erlaubt es den Bezirksseiten, auf Nachbarbezirke
 * zu verlinken statt immer auf dieselben vier.
 * ================================================================== */
const DEFAULT_DISTRICT_LINKS = `<li><a href="/gebiete/zuerich.html">Abschleppdienst Zürich</a></li>
            <li><a href="/gebiete/winterthur.html">Abschleppdienst Winterthur</a></li>
            <li><a href="/gebiete/uster.html">Abschleppdienst Uster</a></li>
            <li><a href="/gebiete/buelach.html">Abschleppdienst Bülach</a></li>
            <li><a href="/servicegebiet.html">Alle Bezirke →</a></li>`;

export function footer(districtLinks = DEFAULT_DISTRICT_LINKS) {
  return `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h2 class="footer-h" data-cfg="companyName">${esc(CFG.companyName)}</h2>
          <address class="nap">
            <span data-cfg="legalName">${esc(CFG.legalName)}</span><br>
            <span data-cfg="addressStreet">${esc(CFG.address.street)}</span><br>
            <span data-cfg="addressCity">${esc(CFG.address.zip + " " + CFG.address.city)}</span><br>
            Tel: <a data-href="tel" href="${esc(telHref)}"><span data-cfg="phoneDisplay">${esc(CFG.phoneDisplay)}</span></a><br>
            E-Mail: <a data-href="mail" href="${esc(mailHref)}"><span data-cfg="email">${esc(CFG.email)}</span></a>
          </address>
        </div>
        <div>
          <h2 class="footer-h">Leistungen</h2>
          <ul>
            <li><a href="/leistungen.html#unfall">Unfallbergung</a></li>
            <li><a href="/leistungen.html#panne">Pannenhilfe 24h</a></li>
            <li><a href="/leistungen.html#falschparker">Falschparker-Umsetzung</a></li>
            <li><a href="/leistungen.html#transport">Fahrzeugüberführung</a></li>
            <li><a href="/leistungen.html#b2b">B2B &amp; Flotten</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-h">Servicegebiet</h2>
          <ul>
            ${districtLinks}
          </ul>
        </div>
        <div>
          <h2 class="footer-h">Unternehmen</h2>
          <ul>
            <li><a href="/ueber-uns.html">Über uns</a></li>
            <li><a href="/preise.html">Preise</a></li>
            <li><a href="/kontakt.html">Kontakt &amp; B2B</a></li>
            <li><a href="/impressum.html">Impressum</a></li>
            <li><a href="/datenschutz.html">Datenschutz</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year">${new Date().getFullYear()}</span> <span data-cfg="legalName">${esc(CFG.legalName)}</span> · <span data-cfg="uid">${esc(CFG.uid)}</span></span>
        <span>24/7 Abschleppdienst · Pannenhilfe · Kanton Zürich</span>
      </div>
    </div>
  </footer>

  <div class="emergency-bar" role="region" aria-label="Notfall-Kontakt">
    <a class="btn btn-primary pulse" data-href="tel" href="${esc(telHref)}">
      ${ICON_PHONE}
      Jetzt anrufen
    </a>
    ${wa("btn btn-wa", `${ICON_WA} WhatsApp`)}
  </div>`;
}

/* ==================================================================
 * JSON-LD – statisch im HTML statt per JS nachgeschoben, damit auch
 * Crawler ohne JS-Rendering (und Social-Bots) die Daten sehen.
 * ================================================================== */
export function organizationLd() {
  const districts = [
    "Zürich", "Winterthur", "Uster", "Meilen", "Horgen",
    "Dietikon", "Bülach", "Affoltern", "Pfäffikon", "Dielsdorf"
  ];
  const ld = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EmergencyService", "AutomotiveBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: CFG.companyName,
    legalName: CFG.legalName,
    telephone: CFG.phone,
    email: CFG.email,
    url: SITE_URL + "/",
    image: `${SITE_URL}/assets/img/og-cover.png`,
    foundingDate: String(CFG.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: CFG.address.street,
      postalCode: CFG.address.zip,
      addressLocality: CFG.address.city,
      addressRegion: CFG.address.canton,
      addressCountry: CFG.address.country
    },
    geo: {
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
    areaServed: districts.map((d) => ({
      "@type": "AdministrativeArea",
      name: `${d}, Kanton Zürich`
    })),
    priceRange: "CHF",
    vatID: CFG.uid,
    slogan: "24h Abschleppdienst & Pannenhilfe im Kanton Zürich"
  };
  return ldScript(ld);
}

export function ldScript(obj) {
  // </script> im JSON würde das Script-Tag vorzeitig schliessen
  const json = JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
  return `  <script type="application/ld+json">\n${json}\n  </script>`;
}

/* Breadcrumbs helfen Google, die Bezirksseiten korrekt einzuordnen */
export function breadcrumbLd(trail) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: SITE_URL + t.path
    }))
  });
}
