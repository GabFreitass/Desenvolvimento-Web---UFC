
import { Entity } from "./entity.js";
import { GameConfig, EntityType } from "../core/constants.js";

export class Player extends Entity {
    constructor(name, x, y, sprite, character, rotation) {
        const playerSprite = new Sprite(GameResources.spaceships[character], 1, 1, 180, 180);
        super(x, y, playerSprite, GameConfig.gameParameters.maxPlayerSpeed, GameConfig.gameParameters.playerCollisionDamage, EntityType.PLAYER, GameConfig.gameParameters.playerMass, rotation);
        this.name = name;
        this.fireRate = 0.5;
        this.sprite.frameIndex = character;
        this.character = character;
        this.canFire = true;
        this.rotation = rotation;
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

    update(deltaTime) {
        super.update(deltaTime);
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 1e3 / this.fireRate) {
            this.canFire = true;
            this.accumulatedTime = 0;
        }
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
        this.drawHealth(ctx); // Chamando o novo método para desenhar a barra de vida
        this.drawName(ctx);
    }

    fire() {
        if (!this.canFire) return;
        this.stop();
        this.canFire = false;
    }
}
