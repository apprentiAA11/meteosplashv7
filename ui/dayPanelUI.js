import { renderDayInLeftPanel } from "../core/dayPanelCore.js";
import { state } from "../core/state.js";
import { ui } from "./uiRefs.js";

export function initDayPanelUI() {
  const fl = document.getElementById("forecast-list");
  if (!fl) return;

  fl.addEventListener("click", (e) => {
    const item = e.target.closest(".forecast-item");
    if (!item) return;
    const idx = Number(item.dataset.dayIndex);
    if (Number.isInteger(idx)) {
      renderDayInLeftPanel(idx, state, ui);
    }
  });
}
