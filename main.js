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

var quitting = false;

//Logger for autoupdater testing
const log = require("electron-log");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
// autoUpdater.autoInstallOnAppQuit = true;
log.info("App starting...");

const updateCheck = () => {
  autoUpdater.checkForUpdatesAndNotify().then((resp) => {
    log.info("autoUpdate response:");
    log.info(resp);
  });
};

function sendStatusToWindow(text) {
  log.info(text);
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  sendStatusToWindow("Update available.");
});
autoUpdater.on("update-not-available", (info) => {
  sendStatusToWindow("Update not available.");
});
autoUpdater.on("error", (err) => {
  sendStatusToWindow("Error in auto-updater. " + err);
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
  sendStatusToWindow(log_message);
});

app.on("ready", async () => {
  autoUpdater.on("update-downloaded", () => {
    log.info("update downloaded");
    setImmediate(() => {
      try {
        log.info("installing update");
        // app.relaunch();
        autoUpdater.quitAndInstall();
      } catch (err) {
        log.error("Error installing update");
        log.error(err);
      }
    });
  });

  autoUpdater.on("error", (err) => {
    log.error("AutoUpdater error");
    log.error(err);
  });

  updateCheck();

  schedule.scheduleJob("*/10 * * * *", updateCheck);
});

var modalOpen = false;
var mainWindow;
// var modalWindow;

ipcMain.handle("load room modal", async (e, ...roomName) => {
  //if there's already a modal open, close it
  let allWindows = BrowserWindow.getAllWindows();
  for (i = 0; i < allWindows.length; i++) {
    if (allWindows[i].id > 1) {
      allWindows[i].close();
    }
  }

  //Create the new modal
  var modalWindow = createRoomModal();

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
  var modalWindow = createRoomModal();

  let url = "https://knockknockchat-a47de.web.app/knock/" + knocker;
  modalWindow.loadURL(url);
  modalWindow.show();
  console.log("ID of Modal: " + modalWindow.id);
});

app.whenReady().then(() => {
  mainWindow = createWindow();
  console.log("ID of Main: " + mainWindow.id);
  // autoUpdater.checkForUpdatesAndNotify();
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
  if (BrowserWindow.getAllWindows().length === 1) {
    mainWindow.show();
  }
});

app.on("before-quit", () => {
  quitting = true;
});

// Create the browser window.
function createWindow() {
  win = new BrowserWindow({
    width: 350,
    height: 600,
    minHeight: 250,
    minWidth: 200,
    frame: false,
    titleBarStyle: "hiddenInset",
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    icon: image,
  });
  win.setMenuBarVisibility(false);

  //Set position of the main window
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const calcWidth = (width * 3) / 4 - 175;
  const calcHeight = height - 700;
  win.setPosition(calcWidth, calcHeight);
  // and load the index.html of the app.
  win.loadURL("https://knockknockchat-a47de.web.app/", { userAgent: "Chrome" });

  //TODO: Solve max listeners bug
  process.setMaxListeners(0);

  // On close, hide instead of close
  win.on("close", (event) => {
    if (!quitting) {
      console.log(event);
      event.preventDefault();
      win.hide();
    }
  });

  return win;
}

//Create the room modal
function createRoomModal() {
  const modal = new BrowserWindow({
    width: 175,
    height: 250,
    frame: false,
    show: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    transparent: true,
    alwaysOnTop: true,
  });
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  modal.setPosition(width - 250, 0);
  //add hotkey for mute (cmd+shft+m)
  globalShortcut.register("CommandOrControl+Shift+M", () => {
    modal.webContents.send("message", "Hello second window!");
  });

  //add hotkey for leave room (cmd+shft+L)
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    modal.close();
  });

  modal.on("close", function (e) {
    globalShortcut.unregisterAll();
  });
  return modal;
}

//TODO: Develop custom menu
//TODO: Prevent going offline unless app is quit
