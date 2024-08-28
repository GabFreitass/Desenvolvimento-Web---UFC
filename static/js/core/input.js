import { Vector2 } from "../utils/vector2.js";

export class Input {
    constructor(canvas) {
        this.inputKeys = [];
        this.cursorPosition = new Vector2(0, 0);

        document.addEventListener("keydown", this.keydownListener.bind(this));
        document.addEventListener("keyup", this.keyupListener.bind(this));
        document.addEventListener("visibilitychange", (event) => {
            this.inputKeys = [];
        });
        canvas.addEventListener("pointermove", this.pointerMoveListener.bind(this));
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

    pointerMoveListener(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const scaleX = event.currentTarget.width / rect.width;
        const scaleY = event.currentTarget.height / rect.height;
        
        this.cursorPosition.x = (event.clientX - rect.left) * scaleX;
        this.cursorPosition.y = (event.clientY - rect.top) * scaleY;
    }
}
