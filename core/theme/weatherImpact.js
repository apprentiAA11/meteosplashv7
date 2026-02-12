export function computeWeatherDimFactor(weatherCode) {
  let dim = 1;

  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) dim = 0.92;
  if ([71, 73, 75].includes(weatherCode)) dim = 1.05;
  if ([95, 96, 99].includes(weatherCode)) dim = 0.85;

  return {
    dim
  };
}
