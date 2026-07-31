/* =========================================================================
   app.js – Views, Router, Trainings-Player
   ========================================================================= */

const App = {
  view: 'home',
  session: null,
  timer: null,

  init() {
    Store.load();
    this.root = document.getElementById('root');
    this.tabbar = document.getElementById('tabbar');
    this.modalBg = document.getElementById('modal-bg');
    this.modal = document.getElementById('modal');

    document.addEventListener('click', e => this.onClick(e));
    document.addEventListener('change', e => this.onChange(e));
    this.modalBg.addEventListener('click', e => {
      if (e.target === this.modalBg) this.closeModal();
    });

    if (!Store.state.profile || !Store.state.plan) this.view = 'onboarding';
    this.render();
  },

  go(view) {
    if (this.session && view !== 'workout') {
      if (!confirm('Training abbrechen? Der aktuelle Fortschritt geht verloren.')) return;
      this.stopTimer();
      this.session = null;
    }
    this.view = view;
    window.scrollTo(0, 0);
    this.render();
  },

  render() {
    const views = {
      onboarding: renderOnboarding,
      home: renderHome,
      plan: renderPlan,
      library: renderLibrary,
      progress: renderProgress,
      workout: renderWorkout
    };
    this.root.innerHTML = (views[this.view] || renderHome)();
    const showTabs = !['onboarding', 'workout'].includes(this.view);
    this.tabbar.classList.toggle('hidden', !showTabs);
    document.body.style.paddingBottom = showTabs ? '' : '20px';
    [...this.tabbar.querySelectorAll('button')].forEach(b => {
      if (b.dataset.go === this.view) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  },

  /* ------------------------------------------------------------- Ereignisse */
  onClick(e) {
    const el = e.target.closest('[data-action], [data-go]');
    if (!el) return;
    if (el.dataset.go) { this.go(el.dataset.go); return; }
    const fn = Actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  },

  onChange(e) {
    const el = e.target.closest('[data-change]');
    if (!el) return;
    const fn = Actions[el.dataset.change];
    if (fn) fn(el, e);
  },

  /* ----------------------------------------------------------------- Modal */
  openModal(html) {
    this.modal.innerHTML = '<div class="handle"></div>' + html;
    this.modalBg.hidden = false;
  },
  closeModal() { this.modalBg.hidden = true; this.modal.innerHTML = ''; },

  /* ----------------------------------------------------------------- Timer */
  startTimer(seconds, onTick, onDone) {
    this.stopTimer();
    const end = Date.now() + seconds * 1000;
    const total = seconds;
    let lastWhole = Math.ceil(seconds);
    const tick = () => {
      const left = Math.max(0, (end - Date.now()) / 1000);
      onTick(left, total);
      const whole = Math.ceil(left);
      // Countdown-Ton bei 3, 2, 1 – genau einmal pro Sekunde.
      if (whole < lastWhole) {
        if (whole > 0 && whole <= 3) beep(1);
        lastWhole = whole;
      }
      if (left <= 0) { this.stopTimer(); beep(2); onDone && onDone(); }
    };
    tick();
    this.timer = setInterval(tick, 200);
  },
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
};

/* =========================================================================
   Aktionen
   ========================================================================= */
const Actions = {
  /* ------------------------------------------------------------ Onboarding */
  toggleChip(el) {
    const on = el.getAttribute('aria-pressed') === 'true';
    if (el.dataset.single === 'true') {
      el.parentElement.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      el.setAttribute('aria-pressed', 'true');
    } else {
      el.setAttribute('aria-pressed', String(!on));
    }
  },

  createPlan() {
    const pick = name => {
      const el = document.querySelector(`[data-group="${name}"] .chip[aria-pressed="true"]`);
      return el ? el.dataset.value : null;
    };
    const level = Number(pick('level') || 1);
    const goal = pick('goal') || 'muscle';
    const days = Number(pick('days') || 3);
    const equipment = [...document.querySelectorAll('[data-group="equip"] .chip[aria-pressed="true"]')]
      .map(c => c.dataset.value);

    const profile = { level, goal, days, equipment, createdAt: new Date().toISOString() };
    Store.state.profile = profile;
    Store.state.plan = buildPlan(profile);
    Store.save();
    App.go('home');
  },

  regeneratePlan() {
    if (!confirm('Neuen Plan erstellen? Deine erledigten Trainings und Bestwerte bleiben erhalten.')) return;
    App.closeModal();
    App.view = 'onboarding';
    App.render();
  },

  /* --------------------------------------------------------------- Training */
  startDay(el) {
    const key = el.dataset.key;
    const day = key ? findDay(Store.state.plan, key) : nextDay(Store.state.plan, Store.state.logs);
    if (!day) return;
    App.session = {
      day,
      startedAt: Date.now(),
      stage: 'warmup',
      blockIdx: 0,
      setIdx: 0,
      resting: false,
      restLeft: 0,
      blocks: day.blocks.map(b => ({ ...b, results: [], done: false }))
    };
    App.view = 'workout';
    window.scrollTo(0, 0);
    App.render();
  },

  warmupDone() {
    App.session.stage = 'work';
    App.render();
  },

  /* Satz abschliessen: Ergebnis erfassen und Pause starten. */
  finishSet() {
    const s = App.session;
    const block = s.blocks[s.blockIdx];
    const input = document.getElementById('set-input');
    const value = input ? Number(input.value) : block.target;
    block.results.push(Number.isFinite(value) && value >= 0 ? value : block.target);

    if (block.results.length >= block.sets) {
      block.done = true;
      if (s.blockIdx >= s.blocks.length - 1) { s.stage = 'cooldown'; App.stopTimer(); App.render(); return; }
      s.blockIdx++; s.setIdx = 0;
    } else {
      s.setIdx++;
    }
    startRest();
  },

  skipRest() { App.stopTimer(); App.session.resting = false; App.render(); },

  addRest() {
    const s = App.session;
    s.restLeft += 20;
    startRest(s.restLeft);
  },

  /* Zeitbasierte Übung: Countdown starten. */
  startHold() {
    const s = App.session;
    const block = s.blocks[s.blockIdx];
    s.holding = true;
    App.render();
    App.startTimer(block.target,
      (left, total) => paintRing(left, total, formatTime(left)),
      () => { s.holding = false; Actions.finishSet(); });
  },

  stopHold() {
    App.stopTimer();
    App.session.holding = false;
    App.render();
  },

  skipExercise() {
    const s = App.session;
    const block = s.blocks[s.blockIdx];
    block.done = block.results.length > 0;
    if (s.blockIdx >= s.blocks.length - 1) { s.stage = 'cooldown'; App.stopTimer(); App.render(); return; }
    s.blockIdx++; s.setIdx = 0;
    App.stopTimer(); s.resting = false;
    App.render();
  },

  finishWorkout() {
    const s = App.session;
    const durationSec = Math.round((Date.now() - s.startedAt) / 1000);
    Store.addLog({
      id: 'log_' + Date.now(),
      date: new Date().toISOString(),
      dayKey: s.day.key,
      dayName: s.day.name,
      week: s.day.week,
      durationSec,
      blocks: s.blocks.map(b => ({ exId: b.exId, name: b.name, unit: b.unit, sets: b.sets, target: b.target, results: b.results, done: b.done }))
    });
    App.stopTimer();
    const summary = summaryHTML(s, durationSec);
    App.session = null;
    App.view = 'home';
    App.render();
    App.openModal(summary);
  },

  abortWorkout() {
    if (!confirm('Training wirklich abbrechen? Es wird nicht gespeichert.')) return;
    App.stopTimer();
    App.session = null;
    App.go('home');
  },

  /* ------------------------------------------------------------- Bibliothek */
  showExercise(el) {
    const ex = EX_BY_ID[el.dataset.ex];
    if (!ex) return;
    App.openModal(exerciseDetailHTML(ex));
  },

  swapExercise(el) {
    const dir = el.dataset.dir;
    const s = App.session;
    const block = s.blocks[s.blockIdx];
    const cur = EX_BY_ID[block.exId];
    const nextId = dir === 'easier' ? cur.easier : cur.harder;
    if (!nextId || !EX_BY_ID[nextId]) return;
    const nx = EX_BY_ID[nextId];
    block.exId = nx.id;
    block.name = nx.name;
    block.unit = nx.type === 'time' ? 'time' : (nx.type === 'each' ? 'each' : 'reps');
    if (block.unit === 'time' && block.target > 120) block.target = 45;
    App.render();
  },

  filterLibrary(el) {
    el.parentElement.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    el.setAttribute('aria-pressed', 'true');
    const cat = el.dataset.value;
    document.querySelectorAll('[data-exrow]').forEach(row => {
      row.classList.toggle('hidden', cat !== 'all' && row.dataset.cat !== cat);
    });
  },

  searchLibrary(el) {
    const q = el.value.trim().toLowerCase();
    document.querySelectorAll('[data-exrow]').forEach(row => {
      row.classList.toggle('hidden', q && !row.dataset.name.includes(q));
    });
  },

  /* ------------------------------------------------------------ Einstellungen */
  openSettings() { App.openModal(settingsHTML()); },

  toggleSetting(el) {
    Store.state.settings[el.dataset.key] = el.checked;
    Store.save();
  },

  exportData() {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calisthenics-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },

  importData() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = () => {
      const file = inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { Store.importJSON(reader.result); App.closeModal(); App.go('home'); alert('Daten importiert.'); }
        catch (err) { alert('Datei konnte nicht gelesen werden: ' + err.message); }
      };
      reader.readAsText(file);
    };
    inp.click();
  },

  resetAll() {
    if (!confirm('Wirklich alles löschen? Plan, Trainings und Bestwerte sind danach weg.')) return;
    Store.reset();
    App.closeModal();
    App.view = 'onboarding';
    App.render();
  },

  closeModal() { App.closeModal(); }
};

