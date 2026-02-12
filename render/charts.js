// render/charts.js — MeteoSplash PRO SAFE

export function drawSimpleLineChart(canvas, labels, values, unit) {
  if (!canvas || !canvas.getContext || !labels.length || !values.length) {
    const ctx = canvas && canvas.getContext && canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  /* =========================
     HI-DPI SETUP
  ========================= */

  const dpr = window.devicePixelRatio || 1;
  let rect = canvas.getBoundingClientRect();
  let cssWidth = rect.width || 800;
  let cssHeight = rect.height || 220;

  canvas.width  = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const width  = cssWidth;
  const height = cssHeight;

  /* =========================
     COLORS
  ========================= */

  let lineColor = "#ed242a";        // temp
  if (unit === "mm")   lineColor = "#4a90e2";
  if (unit === "km/h") lineColor = "#34c759";
  if (unit === "%")    lineColor = "#af52de";

  const axisColor = "rgba(240,240,255,0.9)";
  const gridColor = "rgba(240,240,255,0.25)";
  const textColor = "rgba(240,240,255,0.95)";

  /* =========================
     LAYOUT
  ========================= */

  const paddingLeft = 44;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 30;

  const plotWidth  = width  - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop  - paddingBottom;

  /* =========================
     CLEAN VALUES
  ========================= */

  let cleanValues = values.map(v => Number(v) || 0);

  if (unit === "%") cleanValues = cleanValues.map(v => Math.min(100, Math.max(0, v)));
  if (unit === "mm" || unit === "km/h") cleanValues = cleanValues.map(v => Math.max(0, v));

  let minVal = Math.min(...cleanValues);
  let maxVal = Math.max(...cleanValues);

  if (unit === "%") {
    minVal = 0;
    maxVal = 100;
  } else if (minVal === maxVal) {
    minVal -= 1;
    maxVal += 1;
  }

  const range = maxVal - minVal || 1;

  function xForIndex(i) {
    return paddingLeft + (plotWidth * i) / (labels.length - 1);
  }

  function yForValue(v) {
    const ratio = (v - minVal) / range;
    return paddingTop + plotHeight * (1 - ratio);
  }

  const points = cleanValues.map((v, i) => ({
    x: xForIndex(i),
    y: yForValue(v)
  }));

  /* =========================
     GRID (ADAPTATIVE)
  ========================= */

  let gridLines = 3;

  if (unit === "mm") {
    if (maxVal <= 1.2) gridLines = 1;      // 0 → 1 mm
    else if (maxVal <= 5) gridLines = 2;   // 0 → 5 mm
    else gridLines = 3;
  }

  if (unit === "%") {
    gridLines = 2; // 0 / 50 / 100
  }

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridLines; i++) {
    const y = Math.round(paddingTop + (plotHeight * i) / gridLines) + 0.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(paddingLeft + plotWidth, y);
    ctx.stroke();
  }

  /* =========================
     AXES
  ========================= */

  ctx.strokeStyle = axisColor;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, paddingTop + plotHeight);
  ctx.lineTo(paddingLeft + plotWidth, paddingTop + plotHeight);
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = "11px system-ui";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= gridLines; i++) {
    const val = maxVal - (range * i) / gridLines;
    const y = yForValue(val);

    let label = val;
    if (unit === "%") label = Math.round(label);
    else if (unit === "mm") label = label < 1 ? label.toFixed(1) : Math.round(label * 10) / 10;
    else label = Math.round(label);

    ctx.fillText(label + unit, paddingLeft - 6, y);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  let stepX = labels.length > 8 ? Math.ceil(labels.length / 8) : 1;
  for (let i = 0; i < labels.length; i += stepX) {
    ctx.fillText(labels[i], xForIndex(i), paddingTop + plotHeight + 4);
  }

  /* =========================
     CURVE
  ========================= */

  ctx.lineWidth = 2.4;
  ctx.strokeStyle = lineColor;
  ctx.shadowColor = lineColor + "66";
  ctx.shadowBlur = 10;

  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();

  ctx.shadowBlur = 0;
}
