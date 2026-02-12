// core/weather/weatherModel.js
// Moteur pur — transforme Open-Meteo → modèle interne

export function buildWeatherModel(raw) {
  if (!raw || !raw.current) return null;

  const current = raw.current;

  return {
    meta: {
      fetchedAt: Date.now(),
      utcOffset: raw.utc_offset_seconds
    },

    current: {
      timeISO: current.time,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      rain: current.rain,
      snowfall: current.snowfall,
      cloudCover: current.cloud_cover,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      weatherCode: current.weather_code
    },

    hourly: raw.hourly || null,
    daily: raw.daily || null,

    raw // on garde toujours la source brute au cas où
  };
}
