import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import DefineOptions from 'unplugin-vue-define-options/vite';

// "@ionic-native/background-mode": "^5.36.0",
// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  base: './',
  build: {
    assetsDir: null,
    chunkSizeWarningLimit: 10240,
  },
  plugins: [DefineOptions(), vue(), legacy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
