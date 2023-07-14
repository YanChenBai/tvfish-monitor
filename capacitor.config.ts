import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tv.fish.monitor',
  appName: 'TVFISH Monitor',
  webDir: 'dist',
  server: {
    // androidScheme: 'https'
    cleartext: true,
  },
};

export default config;
