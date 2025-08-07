# 🚀 Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Production Deployment](#production-deployment)
- [Container Deployment](#container-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Scaling Strategies](#scaling-strategies)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

This guide provides comprehensive instructions for deploying the School Management System in various environments, from simple VPS deployments to enterprise-grade cloud infrastructure.

### Deployment Options

1. **Single Server Deployment** - Simple VPS/dedicated server
2. **Container Deployment** - Docker and Docker Compose
3. **Cloud Deployment** - AWS, Azure, Google Cloud
4. **Kubernetes Deployment** - Container orchestration
5. **Serverless Deployment** - Functions and managed services

### Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │
│   (React)   │───▶│ (Node.js)   │───▶│ (SQLite/    │
│             │    │             │    │ PostgreSQL) │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2

#### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

#### Backend Dependencies
```bash
# Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 Process Manager
npm install -g pm2

# Database (PostgreSQL for production)
sudo apt-get install postgresql postgresql-contrib
```

#### Frontend Dependencies
```bash
# Build tools
npm install -g serve
# or
npm install -g http-server
```

### Network Requirements
- **Port 80/443**: Frontend (HTTP/HTTPS)
- **Port 3000-6001**: Backend API
- **Port 5432**: PostgreSQL (if external)
- **Port 22**: SSH access

## Environment Setup

### Environment Variables

#### Production Environment File
```bash
# .env.production
NODE_ENV=production

# Server Configuration
PORT=6001
HOST=0.0.0.0

# Database (PostgreSQL for production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=school_user
DB_PASSWORD=secure_password_here
DB_SSL=true

# JWT Configuration
JWT_SECRET=your-super-secure-256-bit-secret-key-generated-with-crypto
JWT_EXPIRY=7d

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-generated-with-crypto
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# File Upload
UPLOAD_PATH=/var/www/uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp

# Email Configuration (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
LOG_LEVEL=info
LOG_FILE=/var/log/school-management/app.log
SENTRY_DSN=your-sentry-dsn-for-error-tracking

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/your-domain.crt
SSL_KEY_PATH=/etc/ssl/private/your-domain.key
```

#### Frontend Environment File
```bash
# .env.production
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_NAME=School Management System
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your-frontend-sentry-dsn
```

### SSL Certificate Setup

#### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Production Deployment

### Single Server Deployment

#### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash schoolapp
sudo usermod -aG sudo schoolapp
```

#### Step 2: Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE school_management;
CREATE USER school_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE school_management TO school_user;
ALTER USER school_user CREATEDB;
\q

# Configure PostgreSQL (optional - for remote connections)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host school_management school_user 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

#### Step 3: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/school-management
sudo chown schoolapp:schoolapp /var/www/school-management

# Switch to application user
sudo su - schoolapp

# Clone repository
cd /var/www
git clone https://github.com/Arison99/School-Management-System.git school-management
cd school-management

# Install backend dependencies
cd backend
npm ci --production
npm run migrate # Run database migrations

# Build frontend
cd ../frontend
npm ci
npm run build

# Copy built files to web root
sudo cp -r dist/* /var/www/html/

# Create uploads directory
sudo mkdir -p /var/www/uploads/{schools,classes,students}
sudo chown -R schoolapp:www-data /var/www/uploads
sudo chmod -R 755 /var/www/uploads
```

#### Step 4: PM2 Configuration
```bash
# Create PM2 ecosystem file
cat > /var/www/school-management/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'school-management-api',
    script: './backend/server.js',
    cwd: '/var/www/school-management',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 6001
    },
    error_file: '/var/log/school-management/err.log',
    out_file: '/var/log/school-management/out.log',
    log_file: '/var/log/school-management/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/school-management
sudo chown schoolapp:schoolapp /var/log/school-management

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Enable PM2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u schoolapp --hp /home/schoolapp
```

#### Step 5: Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/school-management

# Add configuration:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Frontend
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/school-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Health Check Setup

#### Application Health Check
```javascript
// Add to backend/server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

#### System Health Monitoring
```bash
# Create health check script
sudo nano /usr/local/bin/health-check.sh

#!/bin/bash
# Health check script

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx is down" >> /var/log/health-check.log
    systemctl start nginx
fi

# Check PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    echo "$(date): PostgreSQL is down" >> /var/log/health-check.log
    systemctl start postgresql
fi

# Check PM2 app
if ! pm2 describe school-management-api | grep -q "online"; then
    echo "$(date): Application is down" >> /var/log/health-check.log
    pm2 restart school-management-api
fi

sudo chmod +x /usr/local/bin/health-check.sh

# Add to crontab
sudo crontab -e
# Add: */5 * * * * /usr/local/bin/health-check.sh
```

## Container Deployment

### Docker Configuration

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/{schools,classes,students}
RUN chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 6001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: school_management
      POSTGRES_USER: school_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U school_user"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_NAME: school_management
      DB_USER: school_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - uploads:/usr/src/app/uploads
      - logs:/usr/src/app/logs
    ports:
      - "6001:6001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl:ro
      - uploads:/usr/share/nginx/html/uploads:ro
    depends_on:
      - backend
    restart: unless-stopped

  # Redis (for caching and sessions)
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:
  logs:

networks:
  default:
    driver: bridge
```

#### Environment Configuration
```bash
# .env (for Docker Compose)
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
SMTP_PASS=your_smtp_password
```

### Container Deployment Commands

#### Build and Deploy
```bash
# Clone repository
git clone https://github.com/Arison99/School-Management-System.git
cd School-Management-System

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

#### Database Migration
```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Create admin user (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run seed:admin
```

## Cloud Deployment

### AWS Deployment

#### EC2 Deployment
```bash
# Launch EC2 instance (t3.medium recommended)
# Amazon Linux 2 AMI

# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
git clone https://github.com/Arison99/School-Management-System.git
cd School-Management-System
cp .env.example .env
# Configure .env file

docker-compose -f docker-compose.prod.yml up -d
```

#### RDS Database Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier school-management-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your_password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted

# Update .env with RDS endpoint
DB_HOST=school-management-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
```

#### S3 File Storage Setup
```javascript
// Configure S3 for file uploads
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, `${req.uploadType}/${timestamp}-${random}${extension}`);
    }
  })
});
```

### Azure Deployment

#### App Service Deployment
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name school-management-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name school-management-plan \
  --resource-group school-management-rg \
  --sku B1 \
  --is-linux

# Create web app for backend
az webapp create \
  --resource-group school-management-rg \
  --plan school-management-plan \
  --name school-management-api \
  --runtime "NODE|18-lts"

# Create static web app for frontend
az staticwebapp create \
  --name school-management-frontend \
  --resource-group school-management-rg \
  --source https://github.com/Arison99/School-Management-System \
  --location eastus \
  --branch main \
  --app-location "frontend" \
  --output-location "dist"
```

### Google Cloud Deployment

#### Cloud Run Deployment
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sql-admin.googleapis.com

# Create Cloud SQL instance
gcloud sql instances create school-management-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

# Deploy backend to Cloud Run
cd backend
gcloud run deploy school-management-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend to Firebase Hosting
cd ../frontend
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Backend CI/CD Pipeline
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths: [ 'backend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: test_db
        DB_USER: postgres
        DB_PASSWORD: postgres
        JWT_SECRET: test_secret
    
    - name: Run security audit
      run: |
        cd backend
        npm audit --audit-level moderate

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: yourusername/school-management-api:latest
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/school-management
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

#### Frontend CI/CD Pipeline
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths: [ 'frontend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run linter
      run: |
        cd frontend
        npm run lint
    
    - name: Run tests
      run: |
        cd frontend
        npm test
    
    - name: Build application
      run: |
        cd frontend
        npm run build
      env:
        VITE_API_BASE_URL: https://api.your-domain.com
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: frontend-build
        path: frontend/dist

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: frontend-build
        path: frontend/dist
    
    - name: Deploy to S3
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Sync to S3 bucket
      run: |
        aws s3 sync frontend/dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

### Deployment Script

#### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Configuration
REPO_URL="https://github.com/Arison99/School-Management-System.git"
APP_DIR="/var/www/school-management"
BACKUP_DIR="/var/backups/school-management"

# Create backup
echo "📦 Creating backup..."
sudo mkdir -p $BACKUP_DIR
sudo tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C $APP_DIR .

# Pull latest code
echo "📥 Pulling latest code..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main

# Update backend
echo "🔧 Updating backend..."
cd backend
npm ci --production
npm run migrate

# Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/

# Restart services
echo "🔄 Restarting services..."
pm2 reload ecosystem.config.js
sudo systemctl reload nginx

# Health check
echo "🏥 Running health checks..."
sleep 10

if curl -f http://localhost:6001/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost/index.html > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
```

## Performance Optimization

### Application Optimization

#### Backend Performance
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable keep-alive
const http = require('http');
const server = http.createServer(app);
server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;

// Database connection pooling
const sequelize = new Sequelize(database, username, password, {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  logging: false // Disable in production
});

// Redis caching
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use caching for read operations
app.get('/api/schools/my-school', cacheMiddleware(300), schoolController.getMySchool);
```

#### Frontend Performance
```javascript
// Vite configuration for optimization
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
});

