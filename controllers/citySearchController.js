// controllers/citySearchController.js
import { addCity } from "../state/cityState.js";
import { coreCities } from "../core/coreCities.js";
import { closeAddCityPopup } from "../ui/addCityUI.js";
import { showStatusToast } from "../ui/statusUI.js";

let debounceTimer = null;
let activeIndex = -1;
let lastSearchId = 0;
let isInit = false;

export function initCitySearchController() {
  if (isInit) return;
  isInit = true;

  console.log("🔎 CitySearchController ready");

  const input = document.getElementById("city-input");
  const list  = document.getElementById("autocomplete-list");
  const form  = input?.closest("form");

  if (!input || !list || !form) return;

  form.addEventListener("submit", e => e.preventDefault());

  /* =============================
     CLAVIER (local au champ)
  ============================== */
  input.addEventListener("keydown", e => {
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

    // loader immédiat
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

      if (id !== lastSearchId) return;

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
     country_code: li.dataset.countryCode || "", // ✅ récupère ici
     state: li.dataset.state || "",
     lat,
     lon,
     unit: "C"
    });


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

  const qLow = q.toLowerCase().trim();

  const normalize = s =>
    s.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const key = normalize(q);

  try {
    const calls = [];

    /* ===========================
       1) OPEN-METEO (TOP priorité)
    =========================== */
    const openMeteoUrl =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(q)}&count=10&language=fr&format=json`;

    calls.push(
      fetch(openMeteoUrl)
        .then(r => r.json())
        .then(j => {
          if (!j.results) return [];

          return j.results.map(item => ({
            lat: item.latitude,
            lon: item.longitude,
            importance: 1,
            address: {
              city: item.name,
              country: item.country,
              country_code: item.country_code?.toLowerCase() || "",
              state: item.admin1 || ""
            }
          }));
        })
    );

    /* ===========================
       2) NOMINATIM (fallback)
    =========================== */
    const baseUrl =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json&addressdetails=1&limit=30&q=${encodeURIComponent(q)}`;

    calls.push(
      fetch(baseUrl, {
        headers: { "Accept-Language": "fr" }
      }).then(r => r.json())
    );

    /* ===========================
       BOOST villes critiques
    =========================== */
    const forcedCities = {
      "london": "London,United Kingdom",
      "londres": "London,United Kingdom",
      "paris": "Paris,France",
      "new york": "New York,USA",
      "newyork": "New York,USA"
    };

    if (forcedCities[key]) {
      calls.unshift(
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(forcedCities[key])}`,
          { headers: { "Accept-Language": "fr" } }
        ).then(r => r.json())
      );
    }

    /* ===========================
       CORE CITIES
    =========================== */
    coreCities.forEach(city => {
      if (city.keys.some(k => qLow.includes(k))) {
        const forcedUrl =
          `https://nominatim.openstreetmap.org/search` +
          `?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(city.query)}`;

        calls.push(
          fetch(forcedUrl, {
            headers: { "Accept-Language": "fr" }
          }).then(r => r.json())
        );
      }
    });

    /* ===========================
       FETCH GLOBAL
    =========================== */
    const results = await Promise.all(calls);

    return results.flat();

  } catch (e) {
    console.error("searchCity error", e);
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

  const qNorm = q; // q est déjà normalize(query) dans ton code

  scored.sort((a, b) => {
    const aCity = normalize(a.city);
    const bCity = normalize(b.city);

    const aCountry = (a.c.address?.country_code || "").toLowerCase();
    const bCountry = (b.c.address?.country_code || "").toLowerCase();

    // ✅ BOOST Londres UK (marche pour "londres" car city = "London")
    const aIsLondonUK = (aCity === "london" && aCountry === "gb");
    const bIsLondonUK = (bCity === "london" && bCountry === "gb");
    if (aIsLondonUK && !bIsLondonUK) return -1;
    if (bIsLondonUK && !aIsLondonUK) return 1;

    // ✅ match exact sur la ville
    const aExact = aCity === qNorm;
    const bExact = bCity === qNorm;
    if (aExact && !bExact) return -1;
    if (bExact && !aExact) return 1;

    // ✅ pays prioritaires
    const priority = ["gb", "fr", "us", "de", "it", "es", "ca"];
    const aP = priority.includes(aCountry) ? 1 : 0;
    const bP = priority.includes(bCountry) ? 1 : 0;
    if (aP !== bP) return bP - aP;

    // fallback sur ton score
    return b.score - a.score;
  });

  scored
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
      li.dataset.countryCode = countryCode;
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

