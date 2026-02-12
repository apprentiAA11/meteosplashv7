// render/skyRenderer.js
export function applySky(theme) {
  const r = document.documentElement;
  Object.entries(theme.cssVars).forEach(([k,v]) => {
    r.style.setProperty(k, v);
  });

  document.body.dataset.phase = theme.phase;
}
