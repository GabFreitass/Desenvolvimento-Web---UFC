import { Vector2 } from "../utils/vector2.js";
import { GameConfig } from "./constants.js";

export class Sprite {
    constructor(
        resource,
        hFrames,
        vFrames,
        width = null,
        height = null,
        animatedSprite = false,
        frameIndex = 0,
        animationDelay = 1000,
        totalFrames = null,
        spriteWidth = null,
        spriteHeight = null,
        spriteOffsetX = 0,
        spriteOffsetY = 0,
    ) {
        this.image = resource;
        this.hFrames = hFrames; // Largura de cada frame
        this.vFrames = vFrames; // Altura de cada frame
        this.spriteWidth = spriteWidth ?? this.frameWidth; // Largura do sprite em px
        this.spriteHeight = spriteHeight ?? this.frameHeight; // Altura do sprite em px
        this.width = width ?? this.frameWidth; // largura a ser desenhada no canvas
        this.height = height ?? this.frameHeight; // altura a ser desenhada no canvas
        this.totalFrames = totalFrames ?? hFrames * vFrames;
        this.spriteOffsetX = spriteOffsetX;
        this.spriteOffsetY = spriteOffsetY;
        this.currentFrame = frameIndex; // Índice do frame atual
        this.animatedSprite = animatedSprite;
        this.accumulatedTime = 0;
        this.rotation = 0;
        this.animationDelay = animationDelay;
        this.frames = this.extractFrames(); // Array para armazenar os frames
    }

    get frameWidth() {
        return this.image.width / this.hFrames;
    }
    get frameHeight() {
        return this.image.height / this.vFrames;
    }

    get frame() {
        return this.frames[this.currentFrame];
    }

    get collisionRadius() {
        return this.height * GameConfig.ENTITY_COLLISION_RADIUS / 4;
    }

    // Método para extrair os frames do sprite sheet
    extractFrames() {
        const frames = [];
        for (let i = 0; i < this.totalFrames; i++) {
            const x = (i % this.hFrames) * this.frameWidth;
            const y = Math.floor(i / this.hFrames) * this.frameHeight;
            frames.push({ x, y });
        }
        return frames;
    }

    // Método para desenhar o frame atual no canvas com rotação
    draw(ctx, x, y) {
        if (!this.image.isLoaded) {
            return; // Não desenha até que a imagem esteja carregada
        }

        const spriteTopLeftX = this.frame.x + this.spriteOffsetX;
        const spriteTopLeftY = this.frame.y + this.spriteOffsetY;

        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(this.rotation);


        // Desenha o sprite com a origem no centro
        ctx.drawImage(
            this.image,
            spriteTopLeftX,
            spriteTopLeftY,
            this.spriteWidth,
            this.spriteHeight,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        if (GameConfig.SHOW_COLLISION_CIRCLES) {
            // Desenha um círculo em torno da posição do sprite
            ctx.beginPath();
            ctx.arc(0, 0, this.collisionRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red'; // Cor do círculo
            ctx.lineWidth = 2; // Espessura da linha
            ctx.stroke();
        }

        // Restaura o estado anterior do contexto
        ctx.restore();
    }

    // Método para avançar para o próximo frame
    update(dt) {
        if (!this.animatedSprite) return;
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.animationDelay) {
            let nextFrame = this.currentFrame + 1;
            if (nextFrame < this.totalFrames) {
                this.currentFrame = nextFrame;
            }
            this.accumulatedTime = 0;
        }
    }
}
