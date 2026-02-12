// ui/dayGraphsUI.js — PRO version (based on render/charts.js)

import { drawSimpleLineChart } from "../render/charts.js";

let canvases = {};
let currentData = null;
let currentType = "temp";

/* =========================
   INIT
========================= */

export function initDayGraphsUI() {
  console.log("📈 DayGraphsUI PRO ready");

  canvases = {
    temp: document.getElementById("chart-temp"),
    rain: document.getElementById("chart-rain"),
    wind: document.getElementById("chart-wind"),
    hum:  document.getElementById("chart-humidity")
  };

  // écoute les données venant de dayOverlayUI
  document.addEventListener("dayoverlay:data", e => {
    currentData = sanitizeData(e.detail);
    if (!currentData) return;

    // affiche toujours température par défaut
    currentType = getActiveTab() || "temp";
    showGraph(currentType);

    // ⚠️ attendre que l’overlay soit visible
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawCurrent();
      });
    });
  });

  // tabs (Température / Pluie / Vent / Humidité)
  document.querySelectorAll("[data-daytab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.daytab;

      activateTab(btn);
      showGraph(type);

      currentType = type;

      if (currentData) {
        requestAnimationFrame(() => {
          drawCurrent();
        });
      }
    });
  });
}

/* =========================
   SANITIZE
========================= */

function sanitizeData(d) {
  if (!d) return null;

  return {
    hours: d.hours.map(h => h + "h"),
    temps: d.temps.map(v => Number.isFinite(v) ? v : 0),
    rains: d.rains.map(v => Math.max(0, Number(v) || 0)),
    winds: d.winds.map(v => Math.max(0, Number(v) || 0)),
    hums:  d.humidities.map(v => {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.min(100, Math.max(0, n));
    })
  };
}

/* =========================
   UI
========================= */

function showGraph(type) {
  Object.entries(canvases).forEach(([key, canvas]) => {
    if (!canvas) return;
    canvas.classList.toggle("active-day-graph", key === type || (key === "hum" && type === "humidity"));
  });
}

function activateTab(activeBtn) {
  document.querySelectorAll("[data-daytab]").forEach(b => {
    b.classList.toggle("pill-button-active", b === activeBtn);
  });
}

function getActiveTab() {
  const btn = document.querySelector("[data-daytab].pill-button-active");
  return btn?.dataset.daytab || null;
}

/* =========================
   DRAW (charts.js)
========================= */

function drawCurrent() {
  if (!currentData) return;

  const labels = currentData.hours;

  switch (currentType) {

    case "temp":
      drawSimpleLineChart(
        canvases.temp,
        labels,
        currentData.temps,
        "°C"
      );
      break;

    case "rain":
      drawSimpleLineChart(
        canvases.rain,
        labels,
        currentData.rains,
        "mm"
      );
      break;

    case "wind":
      drawSimpleLineChart(
        canvases.wind,
        labels,
        currentData.winds,
        "km/h"
      );
      break;

    case "humidity":
      drawSimpleLineChart(
        canvases.hum,
        labels,
        currentData.hums,
        "%"
      );
      break;
  }
}
