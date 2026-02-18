/* =====================================================
   WEATHER SERVICE
   Rôle : récupérer la météo brute depuis l’API
===================================================== */

export async function fetchWeather(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("fetchWeather: coordonnées invalides");
  }

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    "&timezone=auto" +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m" +
    "&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover,wind_speed_10m,wind_direction_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset" +
    "&forecast_days=14";

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Open-Meteo error " + res.status);
  }

  const data = await res.json();
  return data;
}
