// ui/rainUI.js
import { onWeatherChange } from "../state/weatherState.js";

export function initRainUI() {
  console.log("🌧️ RainUI ready");
  onWeatherChange(handleWeather);
}

/* ===========================================================
   WEATHER → RAIN LOGIC
=========================================================== */

function handleWeather(weather) {
  const current = weather?.raw?.current;
  if (!current) return;

  const rain = current.precipitation ?? 0;
  const code = current.weathercode ?? current.weatherCode;

  if (isRainy(code, rain)) {
    const intensity = Math.min(1, rain / 5);
    startRain(intensity);
  } else {
    stopRain();
  }
}

function isRainy(code, rain) {
  if (rain > 0.1) return true;
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return true;
  return false;
}

/* ===========================================================
   RAIN ENGINE
=========================================================== */

let rainInitialized = false;
let rainCanvas = null;
let rainCtx = null;
let rainDrops = [];
let rainRunning = false;
let rainVX = 0;

function initRainScene() {
  if (rainInitialized) return;

  const scene = document.getElementById("rain-scene");
  if (!scene) return;

  rainInitialized = true;

  rainCanvas = document.createElement("canvas");
  rainCanvas.id = "rain-canvas";
  rainCanvas.style.position = "absolute";
  rainCanvas.style.inset = "0";
  rainCanvas.style.pointerEvents = "none";

  scene.appendChild(rainCanvas);

  rainCtx = rainCanvas.getContext("2d");
  resizeRainCanvas();
  window.addEventListener("resize", resizeRainCanvas);
}

function resizeRainCanvas() {
  if (!rainCanvas || !rainCtx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = rainCanvas.getBoundingClientRect();
  rainCanvas.width = rect.width * dpr;
  rainCanvas.height = rect.height * dpr;
  rainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createRainDrops(intensity) {
  if (!rainCanvas) return;
  rainDrops = [];

  const rect = rainCanvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;

  const count = Math.min(220, Math.floor(100 + intensity * 160));

  for (let i = 0; i < count; i++) {
    rainDrops.push({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random(),
      speed: 7 + Math.random() * 12,
      thickness: 0.6 + Math.random() * 0.5,
      alpha: 0.25 + Math.random() * 0.25
    });
  }
}

function startRain(intensity) {
  if (!rainCanvas || !rainCtx) initRainScene();
  if (!rainCanvas || !rainCtx) return;

  createRainDrops(intensity);

  if (!rainRunning) {
    rainRunning = true;
    requestAnimationFrame(animateRain);
  }
}

function stopRain() {
  rainRunning = false;
  if (rainCtx && rainCanvas) {
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  }
}

function animateRain() {
  if (!rainRunning || !rainCtx || !rainCanvas) return;

  const dpr = window.devicePixelRatio || 1;
  const w = rainCanvas.width;
  const h = rainCanvas.height;
  const viewW = w / dpr;
  const viewH = h / dpr;

  rainCtx.clearRect(0, 0, w, h);

  const dx = rainVX * 0.015;

  for (const d of rainDrops) {
    const len = 18 + d.len * 28;

    rainCtx.beginPath();
    rainCtx.strokeStyle = `rgba(255,255,255,${d.alpha})`;
    rainCtx.lineWidth = d.thickness;
    rainCtx.moveTo(d.x, d.y);
    rainCtx.lineTo(d.x + dx, d.y + len);
    rainCtx.stroke();

    d.x += dx;
    d.y += d.speed;

    if (d.y > viewH + 40) {
      d.y = -40 - Math.random() * 60;
      d.x = Math.random() * viewW;
    }
  }

  if (rainRunning) requestAnimationFrame(animateRain);
}
