# Portfolio 3D · Quentin Durant

Expérience WebGL plein écran : le scroll ne fait pas défiler une page, il fait
**avancer une caméra sur un chemin 3D** à travers six tableaux d'une forêt
dark fantasy. Le HTML par-dessus ne porte que le HUD, le fil d'Ariane et le
texte lisible.

Next.js 15 · React Three Fiber · shaders GLSL maison · post-processing ·
déploiement continu sur VPS (GitHub Actions, rsync, PM2).

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Scripts](#scripts)
- [Le voyage](#le-voyage)
- [Architecture](#architecture)
- [Rendu 3D](#rendu-3d)
- [Sécurité (OWASP)](#sécurité-owasp)
- [Tests](#tests)
- [Accessibilité et performance](#accessibilité-et-performance)
- [Déploiement](#déploiement)

---

## Démarrage rapide

```bash
npm ci
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Node 22 ou supérieur.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (sortie `standalone`) |
| `npm start` | Serveur de production local |
| `npm run lint` | ESLint (`next/core-web-vitals` + TypeScript) |
| `npm run typecheck` | `tsc --noEmit`, mode strict |
| `npm test` | Tests unitaires Vitest |
| `npm run test:coverage` | Tests + couverture avec seuils |

## Le voyage

Six tableaux, un par section du portfolio :

| # | Station | Décor 3D | Contenu |
| --- | --- | --- | --- |
| 01 | Lisière | Porte de racines et lanterne | Identité, poste, accroche |
| 02 | Sentier | Dalles flottantes | Présentation |
| 03 | Sanctuaire | Quatre monolithes gravés, anneau arcanique | Projets |
| 04 | Racines | Voûte de racines, champignons luminescents | Parcours |
| 05 | Grimoire | Constellation d'éclats de cristal | Stack technique |
| 06 | Clairière | Arbre-cœur et bassin miroir | Contact |

Mécanique :

1. Un rail invisible (`.journey-track`) donne au document sa hauteur de scroll.
2. `useScrollOrchestrator` lisse le défilement (Lenis) et écrit la progression
   dans un store mutable, **hors de React** : aucun rendu pendant le scroll.
3. `progressToCurveT` projette cette progression sur la courbe du voyage, avec
   un lissage par segment : la caméra ralentit en arrivant sur un tableau.
4. `CameraRig` lit la valeur dans `useFrame`, amortit la position et regarde
   devant elle. La souris ajoute une parallaxe et un léger roulis.
5. Seul l'index de la station courante est réactif : le HUD, le fil d'Ariane et
   les panneaux ne se re-rendent qu'au changement d'étape.

## Architecture

```
src/
├── app/                  Routes, styles globaux, API, middleware CSP
│   ├── api/contact/      Formulaire (validation Zod, quota, honeypot)
│   ├── api/health/       Sonde utilisée par la CI et PM2
│   └── page.tsx          Rail de scroll + panneaux de contenu
├── components/
│   ├── scene/            Canvas, caméra, forêt, brume, tableaux, titres 3D
│   │   ├── shaders/      GLSL : bruit, ciel, brume, rayons, runes, terrain
│   │   └── Stations.tsx  Les six décors
│   ├── sections/         Contenu éditorial de chaque station
│   └── ui/               HUD, fil d'Ariane, panneaux, préchargeur, formulaire
├── content/              Données du portfolio (profil, projets, stations)
├── hooks/                Orchestrateur de scroll, station active, phase, motion
└── lib/                  Logique pure : maths, courbe, scroll, CSP, quota…
```

Principes :

- **Une seule source de vérité.** `src/content/sections.ts` et `src/lib/journey.ts`
  décrivent l'ordre des stations, leurs libellés et leur position sur la courbe.
  Le DOM, le fil d'Ariane et la scène lisent les mêmes tableaux.
- **Logique pure isolée.** Courbe, progression, validation, CSP et quotas vivent
  dans `src/lib`, sans React ni DOM : tests rapides et lisibles.
- **Contenu séparé du rendu.** Mettre à jour un projet ne demande de toucher
  aucun composant de scène.

## Rendu 3D

Aucun asset externe : tout est procédural, donc rien à télécharger au build
comme à l'exécution.

- **Ciel** : dôme avec dégradé, halo de lune et poussière d'étoiles, en shader.
- **Terrain** : un plan unique déformé dans le shader de sommets (bruit fbm), le
  sentier restant plat au centre. On part d'un `MeshStandardMaterial` et on
  injecte le déplacement dans son shader, ce qui préserve l'éclairage et le
  brouillard de three.js.
- **Forêt** : troncs et frondaisons instanciés le long de la courbe, deux appels
  de rendu pour toute la forêt.
- **Atmosphère** : nappes de brume et rayons de lune additifs pilotés par bruit,
  lucioles en `Points`.
- **Titres** : peints dans un canvas puis posés sur un plan dans le monde. Ils
  se font masquer par les troncs qui passent devant et se révèlent à l'approche.
- **Post-processing** : bloom sélectif, grain et vignettage
  (`@react-three/postprocessing`).
- **Préchargeur** : le scroll est verrouillé jusqu'à la première image rendue ;
  le bouton d'entrée fournit aussi le geste utilisateur attendu par le navigateur.

## Sécurité (OWASP)

| Mesure | Où | Risque couvert |
| --- | --- | --- |
| CSP avec nonce par requête, `strict-dynamic`, `object-src 'none'` | `src/middleware.ts`, `src/lib/csp.ts` | A03 Injection / XSS |
| En-têtes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP | `src/lib/security-headers.ts` | A05 Mauvaise configuration |
| Validation stricte (Zod) et nettoyage des caractères de contrôle | `src/lib/contact-schema.ts` | A03 Injection d'en-tête mail |
| Quota par IP (5 messages / 15 min) et taille de corps plafonnée | `src/lib/rate-limit.ts` | A04 Conception non sécurisée |
| Champ piège invisible | `src/components/ui/ContactForm.tsx` | Spam automatisé |
| Polices auto-hébergées, aucune ressource tierce | `src/fonts` | A08 Intégrité |
| `npm audit` dans la CI | `.github/workflows/ci-cd.yml` | A06 Composants vulnérables |
| `poweredByHeader: false` | `next.config.ts` | Surface d'information réduite |

Aucune donnée personnelle stockée : le message est journalisé côté serveur,
l'IP ne sert qu'au compteur de quota, en mémoire volatile.

Le rendu est dynamique (`export const dynamic = 'force-dynamic'`) parce que le
nonce CSP change à chaque requête : un HTML mis en cache porterait un nonce
périmé et le navigateur refuserait tous les scripts.

## Tests

103 tests, Vitest + Testing Library (jsdom, et environnement node pour les
routes API).

```bash
npm run test:coverage
```

Seuils : 80 % lignes / fonctions / instructions, 75 % branches.
Couverture réelle du code testable : plus de 98 %.

Couverts : courbe du voyage et stations, progression de scroll, store, fil
d'Ariane (état actif, `aria-current`, navigation), panneaux (activation,
`inert`), HUD, préchargeur, formulaire (succès, erreurs serveur, panne réseau,
honeypot), validation Zod, quotas, CSP, en-têtes, routes API.

## Accessibilité et performance

- `prefers-reduced-motion` : scroll fluide, parallaxe, dérive des lucioles et
  animations décoratives désactivés ; le voyage reste pilotable au scroll.
- Lien d'évitement, focus visible, fil d'Ariane en liste ordonnée de liens réels
  avec `aria-current="step"`, formulaire étiqueté (`aria-invalid`, erreurs liées).
- Les six panneaux restent dans le DOM pour le référencement ; les inactifs sont
  `inert` et `aria-hidden`, donc hors du parcours clavier.
- Géométrie instanciée, `dpr` plafonné, `AdaptiveDpr`, three.js chargé en
  différé côté client uniquement : le premier rendu HTML ne dépend pas de WebGL.

## Déploiement

Cible : `141.94.246.117`, SSH sur le port **48956**, application sur le port **3000**.

Détail complet (clés SSH, secrets GitHub, préparation du serveur, rollback,
HTTPS) : [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).

Chaque push sur `main` :

1. lint, typecheck, tests avec couverture, audit de dépendances, build ;
2. assemblage du serveur `standalone` en artefact ;
3. rsync de l'artefact sur le VPS ;
4. rechargement PM2 puis vérification de `/api/health` avant de déclarer le
   déploiement réussi.
# Portefolio3D
