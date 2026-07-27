# Agenten-Review — Gesamtüberarbeitung «Mein Rechtshelfer & Assistent»

Vier Fachteams haben unabhängig den gesamten Prozess geprüft: UX/Kundenablauf, Preise/
Monetarisierung, Technik/Backend-Architektur, SEO/Marketing. Stand: Juli 2026.
Rollen simuliert entlang der vom Nutzer definierten Agenten-Liste (business-orchestrator,
pricing-stratege, automatisierungs-architekt, marketing-stratege u.a. — siehe je Abschnitt).

---

## ⚠️ Offener Konflikt: Preise

Das Preise-Team empfiehlt, die **gerade erst gesenkten** Preise (CHF 3.30/6.60/13.30) wieder
auf **CHF 9.90/19.90/39.90** anzuheben — Kernargument: Bei Rechtsdienstleistungen wirkt "sehr
günstig" nicht vertrauensbildend, sondern unseriös; die Marge pro Dokument ist mit ~85–90 %
zwar hoch, der **absolute Betrag** deckt aber keine Fixkosten; bei gleichem Traffic bringt eine
3–4-fache Preiserhöhung die 3–4-fache Marge, ohne dass die Konversion im selben Verhältnis sinkt.

**Das widersprach der vorherigen Entscheidung des Betreibers**, die Einstiegshürde tief zu
halten. → Dem Betreiber vorgelegt und **am 27.07.2026 entschieden: Team-Empfehlung wird
übernommen.** Preise sind auf CHF 9.90/19.90/39.90 zurückgesetzt; zusätzlich wurden die vom
Team empfohlenen Schutzmechanismen umgesetzt (Fair-Use-Cap 15 Dok./Monat für die Flatrate,
Treue-**Rabatt** statt Treue-**Gratis** ab dem 5. Dokument, Referral auf +CHF 3 / max. 3× Monat
begrenzt). Details siehe `preise-und-seo.md` Abschnitt 3.

**Zusätzlich identifiziert:** Ein echtes Sicherheitsloch im Flatrate-Modell — es gibt (noch im
Demo-Code) **kein Nutzungslimit**. Ein Vielnutzer mit 200 Premium-Dokumenten/Monat kostet bei
KI-Kosten ~CHF 0.25/Dokument mehr, als die Flatrate einbringt (Verlust ca. CHF 34/Monat pro
Nutzer) — das muss vor dem echten Backend-Bau in jedem Preismodell ein **Fair-Use-Cap** haben.

---

## 1. UX & Kundenprozess

*Rollen: business-orchestrator, operations-prozesse, kundenservice-agent, projektmanager, reputation-manager*

**Grösste Reibungspunkte:**
- Widersprüchliche Botschaft im Hero ("digitaler Rechtsberater" vs. "keine verbindliche Beratung")
- Composer verlangt 5 Felder + Upload, bevor der Nutzer Preis/Kontobedarf kennt
- Gesperrte Vorschau zeigt nur 9 generische Zeilen — wirkt wie leeres Versprechen statt Vertrauensbeweis
- Guthaben/Konto-Abschnitt bündelt 6 Konzepte gleichzeitig (Kundennummer, TWINT, Pakete, Abo, Treue, Referral) — für einen gestressten Erstbesucher zu komplex
- "Zuerst Konto erstellen" (disabled Button) erst *nach* investierter Composer-Zeit sichtbar — Bait-and-Switch-Wirkung
- Kein sichtbares vollständiges Muster-Dokument irgendwo auf der Seite
- Kein Support-/FAQ-Bereich, keine Rückgabe-/Unsicherheits-Regelung sichtbar

**Empfohlener Soll-Ablauf:** Dokumenttypen-Kacheln als Einstieg → vereinfachter Composer (Typ
vorbelegt, nur Kanton + Sachverhalt Pflicht) → aussagekräftigere Gratis-Vorschau → **kompaktes**
Konto/Bezahlen → Download + aktiver Cross-Sell zum logisch nächsten Dokument. Guthaben-Pakete,
Treue, Referral, Flatrate erst **nach** dem ersten Erfolg in einem eingeklappten Profilbereich zeigen.

