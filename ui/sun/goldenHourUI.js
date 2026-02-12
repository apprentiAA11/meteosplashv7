// ui/sun/goldenHourUI.js

export function applyGoldenHour(sun) {
  if (!sun?.computed) return;

  document.body.classList.toggle(
    "theme-golden",
    sun.computed.golden
  );
}
