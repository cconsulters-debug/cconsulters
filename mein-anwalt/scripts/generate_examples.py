#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generiert professionelle Beispiel-PDFs (fiktive Daten) für "Mein Rechtshelfer & Assistent".
Ein Flaggschiff-Dokument pro Themenkategorie, um Qualität und Aufbau der echten
KI-generierten Dokumente zu demonstrieren.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 HRFlowable, KeepTogether)

GOLD = HexColor("#8a6d1f")
INK = HexColor("#1a1a1a")
MUTED = HexColor("#5a5a5a")
LINE = HexColor("#d8cfa8")

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "beispiele")
os.makedirs(OUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Brand", fontName="Helvetica-Bold", fontSize=13, textColor=GOLD, spaceAfter=2))
styles.add(ParagraphStyle(name="BrandSub", fontName="Helvetica", fontSize=8, textColor=MUTED, spaceAfter=0))
styles.add(ParagraphStyle(name="DocTitle", fontName="Helvetica-Bold", fontSize=16, textColor=INK, spaceBefore=14, spaceAfter=4))
styles.add(ParagraphStyle(name="DocSubtitle", fontName="Helvetica", fontSize=9.5, textColor=MUTED, spaceAfter=14))
styles.add(ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=9.5, textColor=INK, leading=14))
styles.add(ParagraphStyle(name="SectionHead", fontName="Helvetica-Bold", fontSize=11, textColor=GOLD, spaceBefore=14, spaceAfter=6))
styles.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=10, textColor=INK, leading=15, spaceAfter=8, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="BodyBold", parent=styles["Body"], fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="Warn", fontName="Helvetica-Bold", fontSize=10, textColor=HexColor("#a83232"), leading=15, spaceAfter=10,
                          borderPadding=8, backColor=HexColor("#fbeaea")))
styles.add(ParagraphStyle(name="Footer", fontName="Helvetica", fontSize=7.6, textColor=MUTED, leading=11))
styles.add(ParagraphStyle(name="MyBullet", parent=styles["Body"], leftIndent=12, bulletIndent=0, spaceAfter=4))
styles.add(ParagraphStyle(name="PriceTag", fontName="Helvetica-Bold", fontSize=9, textColor=GOLD, alignment=TA_RIGHT))


def letterhead(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GOLD)
    canvas.rect(0, A4[1] - 6, A4[0], 6, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 10 * mm, "Mein Rechtshelfer & Assistent — Beispieldokument mit fiktiven Daten, keine echte Rechtsberatung.")
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, f"Seite {doc.page}")
    canvas.restoreState()


def build_pdf(filename, title, subtitle, tier, price, meta_rows, sections, warn=None):
    path = os.path.join(OUT_DIR, filename)
    doc = SimpleDocTemplate(path, pagesize=A4,
                             topMargin=22 * mm, bottomMargin=18 * mm,
                             leftMargin=20 * mm, rightMargin=20 * mm,
                             title=title, author="Mein Rechtshelfer & Assistent")
    story = []

    brand_table = Table(
        [[Paragraph("MEIN RECHTSHELFER &amp; ASSISTENT", styles["Brand"]),
          Paragraph(f"{tier} · CHF {price:.2f}", styles["PriceTag"])],
         [Paragraph("KI-gestützte Rechtsdokumente für die Schweiz", styles["BrandSub"]), ""]],
        colWidths=[130 * mm, 40 * mm])
    brand_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("SPAN", (1, 0), (1, 0)),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(brand_table)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.1, color=LINE, spaceAfter=4))

    story.append(Paragraph(title, styles["DocTitle"]))
    story.append(Paragraph(subtitle, styles["DocSubtitle"]))

    meta_data = [[Paragraph(f"<b>{k}</b>", styles["Meta"]), Paragraph(v, styles["Meta"])] for k, v in meta_rows]
    meta_table = Table(meta_data, colWidths=[42 * mm, 128 * mm])
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    if warn:
        story.append(Paragraph(f"&#9888; {warn}", styles["Warn"]))

    for head, body_parts in sections:
        if head:
            story.append(Paragraph(head, styles["SectionHead"]))
        for part in body_parts:
            if part.startswith("• "):
                story.append(Paragraph(part[2:], styles["MyBullet"], bulletText="•"))
            elif part.startswith("**") and part.endswith("**"):
                story.append(Paragraph(part.strip("*"), styles["BodyBold"]))
            else:
                story.append(Paragraph(part, styles["Body"]))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.6, color=LINE, spaceAfter=6))
    story.append(Paragraph(
        "Allgemeine rechtliche Information, keine verbindliche Beratung und kein Mandatsverhältnis. "
        "Dieses Dokument ist ein <b>Beispiel mit fiktiven Personen und Daten</b> zur Veranschaulichung von Qualität "
        "und Aufbau. Zentrale Fundstellen (Artikel, SR-Nummern, Fristen) vor Verwendung auf "
        "fedlex.admin.ch bzw. bger.ch verifizieren. Bei Fristen oder strafrechtlichen Angelegenheiten "
        "rechtzeitig eine zugelassene Anwältin / einen Anwalt beiziehen (sav-fsa.ch).",
        styles["Footer"]))

    doc.build(story, onFirstPage=letterhead, onLaterPages=letterhead)
    print("erstellt:", path)


# ============================================================
# 1. MIETE — Kündigung durch Vermieter anfechten
# ============================================================
build_pdf(
    "01-miete-kuendigung-anfechten.pdf",
    "Kündigung durch Vermieter anfechten",
    "Anfechtung einer Wohnungskündigung bei der Schlichtungsbehörde — Beispiel",
    "Premium", 39.90,
    [("Mieter/in", "Sandra Meier, Bahnhofstrasse 12, 8400 Winterthur"),
     ("Kanton", "Zürich"),
     ("Vermieterschaft", "Immobilien Wehrli AG, 8400 Winterthur"),
     ("Kündigung erhalten am", "3. Juni 2026, per amtlichem Formular, auf 30. September 2026")],
    [
        (None, [
            "Frau Meier hat seit 6 Jahren eine 3-Zimmer-Wohnung gemietet und stets pünktlich bezahlt. "
            "Kurz nach einer schriftlichen Mängelrüge wegen Schimmelbildung im Badezimmer erhielt sie "
            "die ordentliche Kündigung auf den nächstmöglichen Termin, ohne weitere Begründung."]),
        ("1. Relevanter Sachverhalt", [
            "Die Kündigung erfolgte am 3. Juni 2026, rund zwei Wochen nach der schriftlichen Mängelrüge "
            "vom 19. Mai 2026. Eine sachliche Begründung wurde von der Vermieterschaft nicht mitgeteilt. "
            "Das Mietverhältnis bestand zuvor beanstandungsfrei seit dem 1. April 2020."]),
        ("2. Rechtsfrage", [
            "Ist die Kündigung wegen des zeitlichen Zusammenhangs mit der Mängelrüge missbräuchlich "
            "im Sinne des Mietrechts und damit anfechtbar?"]),
        ("3. Anwendbare Normen (zu verifizieren)", [
            "• Kündigungsschutzbestimmungen im Mietrecht des Obligationenrechts (Treu-und-Glauben-Grundsatz)",
            "• Vorschriften zur amtlichen Formularpflicht bei Kündigungen von Wohnraum",
            "• Verfahrensbestimmungen zur Anrufung der Schlichtungsbehörde"]),
        ("4. Würdigung", [
            "Eine Kündigung, die in engem zeitlichem Zusammenhang mit der berechtigten Geltendmachung "
            "von Mieterrechten (hier: Mängelrüge) ausgesprochen wird und keine andere plausible "
            "Begründung erkennen lässt, begründet den <b>Anschein einer Rachekündigung</b> und damit "
            "eines Verstosses gegen Treu und Glauben. Der zeitliche Abstand von rund zwei Wochen ist "
            "hierfür ein starkes Indiz, aber keine abschliessende Feststellung — die Vermieterschaft "
            "kann im Verfahren eigene Gründe vorbringen."]),
        ("5. Ergebnis & Empfehlung", [
            "**Empfehlung: Kündigung fristgerecht anfechten.**",
            "Das nachfolgende Anfechtungsgesuch ist innert der Frist bei der Schlichtungsbehörde des "
            "Mietortes (Zürich) einzureichen. Bis zum Entscheid bleibt das Mietverhältnis in der Regel "
            "bestehen."]),
        ("Entwurf: Gesuch an die Schlichtungsbehörde", [
            "<b>Schlichtungsbehörde für Miet- und Pachtverhältnisse, Zürich</b>",
            "<b>Gesuchstellerin:</b> Sandra Meier, Bahnhofstrasse 12, 8400 Winterthur",
            "<b>Gesuchsgegnerin:</b> Immobilien Wehrli AG, 8400 Winterthur",
            "",
            "<b>Rechtsbegehren:</b> Es sei festzustellen, dass die Kündigung vom 3. Juni 2026 nichtig, "
            "eventualiter missbräuchlich und aufzuheben sei.",
            "",
            "<b>Begründung:</b> Die Kündigung erfolgte in unmittelbarem zeitlichem Zusammenhang mit der "
            "schriftlichen Mängelrüge vom 19. Mai 2026 betreffend Schimmelbildung im Badezimmer. Das "
            "Mietverhältnis bestand zuvor sechs Jahre beanstandungsfrei. Es liegen keine erkennbaren "
            "sachlichen Kündigungsgründe vor. Die Kündigung erscheint als Reaktion auf die berechtigte "
            "Geltendmachung von Mieterrechten und verstösst damit gegen Treu und Glauben."]),
        ("Offene Fragen für Sie", [
            "• Liegt eine schriftliche Reaktion der Vermieterschaft auf die Mängelrüge vor?",
            "• Gibt es weitere Kommunikation, die einen anderen Kündigungsgrund nahelegt?"])
    ],
    warn="Frist: Die Anfechtung ist innert 30 Tagen ab Empfang der Kündigung bei der Schlichtungsbehörde einzureichen."
)

# ============================================================
# 2. ARBEIT — Kündigung anfechten (Missbräuchlichkeit)
# ============================================================
build_pdf(
    "02-arbeit-kuendigung-anfechten.pdf",
    "Kündigung anfechten (Missbräuchlichkeit)",
    "Einspruch gegen eine ordentliche Kündigung nach Schweizer Arbeitsrecht — Beispiel",
    "Premium", 39.90,
    [("Partei", "Marco Rossi, Arbeitnehmer"),
     ("Kanton", "Tessin"),
     ("Arbeitgeberin", "Logistica Ticino Sagl"),
     ("Kündigung erhalten am", "10. Juli 2026, ordentlich auf 30. September 2026")],
    [
        (None, [
            "Herr Rossi wurde zwei Tage nach einer Wortmeldung an einer Personalversammlung, in der er "
            "unbezahlte Überstunden ansprach, ordentlich gekündigt. Sein letztes Mitarbeitergespräch "
            "vor drei Monaten war durchwegs positiv."]),
        ("1. Sachverhalt", [
            "Kündigung vom 10. Juli 2026, zwei Tage nach kritischer Wortmeldung an der Personalversammlung "
            "vom 8. Juli 2026. Letzte Leistungsbeurteilung vom April 2026: „gut bis sehr gut“."]),
        ("2. Prüfung Missbräuchlichkeit", [
            "Eine Kündigung gilt typischerweise als missbräuchlich, wenn sie wegen der Ausübung eines "
            "verfassungsmässigen Rechts oder ohne erkennbaren sachlichen Grund im deutlichen Widerspruch "
            "zur bisherigen Leistungsbeurteilung erfolgt. Der enge zeitliche Zusammenhang zur "
            "Wortmeldung (2 Tage) und der Widerspruch zur zuletzt positiven Beurteilung sind starke "
            "Indizien — abschliessend zu würdigen sind sie erst mit Kenntnis der Gegendarstellung."]),
        ("3. Fristenhinweis", [
            "Der schriftliche Einspruch gegen die Kündigung muss <b>spätestens bis zum Ende der "
            "Kündigungsfrist</b> (hier: 30. September 2026) beim Arbeitgeber eingehen. Eine allfällige "
            "Klage auf Entschädigung folgt erst danach, innert kurzer, gesetzlich bestimmter Frist "
            "(zu verifizieren)."]),
        ("Entwurf: Einspruchsschreiben", [
            "Logistica Ticino Sagl, z. Hd. Geschäftsleitung",
            "",
            "<b>Betreff:</b> Einspruch gegen die Kündigung vom 10. Juli 2026",
            "",
            "Sehr geehrte Damen und Herren",
            "",
            "Hiermit erhebe ich fristgerecht Einspruch gegen die mir am 10. Juli 2026 ausgesprochene "
            "ordentliche Kündigung. Die Kündigung erfolgte zwei Tage nach meiner Wortmeldung an der "
            "Personalversammlung vom 8. Juli 2026 zum Thema unbezahlter Überstunden und steht im "
            "Widerspruch zu meiner letzten Leistungsbeurteilung vom April 2026. Ich behalte mir sämtliche "
            "Ansprüche aus missbräuchlicher Kündigung ausdrücklich vor.",
            "",
            "Freundliche Grüsse, Marco Rossi"]),
        ("Nächste Schritte", [
            "• Einspruch eingeschrieben versenden, Kopie behalten.",
            "• Beweismittel sichern (Protokoll der Versammlung, Beurteilung, Zeugen).",
            "• Rechtsschutzversicherung/Gewerkschaft frühzeitig informieren."])
    ]
)

# ============================================================
# 3. KONSUM — Unberechtigte Inkassoforderung bestreiten
# ============================================================
build_pdf(
    "03-konsum-inkasso-bestreiten.pdf",
    "Unberechtigte Inkassoforderung bestreiten",
    "Zurückweisung einer zweifelhaften Inkassoforderung — Beispiel",
    "Standard", 19.90,
    [("Betroffene Person", "Lukas Frei, 3007 Bern"),
     ("Kanton", "Bern"),
     ("Inkassobüro", "Credita Inkasso AG"),
     ("Behauptete Forderung", "CHF 340.– aus einem angeblichen Zeitschriften-Abo von 2022")],
    [
        (None, [
            "Herr Frei erhielt ein Inkassoschreiben über CHF 340.– zuzüglich CHF 65.– „Bearbeitungsgebühren“ "
            "für ein Abo, an dessen Abschluss er sich nicht erinnert und für das keine Unterlagen "
            "beiliegen."]),
        ("Rechtliche Einordnung", [
            "Ein Inkassobüro kann eine Forderung nicht selbst gerichtlich durchsetzen — es handelt im "
            "Auftrag des angeblichen Gläubigers. Drohungen mit „Betreibung“ oder „Gerichtsverfahren“ "
            "allein begründen keine Zahlungspflicht. Ohne Nachweis von Vertrag und Forderungshöhe "
            "besteht keine Veranlassung zur Zahlung."]),
        ("Entwurf: Bestreitungsschreiben", [
            "Credita Inkasso AG",
            "",
            "<b>Betreff:</b> Ihr Schreiben vom [Datum] — Forderung CHF 340.– / Aktenzeichen [...]",
            "",
            "Sehr geehrte Damen und Herren",
            "",
            "Ich bestreite die geltend gemachte Forderung dem Grunde und der Höhe nach vollumfänglich. "
            "Ein Vertragsverhältnis, wie von Ihnen behauptet, ist mir nicht bekannt. Ich fordere Sie auf, "
            "mir innert 14 Tagen den vollständigen Vertragsnachweis inkl. Zustandekommen, "
            "Vertragsbedingungen und Berechnung der Forderung sowie der geltend gemachten Zusatzgebühren "
            "zuzustellen. Solange dieser Nachweis nicht erbracht ist, werde ich keine Zahlung leisten. "
            "Weitere unbelegte Mahnspesen weise ich bereits jetzt zurück.",
            "",
            "Freundliche Grüsse, Lukas Frei"]),
        ("Praktische Hinweise", [
            "• Nichts zahlen, bevor ein Nachweis vorliegt — auch keine „Kulanzzahlung“.",
            "• Eingeschriebene Zustellung wählen, Kopie und Sendebeleg aufbewahren.",
            "• Bei tatsächlicher Betreibung: Rechtsvorschlag erheben (siehe Kategorie „Geld & Betreibung“)."])
    ]
)

# ============================================================
# 4. SCHULDEN — Rechtsvorschlag gegen Betreibung
# ============================================================
build_pdf(
    "04-schulden-rechtsvorschlag.pdf",
    "Rechtsvorschlag gegen Betreibung",
    "Bestreitung eines Zahlungsbefehls — Beispiel",
    "Standard", 19.90,
    [("Schuldner/in", "Nadja Widmer, 9000 St. Gallen"),
     ("Kanton", "St. Gallen"),
     ("Zahlungsbefehl", "Betreibungsamt St. Gallen, Nr. 2026/04512"),
     ("Grund der Bestreitung", "Forderung bereits vollständig beglichen (Zahlung vom 2. April 2026)")],
    [
        (None, [
            "Frau Widmer erhielt einen Zahlungsbefehl über CHF 1'250.–, obwohl sie die zugrunde liegende "
            "Rechnung nachweislich bereits per Banküberweisung beglichen hatte."]),
        ("Wichtiger Hinweis", [
            "Der Rechtsvorschlag muss <b>innert 10 Tagen</b> ab Zustellung des Zahlungsbefehls erhoben "
            "werden. Er muss <b>nicht begründet</b> werden — eine kurze Begründung ist jedoch sinnvoll "
            "und hilft im weiteren Verfahren."]),
        ("Entwurf: Rechtsvorschlag", [
            "<b>An das Betreibungsamt St. Gallen</b>",
            "",
            "Betreibend: [Gläubigerin gemäss Zahlungsbefehl]",
            "Betrieben: Nadja Widmer, 9000 St. Gallen",
            "Betreibung Nr. 2026/04512",
            "",
            "<b>Ich erhebe Rechtsvorschlag gegen den obgenannten Zahlungsbefehl.</b>",
            "",
            "Kurze Begründung (freiwillig): Die Forderung wurde bereits am 2. April 2026 per "
            "Banküberweisung vollständig beglichen (Referenz-Nr. [...]). Ein entsprechender Beleg liegt vor.",
            "",
            "St. Gallen, [Datum]              Unterschrift: Nadja Widmer"]),
        ("Nächste Schritte", [
            "• Formular sofort beim Betreibungsamt einreichen (persönlich, Post oder online, je nach Amt).",
            "• Zahlungsbeleg griffbereit halten für ein allfälliges Rechtsöffnungsverfahren.",
            "• Betreibungsregisterauszug später prüfen, ob der Eintrag korrekt gelöscht wurde."])
    ],
    warn="Frist: 10 Tage ab Zustellung des Zahlungsbefehls — danach ist kein Rechtsvorschlag mehr möglich."
)

# ============================================================
# 5. NACHBARSCHAFT — Beschwerde wegen Immissionen
# ============================================================
build_pdf(
    "05-nachbarschaft-immissionen.pdf",
    "Beschwerde wegen Immissionen",
    "Beanstandung übermässiger Lärmeinwirkung — Beispiel",
    "Info", 9.90,
    [("Betroffene Partei", "Familie Huber, 4500 Solothurn"),
     ("Kanton", "Solothurn"),
     ("Verursacher", "Nachbargrundstück, Werkstattbetrieb im Wohngebiet"),
     ("Art der Störung", "Regelmässiger Maschinenlärm werktags 06:00–07:00 und 20:00–22:00 Uhr")],
    [
        (None, [
            "Die Familie Huber wird seit mehreren Wochen durch Maschinenlärm aus einer benachbarten "
            "Hobbywerkstatt ausserhalb der üblichen Ruhezeiten gestört und hat dies bereits mündlich "
            "erfolglos angesprochen."]),
        ("Rechtliche Einordnung", [
            "Nachbarn müssen ortsübliche Einwirkungen dulden, nicht aber <b>übermässige</b> Immissionen. "
            "Massgebend sind u. a. Häufigkeit, Intensität und Tageszeit. Regelmässiger Lärm ausserhalb "
            "üblicher Ruhezeiten spricht für Übermässigkeit — die konkrete Grenze ist einzelfallabhängig "
            "und ggf. durch die Gemeinde/Polizei zu beurteilen."]),
        ("Entwurf: Beschwerdeschreiben", [
            "An die Nachbarschaft, [Adresse]",
            "",
            "<b>Betreff:</b> Übermässige Lärmimmissionen aus Ihrer Werkstatt",
            "",
            "Sehr geehrte Familie [...]",
            "",
            "Wir werden seit einigen Wochen regelmässig, insbesondere morgens vor 07:00 Uhr und abends "
            "nach 20:00 Uhr, durch Maschinenlärm aus Ihrer Werkstatt erheblich gestört. Wir bitten Sie "
            "höflich, aber bestimmt, die Nutzung auf die üblichen Ruhezeiten zu beschränken. Sollte "
            "innert 14 Tagen keine spürbare Besserung eintreten, sehen wir uns gezwungen, die "
            "Gemeindeverwaltung bzw. die Schlichtungsstelle einzuschalten.",
            "",
            "Freundliche Grüsse, Familie Huber"]),
        ("Praktische Hinweise", [
            "• Ein Lärmprotokoll mit Datum/Uhrzeit/Dauer stärkt die Position erheblich.",
            "• Das Gespräch sachlich und nachbarschaftlich halten — die Beziehung bleibt meist bestehen.",
            "• Bei Nichtbesserung: Gemeinde/Polizei oder Schlichtungsbehörde einschalten."])
    ]
)

