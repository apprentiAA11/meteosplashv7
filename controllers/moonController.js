// controllers/moonController.js
// 🌙 Moon Controller — logique unifiée, stable, type iOS

import { onTimeChange } from "../state/timeState.js";
import { setMoonState, computeMoonDay} from "../state/moonState.js";
import { getMoonIllumination, getMoonPhaseMeta } from "../core/moon/moonEngine.js";
import { findNextPhase } from "../core/moon/findNextPhase.js";
import { setMoonEvents } from "../state/moonState.js";
import { fetchMoonEvents } from "../services/moonService.js";

let city = null;
let timeState = null;
let selectedDate = null;
let lastRecomputeDayKey = null;


const SYNODIC_MONTH = 29.530588853;

/* ================= INIT ================= */

export function initMoonController() {
  console.log("🌙 MoonController ready");

document.addEventListener("city:update", async e => {
  city = e.detail?.selectedCity;
  if (!city) return;

  const events = await fetchMoonEvents(city.lat, city.lon);
  setMoonEvents(events);

  selectedDate = null;
  lastRecomputeDayKey = null;

  recompute(new Date());
});


  document.addEventListener("moon:select-day", e => {
    if (!e.detail?.date || !city) return;

    selectedDate = new Date(e.detail.date);
    lastRecomputeDayKey = null;

    recompute(selectedDate);
  });

  document.addEventListener("moon:change-month", e => {
    if (!city || !e.detail?.pivot) return;

    const pivot = new Date(e.detail.pivot);

    // 🔒 on garde le jour sélectionné si présent
    recompute(
      selectedDate instanceof Date ? selectedDate : pivot
    );
  });

  onTimeChange(t => {
    timeState = t;
    if (selectedDate) return;

    const d = t?.date instanceof Date ? new Date(t.date) : new Date();
    const key = toISODateLocal(d);

    if (key === lastRecomputeDayKey) return;
    lastRecomputeDayKey = key;

    recompute(d);
  });
}

function toISODateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


/* ================= CALENDAR ================= */

function buildMoonCalendar(baseDate, days = 60) {
  const cal = [];

  for (let i = -30; i < days - 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);

    const illum = getMoonIllumination(asNoonUTC(d));
    const p = normalizePhase01(illum?.phase);

    const waxing = p < 0.5;
    const age = p * SYNODIC_MONTH;

    const isNew  = p <= 0.015 || p >= 0.985;
    const isFull = Math.abs(p - 0.5) <= 0.015;

    const meta = getMoonPhaseMeta(p);

    cal.push({
     date: d,
     illumination: illum,
     phase: { ...meta, waxing, age },
     isNew,
     isFull
    });

  }

  return cal;
}

/* ================= RECOMPUTE ================= */

function recompute(forcedDate = null) {
  if (!city) return;

  const baseDate =
    forcedDate instanceof Date ? new Date(forcedDate) :
    selectedDate instanceof Date ? new Date(selectedDate) :
    timeState?.date instanceof Date ? new Date(timeState.date) :
    new Date();

  const illum = getMoonIllumination(asNoonUTC(baseDate));
  const p = normalizePhase01(illum?.phase);

  const waxing = p < 0.5;
  const age = p * SYNODIC_MONTH;
  const isNew  = p <= 0.015 || p >= 0.985;
  const isFull = Math.abs(p - 0.5) <= 0.015;

  const meta = getMoonPhaseMeta(p);
  const calendar = buildMoonCalendar(baseDate, 60);

  const nextFull = findNextPhase(baseDate, "full");
  const nextNew  = findNextPhase(baseDate, "new");
const times = computeMoonDay(baseDate);
console.log("MOON TIMES RAW:", times);

  setMoonState({
    city,
    date: baseDate,
    illumination: illum,
    phase: { ...meta, waxing, age },
    times: computeMoonDay(baseDate),
    calendar,
    nextFull,
    nextNew
  });

}

/* ================= HELPERS ================= */

function asNoonUTC(d) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
}

function normalizePhase01(p) {
  const x = Number(p);
  if (!isFinite(x)) return 0;
  return ((x % 1) + 1) % 1;
}