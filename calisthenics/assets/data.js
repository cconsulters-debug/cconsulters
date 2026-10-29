/* =========================================================================
   data.js – Übungskatalog & Split-Vorlagen
   Alle Texte, Progressionsketten und Plan-Logiken sind Eigenentwicklung.
   Einheiten: reps = Wiederholungen, time = Sekunden, each = pro Seite.
   level 1 = Einstieg … 5 = sehr fortgeschritten
   ========================================================================= */

const EXERCISES = [
  /* ---------------------------------------------------------------- DRÜCKEN */
  {
    id: 'wall_pushup', name: 'Wand-Liegestütz', cat: 'push', level: 1, type: 'reps',
    equip: 'keine', muscles: ['Brust', 'Trizeps', 'Schulter'],
    cues: [
      'Hände schulterbreit an der Wand, Füsse einen guten Schritt zurück.',
      'Körper bleibt eine gerade Linie von Ferse bis Kopf – Po nicht rausstrecken.',
      'Ellbogen ziehen schräg nach hinten, nicht seitlich weg.'
    ],
    mistakes: ['Hohlkreuz, weil die Bauchspannung fehlt.', 'Kopf sinkt vor die Hände.'],
    harder: 'incline_pushup'
  },
  {
    id: 'incline_pushup', name: 'Schräg-Liegestütz (Erhöhung)', cat: 'push', level: 1, type: 'reps',
    equip: 'Tisch / Bank', muscles: ['Brust', 'Trizeps', 'Rumpf'],
    cues: [
      'Hände auf Tisch- oder Fensterbankhöhe – je höher, desto leichter.',
      'Brust berührt die Kante, dann kontrolliert hochdrücken.',
      'Schulterblätter am tiefsten Punkt zusammenziehen, oben auseinanderschieben.'
    ],
    mistakes: ['Zu schnelles Ablassen ohne Kontrolle.', 'Hände zu weit vorne, Schulter wird belastet.'],
    easier: 'wall_pushup', harder: 'knee_pushup'
  },
  {
    id: 'knee_pushup', name: 'Liegestütz auf Knien', cat: 'push', level: 2, type: 'reps',
    equip: 'keine', muscles: ['Brust', 'Trizeps', 'Rumpf'],
    cues: [
      'Knie, Hüfte und Schulter bilden eine Linie – Hüfte bleibt gestreckt.',
      'Hände etwas breiter als die Schultern, Finger zeigen nach vorn.',
      '3 Sekunden runter, 1 Sekunde hoch.'
    ],
    mistakes: ['Hüfte knickt ein und der Rumpf arbeitet nicht mit.', 'Ellbogen im 90°-Winkel abgespreizt.'],
    easier: 'incline_pushup', harder: 'pushup'
  },
  {
    id: 'pushup', name: 'Liegestütz', cat: 'push', level: 2, type: 'reps',
    equip: 'keine', muscles: ['Brust', 'Trizeps', 'Schulter', 'Rumpf'],
    cues: [
      'Ganzkörperspannung: Po und Bauch fest, Rippen nach unten ziehen.',
      'Ellbogen ca. 45° zum Körper, Unterarme senkrecht.',
      'Brust bis knapp über den Boden, dann explosiv drücken.'
    ],
    mistakes: ['Hüfte hängt durch.', 'Nur halbe Bewegungsamplitude.'],
    easier: 'knee_pushup', harder: 'decline_pushup'
  },
  {
    id: 'decline_pushup', name: 'Liegestütz mit erhöhten Füssen', cat: 'push', level: 3, type: 'reps',
    equip: 'Stuhl', muscles: ['Obere Brust', 'Schulter', 'Trizeps'],
    cues: [
      'Füsse auf Stuhlhöhe, Hände unter der Brust.',
      'Je höher die Füsse, desto mehr Last auf der Schulter.',
      'Nacken lang lassen, Blick leicht nach vorn.'
    ],
    mistakes: ['Hüfte kippt ins Hohlkreuz.', 'Schultern ziehen zu den Ohren.'],
    easier: 'pushup', harder: 'diamond_pushup'
  },
  {
    id: 'diamond_pushup', name: 'Diamant-Liegestütz', cat: 'push', level: 3, type: 'reps',
    equip: 'keine', muscles: ['Trizeps', 'Innere Brust'],
    cues: [
      'Daumen und Zeigefinger bilden ein Dreieck unter der Brust.',
      'Ellbogen bleiben eng am Rumpf.',
      'Am tiefsten Punkt kurz halten, ohne die Spannung abzulegen.'
    ],
    mistakes: ['Hände zu weit unter dem Bauch.', 'Handgelenke werden überstreckt – notfalls Fäuste oder Griffe nutzen.'],
    easier: 'pushup', harder: 'archer_pushup'
  },
  {
    id: 'archer_pushup', name: 'Archer-Liegestütz', cat: 'push', level: 4, type: 'each',
    equip: 'keine', muscles: ['Brust', 'Trizeps', 'Rumpf'],
    cues: [
      'Hände deutlich breiter als schulterbreit.',
      'Auf eine Seite absinken, der andere Arm streckt sich.',
      'Der gestreckte Arm drückt nur minimal mit.'
    ],
    mistakes: ['Rumpf verdreht sich.', 'Der gestreckte Arm schiebt heimlich mit.'],
    easier: 'diamond_pushup', harder: 'onearm_prep'
  },
  {
    id: 'onearm_prep', name: 'Einarmiger Liegestütz (Vorbereitung)', cat: 'push', level: 5, type: 'each',
    equip: 'Erhöhung', muscles: ['Brust', 'Trizeps', 'Rumpf'],
    cues: [
      'Hand auf einer Erhöhung, Füsse deutlich breiter als schulterbreit.',
      'Freier Arm liegt am Rücken, Hüfte bleibt parallel zum Boden.',
      'Erhöhung Woche für Woche niedriger wählen.'
    ],
    mistakes: ['Schulter rotiert nach vorn.', 'Zu früh vom Boden aus versucht.'],
    easier: 'archer_pushup'
  },
  {
    id: 'bench_dip', name: 'Bank-Dips', cat: 'push', level: 2, type: 'reps',
    equip: 'Stuhl', muscles: ['Trizeps', 'Vordere Schulter'],
    cues: [
      'Hände auf der Stuhlkante, Finger zeigen nach vorn.',
      'Nur so tief, wie die Schulter schmerzfrei mitgeht (ca. 90°).',
      'Po bleibt nah an der Kante.'
    ],
    mistakes: ['Zu tief – reizt die Schulterkapsel.', 'Ellbogen weichen nach aussen aus.'],
    harder: 'parallel_dip'
  },
  {
    id: 'parallel_dip', name: 'Barren-Dips', cat: 'push', level: 3, type: 'reps',
    equip: 'Barren', muscles: ['Brust', 'Trizeps', 'Schulter'],
    cues: [
      'Schultern aktiv nach unten drücken, bevor du absinkst.',
      'Leichte Vorlage des Oberkörpers betont die Brust, aufrecht den Trizeps.',
      'Kontrolliert bis Oberarm parallel, dann strecken.'
    ],
    mistakes: ['Hängen in den Schultern.', 'Schwungholen mit den Beinen.'],
    easier: 'bench_dip', harder: 'ring_dip'
  },
  {
    id: 'ring_dip', name: 'Ring-Dips', cat: 'push', level: 4, type: 'reps',
    equip: 'Ringe', muscles: ['Brust', 'Trizeps', 'Stabilisatoren'],
    cues: [
      'Ringe eng am Körper führen, Handflächen zeigen nach innen.',
      'Oben die Ringe leicht nach aussen drehen (Turn-out).',
      'Erst mit stabilen Barren-Dips beginnen.'
    ],
    mistakes: ['Ringe wandern nach vorn.', 'Zu wenig Rumpfspannung, Beine pendeln.'],
    easier: 'parallel_dip'
  },
  {
    id: 'pike_pushup', name: 'Pike-Liegestütz', cat: 'push', level: 3, type: 'reps',
    equip: 'keine', muscles: ['Schulter', 'Trizeps'],
    cues: [
      'Hüfte hoch, Körper bildet ein umgedrehtes V.',
      'Scheitel Richtung Boden, nicht die Nase.',
      'Ellbogen zeigen nach schräg hinten.'
    ],
    mistakes: ['Hüfte sinkt ab, es wird ein normaler Liegestütz.', 'Zu kurze Bewegungsamplitude.'],
    harder: 'elevated_pike_pushup'
  },
  {
    id: 'elevated_pike_pushup', name: 'Pike-Liegestütz erhöht', cat: 'push', level: 4, type: 'reps',
    equip: 'Stuhl', muscles: ['Schulter', 'Trizeps'],
    cues: [
      'Füsse auf einem Stuhl, Hüfte fast senkrecht über den Schultern.',
      'Kopf setzt vor den Händen auf – Dreieck bilden.',
      'Handgelenke vorher aufwärmen.'
    ],
    mistakes: ['Zu weit weg vom Stuhl.', 'Schulterblätter bleiben passiv.'],
    easier: 'pike_pushup', harder: 'wall_hspu'
  },
  {
    id: 'wall_hspu', name: 'Handstand-Liegestütz an der Wand', cat: 'push', level: 5, type: 'reps',
    equip: 'Wand', muscles: ['Schulter', 'Trizeps', 'Rumpf'],
    cues: [
      'Bauch zur Wand oder Rücken zur Wand – Bauch zur Wand ist sauberer.',
      'Ganzkörperspannung, Rippen einziehen.',
      'Erst 60 s stabiler Wand-Handstand, dann erste Wiederholungen.'
    ],
    mistakes: ['Hohlkreuz-Bananenform.', 'Kopf kippt in den Nacken.'],
    easier: 'elevated_pike_pushup'
  },

  /* ----------------------------------------------------------------- ZIEHEN */
  {
    id: 'dead_hang', name: 'Passives Hängen', cat: 'pull', level: 1, type: 'time',
    equip: 'Stange', muscles: ['Griff', 'Schulter', 'Rücken'],
    cues: [
      'Schulterbreiter Obergriff, Daumen umschliesst die Stange.',
      'Locker hängen, dann bewusst tief atmen.',
      'Baut Griffkraft und Schultergesundheit auf – nicht überspringen.'
    ],
    mistakes: ['Verkrampfte Schultern.', 'Zu lange Sätze, bis die Hände aufgeben.'],
    harder: 'scap_pull'
  },
  {
    id: 'scap_pull', name: 'Scapula Pull-ups', cat: 'pull', level: 1, type: 'reps',
    equip: 'Stange', muscles: ['Unterer Trapez', 'Rücken'],
    cues: [
      'Arme bleiben gestreckt, nur die Schulterblätter ziehen nach unten.',
      'Brust hebt sich leicht, der Körper steigt 3–5 cm.',
      'Kurz halten, dann kontrolliert loslassen.'
    ],
    mistakes: ['Ellbogen beugen sich mit.', 'Ruckartige Bewegung.'],
    easier: 'dead_hang', harder: 'aus_pullup'
  },
  {
    id: 'table_row', name: 'Tisch-Rudern', cat: 'pull', level: 1, type: 'reps',
    equip: 'Tisch', muscles: ['Rücken', 'Bizeps'],
    cues: [
      'Unter einen stabilen Tisch legen, Kante mit beiden Händen greifen.',
      'Brust zur Kante ziehen, Körper bleibt gerade.',
      'Knie angewinkelt macht es leichter, gestreckt schwerer.'
    ],
    mistakes: ['Hüfte hängt durch.', 'Nur mit den Armen gezogen, Schulterblätter passiv.'],
    harder: 'aus_pullup'
  },
  {
    id: 'aus_pullup', name: 'Australian Pull-up (Schrägrudern)', cat: 'pull', level: 2, type: 'reps',
    equip: 'niedrige Stange', muscles: ['Rücken', 'Bizeps', 'Rumpf'],
    cues: [
      'Stange auf Hüfthöhe, Fersen am Boden, Körper gerade.',
      'Brustbein zur Stange ziehen, Schulterblätter zusammen.',
      'Je waagerechter der Körper, desto schwerer.'
    ],
    mistakes: ['Po kippt nach unten.', 'Am obersten Punkt keine Pause.'],
    easier: 'table_row', harder: 'neg_pullup'
  },
  {
    id: 'neg_pullup', name: 'Negativ-Klimmzug', cat: 'pull', level: 2, type: 'reps',
    equip: 'Stange', muscles: ['Latissimus', 'Bizeps'],
    cues: [
      'Von einem Stuhl in die obere Position springen, Kinn über der Stange.',
      '5 Sekunden kontrolliert ablassen – das ist der ganze Satz.',
      'Der schnellste Weg zum ersten echten Klimmzug.'
    ],
    mistakes: ['Zu schnelles Fallenlassen.', 'Schulterblätter lösen sich sofort.'],
    easier: 'aus_pullup', harder: 'chinup'
  },
  {
    id: 'chinup', name: 'Klimmzug im Untergriff (Chin-up)', cat: 'pull', level: 3, type: 'reps',
    equip: 'Stange', muscles: ['Latissimus', 'Bizeps'],
    cues: [
      'Handflächen zeigen zu dir, schulterbreit.',
      'Ellbogen zur Hüfte ziehen, Brust zur Stange.',
      'Unten kurz aushängen, aber Schulterblätter aktiv lassen.'
    ],
    mistakes: ['Hüftschwung (Kipping).', 'Nur Halbe – Kinn erreicht die Stange nicht.'],
    easier: 'neg_pullup', harder: 'pullup'
  },
  {
    id: 'pullup', name: 'Klimmzug im Obergriff', cat: 'pull', level: 3, type: 'reps',
    equip: 'Stange', muscles: ['Latissimus', 'Rücken', 'Unterarm'],
    cues: [
      'Obergriff etwas breiter als die Schultern.',
      'Zuerst Schulterblätter nach unten, dann erst die Arme beugen.',
      'Beine leicht vor dem Körper, Hohlkörper-Spannung halten.'
    ],
    mistakes: ['Schwung aus der Hüfte.', 'Kopf wird vorgestreckt statt der Brust.'],
    easier: 'chinup', harder: 'wide_pullup'
  },
  {
    id: 'ring_row', name: 'Ring-Rudern', cat: 'pull', level: 3, type: 'reps',
    equip: 'Ringe', muscles: ['Rücken', 'Bizeps', 'Stabilisatoren'],
    cues: [
      'Füsse nach vorn schieben macht es schwerer.',
      'Ringe zur unteren Rippe ziehen, Ellbogen eng.',
      'Oben 1 Sekunde halten.'
    ],
    mistakes: ['Schultern ziehen zu den Ohren.', 'Hüfte sackt ab.'],
    easier: 'aus_pullup', harder: 'wide_pullup'
  },
  {
    id: 'wide_pullup', name: 'Breiter Klimmzug', cat: 'pull', level: 4, type: 'reps',
    equip: 'Stange', muscles: ['Latissimus', 'Rücken'],
    cues: [
      'Griff deutlich breiter, Ellbogen ziehen nach aussen-unten.',
      'Denk daran, die Stange zu dir zu biegen.',
      'Kürzere Amplitude, dafür mehr Lat-Reiz.'
    ],
    mistakes: ['Zu breit gegriffen, Schulter wird gestresst.', 'Rumpfspannung fehlt.'],
    easier: 'pullup', harder: 'archer_pullup'
  },
  {
    id: 'archer_pullup', name: 'Archer-Klimmzug', cat: 'pull', level: 4, type: 'each',
    equip: 'Stange', muscles: ['Latissimus', 'Bizeps'],
    cues: [
      'Sehr breiter Griff, zu einer Hand hochziehen.',
      'Der andere Arm bleibt fast gestreckt und führt nur.',
      'Schritt Richtung einarmiger Klimmzug.'
    ],
    mistakes: ['Beide Arme ziehen gleich stark.', 'Körper dreht sich weg.'],
    easier: 'wide_pullup', harder: 'lsit_pullup'
  },
  {
    id: 'lsit_pullup', name: 'L-Sit Klimmzug', cat: 'pull', level: 5, type: 'reps',
    equip: 'Stange', muscles: ['Latissimus', 'Bauch', 'Hüftbeuger'],
    cues: [
      'Beine waagerecht vor dem Körper halten – die ganze Zeit.',
      'Kein Schwung möglich, reine Kraft.',
      'Erst wenn 8 saubere Klimmzüge und ein L-Sit stehen.'
    ],
    mistakes: ['Beine sinken beim Ziehen ab.', 'Atmung wird angehalten.'],
    easier: 'archer_pullup', harder: 'muscleup'
  },
  {
    id: 'muscleup', name: 'Muscle-up', cat: 'pull', level: 5, type: 'reps',
    equip: 'Stange', muscles: ['Rücken', 'Brust', 'Trizeps'],
    cues: [
      'Explosiv ziehen, bis die Stange die untere Rippe erreicht.',
      'Handgelenke früh über die Stange drehen.',
      'Voraussetzung: 10 saubere Klimmzüge und 10 Dips.'
    ],
    mistakes: ['Zu spätes Umgreifen.', 'Wilder Kipping-Schwung statt Kraft.'],
    easier: 'lsit_pullup'
  },

  /* ------------------------------------------------------------------ BEINE */
  {
    id: 'squat', name: 'Kniebeuge', cat: 'legs', level: 1, type: 'reps',
    equip: 'keine', muscles: ['Quadrizeps', 'Gesäss'],
    cues: [
      'Füsse schulterbreit, Zehen leicht nach aussen.',
      'Hüfte zurück und runter, Knie folgen der Fussrichtung.',
      'So tief wie möglich, ohne dass der Rücken rundet.'
    ],
    mistakes: ['Fersen heben ab.', 'Knie fallen nach innen.'],
    harder: 'split_squat'
  },
  {
    id: 'wall_sit', name: 'Wandsitzen', cat: 'legs', level: 1, type: 'time',
    equip: 'Wand', muscles: ['Quadrizeps'],
    cues: [
      'Rücken flach an der Wand, Oberschenkel waagerecht.',
      'Knie exakt über den Fersen.',
      'Ruhig weiteratmen.'
    ],
    mistakes: ['Hände stützen auf den Oberschenkeln ab.', 'Hüfte rutscht hoch.'],
    harder: 'squat'
  },
  {
    id: 'reverse_lunge', name: 'Ausfallschritt rückwärts', cat: 'legs', level: 2, type: 'each',
    equip: 'keine', muscles: ['Quadrizeps', 'Gesäss', 'Balance'],
    cues: [
      'Grosser Schritt nach hinten, hinteres Knie sinkt Richtung Boden.',
      'Oberkörper bleibt aufrecht.',
      'Über die vordere Ferse zurückdrücken.'
    ],
    mistakes: ['Zu kleiner Schritt, Knie schiebt weit über die Zehen.', 'Oberkörper kippt vor.'],
    easier: 'squat', harder: 'bulgarian_split_squat'
  },
  {
    id: 'split_squat', name: 'Split Squat', cat: 'legs', level: 2, type: 'each',
    equip: 'keine', muscles: ['Quadrizeps', 'Gesäss'],
    cues: [
      'Beine in Schrittstellung, Position bleibt die ganze Zeit gleich.',
      'Senkrecht ab- und aufwärts bewegen.',
      'Hinteres Knie kurz vor dem Boden stoppen.'
    ],
    mistakes: ['Zu enge Schrittstellung.', 'Gewicht komplett auf dem hinteren Bein.'],
    easier: 'squat', harder: 'bulgarian_split_squat'
  },
  {
    id: 'jump_squat', name: 'Sprungkniebeuge', cat: 'legs', level: 3, type: 'reps',
    equip: 'keine', muscles: ['Quadrizeps', 'Gesäss', 'Explosivkraft'],
    cues: [
      'Aus der tiefen Kniebeuge explosiv nach oben springen.',
      'Weich über den Fussballen landen und direkt in die nächste Wiederholung.',
      'Qualität vor Anzahl – bei Formverlust Satz beenden.'
    ],
    mistakes: ['Harte Landung mit gestreckten Knien.', 'Rücken rundet bei Ermüdung.'],
    easier: 'squat', harder: 'bulgarian_split_squat'
  },
  {
    id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', cat: 'legs', level: 3, type: 'each',
    equip: 'Stuhl', muscles: ['Quadrizeps', 'Gesäss'],
    cues: [
      'Hinterer Fussrist liegt auf dem Stuhl.',
      'Vorderer Fuss weit genug vorn, damit das Knie stabil bleibt.',
      'Leichte Vorlage betont das Gesäss.'
    ],
    mistakes: ['Zu nah am Stuhl.', 'Hüfte verdreht sich.'],
    easier: 'split_squat', harder: 'box_pistol'
  },
  {
    id: 'box_pistol', name: 'Pistol auf Box', cat: 'legs', level: 4, type: 'each',
    equip: 'Stuhl', muscles: ['Quadrizeps', 'Gesäss', 'Balance'],
    cues: [
      'Auf einem Bein zu einem Stuhl absenken, kurz aufsetzen, wieder hoch.',
      'Anderes Bein bleibt gestreckt vorne.',
      'Sitzhöhe Woche für Woche reduzieren.'
    ],
    mistakes: ['Auf den Stuhl plumpsen lassen.', 'Ferse hebt ab – Knöchelmobilität fehlt.'],
    easier: 'bulgarian_split_squat', harder: 'pistol_squat'
  },
  {
    id: 'pistol_squat', name: 'Pistol Squat', cat: 'legs', level: 5, type: 'each',
    equip: 'keine', muscles: ['Quadrizeps', 'Gesäss', 'Balance'],
    cues: [
      'Freies Bein und Arme nach vorn als Gegengewicht.',
      'Ganz nach unten, Ferse bleibt am Boden.',
      'Kontrolliert und ohne Schwung wieder hoch.'
    ],
    mistakes: ['Nach hinten kippen.', 'Rücken rundet stark ein.'],
    easier: 'box_pistol'
  },
  {
    id: 'glute_bridge', name: 'Beckenheben', cat: 'legs', level: 1, type: 'reps',
    equip: 'keine', muscles: ['Gesäss', 'Beinbeuger'],
    cues: [
      'Rückenlage, Füsse hüftbreit nah am Po.',
      'Becken heben, bis Knie–Hüfte–Schulter eine Linie bilden.',
      'Oben 2 Sekunden Gesäss fest anspannen.'
    ],
    mistakes: ['Hohlkreuz statt Hüftstreckung.', 'Druck über die Zehen statt die Fersen.'],
    harder: 'single_glute_bridge'
  },
  {
    id: 'single_glute_bridge', name: 'Einbeiniges Beckenheben', cat: 'legs', level: 2, type: 'each',
    equip: 'keine', muscles: ['Gesäss', 'Beinbeuger'],
    cues: [
      'Ein Bein angewinkelt in die Luft, das andere drückt.',
      'Becken bleibt waagerecht, kein Absacken zur Seite.',
      'Langsam ablassen.'
    ],
    mistakes: ['Becken kippt zur freien Seite.', 'Zu wenig Höhe.'],
    easier: 'glute_bridge', harder: 'nordic_negative'
  },
  {
    id: 'nordic_negative', name: 'Nordic Curl (negativ)', cat: 'legs', level: 4, type: 'reps',
    equip: 'Fixierung', muscles: ['Beinbeuger'],
    cues: [
      'Knien, Fersen unter einer Kante oder von jemandem gehalten.',
      'So langsam wie möglich nach vorn absinken.',
      'Mit den Händen abfangen und hochdrücken.'
    ],
    mistakes: ['Hüfte knickt ein.', 'Zu schnell fallen lassen.'],
    easier: 'single_glute_bridge', harder: 'nordic_curl'
  },
  {
    id: 'nordic_curl', name: 'Nordic Curl', cat: 'legs', level: 5, type: 'reps',
    equip: 'Fixierung', muscles: ['Beinbeuger'],
    cues: [
      'Komplette Bewegung ohne Handunterstützung nach unten und wieder hoch.',
      'Körper bleibt vom Knie bis zum Kopf gestreckt.',
      'Sehr anspruchsvoll – vorher wochenlang Negative.'
    ],
    mistakes: ['Hüftbeugung als Ausweichbewegung.', 'Zu viele Sätze, starker Muskelkater.'],
    easier: 'nordic_negative'
  },
  {
    id: 'calf_raise', name: 'Wadenheben', cat: 'legs', level: 1, type: 'reps',
    equip: 'Stufe', muscles: ['Waden'],
    cues: [
      'Fussballen auf einer Stufe, Fersen sinken tief ab.',
      'Ganz hoch auf die Zehenspitzen, oben 1 Sekunde halten.',
      'Kontrolliert ablassen, nicht federn.'
    ],
    mistakes: ['Zu kurze Amplitude.', 'Knie beugen sich mit.'],
    harder: 'single_calf_raise'
  },
  {
    id: 'single_calf_raise', name: 'Einbeiniges Wadenheben', cat: 'legs', level: 2, type: 'each',
    equip: 'Stufe', muscles: ['Waden'],
    cues: [
      'Ein Bein trägt, das andere hakt sich locker ein.',
      'Voller Bewegungsradius, Tempo langsam.',
      'Leicht mit einer Hand an der Wand stabilisieren.'
    ],
    mistakes: ['Mit der Hand hochziehen.', 'Fussgelenk kippt nach aussen.'],
    easier: 'calf_raise'
  },

  /* ------------------------------------------------------------------ RUMPF */
  {
    id: 'plank', name: 'Unterarmstütz', cat: 'core', level: 1, type: 'time',
    equip: 'keine', muscles: ['Bauch', 'Rumpf'],
    cues: [
      'Ellbogen unter den Schultern, Unterarme parallel.',
      'Po anspannen, Becken leicht nach hinten kippen.',
      'Boden aktiv mit den Unterarmen wegdrücken.'
    ],
    mistakes: ['Durchhängende Hüfte.', 'Po zu hoch.'],
    harder: 'hollow_hold'
  },
  {
    id: 'side_plank', name: 'Seitstütz', cat: 'core', level: 2, type: 'each',
    equip: 'keine', muscles: ['Seitliche Bauchmuskeln'],
    cues: [
      'Ellbogen direkt unter der Schulter.',
      'Hüfte hoch, Körper bildet eine gerade Linie.',
      'Oberer Arm zur Decke oder an der Hüfte.'
    ],
    mistakes: ['Hüfte sinkt ab.', 'Körper rotiert nach vorn.'],
    easier: 'plank', harder: 'hollow_rock'
  },
  {
    id: 'dead_bug', name: 'Dead Bug', cat: 'core', level: 1, type: 'reps',
    equip: 'keine', muscles: ['Tiefe Bauchmuskulatur'],
    cues: [
      'Rückenlage, Arme senkrecht, Knie im rechten Winkel.',
      'Gegengleich Arm und Bein strecken, Lendenwirbelsäule bleibt am Boden.',
      'Langsam ausatmen beim Strecken.'
    ],
    mistakes: ['Rücken hebt vom Boden ab.', 'Zu schnelle Bewegung.'],
    harder: 'hollow_hold'
  },
  {
    id: 'hollow_hold', name: 'Hollow Hold', cat: 'core', level: 2, type: 'time',
    equip: 'keine', muscles: ['Bauch', 'Hüftbeuger'],
    cues: [
      'Unterer Rücken presst in den Boden – das ist die wichtigste Regel.',
      'Arme und Beine gestreckt, Schulterblätter leicht vom Boden.',
      'Wenn der Rücken abhebt: Arme oder Beine anwinkeln.'
    ],
    mistakes: ['Hohlkreuz.', 'Luft anhalten.'],
    easier: 'plank', harder: 'hollow_rock'
  },
  {
    id: 'hollow_rock', name: 'Hollow Rock', cat: 'core', level: 3, type: 'reps',
    equip: 'keine', muscles: ['Bauch'],
    cues: [
      'Aus der Hollow-Position schaukeln – Bewegung kommt aus dem Rumpf.',
      'Form bleibt starr wie ein Brett.',
      'Kleines, gleichmässiges Schaukeln.'
    ],
    mistakes: ['Schwung aus Armen und Beinen.', 'Position bricht auf.'],
    easier: 'hollow_hold', harder: 'lying_leg_raise'
  },
  {
    id: 'lying_leg_raise', name: 'Beinheben liegend', cat: 'core', level: 2, type: 'reps',
    equip: 'keine', muscles: ['Unterer Bauch', 'Hüftbeuger'],
    cues: [
      'Hände unter dem Gesäss, Rücken bleibt flach.',
      'Beine gestreckt heben, dann langsam bis knapp über den Boden senken.',
      'Bei Rückenproblemen die Knie leicht beugen.'
    ],
    mistakes: ['Hohlkreuz beim Absenken.', 'Beine fallen lassen.'],
    easier: 'dead_bug', harder: 'hanging_knee_raise'
  },
  {
    id: 'hanging_knee_raise', name: 'Hängendes Knieheben', cat: 'core', level: 3, type: 'reps',
    equip: 'Stange', muscles: ['Bauch', 'Griff'],
    cues: [
      'An der Stange hängen, Schultern aktiv nach unten.',
      'Knie über die Hüfthöhe ziehen, Becken einrollen.',
      'Ohne Pendeln zurück.'
    ],
    mistakes: ['Schwung nehmen.', 'Nur die Hüftbeuger arbeiten, Becken bleibt starr.'],
    easier: 'lying_leg_raise', harder: 'hanging_leg_raise'
  },
  {
    id: 'hanging_leg_raise', name: 'Hängendes Beinheben', cat: 'core', level: 4, type: 'reps',
    equip: 'Stange', muscles: ['Bauch', 'Hüftbeuger', 'Griff'],
    cues: [
      'Beine gestreckt bis mindestens auf Hüfthöhe.',
      'Am Ende das Becken bewusst nach oben rollen.',
      'Kontrolliert absenken, kein Pendeln.'
    ],
    mistakes: ['Schwung aus dem Rücken.', 'Beine werden angewinkelt bei Ermüdung.'],
    easier: 'hanging_knee_raise', harder: 'toes_to_bar'
  },
  {
    id: 'toes_to_bar', name: 'Toes to Bar', cat: 'core', level: 5, type: 'reps',
    equip: 'Stange', muscles: ['Bauch', 'Latissimus'],
    cues: [
      'Zehen berühren die Stange zwischen den Händen.',
      'Latissimus aktiv mitziehen.',
      'Streng ohne Schwung ausführen.'
    ],
    mistakes: ['Kipping-Schwung.', 'Knie beugen sich stark.'],
    easier: 'hanging_leg_raise'
  },
  {
    id: 'lsit_tuck', name: 'Tuck L-Sit', cat: 'core', level: 3, type: 'time',
    equip: 'Erhöhung', muscles: ['Bauch', 'Trizeps', 'Hüftbeuger'],
    cues: [
      'Auf zwei Erhöhungen stützen, Knie an die Brust ziehen.',
      'Arme durchgestreckt, Schultern nach unten drücken.',
      'Erst wenn 30 s stehen, Beine strecken.'
    ],
    mistakes: ['Schultern hochgezogen.', 'Rücken rundet komplett.'],
    harder: 'lsit'
  },
  {
    id: 'lsit', name: 'L-Sit', cat: 'core', level: 4, type: 'time',
    equip: 'Erhöhung', muscles: ['Bauch', 'Hüftbeuger', 'Trizeps'],
    cues: [
      'Beine gestreckt und waagerecht, Zehen angezogen.',
      'Brust raus, Schultern tief.',
      'Kurze, saubere Sätze sind besser als lange, schlechte.'
    ],
    mistakes: ['Beine sinken ab.', 'Atem anhalten.'],
    easier: 'lsit_tuck', harder: 'dragon_flag_neg'
  },
  {
    id: 'dragon_flag_neg', name: 'Dragon Flag (negativ)', cat: 'core', level: 5, type: 'reps',
    equip: 'Bank', muscles: ['Bauch', 'Rumpf'],
    cues: [
      'Hinter dem Kopf festhalten, Körper senkrecht aufrichten.',
      'Als komplett steifes Brett langsam absenken.',
      'Nur Schulterblätter berühren die Unterlage.'
    ],
    mistakes: ['Hüfte knickt ein.', 'Unterer Rücken hebt ab.'],
    easier: 'lsit'
  },
  {
    id: 'superman', name: 'Superman', cat: 'core', level: 1, type: 'time',
    equip: 'keine', muscles: ['Unterer Rücken', 'Gesäss'],
    cues: [
      'Bauchlage, Arme nach vorn.',
      'Arme, Brust und Beine gleichzeitig anheben.',
      'Nacken lang, Blick zum Boden.'
    ],
    mistakes: ['Kopf in den Nacken werfen.', 'Zu ruckartig.'],
    harder: 'side_plank'
  },

  /* ------------------------------------------------------------------ SKILLS */
  {
    id: 'crow', name: 'Krähe (Crow Pose)', cat: 'skill', level: 3, type: 'time',
    equip: 'keine', muscles: ['Handgelenke', 'Schulter', 'Rumpf'],
    cues: [
      'Hände schulterbreit, Knie auf die Rückseite der Oberarme setzen.',
      'Gewicht langsam nach vorn verlagern, Blick nach vorn.',
      'Kissen vor dich legen für den Anfang.'
    ],
    mistakes: ['Blick zwischen die Hände – dann kippst du.', 'Ellbogen weichen nach aussen.'],
    harder: 'wall_handstand'
  },
  {
    id: 'wall_handstand', name: 'Handstand an der Wand', cat: 'skill', level: 3, type: 'time',
    equip: 'Wand', muscles: ['Schulter', 'Rumpf', 'Handgelenke'],
    cues: [
      'Bauch zur Wand, mit den Füssen hochlaufen.',
      'Rippen einziehen, Po anspannen, Schultern zu den Ohren drücken.',
      'Handgelenke vorher gründlich aufwärmen.'
    ],
    mistakes: ['Bananenrücken.', 'Zu weit von der Wand entfernt.'],
    easier: 'crow', harder: 'tuck_front_lever'
  },
  {
    id: 'tuck_front_lever', name: 'Tuck Front Lever', cat: 'skill', level: 4, type: 'time',
    equip: 'Stange', muscles: ['Latissimus', 'Bauch'],
    cues: [
      'Aus dem Hang Knie eng anziehen, Rücken waagerecht.',
      'Arme bleiben gestreckt, Schultern nach unten drücken.',
      'Kurze Sätze von 5–10 s, dafür mehrere.'
    ],
    mistakes: ['Arme beugen sich.', 'Hüfte hängt zu tief.'],
    easier: 'wall_handstand', harder: 'adv_front_lever'
  },
  {
    id: 'adv_front_lever', name: 'Advanced Tuck / Straddle Front Lever', cat: 'skill', level: 5, type: 'time',
    equip: 'Stange', muscles: ['Latissimus', 'Bauch', 'Rumpf'],
    cues: [
      'Hüfte öffnen, bis Oberschenkel und Rumpf eine Linie bilden.',
      'Danach Beine grätschen und schrittweise strecken.',
      'Jede Stufe erst mit 15 s sauber halten.'
    ],
    mistakes: ['Zu früh in die nächste Stufe.', 'Becken kippt ins Hohlkreuz.'],
    easier: 'tuck_front_lever'
  },
  {
    id: 'tuck_back_lever', name: 'Tuck Back Lever', cat: 'skill', level: 4, type: 'time',
    equip: 'Stange', muscles: ['Schulter', 'Brust', 'Bizeps'],
    cues: [
      'Rückwärts durchdrehen, Knie angezogen, Rücken zum Boden.',
      'Arme gestreckt, Schultern stabil nach vorn geschoben.',
      'Ellbogen niemals überstrecken – Bizepssehne schützen.'
    ],
    mistakes: ['Zu schnelles Strecken der Beine.', 'Ohne Aufwärmen der Ellbogen.'],
    easier: 'wall_handstand'
  },

  /* ------------------------------------------------------- AUFWÄRMEN / CooL */
  { id: 'jumping_jacks', name: 'Hampelmann', cat: 'warmup', level: 1, type: 'time', equip: 'keine', muscles: ['Kreislauf'], cues: ['Locker und rhythmisch, Puls hochbringen.', 'Weich landen.', '60–90 Sekunden reichen.'], mistakes: ['Zu hart in die Knie.'] },
  { id: 'arm_circles', name: 'Armkreisen', cat: 'warmup', level: 1, type: 'time', equip: 'keine', muscles: ['Schulter'], cues: ['Erst klein, dann grösser werdend.', 'Halbe Zeit vorwärts, halbe rückwärts.', 'Schultern locker lassen.'], mistakes: ['Zu schnell und ruckartig.'] },
  { id: 'cat_cow', name: 'Katze–Kuh', cat: 'warmup', level: 1, type: 'time', equip: 'keine', muscles: ['Wirbelsäule'], cues: ['Im Vierfüsslerstand Rücken abwechselnd runden und strecken.', 'Mit der Atmung koppeln.', 'Langsam Wirbel für Wirbel.'], mistakes: ['Nur aus dem Nacken bewegen.'] },
  { id: 'hip_opener', name: 'Hüftöffner im Ausfallschritt', cat: 'warmup', level: 1, type: 'each', equip: 'keine', muscles: ['Hüftbeuger'], cues: ['Tiefer Ausfallschritt, hinteres Knie am Boden.', 'Becken nach vorn schieben, Gesäss anspannen.', '30 Sekunden pro Seite.'], mistakes: ['Ins Hohlkreuz ausweichen.'] },
  { id: 'wrist_prep', name: 'Handgelenks-Vorbereitung', cat: 'warmup', level: 1, type: 'time', equip: 'keine', muscles: ['Handgelenke'], cues: ['Handflächen am Boden, Gewicht kreisen lassen.', 'Dann Handrücken und Fingerspitzen.', 'Pflicht vor allem, was auf den Händen stattfindet.'], mistakes: ['Überspringen – häufigste Ursache für Handgelenkschmerzen.'] },
  { id: 'leg_swings', name: 'Beinpendel', cat: 'warmup', level: 1, type: 'each', equip: 'keine', muscles: ['Hüfte'], cues: ['An der Wand abstützen, Bein locker vor und zurück schwingen.', 'Amplitude langsam vergrössern.', '15 Schwünge pro Seite.'], mistakes: ['Mit Schwung in den Endbereich reissen.'] },
  { id: 'chest_stretch', name: 'Brustdehnung an der Wand', cat: 'cooldown', level: 1, type: 'each', equip: 'Wand', muscles: ['Brust'], cues: ['Unterarm an der Wand, Körper wegdrehen.', '30 Sekunden ruhig atmen.', 'Kein Ziehen in der Schulter.'], mistakes: ['Zu aggressiv gedehnt.'] },
  { id: 'ham_stretch', name: 'Beinbeuger-Dehnung', cat: 'cooldown', level: 1, type: 'each', equip: 'keine', muscles: ['Beinbeuger'], cues: ['Bein gestreckt vorstellen, Hüfte nach hinten schieben.', 'Rücken lang lassen.', '30 Sekunden halten.'], mistakes: ['Rücken rundet statt Hüfte zu beugen.'] },
  { id: 'hipflex_stretch', name: 'Hüftbeuger-Dehnung', cat: 'cooldown', level: 1, type: 'each', equip: 'keine', muscles: ['Hüftbeuger'], cues: ['Kniender Ausfallschritt, Gesäss fest anspannen.', 'Becken aufrichten, dann leicht vorschieben.', '30 Sekunden pro Seite.'], mistakes: ['Hohlkreuz statt Beckenaufrichtung.'] },
  { id: 'childs_pose', name: 'Kindhaltung', cat: 'cooldown', level: 1, type: 'time', equip: 'keine', muscles: ['Rücken', 'Schulter'], cues: ['Fersensitz, Arme weit nach vorn.', 'Brust Richtung Boden sinken lassen.', 'Tief in den Rücken atmen.'], mistakes: ['Schultern hochgezogen.'] },
  { id: 'lat_stretch', name: 'Latissimus-Dehnung', cat: 'cooldown', level: 1, type: 'each', equip: 'keine', muscles: ['Latissimus'], cues: ['Arm über den Kopf, zur Gegenseite neigen.', 'Hüfte bleibt stabil.', '30 Sekunden pro Seite.'], mistakes: ['Oberkörper dreht sich mit.'] }
];

