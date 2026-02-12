// ui/weather/currentUI.js
import { initDetailsGridDrag } from "./detailsGridDrag.js";

export function renderCurrent(j) {
  const wrap = document.getElementById("details-current");
  if (!wrap || !j?.current) return;

  const c = j.current;

  const pluieTotal = (c.rain ?? 0) + (c.showers ?? 0);

  const wind = c.wind_speed_10m;
  const gust = c.wind_gusts_10m;

  wrap.innerHTML = `

    <div class="detail-block" draggable="true" data-id="temp">
      <div class="detail-label">Température</div>
      <div class="detail-value">${round(c.temperature_2m)}°C</div>
      <div class="detail-sub">Ressenti : ${round(c.apparent_temperature)}°C</div>
    </div>

    <div class="detail-block" draggable="true" data-id="humidity">
      <div class="detail-label">Humidité</div>
      <div class="detail-value">${round(c.relative_humidity_2m)}%</div>
      <div class="detail-sub">Nuages : ${round(c.cloud_cover)}%</div>
    </div>

    <div class="detail-block" draggable="true" data-id="rain">
      <div class="detail-label">Précipitations</div>
      <div class="detail-value">${num(pluieTotal)} mm</div>
      <div class="detail-sub">Pluie : ${num(c.rain)} mm</div>
    </div>

    <div class="detail-block" draggable="true" data-id="snow">
      <div class="detail-label">Neige</div>
      <div class="detail-value">${num(c.snowfall)} mm</div>
      <div class="detail-sub">Averses : ${num(c.showers)} mm</div>
    </div>

    <div class="detail-block" draggable="true" data-id="pressure">
      <div class="detail-label">Pression</div>
      <div class="detail-value">${round(c.pressure_msl)} hPa</div>
      <div class="detail-sub">Niveau de la mer</div>
    </div>

    <div class="detail-block" draggable="true" data-id="wind">
      <div class="detail-label">Vent</div>
      <div class="detail-value">${round(wind)} km/h</div>
      <div class="detail-sub">Rafales : ${round(gust)} km/h</div>
    </div>
  `;

  // ⚡ active le drag après rendu
  initDetailsGridDrag();
}

/* ===============================
   UTILS
================================ */

function round(v) {
  return Number.isFinite(v) ? Math.round(v) : "—";
}

function num(v, digits = 1) {
  return Number.isFinite(v) ? v.toFixed(digits) : "—";
}