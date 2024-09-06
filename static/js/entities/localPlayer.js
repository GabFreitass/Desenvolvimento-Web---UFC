
import { Entity } from "./localEntity.js";
import { GameResources } from "../core/constants.js";
import { Sprite } from "../core/sprite.js";

export class Player extends Entity {
    constructor(name, x, y, character, rotation, velocity, health, maxHealth, collisionRadius, score) {
        const playerSprite = new Sprite(GameResources.spaceships[character], 1, 1, 180, 180);
        super(x, y, playerSprite, rotation, velocity, collisionRadius);
        this.name = name;
        this.character = character;
        this.health = health;
        this.maxHealth = maxHealth;
        this.score = score;
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
        this.drawHealth(ctx);
        this.drawName(ctx);
    }
}
