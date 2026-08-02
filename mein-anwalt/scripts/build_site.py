#!/usr/bin/env python3
"""
Baut aus den Quellen im Repo die deploybare Website nach site/.

Eine Quelle, zwei Ziele: app/mein-anwalt-aurum.html ist gleichzeitig das
Artifact-Fragment und der Rumpf der Website. Dieses Skript packt das Fragment
in ein vollstaendiges HTML-Dokument (head, SEO, Structured Data, Footer mit
den rechtlich noetigen Links) und erzeugt die Rechtstexte aus recht/*.md.

    python3 scripts/build_site.py
"""
from __future__ import annotations

import html
import json
import re
import shutil
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app" / "mein-anwalt-aurum.html"
RECHT = ROOT / "recht"
OUT = ROOT / "site"
CONFIG = ROOT / "site.config.json"

# --------------------------------------------------------------------------
# Betreiberangaben und Domain kommen aus site.config.json, damit sie nur an
# einer Stelle gepflegt werden. Fehlende Pflichtangaben bleiben im Text als
# unuebersehbarer Marker stehen und werden am Ende des Builds gemeldet —
# eine Website ohne Impressum waere nach UWG Art. 3 Abs. 1 lit. s heikel.
# --------------------------------------------------------------------------
CFG = json.loads(CONFIG.read_text(encoding="utf-8"))
BETRIEB = CFG.get("betreiber", {})
DOMAIN = (CFG.get("domain") or "").rstrip("/")

PFLICHT = ["name", "rechtsform", "strasse", "plz_ort", "sitz", "email"]
_fehlend: list[str] = []
_warnungen: list[str] = []


def feld(key: str) -> str:
    val = (BETRIEB.get(key) or "").strip()
    if val:
        return val
    if key in PFLICHT and key not in _fehlend:
        _fehlend.append(key)
    return f"[BITTE AUSFÜLLEN: {key}]" if key in PFLICHT else ""


def fill_tokens(text: str) -> str:
    tel, uid, mwst = feld("telefon"), feld("uid"), feld("mwst")
    werte = {
        "name": feld("name"),
        "rechtsform": feld("rechtsform"),
        "strasse": feld("strasse"),
        "plz_ort": feld("plz_ort"),
        "sitz": feld("sitz"),
        "email": feld("email"),
        "datum": date.today().strftime("%d.%m.%Y"),
        # Optionale Angaben: ganze Zeile entfaellt, wenn nichts hinterlegt ist.
        "telefon_zeile": f"**Telefon:** {tel}" if tel else "",
        "uid_zeile": f"Handelsregister-Nr. / UID: {uid}" if uid else "",
        "mwst_zeile": f"MWST-Nr.: {mwst}" if mwst else "",
    }
    for k, v in werte.items():
        text = text.replace("{{" + k + "}}", v)
    # Durch leere Optionalzeilen entstandene Leerzeilen einsammeln.
    return re.sub(r"\n{3,}", "\n\n", text)

BRAND = "Mein Rechtshelfer & Assistent"
DESCRIPTION = (
    "Rechtssichere Schreiben nach Schweizer Recht in Minuten selbst erstellen: "
    "80 Dokumenttypen zu Miete, Arbeit, Konsum, Betreibung und mehr — ab CHF 9.90, "
    "erstes Dokument gratis."
)

# Favicon: Justitia-Waage, inline als Data-URI, damit die Seite ohne Zusatzdatei auskommt.
FAVICON = (
    "data:image/svg+xml,"
    "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E"
    "%3Crect width='24' height='24' fill='%232B2F22'/%3E"
    "%3Cg fill='none' stroke='%23CDB884' stroke-width='1.6' stroke-linecap='round'"
    " stroke-linejoin='round'%3E%3Cpath d='M12 4v16M6 8h12M6 8l-2.5 5h5zM18 8l-2.5 5h5z'/%3E"
    "%3C/g%3E%3C/svg%3E"
)

LEGAL_PAGES = [
    ("impressum.md", "impressum.html", "Impressum"),
    ("datenschutzerklaerung.md", "datenschutz.html", "Datenschutzerklärung"),
    ("agb.md", "agb.html", "AGB"),
    ("disclaimer.md", "disclaimer.html", "Haftungsausschluss"),
]


# --------------------------------------------------------------------------
# Minimaler Markdown-Wandler — deckt genau die in recht/*.md genutzten
# Auszeichnungen ab (Ueberschriften, Listen, Zitat, Trennlinie, fett/kursiv,
# Code, Links). Bewusst kein Fremdpaket, damit der Build ohne pip auskommt.
# --------------------------------------------------------------------------
def _inline(text: str) -> str:
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", out)
    out = re.sub(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
        r'<a href="\2" target="_blank" rel="noopener">\1</a>',
        out,
    )
    return out


