import { Vector2 } from "./vector2.js";

const EntityState = {
    MOVING: "MOVING",
    FIRING: "FIRING",
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
    speed = 100; // pixels / segundo;

    constructor(position, sprite) {
        this.position = new Vector2(position.x, position.y);
        this.prevPosition = new Vector2(position.x, position.y);
        this.sprite = sprite;
        this._state = EntityState.IDLE;
        this.direction = MovingDirections.NONE;

        // bind class methods
        this.move = this.move.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
    }

    set state(value) {
        if (value === EntityState.IDLE) {
            this.direction = MovingDirections.NONE;
        }
        this._state = value;
    }

    get state() {
        return this._state;
    }

    move(direction) {
        // moves only when entity is idle
        if (this.state !== EntityState.IDLE) return;
        this.direction = direction;
    }

    update(deltaTime) {
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
