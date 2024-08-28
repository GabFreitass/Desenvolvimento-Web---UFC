import { Entity } from "./entity.js";

export class Bullet extends Entity {
    constructor(x, y, sprite, speed, damage=20) {
        super(x, y, sprite, speed);
        this.damage = damage;
        this.durationTime = 2000;
        this.accumulatedTime = 0;
        this.isAlive = true;
    }

    update(dt, enemies) {
        // Movimento da bala
        this.move(Math.cos(this.sprite.rotation - Math.PI / 2), Math.sin(this.sprite.rotation + Math.PI / 2));
        super.update(dt);

        // Verificar colisões com inimigos
        for (const enemy of enemies) {
            if (this.checkCollision(enemy)) {
                console.log('bullet collided!');
                this.isAlive = false;
                enemy.takeDamage(this.damage);
                break;
            }
        }

        // Verificar tempo de vida da bala
        this.accumulatedTime += dt;
        if (this.accumulatedTime >= this.durationTime) {
            this.isAlive = false;
            this.accumulatedTime = 0;
        }

        this.sprite.update(dt);
    }

    checkCollision(enemy) {
        return this.sprite.position.distTo(enemy.sprite.position) <= this.sprite.width;
    }
}
