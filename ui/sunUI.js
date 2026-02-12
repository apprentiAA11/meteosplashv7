// ui/sunUI.js

import { onSunChange } from "../state/sunState.js";
import { onTimeChange } from "../state/timeState.js";
import { formatCityHour } from "../utils/timeUtils.js";

let lastSun = null;
let lastTime = null;
let previousPhase = null;

export function initSunUI() {
   onSunChange(sun => {
    lastSun = sun;
    render();
  });

  onTimeChange(time => {
    lastTime = time;
    render();
  });
}

/* =========================
   RENDER
========================= */

function render() {

  if (!lastSun || !lastTime) return;

  // 🔥 update thème uniquement si changement
  if (lastSun.phase !== previousPhase) {
    document.body.classList.toggle(
      "theme-night-sun",
      lastSun.phase === "night"
    );

    previousPhase = lastSun.phase;
  }

  updateSunArc(lastSun.progress);
  updateSunLabels(lastSun, lastSun.offsetSec);
  updateGoldenClass(lastSun.isGolden);
}

function updateSunArc(progress) {

  const dot  = document.getElementById("sun-dot");
  const path = document.getElementById("sun-arc-path");
  const prog = document.getElementById("sun-arc-progress");

  if (!dot || !path) return;
  if (!Number.isFinite(progress)) return;

  progress = Math.max(0, Math.min(1, progress));

  const length = path.getTotalLength();
  if (!length) return;

  const p = length * progress;
  const point = path.getPointAtLength(p);

  // ⭐ déplace le soleil
  dot.setAttribute("cx", point.x);
  dot.setAttribute("cy", point.y);

  // ⭐ colore l’arc déjà parcouru
  if (prog) {
    prog.setAttribute("stroke-dasharray", `${p} ${length}`);
  }
}

function updateSunLabels(sun, offsetSec) {
  const rise = document.getElementById("sunrise-time");
  const set  = document.getElementById("sunset-time");

  if (rise) rise.textContent = formatCityHour(sun.sunrise, offsetSec);
  if (set)  set.textContent  = formatCityHour(sun.sunset,  offsetSec);
}

function updateGoldenClass(isGolden) {
  document.body.classList.toggle("theme-golden", !!isGolden);
}
