class GameWebSocket {
    constructor(gameId) {
        this.gameId = gameId;
        this.socket = null;
        this.isConnected = false;
        this.messageHandlers = {};
    }

    connect() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/game/${this.gameId}`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('Conexão WebSocket estabelecida');
            this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type in this.messageHandlers) {
                this.messageHandlers[data.type](data);
            }
        };

        this.socket.onclose = () => {
            console.log('Conexão WebSocket fechada');
            this.isConnected = false;
            // Tente reconectar após 5 segundos
            setTimeout(() => this.connect(), 5000);
        };

        this.socket.onerror = (error) => {
            console.error('Erro na conexão WebSocket:', error);
        };
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
        }
    }
}

// Uso:
const gameId = 'game-123'; // ID único da sessão do jogo
const gameSocket = new GameWebSocket(gameId);

gameSocket.connect();

gameSocket.on('playerJoined', (data) => {
    console.log('Novo jogador entrou:', data.playerName);
});

gameSocket.on('gameState', (data) => {
    console.log('Atualização do estado do jogo:', data);
});

// Enviar uma ação do jogador
gameSocket.send('playerMove', { x: 100, y: 200 });

// Quando o jogo terminar
// gameSocket.disconnect();