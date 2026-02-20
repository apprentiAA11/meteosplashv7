// ui/components/tempToggle.js
import { toggleCityUnit } from "../../state/cityState.js";
import { getSelectedCity } from "../../state/cityState.js";

export function createTempToggle() {
  const city = getSelectedCity();
  if (!city) return null;

  const btn = document.createElement("button");
  btn.className = "temp-toggle-btn";

  btn.textContent = city.unit === "C" ? "°C" : "°F";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    toggleCityUnit(city.id);

    document.dispatchEvent(new CustomEvent("temp:unit-change", {
      detail: { unit: city.unit === "C" ? "F" : "C" }
    }));
  });

  return btn;
}
