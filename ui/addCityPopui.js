//ui/addCityPopupUI.js et voir chatgpt
/* @PATCH AddCityPopup AutoClose */
(function(){
  const overlay = document.getElementById("add-city-overlay");
  const panel = document.getElementById("add-city-panel");
  if(!overlay || !panel) return;

  // observe clicks inside autocomplete or city list
  panel.addEventListener("click", (e)=>{
    const li = e.target.closest("li");
    if(!li) return;

    // delay to let existing logic finish (fetch / render)
    setTimeout(()=>{
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    },150);
  });
})();

function updateAddCityButtonVisibility() {
  const panel = document.getElementById("add-city-panel");
  const btnAdd = document.getElementById("btn-add-city");
  if (!panel || !btnAdd) return;

  // Le bouton "+" doit toujours être visible
  btnAdd.style.display = "inline-flex";

  if (cities.length === 0) {
    // On replie le panneau d'ajout dans Mes villes
    panel.classList.add("hidden-merged");
} else {
    panel.classList.add("hidden-merged");
}
}
// ui/addCityPopupUI.js

export function initAddCityPopupUI() {
  const btnAddCityHeader = document.getElementById("btn-add-city");
  const overlay = document.getElementById("add-city-overlay");
  const closeBtn = document.getElementById("btn-close-add-city");
  const popupSlot = document.getElementById("add-city-popup-slot");
  const panel = document.getElementById("add-city-panel");
  const input = document.getElementById("city-input");

  if(!btnAddCityHeader || !overlay || !panel) return;

  const originalParent = panel.parentElement;
  const originalNext = panel.nextSibling;

  function openPopup(){
    popupSlot.appendChild(panel);
    panel.classList.remove("hidden-merged");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
    setTimeout(()=>input && input.focus(),150);
  }

  function closePopup(){
    if(originalNext){
      originalParent.insertBefore(panel, originalNext);
    } else {
      originalParent.appendChild(panel);
    }
    panel.classList.add("hidden-merged");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  btnAddCityHeader.addEventListener("click", openPopup);
  closeBtn && closeBtn.addEventListener("click", closePopup);

  const backdrop = overlay.querySelector(".overlay-backdrop");
  if (backdrop) backdrop.addEventListener("click", closePopup);

  // auto-close quand on clique une ville
  panel.addEventListener("click", (e)=>{
    const li = e.target.closest("li");
    if(!li) return;
    setTimeout(closePopup, 150);
  });
}
