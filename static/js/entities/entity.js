// Entidade pode ser: PROJÉTIL, PLAYERS...


import { Vector2 } from "../utils/vector2.js";
import { GameConfig, EntityState } from "../core/constants.js";

export class Entity {
    constructor(x, y, sprite, maxVelocity) {
        this.position = new Vector2(x, y);
        this.sprite = sprite;
        this.state = EntityState.IDLE;
        this.maxVelocity = maxVelocity;
        this.velocity = new Vector2(0, 0);
        this.accelerationVec = new Vector2(0, 0);
        this.acceleration = GameConfig.gameParameters.entityAcceleration; // para controlar a aceleração
    }

    stop() {
        this.velocity.setZero();
        this.state = EntityState.IDLE;
    }

    update(deltaTime) {
        if (this.state === EntityState.IDLE) return;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.sprite.update(deltaTime);
    }

    draw(ctx, alpha) {
        const interpolatedX = this.position.x + (this.velocity.x * alpha);
        const interpolatedY = this.position.y + (this.velocity.y * alpha);
        this.sprite.draw(ctx, interpolatedX, interpolatedY);
    }
}