# ============================================================
# 6. VERKEHR — Einsprache gegen Ordnungsbusse
# ============================================================
build_pdf(
    "06-verkehr-einsprache-ordnungsbusse.pdf",
    "Einsprache gegen Ordnungsbusse",
    "Bestreitung einer Verzeigung im Strassenverkehr — Beispiel",
    "Info", 9.90,
    [("Betroffene Partei", "Elena Fischer, 6000 Luzern"),
     ("Kanton", "Luzern"),
     ("Vorwurf", "Falschparkieren auf einem markierten Behindertenparkplatz"),
     ("Bussendatum", "14. Juli 2026")],
    [
        (None, [
            "Frau Fischer erhielt eine Busse für angebliches Parkieren auf einem Behindertenparkplatz, "
            "obwohl an der fraglichen Stelle zum Vorfallszeitpunkt keine gültige Markierung erkennbar "
            "gewesen sei (Fotobeleg vorhanden)."]),
        ("Wichtiger Hinweis", [
            "Die <b>Zahlung</b> einer Ordnungsbusse gilt in der Regel als Anerkennung des Vorwurfs. Eine "
            "Einsprache bzw. Nichtzahlung führt stattdessen zum ordentlichen Verfahren (ggf. Strafbefehl) "
            "— mit potenziell höheren Kosten, aber der Möglichkeit einer echten Überprüfung."]),
        ("Entwurf: Einsprache", [
            "An die zuständige Polizei-/Bussenstelle Luzern",
            "",
            "<b>Betreff:</b> Einsprache gegen Ordnungsbusse vom 14. Juli 2026, Nr. [...]",
            "",
            "Sehr geehrte Damen und Herren",
            "",
            "Ich erhebe Einsprache gegen die mir zugestellte Ordnungsbusse. Nach meiner Wahrnehmung war "
            "die Markierung als Behindertenparkplatz zum fraglichen Zeitpunkt nicht erkennbar bzw. "
            "verwittert (Fotobeweis beigelegt). Ich bitte um Überprüfung des Sachverhalts vor Ort und "
            "um Rücknahme der Busse.",
            "",
            "Freundliche Grüsse, Elena Fischer"]),
        ("Nächste Schritte", [
            "• Fotos/Beweismittel der Behörde beilegen.",
            "• Fristablauf der Bussenstelle beachten (auf dem Bussenzettel vermerkt).",
            "• Bei Weiterzug zum Strafbefehl: Fachliche Beratung erwägen bei höheren Bussen."])
    ]
)

# ============================================================
# 7. DATENSCHUTZ — Auskunftsbegehren
# ============================================================
build_pdf(
    "07-datenschutz-auskunftsbegehren.pdf",
    "Auskunftsbegehren nach Datenschutzgesetz",
    "Auskunft über gespeicherte Personendaten verlangen — Beispiel",
    "Info", 9.90,
    [("Anfragende Person", "Thomas Baumann, 8003 Zürich"),
     ("Kanton", "Zürich"),
     ("Verantwortliche Stelle", "Online-Marktplatz Shopnow AG"),
     ("Anlass", "Erhalt personalisierter Werbung trotz nie erteilter Einwilligung")],
    [
        (None, [
            "Herr Baumann möchte wissen, welche Daten die Shopnow AG über ihn gespeichert hat, woher "
            "diese stammen und an wen sie weitergegeben wurden."]),
        ("Entwurf: Auskunftsbegehren", [
            "Shopnow AG, Datenschutzverantwortliche/r",
            "",
            "<b>Betreff:</b> Auskunftsbegehren nach Art. 25 revDSG",
            "",
            "Sehr geehrte Damen und Herren",
            "",
            "Gestützt auf das Schweizer Datenschutzgesetz ersuche ich Sie um vollständige Auskunft über "
            "die von Ihnen über mich bearbeiteten Personendaten. Konkret bitte ich um Mitteilung von:",
            "• welche Personendaten über mich bearbeitet werden;",
            "• deren Herkunft;",
            "• dem Zweck der Bearbeitung;",
            "• allfälligen Empfängern bzw. Kategorien von Empfängern, einschliesslich im Ausland;",
            "• der Aufbewahrungsdauer bzw. den Kriterien für deren Festlegung.",
            "",
            "Ich bitte um Beantwortung innert der gesetzlichen Frist. Für den Fall, dass die Auskunft "
            "verweigert oder nicht fristgerecht erteilt wird, behalte ich mir eine Beschwerde beim "
            "Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) vor.",
            "",
            "Freundliche Grüsse, Thomas Baumann"]),
        ("Praktische Hinweise", [
            "• Die Auskunft ist grundsätzlich kostenlos.",
            "• Eine Antwort sollte konkrete Datenkategorien nennen, keine pauschalen Floskeln.",
            "• Bei unbefriedigender Antwort: Löschungs- oder Widerspruchsbegehren als nächster Schritt."])
    ]
)

# ============================================================
# 8. VERSICHERUNG — Einsprache gegen Versicherungsentscheid
# ============================================================
build_pdf(
    "08-versicherung-einsprache.pdf",
    "Einsprache gegen Versicherungsentscheid",
    "Anfechtung einer ablehnenden Verfügung — Beispiel",
    "Premium", 39.90,
    [("Versicherte Person", "Anna Keller, 3600 Thun"),
     ("Kanton", "Bern"),
     ("Versicherer", "Unfallversicherung SwissSecura"),
     ("Verfügung", "Ablehnung der Kostenübernahme für Physiotherapie nach Sportunfall")],
    [
        (None, [
            "Frau Keller erlitt einen Sportunfall mit ärztlich attestierter Kniebandverletzung. Der "
            "Unfallversicherer lehnte die weitere Kostenübernahme mit Verweis auf „nicht mehr "
            "unfallbedingte Beschwerden“ ab, ohne eigene ärztliche Untersuchung."]),
        ("Wichtiger Hinweis", [
            "Die Einsprachefrist gegen Verfügungen von Unfallversicherungen beträgt in der Regel "
            "<b>30 Tage</b> ab Zustellung (zu verifizieren) — bei privaten Zusatzversicherungen ist "
            "stattdessen die Police massgebend."]),
        ("Würdigung", [
            "Eine Leistungseinstellung mit Verweis auf fehlenden Unfallzusammenhang setzt regelmässig "
            "eine nachvollziehbare medizinische Begründung voraus, im Zweifel gestützt auf eine "
            "versicherungsinterne oder externe ärztliche Beurteilung. Das Fehlen einer eigenen "
            "Untersuchung schwächt die Position des Versicherers und ist ein zentraler Einwand."]),
        ("Entwurf: Einsprache", [
            "SwissSecura, Rechtsdienst",
            "",
            "<b>Betreff:</b> Einsprache gegen Verfügung vom [Datum], Fall-Nr. [...]",
            "",
            "Sehr geehrte Damen und Herren",
            "",
            "Gegen Ihre Verfügung vom [Datum], mit welcher die weitere Kostenübernahme für die "
            "Physiotherapie nach meinem Unfall vom [Datum] abgelehnt wurde, erhebe ich fristgerecht "
            "Einsprache. Die Ablehnung stützt sich nach meiner Kenntnis nicht auf eine eigene ärztliche "
            "Untersuchung, sondern lediglich auf eine Aktenbeurteilung. Die behandelnden Ärzte "
            "bestätigen einen fortbestehenden Zusammenhang mit dem Unfallereignis (Arztbericht beigelegt). "
            "Ich beantrage die vollumfängliche Weiterführung der Kostenübernahme.",
            "",
            "Freundliche Grüsse, Anna Keller"]),
        ("Nächste Schritte", [
            "• Alle ärztlichen Berichte/Atteste beilegen.",
            "• Fristablauf notieren und Einschreiben nutzen.",
            "• Bei Ablehnung der Einsprache: Beschwerdemöglichkeit prüfen (fachliche Beratung empfohlen)."])
    ],
    warn="Fristenhinweis: Einsprachefrist meist 30 Tage ab Zustellung — im Kanton/Fall zu verifizieren."
)

# ============================================================
# 9. KMU — Rechnung & Mahnung fürs eigene Gewerbe
# ============================================================
build_pdf(
    "09-kmu-rechnung-mahnung.pdf",
    "Rechnung & Mahnung fürs eigene Gewerbe",
    "Professionelle Rechnung mit dreistufigem Mahnwesen — Beispiel",
    "Info", 9.90,
    [("Geschäft", "Pixelwerk Grafikdesign, Fabian Zürcher, 2502 Biel/Bienne"),
     ("Kanton", "Bern"),
     ("Kunde", "Café Lumière GmbH, 2502 Biel/Bienne"),
     ("Leistung", "Logo-Design & Corporate-Design-Paket, CHF 1'450.–, Zahlungsziel 30 Tage")],
    [
        (None, [
            "Herr Zürcher benötigt eine korrekte Rechnung für sein erbrachtes Design-Mandat sowie ein "
            "griffbereites, dreistufiges Mahnschema für den Fall des Zahlungsverzugs."]),
        ("Rechnung Nr. 2026-014", [
            "<b>Pixelwerk Grafikdesign · Fabian Zürcher</b> — Musterstrasse 5, 2502 Biel/Bienne",
            "UID: CHE-XXX.XXX.XXX MWST (falls MWST-pflichtig)",
            "",
            "<b>Rechnungsempfänger:</b> Café Lumière GmbH, Bahnhofplatz 3, 2502 Biel/Bienne",
            "<b>Rechnungsdatum:</b> 1. Juli 2026 · <b>Fällig:</b> 31. Juli 2026",
            "",
            "Leistung: Logo-Design &amp; Corporate-Design-Paket gemäss Offerte vom 2. Juni 2026",
            "Betrag: <b>CHF 1'450.00</b>",
            "Zahlbar auf: IBAN CH00 0000 0000 0000 0000 0, Pixelwerk Grafikdesign"]),
        ("Stufe 1 — Freundliche Erinnerung (nach Fälligkeit)", [
            "Sehr geehrte Damen und Herren, gerne weisen wir Sie darauf hin, dass unsere Rechnung "
            "Nr. 2026-014 über CHF 1'450.00 am 31. Juli 2026 fällig war. Falls sich Ihre Zahlung mit "
            "diesem Schreiben überschnitten hat, betrachten Sie es bitte als gegenstandslos."]),
        ("Stufe 2 — Mahnung mit Frist (bei weiterem Verzug)", [
            "Trotz unserer Erinnerung ist der offene Betrag von CHF 1'450.00 noch nicht bei uns "
            "eingegangen. Wir bitten um Ausgleich bis spätestens [Datum]. Ab Verzug ist ein "
            "Verzugszins geschuldet (Prüfhinweis: gesetzlicher Zinssatz im OR)."]),
        ("Stufe 3 — Letzte Mahnung mit Betreibungsankündigung", [
            "Wir müssen feststellen, dass der offene Betrag weiterhin nicht beglichen wurde. Wir setzen "
            "Ihnen eine letzte Frist bis [Datum]. Nach unbenutztem Ablauf werden wir ohne weitere "
            "Ankündigung die Betreibung einleiten."])
    ]
)

# ============================================================
# 10. WERKZEUGE — Rechtsgutachten / Fallanalyse
# ============================================================
build_pdf(
    "10-rechtsgutachten.pdf",
    "Rechtsgutachten / Fallanalyse",
    "Strukturierte Einschätzung für ein beliebiges Rechtsthema — Beispiel",
    "Premium", 39.90,
    [("Partei", "Michael Steiner, Käufer"),
     ("Kanton", "Aargau"),
     ("Thema", "Rücktritt von einem Occasionsfahrzeug-Kaufvertrag wegen verschwiegenem Vorschaden")],
    [
        (None, [
            "Herr Steiner kaufte ein Occasionsfahrzeug bei einem privaten Verkäufer. Zwei Wochen später "
            "stellte eine Garage einen fachmännisch reparierten, im Verkaufsgespräch nicht erwähnten "
            "Unfallschaden am Fahrzeug fest."]),
        ("1. Relevanter Sachverhalt", [
            "Kaufvertrag vom 15. Juni 2026, Kaufpreis CHF 14'500.–, privater Verkauf ohne "
            "Gewährleistungsausschluss-Klausel im Vertrag. Feststellung des reparierten Vorschadens am "
            "29. Juni 2026 durch eine unabhängige Fachgarage, mit schriftlichem Prüfbericht."]),
        ("2. Rechtsfrage(n)", [
            "Liegt ein Sachmangel vor, der Herrn Steiner zum Rücktritt vom Kaufvertrag oder zur "
            "Minderung des Kaufpreises berechtigt? Ist die Mängelrüge rechtzeitig erfolgt?"]),
        ("3. Anwendbare Normen (auf fedlex.admin.ch zu verifizieren)", [
            "• Sachmängelhaftung im Kaufrecht des Obligationenrechts (Eigenschaftszusicherung, "
            "verdeckte Mängel)",
            "• Rügeobliegenheit und deren Frist nach Entdeckung des Mangels",
            "• Wahlrecht zwischen Wandelung (Rücktritt) und Minderung"]),
        ("4. Subsumtion", [
            "Ein fachmännisch reparierter, aber nicht offengelegter Unfallschaden gilt bei einem "
            "Fahrzeugkauf regelmässig als Sachmangel, da er den Wert und die übliche Beschaffenheit "
            "erheblich beeinflusst, unabhängig von der fachlichen Qualität der Reparatur. Die Rüge "
            "innert zwei Wochen nach Feststellung durch eine Fachgarage dürfte als „sofort“ im Sinne der "
            "Rügeobliegenheit gelten, sofern seit der Übergabe keine unangemessen lange Zeit verstrichen "
            "ist. Massgeblich für die Rechtsfolge ist zudem, ob im Vertrag ein Gewährleistungsausschluss "
            "vereinbart wurde — hier nicht der Fall."]),
        ("5. Ergebnis & Empfehlung", [
            "**Ergebnis: Rücktritt vom Kaufvertrag erscheint aussichtsreich, Minderung als Alternative "
            "möglich.**",
            "Empfehlung: unverzüglich schriftliche Mängelrüge mit Fristsetzung stellen, den Prüfbericht "
            "der Fachgarage beilegen und primär den Rücktritt (Zug-um-Zug gegen Rückerstattung), "
            "sekundär eine Minderung des Kaufpreises verlangen."]),
        ("6. Offene Punkte", [
            "• Genauer Zeitpunkt und Umstände der Fahrzeugübergabe.",
            "• Ob der Verkäufer den Vorschaden kannte (Auswirkung auf Verjährungsfragen).",
            "• Zustand/Inhalt des schriftlichen Kaufvertrags im Detail."])
    ]
)

# ============================================================
# BATCH 2 — restliche 70 Dokumente (11-80)
# ============================================================

# --- MIETE (restliche 7) ---
build_pdf("11-miete-maengelruege.pdf", "Mängelrüge an die Vermieterschaft",
    "Mangel melden und Frist zur Behebung setzen — Beispiel", "Info", 9.90,
    [("Mieter/in", "Julia Vogt, 4051 Basel"), ("Kanton", "Basel-Stadt"),
     ("Vermieterschaft", "Hausverwaltung Rhein AG"),
     ("Mangel", "Defekte Heizung in zwei Zimmern seit 3 Wochen, trotz mündlicher Meldung nicht behoben")],
    [(None, ["Frau Vogt meldete den Heizungsdefekt bereits telefonisch, ohne Reaktion. Sie möchte den Mangel nun schriftlich rügen und eine Frist setzen."]),
     ("Entwurf: Mängelrüge", [
        "Hausverwaltung Rhein AG", "",
        "<b>Betreff:</b> Mängelrüge — defekte Heizung, Wohnung 3. OG",
        "", "Sehr geehrte Damen und Herren", "",
        "Wie am 2. Juli 2026 bereits telefonisch gemeldet, funktioniert die Heizung in Wohn- und Schlafzimmer seit drei Wochen nicht. Ich fordere Sie auf, den Mangel bis spätestens 20. Juli 2026 zu beheben. Andernfalls behalte ich mir eine Mietzinsherabsetzung ab Mängelbeginn sowie die Hinterlegung des Mietzinses vor.",
        "", "Freundliche Grüsse, Julia Vogt"]),
     ("Praktische Hinweise", ["• Mängel immer zusätzlich schriftlich (eingeschrieben oder E-Mail mit Lesebestätigung) melden.",
        "• Datum der ersten (auch mündlichen) Meldung dokumentieren — massgeblich für rückwirkende Mietzinsherabsetzung.",
        "• Fotos/Temperaturmessungen als Beweismittel sichern."])])

build_pdf("12-miete-mietzinsherabsetzung.pdf", "Mietzinsherabsetzung verlangen",
    "Anpassung bei gesunkenem Referenzzinssatz — Beispiel", "Standard", 19.90,
    [("Mieter/in", "Peter Halter, 6003 Luzern"), ("Kanton", "Luzern"),
     ("Vermieterschaft", "Wohnbau Reuss AG"),
     ("Sachverhalt", "Referenzzinssatz seit letzter Mietzinsfestsetzung 2021 um 0.25 Prozentpunkte gesunken")],
    [(None, ["Herr Halter hat von einer Senkung des hypothekarischen Referenzzinssatzes gehört und möchte eine entsprechende Mietzinsanpassung verlangen."]),
     ("Rechtliche Einordnung", ["Sinkt der Referenzzinssatz nach der letzten Mietzinsfestsetzung, besteht grundsätzlich ein Anspruch auf verhältnismässige Herabsetzung. In vielen Kantonen ist dafür das amtliche Formular zu verwenden (Prüfhinweis, kantonal unterschiedlich)."]),
     ("Entwurf: Gesuch um Mietzinsherabsetzung", [
        "Wohnbau Reuss AG", "",
        "<b>Betreff:</b> Gesuch um Mietzinsherabsetzung",
        "", "Sehr geehrte Damen und Herren", "",
        "Der hypothekarische Referenzzinssatz ist seit der letzten Mietzinsfestsetzung im März 2021 gesunken. Gestützt darauf verlange ich eine entsprechende Herabsetzung meines Nettomietzinses ab dem nächstmöglichen Kündigungstermin. Ich bitte um schriftliche Bestätigung innert 30 Tagen.",
        "", "Freundliche Grüsse, Peter Halter"]),
     ("Nächste Schritte", ["• Aktuellen und bei Vertragsbeginn geltenden Referenzzinssatz vergleichen.",
        "• Bei Ablehnung: Schlichtungsbehörde anrufen.", "• Regelmässig (bei jeder Senkung) neu prüfen."])])

