const {
  app,
  BrowserWindow,
  ipcMain,
  autoUpdater,
  dialog,
} = require("electron");
// const { autoUpdater } = require("electron-updater");
require("update-electron-app")();
const server = "https://github.com/aidandewar/supersonicDistribution.git";
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

autoUpdater.setFeedURL({ url });
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on("ready", () => {
  createWindow();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 30000);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// ipcMain.on("app_version", (event) => {
//   event.sender.send("app_version", { version: app.getVersion() });
// });

// autoUpdater.on("update-available", () => {
//   mainWindow.webContents.send("update_available");
// });
// autoUpdater.on("update-downloaded", () => {
//   mainWindow.webContents.send("update_downloaded");
// });

// ipcMain.on("restart_app", () => {
//   autoUpdater.quitAndInstall();
// });

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (message) => {
  console.error("There was a problem updating the application");
  console.error(message);
});
