import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';
import { Platform, ImageParams, LiveInfoParams } from './server/src/type';

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
interface GetRoomInfoType {
  roomId: string;
  type: Platform;
}
contextBridge.exposeInMainWorld('api', {
  getConfig,
  watchConfig,
  liveApi: {
    getRoomInfo: (data: GetRoomInfoType) =>
      ipcRenderer.invoke('getRoomInfo', data),
    getLiveInfo: (data: LiveInfoParams) =>
      ipcRenderer.invoke('getLiveInfo', data),
    getRoomInfoManyBili: (uids: string[]) =>
      ipcRenderer.invoke('getRoomInfoManyBili', uids),
    getImage: (data: ImageParams) => ipcRenderer.invoke('getImage', data),
  },
  __dirname: path.resolve(process.resourcesPath, './cache'),
});
