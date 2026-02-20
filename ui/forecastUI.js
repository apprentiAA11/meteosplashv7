// ui/forecastUI.js — PRO CLEAN (7/14 jours)

import { onWeatherChange } from "../state/weatherState.js";
import { openDayOverlayByDate } from "./dayOverlayUI.js";
import { createTempToggle } from "../components/tempToggle.js";
import { format } from "../utils/tempEngine.js";
import { getUnit } from "../utils/tempEngine.js";

let currentMode = 7;
let lastDaily = null;

export function initForecastUI() {
  console.log("📅 ForecastUI ready");

  document.getElementById("btn-forecast-7")
    ?.addEventListener("click", () => setMode(7));

  document.getElementById("btn-forecast-14")
    ?.addEventListener("click", () => setMode(14));

  onWeatherChange(handleWeather);
}

/* ===============================
   DATA → UI
================================ */

function handleWeather(weather) {
console.log("FORECAST RAW", weather); // 👈 AJOUT
  if (!weather?.raw?.daily) return;
  lastDaily = weather.raw.daily;
 console.log("DAILY", lastDaily); // 👈 AJOUT
  renderForecast();
}

/* ===============================
   MODE
================================ */

function setMode(days) {
  currentMode = days;

  document.getElementById("btn-forecast-7")
    ?.classList.toggle("pill-button-active", days === 7);

  document.getElementById("btn-forecast-14")
    ?.classList.toggle("pill-button-active", days === 14);

  renderForecast();
}

/* ===============================
   RENDER
================================ */

function renderForecast() {
const unit = getUnit();

  if (!lastDaily) return;

  const list = document.getElementById("forecast-list");
  const container = list; // ou parent si besoin

  list.innerHTML = "";

  /* ✅ TOGGLE (sans duplication) */
  const oldToggle = container.querySelector(".temp-toggle-btn");
  if (oldToggle) oldToggle.remove();

  const toggle = createTempToggle();
  if (toggle) container.prepend(toggle);

  /* ================= DATA ================= */

const d = lastDaily || {};
console.log("USING DAILY", d);


  const times = d.time || [];
  const tmax  = d.temperature_2m_max || [];
  const tmin  = d.temperature_2m_min || [];
  const rain  = d.precipitation_sum || [];
  const pop   = d.precipitation_probability_max || [];
  const windSpeed = d.wind_speed_10m_max || [];
  const windGusts = d.wind_gusts_10m_max || [];
  const codes = d.weather_code || [];

if (!times.length) {
  console.warn("❌ NO FORECAST DATA");
  return;
}
  const count = Math.min(currentMode, times.length);

  /* ================= LOOP ================= */

  for (let i = 0; i < count; i++) {
    const date = new Date(times[i]);

    const row = document.createElement("div");
    row.className = "forecast-row";
    row.dataset.day = times[i];
    row.style.cursor = "pointer";

    row.addEventListener("click", () => {
      document.getElementById("forecast-overlay")
        ?.classList.remove("active");

      openDayOverlayByDate(times[i], true);
    });

    row.innerHTML = `
      <div class="forecast-card">

        <div class="forecast-left">
          <div class="forecast-date">
            ${date.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short"
            })}
          </div>
          <div class="forecast-icon">${getIcon(codes[i])}</div>
        </div>

        <div class="forecast-center">
          <div class="forecast-temps">
            <span class="forecast-max">${format(tmax[i], unit)}</span>
            <span class="forecast-min">${format(tmin[i], unit)}</span>
          </div>
          <div class="forecast-labels">
            <span>max</span>
            <span>min</span>
          </div>
        </div>

        <div class="forecast-right">
          <div class="forecast-metric">🌧 <span>${fmt(rain[i])} mm</span></div>
          <div class="forecast-metric">💧 <span>${fmt(pop[i])}%</span></div>
          <div class="forecast-metric">
            💨 <span>${fmt(windGusts[i] ?? windSpeed[i])} km/h</span>
          </div>
        </div>

      </div>
    `;

    list.appendChild(row);
  }
}

/* ===============================
   HELPERS
================================ */

function fmt(v) {
  const n = Number(v);
  if (!isFinite(n)) return "0";
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
}

function getIcon(code) {
  if (code === 0) return "☀️";
  if ([1,2].includes(code)) return "🌤";
  if (code === 3) return "☁️";
  if ([45,48].includes(code)) return "🌫";
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return "🌧";
  if ([71,73,75,77,85,86].includes(code)) return "❄️";
  if ([95,96,99].includes(code)) return "⛈";
  return "•";
}

/* ===============================
   UNIT CHANGE REFRESH
================================ */
document.addEventListener("weather:update", () => {
  renderForecast();
});

