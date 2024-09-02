const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
module.exports = { server };

app.use(express.static('static'));
app.set("view engine", "ejs");
app.set("views", "static/views");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/game/:gameId", (req, res) => {
    const gameId = req.params.gameId;
    const playerName = req.query.playerName;
    res.render("game", { playerName, gameId });
});

app.get("/ranking", (req, res) => {
    res.render("ranking");
});

app.post("/game", (req, res) => {
    const playerName = req.body["player-name"];
    if (!playerName || playerName.trim() === '') {
        return res.status(400).send('Nome do jogador é obrigatório');
    }
    const gameId = '123';
    res.redirect(`/game/${gameId}?playerName=${encodeURIComponent(playerName)}`);
});

