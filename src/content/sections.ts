/**
 * Source de vérité unique du parcours : ordre des sections, libellés du fil
 * d'Ariane et repères 3D associés. Le DOM, le breadcrumb et la scène lisent
 * tous ce tableau, donc rien ne peut se désynchroniser.
 */
export interface SectionDefinition {
  /** Ancre DOM et fragment d'URL. */
  id: string;
  /** Libellé court affiché dans le fil d'Ariane. */
  crumb: string;
  /** Titre affiché dans la section. */
  title: string;
  /** Sous-titre narratif. */
  kicker: string;
  /** Profondeur de la caméra sur l'axe Z pour cette étape. */
  depth: number;
}

export const SECTIONS = [
  {
    id: 'lisiere',
    crumb: 'Lisière',
    title: 'Quentin Durant',
    kicker: 'Développeur full stack',
    depth: 0,
  },
  {
    id: 'sentier',
    crumb: 'Sentier',
    title: 'Le sentier',
    kicker: 'Qui je suis',
    depth: -34,
  },
  {
    id: 'sanctuaire',
    crumb: 'Sanctuaire',
    title: 'Le sanctuaire',
    kicker: 'Projets',
    depth: -68,
  },
  {
    id: 'racines',
    crumb: 'Racines',
    title: 'Les racines',
    kicker: 'Parcours',
    depth: -102,
  },
  {
    id: 'grimoire',
    crumb: 'Grimoire',
    title: 'Le grimoire',
    kicker: 'Stack technique',
    depth: -136,
  },
  {
    id: 'clairiere',
    crumb: 'Clairière',
    title: 'La clairière',
    kicker: 'Contact',
    depth: -170,
  },
] as const satisfies readonly SectionDefinition[];

export type SectionId = (typeof SECTIONS)[number]['id'];

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map((section) => section.id);
