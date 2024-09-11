import { Resource } from "./resource.js";
import { Player } from "../entities/localPlayer.js";
import { Input } from "./input.js";
import { GameConfig, GameResources, GameStates } from "./constants.js";
import { GameWebSocket } from "../online/gamewebsocket.js";
import { Bullet } from "../entities/localBullet.js";

export class Game {
    constructor(canvas, score, gameId, playerName, playerCharacter) {
        this.canvas = canvas;
        this.score = score;
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
        this.waitingPause = false;
    }

    get entities() {
        return [...this.players.values(), ...this.bullets];
    }

    get player() {
        const player = this.players.get(this.gameWebSocket.clientId);
        if (!player && this.state === GameStates.RUNNING) {
            this.gameWebSocket.send('playerDied', { gameId: this.gameId });
        };
        return player
    }

    async load() {
        this.state = GameStates.LOADING;
        this.gameWebSocket.connect();

        // load resources
        for (let i = 0; i < 10; i++) {
            GameResources.spaceships.push(new Resource(`/assets/images/spaceships/spaceship${i}.png`));
        }
        GameResources.bullet = new Resource("/assets/images/bullet.png");
        const loadResources = [
            ...GameResources.spaceships.map(resource => resource.load()),
            GameResources.bullet.load()
        ];
        await Promise.all(loadResources);

        // load sounds
        GameResources.fireSound = new Audio('/assets/sound/laser-gun.mp3');
        GameResources.gameMusic = new Audio('/assets/sound/game-music2.mp3');
        GameResources.gameMusic.loop = true;
        GameResources.gameOverSound = new Audio('/assets/sound/game-over.mp3');
        GameResources.gameOverSound.loop = false;

        // load game inputs
        this.gameInput = new Input(this.canvas);

        this.state = GameStates.READY;
        this.gameWebSocket.send('playerJoined', {
            gameId: this.gameId,
            playerName: this.playerName,
            playerCharacter: this.playerCharacter
        })
    }

    createPlayer(playerName, x, y, character, rotation, velocity, health, maxHealth, collisionRadius, score) {
        const player = new Player(playerName, x, y, character, rotation, velocity, health, maxHealth, collisionRadius, score);
        return player;
    }

    createBullet(x, y, rotation, velocity, collisionRadius) {
        const bullet = new Bullet(x, y, rotation, velocity, collisionRadius);
        return bullet;
    }

    playSound(sound) {
        if (GameResources[sound]) {
            GameResources[sound].currentTime = 0;
            GameResources[sound].play();
        }
    }

    pauseSound(sound) {
        if (GameResources[sound]) {
            GameResources[sound].pause();
        }
    }

    endGame() {
        this.state = GameStates.ENDED;
        this.pauseSound('gameMusic');
        this.playSound('gameOverSound');
    }

    resumeGame() {
        this.state = GameStates.RUNNING;
        this.rafId = requestAnimationFrame(this.mainloop); // Retoma o loop do jogo
        this.ctx.filter = 'none'; // Remove o efeito de blur
    }

    pauseGame() {
        this.state = GameStates.PAUSED;
        cancelAnimationFrame(this.rafId);
    }

    drawPause() {
        this.ctx.save();
        this.ctx.font = "bold 48px Orbitron";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("Game Paused", this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.restore();
    }

    drawEnd() {
        this.ctx.save();
        this.ctx.font = "bold 48px Orbitron";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("Game Over", this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.restore();
    }

    handleInputs() {
        if (this.state === GameStates.ENDED) return;
        const inputs = this.gameInput.inputKeys;
        if (inputs.includes(GameConfig.controls.PAUSE_GAME)) {
            if (!this.waitingPause) {
                this.waitingPause = true;
            }
        } else if (this.waitingPause) {
            this.waitingPause = false;
            if (this.state === GameStates.PAUSED) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        }

        if (this.state !== GameStates.RUNNING) return;
        if (!this.player) return;
        this.updatePlayerRotation();


        if (inputs.includes(GameConfig.controls.FIRE)) {
            this.gameWebSocket.send('playerFire', {
                gameId: this.gameId
            });
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
        window.addEventListener('keydown', () => {
            GameResources.gameMusic.play();
        }, { once: true });
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
        if (this.state === GameStates.PAUSED) {
            this.drawPause();
        } else if (this.state === GameStates.ENDED) {
            this.drawEnd();
        } else {
            for (const entity of this.entities) {
                entity.draw(this.ctx, alpha);
            }
        }
        this.drawLatency();
        this.score.textContent = `${this.player?.score ?? 0}`;
    }

    mainloop(timestamp) {
        // Permite que o mainloop continue mesmo se o jogo estiver pausado
        this.accumulatedTime += timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        const alpha = this.accumulatedTime / this.timeStep;

        while (this.accumulatedTime >= this.timeStep) {
            this.handleInputs();
            this.accumulatedTime -= this.timeStep;
        }

        this.draw(alpha);

        this.rafId = requestAnimationFrame(this.mainloop);
    }
}

