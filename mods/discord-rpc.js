module.exports = {
  init: (win, deps) => {
    const DiscordRPC = deps.DiscordRPC;
    const clientId = '1367969754022674552'; // Remplace par ton propre Client ID
    const rpc = new DiscordRPC.Client({ transport: 'ipc' });
    let currentActivity = null;

    function getGameStatus() {
      const currentURL = win.webContents.getURL();

      if (currentURL.includes('/join/')) {
        return {
          status: 'en jeu',
          partyId: currentURL.split('/join/')[1]
        };
      } else if (
        currentURL === 'https://openfront.io/' ||
        currentURL === 'https://openfront.io'
      ) {
        return { status: 'menu principal' };
      }
      return { status: 'en ligne' };
    }

    async function updatePresence() {
      const { status, partyId } = getGameStatus();
      let activity = {};

      if (status === 'en jeu') {
        activity = {
          details: "En partie multijoueur",
          state: "En compétition",
          startTimestamp: new Date(),
          partyId: partyId,
          partySize: 1,
          partyMax: 4,
          largeImageKey: "openfront_game",
          largeImageText: "OpenFront - En jeu",
          smallImageKey: "icon_competitive",
          buttons: [
            { label: "Rejoindre", url: win.webContents.getURL() }
          ]
        };
      } else {
        activity = {
          details: "Navigue dans le menu",
          state: "Menu principal",
          largeImageKey: "openfront_logo",
          largeImageText: "OpenFront",
          smallImageKey: "icon_menu",
          buttons: [
            { label: "Accueil", url: "https://openfront.io" }
          ]
        };
      }

      if (JSON.stringify(activity) !== JSON.stringify(currentActivity)) {
        currentActivity = activity;
        rpc.setActivity(activity).catch(console.error);
      }
    }

    rpc.on('ready', () => {
      updatePresence();
      setInterval(updatePresence, 5000);
    });

    win.webContents.on('did-navigate', updatePresence);
    win.webContents.on('did-navigate-in-page', updatePresence);

    rpc.login({ clientId }).catch(console.error);

    win.on('closed', () => {
      rpc.destroy().catch(console.error);
    });
  }
};
