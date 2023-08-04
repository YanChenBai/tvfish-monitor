import { contextBridge } from 'electron';
import path from 'path';
import fs from 'fs';
const MODE = process.env.VITE_MODE;

const configPath =
  MODE === 'ELECTRON_DEV'
    ? path.resolve(__dirname, '../config/layouts.json')
    : path.resolve(process.resourcesPath, './config/layouts.json');

function getConfig() {
  try {
    let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config = config.filter((item) => item.length <= 16);
    return config;
  } catch (error) {
    return [];
  }
}

function watchConfig(cb: { (config) }) {
  cb(getConfig());
  fs.watchFile(configPath, () => cb(getConfig()));
}

contextBridge.exposeInMainWorld('api', {
  getConfig,
  watchConfig,
  __dirname: path.resolve(process.resourcesPath, './cache'),
});
