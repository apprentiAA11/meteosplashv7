// controllers/historyController.js

import { setWeatherState, getWeather } from "../state/weatherState.js";
import { setSelectedCity } from "../state/cityState.js";

let lastLiveCity = null;

/* ===============================
   API PUBLIQUE
================================ */

export function initHistoryController() {
  console.log("🕰 HistoryController ready");

  document.addEventListener("history:show", e => {
    const date = e.detail?.date;
    if (!date) return;
    loadHistoricalWeather(date);
  });

  document.addEventListener("history:back", () => {
    restoreLiveWeather();
  });
}

/* ===============================
   HISTORIQUE
================================ */

async function loadHistoricalWeather(dateStr) {
  const current = getWeather();
  const city = current?.city;
  if (!city) return;

  lastLiveCity = city;

  setWeatherState({
    city,
    raw: null,
    loading: true,
    mode: "history",
    historyDate: dateStr
  });

  try {
    const url =
      "https://archive-api.open-meteo.com/v1/archive" +
      `?latitude=${city.lat}&longitude=${city.lon}` +
      `&start_date=${dateStr}&end_date=${dateStr}` +
      "&hourly=temperature_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,cloud_cover" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum" +
      "&timezone=auto";

    const r = await fetch(url);
    if (!r.ok) throw new Error("Archive API error");

    const raw = await r.json();

    setWeatherState({
      city,
      raw,
      loading: false,
      mode: "history",
      historyDate: dateStr
    });

  } catch (e) {
    console.error("🕰 History error", e);
    setWeatherState({ city, raw: null, error: true });
  }
}

/* ===============================
   RETOUR LIVE
================================ */

function restoreLiveWeather() {
 if (!lastLiveCity) return;

  // ✅ on repasse par le state officiel
  setSelectedCity(lastLiveCity);
}