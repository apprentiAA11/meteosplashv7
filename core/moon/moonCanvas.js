// core/moon/moonCanvas.js
// 🌙 Rendu Canvas — % cohérent (éclairage par pixel, style iOS)

let _texImg = null;
let _texReady = false;

export function preloadMoonTexture(src = "assets/moon/moon_texture.jpg") {
  if (_texReady || _texImg) return;

  _texImg = new Image();
  _texImg.crossOrigin = "anonymous";
  _texImg.onload = () => {
    _texReady = true;
    document.dispatchEvent(new Event("moon:texture-ready"));
  };
  _texImg.onerror = () => { _texReady = false; };
  _texImg.src = src;
}

export function prepareCanvas(canvas) {
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // fallback si rect=0 (canvas dans overlay caché / grid)
  const fallbackW = Number(canvas.getAttribute("width"))  || canvas.width  || 22;
  const fallbackH = Number(canvas.getAttribute("height")) || canvas.height || 22;

  const cssW = Math.max(1, rect.width  || fallbackW);
  const cssH = Math.max(1, rect.height || fallbackH);

  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // dessin en unités CSS
}

// fraction: 0..1 (surface éclairée)
// waxing: true => lumière à droite (croissante), false => lumière à gauche (décroissante)
export function drawMoon(canvas, fraction, waxing, opts = {}) {
  if (!canvas) return;
  if (!canvas.width || !canvas.height) prepareCanvas(canvas);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);


  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.46;

  let f = clamp01(fraction);
  if (f > 0.995) f = 1;
  if (f < 0.005) f = 0;

  ctx.clearRect(0, 0, w, h);

  // --- 1) disque + texture (plein, on assombrit ensuite les pixels non éclairés)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // base claire (au cas où la texture n’est pas prête)
  ctx.fillStyle = "#f3f5fa";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  if (_texReady && _texImg) {
    const scale = Math.max((r * 2) / _texImg.width, (r * 2) / _texImg.height);
    const iw = _texImg.width * scale;
    const ih = _texImg.height * scale;
    ctx.drawImage(_texImg, cx - iw / 2, cy - ih / 2, iw, ih);
  } else {
    // petite texture fallback
    const g = ctx.createRadialGradient(
      cx - r * 0.25, cy - r * 0.25, r * 0.2,
      cx, cy, r
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#e3e8f6");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // boost (évite rendu “brun”)
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // pleine lune => fini
  if (f === 1) return;

  // --- 2) ombre par pixel (aire éclairée cohérente avec f)
  // relation : f = (1 + cos(inc)) / 2  => cos(inc) = 2f - 1
  const cosInc = 2 * f - 1;                 // [-1..1]
  const sinInc = Math.sqrt(Math.max(0, 1 - cosInc * cosInc));
  const dir = waxing ? 1 : -1;

  // direction du Soleil dans le repère caméra (x,z)
  const sx = dir * sinInc;
  const sz = cosInc;

  const dark = Number.isFinite(opts.dark) ? opts.dark : 0.92; // 0..1
  const img = ctx.getImageData(0, 0, Math.ceil(w), Math.ceil(h));
  const data = img.data;

  for (let py = 0; py < img.height; py++) {
    const y = (py + 0.5 - cy) / r; // -1..1
    const y2 = y * y;
    for (let px = 0; px < img.width; px++) {
      const x = (px + 0.5 - cx) / r; // -1..1
      const rr = x * x + y2;
      if (rr > 1) continue; // hors disque

      const z = Math.sqrt(Math.max(0, 1 - rr)); // sphère
      const dot = x * sx + z * sz;              // n·s

      if (dot <= 0) {
        // assombrir le pixel non éclairé
        const i = (py * img.width + px) * 4;
        data[i]     = Math.round(data[i]     * (1 - dark));
        data[i + 1] = Math.round(data[i + 1] * (1 - dark));
        data[i + 2] = Math.round(data[i + 2] * (1 - dark));
      }
    }
  }

  ctx.putImageData(img, 0, 0);

}

function clamp01(x) {
  x = Number(x);
  if (!isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
