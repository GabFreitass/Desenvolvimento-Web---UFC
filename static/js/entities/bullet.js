import { EntityState, GameConfig } from "../core/constants.js";
import { Entity } from "./entity.js";

export class Bullet extends Entity {
    constructor(x, y, sprite, rotation, damage = 20) {
        super(x, y, sprite, GameConfig.gameParameters.initialBulletSpeed);
        this.damage = damage;
        this.durationTime = GameConfig.gameParameters.bulletDuration;
        this.accumulatedTime = 0;
        this.isAlive = true;
        this.sprite.rotation = rotation;
        this.velocity.x = this.maxVelocity * Math.cos(this.sprite.rotation - Math.PI / 2);
        this.velocity.y = this.maxVelocity * Math.sin(this.sprite.rotation - Math.PI / 2);
        this.accelerationVec.x = this.velocity.x;
        this.accelerationVec.y = this.velocity.y;
        this.accelerationVec.normalize();
        this.accelerationVec.scale(-GameConfig.gameParameters.bulletDeacceleration);
    }

    update(dt, otherEntities) {
        // Verificar tempo de vida da bala
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.durationTime || this.state === EntityState.IDLE) {
            this.isAlive = false;
            this.accumulatedTime = 0;
        }
        super.update(dt, otherEntities);
    }
}
