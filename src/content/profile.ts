/**
 * Contenu éditorial du portfolio. Tout est centralisé ici pour que la mise à
 * jour du texte ne demande jamais de toucher à un composant.
 */
export const PROFILE = {
  name: 'Quentin Durant',
  role: 'Développeur full stack',
  location: 'Région Loire, France',
  email: 'quentin.durant49@orange.fr',
  // À compléter avec tes vraies URLs avant la mise en ligne.
  links: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
  tagline:
    "Je conçois des applications métier de bout en bout : de la modélisation de la donnée jusqu'à la mise en production.",
  intro: [
    "Développeur full stack en alternance chez GC Développement, un opérateur B2B télécom et services IT qui travaille en marque blanche pour plus de 230 partenaires informatiques.",
    "J'y suis à la fois développeur et chef de projet : je pilote mes sujets en autonomie technique complète, de la réunion de cadrage jusqu'au déploiement.",
    "Diplômé du titre CDA (Concepteur Développeur d'Applications), je poursuis en Master MBA développement full stack. En parallèle, je lance mon activité freelance autour de Next.js et NestJS.",
  ],
} as const;

export interface Project {
  name: string;
  role: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
  year: string;
}

export const PROJECTS: readonly Project[] = [
  {
    name: 'Synapse CRM',
    role: 'Concepteur et développeur principal',
    summary:
      "CRM / ERP sur mesure qui centralise les commandes télécom, les clients partenaires et le suivi des interventions terrain de GC Développement.",
    highlights: [
      'Modélisation du domaine métier et de la base relationnelle',
      'Suivi des commandes, des techniciens et des installations client',
      'Projet support de ma certification CDA',
    ],
    stack: ['Next.js', 'NestJS', 'Prisma', 'PostgreSQL', 'TypeScript'],
    year: '2025 · 2026',
  },
  {
    name: 'Bascule téléphonie SEWAN vers UNYC',
    role: 'Chef de projet technique',
    summary:
      "Outillage et pilotage de la migration du parc téléphonique : portabilité des numéros, adresses MAC des postes, bascule des trunks.",
    highlights: [
      'Suivi du provisionnement numéro par numéro',
      'Procédures de bascule rejouables pour les équipes voix',
      "Documentation d'onboarding pour les techniciens",
    ],
    stack: ['Excel avancé', 'Procédures SI', 'Yealink', 'SIP'],
    year: '2026',
  },
  {
    name: 'Chaîne freelance automatisée',
    role: 'Concepteur',
    summary:
      "Pipeline de prospection qui va de la détection d'entreprises jusqu'à l'audit et à l'envoi, pour sortir de la prospection de masse indifférenciée.",
    highlights: [
      'Workflows n8n auto-hébergés sur VPS',
      'CRM Notion avec validation des envois par statut',
      'Audits générés automatiquement avant prise de contact',
    ],
    stack: ['n8n', 'Notion API', 'VPS Linux', 'Node.js'],
    year: '2026',
  },
  {
    name: 'Agora des Formateurs',
    role: 'Développeur, projet de groupe',
    summary:
      "Site vitrine d'une association de formateurs de la région d'Angers, mené en équipe dans le cadre du dossier de formation.",
    highlights: [
      "Cadrage du besoin avec l'association",
      'Travail en équipe et répartition des lots',
      'Mise en ligne et transfert de compétences',
    ],
    stack: ['WordPress', 'PHP', 'Intégration'],
    year: '2025',
  },
] as const;

export interface JourneyStep {
  period: string;
  title: string;
  place: string;
  detail: string;
}

export const JOURNEY: readonly JourneyStep[] = [
  {
    period: 'En cours',
    title: 'Master MBA développement full stack',
    place: 'En alternance',
    detail:
      "Approfondissement architecture, gestion de projet et industrialisation du développement.",
  },
  {
    period: '2026',
    title: "Titre CDA, Concepteur Développeur d'Applications",
    place: 'Titre professionnel niveau 6',
    detail:
      'Dossier professionnel et soutenance construits autour de Synapse CRM, avec couverture de tests et pipeline CI.',
  },
  {
    period: 'Depuis 2024',
    title: 'Développeur full stack et chef de projet',
    place: 'GC Développement, Somloire',
    detail:
      "Trois jours et demi de développement par semaine sur site, en autonomie technique complète sur le SI interne.",
  },
  {
    period: '2024',
    title: 'Bachelor développement web',
    place: 'Formation initiale',
    detail: "Fondamentaux du web, des bases de données et du travail en équipe projet.",
  },
] as const;

export interface StackGroup {
  label: string;
  items: readonly string[];
}

export const STACK: readonly StackGroup[] = [
  {
    label: 'Front',
    items: ['TypeScript', 'Next.js', 'React', 'React Three Fiber', 'Tailwind CSS'],
  },
  {
    label: 'Back',
    items: ['NestJS', 'Node.js', 'Prisma', 'PostgreSQL', 'MySQL', 'API REST'],
  },
  {
    label: 'Industrialisation',
    items: ['Git', 'GitHub Actions', 'Docker', 'PM2', 'VPS Linux', 'n8n'],
  },
  {
    label: 'Qualité',
    items: ['Vitest', 'Testing Library', 'Clean code', 'OWASP Top 10', 'Revue de code'],
  },
] as const;
