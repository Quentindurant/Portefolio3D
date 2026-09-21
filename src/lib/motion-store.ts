/**
 * Drapeau « animation réduite » lisible depuis l'intérieur du canvas WebGL,
 * qui ne partage pas l'arbre de contextes React avec le DOM.
 */
export const motionStore = {
  reduced: false,
  setReduced(value: boolean): void {
    motionStore.reduced = value;
  },
};