const EX_BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

/* -------------------------------------------------------------------------
   Splits: welcher Trainingstag enthält welche Übungs-Slots.
   Ein Slot beschreibt einen Bewegungsmuster-Platz, keine feste Übung –
   die konkrete Übung wählt der Generator nach Level und Ausrüstung.
   ------------------------------------------------------------------------- */
/* Jeder Pool hat GENAU 5 Einträge – Index 0 = Level 1 … Index 4 = Level 5.
   Übungen, die hier nicht auftauchen (z. B. Muscle-up, einarmiger Liegestütz),
   erreichst du im Training jederzeit über „Leichter“ / „Schwerer“. */
const SLOT_POOLS = {
  push_h:  ['wall_pushup', 'knee_pushup', 'pushup', 'diamond_pushup', 'archer_pushup'],
  push_v:  ['incline_pushup', 'pike_pushup', 'pike_pushup', 'elevated_pike_pushup', 'wall_hspu'],
  dip:     ['bench_dip', 'bench_dip', 'parallel_dip', 'ring_dip', 'ring_dip'],
  pull_v:  ['dead_hang', 'neg_pullup', 'chinup', 'pullup', 'archer_pullup'],
  pull_h:  ['table_row', 'aus_pullup', 'ring_row', 'ring_row', 'archer_pullup'],
  scap:    ['scap_pull', 'scap_pull', 'scap_pull', 'tuck_front_lever', 'adv_front_lever'],
  squat:   ['wall_sit', 'squat', 'bulgarian_split_squat', 'box_pistol', 'pistol_squat'],
  hinge:   ['glute_bridge', 'single_glute_bridge', 'single_glute_bridge', 'nordic_negative', 'nordic_curl'],
  lunge:   ['squat', 'reverse_lunge', 'jump_squat', 'bulgarian_split_squat', 'pistol_squat'],
  calf:    ['calf_raise', 'calf_raise', 'single_calf_raise', 'single_calf_raise', 'single_calf_raise'],
  core_a:  ['plank', 'hollow_hold', 'hollow_rock', 'lsit_tuck', 'lsit'],
  core_b:  ['dead_bug', 'lying_leg_raise', 'hanging_knee_raise', 'hanging_leg_raise', 'toes_to_bar'],
  core_c:  ['superman', 'side_plank', 'side_plank', 'dragon_flag_neg', 'dragon_flag_neg'],
  skill:   ['crow', 'crow', 'wall_handstand', 'tuck_front_lever', 'adv_front_lever']
};

