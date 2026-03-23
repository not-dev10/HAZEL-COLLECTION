# Testing Backend Capacity from EC2

## Overview

Testing from EC2 is better than testing locally because:
- ✅ Simulates real user geographic location
- ✅ Tests actual network latency
- ✅ Doesn't consume your local bandwidth
- ✅ More realistic server behavior
- ✅ Can run 24/7 without your laptop

---

## Part 1: Setup k6 on EC2

### Step 1: SSH into Your EC2 Instance

```bash
# Windows PowerShell
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

# Or if using key in .ssh folder
ssh -i $env:USERPROFILE\.ssh\your-key.pem ec2-user@YOUR_EC2_IP
```

### Step 2: Install k6 on EC2

```bash
# For Amazon Linux or RHEL
sudo yum update -y
sudo yum install -y k6

# For Ubuntu
sudo apt-get update
sudo apt-get install -y k6

# Verify installation
k6 version
```

### Step 3: Create Test File on EC2

```bash
# SSH into EC2 first, then:

# Create directory
mkdir -p ~/tests

# Create test file
cat > ~/tests/capacity-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 50 },
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

  sleep(1);
}
EOF
```

---

## Part 2: Test Scenarios for EC2

### Scenario 1: Local Testing (Backend on same EC2)

**Best for**: Single server capacity testing

```bash
# SSH into EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

# Run test against local backend
k6 run ~/tests/capacity-test.js

# Or use 127.0.0.1
# Results will show backend + database performance
```

### Scenario 2: Remote Testing (Backend on one EC2, Test on another)

**Best for**: Network latency simulation

**Setup**:
1. Backend EC2: `10.0.1.100:5000`
2. Load Test EC2: `10.0.2.200`

```bash
# SSH into test EC2
ssh -i "your-key.pem" ec2-user@LOADTEST_EC2_IP

# Create test with backend IP
cat > ~/tests/remote-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 50 },
  ],
};

const BASE_URL = 'http://10.0.1.100:5000';  // Backend EC2 IP

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status 200': (r) => r.status === 200,
  });
  sleep(1);
}
EOF

# Run test
k6 run ~/tests/remote-test.js
```

### Scenario 3: Testing from Outside AWS

**Best for**: Testing from internet (simulates real users)

```bash
# From your laptop, test against EC2 public IP
k6 run --vus 30 --duration 3m --script ~/tests/capacity-test.js
```

But modify the URL:

```javascript
const BASE_URL = 'http://YOUR_EC2_PUBLIC_IP:5000';
```

---

## Part 3: Running Tests on EC2 in Background

### Method 1: Using tmux (Recommended)

```bash
# SSH into EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

# Install tmux
sudo yum install -y tmux  # Amazon Linux
# or
sudo apt-get install -y tmux  # Ubuntu

# Create new session
tmux new-session -d -s k6test

# Run test in background
tmux send-keys -t k6test "k6 run ~/tests/capacity-test.js --out json=results.json" Enter

# Attach to view progress
tmux attach -t k6test

# Detach: Ctrl+B then D
# Kill: tmux kill-session -t k6test
```

### Method 2: Using nohup (Simple)

```bash
# Run test in background
nohup k6 run ~/tests/capacity-test.js --out json=results.json > k6-output.log 2>&1 &

# Check progress
tail -f k6-output.log

# Get results
cat results.json | grep summary
```

### Method 3: Using screen

```bash
# Create screen session
screen -S k6test

# Run test
k6 run ~/tests/capacity-test.js --out json=results.json

# Detach: Ctrl+A then D
# Re-attach: screen -r k6test
```

---

## Part 4: Advanced EC2 Testing Setup

### Multiple Load Tests from Different Regions

**Create distributed test:**

```javascript
// ~/tests/distributed-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['<5%'],
  },
};

export function setup() {
  console.log('Starting capacity test from', `__ENV.REGION || 'EC2'`);
}

export default function () {
  const res = http.get(__ENV.BASE_URL || 'http://localhost:5000/api/products');
  
  check(res, {
    'status 200': (r) => r.status === 200,
    'response < 500ms': (r) => r.timings.duration < 500,
    'has content': (r) => r.body.length > 0,
  });
  
  sleep(Math.random() * 3);
}

export function teardown(data) {
  console.log('Test complete');
}
```

