# 🚀 EC2 Update Guide - Color & Size Variants

**Date**: March 13, 2026  
**Status**: Ready to Deploy  
**Changes**: 18 files modified, 2 new components, full CRUD variants

---

## Quick Start (5 minutes)

```bash
# 1. SSH into EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# 2. Navigate to project
cd ~/HAZEL-COLLECTION

# 3. Pull latest code
git pull origin main

# 4. Install dependencies (if any new packages)
cd backend && npm ci --only=production && cd ..
cd frontend && npm ci --only=production && cd ..

# 5. Restart services
pm2 restart hazel-backend
pm2 restart hazel-frontend

# 6. Verify
pm2 logs hazel-backend --lines 20
pm2 logs hazel-frontend --lines 20
```

---

## Step-by-Step Deployment

### Step 1: SSH into EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

**Example**:
```bash
ssh -i "hazel-key.pem" ubuntu@54.123.45.67
```

### Step 2: Navigate to Project

```bash
cd ~/HAZEL-COLLECTION
pwd
# Should output: /home/ubuntu/HAZEL-COLLECTION
```

### Step 3: Pull Latest Code

```bash
git pull origin main
```

**Expected output**:
```
remote: Enumerating objects: 52, done.
remote: Counting objects: 100% (52/52), done.
Unpacking objects: 100% (31/31), done.
From https://github.com/not-dev10/HAZEL-COLLECTION
   a013049..dbda4e6  main -> main
Updating a013049..dbda4e6
Fast-forward
 backend/src/controllers/product.controller.js    |  10 +
 backend/src/models/Product.js                    |  15 +
 frontend/src/admin/pages/Products.tsx            | 150 +
 frontend/src/admin/components/ColorSizeManager.tsx | NEW
 frontend/src/components/catalog/ProductVariants.tsx | NEW
 ... (more files)
 18 files changed, 4046 insertions(+), 24 deletions(-)
```

### Step 4: Install Dependencies

**Backend**:
```bash
cd backend
npm ci --only=production
cd ..
```

**Frontend**:
```bash
cd frontend
npm ci --only=production
cd ..
```

**Why `npm ci`?**
- Installs exact versions from package-lock.json
- Faster and more reliable than `npm install`
- Ensures consistency across environments

### Step 5: Migrate Existing Products (Optional)

Add variants field to existing products:

```bash
cd backend
node scripts/addVariantsToExistingProducts.js
cd ..
```

**Output**:
```
🔄 Starting migration: Adding variants field to existing products...

📊 Found 45 products without variants field

✅ Migration completed successfully!

📈 Statistics:
   - Matched: 45 products
   - Modified: 45 products
   - Upserted: 0 products

✅ All existing products are now compatible with the variants system!
```

### Step 6: Restart Services

**Restart Backend**:
```bash
pm2 restart hazel-backend
```

**Restart Frontend**:
```bash
pm2 restart hazel-frontend
```

**Restart Both**:
```bash
pm2 restart all
```

**Expected output**:
```
[PM2] Applying action restartCluster on app [hazel-backend]...
[PM2] [hazel-backend] ✓ restarted
[PM2] Applying action restartCluster on app [hazel-frontend]...
[PM2] [hazel-frontend] ✓ restarted
```

### Step 7: Verify Deployment

**Check Status**:
```bash
pm2 status
```

**Expected output**:
```
┌─────────────────┬──────┬──────┬──────────┬──────────┬──────────┐
│ App name        │ id   │ mode │ pid      │ status   │ restart  │
├─────────────────┼──────┼──────┼──────────┼──────────┼──────────┤
│ hazel-backend   │ 0    │ fork │ 12345    │ online   │ 0        │
│ hazel-frontend  │ 1    │ fork │ 12346    │ online   │ 0        │
└─────────────────┴──────┴──────┴──────────┴──────────┴──────────┘
```

**Check Logs**:
```bash
pm2 logs hazel-backend --lines 20
```

**Look for**:
- ✅ `✅ Server ready on 0.0.0.0:5000`
- ✅ `✅ Connected to MongoDB Atlas`
- ❌ NO errors or warnings

**Test Health Endpoint**:
```bash
curl http://localhost:5000/api/health/ping
```

**Expected response**:
```json
{"success":true,"status":"healthy",...}
```

---

## What Changed

### Backend Changes (3 files)
- `backend/src/models/Product.js` - Added variants field to schema
- `backend/src/controllers/product.controller.js` - Handle variants in API
- `backend/scripts/addVariantsToExistingProducts.js` - NEW migration script

### Frontend Changes (7 files)
- `frontend/src/admin/pages/Products.tsx` - Integrated ColorSizeManager
- `frontend/src/admin/components/ColorSizeManager.tsx` - NEW component
- `frontend/src/components/catalog/ProductVariants.tsx` - NEW component
- `frontend/src/pages/Product.tsx` - Display variants on product page
- `frontend/src/pages/Cart.tsx` - Show variants in cart
- `frontend/src/pages/Checkout.tsx` - Show variants in checkout
- `frontend/src/components/cart/MiniCart.tsx` - Show variants in mini cart

### Documentation (9 files)
- Various guides and documentation files

