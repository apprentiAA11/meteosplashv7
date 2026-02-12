// ui/weather/tipUI.js
// Affiche le conseil météo du jour (basé sur weatherState)

export function updateTip(weather) {
  const detailsTip = document.getElementById("details-tip");
  if (!detailsTip) return;

  if (!weather?.city || !weather?.raw?.current) {
    detailsTip.textContent = "Ajoute une ville ou active la géolocalisation.";
    return;
  }

  const c = weather.raw.current;
  let tip = "";

  if (c.temperature_2m <= 0) {
    tip = "Pense à bien te couvrir, il gèle aujourd’hui.";
  } else if ((c.rain ?? 0) > 0 || (c.precipitation ?? 0) > 0) {
    tip = "Prends un parapluie avant de sortir.";
  } else if ((c.wind_speed_10m ?? 0) >= 40) {
    tip = "Le vent souffle fort, garde un œil sur ton parapluie.";
  } else if (c.temperature_2m >= 28) {
    tip = "Bois beaucoup d’eau, il fait très chaud aujourd’hui.";
  } else {
    tip = "Journée plutôt calme côté météo.";
  }

  detailsTip.textContent = tip;
}