Run with environment variables:

```bash
# From EC2 in us-east-1
k6 run --env REGION='us-east-1' --env BASE_URL='http://10.0.1.100:5000/api/products' ~/tests/distributed-test.js

# From EC2 in us-west-2
k6 run --env REGION='us-west-2' --env BASE_URL='http://10.0.1.100:5000/api/products' ~/tests/distributed-test.js
```

---

## Part 5: Monitor EC2 During Tests

### Terminal 1: Run Test

```bash
k6 run ~/tests/capacity-test.js
```

### Terminal 2: Monitor Backend Server

```bash
# SSH into backend EC2 in new terminal
ssh -i "your-key.pem" ec2-user@BACKEND_EC2_IP

# Option A: Watch top (CPU/Memory)
top -p $(pgrep -f "node server.js")

# Option B: Watch PM2
pm2 monit

# Option C: Watch logs
pm2 logs backend
```

### Terminal 3: Monitor Database

```bash
# Check MongoDB Atlas connection count
# 1. Log into MongoDB Atlas console
# 2. Go to Metrics → Connection Count
# 3. Watch it spike during test

# Or from EC2:
# Monitor network connections
watch -n 1 'netstat -an | grep :27017 | wc -l'
```

---

## Part 6: Save and Export Results

### Save to JSON

```bash
# Run and save results
k6 run ~/tests/capacity-test.js --out json=results-$(date +%Y%m%d_%H%M%S).json

# View results
cat results.json | head -100
```

### Send Results to Influxdb (Advanced)

```bash
# Install InfluxDB on EC2
sudo yum install -y influxdb

# Start InfluxDB
sudo systemctl start influxdb

# Run k6 with InfluxDB output
k6 run ~/tests/capacity-test.js -o influxdb=http://localhost:8086/k6
```

### Export CSV

```bash
# Convert JSON to CSV (requires jq)
sudo yum install -y jq

# Extract metrics
cat results.json | jq -r '.metrics | keys[]' > metrics.txt
```

---

## Part 7: Scripted Testing Schedule

### Create Test Script (runs tests regularly)

```bash
# ~/run-capacity-tests.sh
#!/bin/bash

echo "Starting daily capacity tests..."

# Run at different times
k6 run --vus 20 --duration 5m ~/tests/capacity-test.js -o json=results-light-$(date +%s).json
sleep 300

k6 run --vus 50 --duration 5m ~/tests/capacity-test.js -o json=results-medium-$(date +%s).json
sleep 300

k6 run --vus 75 --duration 3m ~/tests/capacity-test.js -o json=results-heavy-$(date +%s).json

echo "Tests complete. Results saved."
```

```bash
# Make executable
chmod +x ~/run-capacity-tests.sh

# Add to crontab (run daily at 2 AM UTC)
crontab -e

# Add this line:
0 2 * * * /home/ec2-user/run-capacity-tests.sh >> /home/ec2-user/test-logs.txt 2>&1
```

---

## Part 8: Quick Command Reference for EC2

```bash
# ===== SETUP =====
ssh -i "key.pem" ec2-user@EC2_IP
sudo yum install -y k6
mkdir -p ~/tests

# ===== CREATE TEST =====
cat > ~/tests/test.js << 'EOF'
...script...
EOF

# ===== RUN TESTS =====

# Test 1: Basic (5 users, 1 minute)
k6 run ~/tests/capacity-test.js --vus 5 --duration 1m

# Test 2: Ramp up (10→50 users)
k6 run ~/tests/ramp-test.js

# Test 3: Background (save results, don't block)
nohup k6 run ~/tests/capacity-test.js -o json=results.json > output.log 2>&1 &

# Test 4: Environment variable
k6 run --env BASE_URL='http://10.0.1.100:5000' ~/tests/test.js

# ===== VIEW RESULTS =====
tail -f output.log
cat results.json | grep summary
ps aux | grep k6

# ===== STOP TEST =====
pkill -f "k6 run"
```

