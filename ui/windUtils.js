// UI/windUtils.js
export function windDegToCssAngle(dir) {
  return (dir + 180) % 360;
}
