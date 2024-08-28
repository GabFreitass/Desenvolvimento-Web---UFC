import { Vector2 } from "../utils/vector2.js";

const EntityState = {
    MOVING: "MOVING",
    IDLE: "IDLE",
};

const MovingDirections = {
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    UP: "UP",
    DOWN: "DOWN",
};

export class Entity {
    constructor(x, y, sprite, speed) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.sprite = sprite;
        this.state = EntityState.IDLE;
        this.direction = MovingDirections.NONE;
        this.speed = speed;
    }

    stop() {
        this.state = EntityState.IDLE;
        this.direction = MovingDirections.NONE;
    }

    move(direction) {
        this.state = EntityState.MOVING;
        this.direction = direction;
    }

    update(deltaTime) {
        if (this.state === EntityState.IDLE) return;
        this.prevPosition.x = this.position.x;
        this.prevPosition.y = this.position.y;
        const dx = this.speed * (deltaTime / 1000);
        switch (this.direction) {
            case MovingDirections.RIGHT:
                this.position.x += dx;
                break;
            case MovingDirections.LEFT:
                this.position.x -= dx;
                break;
            case MovingDirections.UP:
                this.position.y -= dx;
                break;
            case MovingDirections.DOWN:
                this.position.y += dx;
                break;
        }
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
