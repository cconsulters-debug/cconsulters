/* Comeback – klickbarer Prototyp (React, eine Datei, Daten nur lokal im Browser)
   Build: node tools/comeback/build.mjs  → tools/comeback/index.html */

const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Speicher (nur lokal) ---------- */
const STORE_KEY = "comeback.v1";
const loadState = () => {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
};
const saveState = (st) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch (e) {} };
const clearState = () => { try { localStorage.removeItem(STORE_KEY); } catch (e) {} };

/* ---------- Datum ---------- */
const pad = (n) => String(n).padStart(2, "0");
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysBetween = (a, b) => Math.round((parseKey(dkey(b)) - parseKey(dkey(a))) / 86400000);
const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WD_S = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const fmtDate = (d) => `${WD[d.getDay()]}, ${d.getDate()}. ${MON[d.getMonth()]}`;

/* ---------- Coaching-Team ---------- */
const COACHES = {
  food: { id: "food", name: "Ernährungs-Coach", short: "Ernährung", icon: "🥗", tag: "Einfache Mahlzeiten, Wochenplan, Einkaufsliste" },
  fit: { id: "fit", name: "Fitness-Coach", short: "Bewegung", icon: "💪", tag: "Training zuhause oder im Gym, 20–45 Min." },
  mind: { id: "mind", name: "Mental-Coach", short: "Mental", icon: "🧠", tag: "Stress, Schlaf, Gewohnheiten, Gedanken" },
  life: { id: "life", name: "Life-Coach", short: "Leben", icon: "🔥", tag: "Ziele, Wochenplanung, Motivation, Rückschläge" },
};
const COACH_ORDER = ["food", "fit", "mind", "life"];

const GOALS = [
  { id: "energy", label: "Mehr Energie" },
  { id: "fit", label: "Fitter werden" },
  { id: "weight", label: "Gewicht reduzieren" },
  { id: "strength", label: "Kraft aufbauen" },
  { id: "sleep", label: "Besser schlafen" },
  { id: "stress", label: "Weniger Stress" },
  { id: "food", label: "Gesünder essen" },
  { id: "structure", label: "Wieder Struktur" },
];
const goalLabel = (id) => (GOALS.find((g) => g.id === id) || {}).label || id;

/* ---------- 12-Wochen-Plan ---------- */
const PHASES = [
  { id: 1, name: "Stabilisieren", from: 1, to: 4, goal: "Rhythmus finden: Schlaf, Essen, Bewegung. Klein anfangen, dranbleiben." },
  { id: 2, name: "Aufbauen", from: 5, to: 8, goal: "Kraft und Energie steigern. Etwas mehr Intensität, gleiche Routine." },
  { id: 3, name: "Festigen", from: 9, to: 12, goal: "Gewohnheiten verankern und Rückschläge abfangen. Dein System steht." },
];
const phaseOf = (w) => PHASES.find((p) => w >= p.from && w <= p.to) || PHASES[2];

const FIT_FOCUS = ["Grundübungen lernen", "Regelmässigkeit", "Ganzkörper sauber", "Ausdauer-Basis", "Kraft: +1 Satz", "Kurze Intervalle", "Progression", "Technik & Erholung", "Eigenes Programm", "Kraft halten", "Lieblingsformat finden", "Test: Woche 1 vs. heute"];
const FOOD_FOCUS = ["Frühstück mit Protein", "Genug trinken", "Gemüse zu jeder Hauptmahlzeit", "Einkaufsliste nutzen", "Meal-Prep Basics", "Snacks clever wählen", "Auswärts essen", "Teller-Prinzip", "Lieblingsrezepte festigen", "Essen bei Stress", "Flexibel bleiben", "Dein Ernährungs-Kompass"];
const MIND_FOCUS = ["Schlaf-Fenster festlegen", "Atmung bei Stress", "Gedanken prüfen", "3 gute Dinge", "Sorgenfenster", "Grenzen setzen", "Digitale Pausen", "Freundlich bei Rückschlägen", "Werte klären", "Rückfallplan", "Routinen im Alltag", "Rückblick & Ausblick"];

function buildPlan(p) {
  // Reihenfolge personalisieren: Schlaf oder Stress zuerst, wenn nötig
  let mind = [...MIND_FOCUS];
  if (p.stress >= 7) mind = ["Atmung bei Stress", "Schlaf-Fenster festlegen", ...MIND_FOCUS.filter((x) => !["Atmung bei Stress", "Schlaf-Fenster festlegen"].includes(x))];
  else if (p.sleep < 6.5 || p.goals.includes("sleep")) mind = ["Schlaf-Fenster festlegen", ...MIND_FOCUS.filter((x) => x !== "Schlaf-Fenster festlegen")];

  const weeks = [];
  for (let w = 1; w <= 12; w++) {
    const ph = phaseOf(w);
    const base = [20, 30, 40][ph.id - 1];
    const minutes = Math.max(15, Math.min(p.time, base));
    let sessions = ph.id === 1 ? (p.energy >= 6 && p.stress < 7 ? 3 : 2) : ph.id === 2 ? 3 : (p.time >= 45 ? 4 : 3);
    if (w === 8) sessions = Math.max(2, sessions - 1); // Erholungswoche
    weeks.push({ week: w, phase: ph.id, minutes, sessions, fit: FIT_FOCUS[w - 1], food: FOOD_FOCUS[w - 1], mind: mind[w - 1] });
  }
  const ms = [
    { w: 2, t: "7 Tage am Stück mind. 2 von 3 Aufgaben erledigt" },
    { w: 4, t: p.goals.includes("sleep") || p.sleep < 6.5 ? "Schlafroutine an 5 von 7 Abenden" : "Erste Phase abgeschlossen: Rhythmus steht" },
    { w: 6, t: p.goals.includes("strength") ? "10 saubere Liegestütze (Knie erlaubt)" : "3 Trainings pro Woche, 2 Wochen in Folge" },
    { w: 8, t: p.goals.includes("food") || p.goals.includes("weight") ? "Meal-Prep 1x pro Woche ist Gewohnheit" : "Energie im Schnitt 1 Punkt höher als in Woche 1" },
    { w: 10, t: "Eigene Wochenplanung ohne Vorlage" },
    { w: 12, t: "Comeback-Check: Vergleich mit Woche 1" },
  ];
  return { weeks, milestones: ms };
}

/* ---------- Aufgaben-Bibliothek ---------- */
const WORKOUTS = {
  home: [
    { t: "Ganzkörper zuhause", s: ["Kniebeugen, 10 Wdh.", "Liegestütze, 6–10 Wdh. (Knie erlaubt)", "Hip Bridges, 12 Wdh.", "Unterarmstütz, 20–30 Sek.", "Rest der Zeit: Runden wiederholen, 60 Sek. Pause"] },
    { t: "Kraft & Stabilität zuhause", s: ["Ausfallschritte, 8 pro Seite", "Rudern mit Rucksack, 12 Wdh.", "Seitstütz, 20 Sek. pro Seite", "Wandsitzen, 30 Sek.", "3–4 Runden, ruhig atmen"] },
    { t: "Zirkel zuhause", s: ["40 Sek. Arbeit, 20 Sek. Pause", "Kniebeugen · Liegestütze · Bergsteiger · Hip Bridges", "So viele Runden, wie die Zeit erlaubt", "Tempo so, dass du noch sprechen kannst"] },
  ],
  gym: [
    { t: "Gym Ganzkörper", s: ["Beinpresse, 3×10", "Rudern am Kabel, 3×10", "Brustpresse, 3×10", "Plank, 3×30 Sek.", "Gewicht so wählen, dass 2 Wdh. Reserve bleiben"] },
    { t: "Gym Kraft-Basis", s: ["Goblet Squat, 3×8", "Latzug, 3×10", "Rumänisches Kreuzheben mit Kurzhanteln, 3×10", "Schulterdrücken sitzend, 3×10"] },
    { t: "Gym Kraft & Cardio", s: ["15 Min. Kraft: Beinpresse, Rudern, Brustpresse je 2×12", "Rest der Zeit: Velo oder Crosstrainer, mittleres Tempo"] },
  ],
  outdoor: [
    { t: "Zügig gehen mit Tempowechsel", s: ["5 Min. locker einlaufen", "5× 1 Min. schneller, 2 Min. normal", "Rest der Zeit: gemütlich auslaufen"] },
    { t: "Park-Workout", s: ["Step-ups auf Bank, 10 pro Seite", "Liegestütze an der Bank, 10 Wdh.", "Ausfallschritte gehend, 10 pro Seite", "3–4 Runden, dazwischen 2 Min. gehen"] },
    { t: "Lockerer Lauf oder Walk", s: ["Wechsel: 3 Min. joggen, 2 Min. gehen", "Wenn Joggen nicht passt: zügig gehen", "Puls so, dass Reden möglich bleibt"] },
  ],
};
const RECOVERY = [
  { t: "Spaziergang", s: ["15–20 Min. draussen gehen", "Ohne Kopfhörer, wenn du magst", "Zählt voll als Bewegung"] },
  { t: "Mobility 10 Min.", s: ["Katze-Kuh, 10×", "Hüftbeuger-Dehnung, 45 Sek. pro Seite", "Brustwirbelsäule rotieren, 8 pro Seite", "Kindhaltung, 1 Min."] },
];

