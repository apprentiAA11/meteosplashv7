/* ======================================================
   TOOLTIP MÉTÉO — proche du pointeur, curseur intact
====================================================== */



//ui/forecastPopupUI.js

/* === Prévisions popup (7j / 14j) === */

const btnForecastPopup = document.getElementById("btn-forecast-popup");
const forecastOverlay = document.getElementById("forecast-overlay");
const btnCloseForecast = document.getElementById("btn-close-forecast");

if (btnForecastPopup && forecastOverlay) {
  btnForecastPopup.addEventListener("click", () => {
    forecastOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
  });
}

if (btnCloseForecast && forecastOverlay) {
  btnCloseForecast.addEventListener("click", () => {
    forecastOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });
}

//ui/forecastPopupUI.js
/* =====================================================
   SWIPE GAUCHE / DROITE — Prévisions 7j / 14j
===================================================== */

(function () {
  const popup = document.querySelector("#forecast-overlay .day-popup");
  if (!popup) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  popup.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  popup.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // si scroll vertical → on annule
    if (Math.abs(dy) > Math.abs(dx)) {
      isSwiping = false;
      return;
    }
  }, { passive: true });

  popup.addEventListener("touchend", (e) => {
    if (!isSwiping) return;

    const dx = e.changedTouches[0].clientX - startX;

    if (dx < -50 && btnForecast14 && btnForecast7) {
      // swipe gauche → 14 jours
      btnForecast14.click();
    }

    if (dx > 50 && btnForecast14 && btnForecast7) {
      // swipe droite → 7 jours
      btnForecast7.click();
    }

    isSwiping = false;
  });
})();

//ui/forecastPopupUI.js
/* =====================================================
   CLAVIER — Prévisions 7j / 14j
===================================================== */

document.addEventListener("keydown", (e) => {
  if (!forecastOverlay || !forecastOverlay.classList.contains("active")) return;

  if (e.key === "ArrowLeft" && btnForecast7) {
    btnForecast7.click();
  }

  if (e.key === "ArrowRight" && btnForecast14) {
    btnForecast14.click();
  }

  if (e.key === "Escape" && btnCloseForecast) {
    btnCloseForecast.click();
  }
});


/* ================= POPUP PRÉVISIONS (OPEN/CLOSE) ================= */
(function initForecastOverlay() {
  const btn = document.getElementById("btn-forecast-popup");
  const overlay = document.getElementById("forecast-overlay");
  const btnClose = document.getElementById("btn-close-forecast");
  if (!overlay) return;

  const backdrop = overlay.querySelector(".overlay-backdrop");

  function openForecastOverlay() {
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");

    // sécurité : si on ouvre et que c’est vide → on rend (si data dispo)
    try {
      if (typeof lastForecastData !== "undefined" && lastForecastData) {
        if (typeof renderForecastList === "function") {
          renderForecastList(lastForecastData);
        }
      }
    } catch (e) {
      console.warn("Forecast overlay: render skipped", e);
    }
  }

  function closeForecastOverlay() {
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  btn?.addEventListener("click", openForecastOverlay);
  btnClose?.addEventListener("click", closeForecastOverlay);
  backdrop?.addEventListener("click", closeForecastOverlay);

  // Esc ferme toujours
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape") closeForecastOverlay();
  });
})();