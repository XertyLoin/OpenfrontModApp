# OpenFrontApp

OpenFrontApp is a custom Electron-based launcher designed for [https://openfront.io](https://openfront.io). It allows mod management, custom RPC integration with Discord, and supports automatic updates of active mods.

## 🚀 Features

- 🌐 Launches the OpenFront web app in a native window
- 🧩 Supports custom mods loaded from a user folder
- 🔄 Automatically reloads mods after page navigation
- 🎮 Discord Rich Presence integration
- 💾 Persistent user settings stored in the user's AppData
- 🖼 Custom icon support for the executable

---

## 🛠 Installation

```bash
npm install
```

Make sure your system has Node.js and Git installed.

---

## 👨‍💻 Development Mode

To run the app in development mode with live reload:

```bash
npm run start
```

This will open the app using Electron and load local resources. The console will print debug logs and load mods from your project directory.

---

## 📦 Build for Production

To build the application for Windows:

```bash
npm run build:win
```

Other available targets:

- `npm run build:mac` – macOS `.dmg`
- `npm run build:linux` – Linux `.AppImage`

> Make sure your `assets/icon.ico` (Windows) or `icon.icns` (macOS) are valid and exist before building.

---

## 📁 Mod Loading System

Mods are JavaScript files placed in the `mods/` folder. During the first launch, the app copies the default mods to:

```
%appdata%/openfrontapp/OpenFrontApp/mods
```

Only mods listed in `active-mods.json` will be activated on launch.


---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## ✨ Credits

Developed by Xerty.  
Powered by Electron.
