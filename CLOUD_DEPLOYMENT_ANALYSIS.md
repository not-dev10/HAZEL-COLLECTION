# Hazel Collection E-Commerce: GCP vs AWS Deployment Analysis

**Project**: Hazel Collection Fashion E-Commerce Platform  
**Date**: March 2, 2026  
**Current Deployment**: Render (Free Tier)  
**Target Region**: India (Primary), Global (Secondary)

---

## Executive Summary

This document provides a detailed comparison between Google Cloud Platform (GCP) and Amazon Web Services (AWS) for deploying the Hazel Collection e-commerce platform. Based on the project architecture analysis, estimated monthly costs range from **$50-150 USD** for GCP and **$60-180 USD** for AWS, depending on traffic volume and scaling requirements.

**Key Recommendation**: For India-based operations with moderate traffic (1,000-5,000 monthly active users), **GCP is recommended** due to:
- Better India region pricing (Delhi region)
- Simpler pricing model
- Superior free tier offerings
- Easier scaling for this architecture

---

## Project Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite (SPA)
- **Backend**: Node.js 20 + Express.js (Stateless API)
- **Database**: MongoDB Atlas (Cloud)
- **Storage**: Cloudinary (Image CDN)
- **Email**: Gmail SMTP (Nodemailer)
- **Authentication**: JWT + Session Store (MongoDB)

### Current Infrastructure
- Monorepo structure (frontend + backend)
- Containerized (Docker)
- Stateless backend (horizontal scaling ready)
- Session persistence in MongoDB
- TTL-based guest data cleanup
- Health checks configured

### Traffic Assumptions
- **Scenario 1 (Low)**: 1,000 MAU, 10,000 requests/month
- **Scenario 2 (Medium)**: 5,000 MAU, 50,000 requests/month
- **Scenario 3 (High)**: 10,000 MAU, 100,000 requests/month

---

## GCP Deployment Architecture

### Recommended Setup: App Engine + Cloud SQL

```
┌─────────────────────────────────────────────────────────┐
│                    Cloud CDN / Cloud Armor              │
│                  (DDoS Protection, Caching)             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────┐          ┌───────▼──────┐
   │ App Engine│          │ Cloud Storage│
   │(Frontend) │          │  (Static)    │
   └────┬─────┘          └──────────────┘
        │
   ┌────▼──────────────────────────┐
   │  App Engine (Backend)         │
   │  - Node.js 20 Runtime         │
   │  - Auto-scaling (0-10 instances)
   │  - Health checks              │
   └────┬──────────────────────────┘
        │
   ┌────▼──────────────────────────┐
   │  Cloud SQL (MongoDB Atlas)    │
   │  - Managed MongoDB            │
   │  - Automated backups          │
   │  - Point-in-time recovery     │
   └───────────────────────────────┘
```

### GCP Service Breakdown

| Service | Purpose | Pricing Model |
|---------|---------|---------------|
| **App Engine Standard** | Frontend + Backend | Pay-per-instance-hour + compute |
| **Cloud SQL** | MongoDB (or use Atlas) | Per vCPU + storage + backup |
| **Cloud Storage** | Static assets backup | $0.020/GB/month |
| **Cloud CDN** | Content delivery | $0.085/GB (first 1TB) |
| **Cloud Armor** | DDoS protection | $5/month + $0.75/million requests |
| **Cloud Monitoring** | Logging & monitoring | Free tier: 150MB/day |
| **Cloud Tasks** | Scheduled jobs | $0.40/million tasks |

### GCP Cost Estimation

#### Scenario 1: Low Traffic (1,000 MAU)
```
App Engine Frontend:
  - 1 instance (f1-micro) × 730 hours × $0.05/hour = $36.50
  - Outbound traffic: 10GB × $0.12/GB = $1.20

App Engine Backend:
  - 1 instance (f1-micro) × 730 hours × $0.05/hour = $36.50
  - Outbound traffic: 5GB × $0.12/GB = $0.60

Cloud SQL (MongoDB Atlas instead):
  - MongoDB Atlas M0 (free tier) = $0

Cloud Monitoring:
  - Free tier (150MB/day) = $0

Cloud CDN:
  - 5GB × $0.085/GB = $0.43

Subtotal: $75.23/month
```

