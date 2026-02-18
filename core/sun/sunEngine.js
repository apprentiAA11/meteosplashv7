// core/sun/sunEngine.js

function toMinutes(d) {
  return (
    d.getUTCHours() * 60 +
    d.getUTCMinutes() +
    d.getUTCSeconds() / 60
  );
}

export function computeSunPhase(now, sunrise, sunset) {
  const t  = now.getTime();
  const sr = sunrise.getTime();
  const ss = sunset.getTime();

  let isDay;

  if (ss > sr) {
    // 🌞 cas normal
    isDay = (t >= sr && t < ss);
  } else {
    // 🌍 coucher le lendemain (traverse minuit)
    isDay = (t >= sr || t < ss);
  }

  return isDay ? "day" : "night";
}

export function isGoldenHour(now, sunrise, sunset) {
  if (!(now instanceof Date) || !(sunrise instanceof Date) || !(sunset instanceof Date)) {
    return false;
  }

  const n  = toMinutes(now);
  const ss = toMinutes(sunset);

  return n >= ss - 60 && n <= ss + 30;
}

export function computeSunProgress(now, sunrise, sunset) {
  if (!(now instanceof Date) ||
      !(sunrise instanceof Date) ||
      !(sunset instanceof Date)) {
    return 0;
  }

  const nowMs = now.getTime();
  const srMs  = sunrise.getTime();
  const ssMs  = sunset.getTime();

  // avant lever → 0
  if (nowMs <= srMs) return 0;

  // après coucher → 1
  if (nowMs >= ssMs) return 1;

  // progression normale
  return (nowMs - srMs) / (ssMs - srMs);
}
