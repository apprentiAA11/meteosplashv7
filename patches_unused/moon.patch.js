/* ============================
   LUNE — MODE METEOGRAM SIMPLE
   Règle:
   - Si coucher existe le jour J -> afficher
   - Si lever existe le jour J -> afficher
   - Ordre = chronologique
   ============================ */
(function(){
  if (window.__moonSimpleRuleApplied) return;
  window.__moonSimpleRuleApplied = true;

  if (typeof renderMoon !== "function") return;
  const _renderMoon = renderMoon;

  window.renderMoon = function(ci){
    _renderMoon(ci);

    try {
      const riseEl = document.getElementById("moon-rise");
      const setEl  = document.getElementById("moon-set");
      if (!riseEl || !setEl) return;

      // Retrieve the currently selected lunar date from subtitle
      // Fallback: today UTC
      let baseDate = new Date();
      const subtitle = document.querySelector(".moon-subtitle");
      if (subtitle) {
        const m = subtitle.textContent.match(/(\d{1,2})\s(\w+)\./);
        if (m && window.lastMoonDate instanceof Date) {
          baseDate = window.lastMoonDate;
        }
      }

      const t = getMoonTimes(baseDate, ci.lat, ci.lon);
      const events = [];

      if (t.set)  events.push({ type: "Coucher", date: new Date(t.set) });
      if (t.rise) events.push({ type: "Lever",   date: new Date(t.rise) });

      events.sort((a,b)=>a.date-b.date);

      // reset
      riseEl.textContent = "—";
      setEl.textContent  = "—";

      events.forEach(ev=>{
        if (ev.type === "Lever") {
          riseEl.textContent = formatTimeForCity(ev.date, ci);
        } else {
          setEl.textContent  = formatTimeForCity(ev.date, ci);
        }
      });

    } catch(e){
      // never break app
    }
  };
})();