build_pdf("13-miete-nebenkosten-beanstanden.pdf", "Nebenkostenabrechnung beanstanden",
    "Belegeinsicht verlangen und Fehler rügen — Beispiel", "Standard", 19.90,
    [("Mieter/in", "Corinne Aebi, 3011 Bern"), ("Kanton", "Bern"),
     ("Vermieterschaft", "Immo Bern GmbH"),
     ("Sachverhalt", "Heizkosten gegenüber Vorjahr ohne Erklärung um 40% gestiegen, keine Belege beigelegt")],
    [(None, ["Frau Aebi erhielt eine Nebenkostenabrechnung mit deutlich höheren Heizkosten als im Vorjahr, ohne nachvollziehbare Begründung oder Belege."]),
     ("Rechtliche Einordnung", ["Mieterschaft hat Anspruch auf Einsicht in sämtliche Belege der Nebenkostenabrechnung. Eine plausible Begründung für starke Abweichungen darf verlangt werden."]),
     ("Entwurf: Beanstandung", [
        "Immo Bern GmbH", "",
        "<b>Betreff:</b> Beanstandung Nebenkostenabrechnung 2025",
        "", "Sehr geehrte Damen und Herren", "",
        "Die mir zugestellte Abrechnung weist gegenüber dem Vorjahr um 40% höhere Heizkosten aus, ohne Belege oder Erläuterung. Ich verlange vollständige Einsicht in die zugrunde liegenden Belege sowie eine Erklärung für die Kostensteigerung binnen 20 Tagen. Bis zur Klärung behalte ich mir vor, den strittigen Betrag zurückzubehalten.",
        "", "Freundliche Grüsse, Corinne Aebi"]),
     ("Praktische Hinweise", ["• Belegeinsicht schriftlich und mit Frist verlangen, nicht nur mündlich.",
        "• Frühere Abrechnungen zum Vergleich griffbereit halten.", "• Bei Uneinigkeit: Schlichtungsbehörde."])])

build_pdf("14-miete-kaution-rueckfordern.pdf", "Kaution zurückfordern",
    "Rückzahlung nach Auszug, unberechtigte Abzüge bestreiten — Beispiel", "Standard", 19.90,
    [("Mieter/in", "Simon Wyss, 9004 St. Gallen"), ("Kanton", "St. Gallen"),
     ("Vermieterschaft", "Liegenschaften Ostschweiz AG"),
     ("Sachverhalt", "Auszug vor 4 Monaten, CHF 800 Abzug für 'Abnutzung Bodenbelag' ohne Beleg")],
    [(None, ["Herr Wyss ist vor vier Monaten ausgezogen. Die Vermieterschaft hält einen Teil der Kaution mit Verweis auf Bodenabnutzung zurück, ohne Kostenvoranschlag oder Rechnung vorzulegen."]),
     ("Entwurf: Rückforderung", [
        "Liegenschaften Ostschweiz AG", "",
        "<b>Betreff:</b> Rückforderung Mietkaution",
        "", "Sehr geehrte Damen und Herren", "",
        "Seit meinem Auszug am 31. März 2026 sind vier Monate vergangen, ohne dass Ansprüche gegenüber mir geltend gemacht wurden ausser einem pauschalen Abzug von CHF 800 für 'Abnutzung Bodenbelag'. Normale, altersbedingte Abnutzung stellt keine Schadensposition dar. Ich bestreite diesen Abzug mangels Beleg und verlange die vollständige Auszahlung der Kaution binnen 14 Tagen auf mein Konto.",
        "", "Freundliche Grüsse, Simon Wyss"]),
     ("Praktische Hinweise", ["• Abnahmeprotokoll beim Auszug als Beweismittel prüfen.",
        "• Normale Abnutzung ist keine Schadensposition — nur übermässige Schäden zählen.",
        "• Bank/Kautionskonto-Freigabe schriftlich verlangen."])])

build_pdf("15-miete-mieterhoehung-widersprechen.pdf", "Widerspruch gegen Mietzinserhöhung",
    "Einseitige Erhöhung fristgerecht anfechten — Beispiel", "Standard", 19.90,
    [("Mieter/in", "Rahel Blum, 8400 Winterthur"), ("Kanton", "Zürich"),
     ("Vermieterschaft", "Wohnbaugenossenschaft Limmat"),
     ("Sachverhalt", "Erhöhung um CHF 150/Monat mit pauschalem Verweis auf 'allgemeine Kostensteigerung', kein amtliches Formular beigelegt")],
    [(None, ["Frau Blum erhielt eine Mietzinserhöhung ohne das in ihrem Kanton vorgeschriebene amtliche Formular und mit einer sehr allgemeinen Begründung."]),
     ("Rechtliche Einordnung", ["Eine Mietzinserhöhung ohne gültiges amtliches Formular ist formnichtig. Eine rein pauschale Begründung ohne konkrete Kostenfaktoren ist zudem materiell angreifbar (Prüfhinweis)."]),
     ("Entwurf: Widerspruch", [
        "Wohnbaugenossenschaft Limmat", "",
        "<b>Betreff:</b> Widerspruch gegen Mietzinserhöhung",
        "", "Sehr geehrte Damen und Herren", "",
        "Die mir angezeigte Mietzinserhöhung um CHF 150.– erfolgte ohne das amtliche Formular und ohne nachvollziehbare, konkrete Begründung. Ich widerspreche der Erhöhung und werde bis zur Klärung den bisherigen Mietzins weiter bezahlen. Ich behalte mir die Anrufung der Schlichtungsbehörde ausdrücklich vor.",
        "", "Freundliche Grüsse, Rahel Blum"]),
     ("Nächste Schritte", ["• Frist für Anfechtung beim amtlichen Formular notieren (meist 30 Tage).",
        "• Schriftliche Begründung der Vermieterschaft anfordern.", "• Bei Uneinigkeit: Schlichtungsbehörde anrufen."])],
    warn="Achtung: Die Anfechtungsfrist beginnt mit Zustellung des Formulars und ist zwingend einzuhalten.")

build_pdf("16-miete-untervermietung-gesuch.pdf", "Gesuch um Zustimmung zur Untermiete",
    "Formell korrektes Gesuch für die Untermiete — Beispiel", "Info", 9.90,
    [("Mieter/in", "Daniel Ott, 2000 Neuenburg"), ("Kanton", "Neuenburg"),
     ("Vermieterschaft", "Régie du Lac SA"),
     ("Sachverhalt", "6-monatiger Auslandaufenthalt, Wohnung soll für diese Zeit an eine Bekannte untervermietet werden")],
    [(None, ["Herr Ott geht für ein halbes Jahr ins Ausland und möchte seine Wohnung für diese Zeit untervermieten, ohne den Hauptmietvertrag zu kündigen."]),
     ("Entwurf: Gesuch", [
        "Régie du Lac SA", "",
        "<b>Betreff:</b> Gesuch um Zustimmung zur Untermiete",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich beabsichtige, meine Wohnung vom 1. September 2026 bis 28. Februar 2027 wegen eines Auslandaufenthalts an Frau Nadia Perret unterzuvermieten, zu unveränderten Bedingungen und demselben Mietzins. Ich bitte um schriftliche Zustimmung binnen 20 Tagen.",
        "", "Freundliche Grüsse, Daniel Ott"]),
     ("Praktische Hinweise", ["• Alle vom Vermieter üblicherweise verlangten Angaben (Person, Dauer, Bedingungen) proaktiv liefern.",
        "• Zustimmung darf nur aus bestimmten Gründen verweigert werden.",
        "• Bei unbegründeter Verweigerung: Schlichtungsbehörde anrufen."])])

build_pdf("17-miete-mietvertrag-pruefen.pdf", "Mietvertrag vor Unterschrift prüfen",
    "Klauselcheck: was ist üblich, was ist riskant? — Beispiel", "Standard", 19.90,
    [("Zukünftige/r Mieter/in", "Livia Marti, 6900 Lugano"), ("Kanton", "Tessin"),
     ("Vertragsentwurf", "3.5-Zimmer-Wohnung, Anfangsmietzins CHF 2'100.–, Kaution 3 Monatsmieten, 12 Monate Mindestdauer")],
    [(None, ["Frau Marti möchte den ihr vorgelegten Mietvertrag vor der Unterschrift kritisch prüfen lassen."]),
     ("Risiko-Übersicht", [
        "| Klausel | Einschätzung | Risiko |",
        "| Anfangsmietzins CHF 2'100.– | Vergleich zum Vormietzins nicht bekannt — anfordern | mittel |",
        "| Kaution 3 Monatsmieten | Gesetzliches Maximum, zulässig | tief |",
        "| Mindestdauer 12 Monate | Unüblich lang für Wohnraum, prüfen ob verhandelbar | mittel |",
        "| Kündigungsfrist 3 Monate | Marktüblich | tief |"]),
     ("Empfehlung", ["Vor Unterschrift den Vormietzins beim Vermieter erfragen (Anspruch bei Erstvermietung/Wohnungsknappheit) und die Mindestdauer-Klausel zu verhandeln versuchen."]),
     ("Checkliste vor Unterschrift", ["• Formvorschrift beachtet (Schriftform)?", "• Nebenkosten-Regelung klar (Pauschale vs. Akonto)?",
        "• Zustand bei Übergabe schriftlich protokollieren."])])

# --- ARBEIT (restliche 7) ---
build_pdf("18-arbeit-fristlose-kuendigung.pdf", "Fristlose Kündigung einschätzen",
    "War die fristlose Kündigung rechtmässig? — Beispiel", "Premium", 39.90,
    [("Partei", "David Meyer, Arbeitnehmer"), ("Kanton", "Aargau"),
     ("Arbeitgeberin", "Bauhandel Meier AG"),
     ("Sachverhalt", "Fristlose Entlassung nach einmaligem verspätetem Erscheinen (20 Min.) ohne vorherige Verwarnung")],
    [(None, ["Herr Meyer wurde nach einer einzigen Verspätung von 20 Minuten fristlos entlassen, ohne dass zuvor eine Verwarnung ausgesprochen worden war."]),
     ("1. Sachverhalt", ["Einmaliges verspätetes Erscheinen um 20 Minuten am 5. Juli 2026, sofortige fristlose Entlassung noch am selben Tag. Keine vorherige Verwarnung oder Abmahnung dokumentiert."]),
     ("2. Prüfung 'wichtiger Grund'", ["Eine fristlose Kündigung setzt regelmässig eine schwere Pflichtverletzung voraus, die die Fortsetzung des Arbeitsverhältnisses unzumutbar macht. Eine einmalige, geringfügige Verspätung ohne vorherige Verwarnung erreicht diese Schwelle typischerweise nicht (Prüfhinweis, Einzelfallwürdigung massgebend)."]),
     ("3. Rechtsfolgen bei Ungerechtfertigtheit", ["Erweist sich die fristlose Kündigung als ungerechtfertigt, entstehen Ansprüche auf Lohnfortzahlung bis zum ordentlichen Vertragsende sowie eine zusätzliche Entschädigung (Prüfhinweis: Höhe im Ermessen des Gerichts)."]),
     ("4. Empfehlung", ["**Empfehlung: Ungerechtfertigtheit der fristlosen Kündigung schriftlich geltend machen und Lohnansprüche fordern.**"]),
     ("Entwurf: Schreiben an den Arbeitgeber", [
        "Bauhandel Meier AG", "",
        "Ich mache geltend, dass die mir gegenüber ausgesprochene fristlose Kündigung ungerechtfertigt ist, da kein wichtiger Grund im Sinne des Gesetzes vorliegt. Ich fordere den Lohn bis zum ordentlichen Vertragsende sowie eine angemessene Entschädigung.",
        "", "Freundliche Grüsse, David Meyer"])])

build_pdf("19-arbeit-zeugnis-korrektur.pdf", "Arbeitszeugnis-Korrektur verlangen",
    "Wohlwollend, wahr, vollständig einfordern — Beispiel", "Standard", 19.90,
    [("Partei", "Selina Hofer, Arbeitnehmerin"), ("Kanton", "Zug"),
     ("Arbeitgeberin", "Officeplus Zug AG"),
     ("Beanstandung", "Formulierung „erledigte die ihr übertragenen Aufgaben“ statt üblicher positiver Wendungen, trotz guter Leistungsbeurteilungen")],
    [(None, ["Frau Hofer erhielt ein Arbeitszeugnis mit auffällig neutraler bis kühler Formulierung, obwohl ihre Leistungsbeurteilungen durchwegs gut waren."]),
     ("Entwurf: Korrekturverlangen", [
        "Officeplus Zug AG", "",
        "<b>Betreff:</b> Korrektur Arbeitszeugnis",
        "", "Sehr geehrte Damen und Herren", "",
        "Das mir ausgestellte Arbeitszeugnis entspricht nicht durchgehend meiner tatsächlichen Leistung, die in allen Beurteilungsgesprächen als gut bis sehr gut eingestuft wurde. Insbesondere die Formulierung „erledigte die ihr übertragenen Aufgaben“ wirkt unterdurchschnittlich. Ich bitte um Anpassung auf eine der Leistung entsprechende, wohlwollende Formulierung, z. B. „erledigte die ihr übertragenen Aufgaben stets zu unserer vollen Zufriedenheit“.",
        "", "Freundliche Grüsse, Selina Hofer"]),
     ("Praktische Hinweise", ["• Frühere Leistungsbeurteilungen als Beleg beilegen.",
        "• Codes/versteckte Andeutungen (z. B. „bemühte sich“) gezielt ansprechen.",
        "• Bei Verweigerung: Klage auf Zeugnisberichtigung möglich."])])

build_pdf("20-arbeit-lohnforderung.pdf", "Lohnforderung stellen",
    "Ausstehenden Lohn oder 13. Monatslohn einfordern — Beispiel", "Standard", 19.90,
    [("Partei", "Ana Petrović, Arbeitnehmerin"), ("Kanton", "Genf"),
     ("Arbeitgeberin", "Restaurant Le Soleil Sàrl"),
     ("Sachverhalt", "13. Monatslohn für 2025 (CHF 3'800.–) trotz vertraglicher Zusage nicht ausbezahlt")],
    [(None, ["Frau Petrović hat vertraglich Anspruch auf einen 13. Monatslohn, der für 2025 bislang nicht ausbezahlt wurde."]),
     ("Entwurf: Lohnforderung", [
        "Restaurant Le Soleil Sàrl", "",
        "<b>Betreff:</b> Ausstehender 13. Monatslohn 2025",
        "", "Sehr geehrte Damen und Herren", "",
        "Gemäss Ziffer 4 meines Arbeitsvertrags habe ich Anspruch auf einen 13. Monatslohn, welcher mir für das Jahr 2025 in Höhe von CHF 3'800.– bislang nicht ausbezahlt wurde. Ich fordere die Nachzahlung bis zum 31. Juli 2026. Ab Verzug mache ich zusätzlich den gesetzlichen Verzugszins geltend.",
        "", "Freundliche Grüsse, Ana Petrović"]),
     ("Praktische Hinweise", ["• Arbeitsvertrag/Lohnabrechnungen als Beleg beilegen.",
        "• Verjährungsfrist für Lohnforderungen im Auge behalten.", "• Bei Nichtzahlung: Betreibung als nächster Schritt."])])

build_pdf("21-arbeit-kuendigungsfrist-check.pdf", "Kündigungsfrist & Sperrfrist berechnen",
    "Inkl. Krankheits-/Unfall-Sperrfristen — Beispiel", "Info", 9.90,
    [("Partei", "Reto Frei, Arbeitnehmer"), ("Kanton", "Solothurn"),
     ("Sachverhalt", "5 Dienstjahre, Kündigung durch Arbeitgeber am 10. Juli 2026 erhalten, seit 3 Tagen krankgeschrieben")],
    [(None, ["Herr Frei möchte wissen, ob die ihm zugestellte Kündigung angesichts seiner aktuellen Krankschreibung überhaupt gültig ist bzw. wann sein Arbeitsverhältnis endet."]),
     ("Fristenberechnung", [
        "Bei 5 Dienstjahren beträgt die ordentliche Kündigungsfrist typischerweise 2 Monate auf Ende eines Monats (Prüfhinweis: Vertrag/GAV kann abweichen).",
        "Da die Krankschreibung erst 3 Tage vor der Kündigung begann, könnte eine Sperrfrist greifen: Kündigungen während bestehender Arbeitsunfähigkeit sind für eine bestimmte Dauer nichtig bzw. die Kündigungsfrist wird unterbrochen und verlängert sich entsprechend (Prüfhinweis, Dauer je nach Dienstjahr gestaffelt)."]),
     ("Ergebnis", ["Die Kündigung dürfte grundsätzlich gültig ausgesprochen worden sein, jedoch verschiebt sich das Ende des Arbeitsverhältnisses um die Dauer der krankheitsbedingten Sperrfrist. Ein genaues Enddatum sollte erst nach Ende der Arbeitsunfähigkeit final berechnet werden."])])

build_pdf("22-arbeit-ueberstunden-abgeltung.pdf", "Überstunden-/Überzeitentschädigung einfordern",
    "Geleistete Mehrarbeit dokumentieren und einfordern — Beispiel", "Standard", 19.90,
    [("Partei", "Yannick Roth, Arbeitnehmer"), ("Kanton", "Thurgau"),
     ("Arbeitgeberin", "Logistik Thur AG"),
     ("Sachverhalt", "62 dokumentierte Überstunden in den letzten 4 Monaten, bislang weder ausbezahlt noch kompensiert")],
    [(None, ["Herr Roth hat über vier Monate hinweg Arbeitszeiten erfasst und kommt auf 62 nicht abgegoltene Überstunden."]),
     ("Rechtliche Einordnung", ["Überstunden sind grundsätzlich mit einem Zuschlag zu entschädigen oder durch Freizeit gleicher Dauer zu kompensieren, sofern nichts anderes schriftlich vereinbart wurde (Prüfhinweis: Arbeitsvertrag prüfen)."]),
     ("Entwurf: Forderungsschreiben", [
        "Logistik Thur AG", "",
        "<b>Betreff:</b> Abgeltung von Überstunden",
        "", "Sehr geehrte Damen und Herren", "",
        "Gemäss meiner Arbeitszeiterfassung habe ich zwischen März und Juni 2026 insgesamt 62 Überstunden geleistet (Aufstellung beigelegt). Ich bitte um Mitteilung, ob eine Kompensation durch Freizeit oder eine Auszahlung erfolgen soll, und um Regelung binnen 20 Tagen.",
        "", "Freundliche Grüsse, Yannick Roth"]),
     ("Praktische Hinweise", ["• Arbeitszeiterfassung lückenlos und zeitnah führen.",
        "• Unterschied Überstunden (vertraglich) vs. Überzeit (gesetzlich, Arbeitsgesetz) beachten."])])

build_pdf("23-arbeit-konkurrenzverbot-pruefen.pdf", "Konkurrenzverbot prüfen/anfechten",
    "Ist die Klausel im Arbeitsvertrag überhaupt gültig? — Beispiel", "Premium", 39.90,
    [("Partei", "Nina Berger, ehemalige Arbeitnehmerin"), ("Kanton", "Zürich"),
     ("Ehemalige Arbeitgeberin", "SoftTech Solutions AG"),
     ("Sachverhalt", "Konkurrenzverbot: 2 Jahre, gesamte Schweiz, jede Software-Branche — geplanter Wechsel zu einem branchennahen Startup")],
    [(None, ["Frau Berger möchte zu einem Startup wechseln, das in einem verwandten Marktsegment tätig ist. Ihr bisheriger Arbeitsvertrag enthält ein sehr weit gefasstes Konkurrenzverbot."]),
     ("1. Sachverhalt", ["Konkurrenzverbot: Dauer 2 Jahre, räumlich gesamte Schweiz, sachlich „jede Tätigkeit im Softwarebereich“. Frau Berger hatte in ihrer Position keinen Zugang zu Kundenlisten oder Geschäftsgeheimnissen, sondern reine Entwicklertätigkeit."]),
     ("2. Gültigkeitsprüfung", ["Ein Konkurrenzverbot ist nur gültig, soweit die Arbeitnehmerin Einblick in Kundenkreis oder Fabrikations-/Geschäftsgeheimnisse hatte, durch deren Verwendung der Arbeitgeberin ein erheblicher Schaden entstehen könnte. Bei rein technischer Entwicklertätigkeit ohne Kundenkontakt dürfte diese Voraussetzung fraglich sein. Zudem muss das Verbot nach Ort, Zeit und Gegenstand angemessen begrenzt sein — die geschilderte Fassung erscheint sehr weitgehend."]),
     ("3. Einschätzung", ["**Das Konkurrenzverbot erscheint in dieser Form angreifbar** — sowohl mangels ausreichenden Einblicks als auch wegen der sehr weiten Fassung nach Ort und Gegenstand."]),
     ("4. Empfehlung", ["Vor dem Stellenantritt schriftlich gegenüber der ehemaligen Arbeitgeberin die Unwirksamkeit des Konkurrenzverbots geltend machen und um schriftliche Bestätigung des Verzichts bitten, um Rechtssicherheit zu schaffen."])])

