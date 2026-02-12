export function resolveDailyIndex(dayOrIso, daily) {
  if (typeof dayOrIso === "number") return dayOrIso;
  return daily.time.findIndex(t => t === dayOrIso);
}