// Lazy loading components
const LazyDashboard = lazy(() => import('./Pages/dashboard'));
const LazySchool = lazy(() => import('./Pages/school'));
const LazyStudent = lazy(() => import('./Pages/student'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<LazyDashboard />} />
        <Route path="/school" element={<LazySchool />} />
        <Route path="/student" element={<LazyStudent />} />
      </Routes>
    </Suspense>
  );
}
```

### Database Optimization

#### PostgreSQL Optimization
```sql
-- Database tuning
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_students_name ON students USING gin(to_tsvector('english', student_name));
CREATE INDEX CONCURRENTLY idx_students_class_id ON students(class_id);
CREATE INDEX CONCURRENTLY idx_students_status ON students(status);
CREATE INDEX CONCURRENTLY idx_classes_school_id ON classes(school_id);
CREATE INDEX CONCURRENTLY idx_classes_year ON classes(year);

-- Analyze tables for query optimization
ANALYZE students;
ANALYZE classes;
ANALYZE schools;
```

## Monitoring & Logging

### Application Monitoring

#### PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Monitor with PM2 Plus
pm2 link <secret_key> <public_key>

# Monitor logs
pm2 logs school-management-api

# Monitor metrics
pm2 monit
```

#### Custom Monitoring Service
```javascript
// monitoring.js
const os = require('os');
const fs = require('fs').promises;

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: []
    };
  }

  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      this.metrics.requests++;
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.metrics.responseTime.push(duration);
        
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
      });
      
      next();
    };
  }

  async getSystemMetrics() {
    const usage = process.cpuUsage();
    const memory = process.memoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        freemem: os.freemem(),
        totalmem: os.totalmem()
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        cpu: usage,
        memory: memory,
        version: process.version
      },
      application: {
        requests: this.metrics.requests,
        errors: this.metrics.errors,
        avgResponseTime: this.getAverageResponseTime(),
        errorRate: this.metrics.errors / this.metrics.requests
      }
    };
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTime.length;
  }
}

module.exports = new MonitoringService();
```

