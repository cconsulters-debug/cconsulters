/* ==================================================================
 * BUILD-GEBIETE – läuft bei jedem Netlify-Build (siehe netlify.toml).
 * Generiert aus /assets/data/districts.json:
 *   1. Eine eigene, einzigartige SEO-Landingpage pro Bezirk
 *      unter /gebiete/<slug>.html  ("Abschleppdienst <Bezirk>")
 *   2. /sitemap.xml mit allen Seiten
 * Kein Duplicate Content: Blurb, Referenz-Fall, Gemeindeliste und
 * Anfahrtszeit sind pro Bezirk unterschiedlich (gepflegt im JSON).
 * ================================================================== */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { districts } = JSON.parse(readFileSync(join(root, "assets/data/districts.json"), "utf8"));
const SITE_URL = (process.env.SITE_URL || process.env.URL || "").replace(/\/$/, "");

const headerFooter = (nav) => ({
  header: `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="Startseite">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M3 27h22V15h6l6 7v5h-2" stroke="#ffb300" stroke-width="2.6" stroke-linejoin="round"/><circle cx="11" cy="29" r="3.4" stroke="#f2f5f9" stroke-width="2.4"/><circle cx="29" cy="29" r="3.4" stroke="#f2f5f9" stroke-width="2.4"/><path d="M8 15l9-6v6" stroke="#ffb300" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 6l2 3M24 4l2 3" stroke="#ff3b30" stroke-width="2.2" stroke-linecap="round"/></svg>
        <span><span data-cfg="companyName">[FIRMENNAME]</span><span class="logo-24">&nbsp;24H</span></span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="mainnav" aria-label="Menü öffnen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <nav class="main-nav" id="mainnav" aria-label="Hauptnavigation">
        <a href="/leistungen.html">Leistungen</a>
        <a href="/servicegebiet.html">Servicegebiet</a>
        <a href="/preise.html">Preise</a>
        <a href="/ueber-uns.html">Über uns</a>
        <a href="/kontakt.html">Kontakt</a>
      </nav>
      <div class="header-cta">
        <a class="btn btn-ghost btn-sm" data-href="wa" href="#" rel="noopener">WhatsApp</a>
        <a class="btn btn-primary btn-sm pulse" data-href="tel" href="#"><span data-cfg="phoneDisplay">044 000 00 00</span></a>
      </div>
    </div>
  </header>`,
  footer: `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4 data-cfg="companyName">[FIRMENNAME]</h4>
          <address class="nap">
            <span data-cfg="legalName">[FIRMENNAME] GmbH</span><br>
            <span data-cfg="addressStreet">Musterstrasse 12</span><br>
            <span data-cfg="addressCity">8005 Zürich</span><br>
            Tel: <a data-href="tel" href="#"><span data-cfg="phoneDisplay">044 000 00 00</span></a><br>
            E-Mail: <a data-href="mail" href="#"><span data-cfg="email">info@example.ch</span></a>
          </address>
        </div>
        <div>
          <h4>Leistungen</h4>
          <ul>
            <li><a href="/leistungen.html#unfall">Unfallbergung</a></li>
            <li><a href="/leistungen.html#panne">Pannenhilfe 24h</a></li>
            <li><a href="/leistungen.html#falschparker">Falschparker-Umsetzung</a></li>
            <li><a href="/leistungen.html#transport">Fahrzeugüberführung</a></li>
          </ul>
        </div>
        <div>
          <h4>Servicegebiet</h4>
          <ul>${nav}</ul>
        </div>
        <div>
          <h4>Unternehmen</h4>
          <ul>
            <li><a href="/ueber-uns.html">Über uns</a></li>
            <li><a href="/preise.html">Preise</a></li>
            <li><a href="/kontakt.html">Kontakt &amp; B2B</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year">2026</span> <span data-cfg="legalName">[FIRMENNAME] GmbH</span></span>
        <span>24/7 Abschleppdienst · Pannenhilfe · Kanton Zürich</span>
      </div>
    </div>
  </footer>
  <div class="emergency-bar" role="region" aria-label="Notfall-Kontakt">
    <a class="btn btn-primary pulse" data-href="tel" href="#">📞 Jetzt anrufen</a>
    <a class="btn btn-wa" data-href="wa" href="#" rel="noopener">WhatsApp</a>
  </div>`
});

