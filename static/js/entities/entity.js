import { GameConfig } from "../core/constants.js";
import { Vector2 } from "../utils/vector2.js";

export class Entity {
    constructor(x, y, sprite, rotation, velocity, mass, collisionRadius) {
        this.position = new Vector2(x, y);
        this.sprite = sprite;
        this.updateRotation(rotation);
        this.velocity = velocity;
        this.mass = mass;
        this.acceleration = new Vector2(0, 0);
        this.collisionRadius = collisionRadius;
    }

    updateRotation(newRotation) {
        this.rotation = newRotation;
        this.sprite.rotation = newRotation;
    }

    draw(ctx, alpha) {
        const interpolatedX = this.position.x + (this.velocity.x * alpha);
        const interpolatedY = this.position.y + (this.velocity.y * alpha);
        this.sprite.draw(ctx, interpolatedX, interpolatedY);
        if (GameConfig.SHOW_COLLISION_CIRCLES) {
            // Desenha um círculo em torno da posição do sprite
            ctx.beginPath();
            ctx.arc(interpolatedX, interpolatedY, this.collisionRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red'; // Cor do círculo
            ctx.lineWidth = 2; // Espessura da linha
            ctx.stroke();
        }
    }
}
