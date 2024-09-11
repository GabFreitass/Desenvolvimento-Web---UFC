const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { server } = require('./httpServer.js');
const { GameState } = require('./websocket/gameState.js');
const { ServerConfig, GameServerConfig } = require('./websocket/config.js');

const wss = new WebSocket.Server({ server });
// Lê o arquivo games.json
const gamesRoomsFilePath = path.join(__dirname, 'gamesRooms.json');
const gamesStates = new Map();

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
                    // atualiza o arquivo json com os dados e o gamesRooms map com os dados
                    if (fs.existsSync(gamesRoomsFilePath)) {
                        const gamesRoomsData = JSON.parse(fs.readFileSync(gamesRoomsFilePath)); // le os dados
                        if (!Object.keys(gamesRoomsData).includes(gameId)) {
                            gamesRoomsData[gameId] = [];
                        }
                        const players = gamesRoomsData[gameId];
                        if (!players.includes(clientId) && players.length < GameServerConfig.roomMaxPlayers) {
                            gamesRoomsData[gameId].push(clientId);
                            fs.writeFileSync(gamesRoomsFilePath, JSON.stringify(gamesRoomsData, null, 2)); // Atualiza o arquivo de dados
                            // se o estado do jogo ainda não tiver sido criada, cria ele

                        } else {
                            const errorMessage = JSON.stringify({ type: 'error', message: 'Game room full or player already entered in' });
                            ws.send(errorMessage);
                            return; // sai da função
                        }

                    }
                    if (!gamesStates.has(gameId)) {
                        const gameState = new GameState(gameId);
                        gamesStates.set(gameId, gameState);
                    }
                    const gameState = gamesStates.get(gameId);
                    gameState.createPlayer(clientId, playerName, playerCharacter);
                    clientGameMap.set(clientId, gameId);
                    const clientIdMessage = JSON.stringify({ type: 'clientId', clientId: clientId });
                    ws.send(clientIdMessage);
                    break;
                }

                case 'playerDied': {
                    const playerDiedMessage = JSON.stringify({ type: 'playerDied' })
                    ws.send(playerDiedMessage);
                    break;
                }

                case 'playerUpdate': {
                    const { gameId, newPlayer } = data;
                    const gameState = gamesStates.get(gameId);
                    gameState.updatePlayer(clientId, newPlayer);
                    break;
                }

                case 'playerFire': {
                    const { gameId } = data;
                    const gameState = gamesStates.get(gameId);
                    if (gameState.createBullet(clientId)) {
                        broadcastGameSound(gameId, 'fireSound');
                    }
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
            const clientGameState = gamesStates.get(clientGameId);
            clientGameState.removePlayer(clientId);
            removePlayerFromRoom(clientGameId, clientId);
        }
    });
});

function removePlayerFromRoom(gameId, clientId) {
    // atualiza o arquivo json com os dados e o gamesRooms map com os dados
    if (fs.existsSync(gamesRoomsFilePath)) {
        const gamesRoomsData = JSON.parse(fs.readFileSync(gamesRoomsFilePath)); // le os dados
        if (Object.keys(gamesRoomsData).includes(gameId)) {
            const index = gamesRoomsData[gameId].indexOf(clientId);
            if (index !== -1) {
                gamesRoomsData[gameId].splice(index, 1);
                fs.writeFileSync(gamesRoomsFilePath, JSON.stringify(gamesRoomsData, null, 2)); // Atualiza o arquivo de dados
            }
        }
    }
}

function broadcastGameState(gameId) {
    const gameState = gamesStates.get(gameId);
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

function broadcastGameSound(gameId, sound) {
    const playSoundMessage = JSON.stringify({ type: 'playSound', sound });

    wss.clients.forEach((client) => {
        const clientId = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        if (client.readyState === WebSocket.OPEN && clientGameMap.get(clientId) === gameId) {
            client.send(playSoundMessage);
        }
    });
}

function updateGames() {
    for (const [gameId, gameState] of gamesStates) {
        gameState.update(ServerConfig.TICK_RATE);
    }
}

function broadcastUpdates() {
    for (const [gameId, gameState] of gamesStates) {
        broadcastGameState(gameId);
    }
}

setInterval(updateGames, ServerConfig.TICK_RATE);
setInterval(broadcastUpdates, ServerConfig.UPDATE_RATE);

const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});