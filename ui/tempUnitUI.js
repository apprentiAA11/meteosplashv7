// ui/tempUnitUI.js

import { getUnit, setUnit } from "../state/weatherState.js";

export function initTempUnitUI() {
  const btn = document.getElementById("btn-temp-unit");
  if (!btn) return;

  function updateUI() {
    const unit = getUnit();  // Utilise `getUnit()` pour obtenir l'unité actuelle
    btn.textContent = `°${unit}`;
  }

  // affichage initial
  updateUI();

  // clic → toggle global
btn.addEventListener("click", () => {
  const currentUnit = getUnit();  // Récupère l'unité actuelle
  const nextUnit = currentUnit === "C" ? "F" : "C";  // Bascule entre °C et °F

  setUnit(nextUnit);  // Met à jour l'unité dans le state global
});

  // synchro auto
  document.addEventListener("weather:update", updateUI);
}
