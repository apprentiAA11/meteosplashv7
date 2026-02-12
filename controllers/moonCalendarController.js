import { getMoonIllumination, getMoonPhaseMeta } from "../core/moon/moonEngine.js";
import { computeMoonDay } from "../state/moonState.js";

export function buildMonthCalendar(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // lundi

  const weeks = [];
  let cursor = new Date(start);

  for (let w = 0; w < 6; w++) {
    const week = [];

    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);

      const illum = getMoonIllumination(date);
      const phase = getMoonPhaseMeta(illum.phase);
      const times = computeMoonDay(date);

      week.push({
        date,
        y: date.getFullYear(),
        m: date.getMonth(),
        d: date.getDate(),
        inMonth: date.getMonth() === month,
        isToday: isSameDay(date, new Date()),
        illumination: illum,
        phase,
        times
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push(week);
  }

  return { year, month, weeks };
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}