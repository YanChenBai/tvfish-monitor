const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
let win;

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    transparent: true,
    webPreferences: {
      // preload: path.join(__dirname, './preload.js'),
    },
  });
  Menu.setApplicationMenu(null);
  win.loadFile('./dist/index.html');
}

app.on('window-all-closed', () => {
  win = null;
});

app.whenReady().then(createWindow);
