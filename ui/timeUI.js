// ui/timeUI.js
import { onTimeChange } from "../state/timeState.js";

export function initTimeUI() {
  console.log("⏰ TimeUI ready");
  onTimeChange(applyTimeUI);
}

function applyTimeUI(timeState) {
  if (!timeState?.nowUtc || !Number.isFinite(timeState.utcOffsetSec)) return;

  const cityMs = timeState.nowUtc.getTime() + timeState.utcOffsetSec * 1000;
  const d = new Date(cityMs);

  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();

  const clockEl = document.getElementById("radar-clock");
  const dateEl  = document.getElementById("radar-date");

  if (clockEl) {
    clockEl.innerHTML = `
      <span class="h">${String(h).padStart(2,"0")}</span><span class="sep">:</span>
      <span class="m">${String(m).padStart(2,"0")}</span><span class="sep">:</span>
      <span class="sec">${String(s).padStart(2,"0")}</span>
    `;
  }

  if (dateEl) {
    const days = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

    const label = `${days[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2,"0")} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    dateEl.textContent = label;
  }
}
