# Dein Claude Code + Obsidian Memory-System

**Anleitung für Einsteiger — in 5 Schritten zum dauerhaften Gedächtnis für deine KI.**

---

## Warum überhaupt? Das einfachste Memory-Upgrade für Claude Code

Claude Code vergisst standardmäßig alles, sobald eine Session endet. Jede neue Unterhaltung startet bei null.

Obsidian löst das ohne Zusatzsoftware:

- Obsidian ist ein **kostenloser, lokaler Markdown-Vault** — im Kern nichts anderes als ein Ordner voller `.md`-Dateien auf deiner Festplatte.
- Claude Code **liest und schreibt diesen Ordner wie jeden anderen Ordner** — keine API, kein Plugin, keine Datenbank nötig.
- Ergebnis: Deine KI bekommt endlich einen Ort, an dem sie sich **erinnern** kann.

Der Clou: Du bekommst gleichzeitig eine schöne, verlinkte Wissensdatenbank für dich selbst *und* ein Langzeitgedächtnis für Claude — aus denselben Dateien.

---

## Schritt 1 — Obsidian installieren

1. Gehe auf **[obsidian.md](https://obsidian.md)**.
2. Lade die Version für dein Betriebssystem herunter (Windows, macOS, Linux — mobil gibt es iOS/Android).
3. Installiere und starte die App.

**Gut zu wissen:**
- Für den persönlichen Gebrauch ist Obsidian **kostenlos**.
- Es gibt **tausende kostenlose Community-Plugins** (Graph View, Dataview, Templater …).
- Deine Daten bleiben **lokal** — nichts wird ohne dein Zutun in eine Cloud geladen.

---

## Schritt 2 — Vault festlegen: Wähle einen Ordner und nenne ihn "dein Gehirn"

Beim ersten Start zeigt Obsidian den Dialog **"Set up your vault"** mit drei Optionen:

| Option | Bedeutung | Wann nutzen |
|---|---|---|
| **Create new vault** (Create) | Neuer, leerer Vault in einem frischen Ordner | Empfohlen für den Start |
| **Open folder as vault** (Choose) | Ein bereits existierender Ordner wird zum Vault | Du hast schon Notizen/Markdown-Dateien |
| **Open vault from sync** (Sign in) | Vault über Obsidian Sync einbinden | Du nutzt Obsidian Sync auf mehreren Geräten |

Für den Einstieg: **Create new vault** → Name z. B. `my-vault` → Speicherort wählen.

Jeder beliebige Ordner kann ein Vault sein. Dieser Ordner ist ab jetzt der Ort, **an dem dein Gehirn wohnt**.

> **Tipp:** Lege den Vault an einen Pfad ohne Leer- oder Sonderzeichen (z. B. `~/vault` oder `C:\vault`). Das macht die spätere Arbeit im Terminal deutlich angenehmer.

---

## Schritt 3 — Claude Code auf den Vault richten

Öffne ein Terminal und starte Claude Code **direkt im Vault-Ordner**:

```bash
cd ~/vault && claude
```

Claude Code arbeitet immer im aktuellen Arbeitsverzeichnis. Startest du es im Vault, ist der komplette Vault sein Arbeitsbereich — er kann Notizen lesen, durchsuchen, anlegen und aktualisieren.

### CLAUDE.md anlegen

Lege im Wurzelverzeichnis des Vaults eine Datei `CLAUDE.md` an. Claude Code liest sie beim Start automatisch und übernimmt die Regeln daraus für die ganze Session.

```markdown
# Mein Obsidian Vault

Folge den Obsidian Best Practices:
- Nutze [[wiki-links]] für Verknüpfungen zwischen Notizen
- Tagesnotizen kommen nach /raw
- Ausgearbeitete Artikel kommen nach /wiki
- Veröffentlichte Artefakte kommen nach /outputs
- Halte Notizen atomar (eine Idee pro Notiz)
```

Beim nächsten Start siehst du im Terminal:

```
✳ Welcome to Claude Code
Reading CLAUDE.md...
✓ Vault context loaded
✓ Following Obsidian conventions
```

Ab jetzt weiß Claude, wie dein Vault aufgebaut ist und wohin welche Notiz gehört — ohne dass du es in jeder Session wiederholen musst.

**Was in eine gute CLAUDE.md gehört:**
- Ordnerstruktur und ihre Bedeutung
- Namenskonventionen für Dateien (z. B. `YYYY-MM-DD_daily.md`)
- Verlinkungsregeln (`[[wiki-links]]` statt Markdown-Links)
- Sprache der Notizen (z. B. "Notizen auf Deutsch schreiben")
- Was Claude **nicht** anfassen soll (z. B. `/archiv`, `.obsidian/`)

---

## Schritt 4 — Das 3-Ordner-Memory-System: drei Ordner, unbegrenzte Erinnerung

Verzichte auf komplizierte Ordnerbäume. Drei Ordner reichen:

- **`/raw`** — die Rohablage. Alles Ungefilterte: Tagesnotizen, Podcast-Mitschriften, spontane Ideen.
- **`/wiki`** — die kodifizierten Artikel. Verdichtetes, sauber formuliertes Wissen.
- **`/outputs`** — fertige Ergebnisse: Decks, Reports, Newsletter, Skripte.

```
my-vault
├── raw/
│   ├── 2026-05-11_daily.md
│   ├── podcast-notes.md
│   └── random-ideas.md
├── wiki/
│   ├── claude-code-setup.md
│   ├── obsidian-graph-view.md
│   └── zettelkasten-principles.md
├── outputs/
│   ├── newsletter-124.md
│   ├── youtube-script.md
│   └── research-report.md
└── CLAUDE.md
```

**Der Informationsfluss:** Rohes Material landet in `/raw`. Was sich als tragfähig erweist, wird zu einem atomaren Artikel in `/wiki` verdichtet. Was du daraus veröffentlichst, landet in `/outputs`.

Warum das funktioniert: Der Ordnername sagt Claude bereits, in welchem Reifegrad eine Information steckt. Für Recherche greift er auf `/wiki` zu, für Kontext zu einem bestimmten Tag auf `/raw`.

Ordner anlegen — entweder in Obsidian per Rechtsklick, oder direkt im Terminal:

```bash
cd ~/vault && mkdir -p raw wiki outputs
```

Oder du bittest Claude Code einfach darum: *"Lege die Ordner raw, wiki und outputs an und schreibe eine CLAUDE.md nach unserem Schema."*

---

## Schritt 5 — Claude zurückschreiben lassen

Der eigentliche Hebel: Claude soll nicht nur lesen, sondern **selbst in den Vault schreiben**. Tagesnotizen, Session-Zusammenfassungen, Rückverlinkungen.

Beispiel-Prompt am Ende einer Session:

```
> log today's session in the daily note
```

bzw. auf Deutsch:

```
> Halte die heutige Session in der Tagesnotiz fest
```

Claude legt dann etwa Folgendes an:

```
✳ Writing to daily-notes/2026-05-11.md
✓ Created session entry
✓ Linked to [[claude-obsidian-setup]]
✓ Linked to [[carousel-pipeline]]
Memory updated.
```

Die entstandene Notiz `2026-05-11.md`:

```markdown
# 2026-05-11 — Daily

## Session: Claude Code carousels

Built the [[carousel-pipeline]] w/ Playwright export.
Followed [[claude-obsidian-setup]] for vault layout.

## Next
- Bake 8 slides via export.mjs
- Schedule IG post for tomorrow
```

**Warum das der wichtigste Schritt ist:** Jede Unterhaltung wird zu dauerhaftem Gedächtnis. Beim nächsten Start liest Claude die Tagesnotizen und weiß, woran ihr zuletzt gearbeitet habt. Durch die `[[wiki-links]]` entsteht nebenbei ein Graph, in dem sich Themen von selbst verknüpfen — Wissen **kumuliert**, statt bei jeder Session zu verpuffen.

**Nützliche Routine-Prompts:**

| Zweck | Prompt |
|---|---|
| Session protokollieren | *"Schreibe eine Zusammenfassung der Session in die heutige Tagesnotiz in /raw und verlinke die betroffenen Wiki-Notizen."* |
| Rohnotiz verdichten | *"Lies /raw/podcast-notes.md und erstelle daraus atomare Notizen in /wiki mit passenden [[wiki-links]]."* |
| Kontext aufbauen | *"Lies die letzten 5 Tagesnotizen in /raw und fasse zusammen, woran ich gerade arbeite."* |
| Lücken finden | *"Welche [[wiki-links]] in meinem Vault zeigen auf Notizen, die es noch nicht gibt?"* |
| Ergebnis ablegen | *"Erstelle den fertigen Report in /outputs und verlinke die Quellnotizen aus /wiki."* |

---

## Die 5 Schritte auf einen Blick

1. **Obsidian installieren** — kostenlos von [obsidian.md](https://obsidian.md).
2. **Vault festlegen** — ein Ordner wird zu deinem Gehirn.
3. **Claude Code im Vault starten** — `cd ~/vault && claude` plus `CLAUDE.md` mit deinen Regeln.
4. **Drei Ordner anlegen** — `/raw`, `/wiki`, `/outputs`.
5. **Claude zurückschreiben lassen** — Tagesnotizen, Zusammenfassungen, Link-Backs.

---

## Praxistipps

- **Klein anfangen.** Ein Vault, drei Ordner, eine CLAUDE.md. Struktur wächst mit der Nutzung, nicht vorher.
- **Atomar bleiben.** Eine Notiz = eine Idee. Das macht Verlinkungen aussagekräftig und hilft Claude beim gezielten Nachschlagen.
- **Konsistente Dateinamen.** `YYYY-MM-DD_daily.md` für Tagesnotizen, `kebab-case.md` für Wiki-Artikel.
- **Vault versionieren.** Ein `git init` im Vault kostet nichts und gibt dir eine vollständige Historie — inklusive der Änderungen, die Claude vornimmt.
- **`.obsidian/` in Ruhe lassen.** Der Konfigurationsordner von Obsidian gehört nicht zu deinen Notizen; erwähne in der CLAUDE.md, dass Claude ihn ignorieren soll.
- **Graph View nutzen.** Die Graph-Ansicht in Obsidian zeigt sofort, welche Themen isoliert dastehen und wo Verknüpfungen fehlen.

---

*Basierend auf dem Carousel "Building your Claude Code + Obsidian memory system in 5 steps" von [@AtlasMind212](https://www.tiktok.com/@atlasmind.ai).*
