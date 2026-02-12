// state/store.js
// Store global ultra simple (source unique de vérité)

const store = {
  city: null,
  weather: null,
  time: null,
  sun: null,
  moon: null,
  radar: null,
  theme: null
};

const listeners = {};
const globalListeners = new Set();

/* =====================================================
   API EXISTANTE (par clé)
===================================================== */

export function setState(key, value) {
  if (!(key in store)) {
    console.warn("Store: clé inconnue", key);
    return;
  }
  store[key] = value;
  notify(key);
  notifyGlobal(key, value);
}

export function getState(key) {
  return store[key];
}

export function subscribe(key, cb) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(cb);

  // retour optionnel pour unsubscribe
  return () => {
    listeners[key] = listeners[key].filter(fn => fn !== cb);
  };
}

function notify(key) {
  if (!listeners[key]) return;
  listeners[key].forEach(cb => cb(store[key]));
}

/* =====================================================
   ✅ NOUVELLE API — globale (onStateChange)
===================================================== */

export function onStateChange(cb) {
  globalListeners.add(cb);

  // retour optionnel pour unsubscribe
  return () => {
    globalListeners.delete(cb);
  };
}

function notifyGlobal(key, value) {
  globalListeners.forEach(cb => {
    try {
      cb({ key, value, state: store });
    } catch (e) {
      console.error("Store global listener error:", e);
    }
  });
}

/* =====================================================
   DEBUG (optionnel)
===================================================== */

// window.__store = store;
