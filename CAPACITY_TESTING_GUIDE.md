# User Capacity Testing Guide

## Quick Start (5 minutes)

If you just want to test quickly without setup:

```bash
# Install k6 (simplest tool)
npm install -g k6

# Run pre-made test
k6 run capacity-test.js

# Watch real-time results
```

---

## Part 1: Testing Tools Comparison

| Tool | Ease | Features | Best For | Cost |
|------|------|----------|----------|------|
| **k6** | ⭐⭐ Easy | Real-time, scripting | Quick tests | Free |
| **Artillery** | ⭐⭐ Easy | Config-based, reports | Load testing | Free |
| **Apache JMeter** | ⭐⭐⭐ Medium | GUI, detailed metrics | Complex tests | Free |
| **Locust** | ⭐⭐⭐ Medium | Python-based, distributed | Large scale | Free |
| **Vegeta** | ⭐ Very Easy | CLI tool | Simple HTTP | Free |

### Recommended: **k6** (easiest, best results for this project)

---

## Part 2: Setting Up k6 Load Testing

### Step 1: Install k6

```bash
# Windows (via Chocolatey)
choco install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

### Step 2: Create Test Script

**File**: `backend/tests/capacity-test.js`

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Define test scenarios
export const options = {
  vus: 50,                    // Virtual users (concurrent)
  duration: '3m',             // Test duration
  ramp: true,
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 30 },    // Ramp up to 30 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
  ],
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  group('Product Listing', () => {
    const res = http.get(`${BASE_URL}/api/products`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  group('Single Product', () => {
    const res = http.get(`${BASE_URL}/api/products/507f1f77bcf86cd799439011`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Search', () => {
    const res = http.get(`${BASE_URL}/api/products?search=shirt`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  });

  sleep(1); // Think time between requests
}
```

### Step 3: Run the Test

```bash
# Navigate to backend directory
cd backend

# Run test
k6 run tests/capacity-test.js

# Or with more detail
k6 run --vus 100 --duration 5m tests/capacity-test.js
```

### Step 4: Interpret Results

Expected output:

```
data_received..................: 500 kB
data_sent.......................: 250 kB
dropped_iterations.............: 50
http_req_blocked................: avg=12ms   min=0ms    max=250ms  p(95)=25ms
http_req_connecting.............: avg=5ms    min=0ms    max=100ms  p(95)=10ms
http_req_duration...............: avg=150ms  min=50ms   max=2000ms p(95)=300ms ⭐ WATCH THIS
http_req_failed.................: 0.00%
http_req_receiving.............: avg=30ms   min=0ms    max=200ms  p(95)=50ms
http_req_sending................: avg=10ms   min=0ms    max=50ms   p(95)=20ms
http_req_tls_handshaking........: avg=0ms    min=0ms    max=0ms    p(95)=0ms
http_req_waiting................: avg=100ms  min=40ms   max=1900ms p(95)=250ms
http_requests...................: 15000
iteration_duration..............: avg=4.2s   min=4s     max=6s     p(95)=4.5s
iterations.......................: 3000
vus............................... 100
```

**Key metrics to watch**:
- ✅ **http_req_failed**: Should be 0% (0 errors)
- ✅ **http_req_duration p(95)**: Should be <500ms for good experience
- 🟡 **http_req_duration max**: Occasional spikes OK, but >2000ms bad
- 🟢 **dropped_iterations**: Should be 0 (no traffic dropped)

---

## Part 3: Advanced Load Test Scenarios

### Scenario 1: Gradual Ramp-Up (Find Breaking Point)

