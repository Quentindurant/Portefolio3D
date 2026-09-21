#!/usr/bin/env bash
#
# Préparation initiale du VPS, à lancer une seule fois en tant qu'utilisateur
# de déploiement (pas en root) :
#
#   ssh -p 48956 deploy@141.94.246.117 'bash -s' < deploy/setup-vps.sh
#
set -euo pipefail

APP_NAME="portfolio"
APP_PATH="${APP_PATH:-/var/www/portfolio}"
APP_PORT="${APP_PORT:-3000}"
NODE_MAJOR="${NODE_MAJOR:-22}"

echo "==> Vérification de Node.js"
if ! command -v node > /dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_MAJOR" ]; then
  echo "    Installation de Node.js $NODE_MAJOR via nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh"
  nvm install "$NODE_MAJOR"
  nvm alias default "$NODE_MAJOR"
fi

echo "==> Vérification de PM2"
command -v pm2 > /dev/null || npm install -g pm2

echo "==> Création du répertoire applicatif $APP_PATH"
sudo mkdir -p "$APP_PATH"
sudo chown -R "$USER":"$USER" "$APP_PATH"

echo "==> Démarrage automatique de PM2 au boot"
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | grep -E '^sudo' | bash || true

echo "==> Ouverture du port applicatif $APP_PORT"
if command -v ufw > /dev/null; then
  sudo ufw allow "$APP_PORT"/tcp || true
fi

cat <<INFO

Préparation terminée.

Étapes restantes, côté GitHub :
  1. Ajouter la clé publique de déploiement dans ~/.ssh/authorized_keys de cet utilisateur.
  2. Renseigner les secrets du dépôt : VPS_USER, VPS_SSH_KEY.
  3. Pousser sur main : la CI construit, envoie et redémarre $APP_NAME.

INFO