def markdown_to_html(md: str) -> str:
    parts: list[str] = []
    buf: list[str] = []       # offener Absatz
    list_tag: str | None = None
    quote: list[str] = []

    def flush_para() -> None:
        # Erst zusammenfuegen, dann auszeichnen: **fett** darf ueber Zeilenumbrueche
        # im Quelltext laufen. \n markiert dabei die weichen Umbrueche.
        if buf:
            parts.append("<p>" + _inline("\n".join(buf)).replace("\n", "<br>") + "</p>")
            buf.clear()

    def flush_list() -> None:
        nonlocal list_tag
        if list_tag:
            parts.append(f"</{list_tag}>")
            list_tag = None

    def flush_quote() -> None:
        if quote:
            inner = _inline("\n".join(quote)).replace("\n", "<br>")
            parts.append(f"<blockquote>{inner}</blockquote>")
            quote.clear()

    def flush_all() -> None:
        flush_para()
        flush_list()
        flush_quote()

    for raw in md.splitlines():
        line = raw.rstrip()

        if not line.strip():
            flush_all()
            continue

        if line.startswith(">"):
            flush_para()
            flush_list()
            quote.append(line.lstrip("> ").strip())
            continue
        flush_quote()

        if re.fullmatch(r"-{3,}", line.strip()):
            flush_all()
            parts.append("<hr>")
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", line)
        if m:
            flush_all()
            # h1 ist der Seitentitel aus dem Template — Abschnitte beginnen bei h2.
            level = max(2, min(len(m.group(1)), 4))
            parts.append(f"<h{level}>{_inline(m.group(2))}</h{level}>")
            continue

        m = re.match(r"^\s*[-*]\s+(.*)$", line)
        if m:
            flush_para()
            if list_tag != "ul":
                flush_list()
                parts.append("<ul>")
                list_tag = "ul"
            parts.append(f"<li>{_inline(m.group(1))}</li>")
            continue

        m = re.match(r"^\s*\d+[.)]\s+(.*)$", line)
        if m:
            flush_para()
            if list_tag != "ol":
                flush_list()
                parts.append("<ol>")
                list_tag = "ol"
            parts.append(f"<li>{_inline(m.group(1))}</li>")
            continue

        flush_list()
        buf.append(line.strip())

    flush_all()
    return "\n".join(parts)


# --------------------------------------------------------------------------
# Seitengeruest
# --------------------------------------------------------------------------
def head(title: str, desc: str, path: str, extra: str = "") -> str:
    url = DOMAIN + path
    return f"""<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#2B2F22">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{html.escape(BRAND)}">
<meta property="og:locale" content="de_CH">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(title)}">
<meta name="twitter:description" content="{html.escape(desc)}">
{extra}</head>
<body>
"""


LEGAL_NAV = """<header class="bar"><div class="wrap">
  <a class="brand" href="/">
    <span class="monogram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 8h14M5 8l-3 6h6zM19 8l-3 6h6z"/></svg></span>
    <span class="bn">Mein Rechtshelfer<small>&amp; Assistent</small></span>
  </a>
  <nav class="links">
    <a href="/">Startseite</a><a href="/impressum.html">Impressum</a>
    <a href="/datenschutz.html">Datenschutz</a><a href="/agb.html">AGB</a><a href="/disclaimer.html">Haftung</a>
  </nav>
</div></header>
"""


def legal_footer() -> str:
    return f"""<footer><div class="wrap foot-grid">
  <div>
    <h3>{html.escape(BRAND)}</h3>
    <p class="note">KI-gestütztes Werkzeug für allgemeine rechtliche Information zum Schweizer
    Recht. Keine Anwaltskanzlei, keine Rechtsberatung im Sinne des BGFA, kein Mandatsverhältnis.</p>
  </div>
  <div><h3>Rechtliches</h3><div class="srcline">
    <a href="/impressum.html">Impressum</a><br>
    <a href="/datenschutz.html">Datenschutzerklärung</a><br>
    <a href="/agb.html">AGB</a><br>
    <a href="/disclaimer.html">Haftungsausschluss</a></div></div>
</div></footer>
</body>
</html>
"""


def extract_style(fragment: str) -> str:
    m = re.search(r"<style>.*?</style>", fragment, re.S)
    if not m:
        raise SystemExit("FEHLER: kein <style>-Block in app/mein-anwalt-aurum.html gefunden")
    return m.group(0)


