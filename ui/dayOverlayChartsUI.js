// ui/dayOverlayChartsUI.js
// UI pure – graphiques overlay jour

let currentData = null;
let currentMode = "temp";

export function initDayOverlayChartsUI() {
  console.log("📈 DayOverlayChartsUI ready");

  document.addEventListener("dayoverlay:data", e => {
    currentData = e.detail;
    render();
  });

  bindTabs();
}

function bindTabs() {
  document.querySelectorAll("[data-daytab]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-daytab]").forEach(b =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      currentMode = btn.dataset.daytab;
      render();
    });
  });
}

function render() {
  if (!currentData) return;

  const canvas = document.getElementById("day-overlay-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas);

  let values = [];
  let label = "";

  if (currentMode === "temp") {
    values = currentData.temps;
    label = "Température (°C)";
  }
  if (currentMode === "rain") {
    values = currentData.rains;
    label = "Pluie (mm)";
  }
  if (currentMode === "wind") {
    values = currentData.winds;
    label = "Vent (km/h)";
  }
  if (currentMode === "hum") {
    values = currentData.humidities;
    label = "Humidité (%)";
  }

  drawChart(ctx, canvas, currentData.hours, values, label);
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
}

function drawChart(ctx, canvas, labels, values, label) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const pad = 50;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // axes
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();

  // titre
  ctx.fillStyle = "#fff";
  ctx.font = `${14 * devicePixelRatio}px system-ui`;
  ctx.fillText(label, pad, pad - 15);

  // courbe
  ctx.strokeStyle = "#ff8c42";
  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
