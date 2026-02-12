/* =====================================================
   WEATHER STATE
===================================================== */

import { subscribe, setState, getState } from "./store.js";

let weather = {
  raw: null,
  city: null,
  mode: "live",
  historyDate: null
};

const listeners = new Set();

/* ================================
   MODE
================================ */

export function setWeatherMode(newMode) {
  weather = {
    ...weather,
    mode: newMode
  };

  setState("weather", weather);
  notify();
}

/* ================================
   WEATHER DATA
================================ */

export function setWeatherState(payload) {
  // ⚠️ IMPORTANT : on ne touche PAS au mode ici
  weather = {
    ...weather,
    ...payload
  };

  window.__lastWeatherState = weather;

  setState("weather", weather);
  notify();
}

/* ================================
   SUBSCRIPTIONS
================================ */

export function onWeatherChange(cb) {
  listeners.add(cb);
}

export function getWeather() {
  return weather || getState("weather");
}

function notify() {
  listeners.forEach(cb => cb(weather));
}

/* ================================
   SYNC STORE
================================ */

subscribe("weather", w => {
  if (!w) return;
  weather = w;
  notify();
});
