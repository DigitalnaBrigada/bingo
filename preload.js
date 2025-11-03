const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    loadMenu: () => ipcRenderer.invoke('loadMenu'),
    leaderboard: (groups, categories) => ipcRenderer.invoke('leaderboard', { groups, categories }),
    startGame: (group, categories) => ipcRenderer.invoke('startGame', { group, categories }),
    answer: (questionId, selectedIndex) => ipcRenderer.invoke('answer', { questionId, selectedIndex }),
});