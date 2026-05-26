# HEDIS CareGap - Quick Reference Guide

Fast lookup for common commands and configurations.

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Opens http://localhost:5173

# 3. Sign up with test account
# Email: test@example.com
# Password: Test@123456
```

## Build Commands

```bash
# Web development
npm run dev                 # Start dev server
npm run build              # Production build
npm run preview            # Preview production build
npm run lint               # Check code style
npm run type-check         # TypeScript validation

# Using build script
chmod +x build.sh          # Make executable

./build.sh web             # Build web only
./build.sh docker          # Build Docker image
./build.sh docker-run      # Run with Docker Compose
./build.sh ios             # Prepare iOS
./build.sh android         # Prepare Android
./build.sh native          # iOS + Android
./build.sh all             # Everything
./build.sh clean           # Clean build artifacts
```

## Docker Commands

```bash
# Build and run
docker build -t hedis-caregap:1.0.0 .
docker run -p 3000:3000 hedis-caregap:1.0.0

# Using Docker Compose
docker-compose up                    # Start all services
docker-compose up -d                 # Detached mode
docker-compose down                  # Stop all services
docker-compose logs -f caregap       # View logs
docker-compose ps                    # List services

# With profiles
docker-compose --profile with-db up  # Include database
docker-compose --profile with-cache up  # Include Redis

# Remove everything
docker-compose down -v               # Remove volumes too
```

## Firebase Commands

```bash
# Login
firebase login

# Deploy
firebase deploy                      # Deploy everything
firebase deploy --only hosting       # Web only
firebase deploy --only functions     # Functions only

# View logs
firebase hosting:log

# List deployments
firebase hosting:versions:list

# Rollback
firebase hosting:rollback
```

## Capacitor Commands

```bash
# iOS
npx cap add ios                      # Add iOS platform
npx cap sync ios                     # Sync with iOS
npx cap open ios                     # Open in Xcode
npx cap build ios                    # Build from CLI
npm run ios                          # Build and open

# Android
npx cap add android                  # Add Android platform
npx cap sync android                 # Sync with Android
npx cap open android                 # Open in Android Studio
npx cap build android                # Build from CLI
npm run android                      # Build and install

# Both
npx cap sync                         # Sync both platforms
npx cap copy                         # Copy web assets only
```

## Configuration Files

### Firebase Config (index.html)
```javascript
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'YOUR_ID',
    appId: 'YOUR_APP_ID'
};
```

### Capacitor Config (capacitor.config.ts)
```typescript
{
  appId: 'com.hedis.caregap',
  appName: 'HEDIS CareGap',
  webDir: 'dist'
}
```

### Environment Variables (.env.local)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_CLAUDE_API_KEY=...
```

## Project Structure

```
/home/user/Clinisyswwg/
├── index.html              # Main app with Firebase & UI
├── sw.js                   # Service Worker
├── manifest.json           # PWA manifest
├── capacitor.config.ts     # Native app config
├── package.json            # Dependencies
├── Dockerfile              # Container config
├── docker-compose.yml      # Docker orchestration
├── nginx.conf              # Reverse proxy
├── build.sh                # Build automation
├── .env.example            # Config template
├── dist/                   # Built app (npm run build)
├── ios/                    # iOS project (npx cap add ios)
├── android/                # Android project (npx cap add android)
└── node_modules/           # Dependencies
```

## Documentation Map

| File | Purpose | When to Read |
|------|---------|--------------|
| **SETUP.md** | Quick start | First time setup |
| **FIREBASE_SETUP.md** | Firebase detailed setup | Setting up Firebase |
| **CAPACITOR_BUILD.md** | Native app building | Building iOS/Android |
| **DEPLOYMENT_GUIDE.md** | Deployment to production | Deploying app |
| **IMPLEMENTATION_SUMMARY.md** | What was built | Understanding architecture |
| **QUICK_REFERENCE.md** | This file | Common tasks lookup |

## Common Tasks

### Setup Firebase
```bash
# 1. Create project at console.firebase.google.com
# 2. Get config from Project Settings
# 3. Update config in index.html
# 4. Enable Email/Password auth
# 5. Deploy security rules (from FIREBASE_SETUP.md)
```

### Test Offline Mode
```bash
# 1. Open DevTools (F12)
# 2. Network > Throttling > Offline
# 3. Add a note
# 4. Change back to Online
# 5. Note syncs automatically
```

### Build Docker Image
```bash
docker build -t hedis-caregap:1.0.0 .
docker run -p 3000:3000 hedis-caregap:1.0.0
# Visit http://localhost:3000
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
# At https://your-project-id.web.app
```

### Build iOS App
```bash
npm run build
npx cap sync ios
npx cap open ios
# Build in Xcode (Product > Archive)
```

