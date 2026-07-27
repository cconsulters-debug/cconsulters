# Business-Agenten – Übersicht & Anleitung

26 spezialisierte KI-Agenten für alle Bereiche der Unternehmensführung. Jeder Agent hat
ein eigenes Fachgebiet, eigene Arbeitsmethodik und feste Qualitätsregeln — dadurch
liefern sie deutlich Konkreteres als eine allgemeine Anfrage an den Chat.

Die Agenten liegen in `.claude/agents/` und sind sofort einsatzbereit.

---

## Wenn du nicht weisst, welchen Agenten du brauchst

Nimm **`business-orchestrator`**. Er zerlegt dein Anliegen, findet den Engpass und sagt
dir, welche Fach-Agenten in welcher Reihenfolge arbeiten sollen.

```
Nutze den business-orchestrator: Ich habe zu wenig Aufträge und weiss nicht, woran es liegt.
```

## Erster Schritt: Firmenprofil ausfüllen

`docs/firmenprofil.md` ist die gemeinsame Wissensbasis. **Jeder** Agent liest sie zuerst.
Einmal 30 Minuten investieren spart bei jedem weiteren Einsatz Rückfragen und macht die
Ergebnisse spürbar konkreter. Was du nicht weisst, lässt du als `[TODO]` stehen — die
Agenten fragen dann gezielt nach, statt zu raten.

---

## Alle Agenten

### Strategie & Führung
| Agent | Wofür | Modell |
|---|---|---|
| `business-orchestrator` | Aufgabe zerlegen, Engpass finden, Agenten koordinieren | Opus |
| `strategie-berater` | Positionierung, Geschäftsmodell, Wachstumshebel, neue Geschäftsfelder | Opus |
| `markt-wettbewerb-analyst` | Konkurrenz, Preise im Markt, Nachfrage, Marktgrösse — mit Quellen | Opus |
| `businessplan-architekt` | Businessplan, Bankunterlagen, Finanzierung, Pitch | Opus |
| `pricing-stratege` | Preise, Pakete, Margen, Preiserhöhung inkl. Kundenbrief | Opus |

### Marketing
| Agent | Wofür | Modell |
|---|---|---|
| `marketing-stratege` | Marketingplan, Wunschkunde, Kanäle mit Budget, Funnel | Opus |
| `brand-stratege` | Markenkern, Tonalität, Botschaften, Claim, Namensfindung | Sonnet |
| `content-creator` | Website-Texte, Landingpages, Blog, Newsletter, Flyer, Anzeigen | Sonnet |
| `seo-spezialist` | Google-Sichtbarkeit, Keywords, On-Page, Technik, lokale Suche | Sonnet |
| `social-media-manager` | Redaktionsplan, fertige Beiträge, Plattformstrategie | Sonnet |
| `performance-ads-manager` | Google Ads, Meta Ads: Aufbau, Texte, Budget, Kontoprüfung | Sonnet |
| `email-crm-manager` | Newsletter, Automationen (Nachfassen, Reaktivierung), CRM | Sonnet |

### Vertrieb
| Agent | Wofür | Modell |
|---|---|---|
| `vertriebs-stratege` | Verkaufsprozess, Gesprächsleitfaden, Einwände, Pipeline | Opus |
| `offerten-schreiber` | Offerten, Kostenvoranschläge, Ausschreibungen | Sonnet |
| `kaltakquise-outreach` | Neukundenansprache, E-Mail-Sequenzen, Telefonleitfaden | Sonnet |

### Kunde
| Agent | Wofür | Modell |
|---|---|---|
| `kundenservice-agent` | Antworten auf Anfragen und Beschwerden, FAQ, Supportprozess | Sonnet |
| `reputation-manager` | Bewertungen sammeln, auf Rezensionen antworten, Krisen | Sonnet |

### Finanzen & Recht
| Agent | Wofür | Modell |
|---|---|---|
| `finanz-controller` | Marge, Break-even, Liquidität, Budget, Stundensatz, Kennzahlen | Opus |
| `buchhaltung-assistent` | Rechnungen, Mahnungen, Belege, MWST-Vorbereitung | Sonnet |
| `recht-vertraege` | AGB, Verträge, Haftung, Vertragsprüfung | Opus |
| `datenschutz-beauftragter` | Datenschutzerklärung, Cookies, revDSG/DSGVO, Datenpannen | Opus |

### Betrieb
| Agent | Wofür | Modell |
|---|---|---|
| `operations-prozesse` | Abläufe verschlanken, SOPs, Checklisten, Engpässe | Sonnet |
| `hr-personal` | Stelleninserate, Interviews, Verträge, Einarbeitung, Zeugnisse | Sonnet |
| `projektmanager` | Zeitpläne, Meilensteine, Verantwortlichkeiten, Risiken | Sonnet |

### Daten
| Agent | Wofür | Modell |
|---|---|---|
| `daten-analyst` | Auswertungen, Trichteranalyse, Kundenherkunft, Monatsreport | Sonnet |
| `automatisierungs-architekt` | Was lohnt sich zu automatisieren, Tools, KI-Einsatz, Amortisation | Opus |

