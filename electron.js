const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
let win;

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    webPreferences: {},
  });
  // Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, './dist/index.html'));
}

app.on('window-all-closed', () => {
  win = null;
});

app.whenReady().then(createWindow);
