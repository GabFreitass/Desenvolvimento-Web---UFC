const { GameServerConfig } = require("./config.js");
const { Player } = require("./player.js");

class GameState {
    constructor(gameId) {
        this.gameId = gameId;
        this.gameWidth = GameServerConfig.gameWidth;
        this.gameHeight = GameServerConfig.gameHeight;
        this.players = new Map(); // associa cada cliente a um player
        this.bullets = [];
        this.scores = new Map(); // associa cada cliente a sua pontuação
    }

    createPlayer(clientId, playerName, playerCharacter) {
        const player = new Player(
            playerName,
            Math.random() * this.gameWidth,
            Math.random() * this.gameHeight,
            parseInt(playerCharacter)
        );
        this.players.set(clientId, player);
    }

    removePlayer(clientId) {
        if (this.players.has(clientId)) {
            this.players.delete(clientId);
        }
    }

    updatePlayer(clientId, newPlayer) {
        if (this.players.has(clientId)) {
            const player = this.players.get(clientId);
            this.updatePlayerAttributes(player, newPlayer);
        }
    }

    // o jogador só pode mudar a rotação (com o mouse) e sua aceleração (com o teclado)
    updatePlayerAttributes(player, newAttributes) {
        player.rotation = newAttributes.rotation;
        player.acceleration.x = newAttributes.acceleration.x;
        player.acceleration.y = newAttributes.acceleration.y;
    }

    updatePlayers(deltaTime) {
        for (const [clientId, player] of this.players) {
            player.update(deltaTime, this.players.values());
        }
    }

    updateBullets(deltaTime) {

    }

    update(deltaTime) {
        this.updatePlayers(deltaTime);
        this.updateBullets(deltaTime);
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

module.exports = { GameState };