/**
 * Configuration PM2 du portfolio.
 * Le build « standalone » de Next embarque son propre serveur Node : PM2 n'a
 * qu'à lancer server.js, sans npm ni installation de dépendances sur le VPS.
 */
module.exports = {
  apps: [
    {
      name: 'portfolio',
      script: 'server.js',
      // Le dossier du fichier de configuration est aussi la racine déployée.
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      kill_timeout: 5000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.APP_PORT || 3000,
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://141.94.246.117:3000',
        CONTACT_INBOX: process.env.CONTACT_INBOX || 'quentin.durant49@orange.fr',
        ENABLE_HSTS: process.env.ENABLE_HSTS || 'false',
      },
    },
  ],
};
