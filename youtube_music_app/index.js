const { join } = require('path');
const { app, BrowserWindow, Menu } = require('electron');
const windowState = require('electron-window-state');

const createWindow = () => {
  const mainWindowState = windowState({
    defaultWidth: 600,
    defaultHeight: 800
  });
  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    icon: join(__dirname, 'favicon.ico'),
    backgroundColor: "black",
  });
  mainWindow.webContents.session.clearCache().catch(() => {});
  mainWindowState.manage(mainWindow);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: '새로고침',
      accelerator: 'f5',
      click: (menuItem, currentWindow, event) => {
        currentWindow.reload();
      }
    },
    {
      label: '전체화면',
      accelerator: 'f11',
      click: (menuItem, currentWindow, event) => {
        currentWindow.setFullScreen(!mainWindow.isFullScreen());
      }
    },
    {
      label: '관리자탭',
      accelerator: 'f12',
      click: (menuItem, currentWindow, event) => {
        currentWindow.webContents.toggleDevTools();
      }
    },
    {
      label: '탭닫기',
      click: (menuItem, currentWindow, event) => {
        if (currentWindow.isClosable()) currentWindow.close();
      }
    }
  ]));
  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: join(__dirname, 'preload.js')
        },
        x: mainWindowState.x + 30,
        y: mainWindowState.y + 20,
        width: mainWindowState.width,
        height: mainWindowState.height,
        autoHideMenuBar: false,
        icon: join(__dirname, 'favicon.ico'),
        backgroundColor: "black"
      }
    };
  });
  mainWindow.loadURL("https://music.youtube.com");
  mainWindow.show();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(); 
  });
}).catch((err) => {
  console.log('err:', err);
  app.quit();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
