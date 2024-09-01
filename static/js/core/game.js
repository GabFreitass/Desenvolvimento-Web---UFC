import { Resource } from "./resource.js"
import { Sprite } from "./sprite.js";
import { Player } from "../entities/player.js";
import { Input } from "./input.js";
import { EntityState, GameConfig, GameResources, GameStates } from "./constants.js";
import { playerName } from "../main.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = GameStates.UNREADY;
        this.player = null;
        this.gameInput = null;
        this.ctx = canvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;
        this.otherEntities = [];
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
        // load entities
        const enemySprite = new Sprite(
            GameResources.spaceship,
            1,
            10,
            128,
            128,
            false,
            0,
            1000
        );
        this.player = new Player(
            playerName,
            this.canvas.width / 2,
            this.canvas.height / 2,
            playerSprite
        );
        this.otherEntities.push(new Player(
            playerName,
            this.canvas.width / 3,
            this.canvas.height / 3,
            enemySprite
        ));

        // load game inputs
        this.gameInput = new Input(this.canvas);

        this.state = GameStates.READY;
    }

    handleInputs(gameInput, player) {
        const inputs = gameInput.inputKeys;
        this.updatePlayerRotation(gameInput.cursorPosition, player);
        player.acceleration.setZero();
        const accelerationFactor = player.mass * 1e-2;

        if (inputs.includes(GameConfig.controls.MOVE_LEFT)) {
            player.acceleration.x -= accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_RIGHT)) {
            player.acceleration.x += accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_UP)) {
            player.acceleration.y -= accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_DOWN)) {
            player.acceleration.y += accelerationFactor;
        } if (inputs.includes(GameConfig.controls.FIRE)) {
            player.fire();
        }
    }

    updatePlayerRotation(cursorPosition, player) {
        const dx = cursorPosition.x - player.position.x;
        const dy = cursorPosition.y - player.position.y;
        player.sprite.rotation = Math.atan2(dy, dx) + Math.PI / 2;
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
        this.handleInputs(this.gameInput, this.player);
        this.player.update(deltaTime, this.otherEntities);
        this.otherEntities = this.otherEntities.filter(entity => {
            entity.update(deltaTime);
            return entity.state !== EntityState.DEAD;
        });
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx, alpha);
        this.otherEntities.forEach(entity => entity.draw(this.ctx, alpha));
    }

    mainloop(timestamp) {
        if (this.state !== GameStates.RUNNING) return;

        this.accumulatedTime += timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        while (this.accumulatedTime >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulatedTime -= this.timeStep;
        }

        const alpha = this.accumulatedTime / this.timeStep;
        this.draw(alpha);

        this.rafId = requestAnimationFrame(this.mainloop);
    }
}