**File**: `backend/tests/ramp-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },    // 10 users
    { duration: '2m', target: 20 },    // 20 users
    { duration: '2m', target: 30 },    // 30 users
    { duration: '2m', target: 50 },    // 50 users
    { duration: '2m', target: 75 },    // 75 users
    { duration: '2m', target: 100 },   // 100 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

Run:
```bash
k6 run tests/ramp-test.js --summary-trend-stats='avg,p(50),p(90),p(95),p(99),max' | tee ramp-results.txt
```

**What to look for**: At what user count do errors start appearing or response time spike?

### Scenario 2: Spike Test (Sudden Traffic)

**File**: `backend/tests/spike-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Baseline
    { duration: '1s', target: 100 },   // SPIKE!
    { duration: '10s', target: 100 },  // Hold spike
    { duration: '5s', target: 10 },    // Return to baseline
  ],
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

**What to test**: Can system handle sudden traffic spikes without crashing?

### Scenario 3: Realistic User Behavior

**File**: `backend/tests/realistic-test.js`

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  vus: 50,
  duration: '5m',
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Simulate realistic user journey
  
  // 1. Browse products (80% of users do this)
  if (Math.random() < 0.8) {
    group('Browse', () => {
      http.get(`${BASE_URL}/api/products?page=1`);
      sleep(2);
      http.get(`${BASE_URL}/api/products?page=2`);
      sleep(2);
    });
  }

  // 2. View product details (50% of browse)
  if (Math.random() < 0.5) {
    group('View Product', () => {
      http.get(`${BASE_URL}/api/products/507f1f77bcf86cd799439011`);
      sleep(3);
    });
  }

  // 3. Add to cart (20% of viewers)
  if (Math.random() < 0.2) {
    group('Add to Cart', () => {
      const res = http.post(
        `${BASE_URL}/api/cart/add`,
        JSON.stringify({
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      check(res, { 'added to cart': (r) => r.status === 200 });
      sleep(1);
    });
  }

  // 4. Checkout (5% of cart users)
  if (Math.random() < 0.05) {
    group('Checkout', () => {
      http.post(
        `${BASE_URL}/api/orders/create`,
        JSON.stringify({
          items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1 }],
          shipping: { address: '123 Main St' },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      sleep(2);
    });
  }

  sleep(1); // Between user sessions
}
```

---

## Part 4: Monitoring During Load Test

### Method 1: Watch Server Metrics (Real-time)

**Terminal 1** - Run load test:
```bash
k6 run tests/capacity-test.js
```

**Terminal 2** - Watch server metrics:
```bash
# Watch Node.js process
pm2 monit

# Or in another terminal, monitor system
watch -n 1 'top -b -n 1 | head -20'
```

**What to monitor**:
- CPU usage: Should stay <80%
- Memory: Should stay stable (not constantly growing)
- Node.js process threads: Should not exceed available cores

### Method 2: Server Logs

```bash
# In another terminal, watch logs
pm2 logs backend --lines 100 --err
```

**Watch for**:
- Database connection errors
- Timeout errors
- Memory warnings

### Method 3: Database Monitoring

```bash
# Connect to MongoDB Atlas and check:
# 1. Active connections
# 2. Query performance
# 3. Slow queries
```

---

## Part 5: Complete Testing Procedure

### Step 1: Baseline Test (No Load)

```bash
# Test with 1-2 users to establish baseline
k6 run --vus 2 --duration 30s tests/capacity-test.js

# Expected: Very fast response, <100ms p95
```

### Step 2: Light Load (10% Capacity)

```bash
# Test with 10 concurrent users (your t3.micro baseline ~15 req/sec)
k6 run --vus 10 --duration 2m tests/capacity-test.js

# Expected: <200ms p95 response time, 0% errors
```

### Step 3: Medium Load (50% Capacity)

```bash
# Test with 25-30 concurrent users
k6 run --vus 30 --duration 3m tests/capacity-test.js

# Expected: <300ms p95, maybe 0-1% errors
```

### Step 4: High Load (90% Capacity)

```bash
# Test with 50+ concurrent users
k6 run --vus 50 --duration 3m tests/capacity-test.js

# Watch for: When do errors start? Response time spike?
```

### Step 5: Breaking Point

```bash
# Gradually increase until system breaks
k6 run --vus 75 --duration 5m tests/capacity-test.js
k6 run --vus 100 --duration 5m tests/capacity-test.js
k6 run --vus 150 --duration 5m tests/capacity-test.js

# Document: At what point did it start failing?
```

---

## Part 6: Quick Tests with Artillery

### Setup

```bash
npm install -g artillery
```

### Create Config

**File**: `artillery-config.yml`

```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 5  # 5 requests per second
      name: 'Warm up'
    - duration: 120
      arrivalRate: 20 # 20 requests per second
      name: 'Ramp up'
    - duration: 120
      arrivalRate: 50 # 50 requests per second
      name: 'Spike'

scenarios:
  - name: 'Load Test'
    flow:
      - get:
          url: '/api/products'
      - get:
          url: '/api/products/507f1f77bcf86cd799439011'
      - think: 2
```

### Run

```bash
artillery run artillery-config.yml
```

---

## Part 7: Quick Tests with Simple curl Loop

### Bash Script (Linux/Mac)

**File**: `load-test.sh`

```bash
#!/bin/bash

ENDPOINT="http://localhost:5000/api/products"
USERS=${1:-10}
DURATION=${2:-60}

echo "Starting load test: $USERS concurrent users for $DURATION seconds"
echo "Endpoint: $ENDPOINT"

END=$((SECONDS + DURATION))

while [ $SECONDS -lt $END ]; do
  for ((i=1; i<=USERS; i++)); do
    curl -s -o /dev/null -w "User $i: %{http_code} (Time: %{time_total}s)\n" "$ENDPOINT" &
  done
  sleep 1
done

wait
echo "Load test complete"
```

Run:
```bash
chmod +x load-test.sh
./load-test.sh 50 120  # 50 users for 120 seconds
```

### PowerShell Script (Windows)

**File**: `load-test.ps1`

```powershell
param(
  [int]$Users = 10,
  [int]$Duration = 60
)

$Endpoint = "http://localhost:5000/api/products"
$EndTime = (Get-Date).AddSeconds($Duration)
$Results = @()

Write-Host "Starting load test: $Users concurrent users for $Duration seconds"

while ((Get-Date) -lt $EndTime) {
  for ($i = 1; $i -le $Users; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
      $response = Invoke-WebRequest -Uri $Endpoint -UseBasicParsing
      $sw.Stop()
      Write-Host "User $i: $($response.StatusCode) (Time: $($sw.ElapsedMilliseconds)ms)"
      $Results += $sw.ElapsedMilliseconds
    } catch {
      $sw.Stop()
      Write-Host "User $i: ERROR (Time: $($sw.ElapsedMilliseconds)ms)" -ForegroundColor Red
    }
  }
  Start-Sleep -Milliseconds 500
}

$AvgTime = [Math]::Round(($Results | Measure-Object -Average).Average, 2)
$MaxTime = [Math]::Round(($Results | Measure-Object -Maximum).Maximum, 2)
Write-Host "`nResults: Avg: $($AvgTime)ms, Max: $($MaxTime)ms, Requests: $($Results.Count)"
```

Run:
```powershell
.\load-test.ps1 -Users 50 -Duration 120
```

---

## Part 8: Monitoring Tools

### Option 1: PM2 Monitoring (Simple)

```bash
# Already installed with your backend

# Watch real-time
pm2 monit

# Get stats
pm2 logs backend --lines 50
```

### Option 2: Performance Labs (Free Online)

1. Go to https://loader.io
2. Create free account
3. Add your API endpoint
4. Run load tests from cloud

### Option 3: New Relic / Datadog (Paid, but detailed)

- Provides real-time monitoring
- Tracks database performance
- Identifies slow endpoints

---

## Part 9: Test Checklist

Before running tests:

```
PRE-TEST CHECKLIST:
☐ Backend is running (pm2 list)
☐ Database is running and connected
☐ No other tests running concurrently
☐ Server CPU/Memory baseline is low
☐ No background jobs running

DURING TEST:
☐ Monitor CPU usage
☐ Monitor Memory usage
☐ Watch error rates
☐ Note when response time spikes
☐ Check database connections
☐ Observe PM2 logs

POST-TEST:
☐ Document results
☐ Note any errors
☐ Compare with previous runs
☐ Identify bottlenecks
☐ Plan optimizations
```

---

## Part 10: Interpreting Results

### Good Performance ✅

```
http_req_duration p(95): < 300ms
http_req_failed: 0%
http_req_duration max: < 2000ms
dropped_iterations: 0
```

### Warning Signs ⚠️

```
http_req_duration p(95): 300-800ms
http_req_failed: < 1%
http_req_duration max: 2000-5000ms
Server CPU: 60-80%
```

### Poor Performance ❌

```
http_req_duration p(95): > 1000ms
http_req_failed: > 1%
http_req_duration max: > 5000ms
Server CPU: > 80%
Memory growing continuously
Errors in logs
```

---

## Part 11: Example Test Results & Interpretation

### Result from t3.micro with 30 concurrent users:

```
RESULT AT 30 USERS:
http_req_duration p(95): 450ms
http_req_failed: 0.2%
http_req_duration max: 8000ms

INTERPRETATION:
✅ Could handle 30 users
⚠️ Some requests near timeout (450ms p95)
❌ Some failed requests (0.2%)
❌ Max time very high (8000ms)

VERDICT: Barely holding at 30 users
NEXT STEP: Reduce to 20 users or optimize queries
```

### Result from t3.micro at 50 concurrent users:

```
RESULT AT 50 USERS:
http_req_duration p(95): 1200ms
http_req_failed: 5.3%
http_req_duration max: 15000ms
Errors: "ECONNREFUSED" and timeouts

INTERPRETATION:
❌ System overwhelmed
❌ High error rate (5.3%)
❌ Response time unacceptable
❌ Connection pool exhausted
❌ CPU credits depleted

VERDICT: FAILED - System cannot handle 50 concurrent users
NEXT STEP: Upgrade instance or implement optimizations
```

---

## Part 12: Quick Test Commands Reference

```bash
# BASELINE TEST (Fast)
k6 run --vus 10 --duration 1m tests/capacity-test.js

# RAMP TEST (Find breaking point)
k6 run tests/ramp-test.js --summary-trend-stats='avg,p(95),p(99),max'

# SPIKE TEST (Sudden traffic)
k6 run tests/spike-test.js

# REALISTIC TEST (Normal user behavior)
k6 run tests/realistic-test.js

# EXTENDED TEST (30 minutes)
k6 run --vus 50 --duration 30m tests/capacity-test.js

# Save results to JSON
k6 run -o json=results.json tests/capacity-test.js

# Compare with previous results
k6 run -o json=results-new.json tests/capacity-test.js
# Then compare results-old.json vs results-new.json
```

---

## Next Steps After Testing

1. **Document Results**: Save all test files and results
2. **Identify Bottleneck**: Is it CPU, Memory, or Database?
3. **Optimize**: 
   - CPU issue? → Upgrade instance or add query pipelining
   - Memory issue? → Add Redis for sessions
   - Database issue? → Fix N+1 queries, add indexes
4. **Re-test**: Verify improvements

---

**Quick Start Command** (Copy & Paste):

```bash
# 1. Install k6
choco install k6

# 2. Create test file (copy the content above into backend/tests/capacity-test.js)

# 3. Start your server
pm2 start backend/src/server.js

# 4. Run test
cd backend && k6 run --vus 30 --duration 3m tests/capacity-test.js

# 5. Watch results
```

---

**Document Created**: March 23, 2026
**For**: HAZEL-COLLECTION Backend Capacity Testing
**Status**: Ready to implement
