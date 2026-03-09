# EC2 Launch Guide — Hazel Collection Fashion E-Commerce

**Status**: Files transferred to EC2 ✅  
**Next**: Launch the application  
**Date**: March 2, 2026

---

## Quick Start (5 Minutes)

### 1. SSH into Your EC2 Instance

```bash
# Find your EC2 public IP in AWS Console
# Then SSH in (replace with your actual IP and key path)

ssh -i "path/to/your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
# OR for Ubuntu:
ssh -i "path/to/your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

**If SSH fails**, check:
- ✅ Security Group allows port 22 (SSH)
- ✅ Key file has correct permissions: `chmod 400 your-key.pem`
- ✅ Using correct username (ec2-user for Amazon Linux, ubuntu for Ubuntu)

---

### 2. Navigate to Your Project

```bash
cd ~/didi-monorepo
# or wherever you cloned the repo
```

---

### 3. Configure Environment Variables

```bash
# Edit backend environment
nano backend/.env
```

**Required values to fill in**:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas (copy from your cluster)
MONGODB_URI=mongodb+srv://Dexter:dexter_1012@cluster0.awdnale.mongodb.net/?appName=Cluster0

# Your Vercel frontend URL (for CORS)
FRONTEND_URL=https://your-vercel-app.vercel.app

# Security secrets (generate with: openssl rand -hex 32)
JWT_SECRET=<generate-new>
REFRESH_TOKEN_SECRET=<generate-new>
ENCRYPTION_KEY=<generate-new>
ADMIN_SECRET=<generate-new>
SESSION_SECRET=<generate-new>

# Cloudinary (from your account)
CLOUDINARY_CLOUD_NAME=dknwcmcki
CLOUDINARY_API_KEY=563742973262977
CLOUDINARY_API_SECRET=_sE7WPgVV1qmvMcodhoMwEQO0V4

# Email (Gmail App Password)
MAIL_SERVICE=gmail
SMTP_USER=hezallabel@gmail.com
SMTP_PASS=ddrh ixpe tirz acil

# Admin account
ADMIN_EMAIL=hazellabel@gmail.com
ADMIN_PASSWORD=hazellabel@2026

# Rate limiting
RATE_LIMITER_ENABLED=true
ADMIN_ALLOWED_IPS=0.0.0.0
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

---

### 4. Run the Deployment Script

```bash
chmod +x deploy-ec2.sh
sudo ./deploy-ec2.sh
```

**What it does**:
- ✅ Updates system packages
- ✅ Installs Node.js 20
- ✅ Installs PM2 (process manager)
- ✅ Installs dependencies
- ✅ Starts backend with PM2
- ✅ Configures auto-restart on reboot

**Expected output**:
```
=========================================
  Hazel Label — EC2 Backend Deployment
=========================================

[1/6] Updating system packages...
[2/6] Installing Node.js 20...
[3/6] Installing PM2...
[4/6] Checking Git...
[5/6] Setting up backend...
[6/6] Starting backend with PM2...

PM2 process status:
┌─────────────────────────────────────────────────────────┐
│ id │ name            │ namespace   │ version │ mode │ ↺  │
├─────────────────────────────────────────────────────────┤
│ 0  │ hazel-backend   │ default     │ 1.0.0   │ fork │ 0  │
└─────────────────────────────────────────────────────────┘

Backend Deployment Complete!
Backend API: http://YOUR_EC2_IP:5000
Health: http://YOUR_EC2_IP:5000/api/health
```

---

### 5. Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-03-02T10:30:00Z"}
```

---

### 6. Update Vercel Frontend

In **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**:

Add/Update:
```
VITE_API_URL = http://YOUR_EC2_PUBLIC_IP:5000
```

Then **Redeploy** the frontend.

---

### 7. Whitelist EC2 IP in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Enter your EC2 public IP
5. Click **Confirm**

---

## Detailed Setup Instructions

### EC2 Security Group Configuration

In **AWS Console** → **EC2** → **Security Groups**:

**Add these Inbound Rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | SSH access |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |
| HTTP | 80 | 0.0.0.0/0 | (Optional) For Nginx |
| HTTPS | 443 | 0.0.0.0/0 | (Optional) For SSL |

---

### Generate Secure Secrets

On your EC2 instance, generate new secrets:

```bash
# Generate 5 secrets (32 bytes each)
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # REFRESH_TOKEN_SECRET
openssl rand -hex 32  # ENCRYPTION_KEY
openssl rand -hex 32  # ADMIN_SECRET
openssl rand -hex 32  # SESSION_SECRET
```

Copy each output and paste into `backend/.env`

---

### Verify Deployment

```bash
# Check PM2 status
pm2 list

# View live logs
pm2 logs hazel-backend

# Monitor CPU/RAM
pm2 monit

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
```

---

## Useful Commands

