// FIX ISO → DAILY INDEX
function findDailyIndexByISO(isoDate) { ... }

const __renderDayInLeftPanel = window.renderDayInLeftPanel;
window.renderDayInLeftPanel = function(dayOrIso) { ... }
// === FIX ISO → DAILY INDEX (sunrise/sunset coherence) ===
function findDailyIndexByISO(isoDate) {
  const d = lastForecastData?.daily;
  if (!d || !Array.isArray(d.time)) return -1;
  return d.time.indexOf(isoDate);
}