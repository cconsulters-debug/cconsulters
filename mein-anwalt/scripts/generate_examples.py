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
    "10-werkzeuge-rechtsgutachten.pdf",
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

print(f"\nFertig: {len(os.listdir(OUT_DIR))} Beispiel-PDFs in {os.path.abspath(OUT_DIR)}")
