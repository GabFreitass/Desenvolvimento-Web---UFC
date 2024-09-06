import { Resource } from "./resource.js";
import { Player } from "../entities/localPlayer.js";
import { Input } from "./input.js";
import { GameConfig, GameResources, GameStates } from "./constants.js";
import { GameWebSocket } from "../online/gamewebsocket.js";
import { Bullet } from "../entities/localBullet.js";

export class Game {
    constructor(canvas, gameId, playerName, playerCharacter) {
        this.canvas = canvas;
        this.gameId = gameId;
        this.playerName = playerName;
        this.playerCharacter = playerCharacter;
        this.state = GameStates.UNREADY;
        this.gameInput = null;
        this.ctx = canvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;
        this.gameWebSocket = new GameWebSocket(this);
        this.mainloop = this.mainloop.bind(this);
        this.players = new Map();
        this.bullets = [];
    }

    get entities() {
        return [...this.players.values(), ...this.bullets];
    }

    get player() {
        return this.players.get(this.gameWebSocket.clientId);
    }

    async load() {
        this.state = GameStates.LOADING;
        this.gameWebSocket.connect();

        // load resources
        for (let i = 0; i < 10; i++) {
            GameResources.spaceships.push(new Resource(`/assets/spaceships/spaceship${i}.png`));
        }
        GameResources.bullet = new Resource("/assets/bullet.png");
        const loadResources = [
            ...GameResources.spaceships.map(resource => resource.load()),
            GameResources.bullet.load()
        ];
        await Promise.all(loadResources);

        // load game inputs
        this.gameInput = new Input(this.canvas);

        this.state = GameStates.READY;
    }

    createPlayer(playerName, x, y, character, rotation, velocity, health, maxHealth, collisionRadius) {
        const player = new Player(playerName, x, y, character, rotation, velocity, health, maxHealth, collisionRadius);
        return player;
    }

    createBullet(x, y, rotation, velocity, collisionRadius) {
        const bullet = new Bullet(x, y, rotation, velocity, collisionRadius);
        return bullet;
    }

    handleInputs() {
        if (!this.player) return;
        this.updatePlayerRotation();
        const inputs = this.gameInput.inputKeys;

        if (inputs.includes(GameConfig.controls.FIRE)) {
            this.gameWebSocket.send('playerFire', {
                gameId: this.gameId
            })
            return;
        }

        this.player.acceleration.setZero();
        const accelerationFactor = 5;

        if (inputs.includes(GameConfig.controls.MOVE_LEFT)) {
            this.player.acceleration.x -= accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_RIGHT)) {
            this.player.acceleration.x += accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_UP)) {
            this.player.acceleration.y -= accelerationFactor;
        }
        if (inputs.includes(GameConfig.controls.MOVE_DOWN)) {
            this.player.acceleration.y += accelerationFactor;
        }

        // if any movement input
        if (!this.player.acceleration.isZero) {
            this.gameWebSocket.send('playerUpdate', {
                gameId: this.gameId,
                newPlayer: {
                    rotation: this.player.rotation,
                    acceleration: this.player.acceleration
                }
            });
        }

    }

    updatePlayerRotation() {
        const cursorPosition = this.gameInput.cursorPosition;
        const dx = cursorPosition.x - this.player.position.x;
        const dy = cursorPosition.y - this.player.position.y;
        this.player.updateRotation(Math.atan2(dy, dx) + Math.PI / 2);
        this.gameWebSocket.send('playerUpdate', {
            gameId: this.gameId,
            newPlayer: {
                rotation: this.player.rotation,
                acceleration: this.player.acceleration
            }
        })
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

    drawLatency() {
        this.ctx.save();
        // Configura o estilo do texto
        this.ctx.font = "medium 16px Orbitron";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";

        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Calcula a posição do texto
        const padding = 10;
        const textX = this.canvas.width - padding;
        const textY = padding;

        this.ctx.fillText(`Ping: ${this.gameWebSocket.latency}ms`, textX, textY);

        this.ctx.restore();
    }

    draw(alpha) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const entity of this.entities) {
            entity.draw(this.ctx, alpha);
        }
        this.drawLatency();
    }

    mainloop(timestamp) {
        if (this.state !== GameStates.RUNNING) return;

        this.accumulatedTime += timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        while (this.accumulatedTime >= this.timeStep) {
            this.handleInputs();
            this.accumulatedTime -= this.timeStep;
        }

        const alpha = this.accumulatedTime / this.timeStep;
        this.draw(alpha);

        this.rafId = requestAnimationFrame(this.mainloop);
    }
}

