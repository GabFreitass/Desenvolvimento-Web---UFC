const WebSocket = require('ws');
const { server } = require('./httpServer.js');
const { GameState } = require('./websocket/gameState.js');
const { ServerConfig } = require('./websocket/config.js');

const wss = new WebSocket.Server({ server });

const gamesRooms = new Map(); // associa cada gameId com um GameState
const clientGameMap = new Map(); // associa cada clientId com seu gameId

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    const clientId = `${clientIp}:${clientPort}`;

    console.log(`Novo cliente conectado: ${clientId}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'ping': {
                    const pongMessage = JSON.stringify({ type: 'pong', time: data.time });
                    ws.send(pongMessage);
                    break;
                }

                case 'playerJoined': {
                    const { gameId, playerName, playerCharacter } = data;
                    // se a sala do jogo ainda não havia sido criada, cria ela
                    if (!gamesRooms.has(gameId)) {
                        const gameState = new GameState(gameId);
                        gamesRooms.set(gameId, gameState);
                    }
                    const gameState = gamesRooms.get(gameId);
                    gameState.createPlayer(clientId, playerName, playerCharacter);
                    clientGameMap.set(clientId, gameId);
                    const clientIdMessage = JSON.stringify({ type: 'clientId', clientId: clientId });
                    ws.send(clientIdMessage);
                    break;
                }
                case 'playerUpdate': {
                    const { gameId, newPlayer } = data;
                    const gameState = gamesRooms.get(gameId);
                    gameState.updatePlayer(clientId, newPlayer);
                    break;
                }
                default:
                    console.log(`Mensagem não reconhecida: ${data.type}`);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado: ${clientId}`);
        if (clientGameMap.has(clientId)) {
            const clientGameId = clientGameMap.get(clientId);
            const clientGameState = gamesRooms.get(clientGameId);
            clientGameState.removePlayer(clientId);
        }
    });
});

function broadcastGameState(gameId) {
    const gameState = gamesRooms.get(gameId);
    const stateMessage = JSON.stringify({
        type: 'gameState',
        state: gameState.getState(),
        timestamp: Date.now()
    });

    wss.clients.forEach((client) => {
        const clientId = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        if (client.readyState === WebSocket.OPEN && clientGameMap.get(clientId) === gameId) {
            client.send(stateMessage);
        }
    });
}

function updateGames() {
    for (const [gameId, gameState] of gamesRooms) {
        gameState.update(ServerConfig.TICK_RATE);
    }
}

function broadcastUpdates() {
    for (const [gameId, gameState] of gamesRooms) {
        broadcastGameState(gameId);
    }
}

setInterval(updateGames, ServerConfig.TICK_RATE);
setInterval(broadcastUpdates, ServerConfig.UPDATE_RATE);

const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});