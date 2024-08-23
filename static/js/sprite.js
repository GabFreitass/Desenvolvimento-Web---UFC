export class Sprite {
    constructor(
        resource,
        hFrames,
        vFrames,
        width,
        height,
        animatedSprite = false,
        frameIndex = 0,
        animationDelay = 1000,
        totalFrames = null
    ) {
        this.image = resource;
        this.hFrames = hFrames; // Largura de cada frame
        this.vFrames = vFrames; // Altura de cada frame
        this.width = width; // largura a ser desenhada no canvas
        this.height = height; // altura a ser desenhada no canvas
        this.totalFrames = totalFrames ?? hFrames * vFrames;
        this.currentFrame = frameIndex; // Índice do frame atual
        this.animatedSprite = animatedSprite;
        this.accumulatedTime = 0;
        this.rotation = 0;
        this.animationDelay = animationDelay;
        this.frames = this.extractFrames(); // Array para armazenar os frames

        // bind methods
        this.extractFrames = this.extractFrames.bind(this);
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.extractFrames = this.extractFrames.bind(this);
    }

    get frameWidth() {
        return this.image.width / this.hFrames;
    }
    get frameHeight() {
        return this.image.height / this.vFrames;
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

        const frame = this.frames[this.currentFrame];

        // Salva o estado do contexto
        ctx.save();

        // Move o contexto para o centro do sprite
        ctx.translate(x + this.width / 2, y + this.height / 2);

        // Aplica a rotação
        ctx.rotate(this.rotation);

        // Desenha o sprite com a origem no centro
        ctx.drawImage(
            this.image,
            frame.x,
            frame.y,
            this.frameWidth,
            this.frameHeight,
            -this.width / 2, // Ajusta a posição para centralizar o sprite
            -this.height / 2, // Ajusta a posição para centralizar o sprite
            this.width,
            this.height
        );

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
