// core/moon/findNextPhase.js
import { getMoonIllumination } from "./moonEngine.js";

export function findNextPhase(startDate, targetPhase, maxDays = 40) {
  const stepMinutes = 60; // précision 1h (largement suffisant)
  const maxSteps = (maxDays * 24 * 60) / stepMinutes;

  let prev = getMoonIllumination(startDate).phase;

  let t = new Date(startDate);

  for (let i = 0; i < maxSteps; i++) {
    t = new Date(t.getTime() + stepMinutes * 60000);
    const p = getMoonIllumination(t).phase;

    // pleine lune : passage par 0.5
    if (targetPhase === "full" && prev < 0.5 && p >= 0.5) {
      return new Date(t);
    }

    // nouvelle lune : passage par 0 / 1
    if (targetPhase === "new" && prev > 0.9 && p < 0.1) {
      return new Date(t);
    }

    prev = p;
  }

  return null;
}