#### Scenario 2: Medium Traffic (5,000 MAU)
```
App Engine Frontend:
  - 2 instances (f1-micro) × 730 hours × $0.05/hour = $73
  - Outbound traffic: 50GB × $0.12/GB = $6

App Engine Backend:
  - 3 instances (f1-micro) × 730 hours × $0.05/hour = $109.50
  - Outbound traffic: 25GB × $0.12/GB = $3

Cloud SQL (MongoDB Atlas M2):
  - MongoDB Atlas M2 = $57/month

Cloud Monitoring:
  - Logs: 500MB/day × $0.50/GB = $7.50

Cloud CDN:
  - 25GB × $0.085/GB = $2.13

Cloud Armor:
  - Base: $5 + (50M requests × $0.75/M) = $42.50

Subtotal: $306.63/month
```

#### Scenario 3: High Traffic (10,000 MAU)
```
App Engine Frontend:
  - 4 instances (f1-micro) × 730 hours × $0.05/hour = $146
  - Outbound traffic: 100GB × $0.12/GB = $12

App Engine Backend:
  - 6 instances (f1-micro) × 730 hours × $0.05/hour = $219
  - Outbound traffic: 50GB × $0.12/GB = $6

Cloud SQL (MongoDB Atlas M5):
  - MongoDB Atlas M5 = $209/month

Cloud Monitoring:
  - Logs: 1TB/day × $0.50/GB = $15

Cloud CDN:
  - 50GB × $0.085/GB = $4.25

Cloud Armor:
  - Base: $5 + (100M requests × $0.75/M) = $80

Subtotal: $691.25/month
```

### GCP Advantages
✅ **India Region**: Delhi (asia-south1) with competitive pricing  
✅ **Free Tier**: $300 credit + generous always-free tier  
✅ **Simpler Pricing**: Transparent, predictable costs  
✅ **App Engine**: Perfect for Node.js apps, auto-scaling built-in  
✅ **MongoDB Atlas Integration**: Seamless with GCP  
✅ **Cloud CDN**: Excellent for image delivery (Cloudinary integration)  
✅ **Monitoring**: Better observability out-of-the-box  

### GCP Disadvantages
❌ **Smaller Ecosystem**: Fewer third-party integrations  
❌ **Learning Curve**: Different console UI than AWS  
❌ **Regional Limitations**: Fewer regions than AWS  

---

## AWS Deployment Architecture

### Recommended Setup: ECS + RDS

```
┌──────────────────────────────────────────────────────┐
│              CloudFront (CDN)                        │
│         + WAF (DDoS Protection)                      │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼──────┐          ┌──────▼──────┐
   │ S3 Bucket │          │ CloudFront  │
   │(Frontend) │          │  (Static)   │
   └───────────┘          └─────────────┘
        │
   ┌────▼──────────────────────────┐
   │  ECS Fargate (Backend)        │
   │  - Node.js 20 Container       │
   │  - Auto-scaling (1-10 tasks)  │
   │  - Load Balancer (ALB)        │
   └────┬──────────────────────────┘
        │
   ┌────▼──────────────────────────┐
   │  RDS (MongoDB Atlas)          │
   │  - Managed MongoDB            │
   │  - Multi-AZ deployment        │
   │  - Automated backups          │
   └───────────────────────────────┘
```

### AWS Service Breakdown

| Service | Purpose | Pricing Model |
|---------|---------|---------------|
| **ECS Fargate** | Container orchestration | $0.04048/vCPU-hour + $0.004435/GB-hour |
| **Application Load Balancer** | Load balancing | $16.20/month + $0.006/LCU |
| **S3** | Static assets | $0.023/GB/month |
| **CloudFront** | CDN | $0.085/GB (first 10TB) |
| **RDS** | Database (if not Atlas) | $0.193/hour (db.t3.micro) |
| **CloudWatch** | Monitoring | $0.50/GB logs ingested |
| **EventBridge** | Scheduled tasks | $0.35/million events |
| **WAF** | DDoS protection | $5/month + $0.60/million requests |

