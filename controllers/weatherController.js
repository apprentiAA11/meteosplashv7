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
    city.timezone = raw.timezone;
    city.utc_offset_seconds = raw.utc_offset_seconds;


    // 🌗 jour/nuit
    document.dispatchEvent(new CustomEvent("daynight:update", {
      detail: { raw }
    }));

    const enrichedCity = {
     ...city,
     raw
   };

   setWeatherState({ city: enrichedCity, raw, loading: false });
   updateCityWeather(enrichedCity, raw);

    loadMoonForCity(city, raw); // 🌙 fetch dédié
  } catch (e) {
    console.error("🌦 Weather error", e);
    lastKey = null;
    setWeatherState({ city, raw: null, error: true });
  }
}

/* =====================================================
   🌙 LUNE — MET Norway Sunrise API
===================================================== */
/* =====================================================
   🌙 LUNE — SunCalc (100% client, sans API externe)
===================================================== */

async function loadMoonForCity(city) {
  try {
    if (!city || typeof SunCalc === "undefined") return;

    const today = new Date();
// 🔥 Calcul direct des heures de la ville
    const times = SunCalc.getMoonTimes(
      today,
      city.lat,
      city.lon
    );

    const events = [];

    function normalizeToUTC(date) {
      if (!(date instanceof Date)) return null;

      // On enlève le fuseau navigateur
      return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      ));
    }

    if (times?.rise instanceof Date && !isNaN(times.rise)) {
      events.push({
        type: "rise",
        date: normalizeToUTC(times.rise)
      });
    }

    if (times?.set instanceof Date && !isNaN(times.set)) {
      events.push({
        type: "set",
        date: normalizeToUTC(times.set)
      });
    }

    setMoonEvents(events);

  } catch (e) {
    console.warn("🌙 Moon SunCalc error", e);
  }
}

