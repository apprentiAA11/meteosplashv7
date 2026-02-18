// ui/weather/timeline24hUI.js

import { onTimeChange } from "../../state/timeState.js";
import { openHourOverlay } from "../hourOverlayUI.js";
import { getTemperatureColor } from "../../utils/colorUtils.js";

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

  const now = new Date(lastRaw.current.time);
  const nowMs = now.getTime();

  let startIndex = times.findIndex(t => {
    const tMs = new Date(t).getTime();
    return tMs >= nowMs;
  });

  if (startIndex < 0) startIndex = 0;

  const sliceEnd = Math.min(startIndex + 24, times.length);

  el.innerHTML = "";

  for (let i = startIndex; i < sliceEnd; i++) {

    const iso = times[i];
    const hour = iso?.slice(11, 13);

    const temp = Number(temps?.[i]);
    const tempDisplay = Number.isFinite(temp)
      ? Number(temp.toFixed(1))
      : "—";

    const code = codes?.[i];
    const color = getTemperatureColor(temp);

    const isNight = document.body.classList.contains("theme-night");

    const glow = isNight
      ? `0 0 10px ${color}`
      : temp > 30
        ? "0 0 10px rgba(255,0,0,.6)"
        : temp < 0
          ? "0 0 8px rgba(0,80,255,.6)"
          : "0 1px 2px rgba(0,0,0,.25)";

    const item = document.createElement("div");
    item.className = "timeline-hour";
    if (i === startIndex) item.classList.add("active");

    item.innerHTML = `
      <div class="hour">${hour}h</div>
      <div class="icon">${getWeatherEmoji(code)}</div>
      <div class="temp"
           style="color:${color}; text-shadow:${glow}">
        ${tempDisplay}°
      </div>
    `;

    item.addEventListener("click", () => {
      openHourOverlay(i);
    });

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
