export function computeSkyModel(phase, ratio) {
  if (phase === "dawn") {
    return {
      light: 0.6 + 0.4 * ratio,
      warmth: 0.4 + 0.3 * ratio,
      sat: 0.9
    };
  }

  if (phase === "day") {
    return {
      light: 1,
      warmth: 0.2,
      sat: 1
    };
  }

  if (phase === "dusk") {
    return {
      light: 1 - 0.4 * ratio,
      warmth: 0.5,
      sat: 0.85
    };
  }

  return {
    light: 0.45,
    warmth: 0,
    sat: 0.8
  };
}
