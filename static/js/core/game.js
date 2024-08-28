import { Resource } from "./resource.js"
import { Sprite } from "./sprite.js";
import { Player } from "../entities/player.js";
import { Input } from "./input.js";
import { GameConfig, GameResources, GameStates } from "./constants.js";
import { playerName } from "../main.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = GameStates.UNREADY;
        this.player = null;
        this.enemies = [];
        this.gameInput = null;
        this.ctx = canvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;

        this.mainloop = this.mainloop.bind(this);
    }

    async load() {
        this.state = GameStates.LOADING;

        // load resources
        GameResources.spaceship = new Resource("assets/ships_0.png");
        GameResources.bullets = new Resource("assets/bullets.png");
        const loadResources = Object.values(GameResources).map((resource) =>
            resource.load()
        );
        await Promise.all(loadResources);

        // load entities
        const playerSprite = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            0,
            1000
        );
        const enemySprite = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            8,
            1000
        );
        const enemySprite2 = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            5,
            1000
        );
        const enemySprite3 = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            3,
            1000
        );
        this.enemies.push(new Player('Enemy', 400, 400, enemySprite, 100));
        this.enemies.push(new Player('Enemy 2', 200, 200, enemySprite2, 100));
        this.enemies.push(new Player('Enemy 3', 600, 800, enemySprite3, 100));
        this.player = new Player(
            playerName,
            (this.canvas.width - playerSprite.width) / 2,
            (this.canvas.height - playerSprite.height) / 2,
            playerSprite,
            500
        );

        // load game inputs
        this.gameInput = new Input(this.canvas);

        this.state = GameStates.READY;
    }

    handleInputs() {
        // Atualiza a posição do cursor
        this.player.updateCursorPosition(this.gameInput.cursorPosition.x, this.gameInput.cursorPosition.y);
        const keys = this.gameInput.inputKeys;

        let moveX = 0;
        let moveY = 0;

        if (keys.includes(GameConfig.MOVE_LEFT)) {
            moveX -= 1;
        }
        if (keys.includes(GameConfig.MOVE_RIGHT)) {
            moveX += 1;
        }
        if (keys.includes(GameConfig.MOVE_UP)) {
            moveY += 1;
        }
        if (keys.includes(GameConfig.MOVE_DOWN)) {
            moveY -= 1;
        }

        if (moveX !== 0 || moveY !== 0) {
            this.player.move(moveX, moveY);
        } else {
            this.player.stop();
        }

        if (keys.includes(GameConfig.FIRE)) {
            this.player.fire();
        }
    }

    start() {
        if (this.state !== GameStates.READY) return;
        this.state = GameStates.RUNNING;
        this.lastFrameTime = performance.now();
        this.rafId = requestAnimationFrame(this.mainloop);
    }

    pause() {
        if (this.state == GameStates.RUNNING) {
            cancelAnimationFrame(this.rafId);
            this.state = GameStates.PAUSED;
        }
    }

    update(deltaTime) {
        this.handleInputs();
        this.player.update(deltaTime, this.enemies);
        this.enemies.forEach(enemy => enemy.update(deltaTime));
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx, alpha);
        this.enemies.forEach(enemy => enemy.draw(this.ctx, alpha));
    }

    mainloop(timestamp) {
        if (this.state !== GameStates.RUNNING) return;
        const deltaTime = Math.min(timestamp - this.lastFrameTime, this.timeStep);
        this.lastFrameTime = timestamp;

        this.accumulatedTime += deltaTime;
        let numUpdates = 0;

        while (this.accumulatedTime >= this.timeStep && numUpdates <= GameConfig.MAXUPDATES) {
            this.update(this.timeStep);
            this.accumulatedTime -= this.timeStep;
            numUpdates++;
        }

        let alpha = this.accumulatedTime / this.timeStep;
        this.draw(alpha);

        // request next frame
        this.rafId = requestAnimationFrame(this.mainloop);
    }
}

