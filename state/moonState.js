// state/moonState.js

let moonState = null;
const listeners = new Set();

// ===============================
// STORE CLASSIQUE
// ===============================

export function setMoonState(state) {
  moonState = state;
  listeners.forEach(cb => cb(moonState));
}

export function getMoonState() {
  return moonState;
}

export function onMoonChange(cb) {
  listeners.add(cb);
  if (moonState) cb(moonState);
}

// ===============================
// TIMELINE LUNAIRE (source unique)
// ===============================

let moonEvents = [];
// format : { type: "rise" | "set", date: Date }

export function setMoonEvents(events) {
  moonEvents = events
    .map(e => ({
      ...e,
      date: new Date(e.date) // ISO → Date locale correcte
    }))
    .sort((a, b) => a.date - b.date);
}

// ===============================
// CALCUL POUR UN JOUR J
// ===============================

export function computeMoonDay(dayDate) {
  if (!moonEvents.length) return null;

  const start = new Date(dayDate);
  start.setHours(0,0,0,0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const events = moonEvents
    .filter(e => e.date >= start && e.date < end)
    .sort((a,b) => a.date - b.date);

  const prevEvent = [...moonEvents]
    .filter(e => e.date < start)
    .sort((a,b) => b.date - a.date)[0];

  const nextEvent = moonEvents
    .filter(e => e.date >= end)
    .sort((a,b) => a.date - b.date)[0];

  return {
    date: start,
    events,
    prevEvent,
    nextEvent
  };
}
