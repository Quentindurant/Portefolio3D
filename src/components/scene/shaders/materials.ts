import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  type IUniform,
} from 'three';
import { NOISE_GLSL } from './noise';
import { PALETTE } from '@/lib/theme';

/**
 * Matériaux de la forêt.
 *
 * Tout est procédural : aucun fichier de texture n'est chargé, donc rien à
 * télécharger au build ni à l'exécution. Les uniformes `uTime` sont poussés
 * par la boucle de rendu.
 */

export interface TimedMaterial extends ShaderMaterial {
  uniforms: { uTime: IUniform<number> };
}

export interface RuneMaterial extends ShaderMaterial {
  uniforms: {
    uTime: IUniform<number>;
    uPower: IUniform<number>;
    uSeed: IUniform<number>;
    uTint: IUniform<Color>;
  };
}

/** Ciel dégradé, nuit profonde vers brume de canopée, avec un grain d'étoiles. */
export function createSkyMaterial(): TimedMaterial {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uHigh: { value: new Color('#02050a') },
      uLow: { value: new Color(PALETTE.fog) },
      uGlow: { value: new Color(PALETTE.jade) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform vec3 uHigh;
      uniform vec3 uLow;
      uniform vec3 uGlow;
      varying vec3 vWorld;

      void main() {
        vec3 direction = normalize(vWorld);
        float height = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);

        vec3 color = mix(uLow, uHigh, pow(height, 0.7));

        // Halo de lune derrière la canopée.
        float moon = pow(max(0.0, dot(direction, normalize(vec3(0.25, 0.55, -1.0)))), 18.0);
        color += uGlow * moon * 0.35;

        // Poussière d'étoiles, uniquement dans la moitié haute.
        float stars = step(0.985, valueNoise(direction * 220.0));
        color += vec3(stars) * smoothstep(0.55, 0.9, height) * 0.5;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }) as TimedMaterial;
}

/** Nappes de brume animées, additives, qui donnent la profondeur atmosphérique. */
export function createMistMaterial(tint: string = PALETTE.jade): TimedMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new Color(tint) },
      uOpacity: { value: 0.07 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uTint;
      varying vec2 vUv;

      void main() {
        vec2 centered = vUv - 0.5;
        float falloff = smoothstep(0.5, 0.05, length(centered));

        float clouds = fbm(vec3(vUv * 3.5, uTime * 0.05));
        clouds += 0.4 * fbm(vec3(vUv * 8.0 - uTime * 0.02, uTime * 0.08));

        float alpha = falloff * smoothstep(0.35, 0.95, clouds) * uOpacity;
        gl_FragColor = vec4(uTint * clouds, alpha);
      }
    `,
  }) as TimedMaterial;
}

/** Rayon de lune volumétrique : un cône additif qui scintille lentement. */
export function createShaftMaterial(tint: string = PALETTE.jade): TimedMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new Color(tint) },
      uIntensity: { value: 0.11 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uTint;
      varying vec2 vUv;

      void main() {
        // vUv.y = 0 en bas du cône, 1 au sommet : le faisceau s'éteint en bas.
        float vertical = smoothstep(0.0, 0.85, vUv.y);
        float edges = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
        float flicker = 0.75 + 0.25 * fbm(vec3(vUv * 4.0, uTime * 0.15));

        float alpha = vertical * edges * flicker * uIntensity;
        gl_FragColor = vec4(uTint, alpha);
      }
    `,
  }) as TimedMaterial;
}

/** Face gravée d'un monolithe : runes procédurales qui respirent. */
export function createRuneMaterial(tint: string = PALETTE.jade): RuneMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new Color(tint) },
      uPower: { value: 0.4 },
      uSeed: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform float uPower;
      uniform float uSeed;
      uniform vec3 uTint;
      varying vec2 vUv;

      void main() {
        vec2 grid = vec2(vUv.x * 4.0, vUv.y * 12.0);
        vec2 cell = floor(grid);
        vec2 local = fract(grid) - 0.5;

        float seed = hashNoise(vec3(cell + uSeed, 1.0));
        // Trait horizontal ou vertical selon la cellule : alphabet runique simple.
        float mark = seed > 0.5
          ? step(abs(local.x), 0.06) * step(abs(local.y), 0.34)
          : step(abs(local.y), 0.06) * step(abs(local.x), 0.34);
        mark *= step(0.35, seed);

        float pulse = 0.65 + 0.35 * sin(uTime * 1.6 + cell.y * 0.7 + uSeed);
        float border = smoothstep(0.5, 0.42, abs(vUv.x - 0.5)) * smoothstep(0.5, 0.46, abs(vUv.y - 0.5));

        float alpha = mark * pulse * uPower * border;
        gl_FragColor = vec4(uTint * (1.0 + pulse), alpha);
      }
    `,
  }) as RuneMaterial;
}

/**
 * Sol de la forêt.
 * On part d'un MeshStandardMaterial pour garder l'éclairage et le brouillard
 * de three, et on injecte un déplacement fbm dans son shader de sommets.
 */
export function createTerrainMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(PALETTE.bark),
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

  material.userData.uniforms = { uTime: { value: 0 } };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = material.userData.uniforms.uTime;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         varying float vElevation;
         ${NOISE_GLSL}`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float ridges = fbm(vec3(position.xy * 0.028, 0.0)) * 11.0;
         float ripple = sin(position.x * 0.09 + uTime * 0.12) * 0.35;
         // Le sentier reste plat : le relief s'efface près de l'axe du chemin.
         float corridor = smoothstep(11.0, 30.0, abs(position.x));
         transformed.z += (ridges + ripple) * corridor;
         vElevation = transformed.z;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying float vElevation;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         float mossLevel = smoothstep(-1.0, 4.0, vElevation);
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.05, 0.06), mossLevel);`,
      );
  };

  return material;
}
