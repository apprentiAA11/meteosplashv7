// weather/weatherApi.js
export async function getWeatherByCoords(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code" +
    "&hourly=temperature_2m,precipitation,rain,wind_speed_10m,relative_humidity_2m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max" +
    "&timezone=auto";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo error");
  return await res.json();
}