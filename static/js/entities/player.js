import { Bullet } from "./bullet.js";
import { Entity } from "./entity.js";
import { GameResources, GameConfig, EntityType } from "../core/constants.js";
import { Sprite } from "../core/sprite.js";

export class Player extends Entity {
    constructor(name, x, y, sprite) {
        super(x, y, sprite, GameConfig.gameParameters.maxPlayerSpeed, GameConfig.gameParameters.playerCollisionDamage, EntityType.PLAYER, GameConfig.gameParameters.playerMass);
        this.name = name;
        this.bullets = [];
        this.fireRate = 4;
        this.canFire = true;
        this.accumulatedTime = 0;
        this.maxHealth = 1000;
        this.health = this.maxHealth;
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
        if (this.health === 0) {
            this.isAlive = false;
        }
    }

    update(deltaTime, otherEntities = []) {
        super.update(deltaTime, otherEntities);
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime, otherEntities);
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
        const nameX = this.position.x;
        const nameY = this.position.y + this.sprite.height / 2 + 20;
        ctx.fillText(this.name, nameX, nameY);
    }

    drawHealth(ctx) {
        const healthBarWidth = 100;
        const healthBarHeight = 10;
        const x = this.position.x - healthBarWidth / 2;
        const y = this.position.y - this.sprite.height / 2 - 20;

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
        super.draw(ctx, alpha);
        this.bullets.forEach(bullet => bullet.draw(ctx, alpha));
        this.drawHealth(ctx); // Chamando o novo método para desenhar a barra de vida
        this.drawName(ctx);
    }

    fire() {
        if (!this.canFire) return;
        this.stop();
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
        const bullet = new Bullet(this.position.x, this.position.y, bulletSprite, this.sprite.rotation);
        this.bullets.push(bullet);
        this.canFire = false;
    }
}
