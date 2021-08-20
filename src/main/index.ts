import { app, BrowserWindow } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import { resolution } from "../common/common";

const isDevelopment = process.env.NODE_ENV !== "production";

function createWindow() {
  const win = new BrowserWindow({
    /**
     * TODO: find out how to remove contextIsolation. It was added as a hack to
     * get the app to work after upgrading to version 12.
     * https://www.electronjs.org/docs/breaking-changes#default-changed-contextisolation-defaults-to-true
     */
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    width: resolution.x,
    height: resolution.y,
    useContentSize: true,
  });

  win.setMenu(null);

  if (isDevelopment) {
    win.webContents.openDevTools();
    console.info(`Running Electron version ${app.getVersion()}`);
  }

  if (isDevelopment) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    win.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  win.webContents.on("devtools-opened", () => {
    win.focus();
    setImmediate(() => {
      win.focus();
    });
  });

  return win;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
