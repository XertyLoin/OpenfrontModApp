const fs = require('fs');
const path = require('path');

module.exports = {
  init: (win) => {
    const modsPath = path.join(__dirname);
    const configPath = path.join(__dirname, '..', 'active-mods.json');

    const updateInterface = () => {
      try {
        // Charger la configuration des mods
        const activeMods = fs.existsSync(configPath) 
          ? JSON.parse(fs.readFileSync(configPath))
          : [];

        // Lister les fichiers mods
        const modFiles = fs.readdirSync(modsPath)
          .filter(file => file.endsWith('.js') && file !== 'mod-manager.js');

        // Préparer la liste des mods pour l'injection
        const modListData = modFiles.map(file => ({
          name: file,
          active: activeMods.includes(file)
        }));

        win.webContents.executeJavaScript(`
          (() => {
            // Supprimer l'ancienne interface
            const oldInterface = document.getElementById('mod-interface');
            if (oldInterface) oldInterface.remove();
            
            // Ne pas afficher sur les pages interdites
            if (!window.location.href.startsWith('https://openfront.io')) return;
            
            // Créer le conteneur principal
            const container = document.createElement('div');
            container.id = 'mod-interface';
            
            // HTML et CSS
            container.innerHTML = \`
              <style>
                #mod-btn {
                  position: fixed;
                  top: 70px;
                  right: 10px;
                  padding: 10px;
                  background: #007acc;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  z-index: 9999;
                }
                #mod-window {
                  position: fixed;
                  top: 110px;
                  right: 20px;
                  width: 300px;
                  background: #222;
                  color: white;
                  border: 1px solid #555;
                  padding: 15px;
                  z-index: 10000;
                  display: none;
                  border-radius: 8px;
                }
              </style>
              <button id="mod-btn">⚙️ MODS</button>
              <div id="mod-window">
                <strong>Gestion des Mods</strong>
                <div id="mod-list" style="margin-top: 10px;"></div>
                <button id="apply-mods">Appliquer</button>
              </div>
            \`;
            
            document.body.appendChild(container);

            // Remplir la liste des mods
            const modList = ${JSON.stringify(modListData)};
            const listContainer = document.getElementById('mod-list');
            listContainer.innerHTML = modList.map(mod => \`
              <label style="display: block; margin: 5px 0;">
                <input type="checkbox" \${mod.active ? 'checked' : ''} value="\${mod.name}">
                \${mod.name.replace('.js', '')}
              </label>
            \`).join('');

            // Gestion des événements
            document.getElementById('mod-btn').addEventListener('click', () => {
              const window = document.getElementById('mod-window');
              window.style.display = window.style.display === 'none' ? 'block' : 'none';
            });

            document.getElementById('apply-mods').addEventListener('click', () => {
              const selected = Array.from(document.querySelectorAll('#mod-list input:checked'))
                .map(el => el.value);
              if (window.electron && window.electron.applyMods) {
                window.electron.applyMods(JSON.stringify(selected));
              }
            });
          })();
        `).catch(err => console.error('Erreur injection:', err));
      } catch (e) {
        console.error('Erreur mod-manager:', e);
      }
    };

    // Initialisation
    updateInterface();

    // Surveiller les changements de navigation
    win.webContents.on('did-navigate', updateInterface);
    win.webContents.on('did-navigate-in-page', updateInterface);
  }
};