#!/bin/bash
# =============================================================================
# EC2 Server Setup Script — Hazel Label Fashion
# =============================================================================
# Run this ONCE after first SSH into your EC2 Ubuntu instance.
#
# Usage:
#   chmod +x server-setup.sh && sudo ./server-setup.sh
#
# Installs:
#   - Node.js (Latest LTS)
#   - npm
#   - PM2 (process manager)
#   - Nginx (reverse proxy)
#   - Git
# =============================================================================

set -e  # Exit immediately on any error

# --------------- Colours ---------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

ok()   { echo -e "${GREEN}  ✔  $1${NC}"; }
info() { echo -e "${CYAN}  ➜  $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠  $1${NC}"; }
fail() { echo -e "${RED}  ✘  $1${NC}"; exit 1; }

echo ""
echo -e "${BOLD}=============================================${NC}"
echo -e "${BOLD}   Hazel Label — EC2 Server Setup Script    ${NC}"
echo -e "${BOLD}=============================================${NC}"
echo ""

# ---- Guard: must be Ubuntu/Debian ----
if ! command -v apt-get &> /dev/null; then
    fail "This script requires Ubuntu/Debian (apt-get not found)."
fi

# ---- Guard: should be run as root or with sudo ----
if [ "$EUID" -ne 0 ]; then
    fail "Please run with sudo: sudo ./server-setup.sh"
fi

# ================================================================
# STEP 1 — Update System Packages
# ================================================================
echo ""
echo -e "${BOLD}[1/5] Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https software-properties-common
ok "System packages updated."

# ================================================================
# STEP 2 — Install Node.js (Latest LTS via NodeSource)
# ================================================================
echo ""
echo -e "${BOLD}[2/5] Installing Node.js (Latest LTS)...${NC}"

# Remove any old Node installations
if command -v node &> /dev/null; then
    warn "Existing Node.js found: $(node -v) — removing for clean install..."
    apt-get remove -y nodejs npm 2>/dev/null || true
    apt-get autoremove -y 2>/dev/null || true
fi

# Use NodeSource installer — picks the latest LTS automatically
info "Fetching NodeSource setup script (Node.js LTS)..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -

apt-get install -y nodejs

NODE_VER=$(node -v)
NPM_VER=$(npm -v)

if command -v node &> /dev/null; then
    ok "Node.js ${NODE_VER} installed."
    ok "npm ${NPM_VER} installed."
else
    fail "Node.js installation failed. Check your internet connection."
fi

# ================================================================
# STEP 3 — Install PM2 (Process Manager)
# ================================================================
echo ""
echo -e "${BOLD}[3/5] Installing PM2...${NC}"

npm install -g pm2

if command -v pm2 &> /dev/null; then
    ok "PM2 $(pm2 -v) installed."
else
    fail "PM2 installation failed."
fi

# ================================================================
# STEP 4 — Install Nginx (Reverse Proxy)
# ================================================================
echo ""
echo -e "${BOLD}[4/5] Installing Nginx...${NC}"

apt-get install -y nginx

# Start and enable Nginx (auto-start on reboot)
systemctl start nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    ok "Nginx $(nginx -v 2>&1 | grep -o '[0-9.]*') installed and running."
else
    fail "Nginx failed to start. Run: sudo systemctl status nginx"
fi

# Remove the default placeholder page
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx
ok "Default Nginx site removed."

# ================================================================
# STEP 5 — Install Git
# ================================================================
echo ""
echo -e "${BOLD}[5/5] Installing Git...${NC}"

apt-get install -y git

if command -v git &> /dev/null; then
    ok "Git $(git --version | awk '{print $3}') installed."
else
    fail "Git installation failed."
fi

# ================================================================
# OPTIONAL — Install Certbot (Let's Encrypt SSL, installed silently)
# ================================================================
info "Installing Certbot (for free SSL later)..."
snap install --classic certbot 2>/dev/null && \
    ln -sf /snap/bin/certbot /usr/bin/certbot && \
    ok "Certbot installed (for SSL — run later after DNS is set)." || \
    warn "Certbot install skipped (may need snapd). Install manually later."

# ================================================================
# VERIFICATION SUMMARY
# ================================================================
echo ""
echo -e "${BOLD}=============================================${NC}"
echo -e "${BOLD}   ✅  Installation Complete — Summary       ${NC}"
echo -e "${BOLD}=============================================${NC}"
echo ""
echo -e "  ${CYAN}Node.js${NC}  →  $(node -v)"
echo -e "  ${CYAN}npm${NC}      →  v$(npm -v)"
echo -e "  ${CYAN}PM2${NC}      →  v$(pm2 -v)"
echo -e "  ${CYAN}Nginx${NC}    →  $(nginx -v 2>&1)"
echo -e "  ${CYAN}Git${NC}      →  $(git --version)"
echo ""
echo -e "${BOLD}  NEXT STEP:${NC}"
echo -e "  Run the main deployment script:"
echo -e "  ${YELLOW}  sudo ./deploy-ec2.sh${NC}"
echo ""
echo -e "${BOLD}=============================================${NC}"
echo ""
