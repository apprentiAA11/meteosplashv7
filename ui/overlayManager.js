// ui/overlayManager.js
// Source unique de vérité pour tous les overlays

export function openOverlay(overlay) {
  if (!overlay) return;

  closeAllOverlays();

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("overlay-open", "no-scroll");
}

export function closeOverlay(overlay) {
  if (!overlay) return;

  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");

  // on nettoie après un tick (au cas où un autre overlay s’ouvre)
  setTimeout(() => {
    if (!document.querySelector(".day-overlay.active") &&
        !document.querySelector("#forecast-overlay.active")) {
      document.body.classList.remove("overlay-open", "no-scroll");
    }
  }, 50);
}

export function closeAllOverlays() {
  document.querySelectorAll(".day-overlay.active, #forecast-overlay.active")
    .forEach(o => {
      o.classList.remove("active");
      o.setAttribute("aria-hidden", "true");
    });

  document.body.classList.remove("overlay-open", "no-scroll");
}