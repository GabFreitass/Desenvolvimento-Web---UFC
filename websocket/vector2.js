class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    get angle() {
        return Math.atan2(this.x, this.y);
    }

    get isZero() {
        return this.x === 0 && this.y === 0;
    }

    distTo(otherVector) {
        return Math.sqrt(
            Math.pow(otherVector.x - this.x, 2) +
            Math.pow(otherVector.y - this.y, 2)
        );
    }

    setZero() {
        this.x = 0;
        this.y = 0;
    }

    dot(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y;
    }

    add(otherVector) {
        return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
    }

    subtract(otherVector) {
        return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
    }

    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    rotate(theta) {
        return new Vector2(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) + this.y * Math.cos(theta));
    }

    normalize() {
        if (this.isZero) {
            throw new Error("Cannot normalize a zero vector");
        }
        return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
    }

    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
}

module.exports = { Vector2 };