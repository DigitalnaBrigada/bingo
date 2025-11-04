const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Fetches all age groups and categories
    loadMenu: () => ipcRenderer.invoke('loadMenu'),

    // Fetches leaderboard based on selected age groups and categories
    leaderboard: (groups, categories) =>
        ipcRenderer.invoke('leaderboard', { groups, categories }),

    // Starts a game for given age group, categories, and number of players
    startGame: (group, categories, numPlayers) =>
        ipcRenderer.invoke('startGame', { group, categories, numPlayers }),

    // Submits an answer and returns correctness, bingo, and updated board
    answer: (playerId, questionId, selectedIndex) =>
        ipcRenderer.invoke('answer', { playerId, questionId, selectedIndex }),
});
