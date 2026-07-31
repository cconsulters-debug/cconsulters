/* ==================================================================
 * BUILD – läuft bei jedem Netlify-Build (siehe netlify.toml).
 *
 *   1. Schreibt die gemeinsamen Partials (Head, Header, Footer,
 *      JSON-LD) in die Marker-Blöcke aller statischen Seiten.
 *   2. Generiert pro Bezirk eine eigene SEO-Landingpage unter
 *      /gebiete/<slug>.html.
 *   3. Schreibt sitemap.xml und robots.txt mit absoluten URLs.
 *
 * Der Build ist idempotent: Er ersetzt nur den Inhalt zwischen den
 * Markern. Die eingecheckten HTML-Dateien enthalten das zuletzt
 * gerenderte Ergebnis, damit die Seite auch ohne Build-Lauf
 * vollständig funktioniert.
 * ================================================================== */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  root, CFG, SITE_URL, esc, telHref, waHref,
  head, header, footer, organizationLd, ldScript, breadcrumbLd
} from "./partials.mjs";

const { districts } = JSON.parse(
  readFileSync(join(root, "assets/data/districts.json"), "utf8")
);

/* ==================================================================
 * 1) Statische Seiten: Partials in die Marker schreiben
 *
 * Titel und Descriptions stehen hier zentral – so sieht man beim
 * SEO-Review alle Seiten auf einen Blick nebeneinander.
 * ================================================================== */
const PAGES = [
  {
    file: "index.html",
    path: "/",
    title: "Abschleppdienst Winterthur & Kanton Zürich – 24h Soforthilfe",
    description:
      `Abschleppdienst Winti GmbH – 24h Pannenhilfe & Abschleppdienst ab Winterthur im ganzen Kanton Zürich. Unfallbergung, Starthilfe, Falschparker, Transport. ☎ ${CFG.phoneDisplay}`
  },
  {
    file: "leistungen.html",
    path: "/leistungen.html",
    title: "Leistungen – Unfallbergung, Pannenhilfe & Transport | Abschleppdienst Winti",
    description:
      "Alle Leistungen im Überblick: Unfallbergung, 24h-Pannenhilfe, Falschparker-Umsetzung, Fahrzeugüberführung, Starthilfe und B2B-Service für Garagen & Flotten im Kanton Zürich."
  },
  {
    file: "servicegebiet.html",
    path: "/servicegebiet.html",
    title: "Servicegebiet Kanton Zürich – Alle Bezirke & Anfahrtszeiten | Abschleppdienst Winti",
    description:
      "Abschleppdienst in allen 10 Bezirken des Kantons Zürich: Zürich, Winterthur, Uster, Meilen, Horgen, Dietikon, Bülach, Affoltern, Pfäffikon, Dielsdorf – mit Anfahrtszeiten."
  },
  {
    file: "preise.html",
    path: "/preise.html",
    title: "Preise – Transparente Kosten für Abschleppen & Pannenhilfe | Abschleppdienst Winti",
    description:
      "Transparente Preise: Basispreis plus Kilometerpauschale, Preis-Kalkulator inklusive. Notfälle werden sofort bedient – ohne Preisverhandlung am Strassenrand."
  },
  {
    file: "ueber-uns.html",
    path: "/ueber-uns.html",
    title: `Über uns – Abschleppdienst Winti GmbH, Winterthur | seit ${CFG.foundedYear}`,
    description:
      `Abschleppdienst Winti GmbH – seit ${CFG.foundedYear} in Winterthur, 24h-Einsatzzentrale an der ${CFG.address.street}: eigener Fuhrpark, versicherte Transporte, Einsätze im ganzen Kanton Zürich.`
  },
  {
    file: "kontakt.html",
    path: "/kontakt.html",
    title: "Kontakt & Anfrage – Überführung, B2B, Offerte | Abschleppdienst Winti, Winterthur",
    description:
      "Anfrage für Fahrzeugüberführung, B2B-Partnerschaft oder Offerte senden. Für Notfälle: 24h-Hotline – wir sind sofort unterwegs im Kanton Zürich."
  },
  {
    file: "impressum.html",
    path: "/impressum.html",
    title: "Impressum | Abschleppdienst Winti GmbH, Winterthur",
    description:
      "Impressum der Abschleppdienst Winti GmbH, Winterthur – Firmendaten, Handelsregister-Nummer und Kontaktangaben."
  },
  {
    file: "datenschutz.html",
    path: "/datenschutz.html",
    title: "Datenschutzerklärung | Abschleppdienst Winti GmbH",
    description:
      "Wie die Abschleppdienst Winti GmbH Personendaten bearbeitet: Formulardaten, Standort, Fotos, eingesetzte Dienste und Ihre Rechte nach revDSG."
  },
  {
    file: "404.html",
    path: "/404.html",
    title: "Seite nicht gefunden | Abschleppdienst Winti",
    description: "Diese Seite existiert nicht. Im Notfall erreichen Sie uns rund um die Uhr telefonisch.",
    noindex: true,
    excludeFromSitemap: true
  }
];