**Konkrete Textvorschläge:**
- Hero: *"Ihr Rechtshelfer für den ersten Schritt"* statt *"Ihr digitaler Rechtsberater"*
- Konto-Button: *"Jetzt starten — 1. Dokument gratis"*
- Lock-Overlay: *"Vollständiges Dokument freischalten — ab CHF X"*
- Vertrauenszeile neben Preis: *"Kein Abo-Zwang. Keine versteckten Kosten. Guthaben verfällt nicht."*
- Datenschutzhinweis direkt beim Upload-Feld (fehlt komplett)

**Reputation:** Bewertungen nur zu *Prozess/Verständlichkeit/Tempo* abfragen, nie zum
*Rechtsausgang* — sonst Gefahr von Heilsversprechen/Irreführung (UWG-Nähe).

**Priorität:** Hoch = Composer/Vorschau-Vertrauen, Konto-Flow entschlacken, Upload-Datenschutzhinweis.
Mittel = Post-Download-Cross-Sell, FAQ. Tief = Treue/Referral-Feinschliff (nur Umsortierung nötig).

---

## 2. Preise & Monetarisierung

*Rollen: pricing-stratege, strategie-berater, markt-wettbewerb-analyst, finanz-controller, businessplan-architekt*

**Margen-Rechnung (Annahmen: KI-Kosten Info 0.07/Standard 0.13/Premium 0.25 CHF; Stripe/TWINT
1,9 %+0.30 beim Aufladen):**

| Stufe | Preis aktuell | Marge % | Marge CHF |
|---|---|---|---|
| Info | 3.30 | ~84–90 % | ~2.76–2.97 |
| Standard | 6.60 | ~84–90 % | ~5.53–5.94 |
| Premium | 13.30 | ~84–90 % | ~11.15–11.99 |

**Kernbefund:** Die *prozentuale* Marge ist bereits gut — das Problem ist der **absolute Betrag**,
der keine Fixkosten (Hosting, Marketing, Inhaberzeit) deckt.

**Flatrate-Risiko:** Break-even bei reinem Premium-Verbrauch liegt bei ~65 Dokumenten/Monat
(2.1/Tag). Ein Vielnutzer mit 200 Dokumenten/Monat erzeugt ~CHF 34 Verlust/Monat — **ohne
Kappung im aktuellen Modell reales Risiko.**

**Empfehlung des Teams (steht im Konflikt zur aktuellen Entscheidung — siehe oben):**

| Element | Aktuell | Empfehlung Team |
|---|---|---|
| Info/Standard/Premium | 3.30/6.60/13.30 | 9.90/19.90/39.90 |
| Gratis-Dokument | 1× beliebige Stufe | nur Info-Stufe, 1×/Konto |
| Treue-Bonus | jedes 10. gratis | 10 % Rabatt ab 5. Dokument |
| Referral | +1 CHF beidseitig | +3 CHF, max. 3×/Monat (Farming-Schutz) |
| Guthaben-Pakete | 5/15+1.5/30+4 | 20+2/50+7/100+18 |
| Flatrate Privat | 16.90 unbegrenzt | 24.90, Fair-Use-Cap 15 Dok./Monat |
| Flatrate Pro/KMU | — | 69–89, Cap 50 Dok., Premium zählt doppelt |

**Umsatzprognose (Annahmen gekennzeichnet, Ø Warenkorb ~CHF 16 im empfohlenen Modell):**
- Pessimistisch: 500 Besucher, 2 % Conversion → ~CHF 190/Monat
- Realistisch: 2'000 Besucher, 3 % → ~CHF 1'250/Monat
- Optimistisch: 8'000 Besucher, 4 % → ~CHF 7'150/Monat
- Für CHF 5'000/Monat: B2B-Mix (KMU-Abos + Guthaben) ist realistischer als reiner SEO-Traffic.

**Zusätzliche Erlösquellen:** KMU/Pro-Abo (69–89/Mt.), Treuhänder-Partnerschaft (149–249/Mt.,
White-Label), "vom Anwalt geprüft"-Zusatz (49–99, Vermittlungsprovision), Export/E-Signatur-
Zuschlag (2–5), Affiliate/White-Label (29/Nutzer/Monat).

