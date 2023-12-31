import { app, BrowserWindow } from 'electron';
// import initIpcMain from './ipcmain';
import path from 'path';
import { startServers } from './server/server';

const MODE = process.env.VITE_MODE as 'ELECTRON_PRO' | 'ELECTRON_DEV';
let win;

app.disableHardwareAcceleration();

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (MODE === 'ELECTRON_DEV') {
    win.loadURL('http://localhost:8100');
  } else {
    win.loadFile(path.resolve(__dirname, '../dist/index.html'));
  }

  // initIpcMain();

  // 窗口关闭时清除引用
  win.on('closed', () => {
    win = null;
  });
}

// 确保窗口被关闭
app.on('window-all-closed', () => {
  app.quit();
});

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  // 当运行第二个实例时，将焦点聚焦到主窗口
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    // startServers(9000);
  });
} else {
  app.quit();
}

startServers(9000);
