// services/moonService.js

export async function fetchMoonEvents(lat, lon) {
  if (!window.SunCalc) return [];

  const events = [];
  const today = new Date();

  // on calcule sur 30 jours autour d’aujourd’hui
  for (let i = -15; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const times = SunCalc.getMoonTimes(d, lat, lon);

    if (times.rise) {
      events.push({ type: "rise", date: times.rise });
    }
    if (times.set) {
      events.push({ type: "set", date: times.set });
    }
  }

  return events.sort((a,b) => a.date - b.date);
}