/* =========================================================================
   Pause / Ring
   ========================================================================= */
function startRest(seconds) {
  const s = App.session;
  const block = s.blocks[Math.min(s.blockIdx, s.blocks.length - 1)];
  const dur = seconds || block.restSec;
  s.resting = true;
  s.restLeft = dur;
  App.render();
  App.startTimer(dur,
    (left, total) => { s.restLeft = left; paintRing(left, total, formatTime(left)); },
    () => { s.resting = false; App.render(); });
}

function paintRing(left, total, label) {
  const prog = document.querySelector('.ring .prog');
  const txt = document.querySelector('.ring .t');
  if (!prog || !txt) return;
  const r = Number(prog.getAttribute('r'));
  const c = 2 * Math.PI * r;
  prog.setAttribute('stroke-dasharray', c.toFixed(1));
  prog.setAttribute('stroke-dashoffset', (c * (1 - left / total)).toFixed(1));
  txt.textContent = label;
}

let audioCtx = null;
function beep(times = 1) {
  if (!Store.state.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const t = audioCtx.currentTime + i * 0.18;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(times > 1 ? 880 : 660, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.16);
    }
  } catch (_) { /* Ton ist optional */ }
  if (Store.state.settings.vibrate && navigator.vibrate) navigator.vibrate(times > 1 ? [90, 60, 90] : 45);
}