def example_files() -> dict[str, str]:
    """Dokumentschluessel -> Beispiel-PDF (Dateien heissen 'NN-<schluessel>.pdf')."""
    beispiele = ROOT / "beispiele"
    if not beispiele.exists():
        return {}
    mapping: dict[str, str] = {}
    for f in sorted(beispiele.glob("*.pdf")):
        m = re.match(r"^\d{2}-(.+)\.pdf$", f.name)
        if m:
            mapping[m.group(1)] = f.name
    return mapping


def doc_keys(fragment: str) -> list[str]:
    """Die Schluessel aus dem DOCS-Objekt des Frontends."""
    script = re.search(r"<script>(.*)</script>", fragment, re.S).group(1)
    i = script.index("const DOCS=")
    j = script.index("{", i)
    depth, start = 0, j
    while j < len(script):
        if script[j] == "{":
            depth += 1
        elif script[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    return re.findall(r'(?:^|[{,\n])\s*"([a-z0-9-]+)"\s*:', script[start:j + 1])


def build_index(fragment: str) -> str:
    """Artifact-Fragment -> vollwertige Startseite."""
    # Der Titel des Fragments wird durch den SEO-Titel im head ersetzt.
    body = re.sub(r"^<title>.*?</title>\s*", "", fragment, count=1, flags=re.S)

    # Beispiel-PDFs bekanntgeben — nur hier, nicht im Artifact-Fragment.
    ex = example_files()
    keys = doc_keys(fragment)
    ohne = [k for k in keys if k not in ex]
    if ohne:
        _warnungen.append(
            f"{len(ohne)} Dokumenttypen ohne Beispiel-PDF: {', '.join(ohne[:5])}"
            + (" …" if len(ohne) > 5 else "")
        )
    ex = {k: v for k, v in ex.items() if k in keys}
    body = body.replace(
        "<script>",
        "<script>window.EXAMPLE_FILES="
        + json.dumps(ex, ensure_ascii=False, separators=(",", ":"))
        + ";</script>\n<script>",
        1,
    )

    faq = {
        "Ist das ein Anwalt?": (
            "Nein. «Mein Rechtshelfer & Assistent» ist ein KI-gestütztes Werkzeug für "
            "allgemeine rechtliche Information zum Schweizer Recht. Es besteht kein "
            "Mandatsverhältnis und es wird keine Rechtsberatung im Sinne des BGFA erbracht."
        ),
        "Was kostet ein Dokument?": (
            "Je nach Komplexität CHF 9.90 (Info), CHF 19.90 (Standard) oder CHF 39.90 "
            "(Premium). Das erste Dokument ist gratis."
        ),
        "Für welches Recht gilt das?": (
            "Ausschliesslich für Schweizer Recht, mit Berücksichtigung kantonaler "
            "Besonderheiten in allen 26 Kantonen."
        ),
        "Kann ich eigene Dokumente hochladen?": (
            "Ja. Du kannst eigenes Aktenmaterial beifügen, damit das erstellte Schreiben "
            "auf deinen konkreten Fall Bezug nimmt."
        ),
    }
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": DOMAIN + "/#website",
                "url": DOMAIN + "/",
                "name": BRAND,
                "inLanguage": "de-CH",
                "description": DESCRIPTION,
            },
            {
                "@type": "Service",
                "name": "Erstellung von Rechtsdokumenten nach Schweizer Recht",
                "serviceType": "Automatisierte Dokumentenerstellung",
                "areaServed": {"@type": "Country", "name": "Schweiz"},
                "provider": {"@type": "Organization", "name": BRAND, "url": DOMAIN + "/"},
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "CHF",
                    "price": "9.90",
                    "description": "Preis ab, je nach Dokumenttyp bis CHF 39.90",
                },
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a},
                    }
                    for q, a in faq.items()
                ],
            },
        ],
    }

    extra = (
        '<script type="application/ld+json">'
        + json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
        + "</script>\n"
    )

    legal_links = """
<div class="wrap" style="padding-top:22px;padding-bottom:6px">
  <div class="srcline" style="font-size:.86rem">
    <a href="/impressum.html">Impressum</a> ·
    <a href="/datenschutz.html">Datenschutzerklärung</a> ·
    <a href="/agb.html">AGB</a> ·
    <a href="/disclaimer.html">Haftungsausschluss</a>
  </div>
</div>
"""
    # Die Rechtslinks gehoeren in den bestehenden Footer, nicht dahinter.
    if "</footer>" in body:
        body = body.replace("</footer>", legal_links + "</footer>", 1)
    else:
        body += legal_links

    return head(f"{BRAND} — Schweizer Rechtsdokumente selbst erstellen",
                DESCRIPTION, "/", extra) + body + "\n</body>\n</html>\n"


