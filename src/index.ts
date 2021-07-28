import { MidiApp } from "./midi-app";

const { app, BrowserWindow } = require("electron");

const midiApp = new MidiApp();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile("src/index.html");
};

app.whenReady().then(() => {
  createWindow();
});
