import { moveCity } from "../state/cityState.js";

export function initCityDragUI() {
  let draggedCityIndex = null;

  document.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".city-item");
    if (!item) return;

    draggedCityIndex = Number(item.dataset.index);
    item.classList.add("dragging");
  });

  document.addEventListener("dragend", (e) => {
    const item = e.target.closest(".city-item");
    if (item) item.classList.remove("dragging");
  });

  document.addEventListener("dragover", (e) => {
    const item = e.target.closest(".city-item");
    if (!item) return;
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    const item = e.target.closest(".city-item");
    if (!item || draggedCityIndex === null) return;

    const targetIndex = Number(item.dataset.index);
    if (targetIndex === draggedCityIndex) return;

    moveCity(draggedCityIndex, targetIndex);
    draggedCityIndex = null;
  });
}
