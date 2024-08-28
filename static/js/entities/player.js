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
        this.fireRate = 4;
        this.canFire = true;
        this.accumulatedTime = 0;
        this.cursorPosition = new Vector2(0, 0);
        this.maxHealth = 1000;
        this.health = this.maxHealth; // Adicionando saúde inicial do jogador
    }

    updateCursorPosition(x, y) {
        this.cursorPosition.x = x;
        this.cursorPosition.y = y;
        this.updateRotation();
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
    }

    updateRotation() {
        const centerX = this.position.x + this.sprite.width / 2;
        const centerY = this.position.y + this.sprite.height / 2;
        const dx = this.cursorPosition.x - centerX;
        const dy = this.cursorPosition.y - centerY;
        this.sprite.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    }

    update(deltaTime, enemies = []) {
        super.update(deltaTime);
        this.updateRotation();
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime, enemies);
            return bullet.isAlive;
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
        const nameY = this.position.y + this.sprite.height + 30;
        ctx.fillText(this.name, Math.round(nameX), Math.round(nameY));
    }

    drawHealth(ctx) {
        const healthBarWidth = 100;
        const healthBarHeight = 10;
        const x = this.position.x + this.sprite.width / 2 - healthBarWidth / 2;
        const y = this.position.y - 20;

        // Desenha a barra de fundo
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(x, y, healthBarWidth, healthBarHeight);

        // Desenha a barra de vida atual
        const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fillRect(x, y, currentHealthWidth, healthBarHeight);

        // Desenha a borda da barra de vida
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, healthBarWidth, healthBarHeight);
    }

    draw(ctx, alpha) {
        this.bullets.forEach(bullet => bullet.draw(ctx, alpha));
        super.draw(ctx, alpha);
        this.drawName(ctx);
        this.drawHealth(ctx); // Chamando o novo método para desenhar a barra de vida
    }

    fire() {
        this.stop();
        if (!this.canFire) return;
        const bulletSprite = new Sprite(
            GameResources.bullets,
            3,
            2,
            20,
            80,
            false,
            1,
            1000, null, 40,
            80, 110, 41
        );
        const bulletX =
            this.position.x + this.sprite.width / 2 - bulletSprite.width / 2;
        const bulletY = this.position.y + this.sprite.height / 2 - bulletSprite.height / 2;
        const bullet = new Bullet(bulletX, bulletY, bulletSprite, 600);
        bullet.sprite.rotation = this.sprite.rotation;
        this.bullets.push(bullet);
        this.canFire = false;
    }
}
