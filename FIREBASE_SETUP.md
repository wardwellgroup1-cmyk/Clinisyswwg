# Firebase Setup Guide for HEDIS CareGap

Complete guide to set up Firebase, Firestore, and Authentication for the HEDIS CareGap clinical documentation app.

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Firestore Database Configuration](#firestore-database-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Security Rules](#security-rules)
5. [Encryption & HIPAA Compliance](#encryption--hipaa-compliance)
6. [Configuration](#configuration)
7. [Local Development](#local-development)
8. [Offline-First Implementation](#offline-first-implementation)

## Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Name it: `hedis-caregap` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Add Web App
1. In Firebase Console, click the Web icon (</>) to add a web app
2. Register app name: `HEDIS CareGap Web`
3. Check "Also set up Firebase Hosting for this app" (optional)
4. Click "Register App"
5. **Copy your Firebase Configuration** - you'll need this in the next step

Your configuration will look like:
```javascript
{
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
}
```

### Step 3: Update Configuration in index.html
Open `/home/user/Clinisyswwg/index.html` and find this section:

```javascript
const firebaseConfig = {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};
```

Replace with your actual Firebase config from Step 2.

## Firestore Database Configuration

### Step 1: Create Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose region: `us-east1` (or your preferred region)
4. Start in **Test Mode** (for development)
5. Click "Create"

### Step 2: Database Structure
The database will automatically create this structure as users save notes:

```
firestore-root/
├── users/{uid}/
│   ├── notes/{noteId}/
│   │   ├── userId: string
│   │   ├── title: string
│   │   ├── encryptedContent: object
│   │   │   ├── iv: string
│   │   │   ├── ciphertext: string
│   │   │   └── algorithm: string
│   │   ├── status: string ("draft", "signed", "archived")
│   │   ├── version: number
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   ├── lastModifiedBy: string
│   │   └── syncedAt: timestamp
│   │
│   └── profile/
│       ├── name: string
│       ├── email: string
│       ├── role: string ("clinician", "admin")
│       └── createdAt: timestamp
```

### Step 3: Create Indexes (if needed)
For queries filtering by multiple fields, Firestore will suggest creating composite indexes. These will be automatic.

## Authentication Setup

### Step 1: Enable Email/Password Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Select "Email/Password"
4. Toggle "Enable"
5. Toggle "Enable email link sign-in"
6. Click "Save"

### Step 2: Configure Email Templates (Optional)
1. Go to "Authentication" > "Templates"
2. Customize email templates for:
   - Password Reset
   - Email Verification
   - Etc.

### Step 3: User Settings
1. Go to "Users" tab
2. You can manually create test users or let users sign up

## Security Rules

### Critical: Update Firestore Security Rules
1. Go to Firestore > "Rules"
2. Replace all content with these HIPAA-safe rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile protection
    match /users/{uid}/profile {
      allow read, write: if request.auth.uid == uid;
    }
    
    // User notes protection - encrypted data
    match /users/{uid}/notes/{noteId} {
      allow create: if request.auth.uid == uid &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.encryptedContent != null;
      
      allow read: if request.auth.uid == uid &&
                     resource.data.userId == request.auth.uid;
      
      allow update: if request.auth.uid == uid &&
                       request.resource.data.userId == request.auth.uid;
      
      allow delete: if request.auth.uid == uid;
      
      // Prevent note history deletion
      match /history/{historyId} {
        allow read: if request.auth.uid == uid;
        allow create: if request.auth.uid == uid;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click "Publish" to apply the rules.

### Rules Explanation
- **Users can only access their own data** via `request.auth.uid == uid`
- **Encrypted content required** to prevent plaintext storage
- **Read-only history** to maintain audit trail
- **Default deny** for all other collections

## Encryption & HIPAA Compliance

### Built-in Encryption Features

The app includes AES-256-GCM encryption for all patient data:

1. **At Rest**: All notes are encrypted before leaving the device
2. **In Transit**: Firebase uses TLS 1.3+
3. **Key Derivation**: PBKDF2 with 100,000 iterations
4. **IV Management**: Unique 96-bit IV per encryption

### HIPAA Considerations

✓ **Implemented**:
- End-to-end encryption (client-side)
- User authentication
- Access controls (user can only see own notes)
- Audit trail (version history)
- Offline-first (works without internet)
- Data retention controls (soft deletes)

⚠️ **Additional Steps for Production**:
1. Use **Google Cloud KMS** for key management (instead of localStorage)
2. Enable **Cloud Audit Logs**
3. Set up **Data Loss Prevention (DLP)**
4. Implement **HIPAA BAA** with Google Cloud
5. Use **Cloud Security Command Center**
6. Enable **VPC Service Controls**
7. Implement **Encryption Keys** per user/organization

### Sensitive Data Handling

```javascript
// What gets encrypted:
- Clinical note content
- Patient history
- Assessment data
- Care gap details

// What doesn't need encryption:
- Creation date (timestamp only)
- Note status (draft/signed/archived)
- Version number
- User ID (encrypted separately)
```

## Configuration

### Firebase Configuration File
The app reads Firebase config from `index.html`. For production:

```javascript
// Option 1: Direct in HTML (development only)
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    // ...
};

// Option 2: Environment variables (recommended)
// Create .env.local:
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// etc.

// Then load in Vite:
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    // ...
};
```

### Required Configuration Fields
- `apiKey`: Web API key
- `authDomain`: Firebase auth domain
- `projectId`: Firebase project ID
- `storageBucket`: Cloud Storage bucket
- `messagingSenderId`: Messaging sender ID
- `appId`: Firebase app ID

All available in Firebase Console > Project Settings > Your Apps > Web

## Local Development

### Run Development Server
```bash
npm install
npm run dev
```

The app will start at `http://localhost:5173`

### Test Firebase Locally
1. Sign up with test email: `test@example.com`
2. Password: `Test@123456`
3. Add a note
4. Check Firestore Console to see encrypted data

### Firebase Emulator (Optional)
For local testing without cloud Firebase:

```bash
npm install -g firebase-tools
firebase init
firebase emulators:start
```

## Offline-First Implementation

### How It Works

1. **All operations stored locally** using browser's localStorage
2. **Automatic sync when online** detected
3. **Background sync** using Service Workers
4. **Conflict resolution**: Last-write-wins with versioning

### SyncManager Features

```javascript
// Automatically handled:
- Queue operations offline
- Retry on connection loss
- Track sync status
- Update UI with sync state

// Monitored by:
- window.addEventListener('online')
- window.addEventListener('offline')
- Periodic sync checks
```

### Service Worker Integration
The `sw.js` file handles:
- Caching static assets
- Network-first for API calls
- Cache fallback for offline

### Testing Offline Mode
1. Open DevTools (F12)
2. Network tab > Throttling > Offline
3. Add a note (will be queued)
4. Go back online
5. Note syncs automatically

## Troubleshooting

### "Firebase Config Not Found"
- Check Firebase config in `index.html`
- Ensure all 6 fields are present
- Verify projectId matches Firebase Console

### "User Not Authenticated"
- Check Authentication in Firebase Console
- Verify Email/Password is enabled
- Check security rules allow your user

### "Encryption Failed"
- Browser must support Web Crypto API (all modern browsers)
- Check browser console for specific error
- Try different browser if issue persists

### "Notes Not Syncing"
- Check Firestore security rules
- Verify user has write permission
- Check network connectivity
- Check browser console for errors

### "Offline Mode Not Working"
- Service Worker must be registered
- IndexedDB persistence must be enabled
- Check browser supports Service Workers

## Monitoring & Maintenance

### Firebase Console Monitoring
1. **Firestore Usage**: Dashboard shows reads/writes/deletes
2. **Auth Users**: Monitor signups and active users
3. **Realtime Database**: Check latency
4. **Cloud Logs**: View detailed request logs

### Backup Strategy
- Firestore has **daily automatic backups**
- Enable **Point-in-Time Recovery** in Firestore settings
- Consider **Cloud Storage exports** for compliance

### Security Checklist
- [ ] Set up security rules (required!)
- [ ] Enable 2FA for Firebase Console
- [ ] Rotate API keys periodically
- [ ] Monitor for unusual activity in Cloud Logs
- [ ] Keep Firebase SDK updated
- [ ] Test encryption with test users
- [ ] Document HIPAA compliance setup

## Next Steps

1. [Deploy the app](./DEPLOYMENT_GUIDE.md)
2. [Build native apps with Capacitor](./CAPACITOR_BUILD.md)
3. [Set up CI/CD pipelines](./CI_CD_SETUP.md)

---

**Last Updated**: 2026-05-25
**Firebase SDK Version**: 10.7.0
**Firestore Version**: 2.0+