### View Logs

```bash
# Live logs
pm2 logs hazel-backend

# Last 100 lines
pm2 logs hazel-backend --lines 100

# Clear logs
pm2 flush
```

### Restart Backend

```bash
pm2 restart hazel-backend
```

### Stop/Start Backend

```bash
pm2 stop hazel-backend
pm2 start hazel-backend
```

### Update Code

```bash
cd ~/didi-monorepo
git pull origin main
cd backend
npm ci --only=production
pm2 restart hazel-backend
```

### Check System Resources

```bash
# CPU/RAM usage
pm2 monit

# Disk space
df -h

# Memory usage
free -h
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs hazel-backend

# Common issues:
# 1. Missing .env file → Create it with all required variables
# 2. MongoDB connection failed → Check MONGODB_URI and whitelist EC2 IP
# 3. Port 5000 already in use → pm2 kill && pm2 start src/server.js
```

### CORS Errors in Browser

```bash
# Check FRONTEND_URL in backend/.env
nano backend/.env

# Must match your Vercel URL exactly:
# FRONTEND_URL=https://your-app.vercel.app

# Restart after changes
pm2 restart hazel-backend
```

### Can't Connect to MongoDB

```bash
# 1. Check connection string
nano backend/.env

# 2. Whitelist EC2 IP in MongoDB Atlas
# Go to: https://cloud.mongodb.com → Network Access

# 3. Test connection
curl http://localhost:5000/api/health
```

### Out of Memory (t2.micro)

```bash
# Add swap space
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

### Port 5000 Not Accessible

```bash
# 1. Check if backend is running
pm2 list

# 2. Check if port is listening
sudo netstat -tlnp | grep 5000

# 3. Check Security Group allows port 5000
# AWS Console → EC2 → Security Groups → Edit Inbound Rules

# 4. Check firewall (if using Amazon Linux)
sudo systemctl status firewalld
sudo firewall-cmd --add-port=5000/tcp --permanent
sudo firewall-cmd --reload
```

---

## Production Setup (Optional)

### Add Nginx + SSL

For production, add Nginx reverse proxy with HTTPS:

```bash
# Install Nginx
sudo yum install -y nginx
# OR for Ubuntu:
sudo apt install -y nginx

# Create config
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
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate (requires domain)
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Then update:
- `backend/.env` → `FRONTEND_URL=https://yourdomain.com`
- Vercel → `VITE_API_URL=https://api.yourdomain.com`
- Restart: `pm2 restart hazel-backend`

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check backend status
pm2 list

# View recent logs
pm2 logs hazel-backend --lines 50

# Check disk space
df -h

# Check memory
free -h
```

### Weekly Tasks

```bash
# Update system
sudo yum update -y  # Amazon Linux
# sudo apt update && sudo apt upgrade -y  # Ubuntu

# Check PM2 logs for errors
pm2 logs hazel-backend --lines 500 | grep -i error

# Verify MongoDB connection
curl http://localhost:5000/api/health
```

### Monthly Tasks

```bash
# Update Node.js dependencies
cd ~/didi-monorepo/backend
npm update

# Restart backend
pm2 restart hazel-backend

# Check SSL certificate expiry (if using SSL)
sudo certbot certificates
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Users (Browser)                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼──────┐          ┌──────▼──────┐
   │  Vercel   │          │  EC2 Instance
   │ (Frontend)│          │  (Backend API)
   │ React/Vite│◄────────►│  Node.js + PM2
   │ Port 443  │          │  Port 5000
   └───────────┘          └───────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼                           ▼
            ┌──────────────┐          ┌──────────────┐
            │ MongoDB Atlas│          │  Cloudinary  │
            │  (Database)  │          │   (Images)   │
            └──────────────┘          └──────────────┘
```

---

## Support & Resources

### Useful Links

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [AWS EC2 Console](https://console.aws.amazon.com/ec2)

### Common Issues

**Q: Backend crashes after reboot**  
A: Run `pm2 save` then `pm2 startup` to enable auto-start

**Q: Can't SSH into EC2**  
A: Check key permissions: `chmod 400 your-key.pem`

**Q: MongoDB connection timeout**  
A: Whitelist EC2 IP in MongoDB Atlas Network Access

**Q: CORS errors in browser**  
A: Ensure `FRONTEND_URL` in `.env` matches your Vercel URL exactly

---

## Next Steps

1. ✅ SSH into EC2
2. ✅ Configure `backend/.env`
3. ✅ Run `deploy-ec2.sh`
4. ✅ Verify backend is running
5. ✅ Update Vercel environment variables
6. ✅ Whitelist EC2 IP in MongoDB Atlas
7. ✅ Test the application
8. (Optional) Add Nginx + SSL for production

---

**Deployment Status**: Ready to Launch 🚀  
**Last Updated**: March 2, 2026
