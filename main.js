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
  // let existingModal = BrowserWindow.fromId(2);
  // if (existingModal) {
  //   console.log('closingWindow!');
  //   existingModal.close();
  // }

  //Create the new modal
  var modalWindow = createRoomModal();

  // modalWindow.on('focus', event => {
  //   console.log('showing main window!');
  //   event.preventDefault();
  //   mainWindow.show();
  // });

  // modalWindow.on('close', function(e) {
  //   e.preventDefault();
  //   // modalWindow.hide();
  //   mainWindow.focus();
  // });

  // modalWindow.on('focus', function(e) {
  //   console.log('focused!');
  //   modalWindow.setSize(width - 350, 400, true);
  // });

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

app.whenReady().then(() => {
  mainWindow = createWindow();
  console.log("ID of Main: " + mainWindow.id);
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", (e) => e.preventDefault());

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

// Create the browser window.
function createWindow() {
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

  //Set position of the main window
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win.setPosition(width - 350, 275);

  // and load the index.html of the app.
  win.loadURL("https://knockknockchat-a47de.web.app/", { userAgent: "Chrome" });

  //TODO: Solve max listeners bug
  process.setMaxListeners(0);

  // On close, hide instead of close
  win.on("close", (event) => {
    console.log(event);
    event.preventDefault();
    win.hide();
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
  return modal;
}

//TODO: Develop custom menu
//TODO: Prevent force quit when modal is closed
//TODO: Add custom shortcuts
//TODO: Translate mute hotkey to modal
//TODO: Prevent going offline unless app is quit