/* =========================================================================
   Views
   ========================================================================= */
function renderOnboarding() {
  const p = Store.state.profile || {};
  const chip = (group, value, label, on, single = true) =>
    `<button class="chip" data-action="toggleChip" data-single="${single}" data-value="${value}" aria-pressed="${on}">${label}</button>`;

  return `
  <div class="topbar"><div>
    <h1>Dein Plan</h1>
    <div class="sub">Vier Fragen, dann steht dein 12-Wochen-Programm.</div>
  </div></div>

  <div class="card">
    <label>Wie fit bist du gerade?</label>
    <div class="row wrap mt" data-group="level" style="gap:8px">
      ${chip('level', 1, 'Einsteiger', !p.level || p.level === 1)}
      ${chip('level', 2, 'Grundlagen da', p.level === 2)}
      ${chip('level', 3, 'Fortgeschritten', p.level === 3)}
      ${chip('level', 4, 'Erfahren', p.level === 4)}
      ${chip('level', 5, 'Sehr stark', p.level === 5)}
    </div>
    <div class="hint mt">Ehrlich einschätzen: Wer 8 saubere Klimmzüge und 20 Liegestütze schafft, ist Stufe 3.</div>
  </div>

  <div class="card">
    <label>Was ist dein Ziel?</label>
    <div class="row wrap mt" data-group="goal" style="gap:8px">
      ${chip('goal', 'muscle', 'Muskelaufbau', !p.goal || p.goal === 'muscle')}
      ${chip('goal', 'strength', 'Maximalkraft', p.goal === 'strength')}
      ${chip('goal', 'endurance', 'Kraftausdauer', p.goal === 'endurance')}
      ${chip('goal', 'skills', 'Skills & Technik', p.goal === 'skills')}
    </div>
  </div>

  <div class="card">
    <label>Wie viele Tage pro Woche?</label>
    <div class="row wrap mt" data-group="days" style="gap:8px">
      ${[2, 3, 4, 5, 6].map(d => chip('days', d, `${d} Tage`, (p.days || 3) === d)).join('')}
    </div>
    <div class="hint mt">3 Tage sind für die meisten der beste Kompromiss aus Reiz und Erholung.</div>
  </div>

  <div class="card">
    <label>Was steht dir zur Verfügung? (Mehrfachauswahl)</label>
    <div class="row wrap mt" data-group="equip" style="gap:8px">
      ${chip('equip', 'chair', 'Stuhl / Tisch', !p.equipment || p.equipment.includes('chair'), false)}
      ${chip('equip', 'bar', 'Klimmzugstange', p.equipment ? p.equipment.includes('bar') : false, false)}
      ${chip('equip', 'dip', 'Barren / Dip-Station', p.equipment ? p.equipment.includes('dip') : false, false)}
      ${chip('equip', 'rings', 'Turnringe', p.equipment ? p.equipment.includes('rings') : false, false)}
    </div>
    <div class="hint mt">Ohne Auswahl bekommst du einen Plan, der komplett ohne Geräte funktioniert.</div>
  </div>

  <button class="btn-primary btn-block btn-lg" data-action="createPlan">Plan erstellen</button>
  <div class="hint center mt">Alles läuft lokal auf deinem Gerät. Kein Konto, keine Zahlung, keine Daten nach draussen.</div>
  `;
}

