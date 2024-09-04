const { GameConfig } = require('./config.js');
const { Vector2 } = require('./vector2.js');

class Player {
    constructor(name, x, y, character) {
        this.name = name;
        this.position = new Vector2(x, y);
        this.character = character;
        this.rotation = 0;
        this.fireRate = 0.5;
        this.canFire = true;
        this.accumulatedTime = 0;
        this.maxHealth = GameConfig.playerMaxHealth;
        this.health = this.maxHealth;
        this.maxVelocity = GameConfig.playerMaxVelocity;
        this.acceleration = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.mass = GameConfig.playerMass;
        this.isAlive = true;
        this.collisionRadius = GameConfig.playerCollisionRadius;
    }

    stop() {
        this.acceleration.setZero();
        this.velocity.setZero();
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
        if (this.health === 0) {
            this.isAlive = false;
        }
    }

    update(deltaTime, players) {
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }

        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.scale(1 - (GameConfig.frictionFactor * this.mass));

        // limita a velocidade
        if (this.velocity.magnitude > this.maxVelocity) {
            this.velocity = this.velocity.normalize();
            this.velocity = this.velocity.scale(this.maxVelocity);
        }

        if (this.velocity.magnitude < 0.1) {
            this.stop();
        }

        const newPosition = new Vector2(
            this.position.x + this.velocity.x * deltaTime,
            this.position.y + this.velocity.y * deltaTime
        );

        this.handleCollisions(newPosition, players);
    }

    handleCollisions(newPosition, players) {
        for (const player of players) {
            if (player === this) continue;

            if (this.checkCollision(newPosition, player)) {
                this.resolveCollision(player);
            }
        }
        this.position = newPosition;
    }

    checkCollision(newPosition, otherEntity) {
        const distance = newPosition.distTo(otherEntity.position);
        return distance < this.collisionRadius + otherEntity.collisionRadius;
    }

    resolveCollision(otherPlayer) {
        const normal = this.position.subtract(otherPlayer.position).normalize();
        const relativeVelocity = this.velocity.subtract(otherPlayer.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);

        if (velocityAlongNormal > 0) return; // já estão se afastando

        const restitution = GameConfig.collisionRestitution;
        const impulseScalar = -(1 + restitution) * velocityAlongNormal;
        const impulse = normal.scale(impulseScalar / (1 / this.mass + 1 / otherPlayer.mass));

        // aplica o impulso às velocidades
        this.velocity = this.velocity.add(impulse.scale(1 / this.mass));
        otherPlayer.velocity = otherPlayer.velocity.subtract(impulse.scale(1 / otherPlayer.mass));

        // separa as entidades para evitar sobreposição
        const overlap = (this.collisionRadius + otherPlayer.collisionRadius) - this.position.distTo(otherPlayer.position);
        const separation = normal.scale(overlap / 2);
        this.position = this.position.add(separation);
        otherPlayer.position = otherPlayer.position.subtract(separation);
    }

    fire() {
        if (!this.canFire) return;
        this.stop();
        this.canFire = false;
    }
}

module.exports = { Player };