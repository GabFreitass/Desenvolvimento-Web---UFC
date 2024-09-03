const { GameConfig } = require("./config.js");

class GameState {
    constructor(gameId) {
        this.gameId = gameId;
        this.gameWidth = GameConfig.gameWidth;
        this.gameHeight = GameConfig.gameHeight;
        this.players = new Map(); // associa cada cliente a um player
        this.bullets = [];
        this.scores = new Map(); // associa cada cliente a sua pontuação
    }

    createPlayer(clientId, playerName, playerCharacter) {
        const player = {
            id: clientId,
            name: playerName,
            x: Math.random() * this.gameWidth,
            y: Math.random() * this.gameHeight,
            character: playerCharacter
        }
        this.players.set(clientId, player);
    }

    removePlayer(clientId) {
        if (this.players.has(clientId)) {
            this.players.delete(clientId);
        }
    }

    updatePlayers() {

    }

    updateBullets() {

    }

    update() {
        this.updatePlayers();
        this.updateBullets();
    }

    getState() {
        const playersObj = Object.fromEntries(this.players);
        const scoresObj = Object.fromEntries(this.scores);
        return ({
            gameId: this.gameId,
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            players: playersObj,
            bullets: this.bullets,
            scores: scoresObj
        });
    }
}

module.exports = GameState;