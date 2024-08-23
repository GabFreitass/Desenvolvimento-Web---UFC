export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get value() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    distTo(otherVector) {
        return Math.sqrt(
            Math.pow(otherVector.x - this.x, 2) +
                Math.pow(otherVector.y - this.y, 2)
        );
    }

    add(otherVector) {
        return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
    }

    subtract(otherVector) {
        return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    normalize() {
        if (this.value === 0) {
            throw new Error("Cannot normalize a zero vector");
        }
        this.x /= this.value;
        this.y /= this.value;
    }

    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
}
