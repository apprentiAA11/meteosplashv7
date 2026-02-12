//timeUtils.js
// utils/timeUtils.js

export function formatCityTime(nowUtc, offsetSec) {
  if (!(nowUtc instanceof Date) || !Number.isFinite(offsetSec)) {
    return { h: 0, m: 0, s: 0 };
  }

  const cityMs = nowUtc.getTime() + offsetSec * 1000;
  const d = new Date(cityMs);

  return {
    h: d.getUTCHours(),
    m: d.getUTCMinutes(),
    s: d.getUTCSeconds()
  };
}
export function formatCityDate(nowUtc, offsetSec) {
  if (!(nowUtc instanceof Date) || !Number.isFinite(offsetSec)) return "";

  const cityMs = nowUtc.getTime() + offsetSec * 1000;
  const d = new Date(cityMs);

  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
// ===============================
// ⏰ Format heure ville depuis UTC
// ===============================
export function formatCityHour(dateUtc, offsetSec) {
  if (!(dateUtc instanceof Date) || !Number.isFinite(offsetSec)) return "--:--";

  const d = new Date(dateUtc.getTime() + offsetSec * 1000);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

