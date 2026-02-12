import { computeSunPhase, computeSunProgress, isGoldenHour } from "../core/sun/sunEngine.js";
import { onTimeChange } from "../state/timeState.js";
import { onWeatherChange } from "../state/weatherState.js";
import { setSunState } from "../state/sunState.js";

let sunrise = null;
let sunset  = null;
let now     = null;
let offsetSec = null;

export function initSunController() {

 onWeatherChange(weather => {

  // 🔥 sécurité absolue
  if (!weather?.raw?.daily) return;

  const daily = weather.raw.daily;
  const off   = weather.raw.utc_offset_seconds;

  if (!daily?.sunrise?.[0] || !daily?.sunset?.[0]) return;
  if (!Number.isFinite(off)) return;

  offsetSec = off;

  sunrise = makeUtcDateFromCityLocal(daily.sunrise[0], offsetSec);
  sunset  = makeUtcDateFromCityLocal(daily.sunset[0], offsetSec);

  recompute();
 });


  onTimeChange(time => {
    if (!time?.nowUtc) return;

    // vraie heure UTC
    now = time.nowUtc;

    recompute();
  });
}

function recompute() {

  if (!(now instanceof Date)) return;
  if (!(sunrise instanceof Date)) return;
  if (!(sunset instanceof Date)) return;

  const sun = {
   now,
   sunrise,
   sunset,
   offsetSec,
   phase: computeSunPhase(now, sunrise, sunset),
   progress: computeSunProgress(now, sunrise, sunset),
   isGolden: isGoldenHour(now, sunrise, sunset)
  };


  sun.isNight = sun.phase === "night";

  setSunState(sun);
}

/* =====================================================
   util — "2026-01-23T08:19" + offset → vraie Date UTC
===================================================== */

function makeUtcDateFromCityLocal(isoLocal, offsetSec) {
 if (!isoLocal || !Number.isFinite(offsetSec)) return null;
  const [datePart, timePart] = isoLocal.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm]  = timePart.split(":").map(Number);

  // heure UTC réelle = heure locale - offset
  const utcMs = Date.UTC(y, m - 1, d, hh, mm, 0) - offsetSec * 1000;

  return new Date(utcMs);
}