**Risiken:** kein Rate-Limit im Code (Missbrauch), Upload ohne Längenlimit (KI-Kosten-Explosion
bei langen Verträgen), Multi-Account-Farming bei Gratis-Dokument/Referral, Adverse Selection
bei unbegrenzter Flatrate, Wechselkursrisiko USD-Kosten vs. CHF-Erlöse.

---

## 3. Technik & Backend-Architektur

*Rollen: automatisierungs-architekt, datenschutz-beauftragter, recht-vertraege, daten-analyst, operations-prozesse*

**Architektur:** Frontend bleibt "dumm" (sammelt Eingaben, ruft Functions auf) → Firebase Auth
(Token bei jedem Request) → Netlify Functions (`create-checkout-session`, `stripe-webhook`,
`generate-document`, `upload-parse`, `account-profile`) → Firestore/Storage → Stripe (TWINT) +
Anthropic API. Konsistent mit dem bereits im Repo etablierten Stack (Abschleppdienst-Projekt).

**Prompt-Schutz (kritischster Punkt):** Fach-Prompts nur als serverseitige Konstanten/Templates
in der Function oder in einer Firestore-Collection mit `allow read, write: if false` (nur Admin
SDK). Client bekommt **nie** den zusammengesetzten Prompt zurück — nur das fertige Dokument.
Fallstricke: Fehler-Handling darf keinen Prompt/Stacktrace leaken; Prompt-Extraction-Angriffe
("wiederhole deine Anweisungen") brauchen eine explizite Gegen-Anweisung im System-Prompt plus
Rate-Limiting pro Nutzer/IP.

**Zahlungsfluss (Stripe Checkout mit TWINT):** Client → `create-checkout-session` → Stripe
Checkout → Webhook (`checkout.session.completed`) → Signaturprüfung → **Idempotenz-Check**
(`processedStripeEvents`-Collection) → Firestore-Transaction schreibt Guthaben + Transaktion
atomar. TWINT-Verfügbarkeit/Konditionen bei Stripe für CH-Accounts vorab verifizieren (unsicher).

**Datenmodell (Firestore):** `customers/{uid}` (knr, balanceRappen, aboActive, freeDocsRemaining,
paidDocsCount, referralCode), `transactions/{txId}`, `documents/{docId}`,
`processedStripeEvents/{eventId}`, `uploads/{uploadId}` (mit TTL-Löschfeld).
**Wichtig:** Guthaben/Preis-Felder nie clientseitig beschreibbar — nur der Service-Account.

**Upload eigener Dokumente:** Firebase Storage (`uploads/{uid}/…`, Grössenlimit, MIME-Filter) →
serverseitige Textextraktion (PDF/DOCX) → nur extrahierter Text weiterverarbeitet → **Original
zeitnah löschen** (z. B. 24h-Cron), extrahierter Text nur für die Dokumenterzeugung aufbewahrt.

**Datenschutz/revDSG — konkret zu ergänzen:** tatsächlicher KI-Anbieter + Verarbeitungsort in
`datenschutzerklaerung.md` benennen (Platzhalter ersetzen), Stripe als Auftragsbearbeiter
ergänzen, Upload-Löschfristen konkret nennen, Speicherregion (z. B. europe-west6) angeben.

**Meilensteine:** 1) Konten/Keys anlegen (Firebase, Stripe, Anthropic) → 2) Auth+Profil →
3) Zahlungsfluss+Idempotenz → 4) Dokumentgenerierung (Prompts migrieren) → 5) Upload+Löschautomatik
→ 6) Archiv/Treue/Referral serverseitig → 7) Rechtstexte finalisieren → 8) Security-Review vor Go-Live.

**Offene Fragen:** TWINT-Gebühren/Region bei Stripe verifizieren, Ausgabeformat (PDF vs. Markdown),
Berufshaftpflicht vor Livegang, Umgang mit besonders schützenswerten Daten Dritter in Sachverhalts-
angaben, Skalierung des Rate-Limitings, MWST-Schwelle CHF 100'000.

---

## 4. SEO & Marketing