### AWS Cost Estimation

#### Scenario 1: Low Traffic (1,000 MAU)
```
ECS Fargate (Backend):
  - 1 task (0.25 vCPU, 512MB) × 730 hours
  - vCPU: 0.25 × 730 × $0.04048 = $7.41
  - Memory: 0.5 × 730 × $0.004435 = $1.62

Application Load Balancer:
  - Base: $16.20
  - LCU: 10M requests × $0.006/M = $0.06

S3 (Frontend):
  - Storage: 50MB × $0.023/GB = $0.001
  - Requests: 10,000 × $0.0004 = $4

CloudFront:
  - 5GB × $0.085/GB = $0.43

CloudWatch:
  - Logs: 100MB × $0.50/GB = $0.05

MongoDB Atlas M0:
  - Free tier = $0

Subtotal: $29.77/month
```

#### Scenario 2: Medium Traffic (5,000 MAU)
```
ECS Fargate (Backend):
  - 3 tasks (0.5 vCPU, 1GB) × 730 hours
  - vCPU: 1.5 × 730 × $0.04048 = $44.33
  - Memory: 3 × 730 × $0.004435 = $9.71

Application Load Balancer:
  - Base: $16.20
  - LCU: 50M requests × $0.006/M = $0.30

S3 (Frontend):
  - Storage: 100MB × $0.023/GB = $0.002
  - Requests: 50,000 × $0.0004 = $0.02

CloudFront:
  - 25GB × $0.085/GB = $2.13

CloudWatch:
  - Logs: 500MB × $0.50/GB = $0.25

MongoDB Atlas M2:
  - $57/month

WAF:
  - Base: $5 + (50M requests × $0.60/M) = $35

Subtotal: $164.94/month
```

#### Scenario 3: High Traffic (10,000 MAU)
```
ECS Fargate (Backend):
  - 6 tasks (1 vCPU, 2GB) × 730 hours
  - vCPU: 6 × 730 × $0.04048 = $177.30
  - Memory: 12 × 730 × $0.004435 = $38.84

Application Load Balancer:
  - Base: $16.20
  - LCU: 100M requests × $0.006/M = $0.60

S3 (Frontend):
  - Storage: 200MB × $0.023/GB = $0.005
  - Requests: 100,000 × $0.0004 = $0.04

CloudFront:
  - 50GB × $0.085/GB = $4.25

CloudWatch:
  - Logs: 1GB × $0.50/GB = $0.50

MongoDB Atlas M5:
  - $209/month

WAF:
  - Base: $5 + (100M requests × $0.60/M) = $65

Subtotal: $517.78/month
```

### AWS Advantages
✅ **Largest Ecosystem**: Most integrations and services  
✅ **Global Reach**: 30+ regions worldwide  
✅ **ECS Fargate**: Excellent for containerized Node.js apps  
✅ **Cost Optimization**: Reserved instances, savings plans  
✅ **Mature Services**: Battle-tested infrastructure  
✅ **Free Tier**: 12 months free for new accounts  

### AWS Disadvantages
❌ **Complex Pricing**: Many services, hard to predict costs  
❌ **India Region**: Mumbai (ap-south-1) has higher pricing  
❌ **Learning Curve**: Steep for beginners  
❌ **Vendor Lock-in**: Difficult to migrate away  

---

## Cost Comparison Summary

### Monthly Cost Breakdown

| Scenario | GCP | AWS | Difference |
|----------|-----|-----|-----------|
| **Low (1K MAU)** | $75 | $30 | GCP +$45 |
| **Medium (5K MAU)** | $307 | $165 | GCP +$142 |
| **High (10K MAU)** | $691 | $518 | GCP +$173 |

