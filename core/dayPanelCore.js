export function renderDayInLeftPanel(dayIndex, state, ui) {
  const { lastForecastData, weather } = state;
  const city = weather?.city;

  if (!lastForecastData || !city) return;

  const d = lastForecastData.daily;
  if (!d || !d.time || !d.time[dayIndex]) return;

  const iso = d.time[dayIndex];
  const dateObj = new Date(iso);

  ui.detailsTitle.textContent = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  ui.detailsSubtitle.textContent = city.name;

  const tMin = Math.round(d.temperature_2m_min[dayIndex]);
  const tMax = Math.round(d.temperature_2m_max[dayIndex]);
  const code = d.weather_code[dayIndex];

  ui.detailsCurrent.innerHTML = `
    <div class="detail-block">
      <div class="detail-label">Températures</div>
      <div class="detail-value">${tMax}° / ${tMin}°</div>
    </div>
    <div class="detail-block">
      <div class="detail-label">Conditions</div>
      <div class="detail-value">${code}</div>
    </div>
  `;

  // … le reste de ton code reste identique
}
