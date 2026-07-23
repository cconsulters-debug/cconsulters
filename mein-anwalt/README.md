# Mein Anwalt – KI-Anwalt für Schweizer Recht (Baukasten)

Ein kompletter Baukasten, um dir deinen **eigenen KI-Anwalt für Schweizer Recht** zu erstellen:
Rollen-Definition (System-Prompt), die 10 besten Anwalts-Prompts und ein vollständiger Katalog
der offiziellen Schweizer Rechtsquellen zum Nachschlagen und Verifizieren.

## Inhalt

| Datei | Zweck |
|---|---|
| [`system-prompt-schweizer-anwalt.md`](system-prompt-schweizer-anwalt.md) | **Der Kern.** System-Prompt, der die KI zum «Schweizer Anwalt» macht – Rolle, Arbeitsweise (Subsumtion), Zitierregeln, rechtliche Grenzen. |
| [`prompts/10-beste-prompts-fuer-anwaelte.md`](prompts/10-beste-prompts-fuer-anwaelte.md) | Die **10 besten Prompts** für typische Anwaltsaufgaben (Gutachten, Vertrag, Prüfung, Recherche, Schreiben, Fristen, Prozessstrategie …), auf CH-Recht angepasst. |
| [`quellen/schweizer-rechtsquellen.md`](quellen/schweizer-rechtsquellen.md) | **Alle Quellen-Dokumente:** Gesetze mit SR-Nummern + Fedlex-Links, Rechtsprechung, kantonale Sammlungen, Fachportale. |

## So erstellst du deinen KI-Anwalt (in 3 Schritten)

1. **System-Prompt einsetzen.** Kopiere den Inhalt von `system-prompt-schweizer-anwalt.md` in
   dein KI-Tool – z. B. als Claude-«Projekt»-Anweisung, ChatGPT-«Custom Instructions», oder als
   `system`-Prompt via API. Ab jetzt antwortet die KI als «Mein Anwalt» nach Schweizer Recht.
2. **Aufgaben-Prompt wählen.** Nimm für deine konkrete Aufgabe einen der 10 Prompts, ersetze die
   `[PLATZHALTER]` (Kanton, Fakten, Daten, Partei) und schicke ihn ab.
3. **Verifizieren.** Lass dir Fundstellen (Artikel/BGE) nennen und prüfe die wichtigen davon
   selbst über den Quellen-Katalog (Fedlex, bger.ch, entscheidsuche.ch).

## Für ein eigenes Projekt / eine App

Willst du daraus ein Produkt bauen (Chatbot, Web-App), kannst du:
- den **System-Prompt** als festen `system`-String verwenden,
- die 10 Prompts als **Vorlagen/Buttons** («Vertrag prüfen», «Fristen-Check» …) anbieten,
- den **Quellen-Katalog** als Wissens-/RAG-Grundlage einbinden bzw. für Zitat-Verifikation
  auf Fedlex/entscheidsuche verlinken.

## ⚠️ Wichtiger Haftungshinweis

«Mein Anwalt» ist ein **KI-Assistent** und liefert **allgemeine rechtliche Informationen**,
**keine rechtsverbindliche Beratung** und begründet **kein Mandatsverhältnis**. KI kann
Gesetzesartikel und Urteile falsch wiedergeben oder erfinden – **prüfe zentrale Aussagen immer
an der offiziellen Quelle**. Bei fristgebundenen, existenziellen oder strafrechtlichen
Angelegenheiten ziehe rechtzeitig eine **zugelassene Anwältin / einen zugelassenen Anwalt**
(Verzeichnis: [SAV/FSA](https://www.sav-fsa.ch)) oder die zuständige Behörde bei.
