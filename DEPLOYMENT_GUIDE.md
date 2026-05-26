# HEDIS CareGap Deployment Guide

Complete deployment instructions for web, mobile, and cloud environments.

## Table of Contents
1. [Web Deployment](#web-deployment)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Scaling & Performance](#scaling--performance)

## Web Deployment

### Option 1: Firebase Hosting (Recommended for ease)

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Firebase Hosting
```bash
firebase init hosting
# When prompted:
# - What do you want to use as your public directory? dist
# - Configure as single-page app (rewrite URLs)? Yes
# - Set up automatic builds? No (we'll use CI/CD)
```

#### Step 3: Build and Deploy
```bash
npm run build
firebase deploy
```

Your app is now live at: `https://your-project-id.web.app`

#### Step 4: Configure Custom Domain (Optional)
```bash
firebase hosting:domain:create
# Follow interactive setup
# Then DNS records to point your domain to Firebase Hosting
```

#### Pros:
- Zero-config SSL/TLS
- Global CDN
- Instant SSL certificates
- Integrates with Firebase functions
- Free tier available

#### Cons:
- Firebase-specific
- Limited server-side customization

### Option 2: Vercel (Recommended for performance)

#### Step 1: Deploy to GitHub
Push your repo to GitHub first

#### Step 2: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repo
4. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Step 3: Add Environment Variables
1. Settings > Environment Variables
2. Add Firebase config:
   ```
   VITE_FIREBASE_API_KEY=YOUR_KEY
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-id
   VITE_FIREBASE_APP_ID=your-id
   ```

#### Step 4: Deploy
```bash
# Automatic on every push to main
git push origin main
```

#### Pros:
- Excellent performance (Edge Network)
- Automatic deployments
- Easy rollbacks
- Great for Next.js/Vite apps

#### Cons:
- Free tier has limits
- Need paid plan for unlimited deployments

### Option 3: Traditional VPS (Full Control)

#### Step 1: Provision Server
```bash
# Example: DigitalOcean, Linode, AWS EC2
# Ubuntu 22.04 LTS recommended
# Min specs: 2GB RAM, 20GB SSD
```

#### Step 2: Install Node.js and Dependencies
```bash
# SSH into server
ssh root@your.server.ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt-get install -y nginx
```

#### Step 3: Clone and Build
```bash
cd /opt
sudo git clone https://github.com/your-org/hedis-caregap.git
cd hedis-caregap
sudo npm install
sudo npm run build
```

#### Step 4: Configure Nginx
```nginx
# /etc/nginx/sites-available/caregap
server {
    listen 80;
    server_name your-domain.com;
    
    root /opt/hedis-caregap/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri /index.html;
    }
    
    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Cache control
    location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/caregap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 6: Start Application
```bash
cd /opt/hedis-caregap
pm2 start "npm run dev" --name caregap
pm2 startup
pm2 save
```

#### Step 7: Setup Auto-Update
```bash
# Create update script
cat > /opt/hedis-caregap/deploy.sh << 'EOF'
#!/bin/bash
cd /opt/hedis-caregap
git pull origin main
npm install
npm run build
pm2 restart caregap
EOF

chmod +x /opt/hedis-caregap/deploy.sh

# Add to crontab for auto-updates
crontab -e
# Add: 0 2 * * * /opt/hedis-caregap/deploy.sh
```

## Docker Deployment

### Build Docker Image

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install lightweight HTTP server
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/index.html || exit 1

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

Create `.dockerignore`:
```
node_modules
.git
.gitignore
npm-debug.log
.env.local
.DS_Store
coverage
dist
```

### Build and Test Locally

```bash
docker build -t hedis-caregap:1.0.0 .
docker run -p 3000:3000 hedis-caregap:1.0.0
# Visit http://localhost:3000
```

### Push to Container Registry

#### Docker Hub
```bash
docker tag hedis-caregap:1.0.0 yourusername/hedis-caregap:1.0.0
docker push yourusername/hedis-caregap:1.0.0
```

#### Google Container Registry
```bash
docker tag hedis-caregap:1.0.0 gcr.io/your-project/hedis-caregap:1.0.0
docker push gcr.io/your-project/hedis-caregap:1.0.0
```

#### AWS ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag hedis-caregap:1.0.0 123456789.dkr.ecr.us-east-1.amazonaws.com/hedis-caregap:1.0.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/hedis-caregap:1.0.0
```

## Cloud Platforms

### Google Cloud Run (Easiest)

```bash
# Setup
gcloud init
gcloud auth configure-docker

# Build and push
gcloud builds submit --tag gcr.io/your-project/hedis-caregap

# Deploy
gcloud run deploy hedis-caregap \
  --image gcr.io/your-project/hedis-caregap \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Access at: https://hedis-caregap-xxxxx.run.app
```

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize
eb init -p docker hedis-caregap -r us-east-1

# Create environment
eb create hedis-caregap-env

# Deploy
eb deploy

# Monitor
eb open
```

### Azure Container Instances

```bash
# Build image
az acr build --registry myregistry --image hedis-caregap:1.0.0 .

# Deploy
az container create \
  --resource-group mygroup \
  --name hedis-caregap \
  --image myregistry.azurecr.io/hedis-caregap:1.0.0 \
  --ports 3000 \
  --ip-address public
```

### Kubernetes (Advanced)

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hedis-caregap
  labels:
    app: hedis-caregap
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hedis-caregap
  template:
    metadata:
      labels:
        app: hedis-caregap
    spec:
      containers:
      - name: caregap
        image: gcr.io/your-project/hedis-caregap:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: VITE_FIREBASE_API_KEY
          valueFrom:
            secretKeyRef:
              name: firebase-config
              key: api-key
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: hedis-caregap-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: hedis-caregap
```

Deploy:
```bash
kubectl apply -f k8s/
kubectl expose deployment hedis-caregap --type=LoadBalancer --port=80 --target-port=3000
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: gcr.io
  IMAGE_NAME: hedis-caregap

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Archive artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  deploy-firebase:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build-and-test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: 'your-project-id'

  build-docker:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build-and-test
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to GCR
      uses: docker/login-action@v2
      with:
        registry: gcr.io
        username: _json_key
        password: ${{ secrets.GCP_SA_KEY }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          gcr.io/your-project/hedis-caregap:latest
          gcr.io/your-project/hedis-caregap:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

## Monitoring & Analytics

### Setup Error Tracking

Add Sentry for error monitoring:
```bash
npm install @sentry/browser @sentry/tracing
```

In `index.html`:
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Firebase Analytics

Already integrated! Check Firebase Console > Analytics for:
- User engagement
- Crash reports
- App performance
- User demographics

### Monitoring Commands

```bash
# Firebase logs
firebase functions:log

# View Firestore usage
firebase firestore:usage-report

# Check security rules violations
firebase firestore:index:list
```

## Scaling & Performance

### Optimize for Production

1. **Compression**:
```bash
npm install -D compression-webpack-plugin
```

2. **Code Splitting**:
```javascript
// Already handled by Vite
// Dynamic imports for lazy loading
const Module = () => import('./Module.js');
```

3. **Caching Strategy**:
```javascript
// Service Worker handles caching
// IndexedDB for large datasets
// LocalStorage for small data
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 100 https://your-app.com/

# Using k6
npm install -g k6
k6 run load-test.js
```

### Database Scaling

For high traffic Firestore:
1. Enable **Firestore Sharding**
2. Use **Composite Indexes**
3. Monitor **Operations per second**
4. Consider **Cloud Datastore** for archival

## Environment-Specific Configuration

### Development
```bash
npm run dev
# http://localhost:5173
# Hot module replacement enabled
```

### Staging
```bash
VITE_ENV=staging npm run build
# Deploy to staging subdomain
firebase deploy --only hosting:staging
```

### Production
```bash
VITE_ENV=production npm run build
# All optimizations enabled
firebase deploy
```

## Rollback Procedures

### Firebase Hosting
```bash
# List previous versions
firebase hosting:versions:list

# Rollback to previous
firebase hosting:rollback
```

### Docker/Kubernetes
```bash
# Kubernetes rollback
kubectl rollout undo deployment/hedis-caregap

# Docker compose restart previous
docker-compose up -d --no-build service_name
```

## Post-Deployment Checklist

- [ ] Test login/signup flow
- [ ] Verify Firestore sync working
- [ ] Test offline functionality
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate valid
- [ ] Test error handling
- [ ] Monitor performance metrics
- [ ] Check Firebase usage limits
- [ ] Verify backup is running
- [ ] Test email notifications (if applicable)
- [ ] Smoke test all features
- [ ] Check console for errors
- [ ] Verify HIPAA compliance
- [ ] Test security rules
- [ ] Monitor error tracking (Sentry)

---

**Last Updated**: 2026-05-25
**Deployment Status**: Production Ready
