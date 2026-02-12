// controllers/themeController.js

import { computeTheme } from "../core/theme/themeEngine.js";
import { onSunChange } from "../state/sunState.js";
import { onWeatherChange } from "../state/weatherState.js";
import { getTheme, setThemeState } from "../state/themeState.js";

/* ======================================================
   SNAPSHOTS (sources)
====================================================== */

let sunState = null;
let weatherState = null;

let lastSignature = ""; // ⛔ anti-boucle / anti-spam

/* ======================================================
   INIT
====================================================== */

export function initThemeController() {
  console.log("🎨 ThemeController ready");

  onSunChange(s => {
    sunState = s;
    recomputeTheme();
  });

  onWeatherChange(w => {
    weatherState = w;
    recomputeTheme();
  });

  if (!getTheme()) {
    setThemeState({ userMode: "auto", computed: null });
  }

  recomputeTheme();
}

/* ======================================================
   API UI (SEULE entrée utilisateur)
====================================================== */

export function setUserThemeMode(mode) {
  if (!["auto", "day", "night"].includes(mode)) return;

  const state = getTheme() || {};

  // 🔒 seule fonction autorisée à modifier userMode
  setThemeState({
    ...state,
    userMode: mode
  });

  // ⚡ recalcul immédiat
  recomputeTheme(true);
}

/* ======================================================
   CORE
====================================================== */

function recomputeTheme(force = false) {
  const state = getTheme() || { userMode: "auto" };
  if (!sunState) return;

  const isDay = !sunState.isNight;

  const weatherCode =
    weatherState?.raw?.current?.weather_code ??
    weatherState?.raw?.current_weather?.weathercode ??
    null;

  const signature = [
    state.userMode,
    isDay,
    weatherCode
  ].join("|");

  if (!force && signature === lastSignature) return;
  lastSignature = signature;

  /* ======================================
     🔒 MODE FORCÉ
  ====================================== */

  if (state.userMode === "day" || state.userMode === "night") {
    setThemeState({
      userMode: state.userMode,
      computed: {
        mode: state.userMode,
        phase: state.userMode,
        isNight: state.userMode === "night",
        updatedAt: Date.now()
      }
    });
    return;
  }

  /* ======================================
     🌗 MODE AUTO
  ====================================== */

  const computed = computeTheme({
    isDay,
    weatherCode,
    userMode: state.userMode
  });

  if (!computed) return;

  setThemeState({
    userMode: state.userMode,
    computed: {
      ...computed,
      updatedAt: Date.now()
    }
  });
}

