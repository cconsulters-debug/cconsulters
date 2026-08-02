# Launch-Compliance-Checkliste — «Mein Rechtshelfer & Assistent» (Schweiz)

Praktische Schritt-für-Schritt-Liste, bevor die Website online geht und Geld verdient.
Abhaken, was erledigt ist. **Kein Ersatz für eine einmalige anwaltliche Prüfung.**

## A. Positionierung & Name  ✅ grösster Hebel
- [ ] Produktname enthält **nicht** «Anwalt/Rechtsanwalt» → «Mein Rechtshelfer & Assistent» ✔
- [ ] Überall klar: **KI-Werkzeug, kein Anwalt, keine verbindliche Beratung** (Header-Badge + Footer)
- [ ] Wort **«Jurist»/«Kanzlei»** vermeiden, solange nicht zutreffend
- [ ] Keine Werbeaussagen, die anwaltliche Leistung oder Prozessvertretung suggerieren (UWG)
- [ ] Optionaler **Marken-Check** auf [swissreg.ch](https://www.swissreg.ch) (Name frei?)

## B. Pflicht-Rechtstexte auf der Website
- [ ] **Impressum** (Identität + Kontakt, UWG Art. 3 lit. s) — `impressum.md`
- [ ] **Datenschutzerklärung** (revDSG) inkl. **KI-/Auslands-Datenfluss** — `datenschutzerklaerung.md`
- [ ] **AGB/Nutzungsbedingungen** mit Haftungsbeschränkung — `agb.md`
- [ ] **Disclaimer** sichtbar platziert — `disclaimer.md`
- [ ] Alle `[PLATZHALTER]` ausgefüllt; Texte **anwaltlich geprüft**

## C. Datenschutz (revDSG) konkret
- [ ] Datenfluss dokumentiert: welche Eingaben gehen an welchen **KI-Anbieter** (Land)?
- [ ] Auftragsbearbeitung/Nutzungsbedingungen der Anbieter (Anthropic/OpenAI, Hosting, Zahlung) geprüft
- [ ] Auslandtransfer abgesichert (Garantien nach Art. 16 f. revDSG)
- [ ] Datensparsamkeit: keine unnötige Speicherung von Eingaben; Nutzerhinweis «keine sensiblen Daten»
- [ ] Betroffenenrechte (Auskunft/Löschung) organisatorisch umgesetzt
- [ ] Cookie-/Analyse-Hinweis, falls Tracking eingesetzt wird

## D. Haftung & Absicherung
- [ ] Haftungsklausel in AGB (Grenzen von Art. 100 OR beachtet)
- [ ] Prominente Fehler-/Verifikationshinweise im Produkt (ist umgesetzt)
- [ ] **Betriebs-/Berufshaftpflichtversicherung** angefragt/abgeschlossen
- [ ] Log-/Missbrauchskonzept (Rate-Limit, keine rechtswidrige Nutzung)

## E. Unternehmen & Steuern
- [ ] Rechtsform gewählt (Einzelfirma / GmbH) und ggf. **Handelsregister**-Eintrag
- [ ] **MWST**: Registrierung, sobald Jahresumsatz **CHF 100'000** erreicht/absehbar
- [ ] Buchhaltung/Einkommens- bzw. Gewinnsteuer organisiert
- [ ] Zahlungsdienstleister eingerichtet (z. B. Stripe) inkl. deren Vertragsbedingungen

## F. Technik & Betrieb
- [ ] **API-Keys** serverseitig (nie im Frontend) — bei Live-Chat via Backend/Netlify-Function
- [ ] HTTPS/TLS aktiv, Formulare/Eingaben verschlüsselt übertragen
- [ ] Backups & Monitoring
- [ ] Barrierefreiheit/Responsiveness geprüft

## G. Falls EU-Nutzende bedient werden
- [ ] **DSGVO**-Konformität zusätzlich prüfen
- [ ] **EU AI Act**: Transparenzpflichten für KI-Systeme (Kennzeichnung KI) beachten

## H. Vor dem «Go»
- [ ] **Einmalige anwaltliche Prüfung** (IT-/Wettbewerbs-/Datenschutzrecht) durchgeführt
- [ ] Testlauf mit echten Prompts; Fehler-/Verifikationshinweise sichtbar
- [ ] Kontakt-/Support-Kanal steht

---
*Stand: [DATUM]. Diese Liste ist eine Orientierungshilfe, keine rechtsverbindliche Beratung.*
