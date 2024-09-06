export class GameWebSocket {
    constructor(game) {
        this.game = game;
        this.clientId = null;
        this.latency = 0;
        this.socket = null;
        this.isConnected = false;
        this.messageHandlers = {};
        this.setEvents();
        this.pingInterval = null;
    }

    connect() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}`;

        console.log('Tentando conectar ao WebSocket:', wsUrl);

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('Conexão WebSocket estabelecida');
                this.isConnected = true;
                this.startPing();
                this.send('playerJoined', {
                    gameId: this.game.gameId,
                    playerName: this.game.playerName,
                    playerCharacter: this.game.playerCharacter
                })
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type in this.messageHandlers) {
                        this.messageHandlers[data.type](data);
                    }
                } catch (error) {
                    console.error('Erro ao processar mensagem:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('Conexão WebSocket fechada', event.code, event.reason);
                this.isConnected = false;
                setTimeout(() => this.connect(), 5000);
            };

            this.socket.onerror = (error) => {
                console.error('Erro na conexão WebSocket:', error);
            };
        } catch (error) {
            console.error('Erro ao criar WebSocket:', error);
        }
    }

    send(type, data) {
        if (this.isConnected) {
            const message = JSON.stringify({ type, ...data });
            this.socket.send(message);
        } else {
            console.error('Não é possível enviar mensagem. WebSocket não está conectado.');
        }
    }

    on(type, handler) {
        this.messageHandlers[type] = handler;
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        } if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            this.sendPing();
        }, 5000);
    }

    sendPing() {
        const pingTime = Date.now();
        this.send('ping', { time: pingTime });
    }

    setEvents() {
        this.on('pong', (data) => {
            const pongTime = Date.now();
            this.latency = pongTime - data.time;
        });

        this.on('clientId', (data) => {
            this.clientId = data.clientId;
        })

        this.on('gameState', (data) => {
            const state = data.state;
            // clear previous state
            this.game.players.clear();
            this.game.bullets = [];

            // update players
            for (const clientId in state.players) {
                const player = state.players[clientId];
                this.game.players.set(clientId, this.game.createPlayer(
                    player.name,
                    player.position.x,
                    player.position.y,
                    player.character,
                    player.rotation,
                    player.velocity,
                    player.health,
                    player.maxHealth,
                    player.collisionRadius,
                    player.score
                ));
            }

            // update bullets
            for (const bullet of state.bullets) {
                this.game.bullets.push(this.game.createBullet(bullet.position.x, bullet.position.y, bullet.rotation, bullet.velocity, bullet.collisionRadius));
            }
        });
    }
}

