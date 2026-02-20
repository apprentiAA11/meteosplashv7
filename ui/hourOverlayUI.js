// ui/hourOverlayUI.js
import { openOverlay, closeOverlay } from "./overlayManager.js";
import { getWeather } from "../state/weatherState.js";
import { getWeatherIcon } from "../core/utils.js";
import { formatTemp } from "../utils/tempUtils.js";
import { getUnit } from "../utils/tempEngine.js";

let overlay, backdrop, btnClose;

export function initHourOverlayUI() {
  overlay   = document.getElementById("hour-overlay");
  backdrop  = overlay?.querySelector(".overlay-backdrop");
  btnClose  = document.getElementById("btn-close-hour");

  backdrop?.addEventListener("click", () => closeOverlay(overlay));
  btnClose?.addEventListener("click", () => closeOverlay(overlay));
}

export function openHourOverlay(hourIndex) {
 const weather = getWeather();
 const unit = getWeather()?.unit || "C";  // Utilise l'unité globale (°C ou °F) au lieu de forcer "C"
  const h = weather?.raw?.hourly;
  if (!h) return;

  const timeIso  = h.time?.[hourIndex];
  const temp     = h.temperature_2m?.[hourIndex];
  const humidity = h.relative_humidity_2m?.[hourIndex];
  const wind     = h.wind_speed_10m?.[hourIndex];
  const code     = h.weather_code?.[hourIndex];

  /* ===============================
     🌧 PLUIE
  ============================== */

  const rainRaw =
    h.rain?.[hourIndex] ??
    h.precipitation?.[hourIndex] ??
    0;

  const rain = Number.isFinite(rainRaw) ? rainRaw : 0;

  const rainDisplay = rain.toFixed(1);

  const rainLevel =
    rain > 5 ? "heavy" :
    rain > 1 ? "medium" :
    rain > 0.1 ? "light" : "none";

  const rainEl = document.getElementById("hour-rain");

  if (rainEl) {
    rainEl.textContent = `${rainDisplay} mm`;

    const parent = rainEl.closest(".hour-metric");

    if (parent) {
      parent.classList.remove("light","medium","heavy","none");
      parent.classList.add(rainLevel);
    }
  }

  /* ===============================
     CONTENU PRINCIPAL
  ============================== */

  const hhmm = timeIso ? timeIso.slice(11, 16) : "—";

  const titleEl = document.getElementById("hour-title");
  const iconEl  = document.getElementById("hour-icon");

  if (titleEl) titleEl.textContent = hhmm;
  if (iconEl)  iconEl.textContent  = getWeatherIcon(code) || "❔";
  
 document.getElementById("hour-temp").textContent =
  formatTemp(temp, unit);
  document.getElementById("hour-humidity").textContent = `${humidity ?? "—"} %`;
  document.getElementById("hour-wind").textContent     = `${wind ?? "—"} km/h`;

  openOverlay(overlay);
}
