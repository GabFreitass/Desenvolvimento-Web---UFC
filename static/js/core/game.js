import { v4 as uuidv4 } from 'https://esm.sh/uuid';
import { Resource } from "./resource.js"
import { Sprite } from "./sprite.js";
import { Player } from "../entities/player.js";
import { Input } from "./input.js";
import { Bullet } from "../entities/bullet.js";
import { EntityState, EntityType, GameConfig, GameResources, GameStates, PlayerCharacters } from "./constants.js";
import { playerName, scoreEl } from "../main.js";
import { GameWebSocket } from "../online/gamewebsocket.js";

export class Game {
    constructor(canvas, gameId) {
        this.gameId = gameId;
        this.canvas = canvas;
        this.state = GameStates.UNREADY;
        this.playerId = null;
        this.gameInput = null;
        this.ctx = canvas.getContext("2d");
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1e3 / GameConfig.MAXFPS;
        this.rafId = null;
        this.score = 0;
        this.entities = {
            players: [],
            bullets: []
        };
        this.gameWebSocket = new GameWebSocket(this);
        this.mainloop = this.mainloop.bind(this);
    }

    get player() {
        return this.entities.players.find(player => player.playerId === this.playerId);
    }

    async load() {
        this.state = GameStates.LOADING;
        this.gameWebSocket.connect();

        // load resources
        GameResources.spaceship = new Resource("/assets/ships_0.png");
        GameResources.bullets = new Resource("/assets/bullets.png");
        const loadResources = Object.values(GameResources).map((resource) =>
            resource.load()
        );
        await Promise.all(loadResources);

        // load entities
        const player = this.respawnPlayer(playerName,
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            uuidv4(),
            PlayerCharacters.Spacheship0
        );
        this.playerId = player.playerId;

        this.gameWebSocket.send('playerJoined', { player });
        // load game inputs
        this.gameInput = new Input(this.canvas);

        this.state = GameStates.READY;
    }

    get allEntities() {
        return [...this.entities.players, ...this.entities.bullets];
    }

    set allEntities(entities) {
        this.entities.players = entities.filter(entity => entity.entityType === EntityType.PLAYER);
        this.entities.bullets = entities.filter(entity => entity.entityType === EntityType.BULLET);
    }

    respawnPlayer(name, x, y, playerId, character, rotation) {
        const playerSprite = new Sprite(
            GameResources.spaceship,
            1, // frame columns
            10, // frame rows
            180, // sprite width
            180, // sprite height
        );
        const player = new Player(
            name,
            x,
            y,
            playerSprite,
            playerId,
            character,
            rotation
        );
        return player;
    }

    gainScore(points) {
        this.score += points;
    }

    createBullet(x, y, rotation, shooter) {
        const bulletSprite = new Sprite(
            GameResources.bullets,
            3,
            2,
            20,
            80,
            false,
            1,
            1000, null, 40,
            80, 110, 41
        );
        const bullet = new Bullet(x, y, bulletSprite, rotation, shooter);
        this.entities.bullets.push(bullet);
    }

    handleInputs(gameInput, player) {
        const inputs = gameInput.inputKeys;
        this.updatePlayerRotation(gameInput.cursorPosition, player);
        player.acceleration.setZero();
        const accelerationFactor = player.mass * 1e-2;

        if (inputs.includes(GameConfig.controls.FIRE)) {
            player.fire();
            return;
        }
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
        }
    }

    updatePlayerRotation(cursorPosition, player) {
        const dx = cursorPosition.x - player.position.x;
        const dy = cursorPosition.y - player.position.y;
        player.rotation = Math.atan2(dy, dx) + Math.PI / 2;
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
        scoreEl.textContent = this.score;
        this.handleInputs(this.gameInput, this.player);
        if (GameConfig.RESPAWN_ON_DEATH) {
            if (this.player.state === EntityState.DEAD) {
                this.respawnPlayer(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            }
        }
        this.allEntities = this.allEntities.filter(entity => {
            entity.update(deltaTime, this.allEntities);
            return entity.state !== EntityState.DEAD;
        });
        // this.gameWebSocket.send('playerUpdate', { player: this.player });
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
        this.drawLatency();
        this.allEntities.forEach(entity => entity.draw(this.ctx, alpha));
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

