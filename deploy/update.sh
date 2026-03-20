#!/bin/bash
# =============================================================================
#   ITRI EVENT — Quick Update Script
#   Run on server after pushing new code to GitHub
#   Usage: bash /var/www/itri_event/deploy/update.sh
# =============================================================================

set -e

APP_DIR="/var/www/itri_event"
GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'

log()  { echo -e "${GREEN}[✔] $1${NC}"; }
info() { echo -e "${BLUE}[→] $1${NC}"; }

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ITRI EVENT — Updating Site...      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# Pull latest code
info "Pulling latest code from GitHub..."
cd $APP_DIR && git pull origin main
log "Code updated."

# Update backend
info "Updating Laravel backend..."
cd $APP_DIR/backend
composer install --optimize-autoloader --no-dev --quiet
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chown -R www-data:www-data $APP_DIR/backend/storage
log "Backend updated."

# Rebuild frontend
info "Rebuilding React frontend..."
cd $APP_DIR/frontend
npm install --silent
npm run build --silent
log "Frontend rebuilt."

# Restart Laravel service
info "Restarting Laravel service..."
systemctl restart itri-laravel
sleep 2
systemctl is-active --quiet itri-laravel && log "Laravel service restarted OK."

log "🎉 Update complete! Your site is Live."