const FOOD_TASKS = {
  "Frühstück mit Protein": [["Protein-Frühstück", "Skyr oder Quark mit Beeren und 3 EL Haferflocken. Hält länger satt als Gipfeli."], ["Eier-Frühstück", "2 Eier, Vollkornbrot, ein paar Cherrytomaten. 10 Minuten."]],
  "Genug trinken": [["1.5–2 L Wasser", "Stell dir am Morgen eine Flasche hin. Ein Glas zu jeder Mahlzeit."], ["Süssgetränk ersetzen", "Ein Süssgetränk durch Wasser mit Zitrone oder ungesüssten Tee ersetzen."]],
  "Gemüse zu jeder Hauptmahlzeit": [["2 Handvoll Gemüse", "Mittag und Abend je eine Handvoll Gemüse oder Salat dazu."], ["Gemüse vorbereiten", "Rüebli, Gurke, Peperoni schneiden und in eine Box für 3 Tage."]],
  "Einkaufsliste nutzen": [["Mit Liste einkaufen", "Öffne Plan → Diese Woche → Einkaufsliste und hake ab."], ["Basis-Vorrat", "Haferflocken, Linsen, Tiefkühlgemüse, Eier, Naturjoghurt im Haus."]],
  "Meal-Prep Basics": [["Doppelt kochen", "Heute die doppelte Menge kochen, morgen Mittag mitnehmen."], ["Ofengemüse-Blech", "1 Blech Gemüse mit Kichererbsen, 25 Min. bei 200 °C. Reicht für 2 Tage."]],
  "Snacks clever wählen": [["Snack mit Protein", "Eine Handvoll Nüsse oder ein Joghurt statt Biscuits."], ["Snack-Box", "Apfel, Nüsse, Käsewürfel für den Nachmittag vorbereiten."]],
  "Auswärts essen": [["Kantine clever", "Halber Teller Gemüse, ein Viertel Protein, ein Viertel Beilage."], ["Restaurant ohne Stress", "Geniessen erlaubt. Gemüse oder Salat dazu bestellen, langsam essen."]],
  "Teller-Prinzip": [["Teller-Prinzip", "½ Gemüse, ¼ Protein, ¼ Kohlenhydrate. Ohne Wägen, ohne Zählen."], ["Langsam essen", "Eine Mahlzeit ohne Handy, Besteck zwischendurch ablegen."]],
  "Lieblingsrezepte festigen": [["Dein Top-3-Rezept", "Koch eines deiner 3 Lieblingsrezepte aus den letzten Wochen."], ["Rezept notieren", "Schreib ein neues Lieblingsrezept in deine Notizen."]],
  "Essen bei Stress": [["Stress-Snack-Plan", "Leg fest, was du isst, wenn es stressig wird, zum Beispiel Joghurt mit Früchten."], ["Hunger-Check", "Vor dem Snack kurz fragen: Hunger oder Stress? Beides ist ok."]],
  "Flexibel bleiben": [["80/20 essen", "8 von 10 Mahlzeiten nach Plan, 2 frei. Kein schlechtes Gewissen."], ["Wochenende planen", "Eine Mahlzeit am Wochenende bewusst geniessen."]],
  "Dein Ernährungs-Kompass": [["Deine 5 Regeln", "Schreib deine 5 Ernährungsregeln auf, die für dich funktionieren."], ["Einkauf ohne Liste", "Kauf ein, als würdest du die Liste schon kennen. Danach vergleichen."]],
};
const MIND_TASKS = {
  "Schlaf-Fenster festlegen": [["Feste Schlafenszeit", "Wähle eine Zeit und halte sie diese Woche an 5 Abenden ein."], ["Bildschirm aus", "30 Min. vor dem Schlafen kein Handy. Lesen oder Musik statt Scrollen."]],
  "Atmung bei Stress": [["3 Min. Atmen", "4 Sek. ein, 6 Sek. aus. 3 Minuten. Senkt spürbar die Anspannung."], ["Atem-Pause im Job", "Vor dem nächsten Meeting: 5 ruhige Atemzüge."]],
  "Gedanken prüfen": [["Gedanken-Check", "Situation, Gedanke, Gefühl notieren. Dann fragen: Was würde ich einer Freundin sagen?"], ["Alternative Sicht", "Ein belastender Gedanke, zwei realistischere Alternativen."]],
  "3 gute Dinge": [["3 gute Dinge", "Am Abend 3 Dinge notieren, die heute gut waren. Auch kleine zählen."], ["Danke sagen", "Einer Person heute bewusst danken."]],
  "Sorgenfenster": [["Sorgenfenster 10 Min.", "Sorgen sammeln und auf 18 Uhr verschieben. Dann 10 Min. aufschreiben, danach Schluss."], ["Was kann ich beeinflussen?", "Eine Sorge in 2 Spalten aufteilen: beeinflussbar, nicht beeinflussbar."]],
  "Grenzen setzen": [["Ein Nein üben", "Sag heute einmal freundlich Nein oder Später."], ["Feierabend-Ritual", "Laptop zu, kurzer Spaziergang, dann bewusst Freizeit."]],
  "Digitale Pausen": [["Handy-freie Stunde", "Eine Stunde heute ohne Handy, zum Beispiel beim Abendessen."], ["Push-Mitteilungen aus", "3 Apps finden, deren Mitteilungen du nicht brauchst."]],
  "Freundlich bei Rückschlägen": [["Freundlich mit dir", "Schreib dir 2 Sätze, wie du einem guten Freund nach einem Rückschlag schreiben würdest."], ["Rückschlag ≠ Scheitern", "Notiere einen Rückschlag und was du daraus mitnimmst."]],
  "Werte klären": [["Deine 3 Werte", "Was ist dir wirklich wichtig? 3 Werte notieren."], ["Wert im Alltag", "Mach heute eine kleine Sache, die zu einem deiner Werte passt."]],
  "Rückfallplan": [["Wenn-dann-Plan", "Wenn ich keine Zeit habe, dann mache ich 10 Min. Mini-Training."], ["Frühwarnzeichen", "Notiere 3 Zeichen, dass du aus dem Rhythmus fällst."]],
  "Routinen im Alltag": [["Gewohnheit koppeln", "Neue Gewohnheit an eine bestehende hängen: nach dem Kaffee 2 Min. atmen."], ["Abendroutine", "3 feste Schritte vor dem Schlafen festlegen."]],
  "Rückblick & Ausblick": [["Brief an dich", "Was hat sich seit Woche 1 verändert? 5 Sätze."], ["Nächste 12 Wochen", "Ein Ziel für die nächsten 3 Monate festlegen."]],
};

const TRAINING_DAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 6] };

function programWeek(state, date = today()) {
  const d = daysBetween(parseKey(state.profile.startDate), date);
  return Math.min(12, Math.max(1, Math.floor(d / 7) + 1));
}

function tasksFor(state, date) {
  const p = state.profile;
  const w = programWeek(state, date);
  const wk = state.plan.weeks[w - 1];
  const adj = (state.weekly[w - 1] && state.weekly[w - 1].adjust) || {};
  const dow = date.getDay();
  const n = daysBetween(parseKey(p.startDate), date);
  const sessions = adj.gentle ? 0 : wk.sessions;
  const trainDays = TRAINING_DAYS[Math.max(2, sessions)] || [];
  let minutes = Math.max(10, Math.min(45, wk.minutes + (adj.minutesDelta || 0)));

  let move;
  if (sessions > 0 && trainDays.includes(dow)) {
    const pool = WORKOUTS[p.place] || WORKOUTS.home;
    const wo = pool[(n + w) % pool.length];
    const steps = [...wo.s];
    if (wk.phase === 1 && p.stress >= 7) steps.push("Sanft starten: Intensität mittel, nicht ans Limit");
    if (adj.mini) steps.unshift("Mini-Version erlaubt: 10 Min. zählen voll");
    move = { title: `${wo.t} · ${minutes} Min.`, detail: steps, coach: "fit", training: true };
  } else {
    const r = RECOVERY[n % RECOVERY.length];
    move = { title: adj.gentle ? "Sanfte Bewegung · 15 Min." : `${r.t}`, detail: adj.gentle ? ["Diese Woche ist Erholung dran.", "Kurzer Spaziergang, nur wenn es sich gut anfühlt."] : r.s, coach: "fit", training: false };
  }

  const foodPool = FOOD_TASKS[wk.food] || FOOD_TASKS["Teller-Prinzip"];
  let food = dow === 0 ? ["Wochenmenü & Einkaufsliste", "Öffne Plan → Diese Woche. Wähle 3 Abendessen und schreib die Einkaufsliste."] : foodPool[n % 2];
  const mindTheme = adj.sleepFocus ? "Schlaf-Fenster festlegen" : wk.mind;
  const mindPool = MIND_TASKS[mindTheme] || MIND_TASKS["3 gute Dinge"];
  let mind = dow === 0 ? ["Woche reflektieren", "Mach den Wochen-Check-in: Was lief, was nicht?"] : mindPool[n % 2];

  return [
    { id: "move", ...move },
    { id: "food", title: food[0], detail: [food[1]], coach: "food" },
    { id: "mind", title: mind[0], detail: [mind[1]], coach: "mind" },
  ];
}

const dayDone = (day) => !!day && ["move", "food", "mind"].filter((k) => day.tasks && day.tasks[k]).length >= 2;
function streakInfo(state) {
  let cur = 0;
  let d = today();
  if (!dayDone(state.days[dkey(d)])) d = addDays(d, -1);
  while (dayDone(state.days[dkey(d)])) { cur++; d = addDays(d, -1); }
  let best = 0, run = 0;
  const start = parseKey(state.profile.startDate);
  for (let x = new Date(start); x <= today(); x = addDays(x, 1)) {
    if (dayDone(state.days[dkey(x)])) { run++; best = Math.max(best, run); } else run = 0;
  }
  return { cur, best: Math.max(best, cur) };
}

/* ---------- Wochenmenü & Einkaufsliste ---------- */
const MENU = [
  ["Mo", "Ofengemüse mit Kichererbsen und Feta"],
  ["Di", "Vollkornpasta mit Tomatensauce, Linsen und Spinat"],
  ["Mi", "Poulet- oder Tofu-Pfanne mit Reis und Brokkoli"],
  ["Do", "Reste vom Mittwoch als Bowl mit Salat"],
  ["Fr", "Omelette mit Gemüse und Brot"],
  ["Sa", "Frei: geniessen, auswärts oder Lieblingsessen"],
  ["So", "Suppe mit Gemüse und Bohnen, doppelt kochen"],
];
const SHOPPING = [
  { g: "Gemüse & Früchte", items: ["Peperoni, Zucchetti, Rüebli", "Brokkoli", "Spinat (frisch oder TK)", "Salat", "Beeren (TK)", "Äpfel, Bananen", "Zitronen"] },
  { g: "Protein", items: ["Eier (10)", "Skyr oder Magerquark", "Poulet oder Tofu", "Feta", "Kichererbsen, Linsen (Dose)"] },
  { g: "Vorrat", items: ["Haferflocken", "Vollkornpasta", "Reis", "Passierte Tomaten", "Nüsse", "Vollkornbrot"] },
];

/* ---------- Chat-Antworten (vordefiniert) ---------- */
const CRISIS_RE = /(suizid|selbstmord|umbringen|nicht mehr leben|sterben will|will sterben|keinen sinn mehr|ritzen|selbstverletz|krise|notfall|halte es nicht mehr aus)/i;
const CRISIS_ANSWER = "Danke, dass du das schreibst. Das klingt nach sehr viel. Ich bin ein Coach und kann in einer Krise nicht helfen. Bitte hol dir jetzt Unterstützung:\n\n• Die Dargebotene Hand: Tel. 143 (rund um die Uhr, anonym)\n• Notfall: Tel. 144\n\nBleib nicht allein damit. Ruf jetzt an oder sag einer Person in deiner Nähe Bescheid.";

