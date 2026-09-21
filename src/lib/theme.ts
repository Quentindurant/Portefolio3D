/** Palette partagée entre le CSS et la scène WebGL : une seule source de vérité. */
export const PALETTE = {
  abyss: '#04070a',
  bark: '#0c1410',
  moss: '#123026',
  jade: '#4ade9c',
  ember: '#f0a24a',
  arcane: '#9a7bff',
  bone: '#e9e4d4',
  fog: '#081619',
  haze: '#3f7d84',
} as const;

export type PaletteKey = keyof typeof PALETTE;
