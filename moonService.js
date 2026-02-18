// services/moonService.js

export async function fetchMoonEvents(lat, lon) {
  if (!window.SunCalc) return [];

  const events = [];
  const today = new Date();

  // On calcule sur 45 jours autour d’aujourd’hui
  for (let i = -15; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const times = SunCalc.getMoonTimes(d, lat, lon);

    if (times?.rise instanceof Date && !isNaN(times.rise)) {
      events.push({
        type: "rise",
        date: times.rise   // ← PAS de conversion
      });
    }

    if (times?.set instanceof Date && !isNaN(times.set)) {
      events.push({
        type: "set",
        date: times.set   // ← PAS de conversion
      });
    }
  }

  return events.sort((a, b) => a.date - b.date);
}