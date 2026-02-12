// utils/colorUtils.js

export function getTemperatureColor(temp) {
  if (temp == null) return "inherit";

  const t = Math.max(-20, Math.min(45, temp));
  const isNight = document.body.classList.contains("theme-night");

  // Normalisation -20 → 45
  const ratio = (t + 20) / 65;

  // Hue : bleu profond (215°) → rouge chaud (5°)
  const hue = 215 - (210 * ratio);

  // Saturation plus douce
  const saturation = isNight ? 80 : 60;

  // Lightness adaptée au contraste
  let lightness;

  if (isNight) {
    lightness = 60 - Math.abs(t) * 0.15;
  } else {
    lightness = 38 + (1 - Math.abs(ratio - 0.5) * 2) * 8;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