def build_legal(md_name: str, out_name: str, label: str, style: str) -> None:
    src = fill_tokens((RECHT / md_name).read_text(encoding="utf-8"))
    # Die erste H1 wird zur Seitenueberschrift im Template.
    m = re.match(r"^#\s+(.*)$", src.splitlines()[0])
    title = m.group(1).strip() if m else label
    if m:
        src = "\n".join(src.splitlines()[1:])

    desc = f"{title} von {BRAND} — KI-gestütztes Werkzeug für rechtliche Information zum Schweizer Recht."
    doc_css = """<style>
  .legal{padding:44px 0 64px}
  .legal h1{font-family:var(--display);text-transform:uppercase;font-size:clamp(1.8rem,4vw,2.8rem);
    letter-spacing:-.03em;color:var(--ink);margin-bottom:6px}
  .legal .upd{font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;
    color:var(--ink-3);margin-bottom:30px}
  .legal h2{font-size:1.25rem;margin:34px 0 10px;letter-spacing:-.01em}
  .legal h3{font-size:1.02rem;margin:24px 0 8px}
  .legal p,.legal li{color:var(--ink-2);max-width:74ch}
  .legal ul,.legal ol{padding-left:22px;line-height:1.7}
  .legal li{margin-bottom:5px}
  .legal a{color:var(--stamp)}
  .legal code{font-family:var(--mono);font-size:.88em;background:var(--surface-2);padding:1px 5px}
  .legal hr{border:none;border-top:1px solid var(--line);margin:30px 0}
  .legal blockquote{margin:20px 0;padding:14px 18px;background:var(--stamp-soft);
    border-left:4px solid var(--stamp);color:var(--ink-2)}
  .legal blockquote p{margin:0}
</style>
"""
    page = (
        head(f"{title} — {BRAND}", desc, "/" + out_name)
        + style
        + doc_css
        + LEGAL_NAV
        + '<main class="legal"><div class="wrap">'
        + f"<h1>{html.escape(title)}</h1>"
        + f'<div class="upd">Stand: {date.today().strftime("%d.%m.%Y")}</div>'
        + markdown_to_html(src)
        + "</div></main>"
        + legal_footer()
    )
    (OUT / out_name).write_text(page, encoding="utf-8")


def build_404(style: str) -> None:
    page = (
        head("Seite nicht gefunden — " + BRAND, "Diese Seite existiert nicht.", "/404.html")
        + style
        + LEGAL_NAV
        + """<main class="legal"><div class="wrap" style="padding:70px 0 90px">
  <h1 style="font-family:var(--display);text-transform:uppercase;font-size:clamp(2rem,6vw,3.4rem);letter-spacing:-.03em">404</h1>
  <p style="margin-top:12px">Diese Seite gibt es nicht (mehr). Zurück zur
  <a href="/" style="color:var(--stamp)">Startseite</a>.</p>
</div></main>"""
        + legal_footer()
    )
    (OUT / "404.html").write_text(page, encoding="utf-8")


def build_seo_files() -> None:
    (OUT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n", encoding="utf-8"
    )
    today = date.today().isoformat()
    urls = [("/", "1.0")] + [("/" + o, "0.3") for _, o, _ in LEGAL_PAGES]
    entries = "\n".join(
        f"  <url><loc>{DOMAIN}{p}</loc><lastmod>{today}</lastmod><priority>{prio}</priority></url>"
        for p, prio in urls
    )
    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n</urlset>\n",
        encoding="utf-8",
    )


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    fragment = APP.read_text(encoding="utf-8")
    style = extract_style(fragment)

    (OUT / "index.html").write_text(build_index(fragment), encoding="utf-8")
    for md_name, out_name, label in LEGAL_PAGES:
        build_legal(md_name, out_name, label, style)
    build_404(style)
    build_seo_files()

    beispiele = ROOT / "beispiele"
    if beispiele.exists():
        shutil.copytree(beispiele, OUT / "beispiele")

    built = sorted(p.name for p in OUT.iterdir())
    print("site/ gebaut:", ", ".join(built))

    for w in _warnungen:
        print("!! " + w)
    if _fehlend:
        print()
        print("!! NOCH NICHT LIVE-TAUGLICH — fehlende Pflichtangaben in site.config.json:")
        for k in _fehlend:
            print(f"   - betreiber.{k}")
        print("   Ohne diese Angaben fehlt die Anbieterkennzeichnung (UWG Art. 3 Abs. 1 lit. s).")
        print("   Die Seiten sind gebaut, tragen an den Stellen aber '[BITTE AUSFÜLLEN: …]'.")
    if "mein-rechtshelfer.ch" in DOMAIN:
        print()
        print("!! Hinweis: 'domain' in site.config.json ist noch der Platzhalter.")
        print("   canonical, Open Graph und sitemap.xml zeigen damit auf eine fremde Adresse.")


if __name__ == "__main__":
    main()
