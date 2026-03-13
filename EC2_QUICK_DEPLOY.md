# ⚡ EC2 Quick Deploy - Variants Update

**Time**: 5 minutes | **Downtime**: 30 seconds | **Risk**: 🟢 Low

---

## Copy & Paste Commands

```bash
# 1. SSH
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# 2. Navigate
cd ~/HAZEL-COLLECTION

# 3. Pull
git pull origin main

# 4. Backend deps
cd backend && npm ci --only=production && cd ..

# 5. Frontend deps
cd frontend && npm ci --only=production && cd ..

# 6. Migrate (optional)
cd backend && node scripts/addVariantsToExistingProducts.js && cd ..

# 7. Restart
pm2 restart all

# 8. Verify
pm2 status
pm2 logs hazel-backend --lines 20
```

---

## One-Liner Deploy

```bash
cd ~/HAZEL-COLLECTION && git pull origin main && cd backend && npm ci --only=production && cd ../frontend && npm ci --only=production && cd .. && pm2 restart all && sleep 3 && pm2 status
```

---

## Deployment Script

Save as `deploy.sh`:

```bash
#!/bin/bash
cd ~/HAZEL-COLLECTION
git pull origin main
cd backend && npm ci --only=production && cd ..
cd frontend && npm ci --only=production && cd ..
cd backend && node scripts/addVariantsToExistingProducts.js && cd ..
pm2 restart all
sleep 3
pm2 status
pm2 logs hazel-backend --lines 20
```

Run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## What Gets Updated

| Component | Changes | Impact |
|-----------|---------|--------|
| Backend | Product model + controller | ✅ Variants support |
| Frontend | Admin + Product pages | ✅ Full CRUD variants |
| Database | Variants field added | ✅ Backward compatible |
| Existing Products | Migration script | ✅ Optional |

---

## Verification

```bash
# Check status
pm2 status

# Check logs
pm2 logs hazel-backend --lines 20

# Test API
curl http://localhost:5000/api/health/ping

# Monitor
pm2 monit
```

---

## Rollback (If Needed)

```bash
git revert HEAD
git pull origin main
cd backend && npm ci --only=production && cd ..
cd frontend && npm ci --only=production && cd ..
pm2 restart all
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend won't start | `cd backend && npm ci --only=production && pm2 restart hazel-backend` |
| Frontend won't start | `cd frontend && npm ci --only=production && pm2 restart hazel-frontend` |
| Changes not showing | `pm2 flush && pm2 restart all` |
| Migration failed | `cd backend && node scripts/addVariantsToExistingProducts.js` |

---

## Status Indicators

✅ **Success**:
- `pm2 status` shows both apps "online"
- `curl` returns 200 OK
- `pm2 logs` shows no errors

❌ **Issues**:
- Apps show "stopped" or "errored"
- `curl` returns error
- `pm2 logs` shows ERROR messages

---

**Ready?** Run the one-liner or deployment script above!