/** Ersetzt den Inhalt zwischen <!--@name--> und <!--/@name--> */
function injectPartial(html, name, content, file) {
  const re = new RegExp(`(<!--@${name}-->)[\\s\\S]*?(<!--/@${name}-->)`);
  if (!re.test(html)) {
    throw new Error(`Marker @${name} fehlt in ${file}`);
  }
  return html.replace(re, `$1\n${content}\n$2`);
}

/* Bezirksliste serverseitig rendern: steht damit ohne JavaScript im
   HTML und ist für Suchmaschinen direkt lesbar. */
function districtCards() {
  return districts
    .map(
      (d) => `          <article class="district-card">
            <span class="eta">~${d.eta} Min</span>
            <h3>${esc(d.label)}</h3>
            <p>${esc(d.blurb)}</p>
            <p class="gemeinden"><strong>U.&nbsp;a.:</strong> ${esc(d.gemeinden)}</p>
            <div class="fall">${esc(d.fall)}</div>
            <p class="mt-14"><a class="card-link" href="/gebiete/${d.slug}.html">Abschleppdienst ${esc(d.name)} →</a></p>
          </article>`
    )
    .join("\n");
}

function buildStaticPages() {
  for (const page of PAGES) {
    const file = join(root, page.file);
    let html = readFileSync(file, "utf8");

    html = injectPartial(html, "head", head(page), page.file);
    html = injectPartial(html, "header", header(), page.file);
    html = injectPartial(html, "footer", footer(), page.file);
    if (/<!--@ld-->/.test(html)) {
      html = injectPartial(html, "ld", organizationLd(), page.file);
    }
    if (/<!--@districts-->/.test(html)) {
      html = injectPartial(html, "districts", districtCards(), page.file);
    }

    writeFileSync(file, html);
    console.log(`✓ ${page.file}`);
  }
}

/* ==================================================================
 * 2) Bezirks-Landingpages
 * Kein Duplicate Content: Blurb, Referenz-Fall, Gemeindeliste und
 * Anfahrtszeit sind pro Bezirk unterschiedlich (gepflegt im JSON).
 * ================================================================== */
