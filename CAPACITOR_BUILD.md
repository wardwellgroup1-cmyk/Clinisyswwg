# Capacitor Native App Build Guide

Complete guide to build and deploy HEDIS CareGap as native iOS and Android apps using Capacitor.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [iOS Build](#ios-build)
4. [Android Build](#android-build)
5. [App Store Distribution](#app-store-distribution)
6. [Play Store Distribution](#play-store-distribution)
7. [Updates & Maintenance](#updates--maintenance)

## Prerequisites

### System Requirements

#### macOS (for iOS builds)
- macOS 12.0+
- Xcode 13.0+
- CocoaPods (usually pre-installed with Xcode)

#### Windows/Linux/macOS (for Android builds)
- Java Development Kit (JDK) 11+
- Android SDK
- Android Studio (recommended)
- Android emulator or physical device

### Install Capacitor CLI

```bash
npm install -g @capacitor/cli
# or
yarn global add @capacitor/cli
```

### Verify Installation

```bash
capacitor --version
# Should output: 6.0.0 or later
```

## Project Setup

### Step 1: Install Dependencies

From the project root:

```bash
npm install
```

This installs all packages including:
- @capacitor/cli
- @capacitor/core
- @capacitor/ios
- @capacitor/android
- All Capacitor plugins

### Step 2: Build Web Assets

```bash
npm run build
# or
yarn build
```

This creates optimized files in the `dist/` directory.

### Step 3: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- App Name: `HEDIS CareGap`
- App ID: `com.hedis.caregap` (must be unique)
- Directory: `.` (current directory)

This creates `capacitor.config.ts` (already configured in this project).

## iOS Build

### Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

### Step 1: Add iOS Platform

```bash
npx cap add ios
```

This creates an `ios/` directory with Xcode project files.

### Step 2: Review Configuration

Check `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hedis.caregap',
  appName: 'HEDIS CareGap',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: '#1e40af',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1e40af',
      sound: 'beep'
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
```

### Step 3: Sync iOS Project

```bash
npx cap sync ios
```

This updates the iOS project with latest web assets and configuration.

### Step 4: Open in Xcode

```bash
npx cap open ios
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

### Step 5: Configure in Xcode

1. **Select Target**: Select "App" from the target list
2. **Signing & Capabilities**:
   - Team: Select your Apple Developer Team
   - Bundle ID: Verify it's `com.hedis.caregap`
   - Signing Certificate: Automatically selected

3. **Capabilities** (if needed):
   - Microphone (for voice recording)
   - Camera (for photos)
   - Contacts (optional)

4. **Info.plist Permissions**:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>We need access to your microphone to record clinical notes</string>
   <key>NSCameraUsageDescription</key>
   <string>We need access to your camera for patient documentation</string>
   <key>NSLocalNetworkUsageDescription</key>
   <string>We need access to your local network for device pairing</string>
   ```

### Step 6: Build for Simulator

```bash
# From Xcode:
# 1. Select simulator device (top toolbar)
# 2. Product > Build or Cmd+B
# 3. Product > Run or Cmd+R

# Or from command line:
xcodebuild -scheme App -simulator -configuration Debug
```

### Step 7: Build for Device

```bash
# Connect iPhone to Mac via USB
# In Xcode:
# 1. Select your device from device picker
# 2. Product > Run or Cmd+R

# For distribution:
# Product > Archive
```

### Step 8: Deploy to App Store

See [App Store Distribution](#app-store-distribution) section.

## Android Build

### Prerequisites
```bash
# Install Android SDK (via Android Studio or command line)
# Set environment variables:
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin

# Verify installation
adb --version
```

### Step 1: Add Android Platform

```bash
npx cap add android
```

This creates an `android/` directory with Android project files.

### Step 2: Sync Android Project

```bash
npx cap sync android
```

### Step 3: Open in Android Studio

```bash
npx cap open android
```

Or manually:
```bash
cd android && ./gradlew build
```

### Step 4: Configure in Android Studio

1. **Gradle Sync**: Android Studio should auto-sync
2. **SDK Setup**:
   - File > Project Structure > SDK Location
   - Set Android SDK location
3. **Build Configuration**:
   - Check `android/app/build.gradle`:
   ```gradle
   android {
       compileSdkVersion 33
       defaultConfig {
           applicationId "com.hedis.caregap"
           minSdkVersion 21
           targetSdkVersion 33
       }
   }
   ```

### Step 5: Update AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions for clinical documentation -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application>
        <!-- Your app configuration -->
    </application>
</manifest>
```

### Step 6: Build APK

#### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 7: Test on Emulator

```bash
# Launch emulator
emulator -avd Pixel_5_API_31

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or from Android Studio:
# Run > Run 'app'
```

### Step 8: Test on Physical Device

```bash
# Enable USB Debugging on phone (Settings > Developer Options)
# Connect phone via USB

adb devices  # Verify phone is connected

# Install and run
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.hedis.caregap/.MainActivity
```

### Step 9: Deploy to Play Store

See [Play Store Distribution](#play-store-distribution) section.

## App Store Distribution

### Prerequisites
- Apple Developer Account ($99/year)
- App ID configured
- Signing certificate
- Privacy Policy URL

### Step 1: Create App ID

1. Go to [Apple Developer](https://developer.apple.com)
2. App IDs > Create a New App ID
3. Bundle ID: `com.hedis.caregap`
4. Capabilities: Enable required permissions

### Step 2: Create Distribution Certificate

1. Certificates, IDs & Profiles
2. Certificates > Create a New Certificate
3. App Store and Ad Hoc > Continue
4. Follow certificate creation process
5. Download and install certificate

### Step 3: Create Provisioning Profile

1. Provisioning Profiles > Create a New Profile
2. App Store > Continue
3. Select your App ID
4. Select distribution certificate
5. Name: `HEDIS CareGap Distribution`
6. Download and open in Xcode

### Step 4: Archive App

In Xcode:
```
1. Product > Archive
2. Organizer window opens
3. Select your archive
4. Distribute App > App Store Connect
5. Follow upload wizard
```

### Step 5: App Store Connect Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps > New App
3. Fill in app details:
   - Bundle ID: `com.hedis.caregap`
   - App Name: `HEDIS CareGap`
   - Primary Language: English
   - Category: Medical

4. **App Information**:
   - Subtitle: Clinical Documentation with AI
   - Privacy Policy: [Your URL]
   - Support URL: [Your URL]

5. **Features**:
   - **Key Features**:
     - Voice-to-text clinical documentation
     - Offline-first note-taking
     - Care gap detection
     - End-to-end encrypted cloud backup
     - HIPAA-compliant storage

6. **Medical App Questionnaire**: Complete if required

### Step 6: Screenshots & Preview

Add screenshots for:
- 6.7-inch (iPhone 14 Pro Max)
- 5.5-inch (iPhone 8 Plus)
- 12.9-inch (iPad Pro)

Recommended sizes:
- iPhone: 1242 x 2208 (portrait)
- iPad: 2048 x 2732 (landscape)

### Step 7: Submit for Review

1. App Store Connect > Your App > Submission
2. Review app details
3. Click "Submit for Review"
4. Wait for Apple review (typically 1-3 days)

## Play Store Distribution

### Prerequisites
- Google Play Developer Account ($25 one-time)
- Signed APK/AAB
- Privacy Policy URL
- Promotional materials

### Step 1: Create Signing Key

```bash
cd android

# For first-time release, use bundled signing
./gradlew bundleRelease

# Or create custom key:
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias caregap
```

### Step 2: Sign Release APK

In `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            keyStore file('release.keystore')
            keyStorePassword 'your_password'
            keyAlias 'caregap'
            keyPassword 'your_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Build signed APK:
```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

Or build AAB (recommended):
```bash
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

### Step 3: Google Play Console Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill app details:
   - App name: `HEDIS CareGap`
   - Default language: English
   - App type: Application
   - Category: Medical

4. **Store Listing**:
   - Short description (80 chars)
   - Full description
   - Contact details
   - Privacy Policy URL
   - Screenshots (min 2, max 8)

5. **Content Rating**:
   - Complete content rating questionnaire
   - Submit for rating classification

6. **Target Audience**:
   - Healthcare professionals and clinicians

### Step 4: Upload APK/AAB

1. Create New Release > Production
2. Upload APK or AAB file
3. Fill release notes:
   ```
   Version 1.0.0 - Initial Release
   
   New Features:
   - Clinical documentation with voice input
   - HEDIS care gap detection
   - Offline-first note taking
   - End-to-end encrypted cloud backup
   - Full HIPAA compliance
   ```

### Step 5: Review Requirements

Complete all sections:
- App content (medical app questions)
- Permissions explanation
- Testing instructions (dummy login: test@example.com)

### Step 6: Submit

1. Review all information
2. Click "Send for Review"
3. Wait for Google review (typically 2-4 hours)

## Updates & Maintenance

### Pushing Updates

#### Web Updates (for PWA)
```bash
npm run build
npx cap copy
# Service Worker will auto-update cached files
```

#### iOS Updates
```bash
npm run build
npx cap sync ios
npx cap open ios
# Archive and submit new build to App Store
```

#### Android Updates
```bash
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
# Upload AAB to Play Store
```

### Version Management

Update version in multiple places:

```json
// package.json
{
  "version": "1.0.1"
}
```

```typescript
// capacitor.config.ts
// No version field here, uses package.json
```

```xml
<!-- android/app/build.gradle -->
defaultConfig {
    versionCode 2
    versionName "1.0.1"
}
```

```plist
<!-- ios/App/App/Info.plist -->
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>
<key>CFBundleVersion</key>
<string>2</string>
```

### App Store Updates
In App Store Connect:
1. New App Version > Create New Version
2. Select version number
3. Upload new build
4. Update release notes
5. Submit for review

### Play Store Updates
In Google Play Console:
1. Create new release
2. Upload new AAB
3. Update release notes
4. Submit for review

## Troubleshooting

### iOS Issues

**"pod install" fails**
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

**Xcode build errors**
```bash
# Clean build
npx cap sync ios --deployment
xcodebuild clean -scheme App
npx cap open ios
```

**App crashes on launch**
- Check console logs in Xcode (Product > Scheme > Edit Scheme > Diagnostics)
- Verify Firebase config in index.html
- Check Info.plist permissions

### Android Issues

**Gradle build fails**
```bash
cd android
./gradlew clean
./gradlew build
```

**Emulator not connecting**
```bash
adb kill-server
adb start-server
adb devices
```

**App won't install**
```bash
# Check existing installation
adb shell pm list packages | grep caregap

# Uninstall and reinstall
adb uninstall com.hedis.caregap
adb install app-debug.apk
```

## Performance Tips

1. **Minimize APK/AAB size**: Tree-shake unused code in build
2. **Optimize images**: Use WebP format
3. **Lazy load**: Load components on demand
4. **Compression**: Enable Proguard for release builds

## Security Checklist

- [ ] Enable code signing for iOS
- [ ] Sign APK with release keystore
- [ ] Remove debug symbols from release builds
- [ ] Verify Firebase config is correct
- [ ] Test encryption on real devices
- [ ] Test offline functionality
- [ ] Verify app permissions requests
- [ ] Test authentication flow
- [ ] Check for console errors/warnings
- [ ] Test with network throttling

---

**Last Updated**: 2026-05-25
**Capacitor Version**: 6.0.0
**Target iOS**: 13.0+
**Target Android**: 6.0+ (API 21+)
