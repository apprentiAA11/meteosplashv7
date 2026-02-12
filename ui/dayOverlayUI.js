// ui/dayOverlayUI.js

import {
  isoToCityMs,
  formatCityHMFromMs,
  findBaseIndexForNow
} from "../core/utils.js";

import { onWeatherChange } from "../state/weatherState.js";
import { openOverlay, closeOverlay } from "./overlayManager.js";

let overlay, titleEl, subtitleEl, btnClose, backdrop;
let model = null;
let currentDaySeries = null;
let isReady = false;
let returnToForecast = false;

/* ================= INIT ================= */

export function initDayOverlayUI() {
  console.log("📊 DayOverlayUI ready");

  overlay    = document.getElementById("day-overlay");
  titleEl    = document.getElementById("day-overlay-title");
  subtitleEl = document.getElementById("day-overlay-subtitle");
  btnClose   = document.getElementById("btn-close-day");
  backdrop   = overlay?.querySelector(".overlay-backdrop");

  btnClose?.addEventListener("click", closeDayOverlay);
  backdrop?.addEventListener("click", closeDayOverlay);

  initDayTabs();

  onWeatherChange(weather => {
    model = weather?.raw || null;
    isReady = !!(model?.hourly && model?.daily);
  });
}

/* ================= TABS ================= */

function initDayTabs() {
  const tabs = document.querySelectorAll(".day-tabs button");

  const graphs = {
    temp: document.getElementById("chart-temp"),
    rain: document.getElementById("chart-rain"),
    wind: document.getElementById("chart-wind"),
    humidity: document.getElementById("chart-humidity")
  };

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.daytab;

      tabs.forEach(b => b.classList.remove("pill-button-active"));
      btn.classList.add("pill-button-active");

      Object.values(graphs).forEach(g =>
        g.classList.remove("active-day-graph")
      );
      graphs[key]?.classList.add("active-day-graph");
    });
  });
}

/* ================= OPEN 24H ================= */

export function open24hOverlay() {
  if (!overlay || !isReady || !model?.hourly) return;

  const h = model.hourly;
  const offset = model.utc_offset_seconds || 0;
  const baseIndex = findBaseIndexForNow(h.time, offset);

  const hours = [], temps = [], rains = [], winds = [], humidities = [];
  const max = Math.min(baseIndex + 24, h.time.length);

  for (let i = baseIndex; i < max; i++) {
    const cityMs = isoToCityMs(h.time[i], offset);

    hours.push(new Date(cityMs).getUTCHours());
    temps.push(h.temperature_2m?.[i] ?? 0);
    rains.push(h.precipitation?.[i] ?? h.rain?.[i] ?? 0);
    winds.push(h.wind_speed_10m?.[i] ?? 0);
    humidities.push(
      h.relative_humidity_2m?.[i] ??
      h.relativehumidity_2m?.[i] ??
      h.humidity?.[i] ??
      0
    );
  }

  currentDaySeries = { hours, temps, rains, winds, humidities };

  titleEl.textContent = "Prochaines 24 h";

  if (h.time[baseIndex]) {
    const from = isoToCityMs(h.time[baseIndex], offset);
    const to   = isoToCityMs(h.time[max - 1], offset);
    subtitleEl.textContent =
      `De ${formatCityHMFromMs(from)} à ${formatCityHMFromMs(to)}`;
  }

  openOverlay(overlay);
  setTimeout(publishData, 60);
}

/* ================= CLOSE ================= */

export function closeDayOverlay() {
  closeOverlay(overlay);

  if (returnToForecast) {
    const forecast = document.getElementById("forecast-overlay");
    forecast?.classList.add("active");
    document.body.classList.add("overlay-open", "no-scroll");
    returnToForecast = false;
  }
}

/* ================= DATA BRIDGE ================= */

function publishData() {
  if (!currentDaySeries) return;

  document.dispatchEvent(new CustomEvent("dayoverlay:data", {
    detail: currentDaySeries
  }));
}
export function openDayOverlayByDate(isoDate, fromForecast = false) {
  returnToForecast = fromForecast;
  if (!overlay || !isReady || !model?.hourly) return;

  const h = model.hourly;
  const offset = model.utc_offset_seconds || 0;

  // borne jour sélectionné (00:00 → 23:59 ville)
  const dayStart = new Date(isoDate + "T00:00:00Z").getTime();
  const dayEnd   = dayStart + 24 * 3600 * 1000;

  const hours = [], temps = [], rains = [], winds = [], humidities = [];

  for (let i = 0; i < h.time.length; i++) {
    const cityMs = isoToCityMs(h.time[i], offset);

    if (cityMs >= dayStart && cityMs < dayEnd) {
      hours.push(new Date(cityMs).getUTCHours());
      temps.push(h.temperature_2m?.[i] ?? 0);
      rains.push(h.precipitation?.[i] ?? h.rain?.[i] ?? 0);
      winds.push(h.wind_speed_10m?.[i] ?? 0);
      humidities.push(
        h.relative_humidity_2m?.[i] ??
        h.relativehumidity_2m?.[i] ??
        h.humidity?.[i] ?? 0
      );
    }
  }

  currentDaySeries = { hours, temps, rains, winds, humidities };

  const d = new Date(isoDate);
  if (titleEl) {
    titleEl.textContent = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    });
  }

  if (subtitleEl) {
    subtitleEl.textContent = "Prévisions heure par heure";
  }

  openOverlay(overlay);
  setTimeout(publishData, 60);
}