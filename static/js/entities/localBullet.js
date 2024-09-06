import { Entity } from "./localEntity.js";
import { Sprite } from "../core/sprite.js";
import { GameResources } from "../core/constants.js";

export class Bullet extends Entity {
    constructor(x, y, rotation, velocity, collisionRadius) {
        const bulletSprite = new Sprite(
            GameResources.bullet,
            1,
            1,
            20,
            80,
            false,
            0,
            1000, 
            null, 
            40,
            80, 
            110, 
            20
        );
        super(x, y, bulletSprite, rotation, velocity, collisionRadius);
    }
}
