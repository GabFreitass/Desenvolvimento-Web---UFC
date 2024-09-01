import { Vector2 } from "../utils/vector2.js";
import { GameConfig } from "../core/constants.js";

const EntityState = {
    MOVING: "MOVING",
    IDLE: "IDLE",
};

export class Entity {
    constructor(x, y, sprite, maxVelocity, mass = 100) {
        this.position = new Vector2(x, y);
        this.sprite = sprite;
        this.maxVelocity = maxVelocity;
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.mass = mass; // Adicionamos massa para cálculos de colisão
    }

    get state() {
        if (this.velocity.isZero) {
            return EntityState.IDLE;
        } else {
            return EntityState.MOVING;
        }
    }

    stop() {
        this.velocity.setZero();
    }

    update(deltaTime, entities = []) {
        this.velocity = this.velocity.add(this.acceleration);

        if (this.state === EntityState.IDLE) return;
        // Limita a velocidade ao máximo
        if (this.velocity.magnitude > this.maxVelocity) {
            this.velocity = this.velocity.normalize();
            this.velocity = this.velocity.scale(this.maxVelocity);
        }

        if (this.velocity.magnitude < GameConfig.gameParameters.entityDeacceleration) {
            this.stop();
        }

        const newPosition = new Vector2(
            this.position.x + this.velocity.x * deltaTime,
            this.position.y + this.velocity.y * deltaTime
        );

        this.handleCollisions(newPosition, entities);

        this.position = newPosition;
    }

    handleCollisions(newPosition, entities) {
        for (const entity of entities) {
            if (entity === this) continue;

            if (this.checkCollision(newPosition, entity)) {
                this.resolveCollision(entity);
                this.stop();
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

        const restitution = 0.2; // Coeficiente de restituição (elasticidade da colisão)
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
