// core/moon/moonEngine.js
// 🌙 Moteur lunaire — calculs astronomiques purs
// Inspiré SunCalc (MIT) — version light adaptée Météo Splash

/* =====================================================
   CONSTANTES & BASE TEMPS
===================================================== */

const rad = Math.PI / 180;
const dayMs = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const synodicMonth = 29.530588853;

/* =====================================================
   BASE JULIENNE
===================================================== */

function toJulian(date) {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function toDays(date) {
  return toJulian(date) - J2000;
}

/* =====================================================
   COORDONNÉES
===================================================== */

function rightAscension(l, b) {
  const e = rad * 23.4397;
  return Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l)
  );
}

function declination(l, b) {
  const e = rad * 23.4397;
  return Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)
  );
}

function azimuth(H, phi, dec) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
  );
}

function altitude(H, phi, dec) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) +
    Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}

function siderealTime(d, lw) {
  return rad * (280.16 + 360.9856235 * d) - lw;
}

/* =====================================================
   COORDONNÉES LUNE
===================================================== */

function moonCoords(d) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.229350 * d);

  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M);

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
    dist: dt
  };
}

/* =====================================================
   POSITION LUNAIRE
===================================================== */

export function getMoonPosition(date, lat, lon) {
  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);

  const c = moonCoords(d);
  const H = siderealTime(d, lw) - c.ra;

  return {
    azimuth: azimuth(H, phi, c.dec),
    altitude: altitude(H, phi, c.dec),
    distance: c.dist
  };
}

/* =====================================================
   ILLUMINATION & PHASE
===================================================== */

export function getMoonIllumination(date) {
  const d = toDays(date);

  const Mm = rad * (357.5291 + 0.98560028 * d);
  const Ls =
    rad * (280.1470 + 0.98564736 * d) +
    rad * 1.915 * Math.sin(Mm) +
    rad * 0.02 * Math.sin(2 * Mm);

  const m = moonCoords(d);

  const sdec = declination(Ls, 0);
  const sra = rightAscension(Ls, 0);

  const phi = Math.acos(
    Math.sin(sdec) * Math.sin(m.dec) +
    Math.cos(sdec) * Math.cos(m.dec) * Math.cos(sra - m.ra)
  );

  const inc = Math.atan2(
    149598000 * Math.sin(phi),
    m.dist - 149598000 * Math.cos(phi)
  );

  const fraction = (1 + Math.cos(inc)) / 2;

  const angle = Math.atan2(
    Math.cos(sdec) * Math.sin(sra - m.ra),
    Math.sin(sdec) * Math.cos(m.dec) -
    Math.cos(sdec) * Math.sin(m.dec) * Math.cos(sra - m.ra)
  );

  const phase = 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI;

  return { fraction, phase, angle };
}

/* =====================================================
   LEVER / COUCHER
===================================================== */

function hoursLater(date, h) {
  return new Date(date.valueOf() + h * 3600000);
}

export function getMoonTimes(date, lat, lon) {
  const t = new Date(date);
  t.setUTCMinutes(0, 0, 0);

  const hc = 0.133 * rad;
  let h0 = getMoonPosition(t, lat, lon).altitude - hc;

  let rise = null;
  let set = null;
  let ye = h0;

  for (let i = 1; i <= 24; i += 2) {
    const t1 = hoursLater(t, i);
    const t2 = hoursLater(t, i + 1);

    const h1 = getMoonPosition(t1, lat, lon).altitude - hc;
    const h2 = getMoonPosition(t2, lat, lon).altitude - hc;

    const a = (h0 + h2) / 2 - h1;
    const b = (h2 - h0) / 2;
    const xe = -b / (2 * a);
    const ye2 = (a * xe + b) * xe + h1;
    const d = b * b - 4 * a * h1;

    let roots = 0;
    let x1 = 0, x2 = 0;

    if (d >= 0) {
      const dx = Math.sqrt(d) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) roots++;
      if (Math.abs(x2) <= 1) roots++;
      if (x1 < -1) x1 = x2;
    }

    if (roots === 1) {
      if (ye < 0) rise = hoursLater(t, i + x1);
      else set = hoursLater(t, i + x1);
    } else if (roots === 2) {
      rise = hoursLater(t, i + (ye < 0 ? x2 : x1));
      set = hoursLater(t, i + (ye < 0 ? x1 : x2));
    }

    if (rise && set) break;

    h0 = h2;
    ye = ye2;
  }

  return {
    rise,
    set,
    alwaysUp: !rise && !set && ye > 0,
    alwaysDown: !rise && !set && ye <= 0
  };
}

/* =====================================================
   MÉTA PHASE
===================================================== */

export function getMoonPhaseMeta(phase0to1) {
  const p = (phase0to1 % 1 + 1) % 1;
  const waxing = p < 0.5;
  const age = p * synodicMonth;

  const steps = [
    { t: 0.03, name: "Nouvelle Lune", emoji: "🌑" },
    { t: 0.22, name: "Premier croissant", emoji: "🌒" },
    { t: 0.28, name: "Premier quartier", emoji: "🌓" },
    { t: 0.47, name: "Gibbeuse croissante", emoji: "🌔" },
    { t: 0.53, name: "Pleine Lune", emoji: "🌕" },
    { t: 0.72, name: "Gibbeuse décroissante", emoji: "🌖" },
    { t: 0.78, name: "Dernier quartier", emoji: "🌗" },
    { t: 0.97, name: "Dernier croissant", emoji: "🌘" },
    { t: 1.01, name: "Nouvelle Lune", emoji: "🌑" }
  ];

  let label = steps[0];
  for (let i = 0; i < steps.length; i++) {
    if (p <= steps[i].t) { label = steps[i]; break; }
  }

  return { ...label, waxing, age };
}
