// /core/time/cityTimeEngine.js

/* =========================
   PARSING & BASE
========================= */

export function computeCityLocalDate(currentISO, utcOffsetSeconds) {
  if (!currentISO || typeof utcOffsetSeconds !== "number") return null;

  const utcMs = Date.parse(currentISO + "Z");
  if (!Number.isFinite(utcMs)) return null;

  return new Date(utcMs + utcOffsetSeconds * 1000);
}

/* =========================
   EXTRACTIONS
========================= */

export function extractLocalHour(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return null;
   return dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60;

}

export function extractHMS(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return null;

  return {
    h: dateObj.getUTCHours(),
    m: dateObj.getUTCMinutes(),
    s: dateObj.getUTCSeconds()
  };
}

export function formatClock(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return null;

  return {
    h: String(dateObj.getUTCHours()).padStart(2, "0"),
    m: String(dateObj.getUTCMinutes()).padStart(2, "0"),
    s: String(dateObj.getUTCSeconds()).padStart(2, "0")
  };
}

export function formatDateFR(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";

  return dateObj.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

/* =========================
   UTILITAIRE EXISTANT
========================= */

export function getHourFromLocalISO(iso) {
  if (!iso || typeof iso !== "string") return null;

  const hh = Number(iso.substring(11, 13));
  const mm = Number(iso.substring(14, 16));

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh + mm / 60;
}
