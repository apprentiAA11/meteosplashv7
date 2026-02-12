// ui/tooltipUI.js

let tooltip = null;

export function initTooltipUI() {
  tooltip = document.getElementById("tooltip");

  if (!tooltip) {
    console.warn("TooltipUI: #tooltip not found");
    return;
  }

  console.log("💬 TooltipUI ready");

  document.addEventListener("mouseover", onHover, true);
  document.addEventListener("mouseout", onOut, true);
  document.addEventListener("mousemove", onMove, true);
}

function onHover(e) {
  const el = e.target.closest("[data-tooltip]");
  if (!el || !tooltip) return;

  const text = el.dataset.tooltip;
  if (!text) return;

  tooltip.textContent = text;
  tooltip.classList.add("active");
}

function onOut(e) {
  if (!tooltip) return;
  if (!e.target.closest("[data-tooltip]")) {
    tooltip.classList.remove("active");
  }
}

function onMove(e) {
  if (!tooltip || !tooltip.classList.contains("active")) return;

  const offset = 14;
  tooltip.style.left = e.clientX + offset + "px";
  tooltip.style.top = e.clientY + offset + "px";
}
