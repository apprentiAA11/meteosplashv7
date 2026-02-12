// ui/forecastControlsUI.js — SAFE (contrôles uniquement)

import { open24hOverlay } from "./dayOverlayUI.js";

export function initForecastControlsUI() {
  console.log("📆 ForecastControlsUI SAFE ready");

  const btn7  = document.getElementById("btn-forecast-7");
  const btn14 = document.getElementById("btn-forecast-14");
  const btn24 = document.getElementById("btn-24h");

  btn7?.addEventListener("click", () => {
    setActive(7);
  });

  btn14?.addEventListener("click", () => {
    setActive(14);
  });

  btn24?.addEventListener("click", () => {
    setActive(24);
    open24hOverlay();
  });
}

function setActive(mode) {
  document.getElementById("btn-forecast-7")
    ?.classList.toggle("pill-button-active", mode === 7);

  document.getElementById("btn-forecast-14")
    ?.classList.toggle("pill-button-active", mode === 14);

  document.getElementById("btn-24h")
    ?.classList.toggle("pill-button-active", mode === 24);
}