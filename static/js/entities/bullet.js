import { Entity } from "./entity.js";

export class Bullet extends Entity {
    constructor(x, y, sprite, speed) {
        super(x, y, sprite, speed);
        this.durationTime = 2000;
        this.accumulatedTime = 0;
        this.isAlive = true;
    }

    update(dt) {
        // move bullet towards
        this.move(Math.cos(this.sprite.rotation - Math.PI / 2), Math.sin(this.sprite.rotation + Math.PI / 2));
        super.update(dt);

        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.durationTime) {
            this.isAlive = false;
            this.accumulatedTime = 0;
        }

        this.sprite.update(dt);
    }
}
