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

    updatePlayers() {

    }

    updateBullets() {

    }

    update() {
        this.updatePlayers();
        this.updateBullets();
    }

    getState() {
        return ({
            gameId: this.gameId,
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            players: this.players,
            bullets: this.bullets,
            scores: this.scores
        });
    }
}

module.exports = GameState;