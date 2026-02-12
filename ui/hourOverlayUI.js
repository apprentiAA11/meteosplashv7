// ui/hourOverlayUI.js
import { openOverlay, closeOverlay } from "./overlayManager.js";
import { getWeather } from "../state/weatherState.js";
import { getWeatherIcon } from "../core/utils.js";

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
  const h = weather?.raw?.hourly;
  if (!h) return;

  const timeIso  = h.time?.[hourIndex];                 // "YYYY-MM-DDTHH:MM"
  const temp     = h.temperature_2m?.[hourIndex];
  const humidity = h.relative_humidity_2m?.[hourIndex];
  const wind     = h.wind_speed_10m?.[hourIndex];
  const code     = h.weather_code?.[hourIndex];

  // ✅ heure ville fiable (pas dépendante du PC)
  const hhmm = timeIso ? timeIso.slice(11, 16) : "—";

  const titleEl = document.getElementById("hour-title");
  const iconEl  = document.getElementById("hour-icon");

  if (titleEl) titleEl.textContent = hhmm;
  if (iconEl)  iconEl.textContent  = getWeatherIcon(code) || "❔";

  document.getElementById("hour-temp").textContent     = `${temp ?? "—"} °C`;
  document.getElementById("hour-humidity").textContent = `${humidity ?? "—"} %`;
  document.getElementById("hour-wind").textContent     = `${wind ?? "—"} km/h`;

  openOverlay(overlay);
}
