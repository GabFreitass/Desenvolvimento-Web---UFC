import { Resource } from "./resource.js";
import { Sprite } from "./sprite.js";
import { Player } from "./player.js";
import { Input } from "./input.js";

const gameCanvas = document.querySelector("canvas#game-canvas");
const playerName = gameCanvas.getAttribute("data-player-name");

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

export const GameResources = {
    spaceship: null,
    bullets: null,
};

class Game {
    constructor() {
        this.state = GameStates.UNREADY;
        this.player = null;
        this.gameInput = null;
        this.ctx = gameCanvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;
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
            12,
            192,
            192
        );
        this.player = new Player(
            playerName,
            (gameCanvas.width - playerSprite.width) / 2,
            (gameCanvas.height - playerSprite.height) / 2,
            playerSprite,
            500
        );

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
        this.player.update(deltaTime);
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        this.player.draw(this.ctx, alpha);
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
