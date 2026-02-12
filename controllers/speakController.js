// controllers/speakController.js

import { getWeather } from "../state/weatherState.js";

export function initSpeakController() {
  const btn = document.getElementById("btn-speak");
  if (!btn) return;

  btn.addEventListener("click", speakWeather);
}

function speakWeather() {
  const weather = getWeather();
  if (!weather?.raw?.current) return;

  const c = weather.raw.current;

  const text = `
    Température ${Math.round(c.temperature_2m)} degrés.
    Humidité ${c.relative_humidity_2m} pourcent.
    Vent ${Math.round(c.wind_speed_10m)} kilomètres par heure.
  `;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
