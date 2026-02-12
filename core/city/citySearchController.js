// /controllers/citySearchController.js

import { searchCities } from "../state/cityState.js";
import { addCity } from "./cityController.js";

/* =====================================================
   STATE
===================================================== */

let lastResults = [];
let isSearching = false;

/* =====================================================
   EVENTS
===================================================== */

function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/* =====================================================
   API PUBLIQUE
===================================================== */

export async function searchCity(query) {
  if (isSearching) return;

  isSearching = true;
  emit("citysearch:loading", true);

  try {
    lastResults = await searchCities(query);
    emit("citysearch:results", lastResults);
  } catch (e) {
    console.warn("City search failed", e);
    emit("citysearch:error", e);
  } finally {
    isSearching = false;
    emit("citysearch:loading", false);
  }
}

export function selectSearchResult(city) {
  if (!city) return;
  addCity(city);
  clearSearch();
}

export function clearSearch() {
  lastResults = [];
  emit("citysearch:clear");
}

export function getLastResults() {
  return [...lastResults];
}
