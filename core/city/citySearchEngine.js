// /core/city/citySearchEngine.js
// Moteur pur de recherche de villes (Open-Meteo Geocoding)

export async function searchCities(query) {
  if (!query || query.length < 2) return [];

  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(query)}` +
    "&count=10&language=fr&format=json";

  const r = await fetch(url);
  if (!r.ok) throw new Error("City geocoding failed");

  const j = await r.json();
  if (!j?.results) return [];

  return j.results.map(c => ({
    name: c.name,
    lat: c.latitude,
    lon: c.longitude,
    country: c.country,
    timezone: c.timezone
  }));
}
