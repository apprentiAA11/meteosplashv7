console.log("✅ currentDetailsUI chargé");

import { onWeatherChange } from "../state/weatherState.js";

const detailsTitle = document.getElementById("details-title");
const detailsSubtitle = document.getElementById("details-subtitle");
const detailsCurrent = document.getElementById("details-current");
const windLineMain = document.getElementById("wind-line-main");
const windLineSub = document.getElementById("wind-line-sub");
const detailsTip = document.getElementById("details-tip");

/* =========================
   INIT
========================= */

onWeatherChange(weather => {
  console.log("🌬 currentDetailsUI reçu", weather?.raw?.current);

  if (!weather?.raw) return;

  const raw = weather.raw;
  const c = raw.current;

  if (!c) return;

  /* =========================
     VENT / RAFRALES / DIRECTION
  ========================= */

  if (windLineMain && windLineSub) {
    const dir   = Number(c.wind_direction_10m);
    const speed = Number(c.wind_speed_10m);
    const gusts = Number(c.wind_gusts_10m);

    // ⚠️ 0 est une valeur valide → on teste avec Number.isFinite
    if (!Number.isFinite(dir) || !Number.isFinite(speed)) {
      windLineMain.textContent = "Vent : —";
      windLineSub.textContent  = "Rafales : —";
    } else {
      const dirTxt = degToCompass(dir);

      windLineMain.textContent = `Vent : ${dirTxt} ${Math.round(speed)} km/h`;

      if (Number.isFinite(gusts)) {
        windLineSub.textContent = `Rafales : ${Math.round(gusts)} km/h`;
      } else {
        windLineSub.textContent = "Rafales : —";
      }
    }
  }

  /* =========================
     (tu peux garder ici tes autres mises à jour
     détailsCurrent, detailsTip, etc.)
  ========================= */
});

/* =========================
   UTILS
========================= */

function degToCompass(deg) {
  const dirs = ["N","Nord-Nord-Est","Nord-Est","Est-Nord-Est","Est","Est-Sud-Est","Sud-Est","Sud-Sud-Est","Sud","Sud-Sud-Ouest","Sud-Ouest","Ouest-Sud-Ouest","Ouest","Ouest-Nord-Ouest","Nord-Ouest","Nord-Nord-Ouest"];
  return dirs[Math.round(deg / 22.5) % 16];
}
