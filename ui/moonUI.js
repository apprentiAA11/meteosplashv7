// ui/moonUI.js
// 🌙 UI Lune — calendrier mensuel + sélection jour (STABLE + next full/new toujours)

// ✅ Objectifs :
// - Ne PAS casser les dessins (mini-lunes propres)
// - Ne PAS “sauter” de mois après clic sur un jour (mois piloté par currentMonth/currentYear)
// - Afficher CHAQUE JOUR : prochaine 🌕 + prochaine 🌑 (fallback robuste même si le controller ne les fournit pas)
// - Optimiser : ne pas reconstruire la grille si le mois n’a pas changé (juste mettre à jour "selected")

import { onMoonChange } from "../state/moonState.js";
import { drawMoon, preloadMoonTexture, prepareCanvas } from "../core/moon/moonCanvas.js";

/* =====================================================
   STATE LOCAL UI
===================================================== */

let lastMoonState = null;
let currentMonth = null;
let currentYear  = null;
let renderedMonthKey = null;
let lastTimesKey = null;
let lastHeaderKey = null;
let lastIllumGlobal = null;

/* =====================================================
   INIT
===================================================== */

export function initMoonUI() {
  preloadMoonTexture("assets/moon/moon_texture.jpg");

  const overlay  = document.getElementById("moon-overlay");
  const panel    = overlay?.querySelector(".moon-panel");
  const backdrop = overlay?.querySelector(".moon-backdrop");

  /* ===============================
     OUVERTURE / FERMETURE
  =============================== */

  document.getElementById("btn-moon")
    ?.addEventListener("click", openMoon);

  document.getElementById("btn-close-moon")
    ?.addEventListener("click", closeMoon);

  // ✔ Clic sur le backdrop
  backdrop?.addEventListener("click", closeMoon);

  // ✔ Sécurité : si on clique vraiment hors du panneau
  overlay?.addEventListener("click", (e) => {
    if (panel && !panel.contains(e.target)) {
      closeMoon();
    }
  });

  // ✔ ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("overlay-open")) {
      closeMoon();
    }
  });

  /* ===============================
     NAVIGATION MOIS
  =============================== */

  document.getElementById("moon-prev-month")
    ?.addEventListener("click", () => changeMonth(-1));

  document.getElementById("moon-next-month")
    ?.addEventListener("click", () => changeMonth(1));

  // PageUp / PageDown
  document.addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("overlay-open")) return;

    if (e.key === "PageUp")   changeMonth(-1);
    if (e.key === "PageDown") changeMonth(1);
  });

  /* ===============================
     TEXTURE READY
  =============================== */

  document.addEventListener("moon:texture-ready", () => {
    if (lastMoonState) renderMoon(lastMoonState);
  });

  /* ===============================
     PICKERS
  =============================== */

  initMonthYearPickers();
  initMoonYearInput();
  initMoonTodayBtn();

  /* ===============================
     SUBSCRIBE STATE
  =============================== */

  onMoonChange(renderMoon);
}

function initMoonTodayBtn() {
  const btn = document.getElementById("moon-today-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const now = new Date();

    currentMonth = now.getMonth();
    currentYear  = now.getFullYear();
    renderedMonthKey = null;

    // synchro UI
    const monthSel = document.getElementById("moon-month-select");
    const yearInput = document.getElementById("moon-year-input");

    if (monthSel)  monthSel.value  = currentMonth;
    if (yearInput) yearInput.value = currentYear;

    lastMoonState && renderMonth(lastMoonState);
    updateSelectedInGrid(now);
  });
}

function initMonthYearPickers() {
  const monthSel = document.getElementById("moon-month-select");
  if (!monthSel) return;

  const months = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ];

  monthSel.innerHTML = months
    .map((m,i)=>`<option value="${i}">${m}</option>`)
    .join("");

  monthSel.addEventListener("change", () => {
    currentMonth = Number(monthSel.value);
    renderedMonthKey = null;
    lastMoonState && renderMonth(lastMoonState);
  });
}

function initMoonYearInput() {
  const input = document.getElementById("moon-year-input");
  if (!input) return;

  input.addEventListener("change", () => {
    const y = Number(input.value);
    if (!y || y < 1000 || y > 2500) return;

    currentYear = y;
    renderedMonthKey = null;
    lastMoonState && renderMonth(lastMoonState);
  });
}
/* =====================================================
   OVERLAY
===================================================== */

function openMoon() {
  const overlay = document.getElementById("moon-overlay");
  if (!overlay) return;

  overlay.classList.add("active");
  document.body.classList.add("overlay-open");
  overlay.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    if (lastMoonState) renderMoon(lastMoonState);
  });
}

