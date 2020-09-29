const {
  app,
  BrowserWindow,
  globalShortcut,
  webContents,
  Notification,
  screen,
  remote
} = require("electron");
const {autoUpdater} = require('electron-updater');
const nativeImage = require("electron").nativeImage;
const path = require("path");

var image = nativeImage.createFromPath(__dirname + "/icons/icon_512@1x.png");
image.setTemplateImage(true);

const ipc = require("electron").ipcMain;
// In the main process:
const { ipcMain } = require("electron");
const { create } = require("domain");

//set up auto-updating:
// const server = "https://update.electronjs.org";
// const feed = `${server}/aidandewar/supersonicDistribution/${process.platform}-${
//   process.arch
// }/${app.getVersion()}`;
// autoUpdater.setFeedURL(feed);

// setInterval(() => {
//   autoUpdater.checkForUpdates();
// }, 10 * 60 * 1000);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 350,
    height: 600,
    minHeight: 250,
    minWidth: 200,
    titleBarStyle: "hiddenInset",
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    icon: image,
  });
  win.setMenuBarVisibility(false);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win.setPosition(width - 350, 0);
  // and load the index.html of the app.
  win.loadURL("https://knockknockchat-a47de.web.app/", { userAgent: "Chrome" });

  //add hotkey
  globalShortcut.register("CommandOrControl+Shift+K", () => {
    console.log("hotkey pressed");
    //console.log(webContents)
    win.webContents.send("message", "Hello second window!");
  });
  process.setMaxListeners(0);
  //  autoUpdater.checkForUpdatesAndNotify();
}

// let win = null;
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the
  // app when the dock icon is clicked and there are no
  // other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// TODO: UNCOMMENT EVERYTHING ABOVE THIS LINE

// const { app, BrowserWindow, ipcMain, autoUpdater } = require("electron");
// // const { autoUpdater } = require("electron-updater");
// // const { Updater } = require('update-electron-app')()
// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//     },
//   });
//   mainWindow.loadFile("index.html");
//   mainWindow.on("closed", function () {
//     mainWindow = null;
//   });

//   // //check for updates
//   // mainWindow.once("ready-to-show", () => {
//   //   autoUpdater.checkForUpdatesAndNotify();
//   // });
// }

// app.on("ready", () => {
//   createWindow();
//   autoUpdater.checkForUpdatesAndNotify();
// });

// app.on("window-all-closed", function () {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

// app.on("activate", function () {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

// ipcMain.on("app_version", (event) => {
//   event.sender.send("app_version", { version: app.getVersion() });
// });

// // //listen for update available
// // autoUpdater.on("update-available", () => {
// //   mainWindow.webContents.send("update_available");
// // });

// // //listen for update downloaded
// // autoUpdater.on("update-downloaded", () => {
// //   mainWindow.webContents.send("update_downloaded");
// // });

// // //install new version if user selects restart
// // ipcMain.on("restart_app", () => {
// //   autoUpdater.quitAndInstall();
// // });




// //-------------------------------------------------------------------
// // Define the menu
// //
// // THIS SECTION IS NOT REQUIRED
// //-------------------------------------------------------------------
// let template = []
// if (process.platform === 'darwin') {
//   // OS X
//   const name = app.getName();
//   template.unshift({
//     label: name,
//     submenu: [
//       {
//         label: 'About ' + name,
//         role: 'about'
//       },
//       {
//         label: 'Quit',
//         accelerator: 'Command+Q',
//         click() { app.quit(); }
//       },
//     ]
//   })
// }


// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//   sendStatusToWindow('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//   sendStatusToWindow('Update downloaded');
// });
// app.on('ready', function() {
//   // Create the Menu
//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);

//   createDefaultWindow();
// });
// app.on('window-all-closed', () => {
//   app.quit();
// });