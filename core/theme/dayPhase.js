// core/theme/dayPhase.js

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function getDayPhase(hour, sunrise, sunset) {
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(sunrise) ||
    !Number.isFinite(sunset)
  ) {
    console.warn("⛔ getDayPhase: invalid data", { hour, sunrise, sunset });
    return "night"; // ⚠️ sécurité : jamais forcer jour
  }

  // 🌅 aube : ~45 min autour du lever
  if (hour >= sunrise - 0.75 && hour < sunrise + 0.75) return "dawn";

  // ☀️ jour
  if (hour >= sunrise + 0.75 && hour < sunset - 0.75) return "day";

  // 🌇 crépuscule : ~45 min autour du coucher
  if (hour >= sunset - 0.75 && hour < sunset + 0.75) return "dusk";

  // 🌙 nuit
  return "night";
}

export function getPhaseRatio(hour, phase, sunrise, sunset) {
  let start, end;

  if (phase === "dawn") {
    start = sunrise - 0.75;
    end   = sunrise + 0.75;
  } 
  else if (phase === "day") {
    start = sunrise + 0.75;
    end   = sunset - 0.75;
  } 
  else if (phase === "dusk") {
    start = sunset - 0.75;
    end   = sunset + 0.75;
  } 
  else {
    return 0;
  }

  return clamp01((hour - start) / (end - start));
}