const SPLITS = {
  fullbody_a: { name: 'Ganzkörper A', slots: ['push_h', 'pull_v', 'squat', 'core_a', 'core_b'] },
  fullbody_b: { name: 'Ganzkörper B', slots: ['push_v', 'pull_h', 'hinge', 'lunge', 'core_c'] },
  fullbody_c: { name: 'Ganzkörper C', slots: ['dip', 'pull_v', 'squat', 'calf', 'core_a'] },
  push:       { name: 'Push (Drücken)', slots: ['push_h', 'push_v', 'dip', 'core_a', 'core_c'] },
  pull:       { name: 'Pull (Ziehen)', slots: ['pull_v', 'pull_h', 'scap', 'core_b', 'core_a'] },
  legs:       { name: 'Legs (Beine)', slots: ['squat', 'lunge', 'hinge', 'calf', 'core_c'] },
  upper:      { name: 'Oberkörper', slots: ['push_h', 'pull_v', 'push_v', 'pull_h', 'core_b'] },
  lower:      { name: 'Unterkörper & Rumpf', slots: ['squat', 'hinge', 'lunge', 'calf', 'core_a'] },
  skillday:   { name: 'Skill & Rumpf', slots: ['skill', 'scap', 'core_a', 'core_b', 'core_c'] }
};

/* Welche Splits bei wie vielen Trainingstagen pro Woche */
const WEEK_TEMPLATES = {
  2: ['fullbody_a', 'fullbody_b'],
  3: ['fullbody_a', 'fullbody_b', 'fullbody_c'],
  4: ['upper', 'lower', 'push', 'legs'],
  5: ['push', 'pull', 'legs', 'upper', 'skillday'],
  6: ['push', 'pull', 'legs', 'push', 'pull', 'skillday']
};

const GOALS = {
  strength:   { name: 'Maximalkraft', reps: [4, 8],   sets: [4, 5], rest: 150 },
  muscle:     { name: 'Muskelaufbau', reps: [8, 14],  sets: [3, 4], rest: 90 },
  endurance:  { name: 'Kraftausdauer', reps: [14, 22], sets: [3, 4], rest: 45 },
  skills:     { name: 'Skills & Technik', reps: [5, 10], sets: [4, 5], rest: 120 }
};

const LEVELS = {
  1: 'Einsteiger',
  2: 'Wiedereinsteiger',
  3: 'Fortgeschritten',
  4: 'Erfahren',
  5: 'Sehr fortgeschritten'
};