### Build Android App
```bash
npm run build
npx cap sync android
npx cap open android
# Build in Android Studio (Build > Build Bundle(s) / APK(s))
```

## Troubleshooting Quick Fixes

### "Module not found"
```bash
npm install
```

### "Firebase config not valid"
```bash
# Check index.html has all 6 config fields
# Verify projectId matches Firebase Console
```

### "Can't sign in"
```bash
# Check Firebase Console > Authentication
# Ensure Email/Password is enabled
# Check security rules (from FIREBASE_SETUP.md)
```

### "Port 3000 already in use"
```bash
docker run -p 8000:3000 hedis-caregap:1.0.0
# Access at http://localhost:8000
```

### "Docker build fails"
```bash
docker build --no-cache -t hedis-caregap:1.0.0 .
```

### "Service Worker not working"
```bash
# Serve on HTTPS (or localhost)
# Check browser console for errors
# Verify sw.js in root directory
```

### "Notes not syncing"
```bash
# Check Firestore security rules
# Verify user is authenticated
# Check browser console for errors
# Verify internet connection
```

## Performance Tips

1. **Use production build**: `npm run build`
2. **Enable compression**: Nginx gzip enabled
3. **Optimize images**: Use WebP format
4. **Lazy load**: Components load on demand
5. **Cache static**: 1-year browser cache
6. **Use CDN**: Firebase Hosting or Vercel

## Security Quick Checks

- [ ] Firebase config uses environment variables
- [ ] Firestore security rules deployed
- [ ] HTTPS enabled (auto with Firebase Hosting)
- [ ] Email/Password auth working
- [ ] Encryption service active
- [ ] Service Worker registered
- [ ] No API keys in git (check .gitignore)
- [ ] Security headers in Nginx config

## Testing Workflow

```bash
# Unit test (set up with framework)
npm test

# Build test
npm run build

# Docker test
./build.sh docker-test

# Offline test
# Manual: DevTools > Network > Offline

# Security test
# Manual: Check security rules in Firebase Console
```

## Environment Variables Guide

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_id
# etc...

# Never commit .env.local!
# Already in .gitignore
```

## Version Management

```bash
# Update version in multiple places:
# 1. package.json version field
# 2. Android: android/app/build.gradle (versionCode, versionName)
# 3. iOS: ios/App/App/Info.plist

# Release
npm version minor              # v1.1.0
git push origin main
npm run build
firebase deploy
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `index.html` | Main app, Firebase integration, auth UI |
| `sw.js` | Service Worker for offline support |
| `capacitor.config.ts` | Native app configuration |
| `package.json` | Dependencies and scripts |
| `firebase-config.ts` | Firebase service classes (reference) |
| `.env.example` | Configuration template |
| `Dockerfile` | Docker container definition |
| `docker-compose.yml` | Multi-service orchestration |
| `nginx.conf` | Reverse proxy configuration |
| `build.sh` | Build automation script |

## URLs & Endpoints

```
Development:     http://localhost:5173
Docker Web:      http://localhost:3000
Docker Nginx:    http://localhost:80
Firebase:        https://console.firebase.google.com
Firestore:       https://console.firebase.google.com/firestore
Auth:            https://console.firebase.google.com/authentication
Hosting:         https://your-project-id.web.app
```

## Important Ports

```
3000   - Main app (Docker)
5173   - Dev server (Vite)
5432   - PostgreSQL (Docker)
6379   - Redis (Docker)
80     - HTTP (Nginx)
443    - HTTPS (Nginx)
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add feature"

# Push and create PR
git push origin feature/my-feature

# Merge and deploy
# After PR approved:
git checkout main
git pull origin main
npm run build
firebase deploy
```

## Emergency Commands

```bash
# Hard reset to last commit
git reset --hard HEAD

# Clear all Docker containers
docker system prune -a

# Force rebuild
npm run build -- --force

# Clear npm cache
npm cache clean --force

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Getting Help

1. **Local issues**: Check browser console (F12)
2. **Firebase issues**: Check Firebase Console
3. **Docker issues**: Check logs (`docker-compose logs`)
4. **Documentation**: See docs in project root
5. **General help**: See SETUP.md

## Useful Links

- **Firebase Console**: https://console.firebase.google.com
- **Capacitor Docs**: https://capacitorjs.com
- **Vite Docs**: https://vitejs.dev
- **Web Crypto API**: https://mdn.io/web-crypto-api
- **Docker Docs**: https://docs.docker.com

## Next Steps

1. **Setup**: Follow SETUP.md
2. **Firebase**: Follow FIREBASE_SETUP.md
3. **Deploy**: Follow DEPLOYMENT_GUIDE.md
4. **Mobile**: Follow CAPACITOR_BUILD.md
5. **Scale**: See DEPLOYMENT_GUIDE.md scaling section

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2026-05-25
**Updated for**: Capacitor 6.0 + Firebase 10.7
