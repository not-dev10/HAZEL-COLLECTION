# EC2 Capacity Test Script - Quick Run Guide

**EC2 IP**: `13.63.199.225:5000`

## One-Command Setup & Run

```bash
# 1. SSH into your EC2
ssh -i "your-key.pem" ec2-user@13.63.199.225

# 2. Install k6
sudo yum install -y k6

# 3. Pull latest code from GitHub (if you want the test file from repo)
cd ~/HAZEL-COLLECTION
git pull origin main

# 4. Run the test
k6 run backend/tests/ec2-capacity-test.js

# 5. Or save results to JSON
k6 run backend/tests/ec2-capacity-test.js -o json=results.json

# 6. View results
cat results.json | grep http_req_duration
```

## What This Test Does

- **Ramps up** from 10 → 50 concurrent users over 3 minutes
- **Holds** at 50 users for 2 minutes
- **Ramps down** to 0 over 1 minute
- **Tests**: Product listing, product details, search, cart, health check
- **Duration**: ~6 minutes total
- **Endpoints tested**:
  - `GET /api/products` - Product listing
  - `GET /api/products/:id` - Product details
  - `GET /api/products?search=...` - Search
  - `POST /api/cart/add` - Add to cart
  - `GET /health` - Health check

## Expected Output Format

```
   ✓ status 200
   ✓ response time < 300ms
   ✓ has products

     checks.........................: 95.2% ✓ 3200 ✗ 154
     data_received..................: 12 MB
     data_sent.......................: 850 kB
     http_req_blocked................: avg=4.2ms   min=0ms    max=45ms   p(95)=8ms
     http_req_duration...............: avg=145ms   min=20ms   max=2500ms p(95)=320ms ⭐ KEY METRIC
     http_req_failed.................: 2.1%
     http_req_tls_handshaking........: avg=0ms     min=0ms    max=0ms    p(95)=0ms
     http_requests...................: 3354
     iteration_duration..............: avg=6.2s    min=6s     max=8.5s   p(95)=6.8s
     vus............................... 50
     vus_max........................... 50
```

## Key Metrics to Watch

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| **p95 response time** | <300ms | 300-800ms | >1000ms |
| **http_req_failed** | 0% | <1% | >5% |
| **http_req_duration max** | <2000ms | 2-5s | >5s |
| **vus achieved** | 50 | 40-50 | <40 |

## Run in Background (Doesn't block terminal)

```bash
# Option 1: nohup (simple)
nohup k6 run backend/tests/ec2-capacity-test.js -o json=ec2-test-$(date +%s).json > test-output.log 2>&1 &

# Check progress
tail -f test-output.log

# Option 2: tmux (advanced)
tmux new -d -s k6
tmux send-keys -t k6 "cd ~/HAZEL-COLLECTION && k6 run backend/tests/ec2-capacity-test.js -o json=results.json" Enter

# View progress
tmux attach -t k6

# Detach: Ctrl+B then D
```

## Getting Results from EC2 to Your Laptop

After test completes:

```bash
# Copy results from EC2 to your laptop (from your laptop terminal)
scp -i "your-key.pem" ec2-user@13.63.199.225:~/HAZEL-COLLECTION/results.json ./

# View locally
cat results.json | grep -E "http_req_duration|http_req_failed|http_requests"
```

## Troubleshooting

### Connection Refused
```
Error: connection refused
```
**Fix**: Check backend is running on EC2
```bash
ssh -i "key.pem" ec2-user@13.63.199.225
pm2 list  # Should show backend running
curl http://localhost:5000/api/products
```

### Timeout
```
Error: request timeout
```
**Fix**: Reduce concurrent users
```bash
k6 run backend/tests/ec2-capacity-test.js --vus 20 --duration 3m
```

### Out of Memory
```
Error: fatal error: out of memory
```
**Fix**: The test EC2 instance is too small. Use a larger instance or reduce VUs.

## File Location on EC2

After you pull the repo, the test file is at:
```
~/HAZEL-COLLECTION/backend/tests/ec2-capacity-test.js
```

---

**Created**: March 23, 2026
**For**: EC2 IP: 13.63.199.225:5000
**Status**: Ready to run
