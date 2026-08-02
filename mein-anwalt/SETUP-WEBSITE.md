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

| Wo | Was |
|---|---|
| `recht/impressum.md` | Name/Firma, Rechtsform, Adresse, E-Mail, ggf. UID/MWST. Art. 3 Abs. 1 lit. s UWG verlangt eine klare Anbieterkennzeichnung. |
| `recht/datenschutzerklaerung.md` | Kontaktstelle, eingesetzte Dienste (Netlify, Firebase, Stripe, Anthropic), Serverstandorte. revDSG. |
| `recht/agb.md` | Firmierung, Gerichtsstand, Preise gegenprüfen. |
| `scripts/build_site.py` → `DOMAIN` | Echte Domain eintragen. Speist canonical, Open Graph und `sitemap.xml`. |

Danach `python3 scripts/build_site.py` erneut ausführen.

> Die Texte sind sorgfältige Entwürfe, aber **kein Ersatz für eine anwaltliche
> Prüfung**. Vor dem Livegang einmal prüfen lassen — siehe
> `recht/launch-compliance-checkliste.md`.

## 3. Auf Netlify deployen

**Variante A — mit Git (empfohlen, deployt bei jedem Push automatisch):**

1. Auf netlify.com → *Add new site* → *Import an existing project* → dieses Repo wählen.
2. Netlify liest `netlify.toml`; Build-Command und Publish-Verzeichnis stimmen bereits.
   Wichtig: **Base directory** auf `mein-anwalt` setzen.
3. Deploy starten.

**Variante B — ohne Git (schnellster Test):**

Lokal `python3 scripts/build_site.py` ausführen und den Ordner `site/`
auf app.netlify.com/drop ziehen.

## 4. Domain verbinden

In Netlify unter *Domain management* die Domain hinzufügen und beim Registrar
(z. B. Hostpoint, Infomaniak) die Nameserver bzw. den CNAME setzen. Das
TLS-Zertifikat stellt Netlify automatisch aus.

Nach dem Domainwechsel `DOMAIN` in `scripts/build_site.py` anpassen und neu bauen.

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