build_pdf("24-arbeit-krankheit-lohnfortzahlung.pdf", "Lohnfortzahlung bei Krankheit/Unfall einfordern",
    "Anspruch nach Dienstjahren/Skala einfordern — Beispiel", "Standard", 19.90,
    [("Partei", "Hans Furrer, Arbeitnehmer"), ("Kanton", "Graubünden"),
     ("Arbeitgeberin", "Bergbau Furrer & Söhne"),
     ("Sachverhalt", "3 Dienstjahre, seit 5 Wochen krankgeschrieben, Arbeitgeber stellte Lohnzahlung nach 3 Wochen ohne Erklärung ein, keine Krankentaggeldversicherung bekannt")],
    [(None, ["Herr Furrer ist seit 5 Wochen krankgeschrieben. Der Arbeitgeber hat die Lohnzahlung bereits nach drei Wochen eingestellt, ohne dass eine Krankentaggeldversicherung ersichtlich wäre."]),
     ("Rechtliche Einordnung", ["Ohne gleichwertige Krankentaggeldversicherung besteht eine gesetzliche Lohnfortzahlungspflicht für eine beschränkte Dauer nach Dienstjahren, gestaffelt nach kantonaler Skala (im Kanton Graubünden zu verifizieren). Bei 3 Dienstjahren dürfte der Anspruch deutlich über die bereits bezahlten 3 Wochen hinausgehen."]),
     ("Entwurf: Forderungsschreiben", [
        "Bergbau Furrer & Söhne", "",
        "<b>Betreff:</b> Lohnfortzahlung bei Krankheit",
        "", "Sehr geehrte Damen und Herren", "",
        "Seit dem 1. Juni 2026 bin ich krankgeschrieben. Die Lohnzahlung wurde bereits nach drei Wochen eingestellt. Sollte keine gleichwertige Krankentaggeldversicherung bestehen, besteht ein gesetzlicher Anspruch auf Lohnfortzahlung über einen längeren Zeitraum. Ich bitte um umgehende Klärung und Nachzahlung binnen 10 Tagen.",
        "", "Freundliche Grüsse, Hans Furrer"]),
     ("Nächste Schritte", ["• Bestehen einer Krankentaggeldversicherung beim Arbeitgeber erfragen.",
        "• Ärztliche Arbeitsunfähigkeitszeugnisse lückenlos einreichen."])])

# --- KONSUM (restliche 7) ---
build_pdf("25-konsum-maengelruege-kauf.pdf", "Mängelrüge / Garantie geltend machen",
    "Sachmangel bei einem Kauf rügen — Beispiel", "Info", 9.90,
    [("Käufer/in", "Melanie Suter, 4600 Olten"), ("Kanton", "Solothurn"),
     ("Verkäuferin", "Elektro Studer GmbH"),
     ("Sachverhalt", "Neue Waschmaschine (CHF 890.–) zeigt nach 3 Wochen Fehlercode, Wasser läuft aus")],
    [(None, ["Frau Suter kaufte vor drei Wochen eine neue Waschmaschine, die nun einen Fehlercode zeigt und Wasser verliert."]),
     ("Entwurf: Mängelrüge", [
        "Elektro Studer GmbH", "",
        "<b>Betreff:</b> Mängelrüge — Waschmaschine, Rechnung Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Die am 5. Juli 2026 gekaufte Waschmaschine zeigt seit dem 24. Juli 2026 den Fehlercode E12 und verliert Wasser. Ich rüge diesen Mangel hiermit fristgerecht und verlange nach meiner Wahl kostenlose Reparatur oder Ersatzlieferung binnen 14 Tagen.",
        "", "Freundliche Grüsse, Melanie Suter"]),
     ("Praktische Hinweise", ["• Kaufbeleg/Garantiekarte bereithalten.", "• Mangel möglichst sofort nach Entdeckung rügen.",
        "• Fotos/Video des Fehlers sichern."])])

build_pdf("26-konsum-widerruf-haustuergeschaeft.pdf", "Widerruf Haustürgeschäft",
    "Vertrag nach Vertreterbesuch fristgerecht widerrufen — Beispiel", "Info", 9.90,
    [("Kunde/in", "Georges Dubois, 1700 Freiburg"), ("Kanton", "Freiburg"),
     ("Verkäuferin", "Solartech Vertrieb SA"),
     ("Sachverhalt", "Solaranlagen-Vertrag (CHF 18'000.–) an der Haustüre unterschrieben, 3 Tage danach Bedenken")],
    [(None, ["Herr Dubois unterschrieb an der Haustüre einen teuren Solaranlagen-Vertrag und möchte diesen nun widerrufen."]),
     ("Entwurf: Widerruf", [
        "Solartech Vertrieb SA", "",
        "<b>Betreff:</b> Widerruf des Vertrags vom 22. Juli 2026",
        "", "Sehr geehrte Damen und Herren", "",
        "Hiermit widerrufe ich fristgerecht den am 22. Juli 2026 an meiner Haustüre abgeschlossenen Vertrag über eine Solaranlage. Ich bitte um schriftliche Bestätigung der Vertragsauflösung.",
        "", "Freundliche Grüsse, Georges Dubois"]),
     ("Praktische Hinweise", ["• Widerrufsfrist ab Vertragsschluss beachten — sofort handeln.",
        "• Widerruf eingeschrieben versenden.", "• Keine Anzahlung leisten, solange Widerrufsfrist läuft."])])

build_pdf("27-konsum-reklamation-online-kauf.pdf", "Reklamation Online-Kauf / Lieferverzug",
    "Fehlende, verspätete oder falsche Lieferung reklamieren — Beispiel", "Standard", 19.90,
    [("Käufer/in", "Timo Wieser, 8200 Schaffhausen"), ("Kanton", "Schaffhausen"),
     ("Online-Händler", "MöbelDirekt.ch"),
     ("Sachverhalt", "Sofa vor 6 Wochen bestellt und bezahlt (CHF 1'450.–), bis heute nicht geliefert, keine Reaktion auf E-Mails")],
    [(None, ["Herr Wieser wartet seit sechs Wochen auf ein bezahltes Sofa und erhält auf seine E-Mails keine Antwort mehr."]),
     ("Rechtliche Einordnung", ["Bei Lieferverzug kann eine angemessene Nachfrist gesetzt und bei deren fruchtlosem Ablauf vom Vertrag zurückgetreten werden, verbunden mit Rückerstattung der Zahlung."]),
     ("Entwurf: Reklamation mit Nachfrist", [
        "MöbelDirekt.ch, Kundendienst", "",
        "<b>Betreff:</b> Bestellung Nr. [...] — Nachfrist zur Lieferung",
        "", "Sehr geehrte Damen und Herren", "",
        "Die am 15. Juni 2026 bestellte und bezahlte Ware wurde bis heute nicht geliefert. Ich setze Ihnen eine letzte Frist bis zum 10. August 2026. Erfolgt bis dahin keine Lieferung, trete ich vom Vertrag zurück und verlange die vollständige Rückerstattung des bezahlten Betrags.",
        "", "Freundliche Grüsse, Timo Wieser"]),
     ("Praktische Hinweise", ["• Zahlungsbeleg und bisherige Korrespondenz sichern.",
        "• Bei Kreditkartenzahlung: Chargeback-Möglichkeit prüfen."])])

build_pdf("28-konsum-abo-kuendigung.pdf", "Abo/Vertrag kündigen",
    "Fitness, Telecom, Zeitschrift — fristgerecht & nachweisbar — Beispiel", "Info", 9.90,
    [("Kunde/in", "Alexandra Frei, 3600 Thun"), ("Kanton", "Bern"),
     ("Anbieter", "FitFirst Fitnessclub AG"),
     ("Sachverhalt", "12-Monats-Abo endet am 31. August 2026, automatische Verlängerung soll verhindert werden")],
    [(None, ["Frau Frei möchte ihr Fitness-Abo fristgerecht kündigen, bevor es sich automatisch verlängert."]),
     ("Entwurf: Kündigung", [
        "FitFirst Fitnessclub AG", "",
        "<b>Betreff:</b> Kündigung Mitgliedschaft Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Hiermit kündige ich meine Mitgliedschaft fristgerecht per 31. August 2026. Ich bitte um schriftliche Bestätigung des Vertragsendes und darum, keine weiteren Abbuchungen vorzunehmen.",
        "", "Freundliche Grüsse, Alexandra Frei"]),
     ("Praktische Hinweise", ["• Kündigungsfrist im Vertrag genau prüfen (oft 1-3 Monate vor Ablauf).",
        "• Eingeschrieben senden oder Bestätigung verlangen.", "• Kalenderfrist rechtzeitig notieren."])])

build_pdf("29-konsum-reisemangel-reklamation.pdf", "Reklamation bei Reisemängeln",
    "Minderung/Schadenersatz bei mangelhafter Pauschalreise — Beispiel", "Standard", 19.90,
    [("Reisende/r", "Familie Zwicky, 8610 Uster"), ("Kanton", "Zürich"),
     ("Reiseveranstalter", "SonnenReisen AG"),
     ("Sachverhalt", "Gebuchtes Meerblick-Zimmer erhalten: Zimmer mit Blick auf Baustelle, Baulärm ab 7 Uhr während gesamter 2-wöchiger Reise")],
    [(None, ["Familie Zwicky buchte ein Zimmer mit Meerblick und erhielt stattdessen ein Zimmer mit Baustellenblick und täglichem Baulärm."]),
     ("Rechtliche Einordnung", ["Weicht die tatsächliche Leistung erheblich von der gebuchten ab, besteht Anspruch auf Minderung des Reisepreises; bei erheblicher Beeinträchtigung des Urlaubsgenusses zusätzlich auf Schadenersatz."]),
     ("Entwurf: Reklamation", [
        "SonnenReisen AG, Kundendienst", "",
        "<b>Betreff:</b> Reklamation Buchung Nr. [...] — Reise vom 5.-19. Juli 2026",
        "", "Sehr geehrte Damen und Herren", "",
        "Statt des gebuchten Meerblick-Zimmers erhielten wir ein Zimmer mit Blick auf eine Baustelle, verbunden mit täglichem Baulärm ab 7 Uhr während der gesamten Reisedauer (Fotos beigelegt, vor Ort bei der Reiseleitung gemeldet am 6. Juli). Wir verlangen eine Minderung des Reisepreises von 30% sowie Schadenersatz für die erhebliche Beeinträchtigung.",
        "", "Freundliche Grüsse, Familie Zwicky"]),
     ("Praktische Hinweise", ["• Mängel möglichst vor Ort der Reiseleitung melden und protokollieren lassen.",
        "• Fotos/Videos als Beweis sichern.", "• Reklamationsfrist nach Rückkehr beachten."])])

build_pdf("30-konsum-kaufvertrag-ruecktritt.pdf", "Rücktritt vom Kaufvertrag bei Mangel",
    "Wandelung: Vertrag rückabwickeln — Beispiel", "Standard", 19.90,
    [("Käufer/in", "Fabienne Roth, 5000 Aarau"), ("Kanton", "Aargau"),
     ("Verkäufer", "Küchenwelt Mittelland AG"),
     ("Sachverhalt", "Neue Einbauküche: Arbeitsplatte zweimal erfolglos ausgetauscht, Mangel (Risse) besteht weiterhin")],
    [(None, ["Frau Roth liess bereits zweimal die Arbeitsplatte ihrer neuen Küche austauschen, ohne dass der Mangel behoben werden konnte."]),
     ("Entwurf: Rücktrittserklärung", [
        "Küchenwelt Mittelland AG", "",
        "<b>Betreff:</b> Rücktritt vom Kaufvertrag Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Trotz zweimaligem Austausch der Arbeitsplatte besteht der gerügte Mangel (Risse im Material) unverändert fort. Da die Nachbesserung gescheitert ist, erkläre ich hiermit den Rücktritt vom Kaufvertrag und verlange die Rückabwicklung Zug um Zug gegen Rückerstattung des bezahlten Kaufpreises von CHF 12'400.–.",
        "", "Freundliche Grüsse, Fabienne Roth"]),
     ("Praktische Hinweise", ["• Alle bisherigen Nachbesserungsversuche dokumentieren (Daten, Ergebnis).",
        "• Rücktritt ist bei erheblichen, nicht behebbaren Mängeln durchsetzbarer als bei Kleinigkeiten."])])

build_pdf("31-konsum-garantie-reparatur-ablehnung.pdf", "Verweigerte Garantie/Reparatur beanstanden",
    "Wenn der Händler zu Unrecht ablehnt — Beispiel", "Info", 9.90,
    [("Käufer/in", "Marco Bianchi, 6900 Lugano"), ("Kanton", "Tessin"),
     ("Verkäufer", "TechStore Ticino"),
     ("Sachverhalt", "Laptop nach 8 Monaten defekt, Händler verweigert Reparatur mit Verweis auf 'nur 6 Monate Garantie'")],
    [(None, ["Herr Bianchi wurde die kostenlose Reparatur verweigert, weil die Herstellergarantie von 6 Monaten bereits abgelaufen sei — die gesetzliche Gewährleistung läuft jedoch meist länger."]),
     ("Entwurf: Beanstandung", [
        "TechStore Ticino", "",
        "<b>Betreff:</b> Beanstandung Ablehnung Reparatur, Laptop Kaufdatum [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Sie haben eine kostenlose Reparatur mit Verweis auf den Ablauf der 6-monatigen Herstellergarantie abgelehnt. Die gesetzliche Gewährleistung besteht jedoch unabhängig davon und ist bei einem Kauf vor 8 Monaten in der Regel noch nicht abgelaufen. Ich verlange erneut kostenlose Reparatur oder Ersatz binnen 14 Tagen.",
        "", "Freundliche Grüsse, Marco Bianchi"]),
     ("Praktische Hinweise", ["• Unterschied Herstellergarantie (freiwillig, oft kürzer) vs. gesetzliche Gewährleistung klarstellen.",
        "• Kaufbeleg mit Datum beilegen."])])

# --- SCHULDEN (restliche 7) ---
build_pdf("32-schulden-mahnung-fristsetzung.pdf", "Mahnung mit Fristsetzung",
    "Offene Forderung einfordern, bevor die Betreibung folgt — Beispiel", "Info", 9.90,
    [("Gläubiger/in", "Sabrina Kunz, 8500 Frauenfeld"), ("Kanton", "Thurgau"),
     ("Schuldner", "Beat Ammann"),
     ("Sachverhalt", "Privatdarlehen CHF 2'000.– seit 4 Monaten überfällig, keine Reaktion auf mündliche Erinnerungen")],
    [(None, ["Frau Kunz lieh einem Bekannten CHF 2'000.–, die trotz mehrfacher mündlicher Erinnerung nicht zurückbezahlt wurden."]),
     ("Entwurf: Mahnung", [
        "Beat Ammann", "",
        "<b>Betreff:</b> Mahnung — Darlehensrückzahlung",
        "", "Sehr geehrter Herr Ammann", "",
        "Das mir am 1. April 2026 geschuldete Darlehen von CHF 2'000.– ist bis heute nicht zurückbezahlt worden. Ich setze Ihnen eine letzte Frist bis zum 15. August 2026. Andernfalls werde ich ohne weitere Ankündigung die Betreibung einleiten.",
        "", "Freundliche Grüsse, Sabrina Kunz"]),
     ("Praktische Hinweise", ["• Darlehensvereinbarung/Überweisungsbeleg bereithalten.",
        "• Eingeschriebene Zustellung wählen."])])

build_pdf("33-schulden-ratenzahlung.pdf", "Ratenzahlungsvereinbarung entwerfen",
    "Forderung in überschaubaren Raten begleichen — Beispiel", "Standard", 19.90,
    [("Partei", "Oliver Steiner, Schuldner"), ("Kanton", "Wallis"),
     ("Gläubigerin", "Zahnklinik Wallis AG"),
     ("Forderung", "CHF 3'600.– für Zahnbehandlung, Wunsch nach 6 Monatsraten à CHF 600.–")],
    [(None, ["Herr Steiner kann die offene Rechnung nicht auf einmal begleichen und schlägt eine Ratenzahlung vor."]),
     ("Entwurf: Ratenzahlungsvereinbarung", [
        "<b>Zwischen:</b> Zahnklinik Wallis AG (Gläubigerin) und Oliver Steiner (Schuldner)",
        "", "<b>Forderung:</b> CHF 3'600.– gemäss Rechnung Nr. [...]",
        "<b>Ratenplan:</b> 6 Monatsraten à CHF 600.–, fällig jeweils am 1. des Monats, erste Rate am 1. September 2026.",
        "<b>Verfallklausel:</b> Bei Verzug mit einer Rate wird die gesamte Restschuld sofort zur Zahlung fällig.",
        "", "Ort/Datum: __________          Unterschriften: __________ / __________"]),
     ("Praktische Hinweise", ["• Vereinbarung von beiden Seiten unterschreiben lassen.",
        "• Klarstellen, ob eine laufende Betreibung dadurch sistiert wird."])])

build_pdf("34-schulden-verjaehrung-einwenden.pdf", "Verjährungseinrede gegen alte Forderung",
    "Alte, verjährte Forderungen wirksam zurückweisen — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Claudia Meier, 8953 Dietikon"), ("Kanton", "Zürich"),
     ("Gläubiger", "Fitnessstudio PowerGym (durch Inkassobüro vertreten)"),
     ("Sachverhalt", "Angebliche Abo-Restschuld aus dem Jahr 2019, seither keine Zahlung, keine Mahnung, keine Betreibung")],
    [(None, ["Frau Meier erhält plötzlich, sieben Jahre nach angeblicher Fälligkeit, eine Zahlungsaufforderung für ein längst gekündigtes Abo."]),
     ("Rechtliche Einordnung", ["Vertragliche Forderungen unterliegen einer Verjährungsfrist, die ohne unterbrechende Handlung (Mahnung mit Anerkennung, Betreibung) nach einer bestimmten Zeit abläuft (Prüfhinweis, allgemeine Frist im OR verifizieren). Sieben Jahre ohne jegliche dokumentierte Unterbrechung sprechen stark für Verjährung."]),
     ("Entwurf: Verjährungseinrede", [
        "Inkassobüro [...]", "",
        "<b>Betreff:</b> Ihre Forderung vom [Datum] — Einrede der Verjährung",
        "", "Sehr geehrte Damen und Herren", "",
        "Die geltend gemachte Forderung stammt aus dem Jahr 2019. Seither ist mir keine Mahnung oder Betreibung zugestellt worden. Ich erhebe hiermit ausdrücklich die Einrede der Verjährung und werde keine Zahlung leisten.",
        "", "Freundliche Grüsse, Claudia Meier"]),
     ("Praktische Hinweise", ["• Verjährungseinrede muss aktiv erhoben werden — sie tritt nicht automatisch ein.",
        "• Keine Teilzahlung leisten, da dies als Anerkennung gelten und die Verjährung neu starten könnte."])])

build_pdf("35-schulden-verlustschein-pruefen.pdf", "Verlustschein prüfen",
    "Verjährung und Neuerhebung einordnen — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Ismail Yildiz, 4900 Langenthal"), ("Kanton", "Bern"),
     ("Sachverhalt", "Verlustschein über CHF 4'200.– aus dem Jahr 2018 erhalten, jetzt neue Zahlungsaufforderung desselben Gläubigers")],
    [(None, ["Herr Yildiz möchte wissen, was der alte Verlustschein für ihn bedeutet und ob die neue Zahlungsaufforderung berechtigt ist."]),
     ("Einordnung", ["Ein Verlustschein bestätigt, dass eine Forderung zum Zeitpunkt der Pfändung nicht (vollständig) einbringlich war — die Schuld besteht aber grundsätzlich fort. Verlustscheinforderungen verjähren erst nach einer deutlich längeren Frist als gewöhnliche Forderungen (Prüfhinweis, konkrete Dauer verifizieren). Eine erneute Betreibung ('Neuerhebung') ist innerhalb dieser Frist grundsätzlich möglich, sofern der Schuldner zu neuem Vermögen gekommen ist."]),
     ("Empfehlung", ["Prüfen, ob seit Ausstellung des Verlustscheins die relevante Frist bereits abgelaufen ist, und ob die Voraussetzung 'neues Vermögen' für eine Neuerhebung überhaupt erfüllt wäre. Bei Unsicherheit Betreibungsamt oder Schuldenberatung konsultieren."])])

