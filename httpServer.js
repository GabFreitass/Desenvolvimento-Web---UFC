const express = require('express');
const http = require('http');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const { GameServerConfig } = require('./websocket/config');

const app = express();
const server = http.createServer(app);
module.exports = { server }; // exportado para o servidor websocket

app.use(express.static('static'));
app.set("view engine", "ejs");
app.set("views", "static/views");
app.use(express.urlencoded({ extended: true })); // middleware para pegar o nome do jogador com o body

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/game/:gameId", validateGameParameters, (req, res) => {
    // [TODO]: espectator
    res.render("game");
});

app.get("/ranking", (req, res) => {
    res.render("ranking");
});

app.post("/game", validateGameParameters, (req, res) => {
    const playerName = req.body["player-name"];
    const playerCharacter = parseInt(req.body["player-character"]);

    // Lê o arquivo games.json
    const gamesFilePath = path.join(__dirname, 'gamesRooms.json');
    let gamesData = {};

    if (fs.existsSync(gamesFilePath)) {
        gamesData = JSON.parse(fs.readFileSync(gamesFilePath));
    }

    let gameId;
    // Verifica se existe um gameId com menos de 10 jogadores
    for (const [id, players] of Object.entries(gamesData)) {
        if (players.length < GameServerConfig.roomMaxPlayers) {
            gameId = id;
            break;
        }
    }
    if (!gameId) {
        gameId = uuid.v4();
        gamesData[gameId] = []; // Adiciona um novo gameId com uma lista vazia
        fs.writeFileSync(gamesFilePath, JSON.stringify(gamesData, null, 2)); // Atualiza o arquivo games.json
    }

    // Redirecionamento com parâmetros validados
    res.redirect(`/game/${gameId}?playerName=${encodeURIComponent(playerName.trim())}&playerCharacter=${playerCharacter}`);
});

// middleware para verificar se os parametros fornecidos para o jogo são válidos
function validateGameParameters(req, res, next) {
    const playerName = req.method === 'GET' ? req.query.playerName : req.body["player-name"];
    const playerCharacter = req.method === 'GET' ? parseInt(req.query.playerCharacter) : parseInt(req.body["player-character"]);

    // Validação do nome do jogador
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        return res.status(400).send('Nome do jogador é obrigatório e deve ser uma string não vazia');
    }

    // Validação do personagem do jogador
    if (isNaN(playerCharacter) || playerCharacter < 0 || playerCharacter > 9) {
        return res.status(400).send('Espaçonave inválida. Escolha um número entre 0 e 9');
    }

    next();
}

// Redireciona para "/" quando a rota não for identificada
app.use((req, res) => {
    res.redirect("/");
});