function renderHome() {
  const st = Store.stats();
  const plan = Store.state.plan;
  const day = nextDay(plan, Store.state.logs);
  const weekLogs = Store.state.logs.filter(l => l.week === day.week).length;
  const goalName = GOALS[Store.state.profile.goal].name;

  return `
  <div class="topbar">
    <div>
      <h1>Hey!</h1>
      <div class="sub">${goalName} · ${Store.state.profile.days}× pro Woche</div>
    </div>
    <button class="btn-ghost btn-sm" data-action="openSettings" aria-label="Einstellungen">⚙︎</button>
  </div>

  <div class="grid-3">
    <div class="stat"><div class="v">${st.total}</div><div class="l">Trainings</div></div>
    <div class="stat"><div class="v">${st.streak}</div><div class="l">Serie</div></div>
    <div class="stat"><div class="v">${st.minutes}</div><div class="l">Minuten</div></div>
  </div>

  <div class="card accent mt">
    <div class="row between">
      <div>
        <div class="badge green">Woche ${day.week} · Tag ${day.index}</div>
        ${day.deload ? '<span class="badge warn" style="margin-left:6px">Entlastung</span>' : ''}
        <h2 style="margin-top:8px">${day.name}</h2>
        <small>${day.blocks.length} Übungen · ca. ${estimateMinutes(day)} Min</small>
      </div>
    </div>
    <div class="sep"></div>
    ${day.blocks.map((b, i) => `
      <div class="exline">
        <div class="num">${i + 1}</div>
        <div class="grow">
          <div class="nm">${b.name}</div>
          <div class="mt">${b.sets} × ${targetLabel(b)} · ${b.restSec}s Pause</div>
        </div>
        <button class="btn-ghost btn-sm" data-action="showExercise" data-ex="${b.exId}">Info</button>
      </div>`).join('')}
    <button class="btn-primary btn-block btn-lg mt" data-action="startDay" data-key="${day.key}">Training starten</button>
  </div>

  <div class="card tight">
    <div class="row between">
      <div><strong>Woche ${day.week}</strong><br><small>${weekLogs} von ${Store.state.profile.days} Einheiten erledigt</small></div>
      <div style="width:120px"><div class="bar"><i style="width:${Math.min(100, weekLogs / Store.state.profile.days * 100)}%"></i></div></div>
    </div>
  </div>

  ${Store.state.logs.length ? `
  <h3 class="mt" style="margin-bottom:8px">Zuletzt trainiert</h3>
  ${Store.state.logs.slice(0, 3).map(l => `
    <div class="card tight">
      <div class="row between">
        <div><strong>${l.dayName}</strong><br><small>${formatDate(l.date)} · ${Math.round(l.durationSec / 60)} Min</small></div>
        <span class="badge green">Woche ${l.week}</span>
      </div>
    </div>`).join('')}` : `
  <div class="card center">
    <p>Noch kein Training aufgezeichnet. Der erste Satz ist der wichtigste.</p>
  </div>`}
  `;
}

