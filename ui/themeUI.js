// ui/themeUI.js
import { setUserThemeMode } from "../controllers/themeController.js";
import { onThemeChange } from "../state/themeState.js";

let currentMode = "auto";

export function initThemeUI() {
  console.log("🖌 ThemeUI ready");

  const btn = document.getElementById("btn-theme-toggle");

  if (btn) {
    btn.addEventListener("click", () => {
      // cycle : auto → day → night → auto
      if (currentMode === "auto") currentMode = "day";
      else if (currentMode === "day") currentMode = "night";
      else currentMode = "auto";

      console.log("🎨 Theme button →", currentMode);
      setUserThemeMode(currentMode);
      updateThemeButton(btn, currentMode);
    });
  }

  onThemeChange(themeState => {
    if (!themeState) return;
    currentMode = themeState.userMode || "auto";
    updateThemeButton(btn, currentMode);
    applyThemeUI(themeState);
  });
}

function updateThemeButton(btn, mode) {
  if (!btn) return;

  if (mode === "auto") {
    btn.textContent = "🌓 Auto";
  } else if (mode === "day") {
    btn.textContent = "🌞 Jour";
  } else {
    btn.textContent = "🌙 Nuit";
  }
}

function applyThemeUI(themeState) {
  if (!themeState?.computed) return;

  const { cssVars, phase, isNight } = themeState.computed;
  const root = document.documentElement;
  const body = document.body;

  // CSS variables
  if (cssVars) {
    Object.entries(cssVars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
  }

  // reset classes
  body.classList.remove("theme-day", "theme-night", "theme-auto");

  // tag mode
  body.classList.add(`theme-${themeState.userMode || "auto"}`);

  // règle maître
  if (themeState.userMode === "day") {
    body.classList.remove("theme-night");
    body.classList.add("theme-day");
  }
  else if (themeState.userMode === "night") {
    body.classList.add("theme-night");
    body.classList.remove("theme-day");
  }
  else {
    // auto → moteur
    body.classList.toggle("theme-night", isNight);
    body.classList.toggle("theme-day", !isNight);
  }

  body.dataset.phase = phase;
}

