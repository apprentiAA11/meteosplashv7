// ui/historyUI.js

export function initHistoryUI() {
  console.log("📜 HistoryUI ready");

  const btnHistory = document.getElementById("btn-history");

  const currentBox = document.getElementById("details-current");
  const historyBox = document.getElementById("details-history");

  const inputDate  = document.getElementById("history-date");
  const btnShow    = document.getElementById("btn-history-show");
  const btnBack    = document.getElementById("btn-history-back");

  // ====== ouvrir historique ======

  btnHistory?.addEventListener("click", () => {
    currentBox?.classList.add("hidden");
    historyBox?.classList.remove("hidden");

    document.body.classList.add("mode-history");
  });

  // ====== afficher date ======

  btnShow?.addEventListener("click", () => {
    if (!inputDate?.value) return;

    document.dispatchEvent(new CustomEvent("history:show", {
      detail: { date: inputDate.value }
    }));
  });

  // ====== retour live ======

  btnBack?.addEventListener("click", () => {
    historyBox?.classList.add("hidden");
    currentBox?.classList.remove("hidden");

    document.body.classList.remove("mode-history");

    document.dispatchEvent(new Event("history:back"));
  });
}