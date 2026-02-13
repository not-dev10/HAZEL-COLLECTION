# Docker Setup Guide

Complete Docker setup for DIdi Fashion monorepo (Backend + Frontend).

## Prerequisites

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)
- Environment variables configured (see `.env.docker.example`)

## Quick Start

### 1. Prepare Environment Variables

```bash
# Copy the example env file
cp .env.docker.example .env.docker

# Edit with your actual values
nano .env.docker  # or use your preferred editor
```

**Required variables** (must be set before running):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `REFRESH_TOKEN_SECRET` - Refresh token secret (min 32 chars)
- `ENCRYPTION_KEY` - Encryption key (min 32 chars)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_USER`, `SMTP_PASS` - Gmail credentials
- `FRONTEND_URL` - Your domain or http://localhost:8080

### 2. Build Docker Images

```bash
# Build both backend and frontend images
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

### 3. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# Or start in foreground to see logs
docker-compose up
```

### 4. Verify Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f            # All logs

# Test health
curl http://localhost:5000/api/health
curl http://localhost:8080
```

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data!)
docker-compose down -v
```

## Configuration

### Environment Variables

Create `.env.docker` file in the root directory with your configuration:

```bash
# Copy template
cp .env.docker.example .env.docker

# Edit configuration
# - Set MONGODB_URI to your Atlas connection string
# - Set FRONTEND_URL to your domain (http://localhost:8080 for local)
# - Set Cloudinary credentials
# - Set SMTP credentials for Gmail
# - Set security secrets (min 32 characters each)
```

### Using Local MongoDB

To use MongoDB in Docker instead of MongoDB Atlas:

1. Uncomment the `mongodb` service in `docker-compose.yml`
2. Set `MONGODB_URI=mongodb://admin:password@mongodb:27017/didi_fashion?authSource=admin`
3. Set MongoDB credentials in `.env.docker`:
   ```
   MONGO_ROOT_USER=admin
   MONGO_ROOT_PASSWORD=your-strong-password
   ```

## Service Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│         Docker Network (didi-network)       │
│                                             │
│  ┌──────────────┐          ┌─────────────┐ │
│  │   Frontend   │          │   Backend   │ │
│  │   (nginx)    │ ------→  │  (Node.js)  │ │
│  │   :8080      │  /api/   │    :5000    │ │
│  └──────────────┘          └─────────────┘ │
│                                   ↓         │
│                            ┌──────────────┐ │
│                            │  MongoDB     │ │
│                            │  (Cloud)     │ │
│                            └──────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Common Commands

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f              # Follow logs
docker-compose logs --tail 100      # Last 100 lines

# Restart services
docker-compose restart
docker-compose restart backend       # Restart specific service

# Execute command in running container
docker exec -it didi-backend npm run seed  # Run seed script
docker exec -it didi-backend sh            # Interactive shell

# View container details
docker inspect didi-backend
docker inspect didi-frontend

# Clean up
docker-compose down              # Stop and remove containers
docker-compose down -v           # Also remove volumes
docker system prune              # Remove unused images/networks
```

## Troubleshooting

### Services won't start

```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Verify environment variables are set
cat .env.docker

# Rebuild images
docker-compose build --no-cache
```

### Backend can't connect to database

```bash
# Verify MONGODB_URI is correct
# Check if MongoDB is reachable
docker exec -it didi-backend ping mongodb  # If using local MongoDB

# Check MongoDB connection
# For Atlas: Ensure IP whitelist includes Docker's IP or 0.0.0.0/0
```

### Frontend can't reach backend

```bash
# Verify nginx config is correct
docker exec -it didi-frontend cat /etc/nginx/conf.d/default.conf

# Test backend connectivity from frontend
docker exec -it didi-frontend wget -O - http://backend:5000/api/health

# Check Docker network
docker network inspect didi-monorepo_didi-network
```

### Port already in use

```bash
# Find process using port 5000
lsof -i :5000

# Use different ports
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
# Edit docker-compose.override.yml to specify different ports
```

### Out of disk space

```bash
# Clean up Docker resources
docker system prune -a              # Remove all unused images
docker volume prune                 # Remove unused volumes
docker network prune                # Remove unused networks
```

## Production Deployment

### Differences from Local Development

1. **Environment**: Set `NODE_ENV=production`
2. **Security**: Use strong secrets (min 32 chars, high entropy)
3. **Database**: Use MongoDB Atlas with IP whitelist
4. **Domain**: Set `FRONTEND_URL` to your actual domain
5. **Rate Limiting**: Enable with `RATE_LIMITER_ENABLED=true`
6. **Logs**: Use centralized logging (e.g., ELK, CloudWatch)

### Deployment Checklist

- [ ] `.env.docker` created with production values
- [ ] MongoDB Atlas configured and IP whitelisted
- [ ] Cloudinary credentials set
- [ ] SMTP credentials for email notifications
- [ ] Security secrets generated (32+ chars each)
- [ ] FRONTEND_URL set to your domain
- [ ] Rate limiting enabled
- [ ] Logs collection configured
- [ ] Health checks configured
- [ ] Backups scheduled (for database/uploads)

## Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances (requires load balancer)
docker-compose up -d --scale backend=3
```

Note: Requires additional load balancer (nginx/HAProxy) configuration.

### Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

```bash
# View resource usage
docker stats

# View container logs with timestamps
docker-compose logs -t

# Inspect container details
docker inspect didi-backend | grep -A 10 "HealthCheck"
```

## Security Considerations

1. **Secrets**: Never commit `.env.docker` with real secrets
2. **Registry**: Use private Docker registries for production
3. **Images**: Keep base images updated (`node:18-alpine`, `nginx:alpine`)
4. **Network**: Use network policies to restrict access
5. **Database**: Use encryption at rest and in transit
6. **HTTPS**: Use reverse proxy (nginx) with SSL certificates

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js in Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Docker Guide](https://hub.docker.com/_/nginx)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
