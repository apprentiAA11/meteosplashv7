import { getSelectedCity } from "../state/cityState.js";
import { getWeather } from "../state/weatherState.js";

/* =====================================================
   UNITÉ ACTIVE
===================================================== */

export function getUnit() {
  const weather = getWeather();
  return weather?.unit || "C";
}

/* =====================================================
   CONVERSION
===================================================== */

export function toUnit(value, unit = getUnit()) {
  const n = Number(value);
  if (!isFinite(n)) return null;

  return unit === "F"
    ? (n * 9/5) + 32
    : n;
}

/* =====================================================
   FORMAT LONG (ex: 21.4°C)
===================================================== */

export function format(value, unit = getUnit()) {
  const v = toUnit(value, unit);
  if (v == null) return "—";

  return `${v.toFixed(1)}°${unit}`;
}

/* =====================================================
   FORMAT COURT (ex: 21°)
===================================================== */

export function formatShort(value, unit = getUnit()) {
  const v = toUnit(value, unit);
  if (v == null) return "—";

  return `${Math.round(v)}°`;
}

/* =====================================================
   COULEUR (toujours basée sur °C pour cohérence)
===================================================== */

export function getColor(value) {
  const celsius = Number(value);
  if (!isFinite(celsius)) return "inherit";

  const min = -15;
  const max = 35;

  const x = Math.max(min, Math.min(max, celsius));

  if (x <= 10) {
    const k = (x - min) / (10 - min);
    const r = Math.round(60 + k * 190);
    const g = Math.round(120 + k * 130);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  } else {
    const k = (x - 10) / (max - 10);
    const r = 255;
    const g = Math.round(200 - k * 160);
    const b = Math.round(130 - k * 130);
    return `rgb(${r},${g},${b})`;
  }
}
