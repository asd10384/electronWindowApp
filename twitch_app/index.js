const { join } = require('path');
const { app, BrowserWindow, Menu, session } = require('electron');
const { ElectronBlocker } = require("@cliqz/adblocker-electron");
const windowState = require('electron-window-state');

const adlist = [
  "||cdn.krxd.net^",
  "||amazon-adsystem.com^",
  "||script.ioam.de^",
  "||edge.quantserve.com^",
  "||ddacn6pr5v0tl.cloudfront.net^",
  "||d2v02itv0y9u9t.cloudfront.net^",
  "||imrworldwide.com^",
  "||countess.twitch.tv^",
  "||scorecardresearch^",
  "||googletagservices^",
  "||branch.io^",
  "||comscore.com^",
  "||edge.ads.twitch.tv^"
];

const createWindow = () => {
  const mainWindowState = windowState({
    defaultWidth: 800,
    defaultHeight: 600
  });
  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      session: session
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
          preload: join(__dirname, 'preload.js'),
          session: session
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
  if (mainWindow.webContents.session) {
    const adblocker = ElectronBlocker.parse(adlist.join("\n"));
    adblocker.enableBlockingInSession(mainWindow.webContents.session);
    adblocker.on("request-blocked", () => {
      console.log("ad blocked:", (new Date()).toLocaleString("en-US"));
    });
  }
  mainWindow.loadURL("https://twitch.tv");
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
