#!/bin/bash
# =============================================================================
# EC2 Backend Deployment Script — Hazel Label Fashion
# =============================================================================
# Architecture:
#   Frontend  → Vercel
#   Backend   → This EC2 instance (Node.js + PM2)
#   Database  → MongoDB Atlas
#   Images    → Cloudinary
#
# Usage:
#   1. SSH into your EC2 instance
#   2. Clone the repo & cd into it
#   3. Run: chmod +x deploy-ec2.sh && sudo ./deploy-ec2.sh
# =============================================================================

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$APP_DIR/backend"

echo "========================================="
echo "  Hazel Label — EC2 Backend Deployment"
echo "========================================="

# ---- Step 1: Update system ----
echo ""
echo "[1/6] Updating system packages..."
if command -v yum &> /dev/null; then
    sudo yum update -y
elif command -v apt-get &> /dev/null; then
    sudo apt-get update -y && sudo apt-get upgrade -y
fi

# ---- Step 2: Install Node.js 18 ----
echo ""
echo "[2/6] Installing Node.js 18..."
if ! command -v node &> /dev/null || [[ "$(node -v)" != v18* && "$(node -v)" != v20* ]]; then
    # Install via NodeSource
    if command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    elif command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    echo "Node.js $(node -v) installed."
else
    echo "Node.js $(node -v) already installed."
fi

# ---- Step 3: Install PM2 (process manager) ----
echo ""
echo "[3/6] Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "PM2 installed."
else
    echo "PM2 already installed."
fi

# ---- Step 4: Install Git (if not present) ----
echo ""
echo "[4/6] Checking Git..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git 2>/dev/null || sudo apt-get install -y git
    echo "Git installed."
else
    echo "Git already installed."
fi

# ---- Step 5: Check .env file and install dependencies ----
echo ""
echo "[5/6] Setting up backend..."
cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
    echo ""
    echo "WARNING: backend/.env file not found!"
    echo ""
    echo "Creating template... You MUST edit it with your actual values."
    cat > .env << 'ENVTEMPLATE'
# ===== Hazel Label Backend — EC2 Production Environment =====

NODE_ENV=production
PORT=5000

# --- MongoDB Atlas ---
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/didi_fashion?retryWrites=true&w=majority

# --- Frontend URL (your Vercel domain) ---
FRONTEND_URL=https://your-app.vercel.app

# --- Security Secrets (generate with: openssl rand -hex 32) ---
JWT_SECRET=
REFRESH_TOKEN_SECRET=
ENCRYPTION_KEY=
ADMIN_SECRET=
SESSION_SECRET=

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# --- Email (Gmail App Password) ---
MAIL_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
MAIL_FROM_NAME=HezalTheLabel

# --- Admin Account ---
ADMIN_EMAIL=
ADMIN_PASSWORD=

# --- Rate Limiting ---
RATE_LIMITER_ENABLED=true
ADMIN_ALLOWED_IPS=
ENVTEMPLATE
    echo ""
    echo "  >> Edit the file:  nano $BACKEND_DIR/.env"
    echo "  >> Then re-run:    sudo ./deploy-ec2.sh"
    echo ""
    exit 1
fi
echo ".env file found."

echo "Installing npm dependencies..."
npm ci --only=production

# ---- Step 6: Start/Restart with PM2 ----
echo ""
echo "[6/6] Starting backend with PM2..."

# Stop existing instance if running
pm2 delete hazel-backend 2>/dev/null || true

# Start the backend
pm2 start src/server.js \
    --name hazel-backend \
    --node-args="--max-old-space-size=512" \
    -i 1 \
    --time

# Save PM2 process list (survives reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u "$(logname 2>/dev/null || echo $SUDO_USER || echo ec2-user)" --hp "/home/$(logname 2>/dev/null || echo $SUDO_USER || echo ec2-user)" 2>/dev/null || true

# Wait for server to start
sleep 5

# ---- Verify ----
echo ""
EC2_IP=$(curl -s --connect-timeout 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_EC2_IP')

echo "PM2 process status:"
pm2 list

echo ""
echo "Health check:"
curl -s http://localhost:5000/api/health 2>/dev/null || echo "(Backend still starting up...)"

echo ""
echo "========================================="
echo "  Backend Deployment Complete!"
echo "========================================="
echo ""
echo "  Backend API: http://$EC2_IP:5000"
echo "  Health:      http://$EC2_IP:5000/api/health"
echo ""
echo "  NEXT STEPS:"
echo "  1. On Vercel, set environment variable:"
echo "     VITE_API_URL = http://$EC2_IP:5000"
echo "     (or https://api.yourdomain.com if using a domain)"
echo ""
echo "  2. Whitelist EC2 IP in MongoDB Atlas → Network Access"
echo ""
echo "  3. EC2 Security Group — allow inbound:"
echo "     - Port 5000 (Backend API)"
echo "     - Port 22   (SSH)"
echo "     - Port 443  (HTTPS, if using Nginx + SSL)"
echo ""
echo "  USEFUL COMMANDS:"
echo "    pm2 logs hazel-backend    # View logs"
echo "    pm2 restart hazel-backend # Restart backend"
echo "    pm2 monit                 # Monitor CPU/RAM"
echo "    pm2 stop hazel-backend    # Stop backend"
echo ""
echo ""
echo "  IMPORTANT: Make sure your EC2 Security Group allows:"
echo "    - Port 8080 (HTTP - Frontend)"
echo "    - Port 5000 (API - Backend, optional if proxied)"
echo "    - Port 22   (SSH)"
echo "    - Port 443  (HTTPS - if using SSL)"
echo ""
