import { app, BrowserWindow } from "electron";
import { inDev } from "@common/helpers";

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let appWindow: BrowserWindow;

/**
 * Create Application Window
 *
 * @returns Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  // Create new window instance
  appWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      /**
       * TODO: find out how to remove contextIsolation. It was added as a hack to
       * get the app to work after upgrading to version 12.
       * https://www.electronjs.org/docs/breaking-changes#default-changed-contextisolation-defaults-to-true
       */
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);
  appWindow.on("ready-to-show", () => appWindow.show());

  registerMainIPC();

  appWindow.on("close", () => {
    // appWindow = null;
    app.quit();
  });

  if (inDev()) {
    appWindow.webContents.openDevTools({ mode: "bottom" });
    console.info(`Running Electron version ${app.getVersion()}`);
  }

  return appWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
}
