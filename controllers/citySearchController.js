import { addCity } from "../state/cityState.js";
import { coreCities } from "../core/coreCities.js";
import { closeAddCityPopup } from "../ui/addCityUI.js";
import { showStatusToast } from "../ui/statusUI.js";

let debounceTimer = null;
let activeIndex = -1;
let lastSearchId = 0;

export function initCitySearchController() {
  console.log("🔎 CitySearchController ready");

  const input = document.getElementById("city-input");
  const list  = document.getElementById("autocomplete-list");
  const form  = input?.closest("form");

  if (!input || !list || !form) return;

  form.addEventListener("submit", e => e.preventDefault());

  /* =============================
     CLAVIER
  ============================== */

  document.addEventListener("keydown", e => {
    if (document.activeElement !== input) return;

    const items = list.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveItem(items);
    }

    else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    }

    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      }
    }

    else if (e.key === "Escape") {
      hideList(list);
      activeIndex = -1;
    }
  });

/* =============================
   INPUT
============================== */

input.addEventListener("input", () => {
  const q = input.value.trim();

  if (debounceTimer) clearTimeout(debounceTimer);

  if (q.length < 2) {
    hideList(list);
    activeIndex = -1;
    return;
  }

  // apparition immédiate
  showList(list, `
    <li class="search-loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      Recherche
    </li>
  `);

  debounceTimer = setTimeout(async () => {
    const id = ++lastSearchId;

    const results = await searchCity(q);

    if (id !== lastSearchId) return; // ⛔ réponse obsolète

    renderList(results, list, q);
  }, 350);
});

  /* =============================
     CLICK RESULT
  ============================== */

list.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (!li) return;

  const lat = parseFloat(li.dataset.lat);
  const lon = parseFloat(li.dataset.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

  const added = addCity({
    name: li.dataset.name,
    country: li.dataset.country || "",
    state: li.dataset.state || "",
    lat,
    lon
  });

  // ✅ toast uniquement si vraie nouvelle ville
  if (added) {
    showStatusToast(`📍 ${li.dataset.name}`, 2000, "success");
  }

  hideList(list);
  input.value = "";
  activeIndex = -1;
  closeAddCityPopup();
});
}

/* =============================
   HELPERS UI
============================= */

function showList(list, html = "") {
  list.innerHTML = html;
  list.style.display = "block";
  requestAnimationFrame(() => list.classList.add("show"));
}

function hideList(list) {
  list.classList.remove("show");
  setTimeout(() => {
    list.innerHTML = "";
    list.style.display = "none";
  }, 120);
}

/* =====================================================
   API
===================================================== */

async function searchCity(q) {
  const baseUrl =
    `https://nominatim.openstreetmap.org/search` +
    `?format=json&addressdetails=1&limit=30&q=${encodeURIComponent(q)}`;

  const qLow = q.toLowerCase().trim();

  try {
    const calls = [
      fetch(baseUrl, { headers: { "Accept-Language": "fr" } })
    ];

    coreCities.forEach(city => {
      if (city.keys.some(k => qLow.startsWith(k))) {
        const forcedUrl =
          `https://nominatim.openstreetmap.org/search` +
          `?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(city.query)}`;
        calls.push(fetch(forcedUrl, { headers: { "Accept-Language": "fr" } }));
      }
    });

    const responses = await Promise.all(calls);
    const data = await Promise.all(responses.map(r => r.json()));
    return data.flat();

  } catch {
    return [];
  }
}

/* =====================================================
   RENDER
===================================================== */

function renderList(results, list, query) {
  list.innerHTML = "";
  list.style.display = "block";
  list.classList.remove("show");
  activeIndex = -1;

  const seen = new Set();

  const normalize = s =>
  s?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim() || "";

  const q = normalize(query);
  if (!q) return;

  const scored = results.map(c => {

    const city =
      c.address?.city ||
      c.address?.town ||
      c.address?.village ||
      c.address?.municipality ||
      c.address?.hamlet;

    if (!city) return null;

    let score = 0;
    const cityNorm = normalize(city);
    if (cityNorm.startsWith(q)) score += 100;
    if (cityNorm === q) score += 200;
    if (c.importance) score += Number(c.importance) * 30;

    if (score < 60) return null;

    return { c, city, score };
  }).filter(Boolean);

  scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .forEach((r, index) => {

      const c = r.c;
      const city =
        c.address?.city ||
        c.address?.town ||
        c.address?.village ||
        c.address?.municipality ||
        c.address?.hamlet;

      const country = c.address?.country || "";
      const countryCode =
        c.address?.country_code ||
        c.address?.["ISO3166-1:alpha2"] ||
        "";

      const state = c.address?.state || "";

      const lat = Number(c.lat).toFixed(2);
      const lon = Number(c.lon).toFixed(2);

     const key = normalize(city) + "|" + country.toLowerCase();

      if (seen.has(key)) return;
      seen.add(key);

      const li = document.createElement("li");
      li.style.animationDelay = `${index * 35}ms`;

      li.innerHTML = `
        <span class="city-flag">${countryCodeToFlag(countryCode)}</span>
        <div class="city-main">
          <div class="city-name">${city}</div>
          <div class="city-sub">${state ? state + " · " : ""}${country}</div>
        </div>
        <span class="city-meta">${lat}, ${lon}</span>
      `;

      li.dataset.name = city;
      li.dataset.country = country;
      li.dataset.state = state;
      li.dataset.lat = Number(c.lat);
      li.dataset.lon = Number(c.lon);


      list.appendChild(li);
    });

  if (list.children.length) {
    requestAnimationFrame(() => list.classList.add("show"));
    const items = list.querySelectorAll("li");
    activeIndex = 0;
    updateActiveItem(items);
  } else {
    hideList(list);
  }
}

/* =====================================================
   HELPERS
===================================================== */

function updateActiveItem(items) {
  items.forEach(li => li.classList.remove("active"));
  if (activeIndex >= 0 && items[activeIndex]) {
    items[activeIndex].classList.add("active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  }
}

function countryToFlag(countryName) {
  if (!countryName) return "🌍";
  const n = countryName.toLowerCase();
  if (n.includes("france")) return "🇫🇷";
  if (n.includes("united states") || n.includes("etats")) return "🇺🇸";
  if (n.includes("ital")) return "🇮🇹";
  if (n.includes("spain") || n.includes("espagne")) return "🇪🇸";
  if (n.includes("germany") || n.includes("allemagne")) return "🇩🇪";
  if (n.includes("canada")) return "🇨🇦";
  return "🌍";
}
function highlight(text, query) {
  if (!query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${safe})`, "ig"),
    "<mark>$1</mark>"
  );
}
function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "🌍";
  return code
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}


