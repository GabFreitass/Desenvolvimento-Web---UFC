const { GameServerConfig } = require("./config.js");
const { Player } = require("./player.js");
const { Bullet } = require("./bullet.js");

class GameState {
    constructor(gameId) {
        this.gameId = gameId;
        this.gameWidth = GameServerConfig.gameWidth;
        this.gameHeight = GameServerConfig.gameHeight;
        this.players = new Map(); // associa cada cliente a um player
        this.bullets = [];
    }

    get entities() {
        return [...this.players.values(), ...this.bullets];
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

    createBullet(clientId) {
        const shooter = this.players.get(clientId);
        if (!shooter) return;
        if (!shooter.canFire) return false;
        const bullet = shooter.fire();
        this.bullets.push(bullet);
        return true;
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
            if (!player.isAlive) {
                this.removePlayer(clientId);
                continue;
            }
            player.update(deltaTime, this.entities);
        }
    }

    updateBullets(deltaTime) {
        this.bullets = this.bullets.filter(bullet => bullet.isAlive);
        for (const bullet of this.bullets) {
            bullet.update(deltaTime, this.entities)
        }
    }

    update(deltaTime) {
        this.updatePlayers(deltaTime);
        this.updateBullets(deltaTime);
    }

    getState() {
        const playersObj = Object.fromEntries(this.players);
        return ({
            gameId: this.gameId,
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            players: playersObj,
            bullets: this.bullets
        });
    }
}

module.exports = { GameState };