### Logging Configuration

#### Winston Logger Setup
```javascript
// logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'school-management',
    version: process.env.npm_package_version 
  },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Log Rotation Setup
```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/school-management

/var/log/school-management/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 schoolapp schoolapp
    postrotate
        pm2 reload school-management-api
    endscript
}
```

## Backup & Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-db.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/school-management"
DB_NAME="school_management"
DB_USER="school_user"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups
find $BACKUP_DIR -name "db-backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Database Recovery
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
DB_NAME="school_management"
DB_USER="school_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop application
pm2 stop school-management-api

# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restore from backup
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME
else
    psql -h localhost -U $DB_USER -d $DB_NAME < $BACKUP_FILE
fi

# Start application
pm2 start school-management-api

echo "Database restored from $BACKUP_FILE"
```

### File Backup

#### File Backup Script
```bash
#!/bin/bash
# backup-files.sh

set -e

BACKUP_DIR="/var/backups/school-management"
SOURCE_DIR="/var/www/uploads"
RETENTION_DAYS=30

# Create backup
tar -czf "$BACKUP_DIR/files-backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C $SOURCE_DIR .

# Remove old backups
find $BACKUP_DIR -name "files-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "File backup completed"
```

#### Cron Jobs for Automated Backups
```bash
# Add to crontab
sudo crontab -e

# Database backup every day at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh

# File backup every day at 3 AM
0 3 * * * /usr/local/bin/backup-files.sh

# Weekly full system backup
0 4 * * 0 /usr/local/bin/backup-full.sh
```

