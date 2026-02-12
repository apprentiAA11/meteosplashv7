// statusUI.js
function setLastUpdateNow() {
  const el = document.getElementById("last-update");
  if (!el) return;

  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");

  el.textContent = `Dernière mise à jour : ${hh}:${mm}`;
  el.classList.remove("hidden");
}

export function showStatusToast(text, duration = 2200, type = "info") {
  const el = document.getElementById("status-toast");
  if (!el) return;

  el.textContent = text;

  el.classList.remove(
    "hidden",
    "show",
    "toast-error",
    "toast-success",
    "toast-info"
  );

  void el.offsetHeight; // force reflow

  el.classList.add("show");

  if (type) el.classList.add(`toast-${type}`);

  clearTimeout(el.__t);
  el.__t = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.classList.add("hidden"), 300);
  }, duration);
}
// ===============================
// CITY ERRORS → TOAST
// ===============================

document.addEventListener("city:error", e => {
  const msg = e.detail?.message;
  if (!msg) return;

  showStatusToast(msg, 2200, "info");
});
