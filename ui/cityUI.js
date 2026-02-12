// ui/cityUI.js

import { setSelectedCity, removeCity, resetCities, isSameCity } from "../state/cityState.js";

let cities = [];
let selectedCity = null;


export function initCityUI() {
  console.log("🏙 CityUI ready");

  // ✅ bouton réinitialiser : supprime toutes les villes sauf "Ma position"
  const btnReset = document.getElementById("btn-reset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      resetCities();
    });
  }

  document.addEventListener("city:update", e => {
  console.log("👀 CityUI reçoit update", e.detail);

  cities = Array.isArray(e.detail?.cities) ? e.detail.cities : [];
  selectedCity = e.detail?.selectedCity || null;

  render();
});
}

function render() {
  if (!Array.isArray(cities)) return;
  console.log("🎨 CITY RENDER", cities);

  const container = document.getElementById("city-list");
  if (!container) return;

  container.innerHTML = "";

  cities.forEach((city, i) => {
    console.log(
      "🌤 city check",
      city.name,
      !!city.weatherRaw,
      city.weatherRaw?.current?.weather_code,
      city.isNight
    );

    const div = document.createElement("div");
    div.className = "city-item";

    /* =================================================
       🌦 FOND + MICRO-ANIMATION MÉTÉO (RÉALISTE)
    ================================================= */

    if (selectedCity && isSameCity(city, selectedCity) && city.weatherRaw) {
      const isNight = city.isNight;
      const current = city.weatherRaw.current;

      // classe météo (fond)
      const cls = getWeatherClass(current, isNight);
      div.classList.add(cls);

      // --- données météo ---
      const rain   = Number(current.precipitation ?? 0);
      const clouds = Number(current.cloud_cover ?? 0);
      const snow   = Number(current.snowfall ?? 0);

      // --- intensité réaliste (non linéaire) ---
      // pluie/neige dominante + nuages en soutien
      const intensity = Math.min(
        0.6,
        Math.sqrt(rain + snow) / 3 + clouds / 300
      );

      // --- vitesse réaliste ---
      // pluie rapide / neige lente
      let speed = 4.2; // neige par défaut
      if (rain > 0) {
        speed = 1.8 - Math.min(rain / 8, 1);
      }

      // injection CSS vars
      div.style.setProperty("--wx-intensity", intensity.toFixed(2));
      div.style.setProperty("--wx-speed", `${speed.toFixed(2)}s`);
    }

    /* =================================================
       ⭐ ÉTATS UI
    ================================================= */

    if (selectedCity && isSameCity(city, selectedCity)) {
      div.classList.add("city-item-active");
    }

    if (city.isUserLocation) {
      div.classList.add("city-item-locked");
    }

    /* =================================================
       HTML
    ================================================= */

    div.innerHTML = `
      <div class="city-left">
        <strong>${city.name}</strong><br>
        <small>
          ${city.country || ""}
          ${city.isUserLocation ? `<span class="city-badge">Ma position</span>` : ""}
          <span class="coords"> · ${city.lat.toFixed(2)}, ${city.lon.toFixed(2)}</span>
        </small>
      </div>

      <div class="city-right">
        <span class="city-temp">
          ${city.temp != null ? Math.round(city.temp) + "°" : "—"}
        </span>
        <button class="city-remove" aria-label="Supprimer">✕</button>
      </div>
    `;

    /* =================================================
       EVENTS
    ================================================= */

    div.addEventListener("click", () => setSelectedCity(city));

    const btn = div.querySelector(".city-remove");
    if (btn) {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        if (city.isUserLocation) return;
        removeCity(i);
      });

      if (city.isUserLocation) {
        btn.style.display = "none";
      }
    }

    container.appendChild(div);
  });
}


function getWeatherClass(current, isNight){
  const code = current.weather_code;

  // ☀️ / 🌙 clair
  if ([0].includes(code)) {
    return isNight ? "weather-clear-night" : "weather-clear-day";
  }

  // ☁️ nuages
  if ([1,2,3].includes(code)) {
    return isNight ? "weather-cloudy-night" : "weather-cloudy-day";
  }

  // 🌧 pluie
  if ([51,53,55,61,63,65,80,81,82].includes(code)) {
    return isNight ? "weather-rain-night" : "weather-rain-day";
  }

  // ❄️ neige
  if ([71,73,75,77,85,86].includes(code)) {
    return isNight ? "weather-snow-night" : "weather-snow-day";
  }

  return isNight ? "weather-cloudy-night" : "weather-cloudy-day";
}