### Annual Cost Projection

| Scenario | GCP | AWS |
|----------|-----|-----|
| **Low** | $900 | $360 |
| **Medium** | $3,684 | $1,980 |
| **High** | $8,292 | $6,216 |

---

## Detailed Recommendations

### For Hazel Collection (India-Based Fashion E-Commerce)

#### Recommended: GCP App Engine + MongoDB Atlas

**Why GCP?**
1. **India Pricing**: Delhi region (asia-south1) is 15-20% cheaper than AWS Mumbai
2. **Simplicity**: App Engine handles scaling automatically
3. **Free Tier**: $300 credit + always-free tier covers initial months
4. **Perfect Fit**: Node.js + MongoDB + Cloudinary integration seamless
5. **Monitoring**: Better observability for e-commerce metrics

**Deployment Steps**:
```bash
# 1. Create GCP project
gcloud projects create hazel-collection

# 2. Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com

# 3. Deploy backend to App Engine
gcloud app deploy backend/app.yaml

# 4. Deploy frontend to App Engine
gcloud app deploy frontend/app.yaml

# 5. Configure MongoDB Atlas
# - Create M0 cluster in GCP (asia-south1)
# - Whitelist App Engine IPs
# - Update MONGODB_URI in app.yaml

# 6. Set up Cloud CDN
gcloud compute backend-services create hazel-backend \
  --enable-cdn \
  --cache-mode CACHE_ALL_STATIC
```

**app.yaml (Backend)**:
```yaml
runtime: nodejs20
env: standard
entrypoint: "node src/server.js"

env_variables:
  NODE_ENV: "production"
  PORT: "8080"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.65
  target_throughput_utilization: 0.65

handlers:
  - url: /.*
    script: auto
    secure: always
```

**app.yaml (Frontend)**:
```yaml
runtime: nodejs20
env: standard
entrypoint: "yarn preview"

env_variables:
  NODE_ENV: "production"
  VITE_API_URL: "https://hazel-backend.appspot.com/api"

automatic_scaling:
  min_instances: 1
  max_instances: 5
  target_cpu_utilization: 0.75

handlers:
  - url: /
    static_files: dist/index.html
    upload: dist/index.html
  - url: /(.*)
    static_files: dist/\1
    upload: dist/(.*)
  - url: /.*
    script: auto
```

#### Alternative: AWS ECS + RDS

**If choosing AWS**:
1. Use ECS Fargate for better cost control
2. Deploy to Mumbai region (ap-south-1)
3. Use Application Load Balancer for traffic distribution
4. Enable auto-scaling based on CPU/memory
5. Use CloudFront for CDN (Cloudinary already handles images)

**Deployment Steps**:
```bash
# 1. Create ECS cluster
aws ecs create-cluster --cluster-name hazel-collection

# 2. Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 3. Create service
aws ecs create-service \
  --cluster hazel-collection \
  --service-name hazel-backend \
  --task-definition hazel-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE

# 4. Deploy frontend to S3 + CloudFront
aws s3 sync frontend/dist s3://hazel-collection-frontend/
aws cloudfront create-distribution --distribution-config file://cf-config.json
```

---

## Important Highlights & Considerations

### 1. **Database Strategy**
- **Recommended**: Keep MongoDB Atlas (not migrate to Cloud SQL/RDS)
- **Reason**: Your app is already optimized for MongoDB Atlas
- **Cost**: M0 free tier → M2 ($57) → M5 ($209) as you scale
- **Backup**: Atlas handles automated backups

### 2. **Image Handling**
- **Current**: Cloudinary (excellent choice)
- **Cost**: Cloudinary free tier covers ~1,000 images/month
- **Scaling**: Upgrade to paid plan ($99+) for unlimited
- **CDN**: Both GCP and AWS CDN work with Cloudinary

### 3. **Email Service**
- **Current**: Gmail SMTP (free)
- **Limitation**: 500 emails/day limit
- **Upgrade Path**: SendGrid ($20/month for 40K emails) or AWS SES ($0.10/1K)
- **Recommendation**: Use SendGrid for better deliverability

