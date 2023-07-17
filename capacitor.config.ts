import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tvfish.monitor',
  appName: 'TVFISH Monitor',
  webDir: 'dist',
  server: {
    // androidScheme: 'https'
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
