# Déploiement sur le VPS

Cible : `141.94.246.117`
SSH : port **48956**
Application : port **3000** (`http://141.94.246.117:3000`)

La chaîne est décrite dans `.github/workflows/ci-cd.yml` : un job **qualité** qui valide et
construit, puis un job **déploiement** qui envoie le build et recharge PM2.

---

## 1. Créer l'utilisateur et la clé de déploiement

Sur ton poste, génère une paire de clés dédiée à la CI (ne réutilise pas ta clé personnelle) :

```bash
ssh-keygen -t ed25519 -C "github-actions-portfolio" -f ~/.ssh/portfolio_deploy -N ""
```

Sur le VPS, avec l'utilisateur qui fera tourner l'application (par exemple `deploy`) :

```bash
ssh -p 48956 ton_user@141.94.246.117
sudo adduser --disabled-password --gecos "" deploy   # si l'utilisateur n'existe pas
sudo usermod -aG sudo deploy                          # nécessaire pour le script d'init
sudo -u deploy mkdir -p /home/deploy/.ssh
```

Copie la clé publique :

```bash
ssh-copy-id -i ~/.ssh/portfolio_deploy.pub -p 48956 deploy@141.94.246.117
```

## 2. Préparer le serveur

Une seule fois :

```bash
ssh -p 48956 deploy@141.94.246.117 'bash -s' < deploy/setup-vps.sh
```

Le script installe Node 22 (via nvm si besoin), PM2, crée `/var/www/portfolio`, active le
démarrage automatique de PM2 et ouvre le port 3000 sur `ufw` s'il est présent.

## 3. Renseigner les secrets GitHub

`Settings > Secrets and variables > Actions`

**Secrets** (onglet *Secrets*) :

| Nom | Valeur |
| --- | --- |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | contenu **complet** de `~/.ssh/portfolio_deploy` (clé privée) |

**Variables** (onglet *Variables*, facultatives, des valeurs par défaut existent) :

| Nom | Défaut | Rôle |
| --- | --- | --- |
| `VPS_HOST` | `141.94.246.117` | Adresse du serveur |
| `VPS_PORT` | `48956` | Port SSH |
| `VPS_PATH` | `/var/www/portfolio` | Dossier applicatif |
| `APP_PORT` | `3000` | Port d'écoute de Next |

## 4. Premier déploiement

```bash
git push origin main
```

Le job **qualité** doit passer au vert avant que le job **déploiement** démarre. Ce dernier :

1. télécharge l'artefact validé (aucune reconstruction, donc ce qui est testé est ce qui part) ;
2. synchronise `/var/www/portfolio` avec `rsync --delete` (le fichier `.env` du serveur est préservé) ;
3. exécute `pm2 startOrReload ecosystem.config.cjs --update-env` puis `pm2 save` ;
4. interroge `http://127.0.0.1:3000/api/health` jusqu'à dix fois ; en cas d'échec, les journaux
   PM2 sont affichés dans le run GitHub et le déploiement est marqué en erreur.

## 5. Exploitation courante

```bash
pm2 status                 # état du processus
pm2 logs portfolio         # journaux en direct
pm2 restart portfolio      # redémarrage manuel
curl -s localhost:3000/api/health
```

### Revenir en arrière

Chaque run GitHub Actions conserve l'artefact `portfolio-release` pendant 5 jours.
Pour un retour arrière immédiat, relance le workflow sur le commit précédent
(`Actions > CI/CD > Run workflow` en sélectionnant le commit), ou :

```bash
git revert <sha_fautif> && git push
```

## 6. Passer en HTTPS (optionnel)

Le port 3000 convient pour une démonstration. Pour un nom de domaine en HTTPS, place Nginx
devant l'application :

```nginx
server {
    listen 80;
    server_name exemple.fr;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis `sudo certbot --nginx -d exemple.fr`, et passe `ENABLE_HSTS=true` dans
`deploy/ecosystem.config.cjs` pour activer `Strict-Transport-Security`.

Les en-têtes `X-Forwarded-For` transmis par Nginx sont déjà pris en compte par la limitation
de débit du formulaire de contact.

## 7. En cas de problème

| Symptôme | Piste |
| --- | --- |
| `Permission denied (publickey)` | La clé privée dans `VPS_SSH_KEY` est incomplète, ou la clé publique n'est pas dans `~/.ssh/authorized_keys` du bon utilisateur |
| `pm2: command not found` | PM2 installé sous un autre utilisateur, ou nvm non chargé : relance `deploy/setup-vps.sh` |
| La sonde de santé échoue | `pm2 logs portfolio --lines 100` ; vérifier que le port 3000 est libre |
| Le site répond en local mais pas depuis l'extérieur | Ouvrir le port : `sudo ufw allow 3000/tcp` et vérifier le pare-feu de l'hébergeur |
| `rsync: command not found` côté serveur | `sudo apt install rsync` |
