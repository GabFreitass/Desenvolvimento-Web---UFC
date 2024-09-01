export class Vector2 {
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

    multiply(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y;
    }

    add(otherVector) {
        this.x += otherVector.x;
        this.y += otherVector.y;
    }

    subtract(otherVector) {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    normalize() {
        if (this.isZero) {
            throw new Error("Cannot normalize a zero vector");
        }
        this.x /= this.magnitude;
        this.y /= this.magnitude;
    }

    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
}
