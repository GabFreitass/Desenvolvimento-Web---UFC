const { GameServerConfig } = require('./config.js');
const { Entity } = require('./entity.js');

class Player extends Entity {
    constructor(name, x, y, character) {
        super(x, y, GameServerConfig.playerMaxVelocity, GameServerConfig.playerMass, GameServerConfig.playerCollisionRadius);
        this.name = name;
        this.character = character;
        this.fireRate = 0.5;
        this.canFire = true;
        this.maxHealth = GameServerConfig.playerMaxHealth;
        this.health = this.maxHealth;
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
        if (this.health === 0) {
            this.isAlive = false;
        }
    }

    update(deltaTime, entities) {
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }

        super.update(deltaTime, entities);
    }
}

module.exports = { Player };