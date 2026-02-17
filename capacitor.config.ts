import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ossflow.app',
  appName: 'OssFlow',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#00000000'
    }
  }
};

export default config;