const INTENTS = {
  food: [
    { k: ["kalor", "diät", "diaet", "abnehm", "fasten"], a: "Ich setze dir bewusst kein Kalorienziel und keine Crash-Diät. Zu wenig Essen bremst Energie, Laune und Muskeln. Wenn du abnehmen willst: max. 0.5 kg pro Woche, Teller-Prinzip, genug Protein. Für einen individuellen Ernährungsplan bei Krankheit oder Untergewicht geh zu einer Fachperson." },
    { k: ["einkauf", "liste"], a: "Deine Einkaufsliste findest du unter Plan → Diese Woche. Tipp: Kauf mit Liste und nie hungrig ein. 3 Abendessen planen reicht für den Anfang." },
    { k: ["frühstück", "fruehstueck", "morgen"], a: "Schnelles Frühstück mit Protein: Skyr mit Beeren und Haferflocken (3 Min.) oder 2 Eier mit Vollkornbrot (8 Min.). Hält bis zum Mittag satt." },
    { k: ["schnell", "zeit", "rezept", "abend"], a: "15-Minuten-Abendessen: Vollkornpasta, passierte Tomaten, 1 Dose Linsen und eine Handvoll Spinat. Ein Topf, doppelte Menge, morgen Mittag nochmals." },
    { k: ["süss", "suess", "schoggi", "heisshunger", "snack"], a: "Heisshunger ist normal, vor allem bei Stress oder wenig Schlaf. Plan einen Snack mit Protein ein (Joghurt, Nüsse). Und wenn es Schoggi wird: geniessen, abhaken, weiter." },
  ],
  fit: [
    { k: ["keine zeit", "zeit", "kurz", "10 min"], a: "Dann machen wir die Mini-Version: 10 Min. Zirkel aus Kniebeugen, Liegestützen an der Wand und Hip Bridges, je 40 Sek. Arbeit, 20 Sek. Pause. 10 Minuten zählen voll." },
    { k: ["muskelkater", "schmerz", "weh"], a: "Leichter Muskelkater ist ok: bewegen, Spaziergang, genug trinken. Stechende Schmerzen oder Schmerzen, die nicht weggehen: Training stoppen und ärztlich abklären lassen." },
    { k: ["gym", "fitnessstudio"], a: "Im Gym startest du mit Geräten: Beinpresse, Rudern am Kabel, Brustpresse, je 3×10. Gewicht so, dass 2 Wiederholungen Reserve bleiben. Jede Woche ein bisschen mehr." },
    { k: ["anfang", "start", "unfit", "lange nichts"], a: "Perfekt, dafür ist Phase 1 da. Wir starten mit 2–3 kurzen Einheiten pro Woche und steigern erst, wenn es sich leicht anfühlt. Technik vor Tempo." },
    { k: ["motivation", "keine lust"], a: "Deal: Zieh die Sportkleider an und mach 5 Minuten. Wenn du danach aufhören willst, darfst du. Meistens machst du weiter." },
  ],
  mind: [
    { k: ["schlaf", "einschlafen", "wach"], a: "Für besseren Schlaf: jeden Tag gleiche Aufstehzeit, 30 Min. vor dem Schlafen kein Bildschirm, Schlafzimmer kühl und dunkel. Wenn du wach liegst: nach ca. 20 Min. aufstehen, ruhig lesen, erst müde zurück ins Bett." },
    { k: ["stress", "druck", "überfordert", "ueberfordert"], a: "Kurze Übung für jetzt: 4 Sek. einatmen, 6 Sek. ausatmen, 10 Atemzüge. Danach: Schreib die 3 wichtigsten Dinge für heute auf. Alles andere darf warten." },
    { k: ["gedanken", "grübel", "gruebel", "kopf"], a: "Gedanken-Check in 3 Schritten: 1. Was ist passiert? 2. Was denke ich darüber? 3. Was würde ich einer guten Freundin dazu sagen? Gedanken sind keine Fakten." },
    { k: ["traurig", "down", "leer", "einsam"], a: "Danke, dass du das teilst. Kleine Schritte helfen: kurz raus ans Tageslicht, eine Person kontaktieren, eine kleine Aufgabe erledigen. Wenn das Gefühl über Wochen bleibt, sprich mit deiner Hausärztin oder einer Fachperson. Bei einer Krise: Tel. 143." },
    { k: ["gewohnheit", "routine"], a: "Neue Gewohnheiten klappen am besten, wenn sie klein sind und an etwas Bestehendes andocken: Nach dem ersten Kaffee mache ich 2 Minuten Atemübung." },
  ],
  life: [
    { k: ["rückschlag", "rueckschlag", "versagt", "aufgegeben", "pause"], a: "Ein Rückschlag ist Teil jedes Comebacks. Wichtig ist nur der nächste Schritt: Mach heute eine Aufgabe, die kleinste. Die Serie startet neu, dein Fortschritt bleibt." },
    { k: ["ziel", "ziele"], a: "Gute Ziele sind konkret und klein: «3× pro Woche 20 Min. Training» statt «fitter werden». Welches Ziel willst du diese Woche schaffen?" },
    { k: ["woche", "planen", "plan"], a: "Wochenplanung in 10 Min. am Sonntag: 1. Trainings in die Agenda eintragen. 2. 3 Abendessen planen. 3. Einen ruhigen Abend blocken. Fertig." },
    { k: ["motivation", "keine lust", "müde", "muede"], a: "Motivation kommt oft nach dem Start, nicht davor. Mach heute nur die kleinste Aufgabe auf deiner Liste. Gewohnheit schlägt Motivation." },
    { k: ["job", "arbeit", "trennung", "krank"], a: "Nach einer schwierigen Phase ist es klug, mit weniger zu starten. Dein Plan ist darauf ausgelegt. Wenn es eng wird: Mach den Wochen-Check-in, dann passe ich die nächste Woche an." },
  ],
};
const FALLBACK = {
  food: "Gute Frage. Mein Grundsatz: einfach, satt, ohne Verbote. Halber Teller Gemüse, ein Viertel Protein, ein Viertel Beilage. Willst du ein schnelles Rezept oder die Einkaufsliste?",
  fit: "Verstanden. Bewegung muss in deinen Alltag passen, nicht umgekehrt. Sag mir, wie viel Zeit du heute hast, dann schlage ich dir ein Training vor.",
  mind: "Danke fürs Teilen. Lass uns klein anfangen: Was beschäftigt dich gerade am meisten, Schlaf, Stress oder Gedanken?",
  life: "Klingt nach einem wichtigen Punkt. Was wäre der kleinste nächste Schritt, den du heute machen kannst?",
};
const GREETING = {
  food: "Hoi! Ich bin dein Ernährungs-Coach. Ich helfe dir mit einfachen Mahlzeiten, ohne Kalorienzählen und ohne Crash-Diäten.",
  fit: "Hoi! Ich bin dein Fitness-Coach. Wir trainieren 20–45 Minuten, zuhause, im Gym oder draussen, und steigern Schritt für Schritt.",
  mind: "Hoi! Ich bin dein Mental-Coach. Wir arbeiten an Stress, Schlaf und Gedanken, mit Methoden aus der kognitiven Verhaltenstherapie. Ich ersetze keine Therapie.",
  life: "Hoi! Ich bin dein Life-Coach. Ich halte das grosse Bild im Blick: Ziele, Wochenplanung und was du tust, wenn es mal nicht läuft.",
  team: "Hoi! Hier antwortet das ganze Team. Stell deine Frage, jeder Coach gibt dir seine Sicht.",
};
const CHIPS = {
  food: ["Schnelles Abendessen?", "Wie viele Kalorien?", "Heisshunger am Abend"],
  fit: ["Keine Zeit heute", "Ich starte bei null", "Muskelkater"],
  mind: ["Ich schlafe schlecht", "Zu viel Stress", "Grübeln stoppen"],
  life: ["Ich hatte einen Rückschlag", "Woche planen", "Keine Motivation"],
  team: ["Wie starte ich am besten?", "Ich bin müde und gestresst", "Keine Zeit"],
};

function answer(coach, text) {
  if (CRISIS_RE.test(text)) return CRISIS_ANSWER;
  const t = text.toLowerCase();
  const find = (c) => { const i = INTENTS[c].find((x) => x.k.some((k) => t.includes(k))); return i ? i.a : null; };
  if (coach === "team") {
    const lines = COACH_ORDER.map((c) => {
      const a = find(c) || {
        food: "Iss regelmässig und einfach: Protein zum Frühstück, Gemüse zum Mittag.",
        fit: "Lieber kurz und regelmässig: 20 Minuten, 2–3 Mal pro Woche.",
        mind: "Schlaf zuerst: gleiche Aufstehzeit und 30 Min. ohne Bildschirm am Abend.",
        life: "Wähl eine Sache für diese Woche und mach sie klein genug, dass sie sicher klappt.",
      }[c];
      return `${COACHES[c].icon} ${COACHES[c].short}: ${a.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".")}`;
    });
    return lines.join("\n\n");
  }
  return find(coach) || FALLBACK[coach];
}

/* ---------- Beispieldaten ---------- */
function demoState() {
  const profile = { name: "Alex", goals: ["energy", "fit", "sleep"], height: 172, weight: 78, sleep: 6, energy: 4, stress: 7, time: 30, place: "home", focus: "mind", startDate: dkey(addDays(today(), -17)), consent: true };
  const st = { v: 1, profile, plan: buildPlan(profile), days: {}, weekly: {}, chats: {}, sub: { status: "none" }, shopping: {} };
  let wgt = 78.0;
  for (let i = 17; i >= 1; i--) {
    const d = addDays(today(), -i);
    const k = dkey(d);
    const seed = (i * 7919) % 13;
    const skip = i === 9 || i === 10;
    const mood = Math.min(5, Math.max(1, 2 + Math.floor((17 - i) / 6) + (seed % 3 === 0 ? -1 : seed % 2)));
    const energy = Math.min(10, Math.max(1, 3 + Math.floor((17 - i) / 4) + (seed % 3) - 1));
    if (i % 3 === 0) wgt = +(wgt - 0.2 - (seed % 2) * 0.1).toFixed(1);
    st.days[k] = skip ? { tasks: { move: false, food: true, mind: false } } : {
      tasks: { move: seed % 4 !== 0, food: seed % 5 !== 1, mind: seed % 3 !== 2 || i < 5 },
      checkin: { mood, energy, sleep: 5.5 + ((17 - i) % 5) * 0.4, water: 4 + (seed % 4) },
      ...(i % 3 === 0 ? { weight: wgt } : {}),
    };
  }
  st.weekly[1] = { rating: 3, good: ["Training geschafft"], bad: ["Schlecht geschlafen"], note: "Erste Tage waren zäh.", nextTime: "same", adjust: { sleepFocus: true, minutesDelta: 0 }, message: "" };
  st.weekly[2] = { rating: 4, good: ["Mehr Energie", "Gesünder gegessen"], bad: ["Stress im Job"], note: "", nextTime: "same", adjust: { minutesDelta: 0 }, message: "" };
  st.chats.mind = [{ from: "coach", text: GREETING.mind }];
  return st;
}

