import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import DefineOptions from 'unplugin-vue-define-options/vite';
import electron from 'vite-plugin-electron';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const MODE = env.VITE_MODE;
  console.log(MODE);
  return defineConfig({
    base: './',
    server: {
      port: 8100,
    },
    build: {
      assetsDir: null,
      chunkSizeWarningLimit: 10240,
    },
    plugins: [
      DefineOptions(),
      vue(),
      electron({
        entry: ['electron/main.ts', 'electron/preload.ts'],
        onstart(args) {
          if (MODE === 'ELECTRON_DEV' || MODE === 'ELECTRON_PRO') {
            args.startup();
          }
        },
      }),
      legacy(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  });
};
