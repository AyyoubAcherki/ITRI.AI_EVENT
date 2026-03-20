#!/bin/bash
# =============================================================================
#   ITRI EVENT - Full Automated Deployment Script
#   Contabo KVM VPS - Ubuntu 22.04
#   Run as: bash setup_server.sh
# =============================================================================

set -e  # Exit on any error

# ─────────────────────────────────────────────
# ⚙️  CONFIGURATION — EDIT THESE BEFORE RUNNING
# ─────────────────────────────────────────────
DOMAIN="yourdomain.com"                        # Your domain (e.g. itri-event.ma)
GITHUB_REPO="https://github.com/amghar855/AI.ITRI.TECKETING.git"
APP_DIR="/var/www/itri_event"
DB_NAME="itri_event_2026"
DB_USER="itri_user"
DB_PASS="SecurePass@2026!"                     # Change this!
APP_KEY="base64:JHbETuhkk501zy6ZPrSeHioUy+tBErq3VDmSEhRh6+c="
ADMIN_EMAIL="admin@yourdomain.com"             # For SSL cert alerts
# ─────────────────────────────────────────────

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()    { echo -e "${GREEN}[✔] $1${NC}"; }
warn()   { echo -e "${YELLOW}[⚠] $1${NC}"; }
info()   { echo -e "${BLUE}[→] $1${NC}"; }
error()  { echo -e "${RED}[✘] $1${NC}"; exit 1; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    ITRI EVENT — Automated VPS Deployment         ║${NC}"
echo -e "${BLUE}║    Domain: ${DOMAIN}                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────
# STEP 1: System Update
# ─────────────────────────────────────────────
info "Step 1/10 — Updating system packages..."
apt update -qq && apt upgrade -y -qq
apt install -y -qq curl wget git unzip software-properties-common ufw
log "System updated."

# ─────────────────────────────────────────────
# STEP 2: Install PHP 8.1
# ─────────────────────────────────────────────
info "Step 2/10 — Installing PHP 8.1..."
add-apt-repository -y ppa:ondrej/php > /dev/null 2>&1
apt update -qq
apt install -y -qq \
  php8.1 php8.1-fpm php8.1-cli php8.1-common \
  php8.1-mbstring php8.1-xml php8.1-curl php8.1-mysql \
  php8.1-zip php8.1-bcmath php8.1-gd php8.1-tokenizer \
  php8.1-dom php8.1-intl php8.1-fileinfo
log "PHP 8.1 installed: $(php -v | head -1)"

# ─────────────────────────────────────────────
# STEP 3: Install MySQL
# ─────────────────────────────────────────────
info "Step 3/10 — Installing MySQL..."
apt install -y -qq mysql-server

# Secure MySQL and create database
mysql -u root <<MYSQL_SCRIPT
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
log "MySQL installed and database '${DB_NAME}' created."

# ─────────────────────────────────────────────
# STEP 4: Install Nginx
# ─────────────────────────────────────────────
info "Step 4/10 — Installing Nginx..."
apt install -y -qq nginx
systemctl enable nginx
systemctl start nginx
log "Nginx installed and running."

# ─────────────────────────────────────────────
# STEP 5: Install Composer
# ─────────────────────────────────────────────
info "Step 5/10 — Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --quiet
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
log "Composer installed: $(composer --version --no-ansi 2>/dev/null | head -1)"

# ─────────────────────────────────────────────
# STEP 6: Install Node.js 18
# ─────────────────────────────────────────────
info "Step 6/10 — Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
apt install -y -qq nodejs
log "Node.js installed: $(node --version)"

# ─────────────────────────────────────────────
# STEP 7: Clone & Setup Project
# ─────────────────────────────────────────────
info "Step 7/10 — Cloning project from GitHub..."
mkdir -p $APP_DIR
cd $APP_DIR

if [ -d ".git" ]; then
  warn "Project already exists. Pulling latest changes..."
  git pull origin main
else
  git clone $GITHUB_REPO .
fi
log "Project cloned."

# ── Backend Setup ──────────────────────────────
info "  → Setting up Laravel backend..."
cd $APP_DIR/backend

# Install PHP dependencies
composer install --optimize-autoloader --no-dev --quiet

# Setup .env
cat > .env <<ENV
APP_NAME="ITRI Event 2026"
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=https://${DOMAIN}

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@${DOMAIN}"
MAIL_FROM_NAME="ITRI Event 2026"
ENV

# Run migrations and cache
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions
chown -R www-data:www-data $APP_DIR/backend
chmod -R 775 $APP_DIR/backend/storage
chmod -R 775 $APP_DIR/backend/bootstrap/cache

log "  Laravel backend configured."

# ── Frontend Setup ─────────────────────────────
info "  → Building React frontend..."
cd $APP_DIR/frontend

# Write frontend env
cat > .env.production <<FENV
VITE_API_URL=https://${DOMAIN}
FENV

# Install and build
npm install --silent
npm run build --silent
log "  React frontend built. Files in: $APP_DIR/frontend/dist"

# ─────────────────────────────────────────────
# STEP 8: Configure Nginx
# ─────────────────────────────────────────────
info "Step 8/10 — Configuring Nginx..."

cat > /etc/nginx/sites-available/itri_event <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # ── React Frontend ──────────────────────────
    root ${APP_DIR}/frontend/dist;
    index index.html;

    # Serve React SPA (handles client-side routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # ── Laravel API ─────────────────────────────
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120;
        proxy_connect_timeout 120;
    }

    # ── Laravel Storage Files ───────────────────
    # (QR codes, PDFs, ticket downloads)
    location /storage/ {
        alias ${APP_DIR}/backend/storage/app/public/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_comp_level 6;
    gzip_min_length 256;

    # Logging
    access_log /var/log/nginx/itri_event_access.log;
    error_log  /var/log/nginx/itri_event_error.log;
}
NGINX