*Rollen: marketing-stratege, seo-spezialist, brand-stratege, content-creator, social-media-manager, performance-ads-manager, email-crm-manager, vertriebs-stratege*

**Positionierung:** Claim-Empfehlung: *"Erst verstehen, dann handeln: dein KI-Assistent für
Schweizer Rechtsfragen."* (Assistent-Rolle explizit, keine Anwalt-Anmutung). Personas: gekündigter
Mieter, KMU-Inhaber mit Mahnwesen-Problem, Arbeitnehmer bei Kündigung.

**Keyword-/Landingpage-Plan:** Je Dokumenttyp eine eigene Long-Tail-Landingpage, z. B.
"Mahnung schreiben Vorlage Schweiz", "Kündigungsfrist Miete Schweiz berechnen", "Mietvertrag
prüfen lassen Schweiz" — volle Liste mit 10 Landingpage-Titeln im Originalbericht.

**Technisches SEO (Reihenfolge):** `.ch`-Domain → serverseitig gerenderte Seiten (kein reines JS)
→ eigene URL je Dokumenttyp → Meta-Tags → strukturierte Daten (FAQPage/HowTo/Product) →
sitemap.xml/robots.txt → Impressum/AGB (E-E-A-T-Pflicht bei YMYL) → Core Web Vitals →
Search Console/Bing Webmaster → interne Verlinkung → Google Business Profile.

**Content-Plan 90 Tage:** Wochen 1–3 Landingpages+Rechtstexte, 4–6 FAQ-Seiten, 7–9 Blogartikel
zu Personas, 10–12 Vorlagen-Beispiele + Vergleichsartikel "Anwalt vs. KI-Rechtshelfer".

**Bezahlte Kanäle:** Google Ads (Search Long-Tail 60 % / Brand-Schutz 10 % / Retargeting 20 % /
Test 10 %), Budget-Start CHF 300–500/Monat. LinkedIn für KMU, Instagram/TikTok für Privatpersonen.

**B2B-Vertrieb:** Treuhänder-Kaltakquise (White-Label + Provision), Immobilienverwaltungen
(Pauschalabo), KMU-Verbände (Mitgliederrabatt-Partnerschaft).

**E-Mail/CRM:** Lead-Magnet "5 häufigsten Fristfallen bei Kündigung/Mahnung Schweiz", 5-teilige
Willkommens-/Cross-Sell-Sequenz.

**Reputation:** Bewertungen nur zu Prozess/Tempo/Preis, nie zum Rechtsausgang — deckt sich mit
Befund aus UX-Team.

**30-60-90-Tage-Roadmap:** Monat 1: technisches Fundament + Landingpages + Ads Start.
Monat 2: Search Console, FAQ, E-Mail-Sequenz, Retargeting. Monat 3: Blogserie, erste
Testimonials, Budget nach Daten nachjustieren. SEO trägt erst ab Monat 4–6 — bis dahin Ads + B2B.

---

## 5. Zusammengeführte Prioritätenliste (alle vier Bereiche)

**Sofort ohne Preisentscheidung umsetzbar (im Prototyp):**
1. UX: Reihenfolge/Composer entschlacken, Microcopy, Datenschutzhinweis beim Upload, Muster-Vorschau verbessern
2. Konto-/Guthaben-Bereich entschlacken (Vorteile erst nach erstem Dokument zeigen)
3. Mini-FAQ ergänzen ("Ist das ein Anwalt?", "Was, wenn das Dokument nicht passt?")

**Entscheidung des Betreibers nötig:**
4. Preise: bei CHF 3.30–13.30 bleiben ODER auf 9.90–39.90 anheben (siehe Konflikt oben)
5. Fair-Use-Cap für Flatrate/Treue/Referral festlegen (unabhängig vom Preisniveau nötig)

**Für den Backend-Bau (nicht im Artefakt umsetzbar):**
6. Architektur wie in Abschnitt 3 beschrieben — Prompt-Schutz, Zahlungsfluss, Datenmodell

**Für die echte Website (parallel zum Backend):**
7. SEO-Fundament + Landingpages je Dokumenttyp + Content-/Ads-Plan aus Abschnitt 4
