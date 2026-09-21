import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SceneLayer } from '@/components/scene/SceneLayer';
import { BreadcrumbTrail } from '@/components/ui/BreadcrumbTrail';
import { Hud } from '@/components/ui/Hud';
import { Preloader } from '@/components/ui/Preloader';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScrollProvider } from '@/components/ui/ScrollProvider';
import { PROFILE } from '@/content/profile';

/**
 * Polices auto-hébergées : aucune requête vers un CDN tiers, donc pas de
 * dépendance externe au build, pas de fuite d'IP visiteur et une CSP stricte.
 */
const display = localFont({
  src: [
    { path: '../fonts/cinzel-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cinzel-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const body = localFont({
  src: [
    { path: '../fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://141.94.246.117:4300';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${PROFILE.name} · ${PROFILE.role}`,
    template: `%s · ${PROFILE.name}`,
  },
  description: PROFILE.tagline,
  applicationName: `Portfolio ${PROFILE.name}`,
  authors: [{ name: PROFILE.name }],
  keywords: ['développeur full stack', 'Next.js', 'NestJS', 'portfolio', 'alternance'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    title: `${PROFILE.name} · ${PROFILE.role}`,
    description: PROFILE.tagline,
    siteName: `Portfolio ${PROFILE.name}`,
  },
  robots: { index: true, follow: true },
};

/**
 * Le nonce de la CSP est régénéré à chaque requête : le HTML ne peut donc pas
 * être mis en cache statiquement, sinon il porterait un nonce périmé et le
 * navigateur refuserait tous les scripts.
 */
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#04070a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#lisiere">
          Aller au contenu
        </a>

        <SceneLayer />

        <ScrollProvider>
          <ScrollProgress />
          <Hud />
          <BreadcrumbTrail />
          {children}
          <footer className="credit">
            © {new Date().getFullYear()} {PROFILE.name} · Next.js, React Three Fiber,
            déploiement continu sur VPS
          </footer>
        </ScrollProvider>

        <Preloader />
      </body>
    </html>
  );
}
