// ui/geolocateUI.js

import { showStatusToast } from "./statusUI.js";
import { geolocateUser } from "../controllers/geolocationController.js";

/* =====================================================
   STATE UI
===================================================== */

let btnGeolocate = null;
let toast = null;
let hasValidLocation = false;

/* =====================================================
   INIT
===================================================== */

export function initGeolocateUI() {
  btnGeolocate = document.getElementById("btn-geolocate");
  toast = document.getElementById("toast");

  if (!btnGeolocate) {
    console.warn("GeolocateUI: #btn-geolocate not found");
    return;
  }

  console.log("📍 GeolocateUI ready");
  btnGeolocate.addEventListener("click", onGeolocateClick);
}

/* =====================================================
   EVENTS
===================================================== */

async function onGeolocateClick() {
  if (hasValidLocation) return;

  setGeolocateLoading();

  try {
    const city = await geolocateUser();

    const name = city?.name || null;

    setGeolocateSuccess(name);

    // ✅ NOUVEAU — badge premium en haut
    if (name) {
      showStatusToast(`📍 Position trouvée — ${name}`);
    } else {
      showStatusToast("📍 Position trouvée");
    }

  } catch (e) {
    console.error("Geolocate error:", e);
    setGeolocateError("Impossible de déterminer votre position.");
  }
}

/* =====================================================
   UI HELPERS
===================================================== */

function showToast(message, type = "info") {
  if (!toast) return;

  toast.textContent = message;
  toast.className = "toast toast-visible";

  if (type === "error") toast.classList.add("toast-error");
  if (type === "success") toast.classList.add("toast-success");

  setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 1800);
}

function setGeolocateIdle() {
  if (!btnGeolocate) return;
  btnGeolocate.disabled = false;
  btnGeolocate.classList.remove("location-loading", "location-success");
  btnGeolocate.textContent = "📍 Ma position";
}

function setGeolocateLoading() {
  if (!btnGeolocate) return;
  btnGeolocate.disabled = true;
  btnGeolocate.classList.remove("location-success");
  btnGeolocate.classList.add("location-loading");
  btnGeolocate.textContent = "📍 Recherche…";
}

function setGeolocateSuccess(cityName) {
  hasValidLocation = true;
  if (!btnGeolocate) return;

  btnGeolocate.disabled = false;
  btnGeolocate.classList.remove("location-loading");
  btnGeolocate.classList.add("location-success");
  btnGeolocate.textContent = "✅ Position trouvée";

  // toast classique conservé (feedback local)
  if (cityName) {
    showToast(`📍 Position détectée : ${cityName}`, "success");
  }

  setTimeout(setGeolocateIdle, 1500);
}

function setGeolocateError(message) {
  showToast(message || "Impossible de déterminer votre position.", "error");
  setGeolocateIdle();
}
