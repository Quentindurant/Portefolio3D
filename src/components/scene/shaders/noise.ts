/**
 * Bruit de valeur 3D et fbm, en GLSL.
 * Partagé par la brume, les rayons de lune et le relief du sol : une seule
 * implémentation, donc une ambiance cohérente sur toute la scène.
 */
export const NOISE_GLSL = /* glsl */ `
float hashNoise(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float valueNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hashNoise(i + vec3(0.0, 0.0, 0.0)), hashNoise(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hashNoise(i + vec3(0.0, 1.0, 0.0)), hashNoise(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hashNoise(i + vec3(0.0, 0.0, 1.0)), hashNoise(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hashNoise(i + vec3(0.0, 1.0, 1.0)), hashNoise(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

float fbm(vec3 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    total += amplitude * valueNoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return total;
}
`;
