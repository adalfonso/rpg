import { app, BrowserWindow } from "electron";
import __basedir from "../basepath";
import { RESOLUTION } from "../common/common";

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: RESOLUTION.x,
    height: RESOLUTION.y,
    useContentSize: true,
  });

  mainWindow.loadFile("./dist/index.html");
  mainWindow.setMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null as any;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