# Enable site, disable default
ln -sf /etc/nginx/sites-available/itri_event /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx
log "Nginx configured."

# ─────────────────────────────────────────────
# STEP 9: Create Laravel Systemd Service
# ─────────────────────────────────────────────
info "Step 9/10 — Creating Laravel background service..."

cat > /etc/systemd/system/itri-laravel.service <<SERVICE
[Unit]
Description=ITRI Event - Laravel API Server
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=${APP_DIR}/backend
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8000
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=itri-laravel

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable itri-laravel
systemctl start itri-laravel

# Wait a moment then check
sleep 3
if systemctl is-active --quiet itri-laravel; then
  log "Laravel service is running on port 8000."
else
  error "Laravel service failed to start! Check: journalctl -u itri-laravel -n 50"
fi

# ─────────────────────────────────────────────
# STEP 10: Firewall + SSL
# ─────────────────────────────────────────────
info "Step 10/10 — Configuring firewall and SSL..."

# Firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
log "Firewall configured."

# Install Certbot for free SSL
apt install -y -qq certbot python3-certbot-nginx

# Request SSL certificate
certbot --nginx \
  -d ${DOMAIN} -d www.${DOMAIN} \
  --non-interactive \
  --agree-tos \
  --email ${ADMIN_EMAIL} \
  --redirect
log "SSL certificate installed. Auto-renews every 90 days."

# ─────────────────────────────────────────────
# ✅ DONE — Final Summary
# ─────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 DEPLOYMENT COMPLETE!                ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  🌐 Site:       https://${DOMAIN}          ${NC}"
echo -e "${GREEN}║  🔗 API:        https://${DOMAIN}/api/      ${NC}"
echo -e "${GREEN}║  🗄️  DB Name:    ${DB_NAME}                ${NC}"
echo -e "${GREEN}║  📁 App Dir:    ${APP_DIR}               ${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Useful commands:                                ║${NC}"
echo -e "${GREEN}║  → View Laravel logs:                           ║${NC}"
echo -e "${GREEN}║    journalctl -u itri-laravel -f                ║${NC}"
echo -e "${GREEN}║  → Restart backend:                             ║${NC}"
echo -e "${GREEN}║    systemctl restart itri-laravel               ║${NC}"
echo -e "${GREEN}║  → Update site (after git push):                ║${NC}"
echo -e "${GREEN}║    bash /var/www/itri_event/deploy/update.sh    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
