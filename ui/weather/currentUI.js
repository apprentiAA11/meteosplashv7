// ui/weather/currentUI.js
import { initDetailsGridDrag } from "./detailsGridDrag.js";
import { getLiveTemperature } from "../../state/weatherState.js";
import { getUnit, format } from "../../utils/tempEngine.js";
import { getWeather } from "../../state/weatherState.js";
import { createTempToggle } from "../../components/tempToggle.js";

export function renderCurrent(j) {
  const unit = getUnit();

  const wrap = document.getElementById("details-current");
  if (!wrap || !j?.current) return;

  const c = j.current;


  const pluieTotal = (c.rain ?? 0) + (c.showers ?? 0);

  const wind = c.wind_speed_10m;
  const gust = c.wind_gusts_10m;

  wrap.innerHTML = `

    <div class="detail-block" draggable="true" data-id="temp">
  <div class="detail-label">Température</div>
  <div class="detail-value">${format(c.temperature_2m, unit)}</div>
  <div class="detail-sub">Ressenti : ${format(c.temperature_2m, unit)}</div>
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
const toggle = createTempToggle();
if (toggle && !wrap.querySelector(".temp-toggle-btn")) {
  wrap.prepend(toggle);
}

  // ⚡ active le drag après rendu
  initDetailsGridDrag();
}

/* ===============================
   UTILS
================================ */

function round(v) {
  return Number.isFinite(v) ? Math.round(v) : "—";
}
function temp(v) {
  return Number.isFinite(v)
    ? v.toFixed(1)
    : "—";
}

function num(v, digits = 1) {
  return Number.isFinite(v) ? v.toFixed(digits) : "—";
}
/* ===============================
   LIVE UPDATE
================================ */

document.addEventListener("temp:tick", () => {
  const temp = getLiveTemperature();
  const unit = getUnit(); // ✅
  if (temp == null) return;

  const el = document.querySelector('[data-id="temp"] .detail-value');
  if (!el) return;

  el.textContent = format(temp, unit); // ✅ FIX

  el.classList.add("temp-live");
  setTimeout(() => el.classList.remove("temp-live"), 300);
});
document.addEventListener("temp:unit-change", () => {
  const weather = getWeather();
  if (weather?.raw) {
    renderCurrent(weather.raw);
  }
});