build_pdf("36-schulden-existenzminimum-berechnen.pdf", "Existenzminimum/Pfändungsschutz geltend machen",
    "Damit genug zum Leben bleibt — Beispiel", "Premium", 39.90,
    [("Betroffene Person", "Familie Hodel, 3400 Burgdorf"), ("Kanton", "Bern"),
     ("Sachverhalt", "Lohnpfändung angekündigt, Ehepaar mit 2 Kindern, Nettoeinkommen CHF 5'200.–, Miete CHF 1'900.–")],
    [(None, ["Familie Hodel wurde eine Lohnpfändung angekündigt und befürchtet, dass zu wenig zum Leben übrig bleibt."]),
     ("1. Sachverhalt", ["4-köpfige Familie, Nettoeinkommen CHF 5'200.–/Monat, Mietkosten CHF 1'900.–, Krankenkassenprämien CHF 650.–, keine weiteren aussergewöhnlichen Ausgaben bekannt."]),
     ("2. Prinzip Existenzminimum", ["Das betreibungsrechtliche Existenzminimum besteht aus einem Grundbetrag je nach Haushaltsgrösse plus anerkannten Auslagen (Miete, Krankenkasse, notwendige Fahrkosten). Nur der darüber hinausgehende Betrag darf gepfändet werden. Die Berechnung erfolgt individuell durch das Betreibungsamt nach kantonalen Richtlinien (im Kanton Bern zu verifizieren)."]),
     ("3. Zu prüfende Punkte", ["• Ist der Grundbetrag für 4 Personen korrekt berücksichtigt?", "• Sind Miete und Krankenkasse vollständig als Auslage anerkannt?",
        "• Wurden Fahrkosten zur Arbeit berücksichtigt?"]),
     ("4. Empfehlung", ["**Empfehlung: Schriftliches Gesuch an das Betreibungsamt zur korrekten Existenzminimum-Berechnung stellen, mit allen Belegen zu Einkommen und Auslagen.**"])])

build_pdf("37-schulden-privatkonkurs-einschaetzung.pdf", "Privatkonkurs/Schuldenregulierung einschätzen",
    "Erste Orientierung bei aussichtsloser Schuldenlast — Beispiel", "Premium", 39.90,
    [("Betroffene Person", "Markus Iten, 6210 Sursee"), ("Kanton", "Luzern"),
     ("Sachverhalt", "5 laufende Betreibungen, Gesamtschulden ca. CHF 45'000.–, mehrere Verlustscheine, Einkommen deckt nur Existenzminimum")],
    [(None, ["Herr Iten sieht sich mit mehreren Betreibungen und einer Gesamtschuld von rund CHF 45'000.– konfrontiert, ohne realistische Aussicht auf Rückzahlung."]),
     ("1. Ausgangslage", ["5 laufende Betreibungsverfahren verschiedener Gläubiger, mehrere bestehende Verlustscheine, monatliches Einkommen deckt nur knapp das Existenzminimum."]),
     ("2. Optionen im Überblick", [
        "• <b>Aussergerichtliche Regulierung:</b> Direkte Verhandlung mit Gläubigern über Ratenzahlung oder Teilverzicht — erfordert Kooperationsbereitschaft aller Gläubiger.",
        "• <b>Nachlassverfahren:</b> Gerichtlich moderierte Schuldenregulierung mit Zustimmung eines Grossteils der Gläubiger.",
        "• <b>Konkurs auf eigenes Begehren ('Privatkonkurs'):</b> Führt zur Verwertung des pfändbaren Vermögens; bestehende Schulden werden nicht automatisch erlassen, sondern es entstehen ggf. neue Verlustscheine."]),
     ("3. Konsequenzen", ["Ein Konkurs wird im Betreibungsregisterauszug vermerkt und kann die Kreditwürdigkeit sowie z. B. die Wohnungssuche für längere Zeit erschweren."]),
     ("4. Empfehlung", ["**Empfehlung: Vor jedem Schritt eine kostenlose Beratung bei einer anerkannten Schuldenberatungsstelle in Anspruch nehmen** — diese kann die individuell sinnvollste Option (Regulierung vs. Konkurs) fundiert einschätzen."])])

build_pdf("38-schulden-fortsetzungsbegehren-einschaetzung.pdf", "Einschätzung bei Fortsetzungsbegehren/Pfändung",
    "Was passiert nach dem Rechtsvorschlag? — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Sarah Kolb, 4410 Liestal"), ("Kanton", "Basel-Landschaft"),
     ("Sachverhalt", "Rechtsvorschlag erhoben, Gläubiger hat nun Rechtsöffnung beim Gericht beantragt")],
    [(None, ["Frau Kolb hat gegen eine Betreibung Rechtsvorschlag erhoben. Nun hat der Gläubiger ein Rechtsöffnungsgesuch beim zuständigen Gericht eingereicht."]),
     ("Ablauf-Einordnung", ["Nach erhobenem Rechtsvorschlag muss der Gläubiger die Rechtsöffnung (Beseitigung des Rechtsvorschlags) beim Gericht erwirken, bevor die Betreibung fortgesetzt werden kann. Bei Erfolg des Gläubigers kann dieser anschliessend das Fortsetzungsbegehren stellen, worauf die Pfändung folgt."]),
     ("Empfehlung", ["Zur Gerichtsvorladung im Rechtsöffnungsverfahren unbedingt erscheinen bzw. schriftlich Stellung nehmen und alle Einwände (z. B. Forderung nicht fällig, bereits bezahlt, ungültiger Titel) frühzeitig vorbringen — nach rechtskräftiger Rechtsöffnung sind die Verteidigungsmöglichkeiten stark eingeschränkt."])])

# --- NACHBARSCHAFT (restliche 7) ---
build_pdf("39-nachbarschaft-grenzabstand-pflanzen.pdf", "Grenzabstand von Pflanzen/Bäumen beanstanden",
    "Rückschnitt oder Entfernung verlangen — Beispiel", "Info", 9.90,
    [("Betroffene Partei", "Urs Zimmermann, 8636 Wald"), ("Kanton", "Zürich"),
     ("Nachbar", "Familie Keller"),
     ("Sachverhalt", "3 Thujen ca. 40cm von der Grenze gepflanzt, mittlerweile 4m hoch, werfen Schatten auf Gemüsebeet")],
    [(None, ["Herr Zimmermann möchte die zu nah an der Grenze stehenden, mittlerweile hohen Thujen des Nachbarn beanstanden."]),
     ("Entwurf: Beanstandung", [
        "Familie Keller", "",
        "<b>Betreff:</b> Grenzabstand Ihrer Thujen-Hecke",
        "", "Liebe Familie Keller", "",
        "Die entlang unserer gemeinsamen Grenze gepflanzten Thujen stehen nach meiner Einschätzung mit rund 40 cm deutlich näher an der Grenze, als es die kantonalen Vorschriften erlauben, und haben mittlerweile eine Höhe von ca. 4 Metern erreicht. Ich bitte Sie um einen Rückschnitt auf das zulässige Mass bzw. die zulässige Distanz binnen 30 Tagen.",
        "", "Freundliche Grüsse, Urs Zimmermann"]),
     ("Praktische Hinweise", ["• Grenzabstandsvorschriften sind im Kanton Zürich (kantonales Einführungsgesetz zum ZGB) zu verifizieren.",
        "• Für die Geltendmachung können Verwirkungsfristen gelten — nicht zu lange zuwarten.",
        "• Bei Uneinigkeit: Gemeinde oder Vermittlungsstelle einschalten."])])

build_pdf("40-nachbarschaft-baubewilligung-einsprache.pdf", "Einsprache gegen Baugesuch des Nachbarn",
    "Fristgerecht Einsprache erheben — Beispiel", "Standard", 19.90,
    [("Betroffene Partei", "Monika Egger, 3800 Interlaken"), ("Kanton", "Bern"),
     ("Bauherrschaft", "Nachbargrundstück, geplanter Anbau"),
     ("Sachverhalt", "Geplanter zweigeschossiger Anbau 1.5m von der Grenze, Publikation vor 18 Tagen im Amtsblatt")],
    [(None, ["Frau Egger sieht durch den geplanten Anbau ihre Aussicht und Besonnung erheblich beeinträchtigt und möchte fristgerecht Einsprache erheben."]),
     ("Wichtiger Hinweis", ["Die Einsprachefrist läuft ab Publikation im Amtsblatt (im Kanton Bern zu verifizieren) und ist zwingend einzuhalten — bei nur noch wenigen Tagen Restfrist sollte die Einsprache umgehend eingereicht werden."]),
     ("Entwurf: Einsprache", [
        "An die Bauverwaltung der Gemeinde Interlaken", "",
        "<b>Betreff:</b> Einsprache gegen Baugesuch Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Als direkt angrenzende Nachbarin erhebe ich Einsprache gegen das publizierte Baugesuch für einen zweigeschossigen Anbau. Der geplante Grenzabstand von 1.5 m erscheint mir zu gering und die Baute wird meine Wohnräume erheblich verschatten. Ich beantrage die Nichtbewilligung, eventualiter die Anordnung eines grösseren Grenzabstands.",
        "", "Freundliche Grüsse, Monika Egger"]),
     ("Nächste Schritte", ["• Baupläne bei der Gemeinde einsehen, bevor die Einsprache detailliert begründet wird.",
        "• Grenzabstands- und Höhenvorschriften der Gemeinde/des Kantons prüfen."])],
    warn="Kurze Einsprachefrist — bei nur wenigen Tagen Restfrist sofort handeln, Begründung kann nachgereicht werden.")

build_pdf("41-nachbarschaft-wegrecht.pdf", "Wegrecht/Durchgangsrecht geltend machen",
    "Durchsetzen oder unberechtigte Behinderung beanstanden — Beispiel", "Standard", 19.90,
    [("Betroffene Partei", "Res Baumann, 8500 Frauenfeld"), ("Kanton", "Thurgau"),
     ("Nachbar", "Eigentümer des vorderen Grundstücks"),
     ("Sachverhalt", "Im Grundbuch eingetragenes Fusswegrecht über Nachbargrundstück, seit 2 Monaten mit Gartenmöbeln blockiert")],
    [(None, ["Herr Baumann verfügt über ein im Grundbuch eingetragenes Wegrecht, das der Nachbar seit einiger Zeit mit Gartenmöbeln blockiert."]),
     ("Rechtliche Einordnung", ["Ein im Grundbuch eingetragenes Wegrecht (Dienstbarkeit) ist klar durchsetzbar — der Belastete darf die Ausübung nicht eigenmächtig behindern."]),
     ("Entwurf: Aufforderung", [
        "An den Grundeigentümer", "",
        "<b>Betreff:</b> Behinderung des im Grundbuch eingetragenen Wegrechts",
        "", "Sehr geehrter Herr [...]", "",
        "Das zu meinen Gunsten im Grundbuch eingetragene Fusswegrecht über Ihre Parzelle wird seit rund zwei Monaten durch abgestellte Gartenmöbel blockiert. Ich fordere Sie auf, den Weg binnen 10 Tagen wieder ungehindert freizugeben.",
        "", "Freundliche Grüsse, Res Baumann"]),
     ("Praktische Hinweise", ["• Grundbuchauszug mit der Dienstbarkeit als Beleg bereithalten.",
        "• Bei Nichtbeachtung: Zivilklage auf Beseitigung der Störung möglich."])])

build_pdf("42-nachbarschaft-stockwerkeigentum-beschluss-anfechten.pdf", "Beschluss der Stockwerkeigentümerversammlung anfechten",
    "Fehlerhafte Beschlüsse fristgerecht anfechten — Beispiel", "Premium", 39.90,
    [("Stockwerkeigentümer/in", "Priska Lang, 8008 Zürich"), ("Kanton", "Zürich"),
     ("Sachverhalt", "Beschluss über Sonderumlage CHF 15'000.– an Versammlung gefällt, zu der Frau Lang nachweislich nicht eingeladen wurde")],
    [(None, ["Frau Lang erfuhr erst nachträglich von einer Versammlung, an der eine hohe Sonderumlage beschlossen wurde, obwohl sie nachweislich keine Einladung erhalten hatte."]),
     ("1. Sachverhalt", ["Versammlung vom 3. Juli 2026, Beschluss einer Sonderumlage von CHF 15'000.– pro Einheit. Frau Lang erhielt keine Einladung (kein Nachweis der Verwaltung vorhanden), erfuhr erst 3 Wochen später vom Beschluss."]),
     ("2. Anfechtungsgründe", ["Ein Einberufungsmangel (fehlende Einladung eines Miteigentümers) stellt einen klassischen formellen Anfechtungsgrund dar, der die Gültigkeit des gesamten Beschlusses in Frage stellen kann."]),
     ("3. Fristenhinweis", ["Die Anfechtungsklage ist innert einer kurzen Frist ab Kenntnisnahme des Beschlusses beim Gericht am Ort der gelegenen Sache einzureichen (Prüfhinweis, exakte Frist verifizieren) — angesichts der bereits verstrichenen 3 Wochen ist rasches Handeln geboten."]),
     ("4. Empfehlung", ["**Empfehlung: Anfechtungsklage umgehend vorbereiten und einreichen**, gestützt auf den Einberufungsmangel; parallel schriftlich gegenüber der Verwaltung den Mangel rügen."])])

build_pdf("43-nachbarschaft-grenzstreitigkeit.pdf", "Grenzstreitigkeit / Grenzüberbau",
    "Wenn ein Bau die Grenze verletzt oder sie strittig ist — Beispiel", "Standard", 19.90,
    [("Betroffene Partei", "Familie Rüegg, 9245 Oberbüren"), ("Kanton", "St. Gallen"),
     ("Nachbar", "Neubau-Bauherrschaft nebenan"),
     ("Sachverhalt", "Neu erstellte Garage scheint gemäss eigener Messung ca. 25cm auf das Grundstück Rüegg hinüberzuragen")],
    [(None, ["Familie Rüegg vermutet, dass die neu erbaute Garage des Nachbarn teilweise auf ihr Grundstück hinüberragt."]),
     ("Rechtliche Einordnung", ["Bei einem Überbau ist zwischen gutgläubigem und bösgläubigem Verhalten der Bauherrschaft zu unterscheiden: Bei Gutgläubigkeit kann unter Umständen keine Beseitigung, aber eine Entschädigung verlangt werden; bei Bösgläubigkeit (Kenntnis der Grenzüberschreitung) ist eher eine Beseitigung durchsetzbar."]),
     ("Entwurf: Aufforderung zur Klärung", [
        "An die Bauherrschaft", "",
        "<b>Betreff:</b> Vermuteter Grenzüberbau — Garage",
        "", "Sehr geehrte Damen und Herren", "",
        "Gemäss eigener Vermessung überragt Ihre neu erstellte Garage die gemeinsame Grundstücksgrenze um ca. 25 cm. Ich bitte um eine amtliche Vermessung zur Klärung des genauen Grenzverlaufs sowie um Mitteilung, wie Sie mit dem Ergebnis umzugehen gedenken.",
        "", "Freundliche Grüsse, Familie Rüegg"]),
     ("Praktische Hinweise", ["• Amtliche Vermessung/Grenzbereinigung durch Geometer empfehlenswert.",
        "• Frühzeitiges Handeln wichtig, da bei langem Zuwarten Duldungspflichten entstehen können."])])

build_pdf("44-nachbarschaft-schadenersatz-ueberbau.pdf", "Schadenersatz bei Grenzüberbau/-schaden",
    "Konkreten Schaden durch Nachbararbeiten geltend machen — Beispiel", "Standard", 19.90,
    [("Geschädigte Partei", "Werner Huber, 6210 Sursee"), ("Kanton", "Luzern"),
     ("Verursacher", "Bauunternehmen des Nachbarn"),
     ("Sachverhalt", "Aushubarbeiten beim Nachbarn beschädigten die eigene Gartenmauer, Kostenvoranschlag CHF 4'200.– für Reparatur")],
    [(None, ["Bei Aushubarbeiten auf dem Nachbargrundstück wurde die Gartenmauer von Herrn Huber beschädigt."]),
     ("Entwurf: Schadenersatzforderung", [
        "An den Nachbarn / dessen Bauunternehmen", "",
        "<b>Betreff:</b> Schadenersatzforderung — beschädigte Gartenmauer",
        "", "Sehr geehrte Damen und Herren", "",
        "Bei den am 10. Juli 2026 durchgeführten Aushubarbeiten wurde meine Gartenmauer entlang der gemeinsamen Grenze beschädigt (Fotos beigelegt). Gemäss beiliegendem Kostenvoranschlag beläuft sich der Schaden auf CHF 4'200.–. Ich fordere Sie auf, diesen Betrag binnen 20 Tagen zu begleichen.",
        "", "Freundliche Grüsse, Werner Huber"]),
     ("Praktische Hinweise", ["• Schaden vor Reparatur fotografisch dokumentieren.",
        "• Kostenvoranschlag einer Fachfirma einholen.", "• Haftpflichtversicherung des Verursachers kann meist direkt kontaktiert werden."])])

build_pdf("45-nachbarschaft-tierhaltung-beschwerde.pdf", "Beschwerde wegen Tierhaltung",
    "Z. B. dauerhaftes Hundegebell beanstanden — Beispiel", "Info", 9.90,
    [("Betroffene Partei", "Familie Steiner, 5400 Baden"), ("Kanton", "Aargau"),
     ("Nachbar", "Hundehalterin nebenan"),
     ("Sachverhalt", "Hund bellt regelmässig 06:00-07:00 und während der Mittagszeit, seit 6 Wochen, bereits einmal mündlich angesprochen")],
    [(None, ["Familie Steiner wird durch regelmässiges, lang anhaltendes Hundegebell aus der Nachbarschaft gestört."]),
     ("Entwurf: Beschwerdeschreiben", [
        "An die Nachbarschaft", "",
        "<b>Betreff:</b> Anhaltendes Hundegebell",
        "", "Liebe Nachbarn", "",
        "Seit einigen Wochen bellt Ihr Hund regelmässig frühmorgens und über die Mittagszeit teils über 20 Minuten am Stück. Wie bereits mündlich erwähnt, ist dies für uns eine erhebliche Belastung. Wir bitten Sie höflich um geeignete Massnahmen. Sollte sich die Situation nicht bessern, sehen wir uns gezwungen, die Gemeinde einzuschalten.",
        "", "Freundliche Grüsse, Familie Steiner"]),
     ("Praktische Hinweise", ["• Lärmprotokoll mit Datum/Uhrzeit/Dauer führen.",
        "• Gespräch zunächst sachlich und nachbarschaftlich halten."])])

# --- VERKEHR (restliche 7) ---
build_pdf("46-verkehr-fuehrerausweis-entzug.pdf", "Führerausweisentzug einschätzen",
    "Warn-/Sicherungsentzug einschätzen, Rekurs vorbereiten — Beispiel", "Premium", 39.90,
    [("Betroffene Partei", "Michael Ott, 8952 Schlieren"), ("Kanton", "Zürich"),
     ("Sachverhalt", "Erste Geschwindigkeitsübertretung (innerorts 28 km/h zu schnell), Verfügung über 1-monatigen Entzug erhalten")],
    [(None, ["Herr Ott erhielt nach seiner ersten Geschwindigkeitsübertretung eine Verfügung über einen einmonatigen Führerausweisentzug."]),
     ("1. Einordnung", ["Es handelt sich um einen Warnungsentzug wegen einer verkehrsregelwidrigen Handlung, gestaffelt nach Schwere der Überschreitung und Vorgeschichte. Bei einer ersten Widerhandlung ohne Vorbelastung wird üblicherweise die Mindestentzugsdauer angewendet (Prüfhinweis, Praxis kann kantonal leicht variieren)."]),
     ("2. Prüfpunkte", ["• Wurde die Geschwindigkeitsmessung korrekt durchgeführt (Toleranzabzug berücksichtigt)?", "• Liegt tatsächlich keine Vorbelastung vor?",
        "• Ist die verfügte Dauer die gesetzliche Mindestdauer oder darüber?"]),
     ("3. Rekursmöglichkeit", ["Gegen die Verfügung kann innert der angegebenen Frist beim zuständigen kantonalen Strassenverkehrsamt bzw. der Rekursinstanz Beschwerde erhoben werden, insbesondere bei Zweifeln an der Messung oder der Dauer."]),
     ("4. Empfehlung", ["Bei einer ersten, unbestrittenen Übertretung mit korrekter Messung ist ein Rekurs meist wenig aussichtsreich; bei Zweifeln an Messung oder Berechnung lohnt sich eine Prüfung der Akten vor Fristablauf."])])

