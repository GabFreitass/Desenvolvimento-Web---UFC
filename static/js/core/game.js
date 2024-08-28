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
            5,
            1000
        );
        const enemySprite = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            4,
            1000
        );
        this.enemies.push(new Player('Enemy', 400, 400, enemySprite, 100));
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
        switch (this.gameInput.currentKey) {
            case GameConfig.MOVE_LEFT:
                this.player.move(-1, 0);
                break;
            case GameConfig.MOVE_RIGHT:
                this.player.move(1, 0);
                break;
            case GameConfig.MOVE_UP:
                this.player.move(0, 1);
                break;
            case GameConfig.MOVE_DOWN:
                this.player.move(0, -1);
                break;
            case GameConfig.FIRE:
                this.player.stop();
                this.player.fire();
                break;
            // when key is released
            case null:
                this.player.stop();
                break;
            default:
                this.player.stop();
                break;
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
        this.player.update(deltaTime);
        this.enemies.forEach(enemy => enemy.update(deltaTime));
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx, alpha);
        this.enemies.forEach(enemy => enemy.draw(this.ctx, alpha));
    }

    mainloop(timestamp) {
        if (this.state !== GameStates.RUNNING) return;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        this.accumulatedTime += deltaTime;

        while (this.accumulatedTime >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulatedTime -= this.timeStep;
        }

        let alpha = this.accumulatedTime / this.timeStep;
        this.draw(alpha);

        // request next frame
        this.rafId = requestAnimationFrame(this.mainloop);
    }
}

