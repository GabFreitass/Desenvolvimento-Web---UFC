const { GameServerConfig } = require('./config.js');
const { Entity } = require('./entity.js');
const { Vector2 } = require('./vector2.js');

class Bullet extends Entity {
    // shooter is a Player
    constructor(shooter) {
        super(shooter.position.x, shooter.position.y, GameServerConfig.bulletInitialSpeed, GameServerConfig.bulletMass, GameServerConfig.bulletCollisionRadius);
        this.shooter = shooter;
        this.isCollidable = false;
        this.rotation = shooter.rotation;
        const bulletVelX = GameServerConfig.bulletInitialSpeed * Math.cos(shooter.rotation - Math.PI / 2);
        const bulletVelY = GameServerConfig.bulletInitialSpeed * Math.sin(shooter.rotation - Math.PI / 2);
        this.velocity = new Vector2(bulletVelX, bulletVelY);
    }

    update(deltaTime, entities) {
        if (this.velocity.isZero) {
            this.isAlive = false;
        }
        if (!this.isCollidable) {
            if (this.isBulletLeftPlayer()) {
                this.isCollidable = true;
            }
        }

        super.update(deltaTime, entities);
    }

    isBulletLeftPlayer() {
        const distance = this.position.distTo(this.shooter.position);
        return distance > this.collisionRadius + this.shooter.collisionRadius;
    }
}

module.exports = { Bullet };