build_pdf("47-verkehr-strafbefehl-einsprache.pdf", "Einsprache gegen Strafbefehl (SVG-Delikt)",
    "Verkehrsdelikt-Strafbefehl fristgerecht anfechten — Beispiel", "Premium", 39.90,
    [("Betroffene Partei", "Sandro Bianchi, 6600 Locarno"), ("Kanton", "Tessin"),
     ("Sachverhalt", "Strafbefehl wegen Nichtbeachten eines Rotlichts, Betroffener bestreitet den Vorwurf, war zum fraglichen Zeitpunkt an anderem Ort")],
    [(None, ["Herr Bianchi erhielt einen Strafbefehl wegen angeblichen Rotlichtverstosses, obwohl er zum fraglichen Zeitpunkt nachweislich an einem anderen Ort war."]),
     ("Wichtiger Hinweis", ["Die Einsprachefrist beträgt üblicherweise 10 Tage ab Zustellung des Strafbefehls (Prüfhinweis) und ist schriftlich bei der ausstellenden Behörde einzureichen."]),
     ("Entwurf: Einsprache", [
        "An die Staatsanwaltschaft / ausstellende Behörde", "",
        "<b>Betreff:</b> Einsprache gegen Strafbefehl Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich erhebe fristgerecht Einsprache gegen den mir zugestellten Strafbefehl. Zum fraglichen Zeitpunkt befand ich mich nachweislich an einem anderen Ort (Beleg: [Zeugenaussage/Quittung] beigelegt). Ich beantrage die Einstellung des Verfahrens, eventualiter die Durchführung einer Hauptverhandlung.",
        "", "Freundliche Grüsse, Sandro Bianchi"]),
     ("Nächste Schritte", ["• Alibi-Beweise (Zeugen, Quittungen, Standortdaten) so früh wie möglich sichern.",
        "• Bei drohend schweren Folgen (Fahrverbot, Vorstrafe): frühzeitig fachliche Verteidigung beiziehen."])])

build_pdf("48-verkehr-verkehrsunfall-schadenmeldung.pdf", "Verkehrsunfall: Schadenmeldung & Haftung",
    "Unfallhergang dokumentieren, Schaden melden — Beispiel", "Standard", 19.90,
    [("Beteiligte Partei", "Larissa Good, 3011 Bern"), ("Kanton", "Bern"),
     ("Sachverhalt", "Auffahrunfall an Kreuzung, Gegenpartei bremste laut eigener Aussage 'grundlos' abrupt, kein Polizeirapport erstellt")],
    [(None, ["Frau Good war an einem Auffahrunfall beteiligt und möchte den Vorfall korrekt bei der Versicherung melden."]),
     ("Unfalldarstellung (Entwurf)", [
        "<b>Datum/Zeit:</b> 20. Juli 2026, ca. 17:30 Uhr", "<b>Ort:</b> Kreuzung Effingerstrasse/Laupenstrasse, Bern",
        "<b>Hergang:</b> Das vorausfahrende Fahrzeug bremste unvermittelt ohne erkennbaren Grund ab, ein Auffahren konnte trotz Bremsung nicht vollständig vermieden werden. Kein Rapport durch die Polizei erstellt (kein Personenschaden).",
        "<b>Schaden:</b> Blechschaden vorne rechts, Kostenvoranschlag folgt."]),
     ("Haftungseinordnung", ["Bei Auffahrunfällen wird häufig zunächst von einer (Mit-)Verantwortung des Auffahrenden ausgegangen (ungenügender Abstand); ein grundloses, abruptes Bremsen der Gegenpartei kann diese Vermutung jedoch relativieren — die endgültige Haftungsquote wird durch die Versicherungen bzw. im Streitfall gerichtlich geklärt."]),
     ("Nächste Schritte", ["• Europäisches Unfallprotokoll (falls ausgefüllt) beilegen.",
        "• Zeugen, falls vorhanden, kontaktieren und Aussage sichern.", "• Schadenmeldung zeitnah bei der eigenen Versicherung einreichen."])])

build_pdf("49-verkehr-halterhaftung-bestreiten.pdf", "Halterhaftung bestreiten",
    "Wenn du nicht selbst gefahren bist — Beispiel", "Standard", 19.90,
    [("Fahrzeughalter/in", "Familie Wenger, 3550 Langnau"), ("Kanton", "Bern"),
     ("Sachverhalt", "Radarfoto zeigt Geschwindigkeitsübertretung mit dem Familienfahrzeug, das mehrere Personen nutzen — Halter war zum Vorfallszeitpunkt nachweislich im Ausland")],
    [(None, ["Familie Wenger erhielt einen Brief mit der Aufforderung, die fahrende Person zu benennen, da der eingetragene Halter zum fraglichen Zeitpunkt nachweislich nicht im Land war."]),
     ("Rechtliche Einordnung", ["In der Schweiz haftet strafrechtlich grundsätzlich die tatsächlich fahrende Person, nicht automatisch die Halterin oder der Halter. Die Behörde muss die verantwortliche Person ermitteln; der Halter ist zur wahrheitsgemässen Mitwirkung verpflichtet, aber nicht zur Selbstbezichtigung."]),
     ("Entwurf: Stellungnahme", [
        "An die Bussenstelle", "",
        "<b>Betreff:</b> Fahrerermittlung zu Vorfall vom [Datum]",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich war zum fraglichen Zeitpunkt nachweislich im Ausland (Beleg beigelegt) und daher nicht Lenker des Fahrzeugs. Das Fahrzeug wird von mehreren Familienmitgliedern genutzt; nach Rücksprache kann ich Ihnen mitteilen, dass zu diesem Zeitpunkt [Name] das Fahrzeug lenkte.",
        "", "Freundliche Grüsse, Familie Wenger"]),
     ("Praktische Hinweise", ["• Kurze Antwortfrist der Behörde beachten.",
        "• Keine falschen Angaben machen — dies kann selbst strafbar sein."])])

build_pdf("50-verkehr-parkbusse-privat-bestreiten.pdf", "Private Parkbusse bestreiten",
    "Vertragsstrafe ist nicht dasselbe wie eine amtliche Busse — Beispiel", "Info", 9.90,
    [("Betroffene Partei", "Nadine Frei, 8620 Wetzikon"), ("Kanton", "Zürich"),
     ("Parkplatzbetreiberin", "ParkControl Schweiz AG"),
     ("Sachverhalt", "CHF 90.– 'Kontrollgebühr' für angeblich fehlendes Parkticket auf privatem Einkaufszentrums-Parkplatz, Beschilderung nach eigener Erinnerung schlecht sichtbar")],
    [(None, ["Frau Frei erhielt eine private Kontrollgebühr, bezweifelt aber, dass die Parkbedingungen ausreichend sichtbar ausgeschildert waren."]),
     ("Rechtliche Einordnung", ["Eine private 'Parkbusse' ist rechtlich eine Konventionalstrafe aus einem stillschweigenden Vertrag, der eine gültige, klar sichtbare Beschilderung mit den Bedingungen voraussetzt. Fehlt eine solche, ist die Forderung angreifbar."]),
     ("Entwurf: Bestreitung", [
        "ParkControl Schweiz AG", "",
        "<b>Betreff:</b> Bestreitung Kontrollgebühr, Beleg-Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich bestreite die geltend gemachte Kontrollgebühr. Die Beschilderung mit den Parkbedingungen war am fraglichen Standort nach meiner Wahrnehmung nicht ausreichend sichtbar angebracht. Ich bitte um Nachweis der gültigen Beschilderung sowie um Rücknahme der Forderung.",
        "", "Freundliche Grüsse, Nadine Frei"]),
     ("Praktische Hinweise", ["• Fotos der (fehlenden/schlecht sichtbaren) Beschilderung sichern.",
        "• Nicht vorschnell zahlen — Nachweis der Vertragsgrundlage verlangen."])])

build_pdf("51-verkehr-auslandsbusse-bestreiten.pdf", "Ausländische Verkehrsbusse bestreiten",
    "Umgang mit Bussenschreiben aus dem Ausland — Beispiel", "Standard", 19.90,
    [("Betroffene Partei", "Fabian Christen, 4102 Binningen"), ("Kanton", "Basel-Landschaft"),
     ("Absender", "Inkassobüro im Auftrag einer italienischen Kommune"),
     ("Sachverhalt", "Geschwindigkeitsbusse aus Italien, 14 Monate nach dem Vorfall, mit CHF 180.– 'Bearbeitungsgebühren' zusätzlich zur ursprünglichen Busse")],
    [(None, ["Herr Christen erhielt mit erheblicher Verzögerung ein Bussenschreiben aus Italien, versehen mit hohen Zusatzgebühren eines Inkassobüros."]),
     ("Rechtliche Einordnung", ["Die Durchsetzbarkeit und Verjährung ausländischer Verkehrsbussen hängt vom jeweiligen Land und bestehenden Vollstreckungsabkommen ab (Prüfhinweis, länderspezifisch zu verifizieren). Zusätzliche, nicht amtlich verfügte Inkassogebühren sind oft eigenständig bestreitbar."]),
     ("Entwurf: Stellungnahme", [
        "An das Inkassobüro", "",
        "<b>Betreff:</b> Ihre Forderung vom [Datum]",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich bestreite die geltend gemachten Zusatzgebühren von CHF 180.– mangels Rechtsgrundlage. Bezüglich der ursprünglichen Busse bitte ich um Zustellung der amtlichen Originalverfügung sowie eines Nachweises der fristgerechten Zustellung, da seit dem Vorfall bereits 14 Monate vergangen sind.",
        "", "Freundliche Grüsse, Fabian Christen"]),
     ("Praktische Hinweise", ["• Nicht vorschnell die vollen, oft überhöhten Inkassogebühren zahlen.",
        "• Bei Unsicherheit über die Rechtslage im jeweiligen Land: gezielt nachfragen."])])

build_pdf("52-verkehr-versicherung-regress-bestreiten.pdf", "Regress der Motorfahrzeugversicherung bestreiten",
    "Wenn deine Versicherung Geld zurückfordert — Beispiel", "Standard", 19.90,
    [("Versicherte Person", "Katja Meili, 9300 Wittenbach"), ("Kanton", "St. Gallen"),
     ("Versicherung", "AutoSicher Versicherung AG"),
     ("Sachverhalt", "Nach Unfall zahlte Versicherung Schaden an Dritte aus, fordert nun CHF 2'500.– Regress mit Verweis auf 'grobe Fahrlässigkeit' wegen Handynutzung")],
    [(None, ["Frau Meili wird von ihrer eigenen Versicherung mit einem Regress konfrontiert, der auf eine behauptete, aber nicht bewiesene Handynutzung während der Fahrt gestützt wird."]),
     ("Rechtliche Einordnung", ["Ein Regress der Versicherung gegen die versicherte Person ist nur bei grobfahrlässigem oder vorsätzlichem Verhalten zulässig; die Beweislast dafür liegt bei der Versicherung. Eine blosse Vermutung ohne konkreten Nachweis (z. B. Handyauszug, Zeugenaussage) genügt regelmässig nicht."]),
     ("Entwurf: Bestreitung", [
        "AutoSicher Versicherung AG", "",
        "<b>Betreff:</b> Regressforderung Schadenfall Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich bestreite die Regressforderung von CHF 2'500.–. Die behauptete Handynutzung während der Fahrt trifft nicht zu und wurde von Ihnen bislang nicht belegt. Ich bitte um Vorlage der Beweismittel, auf die Sie sich stützen, sowie um Überprüfung der Regressforderung.",
        "", "Freundliche Grüsse, Katja Meili"]),
     ("Praktische Hinweise", ["• Handyauszug des Providers als Gegenbeweis anfordern/vorlegen, falls Nutzung wirklich nicht stattfand.",
        "• Regressforderungen genau auf die Beweislage prüfen, bevor bezahlt wird."])])

# --- DATENSCHUTZ (restliche 7) ---
build_pdf("53-datenschutz-loeschungsbegehren.pdf", "Löschungsbegehren",
    "\"Recht auf Vergessenwerden\" geltend machen — Beispiel", "Info", 9.90,
    [("Anfragende Person", "Benjamin Krebs, 8400 Winterthur"), ("Kanton", "Zürich"),
     ("Verantwortliche Stelle", "Partnervermittlung Herzklang GmbH"),
     ("Sachverhalt", "Konto vor 2 Jahren gelöscht geglaubt, erhält weiterhin Newsletter, Daten offenbar nicht gelöscht")],
    [(None, ["Herr Krebs dachte, sein Konto sei gelöscht, erhält aber weiterhin Werbe-E-Mails der Plattform."]),
     ("Entwurf: Löschungsbegehren", [
        "Partnervermittlung Herzklang GmbH", "",
        "<b>Betreff:</b> Löschungsbegehren nach revDSG",
        "", "Sehr geehrte Damen und Herren", "",
        "Ich habe mein Konto bereits vor rund zwei Jahren gekündigt, erhalte jedoch weiterhin Newsletter von Ihnen. Ich verlange die vollständige und nachweisbare Löschung sämtlicher meiner Personendaten binnen 30 Tagen, soweit keine gesetzliche Aufbewahrungspflicht entgegensteht, sowie eine schriftliche Bestätigung der Löschung.",
        "", "Freundliche Grüsse, Benjamin Krebs"]),
     ("Praktische Hinweise", ["• Bestätigung der Löschung schriftlich verlangen.",
        "• Bei Nichtreaktion: Beschwerde beim EDÖB möglich."])])

build_pdf("54-datenschutz-persoenlichkeitsverletzung-internet.pdf", "Persönlichkeitsverletzung im Internet",
    "Fotos/Rufschädigung: Löschung & Unterlassung verlangen — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Vanessa Krähenbühl, 3400 Burgdorf"), ("Kanton", "Bern"),
     ("Plattform/Urheber", "Instagram-Konto einer Bekannten"),
     ("Sachverhalt", "Private Fotos ohne Einwilligung mit abwertenden Kommentaren veröffentlicht")],
    [(None, ["Frau Krähenbühl entdeckte private Fotos von sich, die ohne ihre Einwilligung mit abwertenden Kommentaren veröffentlicht wurden."]),
     ("Entwurf: Schreiben", [
        "An die veröffentlichende Person", "",
        "<b>Betreff:</b> Löschung und Unterlassung — veröffentlichte Fotos",
        "", "Sehr geehrte/r [...]", "",
        "Sie haben ohne meine Einwilligung private Fotos von mir veröffentlicht und mit abwertenden Kommentaren versehen. Ich fordere Sie auf, den Beitrag binnen 48 Stunden vollständig zu löschen und sich schriftlich zu verpflichten, künftig keine weiteren Inhalte über mich ohne meine Zustimmung zu veröffentlichen. Andernfalls behalte ich mir straf- und zivilrechtliche Schritte vor.",
        "", "Freundliche Grüsse, Vanessa Krähenbühl"]),
     ("Praktische Hinweise", ["• Screenshots mit Datum/URL vor der Kontaktaufnahme sichern.",
        "• Meldung an die Plattform parallel zum direkten Kontakt einreichen.",
        "• Bei Rufschädigung: Strafanzeige wegen Ehrverletzung als paralleler Weg prüfen."])])

build_pdf("55-datenschutz-cybermobbing-schreiben.pdf", "Schreiben bei Cybermobbing",
    "Systematische Belästigung/üble Nachrede adressieren — Beispiel", "Standard", 19.90,
    [("Betroffene Person (Eltern)", "Familie Aeschbacher für Tochter Lena, 15 Jahre"), ("Kanton", "Solothurn"),
     ("Beteiligte", "Mitschülerinnen in einer Klassen-Chatgruppe"),
     ("Sachverhalt", "Seit 3 Wochen wiederholte beleidigende Nachrichten und verfälschte Bilder über Lena in einer WhatsApp-Gruppe")],
    [(None, ["Die Tochter der Familie Aeschbacher wird seit drei Wochen in einer Schul-Chatgruppe systematisch beleidigt und mit manipulierten Bildern blossgestellt."]),
     ("Vorgehen", ["Vor jeder Kontaktaufnahme sollten sämtliche Nachrichten und Bilder mit Datum/Uhrzeit als Screenshot gesichert werden."]),
     ("Entwurf: Schreiben an die Schule", [
        "An die Schulleitung", "",
        "<b>Betreff:</b> Cybermobbing gegenüber unserer Tochter Lena Aeschbacher",
        "", "Sehr geehrte Schulleitung", "",
        "Unsere Tochter Lena wird seit rund drei Wochen in einer Klassen-Chatgruppe wiederholt beleidigt und mit manipulierten Bildern blossgestellt (Belege beigelegt). Wir bitten Sie um zeitnahes Eingreifen im Rahmen der schulischen Möglichkeiten und um ein Gespräch mit den beteiligten Familien.",
        "", "Freundliche Grüsse, Familie Aeschbacher"]),
     ("Weitere Schritte", ["• Bei Ehrverletzungen (üble Nachrede, Beschimpfung) ist eine Strafanzeige möglich — hierfür gilt regelmässig eine kurze Antragsfrist ab Kenntnis von Tat und Täter/in.",
        "• Bei Minderjährigen sind zusätzlich die Erziehungsberechtigten der beteiligten Kinder einzubeziehen."])])

build_pdf("56-datenschutz-identitaetsdiebstahl-massnahmen.pdf", "Massnahmen bei Identitätsdiebstahl",
    "Sofortmassnahmen nach gehacktem Konto — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Christoph Bär, 8953 Dietikon"), ("Kanton", "Zürich"),
     ("Sachverhalt", "E-Mail-Konto gehackt, unbekannte Person hat in seinem Namen Waren im Wert von CHF 1'200.– bestellt")],
    [(None, ["Herr Bär entdeckte, dass sein E-Mail-Konto gehackt und in seinem Namen Bestellungen getätigt wurden."]),
     ("Sofortmassnahmen-Checkliste", ["1. Passwörter aller betroffenen und verknüpften Konten sofort ändern.",
        "2. Zwei-Faktor-Authentifizierung aktivieren, wo möglich.", "3. Betroffene Anbieter/Shops umgehend informieren.",
        "4. Strafanzeige bei der Kantonspolizei erwägen.", "5. Kontakte/Bekannte warnen, falls in ihrem Namen Nachrichten versendet wurden."]),
     ("Entwurf: Schreiben an den Online-Shop", [
        "An den betroffenen Online-Shop", "",
        "<b>Betreff:</b> Missbräuchliche Bestellung unter meinem Namen — Bestellung Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Mein E-Mail-Konto wurde kürzlich gehackt. Die Bestellung Nr. [...] wurde nicht von mir getätigt, sondern durch unbefugten Zugriff Dritter. Ich bitte um sofortige Stornierung der Bestellung und Sperrung meines Kontos bis zur Klärung.",
        "", "Freundliche Grüsse, Christoph Bär"])])

build_pdf("57-datenschutz-arbeitgeber-ueberwachung-beschwerde.pdf", "Beschwerde gegen Überwachung durch Arbeitgeber",
    "Unzulässige Video-/E-Mail-/GPS-Kontrolle beanstanden — Beispiel", "Premium", 39.90,
    [("Arbeitnehmer/in", "Patricia Roos, 8630 Rüti"), ("Kanton", "Zürich"),
     ("Arbeitgeberin", "Transport Roos & Partner AG"),
     ("Sachverhalt", "Firmenfahrzeug seit 2 Monaten mit GPS-Tracker ausgestattet, keine vorherige Information oder Einwilligung, auch Privatfahrten werden erfasst")],
    [(None, ["Frau Roos stellte fest, dass ihr Firmenfahrzeug ohne vorherige Information mit einem GPS-Tracker ausgestattet wurde, der auch Privatfahrten erfasst."]),
     ("1. Sachverhalt", ["GPS-Ortung seit rund zwei Monaten aktiv, keine schriftliche Information oder Einwilligung, Aufzeichnung erfolgt durchgehend inkl. arbeitsfreier Zeit."]),
     ("2. Rechtliche Einordnung", ["Eine Überwachung von Arbeitnehmenden muss verhältnismässig und transparent erfolgen; eine permanente, undifferenzierte Verhaltensüberwachung — insbesondere ohne vorherige Information und unter Einschluss privater Fahrten — ist regelmässig unzulässig (Prüfhinweis: Persönlichkeitsschutz im Arbeitsgesetz und Datenschutzgesetz)."]),
     ("3. Empfehlung", ["**Empfehlung: Schriftliche Auskunft über Zweck und Umfang der Überwachung verlangen und die Einschränkung auf ein verhältnismässiges Mass (z. B. nur Diensteinsätze) fordern.**"]),
     ("Entwurf: Beschwerdeschreiben", [
        "Transport Roos & Partner AG, Geschäftsleitung", "",
        "Ich fordere Auskunft über Zweck, Umfang und Speicherdauer der GPS-Aufzeichnung meines Firmenfahrzeugs sowie die Einstellung der Erfassung während privater Nutzung. Eine durchgehende, nicht vorher kommunizierte Überwachung halte ich für unverhältnismässig.",
        "", "Freundliche Grüsse, Patricia Roos"])])