## Scaling Strategies

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
# nginx load balancer
upstream backend_servers {
    least_conn;
    server 127.0.0.1:6001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:6002 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:6003 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

#### Database Scaling
```javascript
// Master-slave database configuration
const sequelizeMaster = new Sequelize(database, username, password, {
  host: 'master-db-host',
  dialect: 'postgres',
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
});

const sequelizeSlave = new Sequelize(database, username, password, {
  host: 'slave-db-host',
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
});

// Database service with read/write splitting
class DatabaseService {
  static getWriteConnection() {
    return sequelizeMaster;
  }
  
  static getReadConnection() {
    return sequelizeSlave;
  }
  
  static async read(query, options = {}) {
    return await this.getReadConnection().query(query, options);
  }
  
  static async write(query, options = {}) {
    return await this.getWriteConnection().query(query, options);
  }
}
```

### Kubernetes Deployment

#### Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: school-management

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: school-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: yourusername/school-management-api:latest
        ports:
        - containerPort: 6001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 6001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 6001
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: school-management
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 6001
    targetPort: 6001
  type: ClusterIP

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: school-management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: yourusername/school-management-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: school-management-ingress
  namespace: school-management
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: school-management-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 6001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs school-management-api

# Check process status
pm2 status

# Check port availability
sudo netstat -tlnp | grep :6001

# Check environment variables
pm2 env school-management-api

# Restart application
pm2 restart school-management-api
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U school_user -d school_management -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Reset database connection
pm2 restart school-management-api
```

#### Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check PM2 memory usage
pm2 monit

# Increase Node.js memory limit
pm2 delete school-management-api
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

### Performance Issues

#### High CPU Usage
```bash
# Check CPU usage
top
htop

# Profile Node.js application
npm install -g clinic
clinic doctor -- node server.js

# Check for CPU-intensive queries
sudo tail -f /var/log/postgresql/postgresql-*.log | grep "duration:"
```

#### Slow Database Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze query plans
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM students WHERE student_name ILIKE '%john%';
```

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
```bash
#!/bin/bash
# daily-maintenance.sh

# Check disk space
df -h | awk '$5 > 80 {print "Disk usage warning: " $0}'

# Check application health
curl -f http://localhost:6001/health || echo "Application health check failed"

# Clean up old log files
find /var/log/school-management -name "*.log" -mtime +7 -exec truncate -s 0 {} \;

# Check for security updates
sudo apt list --upgradable | grep security
```

#### Weekly Tasks
```bash
#!/bin/bash
# weekly-maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services for updates
sudo systemctl restart postgresql
pm2 restart all

# Database maintenance
sudo -u postgres psql -d school_management -c "VACUUM ANALYZE;"

# Check SSL certificate expiration
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout | grep "Not After"
```

#### Monthly Tasks
```bash
#!/bin/bash
# monthly-maintenance.sh

# Update Node.js dependencies
cd /var/www/school-management/backend
npm audit fix
npm update

# Database optimization
sudo -u postgres psql -d school_management -c "REINDEX DATABASE school_management;"

# Clean up old backups
find /var/backups/school-management -type f -mtime +90 -delete

# Review and archive logs
logrotate -f /etc/logrotate.d/school-management
```

### Update Procedures

#### Application Updates
```bash
#!/bin/bash
# update-application.sh

# Create maintenance page
echo "System under maintenance" > /var/www/html/maintenance.html

# Redirect traffic to maintenance page
sudo nginx -s reload

# Pull latest code
cd /var/www/school-management
git pull origin main

# Update dependencies
cd backend
npm ci --production

# Run migrations
npm run migrate

# Update frontend
cd ../frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/html/

# Restart services
pm2 reload ecosystem.config.js

# Remove maintenance page
sudo rm /var/www/html/maintenance.html

# Test deployment
curl -f http://localhost:6001/health
curl -f http://localhost/
```

#### Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
sudo npm install -g n
sudo n stable

# Update SSL certificates
sudo certbot renew --quiet

# Restart all services
sudo systemctl restart nginx postgresql
pm2 restart all
```

---

*This deployment guide provides comprehensive instructions for deploying the School Management System in various environments. Choose the deployment method that best fits your infrastructure and requirements.*
