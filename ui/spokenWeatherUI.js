import { getWeather } from "../state/weatherState.js";

let btn;

export function initSpokenWeatherUI() {
  btn = document.getElementById("btn-spoken-weather");
  if (!btn) return;

  btn.addEventListener("click", speakWeather);
}

function speakWeather() {
  const weather = getWeather();
  const raw = weather?.raw;
  const city = weather?.city;

  if (!raw?.current) return;

  const c = raw.current;

  const temp = Math.round(c.temperature_2m ?? 0);
  const feels = Math.round(c.apparent_temperature ?? temp);
  const wind = Math.round(c.wind_speed_10m ?? 0);
  const gust = Math.round(c.wind_gusts_10m ?? wind);
  const humidity = Math.round(c.relative_humidity_2m ?? 0);
  const rain = c.precipitation ?? 0;
  const windDeg = c.wind_direction_10m ?? null;

  const description = buildWeatherSentence({
    cityName: city?.name || "",
    temp,
    feels,
    wind,
    gust,
    humidity,
    rain,
    code: c.weather_code,
    windDeg
  });

  speak(description);
}

/* =============================
   Phrase intelligente
============================= */

function buildWeatherSentence(data) {
  const { cityName, temp, feels, wind, gust, humidity, rain, code, windDeg } = data;

  const sky = getSkyDescription(code);
  const windDirection = degToDirection(windDeg);

  return `
    À ${cityName}, ${sky}.
    Température ${temp} degrés.
    Ressenti ${feels} degrés.
    Humidité ${humidity} pourcent.
    Vent ${wind} kilomètres heure,
    de direction ${windDirection},
    avec des rafales jusqu'à ${gust}.
    ${rain > 0 ? `Précipitations ${rain} millimètres.` : ""}
  `;
}

/* =============================
   Direction du vent
============================= */

function degToDirection(deg) {
  if (deg == null) return "";

  const directions = [
    "Nord",
    "Nord-Est",
    "Est",
    "Sud-Est",
    "Sud",
    "Sud-Ouest",
    "Ouest",
    "Nord-Ouest"
  ];

  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/* =============================
   Description ciel
============================= */

function getSkyDescription(code) {
  if (code === 0) return "ciel dégagé";
  if (code <= 2) return "partiellement nuageux";
  if (code <= 3) return "nuageux";
  if (code <= 48) return "brumeux";
  if (code <= 67) return "pluvieux";
  if (code <= 77) return "neigeux";
  if (code <= 82) return "averses";
  if (code <= 99) return "orageux";
  return "conditions variables";
}

/* =============================
   Synthèse vocale
============================= */

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}
