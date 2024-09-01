import { GameConfig } from "../core/constants.js";
import { Entity } from "./entity.js";

export class Enemy extends Entity {
    constructor(x, y, sprite) {
        super(x, y, sprite, GameConfig.gameParameters.maxPlayerSpeed);
    }
}