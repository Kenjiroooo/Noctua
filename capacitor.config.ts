import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.noctua.app',
  appName: 'Noctua',
  webDir: 'out',
  server: {
    url: 'https://ai-study-buddy-clean-nextjs.vercel.app',
    cleartext: false
  }
};

export default config;
