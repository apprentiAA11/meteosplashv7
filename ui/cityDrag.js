// ui/cityDrag.js

import { getCities, setCities } from "../state/cityState.js";

let isInitialized = false;

export function initCityDrag() {
  const container = document.getElementById("city-list");
  if (!container || isInitialized) return;

  isInitialized = true;

  let draggedEl = null;

  container.addEventListener("dragstart", e => {
    const item = e.target.closest(".city-item");
    if (!item) return;

    draggedEl = item;
    item.classList.add("dragging");

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ""); // nécessaire pour Firefox
  });

  container.addEventListener("dragend", () => {
    if (!draggedEl) return;

    draggedEl.classList.remove("dragging");
    updateOrder(container);
    draggedEl = null;
  });

  container.addEventListener("dragover", e => {
    e.preventDefault();

    const afterElement = getDragAfterElement(container, e.clientY);
    const dragging = container.querySelector(".dragging");
    if (!dragging) return;

    if (!afterElement) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

/* ===============================
   UPDATE STATE
================================ */

function updateOrder(container) {
  const items = [...container.querySelectorAll(".city-item")];
  const currentCities = getCities();

  const newOrder = items
    .map(el => {
      const name = el.querySelector("strong")?.textContent?.trim();
      return currentCities.find(c => c.name === name);
    })
    .filter(Boolean);

  setCities(newOrder);
}

/* ===============================
   POSITION CALC
================================ */

function getDragAfterElement(container, y) {
  const elements = [
    ...container.querySelectorAll(".city-item:not(.dragging)")
  ];

  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
