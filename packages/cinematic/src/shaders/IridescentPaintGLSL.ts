/**
 * Thin-film iridescence: analytic Belcour-style phases + optional 1D LUT spectral
 * strip (`uIridescenceLUT`) mixed by `uIridescenceLUTBlend`.
 */
export const IRIDESCENT_PAINT_LAYER = /* glsl */ `
  vec3 iridView = normalize(-vViewPosition);
  vec3 iridN = normalize(normal);
  float cosTheta = clamp(dot(iridN, iridView), 0.0, 1.0);
  float d = 220.0 + 260.0 * uIridescenceAngle;
  float phaseR = 6.2831853 * d * cosTheta / 650.0 + uMouseInfluence.x * 1.1 + uMouseInfluence.y * 0.75;
  float phaseG = 6.2831853 * d * cosTheta / 550.0 + uMouseInfluence.x * 0.95;
  float phaseB = 6.2831853 * d * cosTheta / 450.0 + uMouseInfluence.y * 1.0;
  phaseR += uCinematicTime * 0.48;
  phaseG += uCinematicTime * 0.4;
  phaseB += uCinematicTime * 0.34;
  vec3 thinFilmAnalytic = vec3(
    0.5 + 0.5 * cos(phaseR),
    0.5 + 0.5 * cos(phaseG + 2.094395),
    0.5 + 0.5 * cos(phaseB + 4.18879)
  );
  float lutT = fract(phaseR * 0.1591549 + phaseG * 0.091 + phaseB * 0.073 + uMouseInfluence.x * 0.2);
  vec3 lutCol = texture2D(uIridescenceLUT, vec2(lutT, 0.5)).rgb;
  vec3 thinFilm = mix(thinFilmAnalytic, lutCol, clamp(uIridescenceLUTBlend, 0.0, 1.0));
  float iridFilm = pow(1.0 - cosTheta, 0.7);
  float thinFilmMix = clamp(uIridescenceStrength * iridFilm * 0.36, 0.0, 1.0);
  outgoingLight += diffuseColor.rgb * thinFilm * thinFilmMix;
`;
