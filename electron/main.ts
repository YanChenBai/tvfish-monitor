import { app, BrowserWindow } from 'electron';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { startServers } = require('../server/dist/server.js');
import path from 'path';

const MODE = process.env.VITE_MODE as 'ELECTRON_PRO' | 'ELECTRON_DEV';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '';
let win;
app.disableHardwareAcceleration();
app;
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
}

// 确保窗口被关闭
app.on('window-all-closed', () => {
  app.quit();
});

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on('second-instance', () => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      win.show();
    }
  });
} else {
  app.quit();
}

app.whenReady().then(() => {
  startServers(9000);
  createWindow();
});
