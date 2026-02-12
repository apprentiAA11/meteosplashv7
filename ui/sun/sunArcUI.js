// ui/sun/sunArcUI.js

export function renderSunArc(sun) {
  const arc = document.getElementById("sun-arc");
  const sunEl = document.getElementById("sun-dot");
  if (!arc || !sunEl || !sun?.computed) return;

  const { progress, altitude, isDay } = sun.computed;

  if (!isDay) {
    sunEl.style.opacity = "0";
    return;
  }

  const w = arc.offsetWidth;
  const h = arc.offsetHeight;

  const x = w * progress;
  const y = h - altitude * h;

  sunEl.style.opacity = "1";
  sunEl.style.transform = `translate(${x}px, ${y}px)`;
}
