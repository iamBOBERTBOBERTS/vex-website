/**
 * Brushed / stretched specular for chrome & wheels — tangent-frame style without
 * requiring mesh tangents (cross-product basis); scaled by uAnisotropyStrength.
 */
export const ANISOTROPIC_CHROME_LAYER = /* glsl */ `
  vec3 viewDirA = normalize(-vViewPosition);
  vec3 nA = normalize(normal);
  vec3 upA = vec3(0.0, 1.0, 0.0);
  vec3 tA = normalize(cross(nA, upA));
  if (length(tA) < 0.01) tA = normalize(cross(nA, vec3(1.0, 0.0, 0.0)));
  vec3 bA = normalize(cross(nA, tA));
  float along = abs(dot(tA, viewDirA));
  float across = abs(dot(bA, viewDirA));
  float stretch = mix(0.24, 1.0, pow(along, 1.85));
  float rim = mix(0.32, 1.0, pow(across, 0.88));
  float nvA = max(dot(nA, viewDirA), 0.0);
  float fresA = pow(1.0 - nvA, 0.42);
  float ani = uAnisotropicChrome * uAnisotropyStrength;
  outgoingLight += vec3(0.16 * fresA * stretch * rim * ani);
  outgoingLight += vec3(0.045 * sin(uCinematicTime * 0.4 + along * 14.0) * ani);
`;