---

## So benutzt du sie

**Automatisch:** Beschreibe einfach dein Anliegen. Claude wählt anhand der
Beschreibungen selbst den passenden Agenten.

```
Schreib mir eine Offerte für den Transport von 3 Fahrzeugen nach Zürich.
```

**Ausdrücklich:** Nenne den Agenten beim Namen, wenn du genau weisst, was du willst.

```
Nutze den pricing-stratege: Prüf meine Preise für Nachteinsätze.
```

**Mehrere hintereinander:** Ergebnisse bauen aufeinander auf.

```
1. Nutze den markt-wettbewerb-analyst: Wer sind meine Konkurrenten im Raum Winterthur?
2. Nutze den pricing-stratege: Setz meine Preise auf Basis dieser Analyse neu an.
3. Nutze den content-creator: Schreib die Preisseite der Website neu.
```

### Gute Beispielaufträge

| Situation | Auftrag |
|---|---|
| Zu wenig Anfragen | `business-orchestrator: Ich habe zu wenig Anfragen, finde den Engpass.` |
| Kunde beschwert sich | `kundenservice-agent: Kunde reklamiert Kratzer nach Transport. Entwirf die Antwort.` |
| Schlechte Bewertung | `reputation-manager: 1-Stern-Bewertung wegen Wartezeit — schreib die öffentliche Antwort.` |
| Preise unklar | `finanz-controller: Rechne meinen Vollkosten-Stundensatz aus.` |
| Werbung läuft schlecht | `performance-ads-manager: Prüf mein Google-Ads-Konto und sag, wo Geld verbrennt.` |
| Neuer Mitarbeiter | `hr-personal: Stelleninserat für eine Chauffeurin mit C-Ausweis.` |
| Zu viel Handarbeit | `automatisierungs-architekt: Was in meinem Ablauf lohnt sich zu automatisieren?` |
| Rechnung offen | `buchhaltung-assistent: Zweite Mahnung für Rechnung 2026-118, CHF 840, fällig seit 6 Wochen.` |

---

## Für alle Projekte verfügbar machen

Aktuell gelten die Agenten nur in diesem Projekt. Wenn du sie überall nutzen willst:

```bash
mkdir -p ~/.claude/agents
cp -r .claude/agents/* ~/.claude/agents/
```

Danach Claude Code neu starten. Projekt-Agenten haben Vorrang vor globalen Agenten mit
gleichem Namen — du kannst also global die Grundversion nutzen und sie pro Projekt
überschreiben.

## Anpassen

Jeder Agent ist eine einfache Markdown-Datei. Ändere sie direkt, oder lass es machen:

```
Pass den content-creator so an, dass er immer duzt statt siezt.
```

Der wichtigste Teil ist der Kopf der Datei:

```yaml
---
name: agent-name          # eindeutiger Name, kleingeschrieben
description: …            # entscheidet, wann Claude den Agenten automatisch wählt
tools: Read, Write, …     # welche Werkzeuge der Agent nutzen darf
model: opus | sonnet      # Opus für Denkarbeit, Sonnet für Produktion
---
```

Neue Agenten legst du als weitere `.md`-Datei in `.claude/agents/` an — Unterordner sind
erlaubt und dienen nur der Ordnung.

---

## Gemeinsame Regeln aller Agenten

Diese Grundsätze stecken in jedem Agenten und sind der eigentliche Unterschied zu einer
normalen Chat-Anfrage:

1. **Keine erfundenen Zahlen.** Fehlende Werte werden als `[ANNAHME: …]` oder
   `[FAKT NÖTIG: …]` sichtbar markiert, nie plausibel dazuerfunden.
2. **Quellen mit Datum** bei allem, was recherchiert wurde.
3. **Rechenwege offen**, damit du sie mit deiner Treuhandstelle nachrechnen kannst.
4. **Keine Rechts-, Steuer- oder Versicherungsberatung** — Entwürfe immer mit Hinweis
   auf fachliche Prüfung.
5. **Priorisieren statt Listen abliefern.** Maximal 3 Massnahmen für die nächsten 30 Tage.
6. **Widerspruch, wenn nötig.** Wenn die Frage am eigentlichen Problem vorbeigeht,
   sagt der Agent das — auch ungefragt.

---

## Rechtlicher Rahmen

Die Agenten sind auf **Schweizer Verhältnisse** eingestellt (OR/ZGB, revDSG, MWST 8,1 %,
CHF, UWG, Schweizer Rechtschreibung) und weisen auf EU-Recht hin, wo es zusätzlich greift.
Für andere Länder: Regel 9 im Firmenprofil anpassen — die Agenten richten sich danach.

Die Ergebnisse sind Entwürfe und Entscheidungsgrundlagen, keine Beratung durch Fachpersonen.
Bei Verträgen, Kündigungen, Steuern, Datenschutzvorfällen und allem Existenzrelevanten
gehört eine Fachperson dazu.
