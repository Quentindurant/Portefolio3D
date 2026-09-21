/**
 * Passerelle entre les liens du fil d'Ariane et le moteur de scroll fluide.
 * Le module garde une référence unique au scroller pour éviter de faire
 * traverser l'instance Lenis à tout l'arbre React.
 */
import { clamp } from './math';

export interface SmoothScroller {
  scrollTo: (target: HTMLElement | string | number, options?: { offset?: number }) => void;
}

let scroller: SmoothScroller | null = null;

export function setSmoothScroller(instance: SmoothScroller | null): void {
  scroller = instance;
}

export function getSmoothScroller(): SmoothScroller | null {
  return scroller;
}

/**
 * Position de scroll correspondant à une station.
 * Les stations sont réparties uniformément sur la course du rail : la station
 * i se trouve à i / (n - 1) de la hauteur scrollable.
 */
export function stationScrollTarget(
  index: number,
  count: number,
  maxScroll: number,
): number {
  if (count <= 1 || maxScroll <= 0) return 0;
  const ratio = clamp(index / (count - 1), 0, 1);
  return Math.round(ratio * maxScroll);
}

export interface Viewport {
  innerHeight: number;
  scrollTo: (options: { top: number; behavior?: ScrollBehavior }) => void;
}

/** Emmène le voyageur à la station demandée. */
export function goToStation(
  index: number,
  count: number,
  view: Viewport = window,
  doc: Pick<Document, 'documentElement'> = document,
): number {
  const maxScroll = doc.documentElement.scrollHeight - view.innerHeight;
  const top = stationScrollTarget(index, count, maxScroll);

  if (scroller) scroller.scrollTo(top);
  else view.scrollTo({ top, behavior: 'smooth' });

  return top;
}
