import { Vector2 } from "../utils/vector2.js";

const EntityState = {
    MOVING: "MOVING",
    IDLE: "IDLE",
};

export class Entity {
    constructor(x, y, sprite, speed) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.sprite = sprite;
        this.state = EntityState.IDLE;
        this.direction = new Vector2(0, 1); // should be an unit vector
        this.speed = speed;
    }

    stop() {
        this.state = EntityState.IDLE;
        this.direction.x = 0;
        this.direction.y = 0;
    }

    move(directionX, directionY) {
        this.state = EntityState.MOVING;
        this.direction.x = directionX;
        this.direction.y = directionY;
    }

    update(deltaTime) {
        if (this.state === EntityState.IDLE) return;
        this.prevPosition.x = this.position.x;
        this.prevPosition.y = this.position.y;
        const dx = this.speed * (deltaTime / 1000);
        this.position.x += dx * Math.cos(this.direction.angle - Math.PI / 2);
        this.position.y += dx * Math.sin(this.direction.angle - Math.PI / 2);
                
        this.sprite.update(deltaTime);
    }

    draw(ctx, alpha) {
        this.sprite.draw(
            ctx,
            this.prevPosition.x +
                (this.position.x - this.prevPosition.x) * alpha,
            this.prevPosition.y +
                (this.position.y - this.prevPosition.y) * alpha
        );
    }
}
