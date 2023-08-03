import { contextBridge } from 'electron';
const MODE = process.env.VITE_MODE;

function getConfig() {
  let config: any[][];
  if (MODE === 'ELECTRON_DEV') {
    config = require('../config/layouts.json');
  } else if (MODE === 'ELECTRON_PRO') {
    config = require(process.resourcesPath + '/config/layouts.json');
  } else {
    config = [];
  }
  config = config.filter((item) => item.length <= 16);
  return config;
}
contextBridge.exposeInMainWorld('api', { getConfig });
