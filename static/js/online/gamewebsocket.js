import { GameStates } from "../core/constants.js";

export class GameWebSocket {
    constructor(game) {
        this.game = game;
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
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Mensagem recebida do tipo: ', data.type);
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

        this.on('playerJoined', (data) => {
            console.log('Novo jogador entrou:', data.name);
        });

        this.on('syncPlayers', (data) => {
            console.log('Sincronizando jogadores com o servidor');
            console.log(data.players);
            this.game.entities.players = data.players.map(player => this.game.respawnPlayer(
                player.name,
                player.position.x,
                player.position.y,
                player.playerId,
                player.character,
                player.rotation
            ));
            if (this.game.state === GameStates.READY) {
                this.game.start();
            }
        });
    }
}

