# AWS T3 Micro Idle Cost Issues - Analysis & Fixes

## Critical Issues Found

### 🔴 Issue #1: Health Check Running Every 30 Seconds (2,880/day)
**Location**: `docker-compose.yml` & `Dockerfile`  
**Problem**: Health check endpoint triggers expensive database operations every 30 seconds:
- MongoDB admin ping + stats query
- Database size calculations  
- Cloudinary verification every 2 hours

**Cost**: ~2,880 MongoDB queries/day even with 0 users  
**Fix**: Disable expensive health check or reduce frequency

### 🔴 Issue #2: Multiple Overlapping Cleanup Schedulers
**Locations**:
- `backend/src/middleware/sessionManagement.js` - Line 154: Cleanup every 30 minutes
- `backend/src/config/sessionStore.js` - Line 67: Cleanup every hour  
- `backend/src/services/guestCleanup.service.js` - Cleanup every hour

**Problem**: Redundant database operations running at multiple intervals  
**Cost**: Unnecessary database writes even with no users  
**Fix**: Consolidate into one scheduler

### 🔴 Issue #3: Expensive Health Check Controller
**Location**: `backend/src/controllers/health.controller.js`  
**Problem**: Health check performs these operations on EVERY call (every 30 seconds):
```javascript
// Expensive database operations
await adminDb.ping();           // Database ping
await database.stats();         // Full database stats
await adminDb.serverStatus();   // Server status
```

**Cost**: Each MongoDB operator call = read units consumed  
**Fix**: Use lightweight ping instead of stats

---

## Recommended Fixes (Priority Order)

### ⚡ Fix #1: Disable or Lighten Health Checks (HIGHEST PRIORITY)

**Option A: Use lightweight ping instead** - Edit `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health/ping"]
  interval: 5m              # Changed from 30s to 5 minutes
  timeout: 10s
  retries: 3
  start_period: 10s
```

Also update `Dockerfile`:
```dockerfile
HEALTHCHECK --interval=5m --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health/ping', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

**Option B: Disable Docker health check completely** (if using AWS monitoring):
```yaml
healthcheck:
  disable: true
```

**Impact**: Reduces database queries from 2,880/day to 288/day (83% reduction)

---

### ⚡ Fix #2: Consolidate Cleanup Schedulers

**Action**: Remove duplicate cleanup from `sessionStore.js`

Edit `backend/src/config/sessionStore.js`:
- Remove lines 65-67 (the setInterval)
- Keep only the cleanup function, let `guestCleanup.service.js` handle all cleanups

This prevents duplicate database writes for the same cleanup operations.

---

### ⚡ Fix #3: Lightweight Health Endpoint

Create a new lightweight health check that doesn't query databases:

**Edit `backend/src/controllers/health.controller.js`** - Replace the expensive checks with caching:

```javascript
// Cache health check results to avoid repeated expensive queries
const healthCheckCache = {
  lastCheck: null,
  cachedResult: null,
  cacheDuration: 60000 // Cache for 60 seconds
};

export const checkSystemHealth = async (req, res) => {
  const now = Date.now();
  
  // Return cached result if fresh
  if (healthCheckCache.lastCheck && 
      now - healthCheckCache.lastCheck < healthCheckCache.cacheDuration) {
    return res.json(healthCheckCache.cachedResult);
  }

  try {
    const health = {
      status: 'healthy',
      server: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    // Only do expensive checks occasionally (commented out for now)
    // Uncomment when needed for admin diagnostics
    // const database = getDB();
    // if (database) {
    //   await database.admin().ping();
    //   health.mongodb = 'connected';
    // }

    healthCheckCache.lastCheck = now;
    healthCheckCache.cachedResult = health;
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
};
```

---

### ⚡ Fix #4: Optimize Cleanup Scheduler

**Edit `backend/src/services/guestCleanup.service.js`** - Extend cleanup interval:

```javascript
// Run cleanup every 6 hours instead of hourly (reduces from 4x to 4x per day)
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
```

Or if you're on free tier with minimal data:
```javascript
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // Once daily
```

---

## Expected Cost Reduction

| Issue | Current | Fixed | Reduction |
|-------|---------|-------|-----------|
| Health checks | 2,880/day | 288/day | 90% |
| Cleanup schedulers | 4-8/day | 2-4/day | 50-75% |
| Database operations | ~3,000/day | ~500/day | ~83% |

**Total estimated monthly savings**: 60-75% reduction in idle database cost

---

## Implementation Checklist

- [ ] Fix #1: Update healthcheck interval in `docker-compose.yml` and `Dockerfile`
- [ ] Fix #2: Remove duplicate setInterval from `sessionStore.js`
- [ ] Fix #3: Add caching to `health.controller.js`
- [ ] Fix #4: Extend cleanup interval in `guestCleanup.service.js`
- [ ] Test with `npm start` locally
- [ ] Rebuild Docker images: `docker-compose build`
- [ ] Redeploy to AWS

---

## Additional Cost Optimization Tips

### For AWS T3 Micro:
1. **Stop instance when not in use** - Use AWS Scheduler to start/stop on schedule
2. **Monitor CloudWatch** - Set up alerts for unusual database activity
3. **Upgrade MongoDB tier** - If on free tier, consider pay-as-you-go vs fixed
4. **Enable VPC endpoint** - Reduces data transfer costs to MongoDB Atlas

### General:
1. **Add request caching** - Use Redis/In-memory cache for frequently accessed data
2. **Batch database operations** - Combine multiple queries into single operations
3. **Set query timeouts** - Prevent slow queries from consuming resources
4. **Enable read replicas** - For better load distribution (if applicable)

