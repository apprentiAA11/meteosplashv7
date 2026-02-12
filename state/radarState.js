// state/radarState.js

let radarState = {
  city: null,
  frames: [],
  index: 0,
  loading: false,
  mode: "rain", // rain | wind | temp
  playing: false
};

const listeners = new Set();

export function onRadarChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach(fn => fn({ ...radarState }));
}

export function setRadarState(patch) {
  radarState = { ...radarState, ...patch };
  emit();
}

export function getRadarState() {
  return radarState;
}
