const {
  app,
  BrowserWindow,
  globalShortcut,
  webContents,
  Notification,
  screen,
  remote,
  Menu,
  MenuItem,
  powerMonitor,
} = require("electron");
// const { PanelWindow } = require('electron-panel-window');
const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const nativeImage = require("electron").nativeImage;
const path = require("path");
var image = nativeImage.createFromPath(__dirname + "/icons/icon_512@1x.png");
image.setTemplateImage(true);
const ipc = require("electron").ipcMain;
const { ipcMain } = require("electron");
const debug = require("electron-debug");
debug();

//Set up analytics
const { trackEvent } = require("./analytics");
var quitting = false;

//Logger for autoupdater testing
const log = require("electron-log");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.allowPrerelease = true;
// autoUpdater.autoInstallOnAppQuit = true;
log.info("App starting...");

console.log = function (message) {
  log.info(message);
};
console.error = function (message) {
  log.error(message);
};

autoUpdater.on("checking-for-update", () => {
  log.info("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  log.info("Update available.");
});
autoUpdater.on("update-not-available", (info) => {
  log.info("Update not available.");
});
autoUpdater.on("error", (err) => {
  log.info("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  log.info(log_message);
});

autoUpdater.on("update-downloaded", () => {
  log.info("Update downloading...beginning install");
  autoUpdater.quitAndInstall(false, true);
});

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
  log.info(`${title}\n${content}`);
};

var modalOpen = false;
var mainWindow;
var modalWindow;

ipcMain.handle("load room modal", async (e, ...roomName) => {
  //if there's already a modal open, close it
  let allWindows = BrowserWindow.getAllWindows();
  for (i = 0; i < allWindows.length; i++) {
    if (allWindows[i].id > 1) {
      allWindows[i].close();
    }
  }

  //Create the new modal
  modalWindow = createRoomModal();

  let url =
    "https://knockknockchat-a47de.web.app/room/" +
    roomName +
    "?room=" +
    roomName;
  modalWindow.loadURL(url);
  modalWindow.show();
  console.log("ID of Modal: " + modalWindow.id);
});

ipcMain.handle("close room modal", (e) => {
  // modalWindow.hide();
  BrowserWindow.getFocusedWindow().close();
});

//When someone knocks, load modal to knock request page
ipcMain.handle("load knock modal", async (e, ...knocker) => {
  let allWindows = BrowserWindow.getAllWindows();
  for (i = 0; i < allWindows.length; i++) {
    if (allWindows[i].id > 1) {
      allWindows[i].close();
    }
  }

  //Create the new modal
  modalWindow = createRoomModal();

  let url = "https://knockknockchat-a47de.web.app/knock/" + knocker;
  modalWindow.loadURL(url);
  modalWindow.show();
  console.log("ID of Modal: " + modalWindow.id);
});

app.whenReady().then(() => {
  mainWindow = createWindow();
  console.log("ID of Main: " + mainWindow.id);
  // trackEvent("User Interaction", "Opened App");
  autoUpdater.checkForUpdatesAndNotify();
});

// app.on("window-all-closed", (e) => e.preventDefault());

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
  if (BrowserWindow.getAllWindows().length >= 1) {
    mainWindow.show();
  }
});

app.on("before-quit", () => {
  quitting = true;
});

// Create the browser window.
function createWindow() {
  log.info("createWindow function starting");
  win = new BrowserWindow({
    width: 350,
    height: 600,
    minHeight: 250,
    minWidth: 200,
    titleBarStyle: "hiddenInset",
    frame: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    icon: image,
  });
  log.info("window created");
  win.setMenuBarVisibility(false);
  log.info("setMenuBarVisibility to false");
  //Set position of the main window
  // const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // log.info("Got width and height of screen");
  // const calcWidth = (width * 3) / 4 - 175;
  // log.info("Calculated width");
  // const calcHeight = height - 700;
  // log.info("Calculated height");
  // // win.setPosition(calcWidth, calcHeight);
  // log.info("Set position");
  // and load the index.html of the app.
  win.loadURL("https://knockknockchat-a47de.web.app/", { userAgent: "Chrome" });
  log.info("Loaded URL");

  //TODO: Solve max listeners bug
  process.setMaxListeners(0);
  log.info("Set listeners");

  // On close, hide instead of close
  win.on("close", (event) => {
    if (!quitting) {
      console.log(event);
      event.preventDefault();
      win.hide();
    }
  });
  log.info("Set on close function");
  log.info("Now returning window");
  return win;
}

//Create the room modal
function createRoomModal() {
  const modal = new BrowserWindow({
    width: 175,
    height: 125,
    frame: false,
    hasShadow: true,
    resizable: true,
    show: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    transparent: false,
    alwaysOnTop: true,
  });
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  modal.setPosition(width - 190, 25); //add hotkey for mute (cmd+shft+m)
  globalShortcut.register("CommandOrControl+Shift+M", () => {
    log.info("mute hotkey detected!");
    modal.webContents.send("toggleMute", "Hello second window!");
  });

  //add hotkey for leave room (cmd+shft+L)
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    log.info("Leave room hotkey detected!");
    modal.close();
  });

  const interval = setInterval(function () {
    if (powerMonitor.getSystemIdleState(1800) == "idle") {
      clearInterval(interval);
      modal.close();
    }
  }, 60000);

  modal.on("close", function (e) {
    mainWindow.webContents.send("refresh", "Modal closed");
    mainWindow.webContents.send("leftRoom", "modal closed");
    globalShortcut.unregisterAll();
  });

  return modal;
}

//TODO: Develop custom menu
