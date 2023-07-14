const { app, BrowserWindow, Menu } = require('electron');
const { startServers } = require('./server/servers');
const path = require('path');
let win;

app.disableHardwareAcceleration();

// 打包后最好添加 --disable-gpu 做为启动参数
function createWindow() {
  win = new BrowserWindow({
    frame: false,
    transparent: true,
    webPreferences: {},
  });

  // 关闭菜单栏
  Menu.setApplicationMenu(null);
  win.loadFile(path.resolve(__dirname, '../dist/index.html'));
}

// 确保窗口被关闭
app.on('window-all-closed', () => {
  app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      win.show();
    }
  });
}

app.whenReady().then(async () => {
  createWindow();
  startServers(9000);
});