function renderPlan() {
  const plan = Store.state.plan;
  const done = new Set(Store.state.logs.map(l => l.dayKey));
  return `
  <div class="topbar">
    <div><h1>12-Wochen-Plan</h1><div class="sub">Stufe ${LEVELS[plan.profile.level]} · ${GOALS[plan.profile.goal].name}</div></div>
    <button class="btn-ghost btn-sm" data-action="openSettings">⚙︎</button>
  </div>

  ${plan.weeks.map(w => `
    <details ${w.days.some(d => !done.has(d.key)) && w.days.some(d => done.has(d.key)) ? 'open' : ''}>
      <summary>
        Woche ${w.week}
        ${w.deload ? '<span class="badge warn" style="margin-left:8px">Entlastung</span>' : ''}
        <span class="badge" style="margin-left:8px">${w.days.filter(d => done.has(d.key)).length}/${w.days.length}</span>
      </summary>
      <div class="body">
        ${w.days.map(d => `
          <div class="exline ${done.has(d.key) ? 'done' : ''}">
            <div class="num">${done.has(d.key) ? '✓' : d.index}</div>
            <div class="grow">
              <div class="nm">${d.name}</div>
              <div class="mt">${d.blocks.map(b => b.name).join(' · ')}</div>
            </div>
            <button class="btn-sm" data-action="startDay" data-key="${d.key}">Start</button>
          </div>`).join('')}
      </div>
    </details>`).join('')}
  `;
}

function renderLibrary() {
  const cats = [
    ['all', 'Alle'], ['push', 'Drücken'], ['pull', 'Ziehen'], ['legs', 'Beine'],
    ['core', 'Rumpf'], ['skill', 'Skills'], ['warmup', 'Aufwärmen'], ['cooldown', 'Dehnen']
  ];
  return `
  <div class="topbar"><div><h1>Übungen</h1><div class="sub">${EXERCISES.length} Übungen mit Technik-Hinweisen</div></div></div>

  <input type="text" placeholder="Übung suchen…" data-change="searchLibrary"
         oninput="Actions.searchLibrary(this)" aria-label="Übung suchen">

  <div class="row wrap mt" style="gap:8px">
    ${cats.map(([v, l]) => `<button class="chip" data-action="filterLibrary" data-value="${v}" aria-pressed="${v === 'all'}">${l}</button>`).join('')}
  </div>

  <div class="mt">
    ${EXERCISES.map(ex => `
      <div class="card tight" data-exrow data-cat="${ex.cat}" data-name="${ex.name.toLowerCase()}">
        <div class="row between">
          <div class="grow">
            <div class="nm" style="font-weight:600">${ex.name}</div>
            <small>${'●'.repeat(ex.level)}${'○'.repeat(5 - ex.level)} · ${ex.muscles.join(', ')} · ${ex.equip}</small>
          </div>
          <button class="btn-sm" data-action="showExercise" data-ex="${ex.id}">Details</button>
        </div>
      </div>`).join('')}
  </div>
  `;
}

