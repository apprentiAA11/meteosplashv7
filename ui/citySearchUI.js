// ui/citySearchUI.js
// UI minimale : délègue tout au CitySearchController

import { initCitySearchController } from "../controllers/citySearchController.js";

export function initCitySearchUI() {
  console.log("⌨️ CitySearchUI ready");
  initCitySearchController();
}
