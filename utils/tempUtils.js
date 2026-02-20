//utils/tempUtils.js

export function toFahrenheit(c) {
  return (c * 9/5) + 32;
}

export function formatTemp(value, unit = "C") {
  if (!Number.isFinite(value)) return "—";

  // Conversion en Fahrenheit si nécessaire
  const v = unit === "F" ? toFahrenheit(value) : value;

  // Retourne la température avec l'unité
  return `${v.toFixed(1)}°${unit}`;
}

export function formatTempShort(value, unit = "C") {
  if (!Number.isFinite(value)) return "—";

  if (unit === "F") {
    return `${toFahrenheit(value).toFixed(1)}°`;
  }

  return `${value.toFixed(1)}°`;
}
