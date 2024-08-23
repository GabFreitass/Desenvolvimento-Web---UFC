import { Vector2 } from "./vector2.js";

export class Input {
    constructor(canvas) {
        this.inputKeys = [];
        this.cursorPosition = new Vector2(0, 0);

        // Vinculando os listeners ao contexto da instância
        this.keydownListener = this.keydownListener.bind(this);
        this.keyupListener = this.keyupListener.bind(this);
        this.mouseListener = this.mouseListener.bind(this);

        document.addEventListener("keydown", this.keydownListener);
        document.addEventListener("keyup", this.keyupListener);
        document.addEventListener("visibilitychange", (event) => {
            this.inputKeys = [];
        });
        canvas.addEventListener("mousemove", this.mouseListener);
    }

    get pressingKey() {
        return this.inputKeys.length !== 0;
    }

    get currentKey() {
        return this.inputKeys[0] ?? null;
    }

    keydownListener(event) {
        const key = event.code;
        if (this.inputKeys.indexOf(key) === -1) {
            this.inputKeys.unshift(key);
        }
    }

    keyupListener(event) {
        const key = event.code;
        const keyIndex = this.inputKeys.indexOf(key);
        if (keyIndex === -1) {
            return;
        }
        this.inputKeys.splice(keyIndex, 1);
    }

    mouseListener(event) {
        this.cursorPosition.x = event.clientX;
        this.cursorPosition.y = event.clientY;
    }
}
