// ui/forecastUI.js — PRO (source unique de rendu 7/14j)

import { onWeatherChange } from "../state/weatherState.js";
import { openDayOverlayByDate } from "./dayOverlayUI.js";

let currentMode = 7;
let lastDaily = null;

export function initForecastUI() {
  console.log("📅 ForecastUI PRO ready");

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
  if (!weather?.raw?.daily) return;
  lastDaily = weather.raw.daily;
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
   RENDER UNIQUE
================================ */

function renderForecast() {
  if (!lastDaily) return;

  const list = document.getElementById("forecast-list");
  if (!list) return;

  list.innerHTML = "";

  const d = lastDaily;

  const times = d.time || [];
  const tmax  = d.temperature_2m_max || [];
  const tmin  = d.temperature_2m_min || [];
  const rain  = d.precipitation_sum || [];
  const pop   = d.precipitation_probability_max || [];
  const windSpeed = d.wind_speed_10m_max || [];
  const windGusts = d.wind_gusts_10m_max || [];
  const codes = d.weather_code || [];

  const count = Math.min(currentMode, times.length);

  for (let i = 0; i < count; i++) {
    const date = new Date(times[i]);

    const row = document.createElement("div");
    row.className = "forecast-row";
   
    row.dataset.day = times[i];
    row.style.cursor = "pointer";
    
    row.addEventListener("click", () => {
  // ferme la popup prévisions
  document.getElementById("forecast-overlay")
    ?.classList.remove("active");

  // ouvre le détail jour
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
            <span class="forecast-max">${Math.round(tmax[i] ?? 0)}°</span>
            <span class="forecast-min">${Math.round(tmin[i] ?? 0)}°</span>
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