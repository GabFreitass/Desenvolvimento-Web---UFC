const WebSocket = require('ws');
const { server } = require('./server.js');

const wss = new WebSocket.Server({ server });

const players = new Map();

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    const playerId = `${clientIp}:${clientPort}`;

    console.log(`Novo jogador conectado: ${playerId}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Mensagem recebida do tipo: ' + data.type);

            switch (data.type) {
                case 'playerJoined':
                    players.set(playerId, data.player);
                    broadcastPlayers();
                    break;

                case 'ping':
                    const pongMessage = JSON.stringify({ type: 'pong', time: data.time });
                    ws.send(pongMessage);
                    break;

                case 'playerUpdate':
                    if (players.has(playerId)) {
                        players.set(playerId, data.player);
                        broadcastPlayers();
                    }
                    break;

                default:
                    console.log(`Mensagem não reconhecida: ${data.type}`);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Jogador desconectado: ${playerId}`);
        players.delete(playerId);
        broadcastPlayers();
    });
});

function broadcastPlayers() {
    const playersList = Array.from(players.values());
    const message = JSON.stringify({ type: 'syncPlayers', players: playersList });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

const PORT = process.env.PORT || 8088;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});