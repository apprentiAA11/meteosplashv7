// core/utils.js

/* =====================================================
   MATH / GENERIC
===================================================== */

export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/* =====================================================
   DATE & TIME
===================================================== */

// "2026-01-08" → "jeu. 8 jan."
export function formatForecastDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

// Date → "YYYY-MM-DD"
export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Code météo → emoji
export function getWeatherIcon(code) {
  if (code == null) return "";
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([56, 57, 66, 67].includes(code)) return "🌧❄️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈";
  return "";
}

// ISO Open-Meteo (sans TZ) → ms ville
export function isoToCityMs(iso, offsetSeconds = 0) {
  const utcMs = Date.parse(iso + "Z");
  return utcMs + offsetSeconds * 1000;
}

// ms → "HH:MM" (heure ville)
export function formatCityHMFromMs(cityMs) {
  const d = new Date(cityMs);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Cherche l’index horaire le plus proche de "maintenant"
export function findBaseIndexForNow(timesIso, offsetSeconds = 0) {
  if (!Array.isArray(timesIso) || !timesIso.length) return 0;

  // Date.now() = déjà UTC
  const nowCityMs = Date.now() + offsetSeconds * 1000;

  const tolMs = 30 * 60 * 1000;

  for (let i = 0; i < timesIso.length; i++) {
    const tCityMs = isoToCityMs(timesIso[i], offsetSeconds);
    if (tCityMs >= nowCityMs - tolMs) return i;
  }

  return Math.max(0, timesIso.length - 24);
}
// ISO local Open-Meteo → heure décimale locale
export function getHourFromLocalISO(iso) {
  if (!iso) return null;
  const hh = Number(String(iso).substring(11, 13));
  const mm = Number(String(iso).substring(14, 16));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh + mm / 60;
}

/* =====================================================
   WEATHER / METEO
===================================================== */

export function getTempColor(t) {
  if (t <= -5) return "#0b1c3d";
  if (t <= 0)  return "#132a52";
  if (t <= 5)  return "#1b3f6b";
  if (t <= 10) return "#245c73";
  if (t <= 15) return "#2f6f5f";
  if (t <= 20) return "#4a7c3a";
  if (t <= 25) return "#7a7a2e";
  if (t <= 30) return "#9b5e1a";
  if (t <= 35) return "#8c2f1c";
  return "#5b0f14";
}

// degrés → point cardinal
export function degreeToCardinal(angle) {
  if (typeof angle !== "number") return "";
  const directions = [
    "Nord","Nord-Nord-Est","Nord-Est","Est-Nord-Est","Est","Est-Sud-Est",
    "Sud-Est","Sud-Sud-Est","Sud","Sud-Sud-Ouest","Sud-Ouest","Ouest-Sud-Ouest",
    "Ouest","Ouest-Nord-Ouest","Nord-Ouest","Nord-Nord-Ouest"
  ];
  const index = Math.round((angle % 360) / 22.5) % 16;
  return directions[index];
}

// "2026-01-08T…" → "jeu. 8/1"
export function formatDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "numeric"
  });
}