function districtPage(d, others) {
  const navLinks = others.slice(0, 5)
    .map((o) => `<li><a href="/gebiete/${o.slug}.html">Abschleppdienst ${o.name}</a></li>`)
    .join("\n            ") + '\n            <li><a href="/servicegebiet.html">Alle Bezirke →</a></li>';
  const { header, footer } = headerFooter(navLinks);

  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Abschleppdienst ${d.name} – Pannenhilfe ${d.name} 24h | Anfahrt ~${d.eta} Min.</title>
  <meta name="description" content="Abschleppdienst &amp; Pannenhilfe im ${d.label} – 24h erreichbar, Anfahrt ca. ${d.eta} Minuten. Unfallbergung, Starthilfe, Transport. Auch in: ${d.gemeinden}.">
  <link rel="canonical" href="/gebiete/${d.slug}.html">
  <meta name="theme-color" content="#0b0e12">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="/assets/js/config.js"></script>
  <script src="/assets/js/main.js" defer></script>
</head>
<body>
${header}
  <main>
    <section class="section-tight hero">
      <div class="container" style="padding-top:40px;padding-bottom:40px">
        <span class="kicker">Servicegebiet · ${d.label}</span>
        <h1 style="font-size:clamp(2.2rem,5.5vw,3.8rem)">Abschleppdienst ${d.name} –<br><span style="color:var(--amber)">in ~${d.eta} Min. bei Ihnen.</span></h1>
        <p class="lead">${d.blurb}</p>
        <div class="hero-ctas">
          <a class="btn btn-primary btn-lg pulse" data-href="tel" href="#">📞 Jetzt anrufen</a>
          <a class="btn btn-wa btn-lg" data-href="wa" href="#" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="section-tight">
      <div class="container">
        <div class="stats-strip">
          <div class="stat-card"><span class="num">~${d.eta}&nbsp;<small style="font-size:1rem">Min</small></span><span class="stat-label">Anfahrt in den ${d.label}</span></div>
          <div class="stat-card"><span class="num">24/7</span><span class="stat-label">auch nachts &amp; am Wochenende</span></div>
          <div class="stat-card"><span class="num">ab&nbsp;150.–</span><span class="stat-label">Pannenhilfe vor Ort (CHF)*</span></div>
          <div class="stat-card"><span class="num">100%</span><span class="stat-label">versicherte Transporte</span></div>
        </div>
        <p class="placeholder-note" style="margin-top:12px">* Beispielpreis (Platzhalter) – Details auf der <a href="/preise.html" style="color:var(--amber)">Preisseite</a>.</p>
      </div>
    </section>

    <section class="section">
      <div class="container grid-2">
        <div>
          <span class="kicker">Vor Ort in ${d.name}</span>
          <h2>Pannenhilfe ${d.name} 24h – so helfen wir</h2>
          <ul style="color:var(--text-dim);line-height:2.1">
            <li>✓ Abschleppen nach Panne oder Unfall – zur Werkstatt Ihrer Wahl</li>
            <li>✓ Starthilfe, Reifenwechsel, Türöffnung direkt vor Ort</li>
            <li>✓ Falschparker-Umsetzung für Private &amp; Verwaltungen</li>
            <li>✓ Fahrzeugüberführungen von/nach ${d.name}</li>
          </ul>
          <p class="text-dim"><strong>Einsatzgebiet im ${d.label} u. a.:</strong> ${d.gemeinden}.</p>
        </div>
        <div class="panel">
          <h3>Referenz aus dem ${d.label}</h3>
          <div class="fall" style="border-left:3px solid var(--amber);background:var(--ink-850);border-radius:0 10px 10px 0;padding:14px 16px;color:var(--text-dim)">${d.fall}</div>
          <p style="margin-top:18px"><a class="btn btn-primary" href="/#schnellanfrage" style="width:100%">Schnellanfrage senden</a></p>
        </div>
      </div>
    </section>

    <section class="section cta-band">
      <div class="container">
        <h2>Panne in ${d.name}? Wir sind schon fast da.</h2>
        <p class="lead" style="margin:0 auto 26px">Anfahrt ca. ${d.eta} Minuten – 24 Stunden am Tag.</p>
        <a class="btn btn-primary btn-lg pulse" data-href="tel" href="#">📞 <span data-cfg="phoneDisplay">044 000 00 00</span></a>
        <a class="btn btn-wa btn-lg" data-href="wa" href="#" rel="noopener">WhatsApp</a>
      </div>
    </section>
  </main>
${footer}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Abschleppdienst und Pannenhilfe",
    "areaServed": { "@type": "AdministrativeArea", "name": "${d.label}, Kanton Zürich" },
    "availableChannel": { "@type": "ServiceChannel", "servicePhone": "[TELEFON]" },
    "hoursAvailable": "Mo-Su 00:00-24:00"
  }
  </script>
</body>
</html>
`;
}

/* ---------- Seiten schreiben ---------- */
mkdirSync(join(root, "gebiete"), { recursive: true });
for (const d of districts) {
  const others = districts.filter((o) => o.slug !== d.slug);
  writeFileSync(join(root, "gebiete", `${d.slug}.html`), districtPage(d, others));
  console.log(`✓ gebiete/${d.slug}.html`);
}

/* ---------- Sitemap ---------- */
const staticPages = ["/", "/leistungen.html", "/servicegebiet.html", "/preise.html", "/ueber-uns.html", "/kontakt.html"];
const urls = [
  ...staticPages,
  ...districts.map((d) => `/gebiete/${d.slug}.html`)
];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(root, "sitemap.xml"), sitemap);
console.log(`✓ sitemap.xml (${urls.length} URLs, Basis: ${SITE_URL || "relativ – SITE_URL setzen!"})`);
