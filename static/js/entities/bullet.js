import { Entity } from "./entity.js";

export class Bullet extends Entity {
    constructor(x, y, sprite, maxVelocity, rotation, damage = 20) {
        super(x, y, sprite, maxVelocity);
        this.damage = damage;
        this.durationTime = 2000;
        this.accumulatedTime = 0;
        this.isAlive = true;
        this.sprite.rotation = rotation;
    }

    update(dt) {
        super.update(dt);
        // Movimento da bala

        // Verificar tempo de vida da bala
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.durationTime) {
            this.isAlive = false;
            this.accumulatedTime = 0;
        }
    }
}
