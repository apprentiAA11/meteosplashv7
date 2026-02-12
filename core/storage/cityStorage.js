/* =====================================================
   CITY STORAGE — localStorage
===================================================== */

const KEY = "meteosplash:cities";

/* =====================================================
   LOAD
===================================================== */

export function loadCitiesFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("CityStorage load error", e);
    return [];
  }
}

/* =====================================================
   SAVE
===================================================== */

export function saveCitiesToStorage(cities) {
  if (!Array.isArray(cities)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cities));
  } catch (e) {
    console.warn("CityStorage save error", e);
  }
}

/* =====================================================
   CLEAR (optionnel)
===================================================== */

export function clearCitiesStorage() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
}
