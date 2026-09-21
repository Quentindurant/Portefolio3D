/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * La scène doit être reproductible : même forêt à chaque rendu, donc pas de
 * `Math.random` qui ferait diverger le serveur, le client et les tests.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tirage dans un intervalle. */
export function randomBetween(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}
