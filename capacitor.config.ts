import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'TVFISH Monitor',
  webDir: 'dist',
  server: {
    // androidScheme: 'https'
    cleartext: true,
  },
};

export default config;
