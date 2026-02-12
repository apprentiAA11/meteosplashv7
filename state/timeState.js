/* =====================================================
   TIME STATE (source unique)
===================================================== */

import { subscribe, setState, getState } from "./store.js";

let time = null;
const listeners = new Set();

export function setTimeState(payload) {
  time = payload;
  setState("time", payload);

  // 🔥 event DOM pour les UI qui écoutent "time:update"
  document.dispatchEvent(new CustomEvent("time:update", { detail: payload }));

  listeners.forEach(cb => cb(payload));
}

export function onTimeChange(cb) {
  listeners.add(cb);
  // callback immédiat si déjà dispo
  if (time) cb(time);
  return () => listeners.delete(cb);
}

export function getTime() {
  return time || getState("time");
}

// sync store -> state
subscribe("time", t => {
  time = t;
  document.dispatchEvent(new CustomEvent("time:update", { detail: t }));
  listeners.forEach(cb => cb(t));
});
