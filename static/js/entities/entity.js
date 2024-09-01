import { Vector2 } from "../utils/vector2.js";
import { EntityState, EntityType, GameConfig } from "../core/constants.js";
import { game, gameCanvas } from "../main.js";

export class Entity {
    constructor(x, y, sprite, maxVelocity, damage, entityType, mass) {
        this.position = new Vector2(x, y);
        this.sprite = sprite;
        this.damage = damage;
        this.maxVelocity = maxVelocity;
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.entityType = entityType;
        this.mass = mass; // Adicionamos massa para cálculos de colisão
        this.isAlive = true;
    }

    get state() {
        if (!this.isAlive) {
            return EntityState.DEAD;
        }
        if (this.velocity.isZero) {
            return EntityState.IDLE;
        } else {
            return EntityState.MOVING;
        }
    }

    stop() {
        this.acceleration.setZero();
        this.velocity.setZero();
    }

    update(deltaTime, entities) {
        if (this.state === EntityState.DEAD) return;

        this.velocity = this.velocity.add(this.acceleration);

        if (this.state === EntityState.IDLE) return;

        // apply friction
        this.velocity = this.velocity.scale(1 - (GameConfig.gameParameters.frictionFactor * this.mass));

        // Limita a velocidade ao máximo
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
        this.updatePosition(newPosition);
    }

    updatePosition(newPosition) {
        this.position = newPosition;
        this.clampPositionToCanvas();
    }

    clampPositionToCanvas() {
        const canvasRect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / canvasRect.width;
        const scaleY = gameCanvas.height / canvasRect.height;
        this.position.x %= scaleX * canvasRect.width;
        if (this.position.x < 0) {
            this.position.x = scaleX * canvasRect.width;
        }
        this.position.y %= scaleY * canvasRect.height + this.sprite.collisionRadius;
        if (this.position.y < 0) {
            this.position.y = scaleY * canvasRect.height;
        }
    }

    handleCollisions(newPosition, entities) {
        for (const entity of entities) {
            if (entity === this) continue;

            if (this.checkCollision(newPosition, entity)) {
                // no collision with bullet and its shooter
                if (this.entityType === EntityType.BULLET && entity === this.shooter) {
                    continue;
                };

                // no collision with shooter and its bullet
                if (this.entityType === EntityType.PLAYER && entity.entityType === EntityType.BULLET && entity.shooter === this) {
                    continue;
                }

                this.resolveCollision(entity);

                if (this.entityType === EntityType.BULLET) {
                    this.stop();
                }
                if (this.entityType === EntityType.PLAYER) {
                    this.takeDamage(entity.damage);
                }
                if (entity.entityType === EntityType.PLAYER) {
                    entity.takeDamage(this.damage);

                    if (entity.state === EntityState.DEAD) {
                        game.gainScore(1);
                    }
                }
            }
        }
    }

    checkCollision(newPosition, otherEntity) {
        const distance = newPosition.distTo(otherEntity.position);
        return distance < this.sprite.collisionRadius + otherEntity.sprite.collisionRadius;
    }

    resolveCollision(otherEntity) {
        const normal = this.position.subtract(otherEntity.position).normalize();
        const relativeVelocity = this.velocity.subtract(otherEntity.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);

        if (velocityAlongNormal > 0) return; // Já estão se afastando

        const restitution = 0.5; // Coeficiente de restituição (elasticidade da colisão)
        const impulseScalar = -(1 + restitution) * velocityAlongNormal;
        const impulse = normal.scale(impulseScalar / (1 / this.mass + 1 / otherEntity.mass));

        // Aplica o impulso às velocidades
        this.velocity = this.velocity.add(impulse.scale(1 / this.mass));
        otherEntity.velocity = otherEntity.velocity.subtract(impulse.scale(1 / otherEntity.mass));

        // Separa as entidades para evitar sobreposição
        const overlap = (this.sprite.collisionRadius + otherEntity.sprite.collisionRadius) - this.position.distTo(otherEntity.position);
        const separation = normal.scale(overlap / 2);
        this.position = this.position.add(separation);
        otherEntity.position = otherEntity.position.subtract(separation);
    }

    draw(ctx, alpha) {
        const interpolatedX = this.position.x + (this.velocity.x * alpha);
        const interpolatedY = this.position.y + (this.velocity.y * alpha);
        this.sprite.draw(ctx, interpolatedX, interpolatedY);
    }
}
