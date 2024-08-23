import { Resource } from "./resource.js";

export class Sprite {
    frame_delay = 1000; // time between animation frames in milisseconds

    constructor(
        imageUrl,
        frameWidth,
        frameHeight,
        width,
        height,
        animatedSprite = false,
        frameIndex = 0
    ) {
        this.image = new Resource(imageUrl);
        this.frameWidth = frameWidth; // Largura de cada frame
        this.frameHeight = frameHeight; // Altura de cada frame
        this.width = width; // largura a ser desenhada no canvas
        this.height = height; // altura a ser desenhada no canvas
        this.frames = []; // Array para armazenar os frames
        this.currentFrame = frameIndex; // Índice do frame atual
        this.animatedSprite = animatedSprite;
        this.accumulatedTime = 0;

        this.load = this.load.bind(this);
        this.extractFrames = this.extractFrames.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
    }

    async load() {
        await this.image.load();
        this.extractFrames();
    }

    // Método para extrair os frames do sprite sheet
    extractFrames() {
        const totalFrames =
            (this.image.width / this.frameWidth) *
            (this.image.height / this.frameHeight);
        for (let i = 0; i < totalFrames; i++) {
            const x =
                (i % (this.image.width / this.frameWidth)) * this.frameWidth;
            const y =
                Math.floor(i / (this.image.width / this.frameWidth)) *
                this.frameHeight;
            this.frames.push({ x, y });
        }
    }

    // Método para desenhar o frame atual no canvas
    draw(ctx, x, y) {
        if (!this.image.isLoaded) {
            return; // Não desenha até que a imagem esteja carregada
        }
        const frame = this.frames[this.currentFrame];
        ctx.drawImage(
            this.image,
            frame.x,
            frame.y,
            this.frameWidth,
            this.frameHeight,
            Math.round(x),
            Math.round(y),
            this.width,
            this.height
        );
    }

    // Método para avançar para o próximo frame
    update(dt) {
        if (!this.animatedSprite) return;
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.frame_delay) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.accumulatedTime = 0;
        }
    }
}
