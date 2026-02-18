// state/cityState.js
import { saveCitiesToStorage } from "../core/storage/cityStorage.js";

console.log("📦 cityState.js chargé");

let cities = [];
let selectedCity = null;

/* =====================================================
   LISTENERS (pour UI modernes)
===================================================== */

const cityListeners = new Set();

export function onCityChange(fn) {
  cityListeners.add(fn);
  return () => cityListeners.delete(fn);
}

function notify() {
  cityListeners.forEach(fn => fn({
    cities: [...cities],
    selectedCity
  }));
}

/* =====================================================
   EMIT (pour controllers existants)
===================================================== */

function emit() {
  const payload = {
    cities: [...cities],
    selectedCity
  };

  console.log("📤 CITY EMIT", payload); // 👈 AJOUTE ÇA

  saveCitiesToStorage(cities);

  document.dispatchEvent(new CustomEvent("city:update", {
    detail: payload
  }));

  notify();
}

function emitError(message) {
  console.log("🚨 CITY ERROR EMIT:", message);

  document.dispatchEvent(new CustomEvent("city:error", {
  detail: {
  type: "duplicate",
  message
  }
  }));
}

/* =====================================================
   API PUBLIQUE
===================================================== */

export function addCity(city) {
  if (!isValidCity(city)) return false;

  const existing = cities.find(c => isSameCity(c, city));

  if (existing) {
    selectedCity = existing;
    emit();
    emitError(randomDuplicateMessage());
    return false; // ⛔ doublon
  }

  if (city.isUserLocation) {
    cities = cities.filter(c => !c.isUserLocation);
  }

  cities.push(city);
  selectedCity = city;
  emit();

  return true; // ✅ ajout réel
}

export function removeCity(index) {
  if (index < 0 || index >= cities.length) return;
  cities.splice(index, 1);

  if (selectedCity && !cities.some(c => isSameCity(c, selectedCity))) {
    selectedCity = null;
  }

  emit();
}
// ✅ supprime toutes les villes sauf "Ma position" (si présente)
export function resetCities() {
  const userLoc = cities.find(c => c?.isUserLocation);
  cities = userLoc ? [userLoc] : [];
  selectedCity = cities[0] || null;
  emit();
}
export function reorderCities(from, to) {
  const [moved] = cities.splice(from, 1);
  cities.splice(to, 0, moved);
  emit();
}

export function setSelectedCity(city) {
  if (!isValidCity(city)) return;

  const existing = cities.find(c => isSameCity(c, city));

  if (existing) {
    selectedCity = existing;

    emitError(randomDuplicateMessage());   // ✅ ICI AUSSI
    emit();
    return;
  }

  if (city.isUserLocation) {
    cities = cities.filter(c => !c.isUserLocation);
  }

  cities.push(city);
  selectedCity = city;
  emit();
}

export function setCityState(city) {
  setSelectedCity(city);
}

export function loadInitialCities(list = []) {
  cities = Array.isArray(list) ? list.filter(isValidCity) : [];
  selectedCity = cities[0] || null;
  emit();
}

/* =====================================================
   WEATHER UPDATE
===================================================== */

export function updateCityWeather(city, weather) {
  const now = new Date();

  const sunrise = weather.daily?.sunrise?.[0]
    ? new Date(weather.daily.sunrise[0])
    : null;

  const sunset = weather.daily?.sunset?.[0]
    ? new Date(weather.daily.sunset[0])
    : null;

  const isNight =
    sunrise && sunset
      ? now < sunrise || now > sunset
      : false;

  cities = cities.map(c => {
    if (isSameCity(c, city)) {
      return {
        ...c,
        temp: weather.current?.temperature_2m ?? null,
        wind: weather.current?.wind_speed_10m ?? null,
        weatherCode: weather.current?.weather_code ?? null,

        // ✅ AJOUTS CRITIQUES
        weatherRaw: weather,
        isNight
      };
    }
    return c;
  });

  if (selectedCity && isSameCity(selectedCity, city)) {
    selectedCity = cities.find(c => isSameCity(c, city));
  }

  emit();
}

/* =====================================================
   UTILS
===================================================== */

function isValidCity(c) {
  return c && c.name && Number.isFinite(c.lat) && Number.isFinite(c.lon);
}

export function isSameCity(a, b) {
  if (!a || !b) return false;

  const norm = s =>
    s?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z ]/g, "")
      .replace(/\s+/g, " ")
      .trim() || "";

  const sameName = norm(a.name) === norm(b.name);
  const sameCountry = norm(a.country || "") === norm(b.country || "");

  // filet de sécurité très strict (~100 m)
  const veryClose =
    Math.abs(a.lat - b.lat) < 0.001 &&
    Math.abs(a.lon - b.lon) < 0.001;

  return (sameName && sameCountry) || veryClose;
}

const DUPLICATE_MESSAGES = [
  "😄 Cette ville est déjà dans ta liste",
  "📍 Elle est déjà ajoutée",
  "🗺️ On la connaît déjà celle-là",
  "😉 Déjà dans Mes villes",
  "⭐ Tu l’as déjà enregistrée",
  "🌍 Elle fait déjà partie de ta sélection",
  "😅 Inutile de l’ajouter deux fois",
  "📌 Ville déjà choisie"
];

function randomDuplicateMessage() {
  return DUPLICATE_MESSAGES[
    Math.floor(Math.random() * DUPLICATE_MESSAGES.length)
  ];
}
/* ===============================
   GETTERS / SETTERS
================================ */

export function getCities() {
  return [...cities];
}

export function setCities(newCities) {
  if (!Array.isArray(newCities)) return;

  cities = newCities;

  // si la ville sélectionnée n'existe plus, on corrige
  if (selectedCity && !cities.some(c => isSameCity(c, selectedCity))) {
    selectedCity = cities[0] || null;
  }

  emit(); // 🔥 utilise ton système propre déjà en place
}

