const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return [];

  const folderPath = result.filePaths[0];
  const videoFiles = fs.readdirSync(folderPath)
    .filter(file => /\.(mp4|webm|mov|avi)$/i.test(file))
    .map(file => `file://${path.join(folderPath, file)}`);

  return videoFiles;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
