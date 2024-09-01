import { EntityState, GameConfig } from "../core/constants.js";
import { Entity } from "./entity.js";

export class Enemy extends Entity {
    constructor(x, y, sprite) {
        super(x, y, sprite, GameConfig.gameParameters.maxPlayerSpeed);
    }

    update(dt) {
        super.update(dt);
        if (this.state === EntityState.IDLE) return;
        this.acceleration = this.velocity;
        this.acceleration = this.acceleration.normalize();
        this.acceleration = this.acceleration.scale(-GameConfig.gameParameters.entityDeacceleration);
    }
}