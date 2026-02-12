// ui/weather/weatherFX.js

export function applyWeatherAnimations(j) {
  if (!j?.current) return;

  if (!j || !j.current) return;

  const code = j.current.weather_code;
  const storm = document.getElementById("storm-layer");
  const snow  = document.getElementById("snow-layer");
  const sun   = document.getElementById("sun-layer");

  if (!storm || !snow || !sun) return;

  // Reset visibilités
  storm.style.opacity = 0;
  snow.style.opacity  = 0;
  sun.style.opacity   = 0;

  // Groupes de codes Open-Meteo
  const isSnow  = [71,73,75,77,85,86].includes(code);
  const isStorm = [95,96,99].includes(code);
  const isSun   = (code === 0);

  if (isSnow)  snow.style.opacity  = 1;
  if (isStorm) storm.style.opacity = 1;
  if (isSun)   sun.style.opacity   = 1;
}
