// controllers/weatherController.js

import { setWeatherState } from "../state/weatherState.js";
import { updateCityWeather } from "../state/cityState.js";
import { setMoonEvents } from "../state/moonState.js";

let lastKey = null;

export function initWeatherController() {
  console.log("🌦 WeatherController ready");

  document.addEventListener("city:update", e => {
    const city = e.detail?.selectedCity;
    if (!city) return;

    const key = `${city.name}_${city.lat.toFixed(3)}_${city.lon.toFixed(3)}`;

    // 🔒 évite de recharger inutilement la même ville
    if (key === lastKey) return;
    lastKey = key;

    // état immédiat
    setWeatherState({ city, raw: null, loading: true });

    loadWeatherForCity(city);
    loadMoonForCity(city); // 🌙 fetch dédié
  });
}

/* =====================================================
   🌦 METEO
===================================================== */

async function loadWeatherForCity(city) {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?" +
      "latitude=" + encodeURIComponent(city.lat) +
      "&longitude=" + encodeURIComponent(city.lon) +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,precipitation,rain,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl" +
      "&hourly=temperature_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,cloud_cover" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min," +
      "sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum," +
      "precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max" +
      "&forecast_days=14&timezone=auto";

    console.log("🌐 Open-Meteo URL =", url);

    const r = await fetch(url);
    if (!r.ok) throw new Error("Open-Meteo error");

    const raw = await r.json();

    // 🌗 jour/nuit
    document.dispatchEvent(new CustomEvent("daynight:update", {
      detail: { raw }
    }));

    setWeatherState({ city, raw, loading: false });
    updateCityWeather(city, raw);

  } catch (e) {
    console.error("🌦 Weather error", e);
    lastKey = null;
    setWeatherState({ city, raw: null, error: true });
  }
}

/* =====================================================
   🌙 LUNE — MET Norway Sunrise API
===================================================== */

async function loadMoonForCity(city) {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const url =
      "https://api.met.no/weatherapi/sunrise/3.0/moon" +
      "?lat=" + encodeURIComponent(city.lat) +
      "&lon=" + encodeURIComponent(city.lon) +
      "&date=" + today +
      "&offset=+00:00";

    console.log("🌙 Moon URL =", url);

    const r = await fetch(url, {
      headers: {
        "User-Agent": "MeteoSplash/1.0 https://meteosplash.app"
      }
    });

    if (!r.ok) throw new Error("MET Norway moon error");

    const data = await r.json();

    const events = [];

    const moon = data?.location?.time?.[0]?.moon;
    if (!moon) return;

    if (moon.moonrise?.time) {
      events.push({ type: "rise", date: moon.moonrise.time });
    }

    if (moon.moonset?.time) {
      events.push({ type: "set", date: moon.moonset.time });
    }

    setMoonEvents(events);

  } catch (e) {
    console.warn("🌙 Moon error", e);
  }
}