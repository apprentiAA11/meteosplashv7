export function initDetailsGridDrag() {
  const container = document.getElementById("details-current");
  if (!container) return;

  let dragged = null;

  container.addEventListener("dragstart", e => {
    const block = e.target.closest(".detail-block");
    if (!block) return;

    dragged = block;
    block.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  container.addEventListener("dragend", () => {
    if (dragged) dragged.classList.remove("dragging");
    dragged = null;
    saveLayout(container);
  });

  container.addEventListener("dragover", e => {
    e.preventDefault();
    const target = e.target.closest(".detail-block");
    if (!dragged || !target || target === dragged) return;

    const rect = target.getBoundingClientRect();
    const after = (e.clientY - rect.top) > rect.height / 2;

    target.classList.add("drag-over");

    if (after) {
      target.after(dragged);
    } else {
      target.before(dragged);
    }
  });

  container.addEventListener("dragleave", e => {
    const block = e.target.closest(".detail-block");
    block?.classList.remove("drag-over");
  });

  container.addEventListener("drop", () => {
    [...container.children].forEach(b => b.classList.remove("drag-over"));
  });

  restoreLayout(container);
}

/* ===============================
   💾 Sauvegarde ordre
================================ */

function saveLayout(container) {
  const order = [...container.children].map(b => b.dataset.id);
  localStorage.setItem("details-layout", JSON.stringify(order));
}

/* ===============================
   ♻️ Restauration ordre
================================ */

function restoreLayout(container) {
  const raw = localStorage.getItem("details-layout");
  if (!raw) return;

  try {
    const order = JSON.parse(raw);
    const map = {};

    [...container.children].forEach(b => {
      map[b.dataset.id] = b;
    });

    order.forEach(id => {
      if (map[id]) container.appendChild(map[id]);
    });

  } catch {}
}