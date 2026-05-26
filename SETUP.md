# HEDIS CareGap Setup & Integration Guide

Complete setup instructions for Firebase, Capacitor, Docker, and deployment of the HEDIS CareGap clinical documentation app.

## Overview

HEDIS CareGap is a HIPAA-safe, offline-first clinical documentation platform with:
- **Firebase Integration**: Firestore database, Email/Password authentication
- **Encrypted Cloud Backup**: AES-256-GCM encryption for patient data
- **Offline-First**: Works offline, auto-syncs when online
- **Native Apps**: iOS and Android apps via Capacitor
- **Docker Support**: Containerized deployment
- **Production Ready**: Comprehensive security, monitoring, and scaling

## Quick Start

### 1. Prerequisites
```bash
# Check Node.js and npm
node --version  # v18+
npm --version   # v8+

# For iOS builds (macOS only)
xcode-select --install

# For Android builds
# Install Android Studio from https://developer.android.com/studio

# For Docker
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### 2. Install Project Dependencies
```bash
cd /home/user/Clinisyswwg
npm install
```

### 3. Configure Firebase
1. Create Firebase project: https://console.firebase.google.com
2. Open `index.html` and update the Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: 'YOUR_API_KEY',
       authDomain: 'your-project.firebaseapp.com',
       projectId: 'your-project-id',
       storageBucket: 'your-project.appspot.com',
       messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
       appId: 'YOUR_APP_ID'
   };
   ```
3. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup

### 4. Run Development Server
```bash
npm run dev
# Opens http://localhost:5173
```

## Build Options

### Web Application
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Using Build Script
```bash
# Make executable
chmod +x build.sh

# Build web app
./build.sh web

# Build Docker image
./build.sh docker

# Run with Docker Compose
./build.sh docker-run

# Build iOS and Android
./build.sh native

# Full build (all platforms)
./build.sh all

# Clean build artifacts
./build.sh clean

# Help
./build.sh help
```

### Docker
```bash
# Build Docker image
docker build -t hedis-caregap:1.0.0 .

# Run container
docker run -p 3000:3000 hedis-caregap:1.0.0

# Or use Docker Compose
docker-compose up

# With database
docker-compose --profile with-db up

# View logs
docker-compose logs -f caregap
```

### iOS (macOS only)
```bash
# Prepare iOS project
npx cap add ios
npx cap sync ios

# Open in Xcode
npx cap open ios

# Or build from command line
npm run ios
```

