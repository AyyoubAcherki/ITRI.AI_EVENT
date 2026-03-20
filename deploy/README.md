# 🚀 Deploy Guide — Contabo KVM VPS

## 📁 Files in This Folder

| File | Purpose |
|---|---|
| `setup_server.sh` | Run **once** on a fresh server to install & configure everything |
| `update.sh` | Run **every time** you push new code to GitHub |

---

## ✏️ Before You Run — Edit `setup_server.sh`

Open `setup_server.sh` and change the top section:

```bash
DOMAIN="yourdomain.com"          # ← Your real domain
DB_PASS="SecurePass@2026!"       # ← Choose a strong password
ADMIN_EMAIL="admin@youremail.com" # ← Your email (for SSL alerts)
```

> ⚠️ The `GITHUB_REPO` is already set to your repo. If you make the repo private, you'll need to set up an SSH key on the server.

---

## 🖥️ Step-by-Step Deployment

### 1. Buy a Contabo VPS
- Go to [contabo.com](https://contabo.com)
- Buy **VPS S** → $4.50/month
- Select **Ubuntu 22.04**
- You'll receive the IP and root password by email (~15 minutes)

### 2. Point Your Domain to the Server
In your domain registrar (e.g. GoDaddy, Namecheap):
```
A Record:  @   →  YOUR_SERVER_IP
A Record:  www →  YOUR_SERVER_IP
```
Wait 5–30 minutes for DNS to propagate.

### 3. Connect to the Server
```bash
# Open PowerShell or CMD on your Windows PC
ssh root@YOUR_SERVER_IP
```

### 4. Upload and Run the Setup Script
```bash
# On the server — download the script from GitHub
curl -o setup.sh https://raw.githubusercontent.com/amghar855/AI.ITRI.TECKETING/main/deploy/setup_server.sh

# Edit configuration (domain, password, email)
nano setup.sh

# Make executable and run
chmod +x setup.sh
bash setup.sh
```

**The script takes ~5–10 minutes and does everything automatically:**
- ✅ Installs PHP 8.1, MySQL, Nginx, Node.js, Composer
- ✅ Clones your project from GitHub
- ✅ Sets up the database and runs migrations
- ✅ Builds the React frontend
- ✅ Configures Nginx (serves both frontend + API on one domain)
- ✅ Creates a Laravel background service (auto-restarts on crash)
- ✅ Sets up firewall (UFW)
- ✅ Installs free SSL certificate (Let's Encrypt)

### 5. Done! 🎉
Your site will be live at `https://yourdomain.com`

---

## 🔄 Updating the Site After Code Changes

Whenever you push new code to GitHub:

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Run update script
bash /var/www/itri_event/deploy/update.sh
```

This will:
- Pull latest code from GitHub
- Update backend dependencies & run new migrations
- Rebuild the React frontend
- Restart the Laravel service

---

## 🛠️ Useful Server Commands

```bash
# Check if Laravel is running
systemctl status itri-laravel

# View real-time Laravel logs
journalctl -u itri-laravel -f

# Restart Laravel
systemctl restart itri-laravel

# View Nginx error logs
tail -f /var/log/nginx/itri_event_error.log

# Check MySQL
systemctl status mysql

# Test API manually
curl https://yourdomain.com/api/speakers
```

---

## 🏗️ Server Architecture

```
https://yourdomain.com
        │
        ▼
    [Nginx :443]
        │
   ┌────┴────┐
   ▼         ▼
[React]   [/api/*]
[/dist]      │
             ▼
      [Laravel :8000]
             │
             ▼
         [MySQL]
```

---

## 💰 Cost Summary

| Service | Cost |
|---|---|
| Contabo VPS S (1 CPU, 4GB RAM, 300GB SSD) | $4.50/month |
| Domain name (optional, from Namecheap) | ~$10/year |
| SSL Certificate (Let's Encrypt) | **FREE** |
| **Total** | **~$4.50/month** |
