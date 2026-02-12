/* =====================================================
   THEME STATE
===================================================== */

import { subscribe, setState, getState } from "./store.js";

let themeState = null;
const listeners = new Set();

/* =====================================================
   API
===================================================== */

export function setThemeState(payload) {
  themeState = payload;
  setState("theme", payload);
  listeners.forEach(cb => cb(payload));
}

export function onThemeChange(cb) {
  listeners.add(cb);
  if (themeState) cb(themeState);
  return () => listeners.delete(cb);
}

export function getTheme() {
  return themeState || getState("theme");
}

/* =====================================================
   SYNC STORE
===================================================== */

subscribe("theme", t => {
  themeState = t;
  listeners.forEach(cb => cb(t));
});