---

## Backward Compatibility

✅ **All existing products continue to work**:
- Old products without variants still display
- Legacy `stock`, `color`, `size` fields still supported
- No data loss
- No breaking changes

✅ **Migration is optional**:
- Existing products work as-is
- Add variants only when needed
- Can mix old and new products

---

## Troubleshooting

### Issue: Backend won't start

**Check logs**:
```bash
pm2 logs hazel-backend
```

**Common causes**:
- Missing dependencies: Run `npm ci --only=production`
- MongoDB connection: Check `.env` file
- Port in use: Check `lsof -i :5000`

**Fix**:
```bash
cd backend
npm ci --only=production
pm2 restart hazel-backend
```

### Issue: Frontend won't start

**Check logs**:
```bash
pm2 logs hazel-frontend
```

**Common causes**:
- Missing dependencies: Run `npm ci --only=production`
- Build errors: Check console output

**Fix**:
```bash
cd frontend
npm ci --only=production
npm run build
pm2 restart hazel-frontend
```

### Issue: Changes not showing

**Solution**:
```bash
# Clear cache
pm2 flush

# Restart
pm2 restart all

# Check logs
pm2 logs
```

### Issue: Database migration failed

**Check migration**:
```bash
cd backend
node scripts/addVariantsToExistingProducts.js
```

**If it fails**:
- Check MongoDB connection
- Verify database permissions
- Check for syntax errors in script

---

## Deployment Script

Save as `deploy-variants.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Color & Size Variants..."

# Navigate to project
cd ~/HAZEL-COLLECTION

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --only=production
cd ..

# Migrate existing products
echo "🔄 Migrating existing products..."
cd backend
node scripts/addVariantsToExistingProducts.js
cd ..

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

# Wait for startup
sleep 5

# Check status
echo "✅ Checking status..."
pm2 status

# Show logs
echo "📋 Recent logs:"
pm2 logs hazel-backend --lines 10

echo "✅ Deployment complete!"
```

**Usage**:
```bash
chmod +x deploy-variants.sh
./deploy-variants.sh
```

---

## Monitoring After Deployment

### Real-time Monitoring
```bash
pm2 monit
```

### View Logs
```bash
# Last 50 lines
pm2 logs hazel-backend --lines 50

# Follow logs (live)
pm2 logs hazel-backend --follow

# Clear logs
pm2 flush
```

### Check Memory
```bash
pm2 show hazel-backend
```

### Monitor Over Time
```bash
watch -n 1 'pm2 show hazel-backend | grep memory'
```

---

## Rollback (If Needed)

If something goes wrong:

```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Pull reverted code
git pull origin main

# 3. Reinstall dependencies
cd backend && npm ci --only=production && cd ..
cd frontend && npm ci --only=production && cd ..

# 4. Restart
pm2 restart all

# 5. Verify
pm2 logs hazel-backend --lines 20
```

---

## Verification Checklist

After deployment, verify:

- [ ] Backend running: `pm2 status hazel-backend` shows "online"
- [ ] Frontend running: `pm2 status hazel-frontend` shows "online"
- [ ] Health check: `curl http://localhost:5000/api/health/ping` returns 200
- [ ] Memory stable: `pm2 monit` shows stable memory usage
- [ ] No errors: `pm2 logs` shows no ERROR messages
- [ ] Admin panel loads: Visit admin dashboard
- [ ] Products display: Check product page
- [ ] Variants work: Add product with variants
- [ ] Cart shows variants: Add to cart and check
- [ ] Checkout shows variants: Proceed to checkout

---

## Performance Impact

### Expected Results
- ✅ Backend startup: ~2-3 seconds
- ✅ Frontend build: ~30-60 seconds
- ✅ Memory usage: Stable 100-200MB
- ✅ API response time: < 100ms
- ✅ No downtime: Services restart in ~30 seconds

### Monitoring
```bash
# Watch memory usage
pm2 monit

# Check CPU usage
top

# Check disk space
df -h
```

---

## Next Steps

1. **Deploy to EC2** (follow steps above)
2. **Test in admin panel**:
   - Add product with variants
   - Edit variants
   - Delete variants
3. **Test on frontend**:
   - View product with variants
   - Select color and size
   - Add to cart
   - Checkout
4. **Monitor for 24 hours**:
   - Watch logs
   - Check memory usage
   - Verify no errors

---

## Support

If you encounter issues:

1. **Check logs**: `pm2 logs hazel-backend`
2. **Review this guide**: Look for your error in Troubleshooting
3. **Check GitHub**: Verify latest code is pulled
4. **Verify dependencies**: `npm list` in backend and frontend
5. **Check database**: Verify MongoDB connection

---

## Summary

✅ **Deployment Steps**:
1. SSH into EC2
2. Pull latest code
3. Install dependencies
4. Migrate existing products (optional)
5. Restart services
6. Verify deployment

✅ **Time Required**: ~5-10 minutes  
✅ **Downtime**: ~30 seconds (during restart)  
✅ **Risk Level**: 🟢 Very Low  
✅ **Rollback Time**: ~2 minutes  

---

**Ready to deploy?** Follow the Quick Start section above!
