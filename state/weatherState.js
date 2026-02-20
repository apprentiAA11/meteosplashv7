/* =====================================================
   WEATHER STATE
===================================================== */

import { subscribe, setState, getState } from "./store.js";
import { getSelectedCity } from "./cityState.js";

let weather = {
  raw: null,
  city: null,
  mode: "live",
  historyDate: null,

  // 🔥 AJOUT ICI
  unit: "C",
  userForcedUnit: false
};

const listeners = new Set();


function detectUnit(countryCode) {
  // Force °C pour les villes françaises (et européennes si nécessaire)
  if (countryCode === "FR") return "C";  // Forcer °C pour la France
  return ["US", "LR", "MM"].includes(countryCode) ? "F" : "C";  // °F pour US, LR, MM, sinon °C
}

export function setUnit(unit) {
  weather = {
    ...weather,
    unit,
    userForcedUnit: true
  };

  setState("weather", weather);
  notify();
}

export function getUnit() {
  return weather.unit;
}


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

  document.dispatchEvent(new Event("weather:update")); // 🔥 AJOUT
}

/* ================================
   SYNC STORE
================================ */

subscribe("weather", w => {
  if (!w) return;
  weather = w;
  notify();
});

/* ===============================
   LIVE TEMPERATURE ENGINE
================================ */

let lastTemp = null;
let lastUpdateTs = null;

export function setLiveTemperature(temp) {
  if (!Number.isFinite(temp)) return;

  lastTemp = temp;
  lastUpdateTs = Date.now();
}

export function getLiveTemperature() {
  if (!Number.isFinite(lastTemp) || !lastUpdateTs) return null;

  const deltaMin = (Date.now() - lastUpdateTs) / 60000;

  const drift =
    Math.sin(deltaMin / 8) * 0.25 +
    Math.cos(deltaMin / 3) * 0.1;

  return lastTemp + drift;
}
