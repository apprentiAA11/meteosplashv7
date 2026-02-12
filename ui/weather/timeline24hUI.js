// ui/weather/timeline24hUI.js

import { onTimeChange } from "../../state/timeState.js";

let container = null;
let lastRaw = null;

function getContainer() {
  if (!container) {
    container = document.getElementById("city-timeline-24h");
  }
  return container;
}

export function renderTimeline24h(raw) {
  lastRaw = raw;
  render();
}

export function initTimeline24hUI() {
  // on écoute toujours le tick pour rerender
  onTimeChange(() => render());
}

function render() {
  const el = getContainer();
  if (!el || !lastRaw?.hourly || !lastRaw?.current) return;

  el.classList.remove("hidden", "hidden-merged");
  el.style.display = "";

  const h = lastRaw.hourly;
  const times = h.time;
  const temps = h.temperature_2m;
  const codes = h.weather_code;

  /* ===============================
     ⏱ heure locale RÉELLE de la ville
     (source UNIQUE)
  =============================== */

  const now = new Date(lastRaw.current.time); // ✅ local ville
  const nowMs = now.getTime();

  /* ===============================
     🔎 index heure courante
  =============================== */

  let startIndex = times.findIndex(t => {
    const tMs = new Date(t).getTime(); // ✅ même référentiel
    return tMs >= nowMs;
  });

  if (startIndex < 0) startIndex = 0;

  const sliceEnd = Math.min(startIndex + 24, times.length);

  /* ===============================
     🧱 rendu
  =============================== */

  el.innerHTML = "";

  for (let i = startIndex; i < sliceEnd; i++) {
    const d = new Date(times[i]); // ✅ déjà local
    const hour = String(d.getHours()).padStart(2, "0");
    const temp = Math.round(temps[i]);
    const code = codes?.[i];

    const item = document.createElement("div");
    item.className = "timeline-hour";
    if (i === startIndex) item.classList.add("active");

    item.innerHTML = `
      <div class="hour">${hour}h</div>
      <div class="icon">${getWeatherEmoji(code)}</div>
      <div class="temp">${temp}°</div>
    `;

    el.appendChild(item);
  }
}

/* =====================================================
   SCROLL
===================================================== */

export function initCityTimelineScroll() {
  const t = document.getElementById("city-timeline-24h");
  const prev = document.getElementById("city-timeline-prev");
  const next = document.getElementById("city-timeline-next");

  if (!t || !prev || !next) {
    console.warn("⏱ timeline arrows missing");
    return;
  }

  prev.addEventListener("click", () => {
    t.scrollBy({ left: -260, behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    t.scrollBy({ left: 260, behavior: "smooth" });
  });
}

/* =====================================================
   ICONS
===================================================== */

function getWeatherEmoji(code) {
  if (code == null) return "❔";
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}
