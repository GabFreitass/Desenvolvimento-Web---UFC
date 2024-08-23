import { Sprite } from "./sprite.js";
import { Entity } from "./entity.js";
import { Input } from "./input.js";

const gameCanvas = document.querySelector("canvas#game-canvas");

const GameStates = {
    UNREADY: "UNREADY",
    READY: "READY",
    RUNNING: "RUNNING",
    LOADING: "LOADING",
    PAUSED: "PAUSED",
};

const GameConfig = {
    MAXFPS: 60,

    // controls
    MOVE_LEFT: "KeyA",
    MOVE_RIGHT: "KeyD",
    MOVE_UP: "KeyW",
    MOVE_DOWN: "KeyS",
    FIRE: "KeyF",
};

class Game {
    constructor() {
        this.state = GameStates.UNREADY;
        this.player = null;
        this.entities = [];
        this.sprites = {
            spaceship: null,
        };
        this.gameInput = null;
        this.ctx = gameCanvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;
    }

    async load() {
        this.state = GameStates.LOADING;

        // load sprites
        this.sprites.spaceship = new Sprite(
            "assets/ships_0.png",
            256,
            256,
            64,
            64,
            false,
            1
        );
        const loadSprites = Object.values(this.sprites).map((sprite) =>
            sprite.load()
        );
        await Promise.all(loadSprites);

        // load entities
        this.player = new Entity({ x: 0, y: 0 }, this.sprites.spaceship);
        this.entities.push(this.player);

        // load game inputs
        this.gameInput = new Input(gameCanvas);

        // bind game methods
        this.load = this.load.bind(this);
        this.handleInputs = this.handleInputs.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.mainloop = this.mainloop.bind(this);

        this.state = GameStates.READY;
    }

    handleInputs() {
        switch (this.gameInput.currentKey) {
            case GameConfig.MOVE_LEFT:
                this.player.move("LEFT");
                break;
            case GameConfig.MOVE_RIGHT:
                this.player.move("RIGHT");
                break;
            case GameConfig.MOVE_UP:
                this.player.move("UP");
                break;
            case GameConfig.MOVE_DOWN:
                this.player.move("DOWN");
                break;

            // when key is released
            case null:
                this.player.state = "IDLE";
        }
    }

    start() {
        if (this.state !== GameStates.READY) return;
        this.state = GameStates.RUNNING;
        this.rafId = requestAnimationFrame(this.mainloop);
    }

    pause() {
        if (this.state == GameStates.RUNNING) {
            cancelAnimationFrame(this.rafId);
            this.start = GameStates.PAUSED;
        }
    }

    update(deltaTime) {
        this.handleInputs();
        this.entities.forEach((entity) => entity.update(deltaTime));
        Object.values(this.sprites).forEach((sprite) =>
            sprite.update(deltaTime)
        );
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        this.entities.forEach((entity) => {
            entity.draw(this.ctx, alpha);
        });
    }

    mainloop(timestamp) {
        switch (this.state) {
            case GameStates.RUNNING:
                let deltaTime = timestamp - this.lastFrameTime;
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
                break;
        }
    }
}

const game = new Game();
game.load().then(() => {
    game.start();
});
