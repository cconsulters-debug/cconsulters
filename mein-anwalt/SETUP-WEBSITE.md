# Website live schalten

Die Website wird aus dem Repo gebaut — es gibt keine doppelte Pflege zwischen
Artifact-Vorschau und echter Seite.

```
app/mein-anwalt-aurum.html   ─┐
recht/*.md                    ├─►  scripts/build_site.py  ─►  site/
beispiele/*.pdf              ─┘
```

`site/` ist Build-Output und bewusst **nicht** im Git (siehe `.gitignore`).

## 1. Lokal bauen und anschauen

```bash
cd mein-anwalt
python3 scripts/build_site.py
python3 -m http.server 8000 --directory site
# → http://localhost:8000
```

Es entstehen: `index.html`, `impressum.html`, `datenschutz.html`, `agb.html`,
`disclaimer.html`, `404.html`, `robots.txt`, `sitemap.xml` und `beispiele/`
(die 80 Beispiel-PDFs).

## 2. Vor dem Livegang ausfüllen — Pflicht

Diese Punkte sind **rechtlich nötig**, nicht optional:

Betreiberangaben und Domain stehen gesammelt in **`site.config.json`** und
werden von dort in Impressum, Datenschutzerklärung und AGB eingesetzt —
sie müssen nicht in den Rechtstexten selbst gepflegt werden. Fehlt eine
Pflichtangabe, meldet der Build das und schreibt einen sichtbaren Marker
in die Seite, damit nichts unbemerkt ohne Anbieterkennzeichnung online geht.

| Wo | Was |
|---|---|
| `site.config.json` → `betreiber` | Name, Rechtsform, Strasse, PLZ/Ort, Sitz, E-Mail; optional Telefon, UID, MWST. Art. 3 Abs. 1 lit. s UWG verlangt eine klare Anbieterkennzeichnung. |
| `site.config.json` → `domain` | Echte Domain. Speist canonical, Open Graph und `sitemap.xml`. |
| `recht/datenschutzerklaerung.md` | Eingesetzte Dienste (Netlify, Firebase, Stripe, Anthropic) und Serverstandorte gegenprüfen. revDSG. |
| `recht/agb.md` | Leistungsumfang, Preise und Rückerstattungsregelung gegenprüfen. |

Danach `python3 scripts/build_site.py` erneut ausführen.

**Die Kontaktadresse muss wirklich erreichbar sein.** Ein Impressum mit einem
Postfach, das keine Mails empfängt, erfüllt seinen Zweck nicht — die Adresse
muss vor dem Livegang eingerichtet sein.

> Die Texte sind sorgfältige Entwürfe, aber **kein Ersatz für eine anwaltliche
> Prüfung**. Vor dem Livegang einmal prüfen lassen — siehe
> `recht/launch-compliance-checkliste.md`.

## 3. Auf Netlify deployen

> **Achtung — in diesem Repo liegen zwei Websites.** Im Wurzelverzeichnis
> steht das Abschleppdienst-Projekt mit einer eigenen `netlify.toml`, und der
> Standard-Branch des Repos (`claude/towing-service-website-b75gud`) gehört
> ebenfalls dazu. Ohne die beiden folgenden Einstellungen deployt Netlify die
> **falsche** Website.

**Variante A — mit Git (empfohlen, deployt bei jedem Push automatisch):**

1. Auf netlify.com → *Add new site* → *Import an existing project* →
   GitHub verbinden → Repo `cconsulters-debug/cconsulters` wählen.
2. Diese beiden Felder von Hand setzen:

   | Feld | Wert |
   |---|---|
   | **Base directory** | `mein-anwalt` |
   | **Branch to deploy** | `claude/swiss-lawyer-prompts-l8rtlo` |

   Build-Command (`python3 scripts/build_site.py`) und Publish-Verzeichnis
   (`site`) liest Netlify danach selbst aus `mein-anwalt/netlify.toml`.
3. *Deploy site* — nach ein bis zwei Minuten läuft die Seite unter einer
   Adresse wie `zufallsname.netlify.app`.

Der Branch lässt sich später unter *Site configuration → Build & deploy →
Branches and deploy contexts* ändern.

**Variante B — ohne Git (schnellster Test, kein Konto nötig):**

Lokal `python3 scripts/build_site.py` ausführen und den Ordner `site/`
auf app.netlify.com/drop ziehen. Damit entfallen beide Stolpersteine oben,
aber es wird auch nichts automatisch aktualisiert.

**Wenn der Build fehlschlägt:** In den Deploy-Logs nachsehen. Häufigste
Ursache ist ein nicht gefundenes `python3`. Dann in Netlify unter
*Site configuration → Environment variables* `PYTHON_VERSION` auf `3.11`
setzen und neu deployen. Das Build-Skript läuft ab Python 3.8.

## 4. Domain verbinden

In Netlify unter *Domain management* die Domain hinzufügen und beim Registrar
(z. B. Hostpoint, Infomaniak) die Nameserver bzw. den CNAME setzen. Das
TLS-Zertifikat stellt Netlify automatisch aus.

Nach dem Domainwechsel `domain` in `site.config.json` anpassen und neu bauen.

## 5. Was jetzt schon live funktioniert — und was nicht

**Funktioniert ohne weitere Einrichtung:**
- Die komplette Seite inkl. 80 Dokumenttypen und Dokumentensuche
- Dokumenterstellung als **Demo**: Vorschau, Konto/Guthaben und TWINT-Ablauf
  laufen lokal im Browser (`localStorage`), der Download ist echt
- Alle Rechtsseiten, Sitemap, robots.txt, Beispiel-PDFs

**Noch nicht aktiv — braucht Zugangsdaten (siehe `SETUP-BACKEND.md`):**
- Echte Texterstellung durch die KI (Anthropic API)
- Echte Zahlungen und Guthaben (Stripe/TWINT)
- Echte Konten über Geräte hinweg (Firebase Auth + Firestore)

Solange das Backend nicht verbunden ist, ist der Zahlungsteil als
**Testmodus** gekennzeichnet und es fliesst kein Geld. Erst nach Schritt 2
und dem Backend-Setup sollte die Seite als echtes Angebot beworben werden.

## 6. Suchmaschinen

Bereits eingebaut: sprechende Titel und Meta-Beschreibungen, `canonical`,
Open Graph, `sitemap.xml`, `robots.txt` und Structured Data
(`WebSite`, `Service`, `FAQPage`) für Rich Results.

Nach dem Livegang: Domain in der
[Google Search Console](https://search.google.com/search-console) und bei
[Bing Webmaster Tools](https://www.bing.com/webmasters) verifizieren und dort
`sitemap.xml` einreichen. Inhaltliche Massnahmen stehen in
`strategie/preise-und-seo.md`.
