(function forecastPatch20260102() {
  // --- Icône robuste (fallback non-vide) ---
  window.getWeatherIcon = function getWeatherIconPatched(code) {
    // fallback volontairement non vide (évite les "carrés" / trous)
    if (code == null || Number.isNaN(code)) return "⛅️";

    // Clair
    if (code === 0) return "☀️";
    // Peu nuageux
    if ([1, 2].includes(code)) return "🌤️";
    // Couvert
    if (code === 3) return "☁️";
    // Brouillard
    if ([45, 48].includes(code)) return "🌫️";
    // Pluie / averses
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    // Pluie verglaçante
    if ([56, 57, 66, 67].includes(code)) return "🌧️❄️";
    // Neige
    if ([71, 73, 75, 77].includes(code)) return "❄️";
    // Orages
    if ([95, 96, 99].includes(code)) return "⛈️";

    return "⛅️";
  };

  // --- Choix du code météo du jour (daily -> fallback hourly vers midi) ---
  function getBestDailyCode(data, dayIndex) {
    const d = data?.daily;
    if (!d) return null;

    const arr = d.weather_code;
    if (Array.isArray(arr) && arr[dayIndex] != null) return arr[dayIndex];

    // fallback: on tente via hourly autour de 12:00 locale (timezone=auto)
    const h = data?.hourly;
    if (!h?.time || !h?.weather_code || !Array.isArray(h.time) || !Array.isArray(h.weather_code)) {
      // fallback soft : jour précédent si dispo
      if (Array.isArray(arr) && dayIndex > 0 && arr[dayIndex - 1] != null) return arr[dayIndex - 1];
      return null;
    }

    const dayStr = d.time?.[dayIndex]; // "YYYY-MM-DD"
    if (!dayStr) return null;

    // Open-Meteo renvoie des ISO sans TZ quand timezone=auto, donc new Date("YYYY-MM-DDTHH:mm") est ok (locale navigateur).
    // On prend la première heure >= 12:00 ce jour.
    const targetPrefix = dayStr + "T";
    let bestIdx = -1;
    for (let i = 0; i < h.time.length; i++) {
      const t = h.time[i];
      if (typeof t !== "string" || !t.startsWith(targetPrefix)) continue;

      const hour = Number((t.split("T")[1] || "0").slice(0, 2));
      if (!Number.isFinite(hour)) continue;

      if (hour >= 12) { bestIdx = i; break; }
      // si on ne trouve pas >=12, on gardera le dernier du matin
      bestIdx = i;
    }

    if (bestIdx >= 0 && h.weather_code[bestIdx] != null) return h.weather_code[bestIdx];

    if (Array.isArray(arr) && dayIndex > 0 && arr[dayIndex - 1] != null) return arr[dayIndex - 1];
    return null;
  }

  // --- Compte de jours sûr (évite d'aller sur des index "trous") ---
  function safeDayCount(d, desired) {
    if (!d) return 0;
    const lens = [];
    if (Array.isArray(d.time)) lens.push(d.time.length);
    if (Array.isArray(d.temperature_2m_max)) lens.push(d.temperature_2m_max.length);
    if (Array.isArray(d.temperature_2m_min)) lens.push(d.temperature_2m_min.length);
    if (Array.isArray(d.weather_code)) lens.push(d.weather_code.length);
    if (Array.isArray(d.precipitation_sum)) lens.push(d.precipitation_sum.length);
    if (Array.isArray(d.wind_speed_10m_max)) lens.push(d.wind_speed_10m_max.length);

    const minLen = lens.length ? Math.min(...lens) : 0;
    return Math.max(0, Math.min(desired, minLen));
  }

  // --- Render unifié (compatible anciens appels) ---
  window.renderForecast = function renderForecastPatched(arg1 = "7", arg2) {
    const list = document.getElementById("forecast-list");
    const data =
      (arg1 && typeof arg1 === "object" && arg1.daily) ? arg1 :
      (typeof lastForecastData !== "undefined" ? lastForecastData : null);

    if (!list || !data?.daily) return;

    // Déterminer 7 ou 14
    let desired = 7;
    if (typeof arg1 === "number") desired = Math.max(1, Math.floor(arg1));
    else if (typeof arg1 === "string") desired = (arg1 === "14") ? 14 : 7;
    else if (typeof arg2 === "number") desired = Math.max(1, Math.floor(arg2));
    else if (typeof arg2 === "string") desired = (arg2 === "14") ? 14 : 7;

    const d = data.daily;
    const count = safeDayCount(d, desired);

    list.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const code = getBestDailyCode(data, i);
      const icon = window.getWeatherIcon(code);
      const label = (typeof getWeatherLabel === "function") ? getWeatherLabel(code) : "";

      const tmax = d.temperature_2m_max?.[i];
      const tmin = d.temperature_2m_min?.[i];
      const rain = d.precipitation_sum?.[i];
      const pop  = d.precipitation_probability_max?.[i];
      const wind = d.wind_speed_10m_max?.[i];

      const item = document.createElement("button");
      item.type = "button";
      item.className = "forecast-item";
      item.dataset.dayIndex = String(i);

      const rainTxt = `${(rain ?? 0)} mm` + (pop != null ? ` · ${pop}%` : "");
      const windTxt = `${Math.round(wind ?? 0)} km/h`;

      item.innerHTML = `
        <div class="forecast-day">${typeof formatDay === "function" ? formatDay(d.time[i]) : (d.time[i] || "")}</div>
        <div class="forecast-icon" ${label ? `data-label="${String(label).replace(/"/g, "&quot;")}"` : ""}>${icon}</div>
        <div class="forecast-temps">
          <span class="max">${Number.isFinite(tmax) ? Math.round(tmax) : "—"}°</span>
          <span class="min">${Number.isFinite(tmin) ? Math.round(tmin) : "—"}°</span>
        </div>
        <div class="forecast-rain">${rainTxt}</div>
        <div class="forecast-wind">${windTxt}</div>
      `;

      // couleurs temp si util dispo
      try {
        const maxEl = item.querySelector(".max");
        const minEl = item.querySelector(".min");
        if (maxEl && typeof getTempColor === "function" && Number.isFinite(tmax)) maxEl.style.color = getTempColor(tmax);
        if (minEl && typeof getTempColor === "function" && Number.isFinite(tmin)) minEl.style.color = getTempColor(tmin);
      } catch (_) {}

      item.addEventListener("click", () => {
        try {
          if (typeof openDayOverlay === "function") openDayOverlay(i);
        } catch (_) {}
      });

      list.appendChild(item);
    }
  };

  // --- Quand on ouvre la popup Prévisions, on force un rendu propre (7j par défaut) ---
  try {
    const overlay = document.getElementById("forecast-overlay");
    const btnOpen = document.getElementById("btn-forecast-popup");
    const btn7 = document.getElementById("btn-forecast-7");
    const btn14 = document.getElementById("btn-forecast-14");

    function setActive(days) {
      if (!btn7 || !btn14) return;
      if (days === 14) {
        btn14.classList.add("pill-button-active");
        btn7.classList.remove("pill-button-active");
      } else {
        btn7.classList.add("pill-button-active");
        btn14.classList.remove("pill-button-active");
      }
    }

    if (btnOpen && overlay) {
      btnOpen.addEventListener("click", () => {
        // si data dispo, on rend systématiquement propre
        if (typeof lastForecastData !== "undefined" && lastForecastData) {
          setActive(7);
          window.renderForecast(7);
        }
      }, { passive: true });
    }
  } catch (e) {
    console.warn("forecastPatch init skipped", e);
  }
})();

