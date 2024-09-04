const express = require('express');
const http = require('http');
const uuid = require('uuid');

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
    const playerName = req.query.playerName;
    const playerCharacter = parseInt(req.query.playerCharacter);
    res.render("game");
});

app.get("/ranking", (req, res) => {
    res.render("ranking");
});

app.post("/game", validateGameParameters, (req, res) => {
    const playerName = req.body["player-name"];
    const playerCharacter = parseInt(req.body["player-character"]);

    // Geração de ID de jogo único
    const gameId = uuid.v4();

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
