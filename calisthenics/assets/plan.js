/* =========================================================================
   plan.js – Trainingsplan-Generator
   12 Wochen, 3 Blöcke à 4 Wochen. Woche 4, 8 und 12 sind Entlastungswochen
   (Deload): weniger Volumen, damit sich der Körper anpassen kann.
   Progression läuft über Wiederholungen; ist die Obergrenze erreicht,
   wechselt die Übung auf die nächste Stufe der Progressionskette.
   ========================================================================= */

const PLAN_WEEKS = 12;

function pickExercise(pool, level, equipment) {
  // Kandidaten ab dem Wunschlevel abwärts prüfen, bis die Ausrüstung passt.
  const order = [];
  for (let l = level; l >= 1; l--) order.push(pool[l - 1]);
  for (let l = level + 1; l <= 5; l++) order.push(pool[l - 1]);

  for (const id of order) {
    const ex = EX_BY_ID[id];
    if (!ex) continue;
    if (hasEquipment(ex, equipment)) return ex;
  }
  return EX_BY_ID[pool[0]];
}

function hasEquipment(ex, equipment) {
  const need = (ex.equip || 'keine').toLowerCase();
  if (need === 'keine' || need === 'wand') return true;
  if (need.includes('stange')) return equipment.includes('bar');
  if (need.includes('barren')) return equipment.includes('dip');
  if (need.includes('ringe')) return equipment.includes('rings');
  if (need.includes('stuhl') || need.includes('tisch') || need.includes('bank') ||
      need.includes('erhöhung') || need.includes('stufe') || need.includes('fixierung')) {
    return equipment.includes('chair');
  }
  return true;
}

/* Wiederholungszahl für Woche w innerhalb des 4-Wochen-Blocks. */
function repsForWeek(goal, week, level) {
  const [lo, hi] = GOALS[goal].reps;
  const inBlock = ((week - 1) % 4) + 1;      // 1..4
  const block = Math.floor((week - 1) / 4);  // 0,1,2
  if (inBlock === 4) return Math.max(lo, Math.round(lo + (hi - lo) * 0.25)); // Deload
  const step = (hi - lo) / 3;
  const base = lo + step * (inBlock - 1) + block * step * 0.5;
  return Math.max(1, Math.round(Math.min(base, hi + block)));
}

function setsForWeek(goal, week) {
  const [lo, hi] = GOALS[goal].sets;
  const inBlock = ((week - 1) % 4) + 1;
  if (inBlock === 4) return lo;              // Deload: minimales Volumen
  return inBlock >= 3 ? hi : lo;
}

/* Zeitbasierte Übungen bekommen Sekunden statt Wiederholungen. */
function secondsFor(ex, reps, level) {
  const base = ex.cat === 'skill' ? 8 : 20;
  return Math.round(base + reps * 1.5 + level * 2);
}

function buildPlan(profile) {
  const { level, goal, days, equipment } = profile;
  const template = WEEK_TEMPLATES[days] || WEEK_TEMPLATES[3];
  const rest = GOALS[goal].rest;

  const weeks = [];
  for (let w = 1; w <= PLAN_WEEKS; w++) {
    const isDeload = w % 4 === 0;
    // Alle 4 Wochen eine Stufe schwerer, aber nie über Level 5.
    const levelNow = Math.min(5, level + Math.floor((w - 1) / 4));
    const reps = repsForWeek(goal, w, levelNow);
    const sets = setsForWeek(goal, w);

    const dayList = template.map((splitKey, idx) => {
      const split = SPLITS[splitKey];
      const blocks = split.slots.map((slot, si) => {
        const ex = pickExercise(SLOT_POOLS[slot], levelNow, equipment);
        const unit = ex.type === 'time' ? 'time' : (ex.type === 'each' ? 'each' : 'reps');
        // Rumpf- und Skill-Übungen mit weniger Pause und etwas mehr Volumen.
        const soft = ex.cat === 'core' || ex.cat === 'skill';
        return {
          exId: ex.id,
          name: ex.name,
          unit,
          sets: soft ? Math.max(3, sets - 1) : sets,
          target: unit === 'time' ? secondsFor(ex, reps, levelNow)
                                  : Math.max(3, reps + (soft ? 3 : 0)),
          restSec: soft ? Math.round(rest * 0.6) : rest,
          order: si
        };
      });
      return {
        key: `w${w}d${idx + 1}`,
        splitKey,
        name: split.name,
        week: w,
        index: idx + 1,
        deload: isDeload,
        warmup: warmupFor(splitKey),
        blocks,
        cooldown: ['chest_stretch', 'ham_stretch', 'hipflex_stretch', 'childs_pose']
      };
    });

    weeks.push({ week: w, deload: isDeload, level: levelNow, days: dayList });
  }

  return {
    createdAt: new Date().toISOString(),
    profile: structuredClone(profile),
    weeks
  };
}

function warmupFor(splitKey) {
  const base = ['jumping_jacks', 'cat_cow'];
  if (['push', 'upper', 'fullbody_a', 'fullbody_b', 'fullbody_c', 'skillday'].includes(splitKey)) {
    return [...base, 'arm_circles', 'wrist_prep'];
  }
  if (['pull'].includes(splitKey)) return [...base, 'arm_circles', 'scap_pull'];
  return [...base, 'leg_swings', 'hip_opener'];
}

/* Nächster offener Trainingstag: der erste, für den es noch kein Log gibt. */
function nextDay(plan, logs) {
  const done = new Set(logs.map(l => l.dayKey));
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (!done.has(day.key)) return day;
    }
  }
  return plan.weeks[0].days[0]; // Plan durch – von vorn mit höherem Level
}

function findDay(plan, key) {
  for (const week of plan.weeks) {
    const d = week.days.find(x => x.key === key);
    if (d) return d;
  }
  return null;
}
