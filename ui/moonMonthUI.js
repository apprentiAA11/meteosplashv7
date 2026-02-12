// moonMonthUI.js
import { buildMonthCalendar } from "../controllers/moonCalendarController.js";

let viewYear, viewMonth;

export function initMoonMonthUI() {
  const now = new Date();
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();

  document.getElementById("moon-prev-month").onclick = () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderMonth();
  };

  document.getElementById("moon-next-month").onclick = () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderMonth();
  };

  renderMonth();
}

function renderMonth() {
  const data = buildMonthCalendar(viewYear, viewMonth);
  const grid = document.getElementById("moon-month-grid");
  const title = document.getElementById("moon-month-title");

  title.textContent = new Date(viewYear, viewMonth)
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  grid.innerHTML = "";

  data.weeks.flat().forEach(day => {
    const el = document.createElement("div");
    el.className = "moon-month-day";

    if (!day.inMonth) el.classList.add("off");
    if (day.isToday) el.classList.add("today");

    el.innerHTML = `
      <div class="n">${day.d}</div>
      <div class="disc"
        style="--moon-shadow:${1 - day.illumination.fraction};
               --moon-waxing:${day.phase.waxing ? 1 : 0};">
      </div>
      <div class="p">${day.phase.emoji}</div>
    `;

    el.onclick = () => {
      document.dispatchEvent(new CustomEvent("moon:select-day", {
        detail: { date: day.date }
      }));
    };

    grid.appendChild(el);
  });
}