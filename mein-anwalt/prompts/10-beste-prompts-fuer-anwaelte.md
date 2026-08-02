# Die 10 besten Prompts für Anwälte (auf Schweizer Recht angepasst)

Recherchiert aus aktuellen Best-Practice-Quellen für juristische KI-Nutzung
(Spellbook, ContractPodAi, Clio, American Bar Association, CallidusAI 2025/2026)
und angepasst an **Schweizer Recht** und Schweizer Terminologie.

**So nutzt du sie:** Setze zuerst den [System-Prompt](../system-prompt-schweizer-anwalt.md)
(«Mein Anwalt»). Dann verwendest du je nach Aufgabe einen der folgenden Prompts.
Ersetze alle `[PLATZHALTER]` durch deine konkreten Angaben. Je genauer der Input
(Kanton, Daten, Vertragsart, Streitwert), desto besser das Ergebnis.

> ⚠️ **Grundregel für jede juristische KI-Nutzung:** Lass dir Fundstellen (Artikel, BGE,
> Fristen) immer **nennen und dann selbst verifizieren** – auf fedlex.admin.ch bzw. bger.ch.
> KI kann Zitate erfinden. Siehe [Rechtsquellen-Katalog](../quellen/schweizer-rechtsquellen.md).

---

## 1. Rechtsgutachten / Fallanalyse (Subsumtion)

```
Erstelle ein strukturiertes Kurzgutachten zu folgendem Fall nach Schweizer Recht.

Sachverhalt: [SACHVERHALT SCHILDERN]
Kanton: [KANTON]
Meine Rolle / Partei: [z. B. Vermieterin / Arbeitnehmer / Beschuldigter]
Ziel: [was ich erreichen will]

Gliedere so:
1. Relevanter Sachverhalt (kurz zusammengefasst)
2. Rechtsfrage(n)
3. Anwendbare Normen (mit Artikel + Gesetz + SR-Nummer, ggf. BGE)
4. Subsumtion (Voraussetzungen, Rechtsfolgen, Beweislast, Fristen)
5. Ergebnis und priorisierte Handlungsempfehlung
6. Offene Fragen / benötigte weitere Angaben

Wenn dir entscheidende Fakten fehlen, frage zuerst nach, bevor du subsumierst.
Kennzeichne unsichere Fundstellen als «zu verifizieren».
```

## 2. Vertrag entwerfen

```
Entwirf einen [VERTRAGSART, z. B. befristeten Arbeitsvertrag / Mietvertrag / Werkvertrag /
Aktionärbindungsvertrag] nach Schweizer Obligationenrecht.

Parteien: [A] und [B]
Kanton / Gerichtsstand: [KANTON]
Wesentliche Eckpunkte: [Dauer, Preis/Lohn, Leistung, Kündigung, Konventionalstrafe, etc.]

Anforderungen:
- Übliche und gesetzeskonforme Klauseln nach OR
- Klare, eindeutige Definitionen, keine Zirkeldefinitionen
- Markiere Klauseln, die zwingendes Recht betreffen oder kantonal/individuell anzupassen sind
- Weise auf Formvorschriften hin (z. B. Schriftform, öffentliche Beurkundung)
- Füge am Ende eine Checkliste «vor Unterschrift prüfen» an
```

## 3. Vertrag prüfen / Risiken erkennen (Redlining)

```
Prüfe den folgenden Vertrag aus Sicht von [MEINE PARTEI] nach Schweizer Recht.

[VERTRAGSTEXT EINFÜGEN]

Gib mir:
- Die 5–10 grössten Risiken/Nachteile für meine Partei, nach Wichtigkeit sortiert
- Klauseln, die gegen zwingendes Schweizer Recht verstossen oder unüblich/einseitig sind
- Für jede Problemstelle: warum problematisch + konkreter Formulierungsvorschlag zur Verbesserung
- Fehlende, aber übliche Klauseln (z. B. Gerichtsstand, anwendbares Recht, Haftung, Datenschutz)
Fasse am Schluss in einer Tabelle zusammen: Klausel | Risiko | Empfehlung | Priorität.
```

## 4. Rechtsrecherche mit Normen und Leitentscheiden

```
Ich recherchiere zu folgender Rechtsfrage im Schweizer Recht: [RECHTSFRAGE]

Bitte:
1. Nenne die einschlägigen Gesetzesartikel (Artikel + Gesetz + SR-Nummer)
2. Nenne relevante Bundesgerichts-Leitentscheide (BGE/Urteil), sofern du sie sicher kennst –
   sonst sag ausdrücklich, dass die konkrete Fundstelle zu verifizieren ist
3. Skizziere die herrschende Lehre und allfällige Streitpunkte
4. Fasse die Rechtslage in einer klaren Kernaussage zusammen
5. Gib mir 3 Suchbegriffe/Filter, mit denen ich auf fedlex.admin.ch und entscheidsuche.ch
   selbst weiter recherchieren kann

Erfinde keine Urteile oder Artikelnummern. Unsicheres klar kennzeichnen.
```

## 5. Schreiben an Gegenpartei / Behörde aufsetzen

```
Verfasse ein sachliches, juristisch fundiertes Schreiben.

Absender: [ICH]
Empfänger: [GEGENPARTEI / BEHÖRDE]
Anliegen: [z. B. Mängelrüge, Zahlungsaufforderung, Kündigungsanfechtung, Fristerstreckung]
Kanton: [KANTON]
Relevante Fakten & Daten: [...]

Anforderungen:
- Höflich, bestimmt, faktenbasiert; keine leeren Drohungen
- Nenne die massgebende Rechtsgrundlage (Artikel/Gesetz)
- Setze eine angemessene Frist und beschreibe die nächsten Schritte bei Nichteinhaltung
- Struktur: Betreff, Sachverhalt, rechtliche Grundlage, konkrete Forderung, Frist, Grussformel
```

