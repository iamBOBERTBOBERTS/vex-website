/**
 * Procedural 3D fbm + high-exponent glints (pearl / diamond sparkle) — reacts to
 * view, light direction, cinematic time, and mouse-influence UV shift.
 */
export const METALLIC_FLAKE_NOISE_HELPERS = /* glsl */ `
float vex_hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vex_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = vex_hash(i);
  float b = vex_hash(i + vec2(1.0, 0.0));
  float c = vex_hash(i + vec2(0.0, 1.0));
  float d = vex_hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float vex_fbm(vec2 p) {
  return vex_noise(p) * 0.55 + vex_noise(p * 2.18) * 0.32 + vex_noise(p * 4.37) * 0.13;
}
float vex_hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float vex_noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = vex_hash3(i);
  float n100 = vex_hash3(i + vec3(1.0, 0.0, 0.0));
  float n010 = vex_hash3(i + vec3(0.0, 1.0, 0.0));
  float n110 = vex_hash3(i + vec3(1.0, 1.0, 0.0));
  float n001 = vex_hash3(i + vec3(0.0, 0.0, 1.0));
  float n101 = vex_hash3(i + vec3(1.0, 0.0, 1.0));
  float n011 = vex_hash3(i + vec3(0.0, 1.0, 1.0));
  float n111 = vex_hash3(i + vec3(1.0, 1.0, 1.0));
  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);
  return mix(nxy0, nxy1, f.z);
}
float vex_fbm3(vec3 p) {
  return vex_noise3(p) * 0.52
    + vex_noise3(p * 2.17 + vec3(1.7, 0.3, 2.1)) * 0.28
    + vex_noise3(p * 5.03 + vec3(4.2, 1.1, 0.8)) * 0.14
    + vex_noise3(p * 9.1 + vec3(2.1, 3.0, 1.4)) * 0.06;
}
`;

export const METALLIC_FLAKE_LAYER = /* glsl */ `
  vec3 flakeN = normalize(normal);
  vec3 viewDirFlake = normalize(-vViewPosition);
  vec3 flakePos = vec3(vUv * 72.0, dot(flakeN, vec3(0.0, 1.0, 0.0))) * (0.5 + uFlakeDensity * 0.65);
  flakePos += vec3(uMouseInfluence * vec2(9.0, 7.0), uCinematicTime * 0.055);
  vec3 scroll3 = vec3(uCinematicTime * 0.12, uCinematicTime * 0.08, uCinematicTime * 0.045);
  float f3 = vex_fbm3(flakePos + scroll3);
  vec2 fuv2 = vUv * vec2(64.0, 64.0) * (0.5 + uFlakeDensity);
  vec2 scroll2 = vec2(uCinematicTime * 0.11, uCinematicTime * 0.07) + uMouseInfluence * vec2(6.0, 5.0);
  float f2 = vex_fbm(fuv2 + scroll2);
  float f = mix(f2, f3, 0.62);
  vec3 flakeLight = normalize(vec3(0.35, 0.88, 0.42));
  float flakeNdotL = max(dot(flakeN, flakeLight), 0.0);
  vec3 halfFlake = normalize(flakeLight + viewDirFlake);
  float flakeNdotH = max(dot(flakeN, halfFlake), 0.0);
  float sparkle = pow(clamp(f, 0.0, 1.0), 24.0) * uFlakeDensity;
  float glint = pow(flakeNdotH, 112.0) * (0.45 + 0.55 * f3) * uFlakeDensity;
  outgoingLight += vec3(sparkle * (0.32 + 0.68 * flakeNdotL));
  outgoingLight += vec3(glint * 0.85);
`;
