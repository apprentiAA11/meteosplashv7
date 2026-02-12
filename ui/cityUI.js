// ui/cityUI.js

import {
  setSelectedCity,
  removeCity,
  resetCities,
  isSameCity
} from "../state/cityState.js";

import {
  open24hView,
  openForecastView,
  openHistoryView
} from "./detailsViewController.js";

let cities = [];
let selectedCity = null;

/* =====================================================
   INIT
===================================================== */

export function initCityUI() {
  console.log("🏙 CityUI ready");

  const btnReset = document.getElementById("btn-reset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      resetCities();
    });
  }

  document.addEventListener("city:update", e => {
    cities = Array.isArray(e.detail?.cities) ? e.detail.cities : [];
    selectedCity = e.detail?.selectedCity || null;
    render();
  });
}

/* =====================================================
   RENDER
===================================================== */

function render() {
  if (!Array.isArray(cities)) return;

  const container = document.getElementById("city-list");
  if (!container) return;

  container.innerHTML = "";

  cities.forEach((city, i) => {

    const t = city.temp != null ? Math.round(city.temp) : null;
    const tempColor = getTemperatureColor(t);

    const div = document.createElement("div");
    div.className = "city-item";

    /* ================= FOND MÉTÉO ================= */

    if (selectedCity && isSameCity(city, selectedCity) && city.weatherRaw) {

      const isNight = city.isNight;
      const current = city.weatherRaw.current;

      const cls = getWeatherClass(current, isNight);
      div.classList.add(cls);

      const rain   = Number(current.precipitation ?? 0);
      const clouds = Number(current.cloud_cover ?? 0);
      const snow   = Number(current.snowfall ?? 0);

      const intensity = Math.min(
        0.6,
        Math.sqrt(rain + snow) / 3 + clouds / 300
      );

      let speed = 4.2;
      if (rain > 0) {
        speed = 1.8 - Math.min(rain / 8, 1);
      }

      div.style.setProperty("--wx-intensity", intensity.toFixed(2));
      div.style.setProperty("--wx-speed", `${speed.toFixed(2)}s`);
    }

    /* ================= ÉTATS UI ================= */

    if (selectedCity && isSameCity(city, selectedCity)) {
      div.classList.add("city-item-active");
    }

    if (city.isUserLocation) {
      div.classList.add("city-item-locked");
    }

    /* ================= HTML ================= */

    div.innerHTML = `
      <div class="city-left">
        <div class="city-top-row">
          <strong>${city.name}</strong>

          ${
            selectedCity && isSameCity(city, selectedCity)
              ? `
            <div class="city-actions">
              <button class="mini-action" data-action="24h">24h</button>
              <button class="mini-action" data-action="forecast">7/14j</button>
              <button class="mini-action" data-action="history">Hist.</button>
            </div>
          `
              : ""
          }
        </div>

        <small>
          ${city.country || ""}
          ${city.isUserLocation ? `<span class="city-badge">Ma position</span>` : ""}
          <span class="coords"> · ${city.lat.toFixed(2)}, ${city.lon.toFixed(2)}</span>
        </small>
      </div>

      <div class="city-right">
        <span class="city-temp" style="color:${tempColor}">
          ${t != null ? t + "°" : "—"}
        </span>
        <button class="city-remove" aria-label="Supprimer">✕</button>
      </div>
    `;

    /* ================= MINI BOUTONS ================= */

    div.querySelectorAll(".mini-action").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const action = btn.dataset.action;

        if (action === "24h") open24hView();
        if (action === "forecast") openForecastView();
        if (action === "history") openHistoryView();
      });
    });

    /* ================= EVENTS ================= */

    div.addEventListener("click", () => setSelectedCity(city));

    const btnRemove = div.querySelector(".city-remove");
    if (btnRemove) {
      btnRemove.addEventListener("click", e => {
        e.stopPropagation();
        if (city.isUserLocation) return;
        removeCity(i);
      });

      if (city.isUserLocation) {
        btnRemove.style.display = "none";
      }
    }

    container.appendChild(div);
  });
}

/* =====================================================
   COULEUR TEMPÉRATURE
   Bleu foncé → Neutre → Rouge foncé
===================================================== */

function getTemperatureColor(t) {
  if (t == null || !Number.isFinite(t)) return "inherit";

  const min = -15;
  const max = 35;

  const x = Math.max(min, Math.min(max, t));

  if (x <= 10) {
    const k = (x - min) / (10 - min);
    const r = Math.round(60 + k * 190);
    const g = Math.round(120 + k * 130);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  } else {
    const k = (x - 10) / (max - 10);
    const r = 255;
    const g = Math.round(200 - k * 160);
    const b = Math.round(130 - k * 130);
    return `rgb(${r},${g},${b})`;
  }
}

/* =====================================================
   CLASSES MÉTÉO
===================================================== */

function getWeatherClass(current, isNight) {
  const code = current.weather_code;

  if ([0].includes(code)) {
    return isNight ? "weather-clear-night" : "weather-clear-day";
  }

  if ([1,2,3].includes(code)) {
    return isNight ? "weather-cloudy-night" : "weather-cloudy-day";
  }

  if ([51,53,55,61,63,65,80,81,82].includes(code)) {
    return isNight ? "weather-rain-night" : "weather-rain-day";
  }

  if ([71,73,75,77,85,86].includes(code)) {
    return isNight ? "weather-snow-night" : "weather-snow-day";
  }

  return isNight ? "weather-cloudy-night" : "weather-cloudy-day";
}
