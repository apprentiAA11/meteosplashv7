// ui/weatherUI.js

import { renderCurrent } from "./weather/currentUI.js";
import { renderWind } from "./weather/windUI.js";
import { renderTimeline24h } from "./weather/timeline24hUI.js";
import { applyRainFX } from "./weather/rainFX.js";
import { applyWeatherAnimations } from "./weather/weatherFX.js";
import { updateTip } from "./weather/tipUI.js";
import { onWeatherChange } from "../state/weatherState.js";

export function initWeatherUI() {
  console.log("🖼 WeatherUI ready");

  onWeatherChange(weather => {
    if (!weather?.raw) return;

    const raw = weather.raw;

    try {

      /* ===== MODE LIVE + FORECAST ===== */
  if (weather.mode !== "history") {
    renderCurrent(raw);
    renderWind(raw);
    renderTimeline24h(raw);
    applyRainFX(raw);
    applyWeatherAnimations(raw);
    updateTip(weather);
  }


      /* ===== MODE HISTORIQUE ===== */
      if (weather.mode === "history") {
        renderHistoryDetails(raw, weather.historyDate);
      }

    } catch (err) {
      console.warn("WeatherUI render skipped", err);
    }
  });
}

/* ===============================
   HISTORIQUE → UI
================================ */

function renderHistoryDetails(raw, dateStr) {
  const box = document.getElementById("history-result");
  if (!box || !raw?.daily) return;

  box.innerHTML = `
    <h3>Météo du ${new Date(dateStr).toLocaleDateString("fr-FR")}</h3>

    <p>🌡 Température max : ${raw.daily.temperature_2m_max[0]} °C</p>
    <p>🌡 Température min : ${raw.daily.temperature_2m_min[0]} °C</p>
    <p>🌧 Pluie : ${raw.daily.precipitation_sum[0]} mm</p>
    <p>💨 Vent max : ${raw.hourly.wind_speed_10m?.[0] ?? "—"} km/h</p>
  `;
}