function districtPage(d, others) {
  const navLinks =
    others
      .slice(0, 4)
      .map((o) => `<li><a href="/gebiete/${o.slug}.html">Abschleppdienst ${esc(o.name)}</a></li>`)
      .join("\n            ") +
    '\n            <li><a href="/servicegebiet.html">Alle Bezirke →</a></li>';

  const title = `Abschleppdienst ${d.name} – Pannenhilfe ${d.name} 24h | Anfahrt ~${d.eta} Min.`;
  const description = `Abschleppdienst & Pannenhilfe im ${d.label} – 24h erreichbar, Anfahrt ca. ${d.eta} Minuten. Unfallbergung, Starthilfe, Transport. Auch in: ${d.gemeinden}.`;

  const serviceLd = ldScript({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Abschleppdienst und Pannenhilfe",
    name: `Abschleppdienst ${d.name}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "AdministrativeArea", name: `${d.label}, Kanton Zürich` },
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: CFG.phone,
      serviceUrl: `${SITE_URL}/gebiete/${d.slug}.html`,
      availableLanguage: "de"
    },
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    }
  });

  const crumbs = breadcrumbLd([
    { name: "Startseite", path: "/" },
    { name: "Servicegebiet", path: "/servicegebiet.html" },
    { name: `Abschleppdienst ${d.name}`, path: `/gebiete/${d.slug}.html` }
  ]);

  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
${head({ path: `/gebiete/${d.slug}.html`, title, description })}
</head>
<body>
${header()}
  <main id="main">
    <section class="section-tight hero">
      <div class="container" style="padding-top:40px;padding-bottom:40px">
        <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
          <a href="/">Start</a> <span aria-hidden="true">›</span>
          <a href="/servicegebiet.html">Servicegebiet</a> <span aria-hidden="true">›</span>
          <span aria-current="page">${esc(d.name)}</span>
        </nav>
        <span class="kicker">Servicegebiet · ${esc(d.label)}</span>
        <h1 class="h1-sub">Abschleppdienst ${esc(d.name)} –<br><span class="accent">in ~${d.eta} Min. bei Ihnen.</span></h1>
        <p class="lead">${esc(d.blurb)}</p>
        <div class="hero-ctas">
          <a class="btn btn-primary btn-lg pulse" data-href="tel" href="${esc(telHref)}">📞 ${esc(CFG.phoneDisplay)}</a>
          ${waHref ? `<a class="btn btn-wa btn-lg" data-href="wa" href="${esc(waHref)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
        </div>
      </div>
    </section>

    <section class="section-tight">
      <div class="container">
        <div class="stats-strip">
          <div class="stat-card"><span class="num">~${d.eta}&nbsp;<small>Min</small></span><span class="stat-label">Anfahrt in den ${esc(d.label)}</span></div>
          <div class="stat-card"><span class="num">24/7</span><span class="stat-label">auch nachts &amp; am Wochenende</span></div>
          <div class="stat-card"><span class="num">seit&nbsp;${CFG.foundedYear}</span><span class="stat-label">im Kanton Zürich unterwegs</span></div>
          <div class="stat-card"><span class="num">100%</span><span class="stat-label">versicherte Transporte</span></div>
        </div>
        <p class="text-dim footnote">Anfahrtszeiten sind Richtwerte bei normalem Verkehr – Preise finden Sie auf der <a href="/preise.html">Preisseite</a>.</p>
      </div>
    </section>

    <section class="section">
      <div class="container grid-2">
        <div>
          <span class="kicker">Vor Ort in ${esc(d.name)}</span>
          <h2>Pannenhilfe ${esc(d.name)} 24h – so helfen wir</h2>
          <ul class="check-list">
            <li>Abschleppen nach Panne oder Unfall – zur Werkstatt Ihrer Wahl</li>
            <li>Starthilfe, Reifenwechsel, Türöffnung direkt vor Ort</li>
            <li>Falschparker-Umsetzung für Private &amp; Verwaltungen</li>
            <li>Fahrzeugüberführungen von und nach ${esc(d.name)}</li>
          </ul>
          <p class="text-dim"><strong>Einsatzgebiet im ${esc(d.label)} u.&nbsp;a.:</strong> ${esc(d.gemeinden)}.</p>
        </div>
        <div class="panel">
          <h2>Typischer Einsatz im ${esc(d.label)}</h2>
          <div class="fall">${esc(d.fall)}</div>
          <p class="mt-18"><a class="btn btn-primary btn-block" href="/#schnellanfrage">Schnellanfrage senden</a></p>
        </div>
      </div>
    </section>

    <section class="section cta-band">
      <div class="container">
        <h2>Panne in ${esc(d.name)}? Wir sind schon fast da.</h2>
        <p class="lead center-lead">Anfahrt ca. ${d.eta} Minuten – 24 Stunden am Tag.</p>
        <a class="btn btn-primary btn-lg pulse" data-href="tel" href="${esc(telHref)}">📞 <span data-cfg="phoneDisplay">${esc(CFG.phoneDisplay)}</span></a>
        ${waHref ? `<a class="btn btn-wa btn-lg" data-href="wa" href="${esc(waHref)}" target="_blank" rel="noopener">WhatsApp schreiben</a>` : ""}
      </div>
    </section>
  </main>
${footer(navLinks)}
${serviceLd}
${crumbs}
</body>
</html>
`;
}

function buildDistrictPages() {
  mkdirSync(join(root, "gebiete"), { recursive: true });
  for (const d of districts) {
    const others = districts.filter((o) => o.slug !== d.slug);
    writeFileSync(join(root, "gebiete", `${d.slug}.html`), districtPage(d, others));
    console.log(`✓ gebiete/${d.slug}.html`);
  }
}

/* ==================================================================
 * 3) sitemap.xml + robots.txt
 * ================================================================== */
function buildSitemap() {
  if (!SITE_URL) {
    console.warn("⚠ SITE_URL/siteUrl nicht gesetzt – sitemap.xml enthält relative URLs.");
  }
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...PAGES.filter((p) => !p.excludeFromSitemap).map((p) => ({ loc: p.path, priority: p.path === "/" ? "1.0" : "0.8" })),
    ...districts.map((d) => ({ loc: `/gebiete/${d.slug}.html`, priority: "0.7" }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
  writeFileSync(join(root, "sitemap.xml"), sitemap);
  console.log(`✓ sitemap.xml (${urls.length} URLs, Basis: ${SITE_URL || "relativ – SITE_URL setzen!"})`);

  // Sitemap-Verweis in robots.txt muss laut Spezifikation absolut sein
  const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  writeFileSync(join(root, "robots.txt"), robots);
  console.log("✓ robots.txt");
}

/* ==================================================================
 * 4) Selbstkontrolle: Links, die ins Leere zeigen, fallen sofort auf
 * ================================================================== */
function checkInternalLinks() {
  const pages = [
    ...PAGES.map((p) => p.file),
    ...districts.map((d) => `gebiete/${d.slug}.html`)
  ];
  const existing = new Set([
    ...readdirSync(root).filter((f) => f.endsWith(".html")).map((f) => "/" + f),
    ...districts.map((d) => `/gebiete/${d.slug}.html`),
    "/",
    "/admin/"
  ]);

  let broken = 0;
  for (const file of pages) {
    const html = readFileSync(join(root, file), "utf8");
    for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      const target = m[1];
      if (target.startsWith("/assets/") || target.startsWith("/api/")) continue;
      if (!existing.has(target)) {
        console.error(`✗ ${file}: toter interner Link → ${target}`);
        broken++;
      }
    }
  }
  if (broken) throw new Error(`${broken} tote interne Links gefunden`);
  console.log("✓ interne Links geprüft");
}

/* ---------- los ---------- */
buildStaticPages();
buildDistrictPages();
buildSitemap();
checkInternalLinks();
console.log("\nBuild fertig.");
