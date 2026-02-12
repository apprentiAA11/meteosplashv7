// ui/detailsViewController.js
import { setWeatherMode } from "../state/weatherState.js";
import { open24hOverlay } from "./dayOverlayUI.js";

export function open24hView() {
  setWeatherMode("live");
  open24hOverlay(); // ✅ calcule les data + ouvre l’overlay correctement
}

export function openForecastView() {
  setWeatherMode("forecast");
  document.dispatchEvent(new CustomEvent("forecast:open"));
}

export function openHistoryView() {
  setWeatherMode("history");

  const current = document.getElementById("details-current");
  const history = document.getElementById("details-history");

  if (current) current.classList.add("hidden");
  if (history) history.classList.remove("hidden");
}
