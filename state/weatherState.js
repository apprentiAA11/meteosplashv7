/* =====================================================
   WEATHER STATE
   Pont entre WeatherController et le store global
===================================================== */

import { subscribe, setState, getState } from "./store.js";

let weather = null;
const listeners = new Set();

/* =====================================================
   API PUBLIQUE
===================================================== */

export function setWeatherState(payload) {
  weather = payload;

  // 🔹 pour ForecastUI (et debug)
  window.__lastWeatherState = payload;

  // synchro store global
  setState("weather", payload);

  listeners.forEach(cb => cb(payload));
}


export function onWeatherChange(cb) {
  listeners.add(w => {
    if (!w?.raw) return;
    cb(w);
  });
}

export function getWeather() {
  return weather || getState("weather");
}

/* =====================================================
   SYNC DEPUIS LE STORE (si modifié ailleurs)
===================================================== */

subscribe("weather", w => {
  weather = w;
  listeners.forEach(cb => cb(w));
});