## 6. Klartext-Erklärung für Mandanten / Laien

```
Erkläre mir folgende Rechtslage / folgenden Vertrag / folgendes Urteil in einfachem Deutsch,
verständlich für eine Person ohne juristische Ausbildung:

[TEXT ODER FRAGE EINFÜGEN]

- Was bedeutet das konkret für mich?
- Welche Rechte und Pflichten habe ich?
- Was sind die nächsten sinnvollen Schritte?
- Vermeide Fachjargon; wenn ein Fachbegriff nötig ist, erkläre ihn in einem Halbsatz.
```

## 7. Fristen- und Zuständigkeits-Check

```
Prüfe für folgenden Fall die relevanten Fristen und Zuständigkeiten nach Schweizer Recht:

Fall: [KURZBESCHRIEB, mit Daten!]
Kanton: [KANTON]

Gib mir:
- Alle laufenden/drohenden Fristen (z. B. Anfechtung, Beschwerde, Verjährung, Rechtsvorschlag)
  mit Fristbeginn, Dauer und Rechtsgrundlage
- Die zuständige Behörde/Instanz (Schlichtungsbehörde, Gericht, Amt) und den Rechtsweg
- Warnung bei knappen Fristen: was passiert bei Versäumnis
Wenn ein Datum fehlt, um eine Frist zu berechnen, frage danach.
```

## 8. Argumente pro & contra (Prozessstrategie)

```
Ich vertrete [MEINE PARTEI] in folgender Streitsache: [SACHVERHALT], Kanton [KANTON].

Erstelle eine ausgewogene Analyse:
- Die stärksten Argumente FÜR meine Position (mit Rechtsgrundlage)
- Die stärksten Argumente der GEGENSEITE (damit ich vorbereitet bin)
- Beweisfragen: Was muss wer beweisen (Beweislast)? Welche Beweismittel brauche ich?
- Realistische Einschätzung der Prozesschancen und der Risiken (inkl. Kosten/Streitwert)
- Alternativen zum Prozess (Schlichtung, Vergleich, Mediation)
```

## 9. Dokument / Urteil zusammenfassen

```
Fasse das folgende Dokument (Vertrag / Urteil / Verfügung / Schriftsatz) zusammen:

[DOKUMENT EINFÜGEN]

Struktur:
- Worum geht es (1–2 Sätze)
- Die wichtigsten Punkte / Kernaussagen (Stichpunkte)
- Bei Urteil: Sachverhalt, Rechtsfrage, Entscheid (Dispositiv), zentrale Begründung
- Rechtsfolgen und offene Punkte für mich
- Was ich als Nächstes tun/prüfen sollte
Nur den Inhalt des Dokuments verwenden; nichts hinzuerfinden.
```

## 10. Anwaltskosten & Vorgehen einschätzen

```
Hilf mir, das weitere Vorgehen und die Kosten für folgende Angelegenheit einzuschätzen:

Anliegen: [KURZBESCHRIEB]
Kanton: [KANTON]
Streitwert (falls bekannt): [BETRAG]

Gib mir:
- Realistische Vorgehensoptionen (aussergerichtlich, Schlichtung, Klage) mit Vor-/Nachteilen
- Grobe Kostenfaktoren (Gerichtskosten, Anwaltskosten, Prozessrisiko, Rechtsschutz-
  versicherung, unentgeltliche Rechtspflege als Möglichkeit)
- Wann sich der Beizug einer zugelassenen Anwältin/eines Anwalts lohnt
- Eine priorisierte To-do-Liste für die nächsten 14 Tage
Weise darauf hin, dass konkrete Tarife kantonal geregelt sind und variieren.
```

---

## Bonus: 5 Prompt-Techniken, die die Qualität stark verbessern

1. **Rolle + Kontext geben:** immer Kanton, Partei, Ziel und relevante Daten nennen.
2. **Zerlegen:** komplexe Fragen in Teilfragen aufteilen statt alles auf einmal fragen.
3. **Format vorgeben:** «Antworte als Tabelle / Checkliste / Gutachten mit Überschriften».
4. **Nach Unsicherheit fragen:** «Was fehlt dir, um das sicher zu beurteilen?»
5. **Verifikation verlangen:** «Nenne Fundstellen und markiere, was ich selbst nachprüfen muss.»

---

### Quellen (Best-Practice-Recherche)

- [Spellbook – AI Prompts for Lawyers (2026)](https://spellbook.com/learn/ai-prompts-for-lawyers)
- [ContractPodAi – Mastering AI Prompts for Legal Professionals (2025)](https://contractpodai.com/news/ai-prompts-for-legal-professionals/)
- [Clio – ChatGPT Prompts for Lawyers](https://www.clio.com/blog/chat-gpt-prompts/)
- [American Bar Association – Legal ChatGPT: Tips, Prompts, and Use Cases](https://www.americanbar.org/groups/law_practice/resources/law-technology-today/2025/legal-chatgpt-tips-prompts-and-use-cases/)
- [CallidusAI – Top AI Legal Prompts (2025)](https://callidusai.com/blog/top-ai-legal-prompts-lawyers-2025/)
- [CaseStatus – 15 ChatGPT Prompts for Lawyers](https://www.casestatus.com/blog/ai-legal-prompts)
