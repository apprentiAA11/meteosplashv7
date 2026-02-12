import { subscribe, getState } from "./store.js";

function renderRadar(state) {
  if (!state) return;

  if (state.city) {
    ensureRadarMap(state.city);
  }

  if (radarWindowText) {
    radarWindowText.textContent = state.windowLabel;
  }

  if (radarTimelineSlider) {
    radarTimelineSlider.max = state.maxOffset;
    radarTimelineSlider.value = state.offset;
  }

  renderRadarGrid(state.gridData);

  applyRadarGridModeClass(state.variable);
  updateLegend(state.variable);

  refreshOpenWeatherLayer(state.variable);
}
