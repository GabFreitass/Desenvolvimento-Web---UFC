import { Entity } from "./entity.js";

export class Bullet extends Entity {
    constructor(x, y, sprite, speed) {
        super(x, y, sprite, speed);
        this.durationTime = 2000;
        this.accumulatedTime = 0;
        this.isAlive = true;
        this.update = this.update.bind(this);
    }

    update(dt) {
        super.update(dt);
        this.move("UP");
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.durationTime) {
            this.isAlive = false;
            this.accumulatedTime = 0;
        }
    }
}
