// ui/forecastOverlayUI.js

import { openOverlay, closeOverlay } from "./overlayManager.js";

export function initForecastOverlayUI() {
  const overlay  = document.getElementById("forecast-overlay");
  const closeBtn = document.getElementById("btn-close-forecast");
  const backdrop = overlay?.querySelector(".overlay-backdrop");
  const openBtn  = document.getElementById("btn-forecast-popup");

  if (!overlay) return;

  openBtn?.addEventListener("click", () => openOverlay(overlay));
  closeBtn?.addEventListener("click", () => closeOverlay(overlay));
  backdrop?.addEventListener("click", () => closeOverlay(overlay));
}