/* =========================================================================
   store.js – Zustand, Persistenz (localStorage), Export/Import
   Es verlässt kein Byte dein Gerät. Kein Server, kein Konto, kein Tracking.
   ========================================================================= */

const STORAGE_KEY = 'calisthenics.state.v1';

const DEFAULT_STATE = {
  profile: null,          // { level, goal, days, equipment[], createdAt }
  plan: null,             // von plan.js erzeugt
  logs: [],               // [{ id, date, dayKey, dayName, week, blocks[], durationSec }]
  records: {},            // { exerciseId: { best, unit, date } }
  settings: { sound: true, autostartRest: true, vibrate: true }
};

const Store = {
  state: structuredClone(DEFAULT_STATE),
  listeners: [],

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...structuredClone(DEFAULT_STATE), ...parsed };
        this.state.settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };
      }
    } catch (err) {
      console.warn('Gespeicherte Daten konnten nicht gelesen werden:', err);
      this.state = structuredClone(DEFAULT_STATE);
    }
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Speichern fehlgeschlagen:', err);
    }
    this.listeners.forEach(fn => fn(this.state));
  },

  subscribe(fn) { this.listeners.push(fn); },

  reset() {
    this.state = structuredClone(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
    this.listeners.forEach(fn => fn(this.state));
  },

  /* ---------------------------------------------------------- Trainingslog */
  addLog(entry) {
    this.state.logs.unshift(entry);
    entry.blocks.forEach(b => this.updateRecord(b));
    this.save();
  },

  updateRecord(block) {
    if (!block.done || !block.results || !block.results.length) return;
    const best = Math.max(...block.results.filter(n => Number.isFinite(n)));
    if (!Number.isFinite(best) || best <= 0) return;
    const prev = this.state.records[block.exId];
    if (!prev || best > prev.best) {
      this.state.records[block.exId] = {
        best,
        unit: block.unit,
        date: new Date().toISOString()
      };
    }
  },

  /* ------------------------------------------------------------ Statistik */
  stats() {
    const logs = this.state.logs;
    const total = logs.length;
    let reps = 0, seconds = 0;
    logs.forEach(l => l.blocks.forEach(b => {
      (b.results || []).forEach(v => {
        if (!Number.isFinite(v)) return;
        if (b.unit === 'time') seconds += v; else reps += v;
      });
    }));
    return {
      total,
      reps,
      seconds,
      minutes: Math.round(logs.reduce((s, l) => s + (l.durationSec || 0), 0) / 60),
      streak: this.streak(),
      thisWeek: logs.filter(l => withinDays(l.date, 7)).length
    };
  },

  /* Streak = Anzahl aufeinanderfolgender Tage/Wochen mit Training.
     Bewusst tolerant: ein Ruhetag dazwischen bricht die Serie nicht. */
  streak() {
    const days = [...new Set(this.state.logs.map(l => dayKeyOf(l.date)))].sort().reverse();
    if (!days.length) return 0;
    const today = dayKeyOf(new Date().toISOString());
    const yesterday = dayKeyOf(new Date(Date.now() - 864e5).toISOString());
    if (days[0] !== today && days[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((new Date(days[i - 1]) - new Date(days[i])) / 864e5);
      if (diff <= 2) streak++; else break;
    }
    return streak;
  },

  /* --------------------------------------------------------- Export/Import */
  exportJSON() {
    return JSON.stringify({ ...this.state, _exportedAt: new Date().toISOString() }, null, 2);
  },

  importJSON(text) {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Ungültige Datei');
    this.state = { ...structuredClone(DEFAULT_STATE), ...parsed };
    this.state.settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };
    this.save();
  }
};

function dayKeyOf(iso) { return new Date(iso).toISOString().slice(0, 10); }
function withinDays(iso, days) { return Date.now() - new Date(iso).getTime() < days * 864e5; }
