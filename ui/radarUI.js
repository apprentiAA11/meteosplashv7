// ui/radarUI.js
import { onRadarChange } from "../state/radarState.js";
import {
  loadRainRadar,
  loadWindRadar,
  playRadar,
  stopRadar
} from "../controllers/radarController.js";
import { getWeather } from "../state/weatherState.js";
import { getRadarState } from "../state/radarState.js";
import { setRadarState } from "../state/radarState.js";
import { initForecastRadarLayer } from "../core/radarForecastEngineV3.js";
import {
  clearForecastParticles,
  stopAnimation
} from "../core/radarForecastEngineV3.js";

let forecastLayerReady = false;
let fadeRAF = null;
let lastUrl = null;
let map = null;
let baseLayer = null;
let radarLayer = null;
let tabsBound = false;
let radarLayerA = null;
let radarLayerB = null;
let activeLayer = "A";

export function initRadarUI() {
  console.log("🗺 RadarUI ready");

  document.getElementById("btn-radar")
    ?.addEventListener("click", openRadar);

  document.getElementById("radar-play")
    ?.addEventListener("click", playRadar);

  document.getElementById("btn-close-radar")
    ?.addEventListener("click", closeRadar);

  document.querySelector("#radar-overlay .overlay-backdrop")
    ?.addEventListener("click", closeRadar);
 

  onRadarChange(applyRadarFrame);
  // ⭐ AJOUT CRITIQUE
  initRadarTimelineUI();
}
function initRadarTimelineUI() {

  const slider = document.getElementById("radar-timeline-slider");
  const prev   = document.getElementById("timeline-prev");
  const next   = document.getElementById("timeline-next");

  if (!slider) return;

  /* ⭐ Stop autoplay quand utilisateur touche timeline */

  slider.addEventListener("mousedown", stopRadar);
  slider.addEventListener("touchstart", stopRadar);

  /* ⭐ Drag slider */

  slider.addEventListener("input", () => {

    setRadarState({
      index: Number(slider.value)
    });

  });

  /* ⭐ Boutons */

  prev?.addEventListener("click", () => {

    stopRadar();

    const s = getRadarState();

    setRadarState({
      index: Math.max(0, s.index - 1)
    });

  });

  next?.addEventListener("click", () => {

    stopRadar();

    const s = getRadarState();

    setRadarState({
      index: Math.min(s.frames.length - 1, s.index + 1)
    });

  });

}

/* ========================= */


function ensureMap() {
  if (map) return;

  map = L.map("radar-map", {
    zoomControl: false,
    attributionControl: false,
    minZoom: 3,
    maxZoom: 14
  });

  baseLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { zIndex: 100, opacity: 0.9 }
  ).addTo(map);

  map.on("zoomend", () => {
    lastUrl = null;
  });

  map.setView([48.85, 2.35], 6);

  // ✅ ICI (après création map)
  if (!forecastLayerReady) {
    initForecastRadarLayer(map);
    forecastLayerReady = true;
  }
}

/* ========================= */

export function openRadar() {
  radarLayerA = null;
  radarLayerB = null;
  activeLayer = "A";

  const weather = getWeather();
  if (!weather?.city) return;

  const overlay = document.getElementById("radar-overlay");
  if (!overlay) return;

  /* ===============================
     Evite double ouverture
  =============================== */

  if (overlay.classList.contains("active")) return;

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open", "no-scroll");

  /* ===============================
     Init map
  =============================== */

  ensureMap();

  const { lat, lon } = weather.city;

  /* ===============================
     Reset cache radar
  =============================== */

  lastUrl = null;

  /* ===============================
     Leaflet resize SAFE
  =============================== */

  requestAnimationFrame(() => {

    if (!map) return;

    map.invalidateSize(true);
    map.setView([lat, lon], 9, { animate: false });

  });

  /* ===============================
     Bind tabs (1 seule fois)
  =============================== */

  bindRadarTabs();

  /* ===============================
     Load rain radar
  =============================== */
  stopRadar();
  loadRainRadar(weather.city);
}

/* ========================= */

function closeRadar() {
  stopRadar();
  stopAnimation(); // ⭐ AJOUT ICI

  const overlay = document.getElementById("radar-overlay");
  if (!overlay) return;

  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open", "no-scroll");
}

/* ========================= */
function applyRadarFrame(state) {

  if (!map || !state?.frames?.length) return;

  // ⭐ évite render pendant chargement
  if (state.loading) return;

  updateTimelineUI(state);

  if (state.mode === "rain") {
    renderRain(state);
    return;
  }

  // ⭐ nettoyage complet si on quitte pluie
  clearRadarLayer();

  if (state.mode === "wind") {
    renderWind(state);
    return;
  }

  if (state.mode === "temp") {
    renderTemp(state);
  }
}