function renderProgress() {
  const st = Store.stats();
  const records = Object.entries(Store.state.records)
    .map(([id, r]) => ({ ...r, ex: EX_BY_ID[id] }))
    .filter(r => r.ex)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return `
  <div class="topbar"><div><h1>Fortschritt</h1><div class="sub">Alles lokal gespeichert</div></div>
    <button class="btn-ghost btn-sm" data-action="openSettings">⚙︎</button></div>

  <div class="grid-2">
    <div class="stat"><div class="v">${st.total}</div><div class="l">Trainings gesamt</div></div>
    <div class="stat"><div class="v">${st.thisWeek}</div><div class="l">Diese Woche</div></div>
    <div class="stat"><div class="v">${st.reps}</div><div class="l">Wiederholungen</div></div>
    <div class="stat"><div class="v">${Math.round(st.seconds / 60)}</div><div class="l">Minuten gehalten</div></div>
  </div>

  <h3 class="mt" style="margin-bottom:8px">Bestwerte</h3>
  ${records.length ? records.map(r => `
    <div class="card tight">
      <div class="row between">
        <div><strong>${r.ex.name}</strong><br><small>${formatDate(r.date)}</small></div>
        <div class="center"><div style="font-size:1.3rem;font-weight:700;color:var(--accent)">${r.best}</div>
          <small>${r.unit === 'time' ? 'Sek.' : 'Wdh.'}</small></div>
      </div>
    </div>`).join('') : '<div class="card center"><p>Noch keine Bestwerte. Absolviere dein erstes Training.</p></div>'}

  <h3 class="mt" style="margin-bottom:8px">Verlauf</h3>
  ${Store.state.logs.length ? Store.state.logs.slice(0, 25).map(l => `
    <div class="card tight">
      <div class="row between">
        <div class="grow"><strong>${l.dayName}</strong><br>
          <small>${formatDate(l.date)} · ${Math.round(l.durationSec / 60)} Min · ${l.blocks.filter(b => b.done).length}/${l.blocks.length} Übungen</small></div>
        <span class="badge">W${l.week}</span>
      </div>
    </div>`).join('') : '<div class="card center"><p>Noch keine Einträge.</p></div>'}
  `;
}

/* -------------------------------------------------------------- Trainings-UI */
function renderWorkout() {
  const s = App.session;
  if (!s) return renderHome();

  if (s.stage === 'warmup') {
    return `
    <div class="topbar">
      <div><h1>Aufwärmen</h1><div class="sub">${s.day.name} · Woche ${s.day.week}</div></div>
      <button class="btn-ghost btn-sm btn-danger" data-action="abortWorkout">Abbrechen</button>
    </div>
    <div class="card">
      <p style="margin-bottom:10px">5 Minuten, die Verletzungen sparen. Locker durchgehen, nicht auspowern.</p>
      ${s.day.warmup.map((id, i) => {
        const ex = EX_BY_ID[id];
        return `<div class="exline">
          <div class="num">${i + 1}</div>
          <div class="grow"><div class="nm">${ex.name}</div><div class="mt">${ex.cues[0]}</div></div>
          <button class="btn-ghost btn-sm" data-action="showExercise" data-ex="${ex.id}">Info</button>
        </div>`;
      }).join('')}
    </div>
    <button class="btn-primary btn-block btn-lg" data-action="warmupDone">Aufgewärmt – los geht's</button>`;
  }

  if (s.stage === 'cooldown') {
    return `
    <div class="topbar"><div><h1>Geschafft</h1><div class="sub">${s.day.name}</div></div></div>
    <div class="card">
      <h2 style="margin-bottom:8px">Zum Ausklang</h2>
      ${s.day.cooldown.map(id => {
        const ex = EX_BY_ID[id];
        return `<div class="exline"><div class="num">◦</div>
          <div class="grow"><div class="nm">${ex.name}</div><div class="mt">${ex.cues[0]}</div></div></div>`;
      }).join('')}
    </div>
    <button class="btn-primary btn-block btn-lg" data-action="finishWorkout">Training speichern</button>`;
  }

  const block = s.blocks[s.blockIdx];
  const ex = EX_BY_ID[block.exId];
  const setNo = block.results.length + 1;
  const totalSets = s.blocks.reduce((a, b) => a + b.sets, 0);
  const doneSets = s.blocks.reduce((a, b) => a + b.results.length, 0);
  const pct = Math.round(doneSets / totalSets * 100);

  /* Pause */
  if (s.resting) {
    const nextBlock = s.blocks[s.blockIdx];
    return `
    <div class="topbar">
      <div><h1>Pause</h1><div class="sub">Danach: ${nextBlock.name} · Satz ${nextBlock.results.length + 1}/${nextBlock.sets}</div></div>
      <button class="btn-ghost btn-sm btn-danger" data-action="abortWorkout">✕</button>
    </div>
    <div class="card">
      ${ringHTML(formatTime(s.restLeft))}
      <div class="grid-2 mt">
        <button data-action="addRest">+20 Sek.</button>
        <button class="btn-primary" data-action="skipRest">Weiter</button>
      </div>
    </div>
    <div class="card tight"><div class="bar"><i style="width:${pct}%"></i></div>
      <small>${doneSets} von ${totalSets} Sätzen</small></div>`;
  }

  /* Zeitbasierte Übung im Halten */
  if (s.holding) {
    return `
    <div class="topbar"><div><h1>${ex.name}</h1><div class="sub">Satz ${setNo} von ${block.sets}</div></div></div>
    <div class="card">
      ${ringHTML(formatTime(block.target))}
      <button class="btn-block mt" data-action="stopHold">Abbrechen</button>
    </div>`;
  }

  /* Aktiver Satz */
  return `
  <div class="topbar">
    <div><h1>${ex.name}</h1><div class="sub">Übung ${s.blockIdx + 1}/${s.blocks.length} · Satz ${setNo}/${block.sets}</div></div>
    <button class="btn-ghost btn-sm btn-danger" data-action="abortWorkout">✕</button>
  </div>

  <div class="card accent center">
    <div class="l" style="color:var(--txt-2);font-size:.8rem;text-transform:uppercase;letter-spacing:.05em">Ziel</div>
    <div style="font-size:2.6rem;font-weight:700;line-height:1.1">${bigTarget(block)}</div>
    ${block.unit === 'each' ? '<small>pro Seite</small>' : ''}
    ${block.unit === 'time'
      ? `<button class="btn-primary btn-block btn-lg mt" data-action="startHold">Zeit starten</button>`
      : `<div class="mt"><label>Geschaffte Wiederholungen</label>
           <input type="number" id="set-input" inputmode="numeric" min="0" max="999" value="${block.target}"
                  style="text-align:center;font-size:1.3rem;font-weight:700;margin-top:6px">
         </div>
         <button class="btn-primary btn-block btn-lg mt" data-action="finishSet">Satz erledigt</button>`}
  </div>

  <div class="card tight">
    <div class="row between">
      <button class="btn-sm" data-action="swapExercise" data-dir="easier" ${ex.easier ? '' : 'disabled'}>← Leichter</button>
      <button class="btn-ghost btn-sm" data-action="showExercise" data-ex="${ex.id}">Technik</button>
      <button class="btn-sm" data-action="swapExercise" data-dir="harder" ${ex.harder ? '' : 'disabled'}>Schwerer →</button>
    </div>
  </div>

  <div class="card tight">
    <ul class="cues">${ex.cues.map(c => `<li>${c}</li>`).join('')}</ul>
  </div>

  <div class="card tight">
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="row between mt">
      <small>${doneSets} von ${totalSets} Sätzen</small>
      <button class="btn-ghost btn-sm" data-action="skipExercise">Übung überspringen</button>
    </div>
  </div>

  ${block.results.length ? `<div class="card tight"><small>Bisher: ${block.results.join(' · ')}</small></div>` : ''}
  `;
}

