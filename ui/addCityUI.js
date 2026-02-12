// ui/addCityUI.js

let overlay, panel, input, list, form;
let isInit = false;

/* ===============================
   FERMETURE POPUP
================================ */

export function closeAddCityPopup() {
  document.body.classList.remove("overlay-open");

  if (input) {
    input.blur();        // enlève le focus
    input.value = "";
  }

  if (!overlay || !panel) return;

  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");

  panel.classList.add("hidden-merged");

  if (list) {
    list.innerHTML = "";
    list.style.display = "none";
  }
}

/* ===============================
   INIT UI
================================ */

export function initAddCityUI() {
  if (isInit) return;
  isInit = true;

  console.log("➕ AddCityUI ready");

  const btnAdd   = document.getElementById("btn-add-city");
  overlay = document.getElementById("add-city-overlay");
  panel   = document.getElementById("add-city-panel");
  const btnClose = document.getElementById("btn-close-add-city");
  input  = document.getElementById("city-input");
  list   = document.getElementById("autocomplete-list");
  form   = document.getElementById("city-search-form");

  if (!btnAdd || !overlay || !panel || !input || !list || !form) {
    console.warn("➕ AddCityUI: éléments manquants");
    return;
  }

  /* ⛔ empêche submit natif */
  form.addEventListener("submit", e => {
    e.preventDefault();
    return false;
  });

  /* ===============================
     OUVERTURE
  ================================ */

  function openPopup() {
    document.body.classList.add("overlay-open");

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");

    panel.classList.remove("hidden-merged");

    list.innerHTML = "";
    list.style.display = "none";
    input.value = "";

    setTimeout(() => input.focus(), 80);
  }

  btnAdd.addEventListener("click", openPopup);
  btnClose.addEventListener("click", closeAddCityPopup);

  overlay.addEventListener("click", e => {
    if (e.target.classList.contains("overlay-backdrop")) {
      closeAddCityPopup();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeAddCityPopup();
    }
  });

  /* ===============================
     🔔 DOUBLON → FERME POPUP
  ================================ */

  document.addEventListener("city:error", e => {
    if (e.detail?.type === "duplicate") {
      if (overlay?.classList.contains("active")) {
        closeAddCityPopup();
      }
    }
  });
}