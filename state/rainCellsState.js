// rainCellsState.js (concept)
type RainCell = {
  id: number,
  lat: number,
  lon: number,
  rKm: number,        // rayon (km) -> diffusion / taille de cellule
  inten: number,      // 0..1
  kind: "stratiform" | "convective",
  age: number,        // minutes
  seed: number        // pour bruit/turbulence stable
};
type ForecastAdvectedFrame = {
  type: "forecast_adv",
  time: Date,
  ts: number,
  cells: RainCell[],
  wind: { speed: number, dir: number } // pour debug
};
function stepCells(cells, wind, env, dtMin) {

  const out = [];

  for (const c of cells) {

    /* ===============================
       1) Advection vent
    =============================== */

    const { dLat, dLon } =
      windToDeltaLatLon(wind.speed, wind.dirFrom, c.lat, dtMin);

    c.lat += dLat;
    c.lon += dLon;

    /* ===============================
       2) Turbulence douce
    =============================== */

    const turb = 0.15;
    const j = jitter2D(c.seed, c.age);

    const latRad = c.lat * Math.PI / 180;

    c.lat += (j.y * turb) / 111;
    c.lon += (j.x * turb) / (111 * Math.cos(latRad));

    /* ===============================
       3) Expansion cellule
    =============================== */

    const expand = (c.kind === "stratiform" ? 0.15 : 0.05);
    c.rKm = clamp(c.rKm + expand * dtMin, 2, 80);

    /* ===============================
       4) Activité atmosphérique ⭐ IMPORTANT
    =============================== */

    const A = activityIndex({
      cloud: env.cloud,
      humidity: env.humidity,
      rain: env.rain ?? 0
    });

    /* ===============================
       5) Dissipation réaliste
    =============================== */

    const baseDecay = 0.008;
    const hum = (env.humidity ?? 80) / 100;

    const decayFactor =
      Math.exp(-baseDecay * dtMin * (1.2 - hum));

    /* ⭐ Intensité pilotée par activité + dissipation */

    c.inten = clamp(
      Math.max(A * 0.6, c.inten * decayFactor),
      0,
      1
    );

    /* ===============================
       6) Croissance convective (option)
    =============================== */

    const cloud = (env.cloud ?? 70) / 100;

    if (cloud > 0.85 && hum > 0.85) {

      const grow =
        (c.kind === "convective" ? 0.006 : 0.002);

      c.inten = clamp(c.inten + grow * dtMin, 0, 1);
    }

    /* ===============================
       7) Vieillissement
    =============================== */

    c.age += dtMin;

    /* ⭐ Filtre plus permissif pour garder nuages faibles */

    if (c.inten < 0.015) continue;

    out.push(c);
  }

  return mergeAndSplit(out);
}
function activityIndex({ cloud, humidity, rain }) {

  const c = (cloud ?? 0) / 100;
  const h = (humidity ?? 0) / 100;
  const r = normRain(rain ?? 0);

  let A = 0.55*c + 0.30*h + 0.90*r;

  if (c > 0.7) A = Math.max(A, 0.25);

  return clamp(A, 0, 1);
}

function mergeAndSplit(cells) {
  // Merge si centres proches et intensités compatibles
  // Split si très grosse cellule convective (option)
  // V1 simple :
  const merged = [];
  const used = new Set();

  for (let i=0;i<cells.length;i++){
    if (used.has(i)) continue;
    let a = cells[i];

    for (let j=i+1;j<cells.length;j++){
      if (used.has(j)) continue;
      const b = cells[j];
      const dKm = haversineKm(a.lat,a.lon,b.lat,b.lon);

      const mergeDist = (a.rKm + b.rKm) * 0.35;
      if (dKm < mergeDist) {
        // barycentre pondéré par intensité
        const w1 = a.inten, w2 = b.inten;
        a.lat = (a.lat*w1 + b.lat*w2) / (w1+w2);
        a.lon = (a.lon*w1 + b.lon*w2) / (w1+w2);
        a.inten = clamp((a.inten + b.inten) * 0.55, 0, 1);
        a.rKm = clamp(Math.sqrt(a.rKm*a.rKm + b.rKm*b.rKm), 2, 100);
        used.add(j);
      }
    }

    merged.push(a);
  }
  return merged;
}
function renderCellsToCanvas(ctx, cells, project) {

  for (const c of cells) {

    const p = project(c.lat, c.lon);
    if (!p) continue;

    const rPx = kmToPixels(c.rKm, c.lat);

    const g = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, rPx
    );

    const a = clamp(c.inten, 0, 1);

    g.addColorStop(0.0, `rgba(0,180,255,${0.50*a})`);
    g.addColorStop(0.5, `rgba(0,180,255,${0.20*a})`);
    g.addColorStop(1.0, `rgba(0,180,255,0)`);

    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(p.x, p.y, rPx, 0, Math.PI*2);
    ctx.fill();
  }
}