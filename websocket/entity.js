const { GameServerConfig } = require('./config.js');
const { Vector2 } = require('./vector2.js');

class Entity {
    constructor(x, y, maxVelocity, mass, collisionRadius) {
        this.isCollidable = true;
        this.position = new Vector2(x, y);
        this.maxVelocity = maxVelocity;
        this.mass = mass;
        this.rotation = 0;
        this.accumulatedTime = 0;
        this.isAlive = true;
        this.collisionRadius = collisionRadius;
        this.acceleration = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
    }

    stop() {
        this.acceleration.setZero();
        this.velocity.setZero();
    }

    update(deltaTime, entities) {
        this.accumulatedTime += deltaTime;

        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.scale(1 - (GameServerConfig.frictionFactor * this.mass));

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

        this.handleCollisions(newPosition, entities);
        this.clampPosition(newPosition);
        this.position = newPosition;
    }

    clampPosition(newPosition) {
        if (newPosition.x > GameServerConfig.gameWidth) {
            newPosition.x = 0;
        }
        if (newPosition.x < 0) {
            newPosition.x = GameServerConfig.gameWidth;
        }
        if (newPosition.y > GameServerConfig.gameHeight) {
            newPosition.y = 0;
        }
        if (newPosition.y < 0) {
            newPosition.y = GameServerConfig.gameHeight;
        }
    }

    handleCollisions(newPosition, entities) {
        for (const entity of entities) {
            if (entity === this) continue;
            if (!this.isCollidable || !entity.isCollidable) continue;

            if (this.checkCollision(newPosition, entity)) {
                // se for uma bala, destroi ela apos a colisao e da dano ao player acertado
                if (this.shooter) {
                    this.isAlive = false;
                    if (entity.health) {
                        entity.takeDamage(GameServerConfig.bulletDamage);

                        if (!entity.isAlive && this.shooter != entity) {
                            this.shooter.gainScore(1);
                        }
                    }
                    return;
                    // se for um player colidindo com outro
                } else {
                    if (entity.health) {
                        this.takeDamage(GameServerConfig.playerCollisionDamage);
                        entity.takeDamage(GameServerConfig.playerCollisionDamage);
                    }
                }
                this.resolveCollision(entity);
            }
        }
    }

    checkCollision(newPosition, otherEntity) {
        const distance = newPosition.distTo(otherEntity.position);
        return distance < this.collisionRadius + otherEntity.collisionRadius;
    }

    resolveCollision(otherEntity) {
        const normal = this.position.subtract(otherEntity.position).normalize();
        const relativeVelocity = this.velocity.subtract(otherEntity.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);

        if (velocityAlongNormal > 0) return; // já estão se afastando

        const restitution = GameServerConfig.collisionRestitution;
        const impulseScalar = -(1 + restitution) * velocityAlongNormal;
        const impulse = normal.scale(impulseScalar / (1 / this.mass + 1 / otherEntity.mass));

        // aplica o impulso às velocidades
        this.velocity = this.velocity.add(impulse.scale(1 / this.mass));
        otherEntity.velocity = otherEntity.velocity.subtract(impulse.scale(1 / otherEntity.mass));

        // separa as entidades para evitar sobreposição
        const overlap = (this.collisionRadius + otherEntity.collisionRadius) - this.position.distTo(otherEntity.position);
        const separation = normal.scale(overlap / 2);
        this.position = this.position.add(separation);
        otherEntity.position = otherEntity.position.subtract(separation);
    }
}

module.exports = { Entity };