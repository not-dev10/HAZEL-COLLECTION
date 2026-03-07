# EC2 Deployment Guide — Hazel Label Fashion

Deploy the **backend API (Node.js)** on AWS EC2, with frontend on **Vercel**, database on **MongoDB Atlas**, and images on **Cloudinary**.

## Architecture

```
  Users (Browser)
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐   ┌──────────────────┐
│   Vercel    │   │   EC2 Instance   │
│  (Frontend) │──▶│  (Backend API)   │
│  React/Vite │   │  Node.js + PM2   │
│  Port 443   │   │  Port 5000       │
└─────────────┘   └───────┬──────────┘
                          │
                ┌─────────┼─────────┐
                ▼                   ▼
        ┌──────────────┐   ┌──────────────┐
        │ MongoDB Atlas│   │  Cloudinary  │
        │  (Database)  │   │   (Images)   │
        └──────────────┘   └──────────────┘
```

---

## Prerequisites

| Item | Details |
|------|---------|
| **EC2 Instance** | Amazon Linux 2023 or Ubuntu 22.04 (t2.small minimum) |
| **Storage** | 10 GB+ EBS |
| **Security Group** | Ports 22, 5000 open (see below) |
| **Key Pair** | `.pem` file for SSH |
| **MongoDB Atlas** | Cluster ready with connection string |
| **Cloudinary** | Account with API keys |
| **Vercel** | Frontend already deployed or ready to deploy |

---

## Step 1: Configure EC2 Security Group

In AWS Console → EC2 → Security Groups, add these **Inbound Rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | SSH access |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |
| HTTPS | 443 | 0.0.0.0/0 | (Optional) If using Nginx + SSL |

> Once you add Nginx + SSL in front, you can close port 5000 to the public and only expose 443.

---

## Step 2: SSH into EC2

```bash
# Amazon Linux
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# Ubuntu
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Clone the Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/didi-monorepo.git
cd didi-monorepo
```

---

## Step 4: Configure Environment Variables

```bash
nano backend/.env
```

Fill in your actual values:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/didi_fashion?retryWrites=true&w=majority

# Your Vercel frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Security secrets — generate each with: openssl rand -hex 32
JWT_SECRET=<paste-64-char-hex>
REFRESH_TOKEN_SECRET=<paste-64-char-hex>
ENCRYPTION_KEY=<paste-64-char-hex>
ADMIN_SECRET=<paste-64-char-hex>
SESSION_SECRET=<paste-64-char-hex>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail App Password)
MAIL_SERVICE=gmail
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_FROM_NAME=HezalTheLabel

# Admin account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password

# Rate limiting
RATE_LIMITER_ENABLED=true
ADMIN_ALLOWED_IPS=
```

---

## Step 5: Run the Deploy Script

```bash
chmod +x deploy-ec2.sh
sudo ./deploy-ec2.sh
```

This installs Node.js 18, PM2, dependencies, and starts the backend.

---

## Step 6: Connect Vercel Frontend to EC2 Backend

In the **Vercel Dashboard** for your frontend project:

1. Go to **Settings → Environment Variables**
2. Add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://YOUR_EC2_PUBLIC_IP:5000` |

3. **Redeploy** the frontend for the variable to take effect

> If you set up a domain with SSL (Step 8), change this to `https://api.yourdomain.com`

---

## Step 7: Whitelist EC2 IP in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**
2. Click **Add IP Address**
3. Enter your EC2 **public IP**
4. Click **Confirm**

> For testing you can use `0.0.0.0/0` (allow all), but restrict to your EC2 IP for production.

---

## Step 8 (Optional): Add Custom Domain + SSL

For production, add an Nginx reverse proxy with HTTPS:

```bash
# Install Nginx + Certbot
sudo yum install -y nginx            # Amazon Linux
# sudo apt install -y nginx          # Ubuntu
sudo yum install -y certbot python3-certbot-nginx

# Create Nginx config
sudo tee /etc/nginx/conf.d/api.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Start Nginx
sudo nginx -t && sudo systemctl start nginx && sudo systemctl enable nginx

# Get free SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

Then update:
- `backend/.env` → `FRONTEND_URL=https://yourdomain.com`
- Vercel env → `VITE_API_URL=https://api.yourdomain.com`
- Restart: `pm2 restart hazel-backend`

---

## Common PM2 Commands

```bash
pm2 list                        # See running processes
pm2 logs hazel-backend          # View logs (live)
pm2 logs hazel-backend --lines 100  # Last 100 log lines
pm2 restart hazel-backend       # Restart backend
pm2 stop hazel-backend          # Stop backend
pm2 monit                       # CPU/RAM monitor
pm2 flush                       # Clear log files
```

---

## Updating After Code Changes

```bash
cd ~/didi-monorepo
git pull origin main
cd backend
npm ci --only=production
pm2 restart hazel-backend
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Backend won't start** | Check `pm2 logs hazel-backend` for errors |
| **CORS errors in browser** | Ensure `FRONTEND_URL` in `.env` matches your Vercel URL exactly |
| **MongoDB connection fails** | Whitelist EC2 IP in Atlas Network Access |
| **Can't reach port 5000** | Check EC2 Security Group has port 5000 open |
| **Backend crashes on reboot** | Run `pm2 save` then `pm2 startup` |
| **Out of memory (t2.micro)** | Upgrade to t2.small or add swap: `sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| **SSL cert expired** | `sudo certbot renew` |
