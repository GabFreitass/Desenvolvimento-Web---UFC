// Entidade pode ser: PROJÉTIL, PLAYERS...


import { Vector2 } from "../utils/vector2.js";
import { GameConfig, EntityState } from "../core/constants.js";

export class Entity {
    constructor(x, y, sprite, maxVelocity) {
        this.position = new Vector2(x, y);
        this.sprite = sprite;
        this.maxVelocity = maxVelocity;
        this.velocity = new Vector2(0, 0);
        this.accelerationVec = new Vector2(0, 0);
        this.acceleration = GameConfig.gameParameters.entityAcceleration; // para controlar a aceleração
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

    update(deltaTime, otherEntities = []) {
        this.sprite.update(deltaTime);

        // Aplica a aceleração à velocidade
        this.velocity.add(this.accelerationVec);

        if (this.state === EntityState.IDLE) return;

        // Limita a velocidade ao máximo
        if (this.velocity.magnitude > this.maxVelocity) {
            this.velocity.normalize();
            this.velocity.scale(this.maxVelocity);
        }

        if (this.velocity.magnitude < 0.1) {
            this.stop();
        }
        const newPosition = new Vector2(this.position.x + this.velocity.x * deltaTime, this.position.y + this.velocity.y * deltaTime);

        // if not colliding with any other entity
        if (!otherEntities.some((entity) => this.checkCollision(newPosition, entity))) {
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        } else {
            this.stop();
        }
    }

    checkCollision(newPosition, otherEntity) {
        if (newPosition.distTo(otherEntity.position) < this.sprite.colisionRadius + otherEntity.sprite.colisionRadius) {
            return true;
        }
        return false;
    }

    draw(ctx, alpha) {
        const interpolatedX = this.position.x + (this.velocity.x * alpha);
        const interpolatedY = this.position.y + (this.velocity.y * alpha);
        this.sprite.draw(ctx, interpolatedX, interpolatedY);
    }
}