/* ---------- Kleine UI-Bausteine ---------- */
function Icon({ name, size = 22 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    today: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    plan: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
    coach: <><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></>,
    progress: <><path d="M3 20h18" /><path d="M6 16l4-5 3 3 5-7" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7.5" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    back: <><path d="M15 5l-7 7 7 7" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    send: <><path d="M4 12l16-8-6 16-2.5-6.5z" /></>,
    chevron: <><path d="M9 6l6 6-6 6" /></>,
    shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" /></>,
    phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

function Sheet({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className={"sheet" + (wide ? " sheet-wide" : "")} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Schliessen"><Icon name="close" /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  return <button type="button" className={"chip" + (active ? " chip-on" : "")} style={color && active ? { background: color, borderColor: color } : null} onClick={onClick} aria-pressed={!!active}>{children}</button>;
}

function Scale({ id, label, value, onChange, min = 1, max = 10, lowText, highText }) {
  return (
    <div className="field">
      <div className="field-row"><label htmlFor={id}>{label}</label><span className="value">{value}</span></div>
      <input id={id} type="range" min={min} max={max} step="1" value={value} onChange={(e) => onChange(+e.target.value)} />
      <div className="scale-ends"><span>{lowText}</span><span>{highText}</span></div>
    </div>
  );
}

function CoachBadge({ id, size = 44 }) {
  return <span className={"coach-badge cb-" + id} style={{ width: size, height: size, fontSize: size * 0.48 }} aria-hidden="true">{id === "team" ? "👥" : COACHES[id].icon}</span>;
}

function LockOverlay({ onUnlock, text }) {
  return (
    <div className="lock-overlay">
      <div className="lock-card">
        <Icon name="lock" />
        <p>{text}</p>
        <button className="btn btn-primary" onClick={onUnlock}>7 Tage gratis testen</button>
      </div>
    </div>
  );
}

/* ---------- Onboarding ---------- */
function Onboarding({ onDone, onDemo }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", goals: [], height: "", weight: "", sleep: 6.5, energy: 5, stress: 5, time: 30, place: "home", focus: "life", consent: false });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggleGoal = (id) => set("goals", f.goals.includes(id) ? f.goals.filter((g) => g !== id) : f.goals.length >= 3 ? f.goals : [...f.goals, id]);
  const bmi = f.height && f.weight ? +(f.weight / Math.pow(f.height / 100, 2)).toFixed(1) : null;
  const total = 5;

  const canNext = [true, f.goals.length > 0, true, true, true, f.consent][step];

  if (step === 0) {
    return (
      <div className="onb onb-welcome">
        <div className="welcome-mark" aria-hidden="true"><span>↗</span></div>
        <p className="eyebrow">Dein Coaching-Team in der Hosentasche</p>
        <h1 className="display">Comeback</h1>
        <p className="claim">Zurück und besser als zur alten Form.</p>
        <ul className="welcome-team">
          {COACH_ORDER.map((c) => <li key={c}><CoachBadge id={c} size={40} /><span>{COACHES[c].name}</span></li>)}
        </ul>
        <p className="muted small">12 Wochen · 30–45 Min. pro Tag · Einrichtung in ca. 2 Min.</p>
        <div className="stack">
          <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>Los geht's</button>
          <button className="btn btn-ghost" onClick={onDemo}>Demo mit Beispieldaten ansehen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="onb">
      <div className="onb-top">
        <button className="icon-btn" onClick={() => setStep(step - 1)} aria-label="Zurück"><Icon name="back" /></button>
        <div className="progressbar" aria-label={`Schritt ${step} von ${total}`}><span style={{ width: `${(step / total) * 100}%` }} /></div>
        <span className="muted small tnum">{step}/{total}</span>
      </div>

      {step === 1 && (
        <section className="onb-step">
          <h1>Was willst du in 12 Wochen erreichen?</h1>
          <p className="muted">Wähl bis zu 3 Ziele.</p>
          <div className="chips">{GOALS.map((g) => <Chip key={g.id} active={f.goals.includes(g.id)} onClick={() => toggleGoal(g.id)}>{g.label}</Chip>)}</div>
          <div className="field">
            <label htmlFor="ob-name">Wie dürfen wir dich nennen? <span className="muted">(optional)</span></label>
            <input id="ob-name" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Vorname" autoComplete="given-name" />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="onb-step">
          <h1>Wo stehst du gerade?</h1>
          <p className="muted">Ehrlich ist besser als gut. Daraus entsteht dein Startpunkt.</p>
          <div className="field">
            <div className="field-row"><label htmlFor="ob-sleep">Schlaf pro Nacht</label><span className="value tnum">{f.sleep.toFixed(1)} Std.</span></div>
            <input id="ob-sleep" type="range" min="4" max="10" step="0.5" value={f.sleep} onChange={(e) => set("sleep", +e.target.value)} />
          </div>
          <Scale id="ob-energy" label="Energie" value={f.energy} onChange={(v) => set("energy", v)} lowText="leer" highText="voller Energie" />
          <Scale id="ob-stress" label="Stress" value={f.stress} onChange={(v) => set("stress", v)} lowText="entspannt" highText="am Limit" />
        </section>
      )}

      {step === 3 && (
        <section className="onb-step">
          <h1>Grösse und Gewicht</h1>
          <p className="muted">Optional. Hilft beim Verlauf in den Statistiken. Wir rechnen keine Kalorienziele.</p>
          <div className="grid2">
            <div className="field"><label htmlFor="ob-h">Grösse (cm)</label><input id="ob-h" className="input" inputMode="numeric" type="number" min="120" max="220" value={f.height} onChange={(e) => set("height", e.target.value ? +e.target.value : "")} placeholder="z.B. 170" /></div>
            <div className="field"><label htmlFor="ob-w">Gewicht (kg)</label><input id="ob-w" className="input" inputMode="decimal" type="number" min="35" max="250" step="0.1" value={f.weight} onChange={(e) => set("weight", e.target.value ? +e.target.value : "")} placeholder="z.B. 72" /></div>
          </div>
          {bmi && bmi < 18.5 && (
            <div className="note note-warn">Dein Gewicht liegt im unteren Bereich. Abnehmen ist für dich kein sinnvolles Ziel. Wir legen den Fokus auf Energie und Kraft. Bitte lass dein Gewicht ärztlich anschauen.</div>
          )}
        </section>
      )}

      {step === 4 && (
        <section className="onb-step">
          <h1>Dein Alltag</h1>
          <div className="field">
            <span className="label">Zeit pro Tag</span>
            <div className="seg">{[20, 30, 45].map((t) => <button key={t} className={"seg-btn" + (f.time === t ? " on" : "")} onClick={() => set("time", t)} aria-pressed={f.time === t}>{t} Min.</button>)}</div>
          </div>
          <div className="field">
            <span className="label">Wo trainierst du?</span>
            <div className="seg">{[["home", "Zuhause"], ["gym", "Gym"], ["outdoor", "Draussen"]].map(([v, l]) => <button key={v} className={"seg-btn" + (f.place === v ? " on" : "")} onClick={() => set("place", v)} aria-pressed={f.place === v}>{l}</button>)}</div>
          </div>
          <div className="field">
            <span className="label">Was brauchst du gerade am meisten?</span>
            <p className="muted small">Dieser Coach ist in der Gratis-Version dabei.</p>
            <div className="coach-pick">
              {COACH_ORDER.map((c) => (
                <button key={c} className={"coach-pick-btn" + (f.focus === c ? " on" : "")} onClick={() => set("focus", c)} aria-pressed={f.focus === c}>
                  <CoachBadge id={c} size={36} /><span><strong>{COACHES[c].short}</strong><small>{COACHES[c].tag}</small></span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="onb-step">
          <h1>Kurz und wichtig</h1>
          <ul className="legal-list">
            <li><Icon name="shield" size={20} /><span><strong>Coaching, keine Behandlung.</strong> Comeback ersetzt keine Ärztin, keinen Arzt und keine Psychotherapie. Wir stellen keine Diagnosen.</span></li>
            <li><Icon name="phone" size={20} /><span><strong>In einer Krise:</strong> Die Dargebotene Hand, Tel. 143. Notfall: Tel. 144.</span></li>
            <li><Icon name="lock" size={20} /><span><strong>Deine Daten bleiben auf diesem Gerät.</strong> Kein Konto, kein Server. Du kannst alles jederzeit im Profil löschen.</span></li>
            <li><Icon name="check" size={20} /><span><strong>Gesund statt extrem.</strong> Keine Crash-Diäten, kein Training trotz Schmerzen. Bei Vorerkrankungen vorher ärztlich abklären.</span></li>
          </ul>
          <label className="consent" htmlFor="ob-consent">
            <input id="ob-consent" type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
            <span>Ich habe die Hinweise gelesen und bin einverstanden, dass meine Angaben lokal auf diesem Gerät gespeichert werden.</span>
          </label>
        </section>
      )}

      <div className="onb-foot">
        {step === 3 && <button className="btn btn-ghost" onClick={() => { set("height", ""); set("weight", ""); setStep(4); }}>Überspringen</button>}
        <button className="btn btn-primary btn-lg" disabled={!canNext} onClick={() => {
          if (step < 5) setStep(step + 1);
          else onDone({ ...f, name: f.name.trim(), height: f.height || null, weight: f.weight || null, startDate: dkey(today()) });
        }}>{step < 5 ? "Weiter" : "Meinen Plan erstellen"}</button>
      </div>
    </div>
  );
}

function PlanReady({ state, onGo }) {
  const p = state.profile; const w1 = state.plan.weeks[0];
  return (
    <div className="onb onb-ready">
      <p className="eyebrow">Fertig</p>
      <h1>{p.name ? `${p.name}, dein` : "Dein"} 12-Wochen-Plan steht.</h1>
      <p className="muted">Ziele: {p.goals.map(goalLabel).join(", ")}</p>
      <ol className="phase-list">
        {PHASES.map((ph) => (
          <li key={ph.id}><span className={"phase-dot ph" + ph.id}>{ph.id}</span><div><strong>{ph.name}</strong> <span className="muted small">Woche {ph.from}–{ph.to}</span><p className="small">{ph.goal}</p></div></li>
        ))}
      </ol>
      <div className="card soft">
        <p className="small muted">Woche 1</p>
        <p><strong>{w1.sessions}× Training à {w1.minutes} Min.</strong>, dazu täglich eine Ernährungs- und eine Mental-Aufgabe.</p>
        <p className="small">Fokus: {w1.mind} · {w1.food}</p>
      </div>
      <button className="btn btn-primary btn-lg" onClick={onGo}>Zu meinem ersten Tag</button>
    </div>
  );
}

/* ---------- Heute ---------- */
function TodayScreen({ state, update, openCheckin, openWeekly, openPaywall, goCoach, isPremium }) {
  const d = today(); const k = dkey(d);
  const day = state.days[k] || { tasks: {} };
  const tasks = tasksFor(state, d);
  const w = programWeek(state);
  const ph = phaseOf(w);
  const { cur } = streakInfo(state);
  const [open, setOpen] = useState(null);
  const doneCount = tasks.filter((t) => day.tasks && day.tasks[t.id]).length;
  const h = new Date().getHours();
  const hello = h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : "Guten Abend";
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(d, i - ((d.getDay() + 6) % 7)));
  const showWeekly = (d.getDay() >= 5 || d.getDay() === 0) && !state.weekly[w];
  const tipCoach = state.profile.focus;

  const toggle = (id) => update((s) => {
    const cur = s.days[k] || { tasks: {} };
    return { ...s, days: { ...s.days, [k]: { ...cur, tasks: { ...cur.tasks, [id]: !(cur.tasks && cur.tasks[id]) } } } };
  });

  return (
    <div className="screen">
      <header className="today-head">
        <p className="muted small">{fmtDate(d)}</p>
        <h1>{hello}{state.profile.name ? `, ${state.profile.name}` : ""}</h1>
        <p className="week-pill"><span className={"phase-dot sm ph" + ph.id}>{ph.id}</span>Woche {w} von 12 · {ph.name}</p>
      </header>

      <section className="streak card">
        <div className="streak-num"><span className="tnum">{cur}</span><small>{cur === 1 ? "Tag" : "Tage"} in Serie</small></div>
        <ul className="week-dots" aria-label="Diese Woche">
          {weekDays.map((wd) => {
            const kk = dkey(wd); const ok = dayDone(state.days[kk]); const isT = kk === k; const future = wd > d;
            return <li key={kk} className={(ok ? "ok " : "") + (isT ? "is-today " : "") + (future ? "future" : "")}><span>{WD_S[wd.getDay()]}</span><i>{ok ? <Icon name="check" size={14} /> : null}</i></li>;
          })}
        </ul>
        <p className="small muted">Ein Tag zählt ab 2 von 3 erledigten Aufgaben.</p>
      </section>

      <section>
        <div className="section-head"><h2>Deine 3 Aufgaben</h2><span className="muted small tnum">{doneCount}/3</span></div>
        <ul className="tasks">
          {tasks.map((t) => {
            const done = !!(day.tasks && day.tasks[t.id]);
            return (
              <li key={t.id} className={"task" + (done ? " done" : "")}>
                <button className="task-main" onClick={() => setOpen(open === t.id ? null : t.id)} aria-expanded={open === t.id}>
                  <CoachBadge id={t.coach} size={42} />
                  <span className="task-text"><small>{COACHES[t.coach].short}</small><strong>{t.title}</strong></span>
                </button>
                <button className={"check" + (done ? " on" : "")} onClick={() => toggle(t.id)} aria-label={done ? `${t.title} als offen markieren` : `${t.title} abhaken`}><Icon name="check" size={20} /></button>
                {open === t.id && <ul className="task-detail">{t.detail.map((x, i) => <li key={i}>{x}</li>)}</ul>}
              </li>
            );
          })}
        </ul>
        {doneCount === 3 && <p className="note note-good">Alle 3 erledigt. Genau so entsteht dein Comeback.</p>}
      </section>

      <section className="card checkin-card">
        {day.checkin ? (
          <>
            <div className="section-head"><h2>Check-in erledigt</h2><button className="link" onClick={openCheckin}>Ändern</button></div>
            <div className="ci-summary">
              <span>{MOODS[day.checkin.mood - 1]} Stimmung</span><span className="tnum">⚡ {day.checkin.energy}/10</span><span className="tnum">🌙 {day.checkin.sleep} Std.</span><span className="tnum">💧 {String(+(day.checkin.water * 0.25).toFixed(2))} L</span>
            </div>
          </>
        ) : (
          <>
            <div><h2>Tages-Check-in</h2><p className="muted small">Stimmung, Energie, Schlaf, Wasser. Dauert 30 Sekunden.</p></div>
            <button className="btn btn-primary" onClick={openCheckin}>Starten</button>
          </>
        )}
      </section>

      {showWeekly && (
        <section className="card weekly-teaser">
          <CoachBadge id="life" size={40} />
          <div><h2>Wochen-Check-in</h2><p className="small muted">Was lief, was nicht? Ich passe deine nächste Woche an.</p></div>
          <button className="btn btn-secondary" onClick={() => (isPremium ? openWeekly() : openPaywall())}>{isPremium ? "Starten" : <><Icon name="lock" size={16} /> Premium</>}</button>
        </section>
      )}

      <section className="tip">
        <CoachBadge id={tipCoach} size={36} />
        <div>
          <p className="small"><strong>{COACHES[tipCoach].name}:</strong> {TIPS[tipCoach][d.getDate() % TIPS[tipCoach].length]}</p>
          <button className="link small" onClick={() => goCoach(tipCoach)}>Frage stellen</button>
        </div>
      </section>
    </div>
  );
}
const MOODS = ["😞", "😕", "😐", "🙂", "😄"];
const MOOD_LABEL = ["schwer", "eher tief", "okay", "gut", "sehr gut"];
const TIPS = {
  food: ["Protein zum Frühstück hält dich bis Mittag satt.", "Tiefkühlgemüse ist genauso gut wie frisches.", "Plane 3 Abendessen, nicht 7."],
  fit: ["10 Minuten sind besser als gar nichts.", "Steigere erst, wenn es sich leicht anfühlt.", "Technik vor Tempo, immer."],
  mind: ["Gleiche Aufstehzeit hilft dem Schlaf mehr als frühes Zubettgehen.", "Gedanken sind keine Fakten.", "4 Sek. ein, 6 Sek. aus: Das beruhigt das Nervensystem."],
  life: ["Gewohnheit schlägt Motivation.", "Ein Rückschlag ist ein Tag, keine Richtung.", "Klein starten, dranbleiben, dann steigern."],
};

function CheckinSheet({ open, onClose, state, update }) {
  const k = dkey(today());
  const existing = (state.days[k] && state.days[k].checkin) || null;
  const lastW = useMemo(() => { const ks = Object.keys(state.days).sort().reverse(); for (const x of ks) if (state.days[x].weight) return state.days[x].weight; return state.profile.weight || ""; }, [state]);
  const [c, setC] = useState(existing || { mood: 3, energy: 5, sleep: 7, water: 4 });
  const [weight, setWeight] = useState((state.days[k] && state.days[k].weight) || "");
  useEffect(() => { if (open) { setC(existing || { mood: 3, energy: 5, sleep: 7, water: 4 }); setWeight((state.days[k] && state.days[k].weight) || ""); } }, [open]);
  const drop = weight && lastW ? lastW - weight : 0;
  return (
    <Sheet open={open} onClose={onClose} title="Tages-Check-in">
      <div className="field">
        <span className="label">Wie ist deine Stimmung?</span>
        <div className="moods">{MOODS.map((m, i) => <button key={i} className={"mood" + (c.mood === i + 1 ? " on" : "")} onClick={() => setC({ ...c, mood: i + 1 })} aria-label={MOOD_LABEL[i]} aria-pressed={c.mood === i + 1}><span>{m}</span><small>{MOOD_LABEL[i]}</small></button>)}</div>
      </div>
      <Scale id="ci-energy" label="Energie" value={c.energy} onChange={(v) => setC({ ...c, energy: v })} lowText="leer" highText="top" />
      <div className="field">
        <span className="label">Schlaf letzte Nacht</span>
        <div className="stepper">
          <button className="icon-btn" onClick={() => setC({ ...c, sleep: Math.max(3, c.sleep - 0.5) })} aria-label="Weniger Schlaf">−</button>
          <span className="tnum">{c.sleep.toFixed(1)} Std.</span>
          <button className="icon-btn" onClick={() => setC({ ...c, sleep: Math.min(12, c.sleep + 0.5) })} aria-label="Mehr Schlaf">+</button>
        </div>
      </div>
      <div className="field">
        <span className="label">Wasser (1 Glas = 2.5 dl)</span>
        <div className="glasses">{Array.from({ length: 10 }, (_, i) => <button key={i} className={"glass" + (i < c.water ? " on" : "")} onClick={() => setC({ ...c, water: i + 1 === c.water ? i : i + 1 })} aria-label={`${i + 1} Gläser`}>💧</button>)}</div>
        <p className="small muted tnum">{c.water} Gläser = {(c.water * 0.25).toFixed(2)} L</p>
      </div>
      <div className="field">
        <label htmlFor="ci-weight">Gewicht <span className="muted">(optional, kg)</span></label>
        <input id="ci-weight" className="input" type="number" inputMode="decimal" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value ? +e.target.value : "")} placeholder={lastW ? `zuletzt ${lastW}` : "z.B. 72.5"} />
        {drop > 1 && <p className="note note-warn small">Mehr als 1 kg weniger seit dem letzten Eintrag. Langsam ist nachhaltiger: max. 0.5 kg pro Woche. Iss genug, besonders Protein.</p>}
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => {
        update((s) => { const cur = s.days[k] || { tasks: {} }; const nd = { ...cur, checkin: c }; if (weight) nd.weight = weight; else delete nd.weight; return { ...s, days: { ...s.days, [k]: nd } }; });
        onClose(true);
      }}>Speichern</button>
    </Sheet>
  );
}

/* ---------- Wochen-Check-in ---------- */
const GOOD = ["Training geschafft", "Besser geschlafen", "Gesünder gegessen", "Mehr Energie", "Ruhiger", "Dran geblieben"];
const BAD = ["Keine Zeit", "Schlecht geschlafen", "Stress im Job", "Motivation tief", "Krank oder verletzt", "Essen chaotisch"];

function lifeCoachAdjust(r) {
  const a = { minutesDelta: 0 }; const msg = [];
  if (r.bad.includes("Krank oder verletzt")) { a.gentle = true; msg.push("Nächste Woche ist Erholung dran: kein Training, nur sanfte Bewegung, wenn es sich gut anfühlt. Bei Schmerzen oder anhaltenden Beschwerden lass dich ärztlich beraten."); }
  if (r.bad.includes("Keine Zeit") || r.nextTime === "less") { a.minutesDelta -= 10; a.mini = true; msg.push("Ich kürze deine Trainings um 10 Minuten. Die Mini-Version zählt voll."); }
  if (r.nextTime === "more" && r.good.includes("Training geschafft") && !a.gentle) { a.minutesDelta += 5; msg.push("Du bist bereit für mehr: +5 Minuten pro Training."); }
  if (r.bad.includes("Schlecht geschlafen")) { a.sleepFocus = true; msg.push("Der Mental-Coach setzt nächste Woche den Fokus auf Schlaf."); }
  if (r.bad.includes("Motivation tief")) { a.mini = true; msg.push("Motivation tief ist normal. Mach jeden Tag nur die kleinste Aufgabe zuerst."); }
  if (r.bad.includes("Stress im Job")) msg.push("Plane 2 feste Pausen in deine Agenda, wie einen Termin.");
  if (r.bad.includes("Essen chaotisch")) msg.push("Am Sonntag 3 Abendessen planen und mit Liste einkaufen. Mehr nicht.");
  if (msg.length === 0) msg.push("Starke Woche. Wir bleiben beim Plan, das ist genau richtig so.");
  return { adjust: a, message: msg.join(" ") };
}

function WeeklySheet({ open, onClose, state, update }) {
  const w = programWeek(state);
  const [r, setR] = useState({ rating: 3, good: [], bad: [], note: "", nextTime: "same" });
  const [result, setResult] = useState(null);
  useEffect(() => { if (open) { setResult(null); setR({ rating: 3, good: [], bad: [], note: "", nextTime: "same" }); } }, [open]);
  const tog = (key, v) => setR((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((y) => y !== v) : [...x[key], v] }));
  return (
    <Sheet open={open} onClose={onClose} title={`Wochen-Check-in · Woche ${w}`}>
      {!result ? (
        <>
          <div className="field">
            <span className="label">Wie war deine Woche?</span>
            <div className="moods">{MOODS.map((m, i) => <button key={i} className={"mood" + (r.rating === i + 1 ? " on" : "")} onClick={() => setR({ ...r, rating: i + 1 })} aria-pressed={r.rating === i + 1} aria-label={MOOD_LABEL[i]}><span>{m}</span><small>{MOOD_LABEL[i]}</small></button>)}</div>
          </div>
          <div className="field"><span className="label">Was lief gut?</span><div className="chips">{GOOD.map((g) => <Chip key={g} active={r.good.includes(g)} onClick={() => tog("good", g)}>{g}</Chip>)}</div></div>
          <div className="field"><span className="label">Was lief nicht?</span><div className="chips">{BAD.map((g) => <Chip key={g} active={r.bad.includes(g)} onClick={() => tog("bad", g)}>{g}</Chip>)}</div></div>
          <div className="field"><label htmlFor="wk-note">Notiz <span className="muted">(optional)</span></label><textarea id="wk-note" className="input" rows="2" value={r.note} onChange={(e) => setR({ ...r, note: e.target.value })} placeholder="Was willst du festhalten?" /></div>
          <div className="field">
            <span className="label">Zeit nächste Woche</span>
            <div className="seg">{[["less", "Weniger"], ["same", "Gleich"], ["more", "Mehr"]].map(([v, l]) => <button key={v} className={"seg-btn" + (r.nextTime === v ? " on" : "")} onClick={() => setR({ ...r, nextTime: v })} aria-pressed={r.nextTime === v}>{l}</button>)}</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => {
            const res = lifeCoachAdjust(r);
            if (CRISIS_RE.test(r.note)) res.message = CRISIS_ANSWER;
            update((s) => ({ ...s, weekly: { ...s.weekly, [w]: { ...r, ...res } } }));
            setResult(res);
          }}>Auswerten</button>
        </>
      ) : (
        <div className="weekly-result">
          <div className="coach-msg"><CoachBadge id="life" size={44} /><div><p className="small muted">Life-Coach</p><p style={{ whiteSpace: "pre-line" }}>{result.message}</p></div></div>
          <p className="small muted">{w < 12 ? `Die Anpassung gilt für Woche ${w + 1}. Du siehst sie im Plan und bei deinen täglichen Aufgaben.` : "Das war die letzte Woche deines Programms. Stark."}</p>
          <button className="btn btn-primary btn-lg" onClick={onClose}>Verstanden</button>
        </div>
      )}
    </Sheet>
  );
}

/* ---------- Plan ---------- */
function PlanScreen({ state, update, isPremium, openPaywall, openWeekly }) {
  const [tab, setTab] = useState("weeks");
  const w = programWeek(state);
  const { weeks, milestones } = state.plan;
  return (
    <div className="screen">
      <header className="screen-head"><h1>Dein Plan</h1><p className="muted">12 Wochen, 3 Phasen. Du bist in Woche {w}.</p></header>
      <div className="phase-track" aria-label="Fortschritt im Programm">
        {PHASES.map((ph) => (
          <div key={ph.id} className={"phase-seg ph" + ph.id + (w >= ph.from ? " reached" : "")}>
            <span className="phase-bar"><i style={{ width: `${Math.max(0, Math.min(1, (w - ph.from + 1) / 4)) * 100}%` }} /></span>
            <strong>{ph.name}</strong><small className="tnum">W{ph.from}–{ph.to}</small>
          </div>
        ))}
      </div>
      <div className="seg seg-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "weeks"} className={"seg-btn" + (tab === "weeks" ? " on" : "")} onClick={() => setTab("weeks")}>12 Wochen</button>
        <button role="tab" aria-selected={tab === "food"} className={"seg-btn" + (tab === "food" ? " on" : "")} onClick={() => setTab("food")}>Menü & Einkauf</button>
      </div>

      {tab === "weeks" && (
        <>
          <section className="card weekly-teaser">
            <CoachBadge id="life" size={40} />
            <div><h2>Wochen-Check-in</h2><p className="small muted">{state.weekly[w] ? "Diese Woche erledigt. Du kannst ihn wiederholen." : "Der Life-Coach passt die nächste Woche an."}</p></div>
            <button className="btn btn-secondary" onClick={() => (isPremium ? openWeekly() : openPaywall())}>{isPremium ? (state.weekly[w] ? "Neu" : "Starten") : <><Icon name="lock" size={16} /> Premium</>}</button>
          </section>
          <div className="locked-wrap">
            <ol className="weeks">
              {weeks.map((wk) => {
                const ph = phaseOf(wk.week); const ms = milestones.filter((m) => m.w === wk.week);
                const adj = state.weekly[wk.week - 1] && state.weekly[wk.week - 1].adjust;
                const locked = !isPremium && wk.week > 1;
                const startPhase = PHASES.find((p) => p.from === wk.week);
                return (
                  <React.Fragment key={wk.week}>
                    {startPhase && <li className="phase-head"><span className={"phase-dot ph" + startPhase.id}>{startPhase.id}</span><div><strong>Phase {startPhase.id}: {startPhase.name}</strong><p className="small muted">{startPhase.goal}</p></div></li>}
                    <li className={"week" + (wk.week === w ? " current" : "") + (wk.week < w ? " past" : "") + (locked ? " is-locked" : "")}>
                      <div className="week-head"><strong>Woche {wk.week}</strong>{wk.week === w && <span className="pill">Jetzt</span>}<span className="muted small tnum">{wk.sessions}× {Math.max(10, wk.minutes + ((adj && adj.minutesDelta) || 0))} Min.</span></div>
                      <ul className="week-focus">
                        <li><CoachBadge id="fit" size={24} />{adj && adj.gentle ? "Erholung: sanfte Bewegung" : wk.fit}</li>
                        <li><CoachBadge id="food" size={24} />{wk.food}</li>
                        <li><CoachBadge id="mind" size={24} />{adj && adj.sleepFocus ? "Schlaf-Fenster festlegen" : wk.mind}</li>
                      </ul>
                      {adj && (state.weekly[wk.week - 1].message) && <p className="adj small"><strong>Angepasst vom Life-Coach:</strong> {state.weekly[wk.week - 1].message}</p>}
                      {ms.map((m) => <p key={m.t} className="milestone small">🏁 Meilenstein: {m.t}</p>)}
                    </li>
                    {!isPremium && wk.week === 1 && <li className="lock-inline"><div className="lock-card"><Icon name="lock" /><p>Woche 2–12, Meilensteine und Wochen-Check-ins sind in Premium enthalten.</p><button className="btn btn-primary" onClick={openPaywall}>7 Tage gratis testen</button></div></li>}
                  </React.Fragment>
                );
              })}
            </ol>
          </div>
        </>
      )}

      {tab === "food" && <FoodWeek state={state} update={update} />}
    </div>
  );
}

function FoodWeek({ state, update }) {
  const sh = state.shopping || {};
  const toggle = (it) => update((s) => ({ ...s, shopping: { ...(s.shopping || {}), [it]: !((s.shopping || {})[it]) } }));
  return (
    <>
      <section className="card">
        <div className="coach-msg"><CoachBadge id="food" size={40} /><p className="small">Einfach, satt, ohne Kalorienzählen. Vegetarisch? Ersetz Poulet durch Tofu oder Linsen.</p></div>
        <h2 className="mt">Abendessen diese Woche</h2>
        <ul className="menu">{MENU.map(([d, m]) => <li key={d}><span className="menu-day">{d}</span><span>{m}</span></li>)}</ul>
        <p className="small muted">Frühstück: Skyr mit Beeren und Haferflocken oder Eier mit Brot. Mittag: Reste vom Vorabend oder Kantine nach Teller-Prinzip.</p>
      </section>
      <section className="card">
        <div className="section-head"><h2>Einkaufsliste</h2><button className="link small" onClick={() => update((s) => ({ ...s, shopping: {} }))}>Zurücksetzen</button></div>
        {SHOPPING.map((grp) => (
          <div key={grp.g} className="shop-group">
            <h3>{grp.g}</h3>
            <ul>{grp.items.map((it) => (
              <li key={it}><label className={"shop-item" + (sh[it] ? " got" : "")}><input type="checkbox" checked={!!sh[it]} onChange={() => toggle(it)} /><span>{it}</span></label></li>
            ))}</ul>
          </div>
        ))}
      </section>
    </>
  );
}

/* ---------- Coaches & Chat ---------- */
function CoachesScreen({ state, isPremium, openPaywall, openChat }) {
  const free = state.profile.focus;
  const list = [...COACH_ORDER.map((id) => ({ id, ...COACHES[id] })), { id: "team", name: "Ganzes Team", tag: "Alle 4 Coaches antworten gemeinsam" }];
  return (
    <div className="screen">
      <header className="screen-head"><h1>Dein Coaching-Team</h1><p className="muted">Wähl einen Coach oder frag das ganze Team.</p></header>
      <ul className="coach-list">
        {list.map((c) => {
          const allowed = isPremium || c.id === free;
          return (
            <li key={c.id}>
              <button className="coach-row" onClick={() => (allowed ? openChat(c.id) : openPaywall())}>
                <CoachBadge id={c.id} size={52} />
                <span className="coach-row-text"><strong>{c.name}</strong><small>{c.tag}</small></span>
                {allowed ? (c.id === free && !isPremium ? <span className="pill pill-free">Gratis</span> : <Icon name="chevron" />) : <span className="pill pill-lock"><Icon name="lock" size={14} /> Premium</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="small muted">Die Coaches geben allgemeine Tipps zu Gewohnheiten. Sie stellen keine Diagnosen und ersetzen keine Fachperson.</p>
    </div>
  );
}

function ChatView({ coach, state, update, onBack }) {
  const msgs = (state.chats[coach] && state.chats[coach].length) ? state.chats[coach] : [{ from: "coach", text: GREETING[coach] }];
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ block: "end" }); }, [msgs.length, typing]);
  const send = (t) => {
    const q = (t || text).trim(); if (!q) return;
    setText("");
    update((s) => ({ ...s, chats: { ...s.chats, [coach]: [...msgs, { from: "me", text: q }] } }));
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      update((s) => ({ ...s, chats: { ...s.chats, [coach]: [...(s.chats[coach] || []), { from: "coach", text: answer(coach, q), crisis: CRISIS_RE.test(q) }] } }));
    }, 700);
  };
  const name = coach === "team" ? "Ganzes Team" : COACHES[coach].name;
  return (
    <div className="chat">
      <header className="chat-head">
        <button className="icon-btn" onClick={onBack} aria-label="Zurück"><Icon name="back" /></button>
        <CoachBadge id={coach} size={36} />
        <div><strong>{name}</strong><small className="muted">Antworten im Prototyp vordefiniert</small></div>
      </header>
      {(coach === "mind" || coach === "team") && (
        <div className="crisis-bar" role="note"><Icon name="phone" size={18} /><span>In einer Krise sofort Hilfe holen: <strong>Tel. 143</strong> (Die Dargebotene Hand) · Notfall <strong>Tel. 144</strong></span></div>
      )}
      <div className="chat-log" aria-live="polite">
        {msgs.map((m, i) => <div key={i} className={"bubble " + (m.from === "me" ? "me" : "coach") + (m.crisis ? " crisis" : "")}>{m.text}</div>)}
        {typing && <div className="bubble coach typing" aria-label="schreibt"><i /><i /><i /></div>}
        <div ref={endRef} />
      </div>
      <div className="chat-chips">{CHIPS[coach].map((c) => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}</div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label htmlFor="chat-text" className="sr">Nachricht</label>
        <input id="chat-text" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Schreib deine Frage …" autoComplete="off" />
        <button className="send" type="submit" aria-label="Senden" disabled={!text.trim()}><Icon name="send" size={20} /></button>
      </form>
    </div>
  );
}

/* ---------- Fortschritt ---------- */
function LineChart({ data, min, max, unit = "", color = "var(--accent)", height = 140, fmt = (v) => v }) {
  const W = 320, H = height, P = { l: 30, r: 12, t: 14, b: 24 };
  const pts = data.filter((d) => d.v != null);
  if (pts.length < 2) return <p className="small muted empty">Noch zu wenig Daten. Mach ein paar Check-ins, dann erscheint hier dein Verlauf.</p>;
  const x = (i) => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  let path = "", area = "", started = false, first = null, lastX = 0;
  data.forEach((d, i) => { if (d.v == null) return; const c = `${x(i).toFixed(1)},${y(d.v).toFixed(1)}`; path += (started ? " L" : "M") + c; if (!started) first = x(i); lastX = x(i); started = true; });
  area = `${path} L${lastX.toFixed(1)},${H - P.b} L${first.toFixed(1)},${H - P.b} Z`;
  const ticks = [min, (min + max) / 2, max];
  const last = pts[pts.length - 1]; const li = data.lastIndexOf(last);
  const gid = "g" + Math.random().toString(36).slice(2, 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Verlauf, zuletzt ${fmt(last.v)}${unit}`}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.22" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" /><text x={P.l - 6} y={y(t) + 4} className="axis" textAnchor="end">{fmt(t)}</text></g>)}
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(li)} cy={y(last.v)} r="4.5" fill={color} stroke="var(--surface)" strokeWidth="2" />
      <text x={P.l} y={H - 6} className="axis">{data[0].label}</text>
      <text x={W - P.r} y={H - 6} className="axis" textAnchor="end">{data[data.length - 1].label}</text>
    </svg>
  );
}

function BarChart({ data, color = "var(--c-fit)" }) {
  const W = 320, H = 130, P = { l: 22, r: 8, t: 12, b: 24 };
  const max = Math.max(4, ...data.map((d) => d.v));
  const bw = (W - P.l - P.r) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Trainings pro Woche">
      {[0, max].map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={P.t + (1 - t / max) * (H - P.t - P.b)} y2={P.t + (1 - t / max) * (H - P.t - P.b)} className="grid" /><text x={P.l - 6} y={P.t + (1 - t / max) * (H - P.t - P.b) + 4} className="axis" textAnchor="end">{t}</text></g>)}
      {data.map((d, i) => {
        const h = (d.v / max) * (H - P.t - P.b);
        return <g key={i}><rect x={P.l + i * bw + bw * 0.2} y={H - P.b - h} width={bw * 0.6} height={Math.max(h, 0)} rx="4" fill={color} opacity={d.current ? 1 : 0.6} />{d.v > 0 && <text x={P.l + i * bw + bw / 2} y={H - P.b - h - 4} className="axis" textAnchor="middle">{d.v}</text>}<text x={P.l + i * bw + bw / 2} y={H - 6} className="axis" textAnchor="middle">{d.label}</text></g>;
      })}
    </svg>
  );
}

function ProgressScreen({ state, isPremium, openPaywall, openCheckin }) {
  const { cur, best } = streakInfo(state);
  const range = 14;
  const days = Array.from({ length: range }, (_, i) => addDays(today(), i - range + 1));
  const lab = (d) => `${d.getDate()}.${d.getMonth() + 1}.`;
  const mood = days.map((d) => ({ label: lab(d), v: state.days[dkey(d)] && state.days[dkey(d)].checkin ? state.days[dkey(d)].checkin.mood : null }));
  const energy = days.map((d) => ({ label: lab(d), v: state.days[dkey(d)] && state.days[dkey(d)].checkin ? state.days[dkey(d)].checkin.energy : null }));
  const wKeys = Object.keys(state.days).filter((k) => state.days[k].weight).sort();
  const weights = wKeys.map((k) => ({ label: lab(parseKey(k)), v: state.days[k].weight }));
  if (state.profile.weight && (!wKeys.length || wKeys[0] > state.profile.startDate)) weights.unshift({ label: "Start", v: state.profile.weight });
  const wMin = weights.length ? Math.floor(Math.min(...weights.map((x) => x.v)) - 1) : 0;
  const wMax = weights.length ? Math.ceil(Math.max(...weights.map((x) => x.v)) + 1) : 1;
  const curW = programWeek(state);
  const trainings = Array.from({ length: Math.min(12, Math.max(4, curW)) }, (_, i) => {
    const wn = Math.max(1, curW - Math.min(12, Math.max(4, curW)) + 1) + i;
    let c = 0;
    for (let d = 0; d < 7; d++) { const dt = addDays(parseKey(state.profile.startDate), (wn - 1) * 7 + d); const day = state.days[dkey(dt)]; if (day && day.tasks && day.tasks.move && tasksFor(state, dt)[0].training) c++; }
    return { label: "W" + wn, v: c, current: wn === curW };
  }).filter((x) => x.label !== "W0");
  const totalDone = Object.values(state.days).reduce((a, d) => a + ["move", "food", "mind"].filter((k) => d.tasks && d.tasks[k]).length, 0);
  const avg = (arr) => { const v = arr.filter((x) => x.v != null).map((x) => x.v); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) : null; };

  return (
    <div className="screen">
      <header className="screen-head"><h1>Fortschritt</h1><p className="muted">Woche {curW} von 12</p></header>
      <section className="stats">
        <div className="stat"><span className="tnum">{cur}</span><small>Serie aktuell</small></div>
        <div className="stat"><span className="tnum">{best}</span><small>Beste Serie</small></div>
        <div className="stat"><span className="tnum">{totalDone}</span><small>Aufgaben erledigt</small></div>
      </section>
      <div className="locked-wrap">
        <div className={"charts" + (!isPremium ? " blurred" : "")} aria-hidden={!isPremium}>
          <section className="card"><div className="section-head"><h2>Stimmung</h2><span className="small muted tnum">Ø {avg(mood) ? avg(mood).toFixed(1) : "–"} / 5</span></div><LineChart data={mood} min={1} max={5} color="var(--c-mind)" fmt={(v) => Math.round(v * 10) / 10} /></section>
          <section className="card"><div className="section-head"><h2>Energie</h2><span className="small muted tnum">Ø {avg(energy) ? avg(energy).toFixed(1) : "–"} / 10</span></div><LineChart data={energy} min={0} max={10} color="var(--c-life)" /></section>
          <section className="card"><div className="section-head"><h2>Trainings pro Woche</h2><span className="small muted">Ziel {state.plan.weeks[curW - 1].sessions}×</span></div><BarChart data={trainings} /></section>
          <section className="card"><div className="section-head"><h2>Gewicht</h2>{weights.length > 0 && <span className="small muted tnum">{weights[weights.length - 1].v} kg</span>}</div>
            {weights.length >= 2 ? <LineChart data={weights} min={wMin} max={wMax} unit=" kg" color="var(--c-food)" /> : <p className="small muted empty">Trag dein Gewicht im Check-in ein, wenn du magst. Es ist optional.</p>}
            <button className="link small" onClick={openCheckin}>Gewicht eintragen</button>
          </section>
        </div>
        {!isPremium && <LockOverlay onUnlock={openPaywall} text="Diagramme zu Stimmung, Energie, Gewicht und Training sind in Premium enthalten." />}
      </div>
    </div>
  );
}

/* ---------- Profil ---------- */
function ProfileScreen({ state, update, isPremium, openPaywall, onReset, toast }) {
  const [confirm, setConfirm] = useState(false);
  const p = state.profile; const sub = state.sub || {};
  const trialLeft = sub.status === "trial" ? Math.max(0, 7 - daysBetween(parseKey(sub.since), today())) : 0;
  return (
    <div className="screen">
      <header className="screen-head"><h1>Profil</h1></header>
      <section className="card">
        <div className="profile-top"><span className="avatar">{(p.name || "?").slice(0, 1).toUpperCase()}</span><div><strong>{p.name || "Ohne Namen"}</strong><p className="small muted">Start am {fmtDate(parseKey(p.startDate))}</p></div></div>
        <dl className="kv">
          <dt>Ziele</dt><dd>{p.goals.map(goalLabel).join(", ")}</dd>
          <dt>Zeit pro Tag</dt><dd>{p.time} Min.</dd>
          <dt>Trainingsort</dt><dd>{{ home: "Zuhause", gym: "Gym", outdoor: "Draussen" }[p.place]}</dd>
          <dt>Start-Werte</dt><dd className="tnum">Schlaf {p.sleep} Std. · Energie {p.energy}/10 · Stress {p.stress}/10</dd>
          {p.height && <><dt>Grösse / Gewicht</dt><dd className="tnum">{p.height} cm · {p.weight || "–"} kg</dd></>}
          <dt>Gratis-Coach</dt><dd>{COACHES[p.focus].name}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>Abo</h2>
        {isPremium ? (
          <>
            <p><span className="pill pill-premium">Premium</span> {sub.status === "trial" ? <>Testphase, noch <strong className="tnum">{trialLeft} Tage</strong> gratis.</> : "aktiv"}</p>
            <p className="small muted">Danach {sub.plan === "year" ? "CHF 79 pro Jahr" : "CHF 9.90 pro Monat"}. Im Prototyp wird nichts verrechnet.</p>
            <button className="btn btn-ghost" onClick={() => { update((s) => ({ ...s, sub: { status: "none" } })); toast("Testphase beendet"); }}>Testphase beenden (Demo)</button>
          </>
        ) : (
          <>
            <p className="small">Du nutzt die Gratis-Version: Tages-Dashboard, Check-in und dein {COACHES[p.focus].name}.</p>
            <button className="btn btn-primary" onClick={openPaywall}>Premium 7 Tage gratis testen</button>
          </>
        )}
      </section>

      <section className="card">
        <h2>Wichtige Hinweise</h2>
        <ul className="legal-list">
          <li><Icon name="shield" size={20} /><span>Comeback ist ein Coaching-Angebot für Gewohnheiten. Es ersetzt keine Ärztin, keinen Arzt und keine Psychotherapie und stellt keine Diagnosen.</span></li>
          <li><Icon name="phone" size={20} /><span>In einer Krise: <strong>Die Dargebotene Hand, Tel. 143</strong>. Notfall: <strong>Tel. 144</strong>.</span></li>
          <li><Icon name="check" size={20} /><span>Keine Crash-Diäten, keine Kalorienziele. Bei Beschwerden, Schwangerschaft oder Vorerkrankungen vor dem Training ärztlich abklären.</span></li>
        </ul>
      </section>

      <section className="card">
        <h2>Deine Daten</h2>
        <p className="small">Alle Angaben, auch Gesundheitsdaten wie Gewicht, Schlaf und Stimmung, sind nur in diesem Browser gespeichert. Es gibt kein Konto und keinen Server.</p>
        {!confirm ? (
          <button className="btn btn-danger" onClick={() => setConfirm(true)}>Alle Daten löschen</button>
        ) : (
          <div className="confirm">
            <p><strong>Wirklich alles löschen?</strong> Plan, Check-ins, Chats und Profil werden entfernt. Das lässt sich nicht rückgängig machen.</p>
            <div className="row"><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button><button className="btn btn-danger" onClick={onReset}>Ja, alles löschen</button></div>
          </div>
        )}
      </section>
      <p className="small muted center">Comeback · Prototyp v0.1 · Arbeitstitel</p>
    </div>
  );
}

/* ---------- Paywall ---------- */
function Paywall({ open, onClose, onStart }) {
  const [plan, setPlan] = useState("year");
  return (
    <Sheet open={open} onClose={onClose} title="Comeback Premium">
      <p className="pw-lead">Dein ganzes Coaching-Team und der volle 12-Wochen-Plan.</p>
      <table className="pw-table">
        <thead><tr><th scope="col"></th><th scope="col">Gratis</th><th scope="col">Premium</th></tr></thead>
        <tbody>
          {[["Onboarding & Tages-Dashboard", 1, 1], ["Tages-Check-in", 1, 1], ["Coaches", "1", "alle 4 + Team"], ["12-Wochen-Plan & Meilensteine", 0, 1], ["Wochen-Check-in mit Anpassung", 0, 1], ["Statistiken & Diagramme", 0, 1]].map(([l, a, b]) => (
            <tr key={l}><th scope="row">{l}</th><td>{a === 1 ? "✓" : a === 0 ? "–" : a}</td><td><strong>{b === 1 ? "✓" : b}</strong></td></tr>
          ))}
        </tbody>
      </table>
      <div className="plans">
        <button className={"plan" + (plan === "year" ? " on" : "")} onClick={() => setPlan("year")} aria-pressed={plan === "year"}>
          <span className="pill pill-save">−33 %</span><strong>Jährlich</strong><span className="price tnum">CHF 79</span><small className="tnum">= CHF 6.58 pro Monat</small>
        </button>
        <button className={"plan" + (plan === "month" ? " on" : "")} onClick={() => setPlan("month")} aria-pressed={plan === "month"}>
          <strong>Monatlich</strong><span className="price tnum">CHF 9.90</span><small>monatlich kündbar</small>
        </button>
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => onStart(plan)}>7 Tage gratis testen</button>
      <p className="small muted center">Prototyp: Es wird keine Zahlung ausgelöst. In der echten App: Erinnerung 2 Tage vor Ende der Testphase, jederzeit kündbar.</p>
    </Sheet>
  );
}

/* ---------- App ---------- */
function App() {
  const [state, setState] = useState(() => loadState());
  const [tab, setTab] = useState("today");
  const [chat, setChat] = useState(null);
  const [sheet, setSheet] = useState(null); // checkin | weekly | paywall
  const [justOnboarded, setJustOnboarded] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => { if (state) saveState(state); }, [state]);
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(null), 2400); return () => clearTimeout(t); }, [toastMsg]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab, chat]);

  const update = (fn) => setState((s) => fn(s));
  const toast = (m) => setToastMsg(m);

  if (!state || !state.profile) {
    return (
      <div className="app">
        <Onboarding
          onDone={(f) => { const profile = { ...f }; setState({ v: 1, profile, plan: buildPlan(profile), days: {}, weekly: {}, chats: {}, sub: { status: "none" }, shopping: {} }); setJustOnboarded(true); }}
          onDemo={() => { setState(demoState()); setTab("today"); setToastMsg("Beispieldaten geladen"); }}
        />
      </div>
    );
  }
  if (justOnboarded) return <div className="app"><PlanReady state={state} onGo={() => setJustOnboarded(false)} /></div>;

  const isPremium = state.sub && state.sub.status === "trial" && daysBetween(parseKey(state.sub.since), today()) < 7 || (state.sub && state.sub.status === "active");
  const openPaywall = () => setSheet("paywall");
  const openChat = (id) => { setChat(id); setTab("coaches"); };

  const NAV = [["today", "Heute", "today"], ["plan", "Plan", "plan"], ["coaches", "Coaches", "coach"], ["progress", "Fortschritt", "progress"], ["profile", "Profil", "profile"]];

  return (
    <div className="app">
      <main className={"main" + (chat ? " main-chat" : "")}>
        {chat ? <ChatView coach={chat} state={state} update={update} onBack={() => setChat(null)} /> : (
          <>
            {tab === "today" && <TodayScreen state={state} update={update} isPremium={isPremium} openCheckin={() => setSheet("checkin")} openWeekly={() => setSheet("weekly")} openPaywall={openPaywall} goCoach={(id) => (isPremium || id === state.profile.focus ? openChat(id) : openPaywall())} />}
            {tab === "plan" && <PlanScreen state={state} update={update} isPremium={isPremium} openPaywall={openPaywall} openWeekly={() => setSheet("weekly")} />}
            {tab === "coaches" && <CoachesScreen state={state} isPremium={isPremium} openPaywall={openPaywall} openChat={openChat} />}
            {tab === "progress" && <ProgressScreen state={state} isPremium={isPremium} openPaywall={openPaywall} openCheckin={() => setSheet("checkin")} />}
            {tab === "profile" && <ProfileScreen state={state} update={update} isPremium={isPremium} openPaywall={openPaywall} toast={toast} onReset={() => { clearState(); setState(null); setTab("today"); setChat(null); }} />}
          </>
        )}
      </main>

      <nav className="tabbar" aria-label="Hauptnavigation">
        {NAV.map(([id, label, icon]) => (
          <button key={id} className={"tab" + (tab === id ? " on" : "")} onClick={() => { setTab(id); setChat(null); }} aria-current={tab === id ? "page" : undefined}>
            <Icon name={icon} /><span>{label}</span>
          </button>
        ))}
      </nav>

      <CheckinSheet open={sheet === "checkin"} state={state} update={update} onClose={(saved) => { setSheet(null); if (saved === true) toast("Check-in gespeichert"); }} />
      <WeeklySheet open={sheet === "weekly"} state={state} update={update} onClose={() => setSheet(null)} />
      <Paywall open={sheet === "paywall"} onClose={() => setSheet(null)} onStart={(plan) => { update((s) => ({ ...s, sub: { status: "trial", plan, since: dkey(today()) } })); setSheet(null); toast("Premium-Test aktiv: 7 Tage gratis"); }} />
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
