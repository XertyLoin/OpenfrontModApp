module.exports = {
  init: (win) => {
    win.webContents.executeJavaScript(`
      const style = document.createElement('style');
      style.innerText = \`
        #mod-change-title-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #007acc;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 24px;
          cursor: pointer;
          z-index: 10000;
          margin-bottom: 100px;
          margin-left: 15px;
        }

        #mod-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          background-color: #222;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: none;
          flex-direction: column;
          z-index: 10001;
          border-radius: 10px;
        }

        #mod-popup input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          font-size: 16px;
        }

        #mod-popup button {
          padding: 10px;
          border: none;
          background-color: #444;
          color: white;
          cursor: pointer;
        }

        #mod-popup button:hover {
          background-color: #555;
        }

        #mod-popup-close {
          position: absolute;
          top: 5px;
          right: 10px;
          font-size: 18px;
          cursor: pointer;
          background: none;
          border: none;
          color: white;
        }
      \`;
      document.head.appendChild(style);

      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'mod-change-title-btn';
      toggleBtn.innerText = '+';
      document.body.appendChild(toggleBtn);

      const popup = document.createElement('div');
      popup.id = 'mod-popup';
      popup.innerHTML = \`
        <button id="mod-popup-close">✖</button>
        <h3>Changer le titre</h3>
        <input type="text" id="popup-title-input" placeholder="Nouveau titre...">
        <button id="popup-apply-title">Changer</button>
      \`;
      document.body.appendChild(popup);

      toggleBtn.onclick = () => popup.style.display = 'flex';
      document.getElementById('mod-popup-close').onclick = () => popup.style.display = 'none';

      document.getElementById('popup-apply-title').onclick = () => {
        const title = document.getElementById('popup-title-input').value;
        if (window.electron && window.electron.changeTitle) {
          window.electron.changeTitle(title);
        } else {
          alert("Fonction changeTitle indisponible.");
        }
      };
    `);
  }
};
