// core/theme/themeEngine.js

import { computeSkyModel } from "./skyModel.js";
import { computeWeatherDimFactor } from "./weatherImpact.js";

function clamp01(x) {
  x = Number(x);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/*
state attendu :
{
  isDay: boolean
  weatherCode: number | null
  userMode: "auto" | "day" | "night"
}
*/

export function computeTheme(state = {}) {
  const {
    isDay,
    weatherCode,
    userMode = "auto"
  } = state;

  if (typeof isDay !== "boolean") {
    console.warn("⛔ computeTheme: isDay invalide");
    return null;
  }

  // 🌗 phase finale
  let phase = isDay ? "day" : "night";

  if (userMode === "day") phase = "day";
  if (userMode === "night") phase = "night";

  const ratio = phase === "day" ? 1 : 0;

  // 🌤 modèle ciel
  const skyRaw = computeSkyModel(phase, ratio) || {};

  const sky = {
    light: Number(skyRaw.light) || 0,
    warmth: Number(skyRaw.warmth) || 0,
    saturation: Number(skyRaw.saturation) || 0
  };

  // 🌧 impact météo
  const dimRaw = computeWeatherDimFactor(weatherCode);
  const dim = Number.isFinite(dimRaw) ? dimRaw : 1;

  const light = clamp01(sky.light * dim);

  return {
    mode: userMode,
    phase,
    isNight: phase === "night",

    sky: {
      light,
      warmth: sky.warmth,
      saturation: sky.saturation,
      dim
    },

    cssVars: {
      "--sky-light": light.toFixed(2),
      "--sky-warmth": sky.warmth.toFixed(2),
      "--sky-sat": sky.saturation.toFixed(2)
    }
  };
}