function ringHTML(label) {
  return `<div class="timer-wrap"><div class="ring">
    <svg viewBox="0 0 200 200"><circle class="track" cx="100" cy="100" r="88"></circle>
    <circle class="prog" cx="100" cy="100" r="88" stroke-dasharray="553" stroke-dashoffset="0"></circle></svg>
    <div class="t">${label}</div></div></div>`;
}

/* ------------------------------------------------------------------- Modals */
function exerciseDetailHTML(ex) {
  const chain = [];
  let cur = ex;
  while (cur && cur.easier && chain.length < 4) { cur = EX_BY_ID[cur.easier]; if (cur) chain.unshift(cur); }
  const after = [];
  cur = ex;
  while (cur && cur.harder && after.length < 4) { cur = EX_BY_ID[cur.harder]; if (cur) after.push(cur); }
  const rec = Store.state.records[ex.id];

  return `
  <h2>${ex.name}</h2>
  <div class="row wrap mt" style="gap:6px">
    <span class="badge">Stufe ${ex.level}/5</span>
    <span class="badge">${ex.equip}</span>
    ${ex.muscles.map(m => `<span class="badge green">${m}</span>`).join('')}
  </div>

  ${rec ? `<div class="card tight mt"><div class="row between">
    <span>Dein Bestwert</span>
    <strong style="color:var(--accent)">${rec.best} ${rec.unit === 'time' ? 'Sek.' : 'Wdh.'}</strong>
  </div></div>` : ''}

  <h3 class="mt">So geht's</h3>
  <ul class="cues">${ex.cues.map(c => `<li>${c}</li>`).join('')}</ul>

  ${ex.mistakes ? `<h3 class="mt">Typische Fehler</h3>
  <ul class="cues warn">${ex.mistakes.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}

  ${(chain.length || after.length) ? `<h3 class="mt">Progression</h3>
  <div class="hint">${[...chain.map(c => c.name), `<strong style="color:var(--accent)">${ex.name}</strong>`, ...after.map(c => c.name)].join(' → ')}</div>` : ''}

  <button class="btn-block mt" data-action="closeModal">Schliessen</button>`;
}

function settingsHTML() {
  const s = Store.state.settings;
  const p = Store.state.profile;
  return `
  <h2>Einstellungen</h2>
  <div class="card tight mt">
    <div class="row between"><span>Signalton</span>
      <input type="checkbox" data-change="toggleSetting" data-key="sound" ${s.sound ? 'checked' : ''} style="width:auto"></div>
  </div>
  <div class="card tight">
    <div class="row between"><span>Vibration</span>
      <input type="checkbox" data-change="toggleSetting" data-key="vibrate" ${s.vibrate ? 'checked' : ''} style="width:auto"></div>
  </div>

  ${p ? `<div class="card tight">
    <small>Aktuell: Stufe ${LEVELS[p.level]} · ${GOALS[p.goal].name} · ${p.days} Tage/Woche</small>
  </div>` : ''}

  <div class="stack mt">
    <button data-action="regeneratePlan">Plan neu erstellen</button>
    <button data-action="exportData">Daten sichern (JSON)</button>
    <button data-action="importData">Daten wiederherstellen</button>
    <button class="btn-danger" data-action="resetAll">Alles zurücksetzen</button>
  </div>

  <div class="hint mt">Diese App speichert ausschliesslich lokal in deinem Browser. Es gibt keinen Server,
  kein Konto und keine Bezahlung. Sichere deine Daten gelegentlich per Export.</div>

  <button class="btn-block mt" data-action="closeModal">Schliessen</button>`;
}

function summaryHTML(session, durationSec) {
  const sets = session.blocks.reduce((a, b) => a + b.results.length, 0);
  const reps = session.blocks.reduce((a, b) => a + b.results.reduce((x, y) => x + (b.unit === 'time' ? 0 : y), 0), 0);
  return `
  <h2>Training abgeschlossen</h2>
  <p>${session.day.name} · Woche ${session.day.week}</p>
  <div class="grid-3 mt">
    <div class="stat"><div class="v">${Math.round(durationSec / 60)}</div><div class="l">Minuten</div></div>
    <div class="stat"><div class="v">${sets}</div><div class="l">Sätze</div></div>
    <div class="stat"><div class="v">${reps}</div><div class="l">Wdh.</div></div>
  </div>
  <div class="mt">
    ${session.blocks.map(b => `<div class="exline">
      <div class="num">${b.done ? '✓' : '–'}</div>
      <div class="grow"><div class="nm">${b.name}</div>
      <div class="mt">${b.results.length ? b.results.join(' · ') + (b.unit === 'time' ? ' Sek.' : ' Wdh.') : 'übersprungen'}</div></div>
    </div>`).join('')}
  </div>
  <button class="btn-primary btn-block mt" data-action="closeModal">Weiter</button>`;
}

/* --------------------------------------------------------------- Helferlein */
/* Kurzform für Listen – macht seitenweise Übungen sichtbar. */
function targetLabel(block) {
  if (block.unit === 'time') return `${block.target}s`;
  if (block.unit === 'each') return `${block.target} je Seite`;
  return `${block.target}`;
}
/* Grosse Zahl im Trainings-Bildschirm – dort steht „pro Seite“ separat darunter. */
function bigTarget(block) {
  return block.unit === 'time' ? `${block.target}s` : `${block.target}`;
}
function formatTime(sec) {
  const s = Math.ceil(sec);
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s);
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function estimateMinutes(day) {
  const work = day.blocks.reduce((a, b) => a + b.sets * (30 + b.restSec), 0);
  return Math.round((work + 480) / 60);
}

document.addEventListener('DOMContentLoaded', () => App.init());

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline optional */ });
  });
}
