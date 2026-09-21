import type { NextConfig } from 'next';
import { staticSecurityHeaders } from './src/lib/security-headers';

/**
 * `standalone` : le build produit un serveur Node autonome (.next/standalone)
 * que la CI rsync sur le VPS et que PM2 lance. Aucune installation de
 * dependances n'est necessaire cote serveur.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['@react-three/drei'],
  },
  async headers() {
    return [{ source: '/:path*', headers: staticSecurityHeaders() }];
  },
};

export default nextConfig;
