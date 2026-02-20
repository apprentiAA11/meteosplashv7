// ui/weather/timeline24hUI.js

import { onTimeChange } from "../../state/timeState.js";
import { openHourOverlay } from "../hourOverlayUI.js";
import { getLiveTemperature } from "../../state/weatherState.js";
import { getUnit, formatShort, getColor } from "../../utils/tempEngine.js";
import { createTempToggle } from "../../components/tempToggle.js";

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

let isInit = false;

export function initTimeline24hUI() {
  if (isInit) return;
  isInit = true;

  const view = document.getElementById("view-24h");
  if (!view) return;

  // 🔥 évite doublon si re-init
  const existing = view.querySelector(".temp-toggle-btn");
  if (existing) existing.remove();

  const toggle = createTempToggle();
  if (toggle) view.prepend(toggle);
}

function render() {
  const unit = getUnit();
  const el = getContainer();
  if (!el || !lastRaw?.hourly || !lastRaw?.current) return;

  const h = lastRaw.hourly;
  const times = h.time;
  const temps = h.temperature_2m;
  const codes = h.weather_code;

  const now = new Date(lastRaw.current.time);
  const nowMs = now.getTime();

  let startIndex = times.findIndex(t => new Date(t).getTime() >= nowMs);
  if (startIndex < 0) startIndex = 0;

  const sliceEnd = Math.min(startIndex + 24, times.length);

  const frag = document.createDocumentFragment();

for (let i = startIndex; i < sliceEnd; i++) {

  let temp = Number(temps?.[i]);
  if (!Number.isFinite(temp)) temp = null;

  // 🔥 LIVE sur heure courante
  if (i === startIndex) {
    const live = getLiveTemperature();
    if (Number.isFinite(live)) temp = live;
  }

  // ✅ couleur via tempEngine
  const color = temp != null
    ? getColor(temp)
    : "rgba(255,255,255,.6)";

  const item = document.createElement("div");
  item.className = "timeline-hour";

  if (i === startIndex) {
    item.classList.add("active");
  }

  item.innerHTML = `
    <div class="hour">${times[i].slice(11, 13)}h</div>
    <div class="icon">${getWeatherEmoji(codes[i])}</div>
    <div class="temp" style="color:${color}">
      ${formatShort(temp, unit)}
    </div>
  `;

  item.addEventListener("click", () => {
    openHourOverlay(i);
  });

  frag.appendChild(item);
}

el.innerHTML = "";
el.appendChild(frag);

}

 // ✅ FERMETURE IMPORTANTE

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
/* ===============================
   LIVE UPDATE (SANS REPAINT)
================================ */

document.addEventListener("time:tick", () => {
  const el = getContainer();
  if (!el || !lastRaw?.hourly) return;

  const times = lastRaw.hourly.time;
  const now = Date.now();

  let newIndex = times.findIndex(t => new Date(t).getTime() >= now);
  if (newIndex < 0) return;

  const items = el.querySelectorAll(".timeline-hour");

  items.forEach(i => i.classList.remove("active"));

  if (items[newIndex]) {
    items[newIndex].classList.add("active");
  }
});
document.addEventListener("temp:unit-change", () => {
  if (lastRaw) render();
});

