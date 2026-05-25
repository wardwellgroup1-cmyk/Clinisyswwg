import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hedis.caregap',
  appName: 'HEDIS CareGap',
  webDir: 'dist', // or './' if serving static files directly
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