build_pdf("58-datenschutz-werbe-widerspruch.pdf", "Widerspruch gegen Direktwerbung",
    "Werbeeinwilligung widerrufen — Beispiel", "Info", 9.90,
    [("Betroffene Person", "Elisabeth Graf, 3600 Thun"), ("Kanton", "Bern"),
     ("Absender", "Versandhaus Schweiz AG"),
     ("Sachverhalt", "Täglich Werbe-E-Mails trotz mehrfachem Klick auf 'Abmelden'-Link ohne Wirkung")],
    [(None, ["Frau Graf erhält trotz mehrfacher Nutzung des Abmelde-Links weiterhin tägliche Werbe-E-Mails."]),
     ("Entwurf: Widerspruch", [
        "Versandhaus Schweiz AG", "",
        "<b>Betreff:</b> Widerspruch gegen weitere Werbezusendungen",
        "", "Sehr geehrte Damen und Herren", "",
        "Trotz mehrfacher Nutzung des Abmelde-Links in Ihren E-Mails erhalte ich weiterhin täglich Werbung von Ihnen. Ich widerspreche hiermit ausdrücklich jeder weiteren werblichen Kontaktaufnahme per E-Mail, Post und Telefon und verlange die vollständige Streichung aus allen Werbe-/Adresslisten binnen 10 Tagen.",
        "", "Freundliche Grüsse, Elisabeth Graf"]),
     ("Praktische Hinweise", ["• Bei Telefonwerbung zusätzlich Stern-Eintrag im Telefonbuch prüfen.",
        "• Bei fortgesetzter Missachtung: Beschwerde beim EDÖB bzw. SECO (UWG) möglich."])])

build_pdf("59-datenschutz-datenweitergabe-widerspruch.pdf", "Widerspruch gegen Datenweitergabe",
    "Weitergabe an Dritte stoppen, Rechenschaft verlangen — Beispiel", "Standard", 19.90,
    [("Betroffene Person", "Jonas Meili, 8570 Weinfelden"), ("Kanton", "Thurgau"),
     ("Verantwortliche Stelle", "Vergleichsportal VersicherungsCheck.ch"),
     ("Sachverhalt", "Nach Nutzung eines Online-Vergleichsrechners erhält er plötzlich Anrufe mehrerer, nie kontaktierter Versicherungsvermittler")],
    [(None, ["Herr Meili vermutet, dass seine Daten vom genutzten Vergleichsportal ohne klare Einwilligung an mehrere Versicherungsvermittler weitergegeben wurden."]),
     ("Entwurf: Widerspruch", [
        "VersicherungsCheck.ch", "",
        "<b>Betreff:</b> Widerspruch gegen Datenweitergabe an Dritte",
        "", "Sehr geehrte Damen und Herren", "",
        "Seit der Nutzung Ihres Vergleichsrechners werde ich von mehreren mir bislang unbekannten Versicherungsvermittlern kontaktiert. Ich bitte um Auskunft, an welche Dritten meine Daten weitergegeben wurden und gestützt auf welche Rechtsgrundlage. Ich widerspreche hiermit jeder weiteren Weitergabe meiner Daten an Dritte.",
        "", "Freundliche Grüsse, Jonas Meili"]),
     ("Praktische Hinweise", ["• AGB/Datenschutzerklärung des Portals zum Zeitpunkt der Nutzung sichern (z. B. als Archivseite).",
        "• Bei unbefriedigender Antwort: Beschwerde beim EDÖB."])])

# --- VERSICHERUNG (restliche 7) ---
build_pdf("60-versicherung-iv-anmeldung-begruendung.pdf", "IV-Anmeldung begründen/unterstützen",
    "Gut dokumentiert bei der IV anmelden — Beispiel", "Premium", 39.90,
    [("Anmeldende Person", "Beatrice Furrer, 4900 Langenthal"), ("Kanton", "Bern"),
     ("Sachverhalt", "Chronische Rückenbeschwerden nach Bandscheibenvorfall, seit 8 Monaten krankgeschrieben, Rückkehr an bisherigen Arbeitsplatz fraglich")],
    [(None, ["Frau Furrer möchte sich nach einem Bandscheibenvorfall und langer Arbeitsunfähigkeit bei der IV anmelden und eine überzeugende Begründung einreichen."]),
     ("1. Gesundheitliche Situation", ["Bandscheibenvorfall mit anhaltenden Rückenbeschwerden, Arbeitsunfähigkeit seit 8 Monaten, körperlich fordernde bisherige Tätigkeit als Pflegehilfe erscheint nicht mehr zumutbar."]),
     ("2. Auswirkung auf die Arbeitsfähigkeit", ["Die bisherige Tätigkeit erfordert regelmässiges Heben und Bücken, was gemäss ärztlicher Einschätzung dauerhaft nicht mehr möglich ist. Eine leidensangepasste, sitzende oder wechselbelastende Tätigkeit könnte hingegen in Frage kommen."]),
     ("3. Eingliederungsmassnahmen", ["Die IV prüft vorrangig Eingliederungsmassnahmen (z. B. Umschulung, Arbeitsplatzanpassung) vor einer Rentenprüfung. Dies sollte in der Anmeldung aktiv angesprochen werden."]),
     ("4. Empfehlung", ["**Empfehlung: Anmeldung mit vollständigen ärztlichen Berichten einreichen und explizit Interesse an beruflichen Eingliederungsmassnahmen bekunden**, um den Prozess zu beschleunigen."])])

build_pdf("61-versicherung-krankentaggeld-streit.pdf", "Streit mit Krankentaggeldversicherer",
    "Gekürzte/eingestellte Taggeldzahlungen anfechten — Beispiel", "Premium", 39.90,
    [("Versicherte Person", "Adrian Fankhauser, 3510 Konolfingen"), ("Kanton", "Bern"),
     ("Versicherer", "MediTag Versicherung AG"),
     ("Sachverhalt", "Taggeld nach 6 Wochen eingestellt mit Verweis auf 'Zweifel an fortbestehender Arbeitsunfähigkeit', behandelnder Arzt bestätigt weiterhin volle Arbeitsunfähigkeit")],
    [(None, ["Herr Fankhauser erhielt trotz fortbestehender ärztlich attestierter Arbeitsunfähigkeit keine Taggeldzahlungen mehr."]),
     ("Rechtliche Einordnung", ["Eine Krankentaggeldversicherung ist meist privatrechtlich nach dem VVG organisiert (nicht wie IV/UVG sozialversicherungsrechtlich), massgebend sind Police und Allgemeine Versicherungsbedingungen. Eine Leistungseinstellung entgegen einem eindeutigen ärztlichen Attest ist grundsätzlich zu bestreiten."]),
     ("Entwurf: Bestreitung", [
        "MediTag Versicherung AG", "",
        "<b>Betreff:</b> Bestreitung Einstellung Taggeldzahlungen, Police Nr. [...]",
        "", "Sehr geehrte Damen und Herren", "",
        "Sie haben die Taggeldzahlungen eingestellt, obwohl mein behandelnder Arzt eine fortbestehende volle Arbeitsunfähigkeit attestiert (Bericht beigelegt). Ich bestreite die Einstellung und fordere die Nachzahlung der ausstehenden Taggelder binnen 20 Tagen.",
        "", "Freundliche Grüsse, Adrian Fankhauser"]),
     ("Nächste Schritte", ["• Bei Uneinigkeit: vertrauensärztliche Untersuchung durch die Versicherung abwarten/verlangen.",
        "• Alle ärztlichen Berichte lückenlos einreichen."])])

build_pdf("62-versicherung-haftpflicht-schadenmeldung.pdf", "Schadenmeldung an Haftpflichtversicherung",
    "Schaden korrekt melden — Beispiel", "Standard", 19.90,
    [("Meldende Person", "Tobias Wüthrich, 3800 Interlaken"), ("Kanton", "Bern"),
     ("Sachverhalt", "Beim Umzug versehentlich Möbelstück eines Freundes im Wert von CHF 900.– beschädigt")],
    [(None, ["Herr Wüthrich hat beim Helfen bei einem Umzug versehentlich ein wertvolles Möbelstück beschädigt und möchte den Schaden korrekt bei seiner Privathaftpflicht melden."]),
     ("Entwurf: Schadenmeldung", [
        "An die eigene Privathaftpflichtversicherung", "",
        "<b>Betreff:</b> Schadenmeldung — Sachschaden vom [Datum]",
        "", "Sehr geehrte Damen und Herren", "",
        "Am 12. Juli 2026 habe ich beim Helfen bei einem Umzug versehentlich einen Schrank eines Freundes beschädigt (Wert gemäss Kostenvoranschlag CHF 900.–, Foto beigelegt). Ich melde den Schaden hiermit zur Prüfung der Deckung und bitte um weiteres Vorgehen.",
        "", "Freundliche Grüsse, Tobias Wüthrich"]),
     ("Praktische Hinweise", ["• Schaden möglichst rasch nach Kenntnisnahme melden — Meldefristen in der Police beachten.",
        "• Fotos und Kostenvoranschlag beilegen."])])

build_pdf("63-versicherung-kuendigung-versicherungsvertrag.pdf", "Kündigung eines Versicherungsvertrags",
    "Fristgerecht kündigen, z. B. nach Prämienerhöhung — Beispiel", "Info", 9.90,
    [("Versicherungsnehmer/in", "Claudia Iten, 6300 Zug"), ("Kanton", "Zug"),
     ("Versicherer", "SicherLeben Versicherung AG"),
     ("Sachverhalt", "Hausratversicherung, Prämie um 18% erhöht ohne Leistungsänderung, möchte ausserordentlich kündigen")],
    [(None, ["Frau Iten möchte ihre Hausratversicherung wegen einer deutlichen Prämienerhöhung ausserordentlich kündigen."]),
     ("Entwurf: Kündigung", [
        "SicherLeben Versicherung AG", "",
        "<b>Betreff:</b> Kündigung Police Nr. [...] wegen Prämienerhöhung",
        "", "Sehr geehrte Damen und Herren", "",
        "Sie haben meine Prämie um 18% erhöht, ohne dass sich der Versicherungsumfang geändert hätte. Gestützt auf mein ausserordentliches Kündigungsrecht bei Prämienerhöhung kündige ich den Vertrag hiermit fristgerecht per Wirksamkeitsdatum der Erhöhung. Ich bitte um schriftliche Bestätigung.",
        "", "Freundliche Grüsse, Claudia Iten"]),
     ("Praktische Hinweise", ["• Kündigungsfrist bei Prämienerhöhung ist meist kürzer als die ordentliche — im Erhöhungsschreiben nachschauen.",
        "• Anschlussversicherung vor Kündigung sicherstellen."])])

build_pdf("64-versicherung-praemienverbilligung-gesuch.pdf", "Gesuch um Prämienverbilligung",
    "Oder Streit um Krankenkassenwechsel klären — Beispiel", "Info", 9.90,
    [("Antragstellende Person", "Familie Cavegn, 7000 Chur"), ("Kanton", "Graubünden"),
     ("Sachverhalt", "Einkommenseinbusse durch Reduktion des Arbeitspensums, bisher keine Prämienverbilligung bezogen")],
    [(None, ["Familie Cavegn hat aufgrund eines reduzierten Arbeitspensums weniger Einkommen und möchte erstmals ein Gesuch um Prämienverbilligung stellen."]),
     ("Einordnung", ["Die Prämienverbilligung wird kantonal verwaltet und richtet sich nach Einkommen und Vermögen (im Kanton Graubünden zu verifizieren). Ein Gesuch kann in der Regel jederzeit eingereicht werden, wobei sich Änderungen meist erst ab dem nächsten möglichen Zeitpunkt auswirken."]),
     ("Entwurf: Gesuch", [
        "An die zuständige kantonale Stelle für Prämienverbilligung", "",
        "<b>Betreff:</b> Gesuch um Prämienverbilligung",
        "", "Sehr geehrte Damen und Herren", "",
        "Aufgrund einer Reduktion meines Arbeitspensums hat sich unser Familieneinkommen deutlich verringert. Ich ersuche um Prüfung eines Anspruchs auf Prämienverbilligung für unsere Familie (Unterlagen zu Einkommen und Familiensituation beigelegt).",
        "", "Freundliche Grüsse, Familie Cavegn"])])

build_pdf("65-versicherung-unfallrente-geltendmachen.pdf", "Unfallrente (UVG) geltend machen",
    "Rentenanspruch nach einem Unfall einfordern — Beispiel", "Premium", 39.90,
    [("Versicherte Person", "Roland Suter, 8570 Weinfelden"), ("Kanton", "Thurgau"),
     ("Unfallversicherung", "SUVA-ähnlicher Versicherer (Beispiel)"),
     ("Sachverhalt", "Arbeitsunfall mit dauerhafter Bewegungseinschränkung der Schulter, Abschlussuntersuchung ergab 20% Integritätseinbusse gemäss Gutachten")],
    [(None, ["Herr Suter erlitt einen Arbeitsunfall mit bleibenden gesundheitlichen Folgen und möchte Rente sowie Integritätsentschädigung geltend machen."]),
     ("1. Sachverhalt", ["Arbeitsunfall vom 4. Februar 2025, dauerhafte Bewegungseinschränkung der rechten Schulter, Abschlussgutachten bestätigt eine Integritätseinbusse von 20% sowie eine reduzierte Erwerbsfähigkeit in der bisherigen Tätigkeit."]),
     ("2. Grundvoraussetzungen", ["Für die Integritätsentschädigung ist eine dauernde erhebliche Schädigung der körperlichen Integrität massgebend (hier durch Gutachten belegt); für die Invalidenrente eine bleibende Erwerbseinbusse infolge des Unfalls."]),
     ("3. Würdigung", ["Das vorliegende Gutachten mit 20% Integritätseinbusse stützt einen Anspruch auf Integritätsentschädigung in entsprechender Höhe. Für die Rentenfrage ist zusätzlich zu klären, in welchem Umfang die Erwerbsfähigkeit in einer angepassten Tätigkeit noch besteht."]),
     ("4. Empfehlung", ["**Empfehlung: Eingabe mit Verweis auf das Gutachten einreichen und ausdrücklich sowohl Integritätsentschädigung als auch Prüfung eines Rentenanspruchs verlangen.**"])])

build_pdf("66-versicherung-ergaenzungsleistungen-gesuch.pdf", "Gesuch/Einsprache Ergänzungsleistungen",
    "EL zu AHV/IV beantragen oder Ablehnung anfechten — Beispiel", "Standard", 19.90,
    [("Antragstellende Person", "Rosmarie Baumgartner, 3550 Langnau"), ("Kanton", "Bern"),
     ("Sachverhalt", "AHV-Rentnerin, Ausgaben (Miete, Krankenkasse) übersteigen die Rente deutlich, EL-Gesuch abgelehnt mit pauschaler Begründung")],
    [(None, ["Frau Baumgartner lebt von einer AHV-Rente, die ihre notwendigen Ausgaben nicht deckt. Ihr EL-Gesuch wurde ohne detaillierte Begründung abgelehnt."]),
     ("Einordnung", ["Ergänzungsleistungen decken die Differenz zwischen anerkannten Ausgaben (u. a. Miete bis zu einem Höchstbetrag, Krankenkassenprämien) und anrechenbarem Einkommen/Vermögen. Die Berechnung erfolgt kantonal (im Kanton Bern zu verifizieren)."]),
     ("Entwurf: Einsprache", [
        "An die zuständige EL-Durchführungsstelle", "",
        "<b>Betreff:</b> Einsprache gegen die Ablehnung meines EL-Gesuchs",
        "", "Sehr geehrte Damen und Herren", "",
        "Gegen die Ablehnung meines Gesuchs um Ergänzungsleistungen erhebe ich Einsprache. Die Begründung Ihrer Verfügung ist für mich nicht nachvollziehbar. Ich bitte um eine detaillierte Aufstellung der Berechnung sowie um erneute Prüfung meiner Ausgaben (Mietvertrag und Krankenkassenprämien-Bestätigung beigelegt).",
        "", "Freundliche Grüsse, Rosmarie Baumgartner"])])

# --- KMU (restliche 7) ---
build_pdf("67-kmu-freelance-werkvertrag.pdf", "Freelance-/Werkvertrag für eigene Dienstleistung",
    "Sauberer Auftragsvertrag für deine Dienstleistung — Beispiel", "Standard", 19.90,
    [("Auftragnehmerin", "Sabine Wenger, Texterin, 8400 Winterthur"), ("Kanton", "Zürich"),
     ("Auftraggeber", "Marketing Agentur Pulse GmbH"),
     ("Leistung", "Erstellung von Website-Texten, Pauschale CHF 3'200.–, Lieferung in 3 Etappen")],
    [(None, ["Frau Wenger benötigt einen sauberen Auftragsvertrag für ein grösseres Texterstellungs-Mandat."]),
     ("Entwurf: Auftragsvertrag", [
        "<b>§1 Leistung</b> — Erstellung von Website-Texten gemäss Briefing vom [Datum], Lieferung in 3 Etappen (Entwurf, Überarbeitung, Finalversion).",
        "<b>§2 Vergütung</b> — Pauschal CHF 3'200.–, zahlbar je 1/3 pro Etappe, Rechnungsstellung nach Abnahme.",
        "<b>§3 Abnahme/Mängelrechte</b> — Auftraggeber prüft binnen 5 Arbeitstagen, danach gilt die Etappe als abgenommen; zwei Korrekturrunden pro Etappe inklusive.",
        "<b>§4 Nutzungsrechte</b> — Übertragung der Nutzungsrechte an den finalen Texten erst nach vollständiger Bezahlung.",
        "<b>§5 Kündigung</b> — Kündigung aus wichtigem Grund jederzeit möglich, bereits erbrachte Leistungen sind zu vergüten.",
        "<b>§6 Anwendbares Recht/Gerichtsstand</b> — Schweizer Recht, Gerichtsstand Winterthur."]),
     ("Praktische Hinweise", ["• Briefing/Leistungsbeschrieb möglichst konkret im Vertrag oder als Beilage festhalten.",
        "• Zahlungsraten an Meilensteine koppeln, nicht nur an Zeit."])])

build_pdf("68-kmu-agb-erstellen.pdf", "AGB für das eigene Geschäft erstellen",
    "Geschäftsbedingungen, die zu deinem Angebot passen — Beispiel", "Standard", 19.90,
    [("Geschäft", "GreenLeaf Gartenbau GmbH, 3013 Bern"), ("Kanton", "Bern"),
     ("Angebot", "Gartenpflege- und Landschaftsbau-Dienstleistungen für Privatkunden (B2C)")],
    [(None, ["GreenLeaf Gartenbau benötigt AGB, die für Dienstleistungen an Privatkunden geeignet sind."]),
     ("Entwurf: AGB (Auszug)", [
        "<b>1. Geltungsbereich</b> — Diese AGB gelten für alle Aufträge zwischen GreenLeaf Gartenbau GmbH und ihren Kundinnen und Kunden.",
        "<b>2. Vertragsschluss</b> — Der Vertrag kommt mit schriftlicher oder mündlicher Auftragsbestätigung zustande.",
        "<b>3. Preise/Zahlung</b> — Preise gemäss Offerte, Zahlung innert 30 Tagen nach Rechnungsstellung.",
        "<b>4. Ausführung</b> — Termine werden nach bestem Wissen eingehalten; witterungsbedingte Verschiebungen vorbehalten.",
        "<b>5. Gewährleistung</b> — Mängel sind innert 10 Tagen nach Ausführung zu rügen.",
        "<b>6. Haftung</b> — Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit gesetzlich zulässig; Haftung für grobe Fahrlässigkeit/Vorsatz bleibt vorbehalten.",
        "<b>7. Datenschutz</b> — Verweis auf separate Datenschutzerklärung.",
        "<b>8. Schlussbestimmungen</b> — Schweizer Recht, Gerichtsstand Bern."]),
     ("Hinweis", ["Bei Konsumentengeschäften dürfen Haftungsbeschränkungen nicht überraschend oder missbräuchlich formuliert sein — im Zweifel fachlich prüfen lassen."])])

