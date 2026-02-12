import { setRadarState, getRadarState } from "../state/radarState.js";

let timer = null;

/* ===================================================== */
/* LOAD RAIN RADAR — PAST ONLY (-2h → NOW) */
/* ===================================================== */

export async function loadRainRadar(city) {

  const H_PAST = 2; // heures de passé

  try {

    const res  = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await res.json();

    const now = Date.now();

    // =============================
    // Radar réel uniquement
    // =============================

    let frames = data.radar.past
      .map(f => ({
        time: new Date(f.time * 1000),
        ts: f.time * 1000,
        tileUrl: `${data.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
        type: "rain"
      }))
      .filter(f =>
        f.ts >= now - H_PAST * 60 * 60 * 1000 &&
        f.ts <= now // 🔥 on bloque à l'instant T
      );

    frames.sort((a, b) => a.ts - b.ts);
if (!frames.length) {
  setRadarState({
    city,
    frames: [],
    index: 0,
    loading: false,
    mode: "rain",
    playing: false
  });
  return;
}
const idxNow = frames.length - 1;

    setRadarState({
      city,
      frames,
      index: idxNow,
      loading: false,
      mode: "rain",
      playing: false
    });

  } catch (e) {
    console.error("Radar error", e);
    setRadarState({ loading: false });
  }
}

/* ===================================================== */
/* WIND RADAR */
/* ===================================================== */

export function loadWindRadar(city, raw) {

  const c = raw?.current;
  if (!city || !c) return;

  setRadarState({
    city,
    mode: "wind",
    frames: [{
      type: "wind",
      data: {
        speed: Number(c.wind_speed_10m),
        dir: Number(c.wind_direction_10m)
      }
    }],
    index: 0,
    loading: false,
    playing: false
  });
}

/* ===================================================== */
/* PLAY / STOP */
/* ===================================================== */

export function playRadar() {

  stopRadar();

  const s = getRadarState();
  if (!s.frames?.length) return;

  // 🔥 on démarre à la première frame (-2h)
  setRadarState({
    index: 0,
    playing: true
  });

  timer = setInterval(() => {

    const st = getRadarState();
    if (!st.frames.length) return;

    if (st.index >= st.frames.length - 1) {
      stopRadar();
      return;
    }

    setRadarState({
      index: st.index + 1
    });

  }, 900);
}

export function stopRadar() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  setRadarState({ playing: false });
}
