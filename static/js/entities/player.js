import { Bullet } from "./bullet.js";
import { Entity } from "./entity.js";
import { GameResources } from "../core/constants.js";
import { Sprite } from "../core/sprite.js";
import { Vector2 } from "../utils/vector2.js";

export class Player extends Entity {
    constructor(name, x, y, sprite, speed) {
        super(x, y, sprite, speed);
        this.name = name;
        this.bullets = [];
        this.fireRate = 5;
        this.canFire = true;
        this.accumulatedTime = 0;
        this.cursorPosition = new Vector2(0, 0);
    }

    updateCursorPosition(x, y) {
        this.cursorPosition.x = x;
        this.cursorPosition.y = y;
        this.updateRotation();
    }

    updateRotation() {
        const centerX = this.position.x + this.sprite.width / 2;
        const centerY = this.position.y + this.sprite.height / 2;
        const dx = this.cursorPosition.x - centerX;
        const dy = this.cursorPosition.y - centerY;
        this.sprite.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.updateRotation();
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }
        this.bullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (!bullet.isAlive) {
                delete this.bullets[index];
            }
        });
    }

    drawName(ctx) {
        // Configura o estilo do texto
        ctx.font = "32px Orbitron"; // Tamanho e fonte do texto
        ctx.fillStyle = "white"; // Cor de preenchimento
        ctx.textAlign = "center"; // Alinhamento horizontal
        ctx.textBaseline = "middle"; // Alinhamento vertical

        // Desenha o texto no canvas
        const nameX = this.position.x + this.sprite.width / 2;
        const nameY = this.position.y + this.sprite.height - 30;
        ctx.fillText(this.name, Math.round(nameX), Math.round(nameY));
    }

    draw(ctx, alpha) {
        super.draw(ctx, alpha);
        this.drawName(ctx);
        this.bullets.forEach((bullet) => {
            bullet.draw(ctx, alpha);
        });
    }

    fire() {
        if (!this.canFire) return;
        const bulletSprite = new Sprite(
            GameResources.bullets,
            3,
            2,
            128,
            128,
            false,
            1,
            1000,
            null
        );
        const bulletX =
            this.position.x + this.sprite.width / 2 - bulletSprite.width / 2;
        const bulletY = this.position.y - bulletSprite.height / 2;
        const bullet = new Bullet(bulletX, bulletY, bulletSprite, 600);
        this.bullets.push(bullet);
        this.canFire = false;
    }
}
