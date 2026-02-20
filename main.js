// main.js

import { initThemeController } from "./controllers/themeController.js";
import { initTimeController } from "./controllers/timeController.js";
import { initWeatherController } from "./controllers/weatherController.js";
import { initCityController } from "./controllers/cityController.js";
import { initSunController } from "./controllers/sunController.js";
import { initCitySearchController } from "./controllers/citySearchController.js";
import { initForecastOverlayUI } from "./ui/forecastOverlayUI.js";
import { initHistoryController } from "./controllers/historyController.js";
import { initHistoryUI } from "./ui/historyUI.js";
import { initMoonController } from "./controllers/moonController.js";
import { initHourOverlayUI } from "./ui/hourOverlayUI.js";
import { initTempUnitUI } from "./ui/tempUnitUI.js";

import { showStatusToast } from "./ui/statusUI.js";
import { open24hOverlay } from "./ui/dayOverlayUI.js";
import { initTimeline24hUI, initCityTimelineScroll } from "./ui/weather/timeline24hUI.js";

import { initDayGraphsUI } from "./ui/dayGraphsUI.js";
import "./ui/currentDetailsUI.js";
import { initMoonUI } from "./ui/moonUI.js";
import { initSpokenWeatherUI } from "./ui/spokenWeatherUI.js";
import { initSpeakController } from "./controllers/speakController.js";

import {
  initThemeUI,
  initTimeUI,
  initWeatherUI,
  initForecastUI,
  initForecastControlsUI,
  initDayOverlayUI,
  initCityUI,
  initCityHeaderUI,
  initCitySearchUI,
  initAddCityUI,
  initSunUI,
  initRainUI,
  initTooltipUI,
  initGeolocateUI,
  initRadarUI
} from "./ui/index.js";

import { loadCitiesFromStorage } from "./core/storage/cityStorage.js";
import { loadInitialCities } from "./state/cityState.js";
// ✅ logs APRES imports
console.log("🔥 MAIN.JS LOADED 🔥");
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌤️ MeteoSplash booting…");

  const storedCities = loadCitiesFromStorage();
  loadInitialCities(storedCities);

  initThemeController();
  initCityController();
  initWeatherController();
  initTimeController();
  initSunController();
  initMoonController();
  initCitySearchController();
  initRadarUI();

  initThemeUI();
  initTimeUI();
  initAddCityUI();
  initWeatherUI();
  initForecastUI();              // ✅ forecast branché ici
  initForecastControlsUI();
  initDayOverlayUI();
  initDayGraphsUI();
  initHistoryController();
  initHistoryUI();

  initCityUI();
  initCityHeaderUI();
  initCitySearchUI();
  initForecastOverlayUI();
  initHourOverlayUI();
  initSunUI();
  initMoonUI();
  initRainUI();
  initTempUnitUI();
  initTooltipUI();
  initGeolocateUI();
  initSpokenWeatherUI();
  initSpeakController();

  initTimeline24hUI();
  initCityTimelineScroll();

  console.log("✅ MeteoSplash ready");
});
// sécurité ultime
setInterval(() => {
  if (!document.querySelector(".active.day-overlay") &&
      !document.querySelector("#forecast-overlay.active")) {
    document.body.classList.remove("overlay-open", "no-scroll");
  }
}, 1000);
/* ===============================
   LIVE TEMP REFRESH
================================ */

setInterval(() => {
  document.dispatchEvent(new CustomEvent("temp:tick"));
}, 30000);
