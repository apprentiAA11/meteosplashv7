// ui/weather/windUI.js
import { windDegToCssAngle } from "../windUtils.js";

export function renderWind(raw) {
  const windCompass = document.getElementById("wind-compass");
  if (!windCompass || !raw?.current) return;

  const windArrow = windCompass.querySelector(".compass-arrow");
  if (!windArrow) return;

  const c = raw.current;

  const dir   = c.wind_direction_10m; // FROM (météo)
  const speed = c.wind_speed_10m;
  const gust  = c.wind_gusts_10m;

  if (typeof dir !== "number") return;

  // ✅ conversion centralisée (UNE SEULE SOURCE DE VÉRITÉ)
  const angle = windDegToCssAngle(dir);

  requestAnimationFrame(() => {
   windArrow.style.transform = `rotate(${angle}deg)`;
  });


  const main = document.getElementById("wind-line-main");
  const sub  = document.getElementById("wind-line-sub");

  if (main) {
    main.textContent = `Vent : ${degreeToCardinal(dir)} (${Math.round(speed)} km/h)`;
  }
  if (sub) {
    sub.textContent = `Rafales : ${Math.round(gust)} km/h`;
  }
}

function degreeToCardinal(deg) {
  const dirs = [
    "Nord","Nord-Nord-Est","Nord-Est","Est-Nord-Est",
    "Est","Est-Sud-Est","Sud-Est","Sud-Sud-Est",
    "Sud","Sud-Sud-Ouest","Sud-Ouest","Ouest-Sud-Ouest",
    "Ouest","Ouest-Nord-Ouest","Nord-Ouest","Nord-Nord-Ouest"
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}
