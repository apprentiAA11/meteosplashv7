// controllers/geolocationController.js
import { selectCity } from "./cityController.js";

/* =====================================================
   API PUBLIQUE
===================================================== */

export async function geolocateUser() {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation not supported");
  }

  const pos = await getBrowserPosition(8000);
  return reverseGeocode(pos.latitude, pos.longitude);
}

/* =====================================================
   GPS
===================================================== */

function getBrowserPosition(timeout = 8000) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude
      }),
      err => reject(err),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

/* =====================================================
   REVERSE GEOCODING – OPENSTREETMAP
===================================================== */

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const r = await fetch(url, {
      headers: { "Accept-Language": "fr" }
    });
    const j = await r.json();

    if (!j?.address) throw new Error("No city found");

const city = {
  name: j.address.city || j.address.town || j.address.village || j.display_name,
  country: j.address.country || "",
  lat: Number(lat),
  lon: Number(lon),
  isUserLocation: true // ⭐ flag "Ma position"
};

selectCity(city);
return city;


  } catch (e) {
    console.error("📍 Reverse geocoding error", e);
    throw e;
  }
}
