// controllers/timeController.js

import { onWeatherChange } from "../state/weatherState.js";
import { setTimeState } from "../state/timeState.js";

let timer = null;
let utcOffsetSec = null;

export function initTimeController() {
  console.log("⏰ TimeController ready");

  onWeatherChange(weather => {
    const off = weather?.raw?.utc_offset_seconds;
    if (!Number.isFinite(off)) return;

    utcOffsetSec = off;
    startClock();
  });
}

function startClock() {
  stopClock();
  pushState();
  timer = setInterval(pushState, 1000);
}

function stopClock() {
  if (timer) clearInterval(timer);
  timer = null;
}

function pushState() {
  if (!Number.isFinite(utcOffsetSec)) return;

  const nowUtcMs = Date.now();
  const nowUtc   = new Date(nowUtcMs);

  setTimeState({
    nowUtcMs,
    nowUtc,
    utcOffsetSec
  });
}