### Android
```bash
# Prepare Android project
npx cap add android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK
npm run android

# Install on device/emulator
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuration Files

### Firebase Configuration (`index.html`)
Update the Firebase config in the module script section:
```javascript
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};
```

### Capacitor Configuration (`capacitor.config.ts`)
Pre-configured with:
- App ID: `com.hedis.caregap`
- App name: `HEDIS CareGap`
- Web directory: `dist`
- Plugins: SplashScreen, Keyboard, LocalNotifications, Camera, Geolocation

### Environment Variables (`.env.local`)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Features

### Authentication
- Email/password signup and login
- User profile management
- Session persistence
- Logout functionality

### Cloud Backup & Sync
- Local-first architecture (works offline)
- Automatic sync when online
- Encryption with AES-256-GCM
- Version history tracking
- Soft deletes (archive notes)

### Clinical Documentation
- Voice-to-text recording
- Manual note entry
- HEDIS care gap detection
- ICD-10 code suggestions
- Progress note generation with Claude AI
- Note signing and archival

### Security
- End-to-end encryption (client-side)
- HIPAA-compliant storage
- Firestore security rules
- User data isolation
- Audit trail with versions

### Offline Support
- Service Worker caching
- IndexedDB persistence
- Auto-sync queue
- Status indicators

## File Structure

```
/home/user/Clinisyswwg/
├── index.html                    # Main app (with Firebase & auth UI)
├── sw.js                         # Service Worker
├── manifest.json                 # PWA manifest
├── firebase-config.ts            # Firebase configuration module
├── capacitor.config.ts           # Capacitor configuration
├── package.json                  # Project dependencies
├── Dockerfile                    # Docker container config
├── docker-compose.yml            # Docker Compose config
├── nginx.conf                    # Nginx reverse proxy
├── build.sh                      # Build automation script
├── SETUP.md                      # This file
├── FIREBASE_SETUP.md             # Firebase detailed setup
├── CAPACITOR_BUILD.md            # Native app build guide
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
├── dist/                         # Built web app
├── ios/                          # iOS app (after cap add ios)
├── android/                      # Android app (after cap add android)
└── node_modules/                 # Dependencies
```

## Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase/Firestore setup
- **[CAPACITOR_BUILD.md](./CAPACITOR_BUILD.md)** - iOS and Android build guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Web, Docker, and cloud deployment
- **[SETUP.md](./SETUP.md)** - This quickstart guide

## Common Tasks

### Add a User
1. Open app in browser
2. Click "Create Account" on login screen
3. Enter email and password
4. Account created in Firebase Auth

### Test Offline Mode
1. Open DevTools (F12)
2. Network tab > Throttling > Offline
3. Add a note (queued locally)
4. Go back online
5. Note syncs automatically

### View Firebase Data
1. Firebase Console > Firestore Database
2. Navigate to: `users/{userId}/notes/{noteId}`
3. See encrypted content field

### Build Docker Image
```bash
docker build -t hedis-caregap:1.0.0 .
docker run -p 3000:3000 hedis-caregap:1.0.0
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
# Access at: https://your-project-id.web.app
```

### Deploy to Docker Container
```bash
./build.sh docker-run
# Access at: http://localhost:3000
```

## Troubleshooting

### "Firebase Config Not Found"
- Check `index.html` for Firebase config section
- Verify all 6 config fields are present
- Ensure config matches your Firebase project

### "Can't Sign In"
- Go to Firebase Console > Authentication
- Verify Email/Password is enabled
- Check security rules allow the user

### "Notes Not Syncing"
- Check Firestore security rules in Firebase Console
- Verify user has write permission
- Check browser console for errors

### "Service Worker Not Registered"
- Check browser console for errors
- Verify `sw.js` is in root directory
- HTTPS required for production (HTTP OK for localhost)

### "Docker Build Fails"
```bash
docker build --no-cache -t hedis-caregap:1.0.0 .
```

### "Port Already in Use"
```bash
# Change port in docker-compose.yml or:
docker run -p 8000:3000 hedis-caregap:1.0.0
# Access at http://localhost:8000
```

## Performance Tips

1. **Compression**: Enabled in Nginx (gzip)
2. **Caching**: Assets cached for 1 year
3. **CDN**: Use Firebase Hosting or Vercel for global distribution
4. **Database**: Firestore scales automatically
5. **Images**: Optimize before uploading (WebP format)

## Security Checklist

- [ ] Firebase config updated with your project
- [ ] Firestore security rules deployed
- [ ] Email/Password authentication enabled
- [ ] HTTPS enabled (Firebase Hosting auto-enables)
- [ ] Encryption key derived from user ID
- [ ] Regular backups configured
- [ ] Error tracking enabled (Sentry)
- [ ] API keys rotated quarterly
- [ ] Firestore audit logs enabled
- [ ] User data encrypted at rest

## Next Steps

1. **Configure Firebase**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. **Build Native Apps**: See [CAPACITOR_BUILD.md](./CAPACITOR_BUILD.md)
3. **Deploy Web**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Monitor Production**: Firebase Console > Analytics
5. **Handle Updates**: See deployment guide update procedures

## Support & Documentation

- **Firebase Docs**: https://firebase.google.com/docs
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

## Environment-Specific Notes

### Development
```bash
npm run dev
# Hot module reloading enabled
# Debug logging enabled
# Firebase emulator can be used (optional)
```

### Staging
```bash
VITE_ENV=staging npm run build
firebase deploy --only hosting:staging
```

### Production
```bash
VITE_ENV=production npm run build
firebase deploy
# All optimizations enabled
# Error tracking active
# CDN caching enabled
```

## License & Compliance

This application is designed to be HIPAA-compliant with:
- End-to-end encryption
- User authentication
- Access controls
- Audit trails
- Data retention policies

Ensure you have a Business Associate Agreement (BAA) with Google Cloud/Firebase before processing PHI.

## Getting Help

1. Check the relevant documentation file (FIREBASE_SETUP.md, CAPACITOR_BUILD.md, DEPLOYMENT_GUIDE.md)
2. Review troubleshooting section above
3. Check browser console for detailed error messages
4. Check Firebase Console for database/auth issues
5. Enable verbose logging in development

---

**Version**: 1.0.0
**Last Updated**: 2026-05-25
**Status**: Production Ready
