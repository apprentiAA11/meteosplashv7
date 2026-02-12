// ui/cityHeaderUI.js
import { onCityChange } from "../state/cityState.js";
import { onWeatherChange } from "../state/weatherState.js";

export function initCityHeaderUI() {
  console.log("🏙 CityHeader UI ready");

  const titleEl    = document.getElementById("details-title");
  const coordsEl   = document.getElementById("details-coords");
  const updateEl   = document.getElementById("last-update");

  // 🔹 Ville sélectionnée
  onCityChange(({ selectedCity }) => {
    if (!selectedCity) return;

    if (titleEl) titleEl.textContent = selectedCity.name || "";

    // 👉 Badge coords avec icône
    if (
      coordsEl &&
      Number.isFinite(selectedCity.lat) &&
      Number.isFinite(selectedCity.lon)
    ) {
      const textEl = coordsEl.querySelector(".coords-text");

      const coordsString =
        `Lat ${selectedCity.lat.toFixed(2)} · Lon ${selectedCity.lon.toFixed(2)}`;

      if (textEl) {
        textEl.textContent = coordsString;
      } else {
        // fallback si jamais le HTML n'est pas encore à jour
        coordsEl.innerHTML = `📍 ${coordsString}`;
      }
    }
  });

  // 🔹 Dernière mise à jour météo
  onWeatherChange(({ raw }) => {
    if (!updateEl || !raw?.current?.time) return;

    const d = new Date(raw.current.time);

    updateEl.textContent =
      `Dernière mise à jour : ${d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      })}`;

    updateEl.classList.remove("hidden");
  });
}
