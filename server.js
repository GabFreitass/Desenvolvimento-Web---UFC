const WebSocket = require("ws");
const { server } = require("./httpServer.js");
const { GameState } = require("./websocket/gameState.js");
const { ServerConfig } = require("./websocket/config.js");
const api = require("./api.js");

const wss = new WebSocket.Server({ server });
const gamesStates = new Map();

const clientGameMap = new Map(); // associa cada clientId com seu gameId

api.post("/game-room/clearRooms").catch((error) => {
    console.error("Can't clear rooms data");
});

wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    const clientId = `${clientIp}:${clientPort}`;

    console.log(`Novo cliente conectado: ${clientId}`);

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "ping": {
                    const pongMessage = JSON.stringify({
                        type: "pong",
                        time: data.time,
                    });
                    ws.send(pongMessage);
                    break;
                }

                case "playerJoined": {
                    const { gameId, playerName, playerCharacter } = data;

                    api.post("/game-room/joinRoom", {
                        clientId,
                        roomId: gameId,
                    }).catch((error) => {
                        console.error(error);
                        ws.close();
                    });

                    if (!gamesStates.has(gameId)) {
                        const gameState = new GameState(gameId);
                        gamesStates.set(gameId, gameState);
                        setTimeout(() => {
                            broadcastGameEnd(clientId, gameId)
                        }, 120000);
                    }
                    const gameState = gamesStates.get(gameId);
                    gameState.createPlayer(
                        clientId,
                        playerName,
                        playerCharacter
                    );
                    clientGameMap.set(clientId, gameId);
                    const clientIdMessage = JSON.stringify({
                        type: "clientId",
                        clientId: clientId,
                    });
                    ws.send(clientIdMessage);
                    break;
                }

                case "playerDied": {
                    const playerDiedMessage = JSON.stringify({
                        type: "playerDied",
                    });
                    ws.send(playerDiedMessage);
                    break;
                }

                case "playerUpdate": {
                    const { gameId, newPlayer } = data;
                    const gameState = gamesStates.get(gameId);
                    if (!gameState) {
                        ws.close();
                    } else {
                        gameState.updatePlayer(clientId, newPlayer);
                    }
                    break;
                }

                case "playerFire": {
                    const { gameId } = data;
                    const gameState = gamesStates.get(gameId);
                    if (gameState.createBullet(clientId)) {
                        broadcastGameSound(gameId, "fireSound");
                    }
                    break;
                }

                default:
                    console.log(`Mensagem não reconhecida: ${data.type}`);
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
        }
    });

    ws.on("close", () => {
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
    api.delete(`game-room/delete?roomId=${gameId}&clientId=${clientId}`)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(
                `Error removing player ${clientId} from game ${gameId}:`,
                error
            );
        });
}

function broadcastGameEnd(clientId, gameId) {
    const gameState = gamesStates.get(gameId);
    const stateMessage = JSON.stringify({
        type: "gameFinish",
        state: gameState.getState(),
        timestamp: Date.now(),
    });

    wss.clients.forEach((client) => {
        const clientId = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        if (
            client.readyState === WebSocket.OPEN &&
            clientGameMap.get(clientId) === gameId
        ) {
            client.send(stateMessage);
        }
        api.post('/ranking/add', {
            clientId,
            playerName: gameState.players.get(clientId).name,
            obtainedAt: new Date(),
            score: gameState.players.get(clientId).score
        })
        removePlayerFromRoom(gameId, clientId);
    });
}

function broadcastGameState(gameId) {
    const gameState = gamesStates.get(gameId);
    const stateMessage = JSON.stringify({
        type: "gameState",
        state: gameState.getState(),
        timestamp: Date.now(),
    });

    wss.clients.forEach((client) => {
        const clientId = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        if (
            client.readyState === WebSocket.OPEN &&
            clientGameMap.get(clientId) === gameId
        ) {
            client.send(stateMessage);
        }
    });
}

function broadcastGameSound(gameId, sound) {
    const playSoundMessage = JSON.stringify({ type: "playSound", sound });

    wss.clients.forEach((client) => {
        const clientId = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        if (
            client.readyState === WebSocket.OPEN &&
            clientGameMap.get(clientId) === gameId
        ) {
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