build_pdf("69-kmu-impressum-erstellen.pdf", "Impressum/Anbieterkennzeichnung erstellen",
    "Pflichtangaben für deine Website korrekt und vollständig — Beispiel", "Info", 9.90,
    [("Geschäft", "Atelier Licht & Form, Einzelfirma Nora Schenk, 4058 Basel"), ("Kanton", "Basel-Stadt"),
     ("Tätigkeit", "Fotografie-Dienstleistungen, eigene Website mit Kontaktformular")],
    [(None, ["Nora Schenk benötigt ein korrektes Impressum für ihre neue Fotografie-Website."]),
     ("Entwurf: Impressum", [
        "<b>Verantwortlich für diese Website:</b>", "Atelier Licht & Form — Nora Schenk (Einzelfirma)",
        "Musterstrasse 12, 4058 Basel", "E-Mail: kontakt@atelier-lichtform.ch",
        "UID: CHE-[...] (falls im Handelsregister eingetragen)",
        "", "<b>Haftungsausschluss:</b> Für die Inhalte externer Links wird keine Haftung übernommen.",
        "<b>Urheberrecht:</b> Sämtliche Bilder und Texte sind urheberrechtlich geschützt."]),
     ("Praktische Hinweise", ["• Bei MWST-Pflicht zusätzlich die MWST-Nummer angeben.",
        "• Impressum von jeder Seite leicht auffindbar verlinken."])])

build_pdf("70-kmu-datenschutzerklaerung-website.pdf", "Datenschutzerklärung für die eigene Website",
    "revDSG-konforme Grundlage für deinen Webauftritt — Beispiel", "Standard", 19.90,
    [("Geschäft", "FitCoach Bern GmbH, 3007 Bern"), ("Kanton", "Bern"),
     ("Eingesetzte Tools", "Kontaktformular, Newsletter-Tool (US-Anbieter), Google Analytics")],
    [(None, ["FitCoach Bern benötigt eine Datenschutzerklärung, die auch den Newsletter-Dienst und Analytics-Tool korrekt abbildet."]),
     ("Entwurf: Datenschutzerklärung (Auszug)", [
        "<b>1. Verantwortliche Stelle:</b> FitCoach Bern GmbH, Bern.",
        "<b>2. Bearbeitete Daten:</b> Kontaktformular-Angaben (Name, E-Mail, Nachricht); bei Newsletter-Anmeldung E-Mail-Adresse; Nutzungsdaten via Analytics-Tool.",
        "<b>3. Zwecke:</b> Beantwortung von Anfragen, Newsletter-Versand, Analyse der Websitenutzung.",
        "<b>4. Bekanntgabe an Dritte / Ausland:</b> Der Newsletter-Anbieter verarbeitet Daten in den USA — Details und Garantien sind noch zu ergänzen. Google Analytics als Auftragsbearbeiter.",
        "<b>5. Aufbewahrung:</b> Kontaktanfragen werden nach Erledigung gelöscht, spätestens nach 12 Monaten.",
        "<b>6. Rechte:</b> Auskunft, Berichtigung, Löschung, Widerspruch — Kontakt: [E-Mail]."]),
     ("Hinweis", ["Die genauen Angaben zum US-Anbieter (Name, Garantien nach Art. 16 f. revDSG) sind vor Publikation zu ergänzen."])])

build_pdf("71-kmu-vertragspruefung-partner.pdf", "Liefer-/Kooperationsvertrag prüfen",
    "Vertrag eines Geschäftspartners vor Unterschrift prüfen — Beispiel", "Premium", 39.90,
    [("Prüfende Partei", "Kleinbrauerei Bergquell AG, 7000 Chur"), ("Kanton", "Graubünden"),
     ("Vertragspartner", "Getränkevertrieb Alpina AG (Exklusivvertrieb)"),
     ("Sachverhalt", "5-jähriger Exklusivvertriebsvertrag, feste Abnahmemenge, hohe Konventionalstrafe bei Nichterreichen")],
    [(None, ["Die Kleinbrauerei Bergquell möchte den ihr vorgelegten Exklusivvertriebsvertrag vor der Unterschrift kritisch prüfen lassen."]),
     ("Risiko-Übersicht", [
        "| Klausel | Risiko für Bergquell AG | Verhandlungsvorschlag |",
        "| 5 Jahre Exklusivität | Sehr lange Bindung ohne Ausstiegsmöglichkeit | Kürzere Laufzeit oder Kündigungsrecht nach 2 Jahren verhandeln |",
        "| Feste Abnahmemenge | Risiko bei Nachfrageschwankungen | Mengenkorridor statt fixer Menge |",
        "| Hohe Konventionalstrafe | Unverhältnismässig bei geringer Abweichung | Staffelung nach Grad der Abweichung |",
        "| Kein Kündigungsrecht bei Vertragsverletzung des Partners | Einseitig | Beidseitiges ausserordentliches Kündigungsrecht ergänzen |"]),
     ("Fehlende übliche Klauseln", ["• Regelung zum geistigen Eigentum an Markenmaterial.", "• Vertraulichkeitsklausel.", "• Gerichtsstand/anwendbares Recht fehlt im Entwurf."]),
     ("Fazit", ["**Der Vertrag ist in der vorliegenden Form deutlich einseitig zugunsten des Vertriebspartners und sollte vor Unterschrift in den genannten Punkten nachverhandelt werden.**"])])

build_pdf("72-kmu-rechtsform-gruendung-check.pdf", "Rechtsform-/Gründungs-Check",
    "Einzelfirma vs. GmbH: Orientierungshilfe für den Start — Beispiel", "Standard", 19.90,
    [("Gründungsvorhaben", "Alessandro Conti, geplantes IT-Beratungsgeschäft"), ("Kanton", "Tessin"),
     ("Eckdaten", "Erwarteter Jahresumsatz CHF 80'000.–, alleine tätig, moderates Haftungsrisiko")],
    [(None, ["Herr Conti möchte sich als IT-Berater selbständig machen und ist unsicher, ob eine Einzelfirma oder eine GmbH die passende Rechtsform ist."]),
     ("Vergleichstabelle", [
        "| Kriterium | Einzelfirma | GmbH |",
        "| Gründungsaufwand | Gering, formlos möglich | Höher, Stammkapital CHF 20'000.–, notarielle Gründung |",
        "| Haftung | Unbeschränkt mit Privatvermögen | Grundsätzlich beschränkt auf Gesellschaftsvermögen |",
        "| Handelsregister | Erst ab CHF 100'000.– Umsatz Pflicht | Immer Pflicht |",
        "| Sozialversicherung | Als Selbständiger (AHV direkt) | Als angestellter Geschäftsführer (BVG-Pflicht ab bestimmtem Lohn) |",
        "| Aussenwirkung | Einfacher, persönlicher | Oft als seriöser/etablierter wahrgenommen |"]),
     ("Tendenz-Einschätzung", ["Bei einem Umsatz von CHF 80'000.– und überschaubarem Haftungsrisiko dürfte eine Einzelfirma zunächst der pragmatischere Einstieg sein; bei wachsendem Haftungsrisiko oder Umsatz ist ein späterer Wechsel zur GmbH jederzeit möglich. Dies ist eine grobe Tendenz, keine abschliessende Empfehlung."])])

build_pdf("73-kmu-inkasso-eskalation.pdf", "Inkasso-Eskalation vor Betreibung",
    "Letzte Stufe gegenüber säumigen Geschäftskunden — Beispiel", "Info", 9.90,
    [("Geschäft", "Schreinerei Holzform GmbH, 5734 Reinach"), ("Kanton", "Aargau"),
     ("Kunde", "Bauunternehmen Trigon AG"),
     ("Sachverhalt", "Offene Rechnung CHF 8'500.– seit 75 Tagen, bereits 2 Mahnstufen erfolglos durchlaufen")],
    [(None, ["Schreinerei Holzform hat bereits zwei Mahnstufen ohne Erfolg durchlaufen und möchte nun die letzte Eskalationsstufe vor der Betreibung einleiten."]),
     ("Entwurf: Letzte Mahnung", [
        "Bauunternehmen Trigon AG", "",
        "<b>Betreff:</b> Letzte Mahnung — Rechnung Nr. [...] über CHF 8'500.–",
        "", "Sehr geehrte Damen und Herren", "",
        "Trotz zweier Mahnungen ist der offene Betrag von CHF 8'500.– aus unserer Rechnung vom [Datum] weiterhin nicht beglichen. Wir setzen Ihnen eine letzte, nicht erstreckbare Frist bis zum 10. August 2026. Nach unbenutztem Ablauf werden wir ohne weitere Ankündigung die Betreibung einleiten und machen zusätzlich Verzugszins geltend.",
        "", "Freundliche Grüsse, Schreinerei Holzform GmbH"]),
     ("Praktische Hinweise", ["• Alle bisherigen Mahnstufen und Zustellnachweise griffbereit halten.",
        "• Verzugszins gemäss OR bereits jetzt in Rechnung stellen."])])

# --- WERKZEUGE (restliche 7) ---
build_pdf("74-vertrag-entwerfen.pdf", "Vertrag frei entwerfen",
    "Individueller Vertragsentwurf nach Schweizer OR — Beispiel", "Premium", 39.90,
    [("Partei A", "Manuela Fischer, Grafikdesignerin"), ("Kanton", "Zürich"),
     ("Partei B", "Café Kornhaus GmbH"),
     ("Zweck", "Gestaltung von Speisekarten und Werbematerial, einmaliges Projekt CHF 2'400.–")],
    [(None, ["Frau Fischer möchte für ein einmaliges Design-Projekt einen individuellen Vertrag statt einer Standardvorlage."]),
     ("Vertragsentwurf (Auszug)", [
        "<b>§1 Vertragsgegenstand</b> — Gestaltung von Speisekarten und Werbematerial gemäss Briefing.",
        "<b>§2 Leistung & Vergütung</b> — Pauschal CHF 2'400.–, zahlbar 50% bei Auftragserteilung, 50% bei Abnahme.",
        "<b>§3 Dauer & Kündigung</b> — Projektdauer 4 Wochen; Kündigung aus wichtigem Grund jederzeit möglich.",
        "<b>§4 Haftung / Gewährleistung</b> — Zwei Korrekturrunden inklusive; weitere Änderungen nach Aufwand.",
        "<b>§5 Schlussbestimmungen</b> — Schweizer Recht, Gerichtsstand Zürich."]),
     ("Checkliste vor Unterschrift", ["• Nutzungsrechte am fertigen Material klar geregelt?", "• Zahlungsplan an Meilensteine gekoppelt?"])])

build_pdf("75-vertrag-pruefen.pdf", "Vertrag frei prüfen (Redlining)",
    "Risiko-Übersicht, kritische Klauseln, Verbesserungen — Beispiel", "Premium", 39.90,
    [("Prüfende Partei", "Jonas Egli, Mieter eines Gewerberaums"), ("Kanton", "Bern"),
     ("Vertragsentwurf", "Gewerbemietvertrag, 10 Jahre Mindestdauer, Umsatzmiete-Klausel, Konkurrenzverbot im Quartier")],
    [(None, ["Herr Egli möchte den ihm vorgelegten Gewerbemietvertrag vor der Unterschrift auf Risiken prüfen lassen."]),
     ("Risiko-Übersicht", [
        "| # | Klausel | Risiko | Empfehlung | Priorität |",
        "| 1 | 10 Jahre Mindestdauer | Sehr lange Bindung ohne Ausstieg | Kündigungsrecht nach 5 Jahren verhandeln | hoch |",
        "| 2 | Umsatzmiete-Klausel | Unklare Berechnungsgrundlage | Klare Definition des Umsatzbegriffs verlangen | hoch |",
        "| 3 | Konkurrenzverbot im Quartier | Sehr weit gefasst, unbefristet | Zeitliche/räumliche Begrenzung fordern | mittel |"]),
     ("Fehlende übliche Klauseln", ["• Regelung zu Untervermietung.", "• Instandhaltungspflichten klar zwischen Mieter/Vermieter abgrenzen."]),
     ("Fazit", ["Vor Unterschrift insbesondere die Mindestdauer und die Umsatzmiete-Definition nachverhandeln."])])

build_pdf("76-rechtsrecherche.pdf", "Rechtsrecherche",
    "Einschlägige Grundlagen, Rechtsprechung, Suchbegriffe — Beispiel", "Standard", 19.90,
    [("Anfragende Person", "Studentin der Rechtswissenschaft"), ("Kanton", "—"),
     ("Frage", "Unter welchen Voraussetzungen kann eine Mietzinskaution vorzeitig freigegeben werden?")],
    [(None, ["Für ein Seminar wird eine strukturierte Kurzrecherche zur vorzeitigen Kautionsfreigabe benötigt."]),
     ("Einschlägige Grundlagen (zu verifizieren)", ["• Bestimmungen zur Sicherheitsleistung der Mieterschaft im Mietrecht des OR.",
        "• Praxis der Schlichtungsbehörden zur Fristberechnung nach Auszug."]),
     ("Rechtsprechung", ["Relevante Bundesgerichtsentscheide zur Kautionsrückgabe sind gezielt über entscheidsuche.ch zu recherchieren — konkrete Fundstellen hier bewusst nicht angegeben, da im Einzelfall zu verifizieren."]),
     ("Kernaussage", ["Eine Kaution kann vor Ablauf der üblichen Frist freigegeben werden, wenn die Vermieterschaft ausdrücklich zustimmt oder feststeht, dass keine Ansprüche mehr geltend gemacht werden."]),
     ("Weiterrecherchieren", ["• fedlex.admin.ch: „Mietkaution Rückgabefrist“", "• entscheidsuche.ch: „Kaution Freigabe Mietrecht“"])])

build_pdf("77-schreiben.pdf", "Schreiben frei verfassen",
    "Individuelles Schreiben an Gegenpartei/Behörde — Beispiel", "Standard", 19.90,
    [("Absender", "Verein Quartierleben Nord, 4058 Basel"), ("Kanton", "Basel-Stadt"),
     ("Empfängerin", "Tiefbauamt Basel-Stadt"),
     ("Anliegen", "Gesuch um temporäre Strassensperrung für ein Quartierfest")],
    [(None, ["Der Verein Quartierleben Nord möchte ein formelles Gesuch an das Tiefbauamt für eine Strassensperrung richten."]),
     ("Entwurf", [
        "Tiefbauamt Basel-Stadt", "",
        "<b>Betreff:</b> Gesuch um temporäre Strassensperrung — Quartierfest 12. September 2026",
        "", "Sehr geehrte Damen und Herren", "",
        "Der Verein Quartierleben Nord plant am 12. September 2026 ein Quartierfest und ersucht um eine temporäre Sperrung der Musterstrasse zwischen Hausnummer 10 und 40 von 10:00 bis 22:00 Uhr. Ein Sicherheitskonzept sowie die Zustimmung der direkt betroffenen Anwohnenden liegen bei.",
        "", "Freundliche Grüsse, Verein Quartierleben Nord"]),
     ("Praktische Hinweise", ["• Gesuchsfristen bei der Gemeinde/dem Kanton frühzeitig erfragen.",
        "• Zustimmung der Anwohnenden proaktiv einholen und beilegen."])])

build_pdf("78-klartext.pdf", "Klartext-Erklärung für Laien",
    "Deine Rechte, Pflichten und nächsten Schritte einfach erklärt — Beispiel", "Info", 9.90,
    [("Situation", "Erika Furrer, 8302 Kloten"), ("Kanton", "Zürich"),
     ("Thema", "Erhalt eines Zahlungsbefehls — was bedeutet das und was tun?")],
    [(None, ["Frau Furrer hat zum ersten Mal einen Zahlungsbefehl erhalten und versteht das Schreiben nicht."]),
     ("Was das für dich bedeutet", ["Ein Zahlungsbefehl ist der erste offizielle Schritt einer Betreibung — er bedeutet, dass jemand behauptet, du schuldest ihm Geld, und dies über das Betreibungsamt einfordert. Er ist noch kein Gerichtsurteil."]),
     ("Deine Rechte", ["• Du kannst innert 10 Tagen 'Rechtsvorschlag' erheben — dann passiert vorerst nichts weiter, ohne dass du dich begründen musst.",
        "• Du kannst die Forderung auch einfach bezahlen, wenn sie berechtigt ist."]),
     ("Deine Pflichten", ["• Wenn die Forderung berechtigt ist und du nichts tust, kann sie nach Ablauf der Frist fortgesetzt werden (z. B. Lohnpfändung)."]),
     ("Nächste sinnvolle Schritte", ["1. Prüfen, ob die Forderung überhaupt stimmt.", "2. Bei Zweifeln: fristgerecht Rechtsvorschlag erheben (siehe Vorlage „Rechtsvorschlag gegen Betreibung“).",
        "3. Bei berechtigter Forderung: möglichst rasch zahlen oder Ratenzahlung vereinbaren."])])

build_pdf("79-fristen-check.pdf", "Fristen-Check (allgemein)",
    "Fristen, Rechtsweg und Warnung bei Versäumnis — Beispiel", "Standard", 19.90,
    [("Fall", "Erhalt einer Verfügung der Ausgleichskasse"), ("Rolle", "Beat Lehmann, Kanton Luzern"),
     ("Sachverhalt", "Verfügung über Rückforderung von Familienzulagen, Zustelldatum 15. Juli 2026")],
    [(None, ["Herr Lehmann möchte wissen, bis wann er gegen die Rückforderungsverfügung vorgehen muss."]),
     ("Laufende / drohende Fristen", [
        "| Frist | Beginn | Dauer | Grundlage |",
        "| Einsprache gegen Verfügung | Zustellung (15.7.2026) | i. d. R. 30 Tage | Verfahrensbestimmungen Sozialversicherung — zu verifizieren |"]),
     ("Zuständigkeit / Rechtsweg", ["Einsprache ist bei der verfügenden Ausgleichskasse einzureichen; bei Ablehnung Beschwerde an das kantonale Versicherungsgericht möglich."]),
     ("Warnung", ["Wird die Einsprachefrist verpasst, wird die Verfügung rechtskräftig und die Rückforderung kann grundsätzlich nicht mehr inhaltlich angefochten werden."])])

build_pdf("80-zusammenfassung.pdf", "Dokument / Urteil zusammenfassen",
    "Kernaussagen, Dispositiv und nächste Schritte — Beispiel", "Standard", 19.90,
    [("Rolle", "Empfängerin eines Gerichtsentscheids"), ("Kanton", "Waadt"),
     ("Dokument", "Entscheid der Schlichtungsbehörde in einer Mietstreitigkeit (fiktiv, gekürzt)")],
    [(None, ["Die Nutzerin hat einen mehrseitigen Schlichtungsentscheid erhalten und möchte die wichtigsten Punkte verständlich zusammengefasst haben."]),
     ("Worum es geht", ["Streit um eine Mietzinsherabsetzung wegen gesunkenem Referenzzinssatz."]),
     ("Kernaussagen", ["• Die Schlichtungsbehörde bestätigt grundsätzlich den Anspruch auf Herabsetzung.",
        "• Der genaue Betrag wird jedoch tiefer festgesetzt als von der Mieterin verlangt.",
        "• Beide Parteien können den Entscheid innert Frist beim Gericht anfechten, falls sie nicht einverstanden sind."]),
     ("Sachverhalt / Rechtsfrage / Dispositiv / Begründung", ["Sachverhalt: gesunkener Referenzzinssatz seit letzter Mietzinsfestsetzung. Rechtsfrage: Höhe der geschuldeten Herabsetzung. Dispositiv: Herabsetzung um CHF 45.–/Monat ab dem nächstmöglichen Termin. Begründung: teilweise Kompensation durch zwischenzeitliche allgemeine Kostensteigerung berücksichtigt."]),
     ("Folgen & offene Punkte", ["Falls die Mieterin mit der Höhe nicht einverstanden ist, muss sie innert der Frist selbst den Weg ans Gericht wählen — der Entscheid wird sonst rechtskräftig."]),
     ("Nächste Schritte", ["Frist zur Anfechtung notieren und Entscheidung treffen, ob der Betrag akzeptiert oder gerichtlich weiterverfolgt wird."])])

print(f"\nFertig: {len(os.listdir(OUT_DIR))} Beispiel-PDFs in {os.path.abspath(OUT_DIR)}")
