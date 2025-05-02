import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thelightcome.bughunt',
  appName: 'Bug Hunt',
  webDir: 'docs',
  server: {
    androidScheme: 'https'
  }
};

export default config;