---

## Part 9: EC2 to EC2 Testing (Private Network)

### Best Setup for Your Infrastructure

**Scenario**: Backend on EC2 (10.0.1.100), Load test from separate EC2 (10.0.2.200)

### Step 1: Configure Security Groups

**Backend EC2 Security Group**:
```
Inbound Rule:
Type: Custom TCP
Port: 5000
Source: 10.0.2.0/24 (or Load Test EC2 IP)
```

**Load Test EC2 Security Group**:
```
Outbound Rule:
Type: Custom TCP
Port: 5000
Destination: 10.0.1.0/24 (or Backend EC2 IP)
```

### Step 2: Test Backend Connectivity

```bash
# From Load Test EC2
telnet 10.0.1.100 5000

# Or
curl -v http://10.0.1.100:5000/api/products
```

### Step 3: Run k6 Test

```bash
# Create test file
cat > ~/tests/internal-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 75 },
    { duration: '1m', target: 0 },
  ],
};

// Use internal IP for faster, more realistic testing
const BASE_URL = 'http://10.0.1.100:5000';

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'response < 300ms': (r) => r.timings.duration < 300,
  });
  sleep(1);
}
EOF

# Run test
k6 run ~/tests/internal-test.js
```

---

## Part 10: Troubleshooting EC2 Tests

### Connection Refused Error

```
Error: connection refused
```

**Fix**:
```bash
# 1. Check backend is running
ssh ec2-user@BACKEND_IP
pm2 list

# 2. Check port is open
netstat -an | grep 5000

# 3. Check security group allows traffic
# AWS Console → EC2 → Security Groups → Edit Inbound Rules
```

### Timeout Errors

```
Error: request timeout
```

**Fix**:
```bash
# 1. Reduce concurrent users
k6 run --vus 10 ~/tests/test.js

# 2. Check network latency
ping 10.0.1.100

# 3. Check backend CPU
ssh ec2-user@BACKEND_IP
top
```

### Out of Memory on Load Test EC2

```
Error: fatal runtime error: out of memory
```

**Fix**:
```bash
# Use smaller VUs
k6 run --vus 20 ~/tests/test.js

# Or upgrade EC2 instance type (t3.small → t3.medium)
```

---

## Part 11: Complete Testing Workflow

### Step 1: Prepare Backend EC2

```bash
# SSH into backend
ssh -i "key.pem" ec2-user@BACKEND_IP

# Ensure backend is running
pm2 list
pm2 start backend/src/server.js

# Check it's responding
curl http://localhost:5000/api/products

# Get internal IP
hostname -I
# Note: 10.0.1.100 (example)
```

### Step 2: Prepare Test EC2

```bash
# SSH into test EC2
ssh -i "key.pem" ec2-user@TEST_EC2_IP

# Install k6
sudo yum install -y k6

# Create test file (use backend internal IP)
cat > ~/tests/test.js << 'EOF'
...see examples above...
const BASE_URL = 'http://10.0.1.100:5000';
EOF

# Test connectivity
curl http://10.0.1.100:5000/api/products
```

### Step 3: Run Test

```bash
# Terminal 1: Start test
tmux new -d -s test
tmux send-keys -t test "k6 run ~/tests/test.js -o json=results.json" Enter

# Terminal 2: Monitor backend
ssh -i "key.pem" ec2-user@BACKEND_IP
pm2 monit

# Terminal 3: Watch output
tmux attach -t test
```

### Step 4: Analyze Results

```bash
# After test completes
cat results.json | grep summary

# Or pretty print
cat results.json | jq '.' | head -100
```

---

## Part 12: Quick Start (Copy & Paste)

```bash
# 1. SSH into EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

# 2. Install k6
sudo yum install -y k6

# 3. Create test
mkdir -p ~/tests
cat > ~/tests/test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:5000/api/products');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

# 4. Run test
k6 run ~/tests/test.js

# 5. Save results
k6 run ~/tests/test.js -o json=results.json

# 6. View results
cat results.json | grep http_req_duration
```

---

**Document Created**: March 23, 2026
**For**: EC2-based capacity testing
**Status**: Ready to implement