function renderWind(state) {
  const frame = state.frames[state.index];
  if (!frame?.data) return;

  const { speed, dir } = frame.data;
  if (!Number.isFinite(speed) || !Number.isFinite(dir)) return;
  
  const zoom = map.getZoom();
  const size = 50 + speed * 1.5 + zoom * 4;

  radarLayer = L.marker(
    [state.city.lat, state.city.lon],
    {
      interactive: false,
      icon: L.divIcon({
        className: "wind-marker",
        html: `
          <div style="
            width:${size}px;
            height:${size}px;
            transform: rotate(${dir}deg);
            font-size:${size}px;
            color:#4fd1ff;
            filter: drop-shadow(0 0 12px rgba(79,209,255,.8));
          ">➤</div>
        `
      })
    }
  ).addTo(map);
}
/* ===========================
   ui/radarUI.js
   PATCH IMPORTANT : futur = forecast OU forecast_adv
   (sinon Leaflet tuiles polluent + canvas pas visible)
=========================== */

function renderRain(state) {
  const frame = state.frames[state.index];
  if (!frame) return;

  // ✅ futur : forecast + forecast_adv => on coupe RainViewer
  if (frame.type === "forecast" || frame.type === "forecast_adv") {
    clearRainTilesOnly();
    lastUrl = null;
    return;
  }

  // ✅ réel (RainViewer)
  if (!frame.tileUrl) return;
  if (frame.tileUrl === lastUrl) return;

  const targetLayer = activeLayer === "A" ? "B" : "A";

  const createLayer = () =>
    L.tileLayer(frame.tileUrl, { opacity: 0, zIndex: 300 }).addTo(map);

  if (targetLayer === "A") {
    if (!radarLayerA) radarLayerA = createLayer();
    else radarLayerA.setUrl(frame.tileUrl);
  } else {
    if (!radarLayerB) radarLayerB = createLayer();
    else radarLayerB.setUrl(frame.tileUrl);
  }

  const oldLayer = activeLayer === "A" ? radarLayerA : radarLayerB;
  const newLayer = targetLayer === "A" ? radarLayerA : radarLayerB;

  fadeLayers(oldLayer, newLayer);

  activeLayer = targetLayer;
  lastUrl = frame.tileUrl;
}

function clearRainTilesOnly() {
  if (!map) return;

  if (radarLayerA) {
    map.removeLayer(radarLayerA);
    radarLayerA = null;
  }
  if (radarLayerB) {
    map.removeLayer(radarLayerB);
    radarLayerB = null;
  }
}

function renderTemp(state) {
  // à faire plus tard (isothermes)
}

function clearRadarLayer() {

  if (!map) return;

  // ⭐ clear pluie buffer A/B
  if (radarLayerA) {
    map.removeLayer(radarLayerA);
    radarLayerA = null;
  }

  if (radarLayerB) {
    map.removeLayer(radarLayerB);
    radarLayerB = null;
  }

  // ⭐ clear marker vent
  if (radarLayer) {
    map.removeLayer(radarLayer);
    radarLayer = null;
  }
}

function bindRadarTabs() {
if (tabsBound) return;
  tabsBound = true;
  const btnWind = document.getElementById("radar-tab-wind");
  const btnRain = document.getElementById("radar-tab-rain");
  const btnTemp = document.getElementById("radar-tab-temp");

  function setActiveTab(id) {
    document
      .querySelectorAll(".radar-tab")
      .forEach(btn => btn.classList.remove("radar-tab-active"));

    document.getElementById(id)?.classList.add("radar-tab-active");
  }

  /* =======================
     🌧 PLUIE
  ======================= */
  if (btnRain) {
    btnRain.onclick = () => {

      // ✅ anti reload inutile
      if (getRadarState().mode === "rain") return;

      const weather = getWeather();
      if (!weather?.city) return;

      setActiveTab("radar-tab-rain");
      loadRainRadar(weather.city);
    };
  }

  /* =======================
     💨 VENT
  ======================= */
  if (btnWind) {
    btnWind.onclick = () => {

      // ✅ anti reload inutile
      if (getRadarState().mode === "wind") return;

      const weather = getWeather();
      if (!weather?.city || !weather?.raw) return;

      setActiveTab("radar-tab-wind");
      loadWindRadar(weather.city, weather.raw);
    };
  }

  /* =======================
     🌡 TEMP
  ======================= */
  if (btnTemp) {
    btnTemp.onclick = () => {

      if (getRadarState().mode === "temp") return;

      setActiveTab("radar-tab-temp");
      console.log("🌡 Temp radar à implémenter");
    };
  }
}

function fadeLayers(oldLayer, newLayer) {

  if (fadeRAF) cancelAnimationFrame(fadeRAF);

  let opacity = 0;

  const step = () => {

    opacity += 0.05;

    if (newLayer) newLayer.setOpacity(opacity);

    if (oldLayer)
      oldLayer.setOpacity(Math.max(0, 0.6 - opacity));

    if (opacity < 0.6) {
      fadeRAF = requestAnimationFrame(step);
    }
  };

  step();
}

function updateTimelineUI(state) {

  const slider = document.getElementById("radar-timeline-slider");
  const label  = document.getElementById("radar-window-text");

  if (!slider || !state.frames?.length) return;

  slider.max   = state.frames.length - 1;
  slider.value = state.index;

  const frame = state.frames[state.index];

  if (frame?.time && label) {

    const diff = frame.time.getTime() - Date.now();

   let prefix;

   if (Math.abs(diff) <= 120000) prefix = "Maintenant";
   else if (diff < 0) prefix = "Passé";
   else prefix = "Prévision";


    label.textContent =
      `${prefix} → ${frame.time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`;
  }
}