function closeMoon() {
  const overlay = document.getElementById("moon-overlay");
  if (!overlay) return;

  overlay.classList.remove("active");
  document.body.classList.remove("overlay-open");
  overlay.setAttribute("aria-hidden", "true");
}

/* =====================================================
   RENDER GLOBAL
===================================================== */
function renderMoon(state) {
  if (!state || !(state.date instanceof Date) || isNaN(state.date)) return;

  const illum = state.illumination?.fraction;

  // 🔥 update moon principale UNIQUEMENT si changement réel
  if (
    Number.isFinite(illum) &&
    (!Number.isFinite(lastIllumGlobal) ||
     Math.abs(illum - lastIllumGlobal) > 0.001)
  ) {
    renderMain(state);
    lastIllumGlobal = illum;
  }

  lastMoonState = state;

  const overlay = document.getElementById("moon-overlay");
  if (overlay && !overlay.classList.contains("active")) return;


  // ✅ init mois affiché UNE seule fois
  if (currentMonth === null || currentYear === null) {
    currentMonth = state.date.getMonth();
    currentYear  = state.date.getFullYear();
    renderedMonthKey = null;
  }

  const headerKey =
  state.date?.getTime?.() + "|" + (state.city?.name || "");

if (headerKey !== lastHeaderKey) {
  renderHeader(state);
  lastHeaderKey = headerKey;
}

const toTs = d => d ? new Date(d).getTime() : 0;

const timesKey = state.times
  ? [
      toTs(state.times?.prevEvent?.date),
      toTs(state.times?.nextEvent?.date),
      state.times?.events?.length || 0
    ].join("|")
  : "no-times";


if (timesKey !== lastTimesKey) {
  renderTimes(state);
  lastTimesKey = timesKey;
}

  // clé mois
const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}`;

// 🔥 rebuild UNIQUEMENT si mois change
if (renderedMonthKey !== monthKey) {
  renderMonth(state);
  renderedMonthKey = monthKey;
}

// 🔥 toujours mettre à jour la sélection (léger)
updateSelectedInGrid(state.date);

}

/* =====================================================
   HEADER + MAIN
===================================================== */

function renderHeader(state) {
  const el = document.getElementById("moon-subtitle");
  if (!el) return;

  el.textContent =
    `${state.city?.name || ""} — ` +
    state.date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    });
}

function renderMain(state) {
  const nameEl  = document.getElementById("moon-phase-name");
  const descEl  = document.getElementById("moon-phase-desc");
  const illumEl = document.getElementById("moon-illum");
  const canvas  = document.getElementById("moon-photo");

  if (canvas && state.illumination) {
    const last = Number(canvas.dataset.lastIllum || -1);
    const frac = Number(state.illumination.fraction);

    if (!Number.isFinite(last) || Math.abs(last - frac) > 0.001) {
      prepareCanvas(canvas);
      drawMoon(canvas, frac, !!state.phase?.waxing);
      canvas.style.transform = "scale(1.05)";
      setTimeout(() => {
       canvas.style.transform = "scale(1)";
      }, 140);
      canvas.dataset.lastIllum = String(frac);
    }
  }

  if (nameEl) nameEl.textContent = `${state.phase?.emoji || "🌙"} ${state.phase?.name || ""}`;

  if (descEl && state.phase?.age != null) {
    descEl.textContent =
      `Âge : ${Number(state.phase.age).toFixed(1)} jours • ${
        state.phase?.waxing ? "croissante" : "décroissante"
      }`;
  }

  if (illumEl && state.illumination?.fraction != null) {
    illumEl.textContent =
      `Illumination : ${(Number(state.illumination.fraction) * 100).toFixed(0)}%`;
  }
}

/* =====================================================
   TIMES + NEXT FULL/NEW (TOUJOURS)
===================================================== */

function renderTimes(state) {
  const box = document.getElementById("moon-times");
  if (!box) return;

  box.innerHTML = "";

  const t = state.times;
  if (t?.events?.length) {
    t.events.forEach(ev => {
      if (!ev?.date) return;
      addRow(
        box,
        ev.type === "rise" ? "Lever" : "Coucher",
        toHHMM(ev.date, state.city?.timezone)
      );
    });
  } else {
    // ✅ s’il n’y a pas d’événement dans la journée, on montre "dernier" + "prochain" si dispo
if (t?.prevEvent?.date) {
  const d = t.prevEvent.date;
  if (d) {
    addRow(
      box,
      t.prevEvent.type === "rise" ? "Dernier lever" : "Dernier coucher",
      toHHMM(d, state.city?.timezone)
    );
  }
}

if (t?.nextEvent?.date) {
  addRow(
    box,
    t.nextEvent.type === "rise" ? "Prochain lever" : "Prochain coucher",
    toHHMM(t.nextEvent.date, state.city?.timezone)
  );
}

    if (!t?.prevEvent?.date && !t?.nextEvent?.date) {
      addRow(box, "Lune", "pas d’événement proche");
    }
  }

  // ✅ Prochaine pleine lune / nouvelle lune : TOUJOURS essayer d’afficher
  const nextFull = ensureNextEvent(state, "isFull", 0.5); // cible phase ~ 0.5
  const nextNew  = ensureNextEvent(state, "isNew",  0.0); // cible phase ~ 0.0/1.0

  if (nextFull?.date) {
    addRow(
      box,
      "🌕 Prochaine pleine lune",
      toFR(nextFull.date)
    );
  } else {
    addRow(box, "🌕 Prochaine pleine lune", "—");
  }

  if (nextNew?.date) {
    addRow(
      box,
      "🌑 Nouvelle lune",
      toFR(nextNew.date)
    );
  } else {
    addRow(box, "🌑 Nouvelle lune", "—");
  }
}

function addRow(box, label, value) {
  const row = document.createElement("div");
  row.className = "moon-time-row";
  row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  box.appendChild(row);
}

function toHHMM(d, timezone) {
  const dd = d instanceof Date ? d : new Date(d);
  if (isNaN(dd)) return "—";

  return dd.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || undefined
  });
}

function toFR(d) {
  const dd = d instanceof Date ? d : new Date(d);
  if (!(dd instanceof Date) || isNaN(dd)) return "—";
  return dd.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * ✅ Toujours fournir un "nextFull/nextNew" même si le controller ne l’a pas mis
 * - priorité 1 : state.nextFull / state.nextNew si valides
 * - priorité 2 : trouver dans state.calendar avec clé isFull/isNew
 * - priorité 3 : fallback robuste : choisir le jour futur le + proche de la phase cible (0.5 ou 0.0)
 */
function ensureNextEvent(state, key, targetPhase) {
  const from = startOfDay(state.date);

  // 1) controller
  const direct =
    key === "isFull" ? state.nextFull :
    key === "isNew"  ? state.nextNew  :
    null;

  if (direct?.date) {
    const dd = direct.date instanceof Date ? direct.date : new Date(direct.date);
    if (!isNaN(dd) && dd > from) return { ...direct, date: dd };
  }

  // 2) marqué dans calendar
  const marked = findNextMarked(state.calendar, from, key);
  if (marked?.date) return marked;

  // 3) fallback : phase la plus proche de la cible dans les jours futurs
  const approx = findNextByPhase(state.calendar, from, targetPhase);
  return approx;
}

function startOfDay(d) {
  const dd = d instanceof Date ? new Date(d) : new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd;
}

function findNextMarked(calendar, fromDate, key) {
  if (!Array.isArray(calendar)) return null;

  const base = startOfDay(fromDate);

  let best = null;
  for (const it of calendar) {
    if (!it?.[key] || !it?.date) continue;
    const dd = startOfDay(it.date);
    if (dd > base) { best = { ...it, date: new Date(it.date) }; break; }
  }
  return best;
}

// fallback : minimiser distance à phase cible (en tenant compte wrap 0↔1)
function findNextByPhase(calendar, fromDate, target) {
  if (!Array.isArray(calendar)) return null;

  const base = startOfDay(fromDate);
  let best = null;
  let bestScore = Infinity;

  for (const it of calendar) {
    if (!it?.date || !it?.illumination) continue;
    const dd = startOfDay(it.date);
    if (dd <= base) continue;

    const p = Number(it.illumination.phase);
    if (!Number.isFinite(p)) continue;

    // distance circulaire
    const a = Math.abs(p - target);
    const score = Math.min(a, 1 - a);

    if (score < bestScore) {
      bestScore = score;
      best = it;
    }
  }

  return best ? { ...best, date: new Date(best.date) } : null;
}

/* =====================================================
   CALENDRIER MENSUEL
===================================================== */

function renderMonth(state) {
  const grid  = document.getElementById("moon-month-grid");
  const title = document.getElementById("moon-month-title");
  if (!grid || !title) return;

  // sécurité si jamais
  if (currentMonth === null || currentYear === null) {
    currentMonth = state.date.getMonth();
    currentYear  = state.date.getFullYear();
  }

  const first = new Date(currentYear, currentMonth, 1);
  const last  = new Date(currentYear, currentMonth + 1, 0);

  title.textContent = first.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric"
  });

  grid.innerHTML = "";

  const startDay = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = last.getDate();

  // jours du mois précédent (off)
  for (let i = 0; i < startDay; i++) {
    const d = new Date(currentYear, currentMonth, i - startDay + 1);
    grid.appendChild(buildMonthDay(d, state, true));
  }

  // jours du mois courant
  for (let d = 1; d <= daysInMonth; d++) {
    grid.appendChild(
      buildMonthDay(new Date(currentYear, currentMonth, d), state, false)
    );
  }

  // 🔁 synchro selects
  const monthSel = document.getElementById("moon-month-select");
  const yearSel = document.getElementById("moon-year-input");
  monthSel && (monthSel.value = currentMonth);
  yearSel  && (yearSel.value  = currentYear);

  // 🔁 surlignage jour sélectionné
  updateSelectedInGrid(state.date);
}

function buildMonthDay(date, state, offMonth) {
  const wrap = document.createElement("div");
  wrap.className = "moon-month-day";
  if (offMonth) wrap.classList.add("off");

  if (sameDay(date, new Date())) wrap.classList.add("today");

  // ✅ IMPORTANT : canvas mini-lune avec style fixe (sinon ça “grossit” dans certains layouts)
  wrap.innerHTML = `
    <div class="n">${date.getDate()}</div>
    <div class="disc">
      <canvas width="22" height="22" style="width:22px;height:22px;"></canvas>
    </div>
  `;

  const cv = wrap.querySelector("canvas");

 const day = Array.isArray(state.calendar)
  ? state.calendar.find(d => d?.date && sameDay(d.date, date))
  : null;

// ✅ fallback : si le jour n’est pas dans calendar,
// on utilise une estimation simple basée sur l’âge lunaire
const src = day || estimateMoonForDate(date, state);

if (cv && src?.illumination?.fraction != null){
  prepareCanvas(cv);
  drawMoon(
    cv,
    Number(src.illumination.fraction),
    !!src.phase?.waxing
  );
}

  if (day?.isFull) {
  wrap.classList.add("full-moon");
  }
  if (day?.isNew)  wrap.classList.add("new-moon");

  wrap.dataset.date = date.toISOString();

wrap.addEventListener("click", () => {
  wrap.style.transform = "scale(0.92)";
  setTimeout(() => {
    wrap.style.transform = "";
  }, 120);

  document.dispatchEvent(new CustomEvent("moon:select-day", { detail: { date } }));
});


  return wrap;
}

function updateSelectedInGrid(selectedDate) {
  const grid = document.getElementById("moon-month-grid");
  if (!grid || !(selectedDate instanceof Date) || isNaN(selectedDate)) return;

  const items = grid.querySelectorAll(".moon-month-day");
  items.forEach(el => {
    const iso = el.dataset.date;
    if (!iso) return;
    const d = new Date(iso);
    if (isNaN(d)) return;
    el.classList.toggle("selected", sameDay(d, selectedDate));
  });
}

/* =====================================================
   HELPERS
===================================================== */

function sameDay(a, b) {
  const aa = a instanceof Date ? a : new Date(a);
  const bb = b instanceof Date ? b : new Date(b);
  if (isNaN(aa) || isNaN(bb)) return false;
  return aa.getFullYear() === bb.getFullYear() &&
         aa.getMonth() === bb.getMonth() &&
         aa.getDate() === bb.getDate();
}

function changeMonth(delta) {
  if (currentMonth === null || currentYear === null) return;

  currentMonth += delta;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  // ✅ force rebuild du calendrier au prochain renderMoon
  renderedMonthKey = null;

  // pivot = 15 du mois affiché
  document.dispatchEvent(
    new CustomEvent("moon:change-month", {
      detail: { pivot: new Date(currentYear, currentMonth, 15) }
    })
  );

  // si l’état est déjà là, on peut rafraîchir la grille immédiatement
  if (lastMoonState) renderMonth(lastMoonState);
}
function estimateMoonForDate(date, refState) {
  if (!refState?.phase?.age || !refState?.date) return null;

  const daysDiff =
    (startOfDay(date) - startOfDay(refState.date)) / 86400000;

  const synodicMonth = 29.530588;
  const age =
    (refState.phase.age + daysDiff + synodicMonth) % synodicMonth;

  const fraction = 0.5 * (1 - Math.cos((2 * Math.PI * age) / synodicMonth));

  return {
    illumination: { fraction },
    phase: {
      waxing: age < synodicMonth / 2
    }
  };
}