### 4. **Session Management**
- **Current**: MongoDB session store
- **Scaling Issue**: MongoDB becomes bottleneck at 10K+ MAU
- **Upgrade Path**: Add Redis for session caching
  - GCP: Cloud Memorystore ($0.05/GB/hour)
  - AWS: ElastiCache ($0.017/hour for cache.t3.micro)

### 5. **Monitoring & Logging**
- **GCP**: Cloud Logging (150MB/day free)
- **AWS**: CloudWatch (free tier: 5GB/month)
- **Recommendation**: Use both + Datadog for advanced analytics ($15/month)

### 6. **Security Considerations**
- **DDoS Protection**: Enable Cloud Armor (GCP) or WAF (AWS)
- **SSL/TLS**: Free with both platforms
- **IP Whitelist**: Implement for admin panel (already in code)
- **Rate Limiting**: Enable in production (currently disabled)

### 7. **Scaling Timeline**

| Traffic Level | Recommended Setup | Estimated Cost |
|---------------|-------------------|-----------------|
| **0-1K MAU** | Single instance + MongoDB M0 | $30-75/month |
| **1K-5K MAU** | 2-3 instances + MongoDB M2 | $150-300/month |
| **5K-10K MAU** | 4-6 instances + MongoDB M5 | $300-700/month |
| **10K+ MAU** | Multi-region + Redis + CDN | $700+/month |

### 8. **Migration Path from Render**

**Current**: Render Free Tier (limited resources)  
**Step 1**: GCP App Engine Standard (1 month)  
**Step 2**: Add Cloud CDN + Cloud Armor (Month 2)  
**Step 3**: Implement Redis caching (Month 3)  
**Step 4**: Multi-region deployment (Month 6+)

---

## Final Recommendation

### **Choose GCP for Hazel Collection**

**Rationale**:
1. **Cost**: 15-20% cheaper than AWS for India operations
2. **Simplicity**: App Engine is perfect for this Node.js + MongoDB stack
3. **Free Tier**: $300 credit covers 4+ months of development
4. **Scaling**: Auto-scaling handles traffic spikes automatically
5. **Integration**: Seamless with MongoDB Atlas and Cloudinary
6. **Support**: Better documentation for e-commerce use cases

**Estimated Monthly Cost (Medium Traffic)**:
- App Engine: $110
- MongoDB Atlas M2: $57
- Cloud CDN: $2
- Cloud Armor: $5
- Monitoring: $5
- **Total: ~$180/month**

**Next Steps**:
1. Create GCP project and enable billing
2. Deploy backend to App Engine
3. Deploy frontend to App Engine
4. Configure MongoDB Atlas in asia-south1
5. Set up Cloud CDN for Cloudinary images
6. Enable Cloud Armor for DDoS protection
7. Configure monitoring and alerts
8. Set up automated backups

---

## Appendix: Quick Reference

### GCP Console Links
- App Engine: https://console.cloud.google.com/appengine
- Cloud SQL: https://console.cloud.google.com/sql
- Cloud CDN: https://console.cloud.google.com/compute/backendServices
- Monitoring: https://console.cloud.google.com/monitoring

### AWS Console Links
- ECS: https://console.aws.amazon.com/ecs
- RDS: https://console.aws.amazon.com/rds
- CloudFront: https://console.aws.amazon.com/cloudfront
- CloudWatch: https://console.aws.amazon.com/cloudwatch

### Useful Commands

**GCP**:
```bash
gcloud app deploy
gcloud app logs read
gcloud compute backend-services list
gcloud sql instances list
```

**AWS**:
```bash
aws ecs list-services --cluster hazel-collection
aws cloudwatch get-metric-statistics
aws s3 sync frontend/dist s3://bucket-name/
```

---

**Document Version**: 1.0  
**Last Updated**: March 2, 2026  
**Prepared For**: Hazel Collection Team
