const { app, BrowserWindow, shell, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');


function getAppPath() {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname);
  }
  const userDataPath = app.getPath('userData');
  const appDataDir = path.join(userDataPath, 'OpenFrontApp');
  const modsPath = path.join(appDataDir, 'mods');

  if (!fs.existsSync(modsPath)) {
    fs.mkdirSync(modsPath, { recursive: true });
    const builtInModsPath = path.join(process.resourcesPath, 'mods');
    if (fs.existsSync(builtInModsPath)) {
      const files = fs.readdirSync(builtInModsPath);
      for (const file of files) {
        fs.copyFileSync(
          path.join(builtInModsPath, file),
          path.join(modsPath, file)
        );
      }
      console.log("Mods de base copiés dans", modsPath);
    }
    }

    return appDataDir;
}

const basePath = getAppPath();

console.log('Chemin des données:', basePath);

function loadMods(win) {
  const modsPath = path.join(basePath, 'mods');
  const configPath = path.join(basePath, 'active-mods.json');

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify([], null, 2));
  }

  let activeMods = [];
  try {
    activeMods = JSON.parse(fs.readFileSync(configPath));
  } catch (e) {
    console.error("Erreur lecture active-mods.json", e);
  }

  const modFiles = fs.readdirSync(modsPath);

  modFiles.forEach((file) => {
    const modPath = path.join(modsPath, file);
    const isModManager = file === 'mod-manager.js';
    const isActive = activeMods.includes(file);

    if (file.endsWith('.js')) {
      try {
        const mod = require(modPath);
        if (mod.init) {
          if (isModManager) {
            console.log(`Mod manager chargé: ${file}`);
            mod.init(win);
          } else if (isActive) {
            console.log(`Mod actif: ${file}`);

            // Si c’est le mod Discord, on injecte DiscordRPC en paramètre
            if (file === 'discord-rpc.js') {
              try {
                const DiscordRPC = require('discord-rpc');
                mod.init(win, { DiscordRPC }); // injection
              } catch (err) {
                console.error("Erreur import discord-rpc dans main.js", err);
              }
            } else {
              mod.init(win); // autres mods classiques
            }
          }
        }
      } catch (err) {
        console.error(`Erreur mod ${file}`, err);
      }
    }
  });
}


function createWindow() {
  // Configure l'icône de l'application
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let icon = null;
  
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      console.warn("Le fichier d'icône n'a pas pu être chargé");
      icon = null;
    }
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: icon, // Ajout de l'icône
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Configuration supplémentaire pour Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.openfront.app');
  }

  // Configuration supplémentaire pour macOS
  if (process.platform === 'darwin' && icon) {
    app.dock.setIcon(icon);
  }

  win.setTitle("OpenFront App");
  win.loadURL('https://openfront.io');

  // Gestion des liens et navigation
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://openfront.io')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://openfront.io')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Gestion des mods
  ipcMain.on('apply-mods', (event, modListJSON) => {
    const mods = JSON.parse(modListJSON);
    fs.writeFileSync(path.join(basePath, 'active-mods.json'), JSON.stringify(mods, null, 2));
    app.relaunch();
    app.exit();
  });

  ipcMain.on('change-title', (event, title) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.setTitle(title || "OpenFront App"); // Fallback au titre par défaut
  }
});

  // Gestion du raccourci DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Désactive le menu contextuel
  win.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Recharge les mods à chaque navigation
  win.webContents.on('did-finish-load', () => loadMods(win));
}

app.whenReady().then(() => {
  createWindow();

  // Pour macOS: créer une fenêtre quand on clique sur l'icône du dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});