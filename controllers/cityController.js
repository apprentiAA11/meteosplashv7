// controllers/cityController.js
import { setCityState } from "../state/cityState.js";

export function initCityController() {
  console.log("🏙 CityController ready");
}

export function selectCity(city) {
  if (!city?.lat || !city?.lon) return;

  console.log("🏙 Ville sélectionnée :", city.name);

  // 👉 UNE SEULE responsabilité
  setCityState(city);
}
