/* =====================================================
   SUN STATE
===================================================== */
import { subscribe, setState, getState } from "./store.js";

let sun = null;
const listeners = new Set();

export function setSunState(payload) {
  sun = payload;
  setState("sun", payload);
  listeners.forEach(cb => cb(payload));
}

export function onSunChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSun() {
  return sun || getState("sun");
}

subscribe("sun", s => {
  sun = s;
  listeners.forEach(cb => cb(s));
});

