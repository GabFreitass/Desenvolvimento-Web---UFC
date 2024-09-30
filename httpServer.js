require("dotenv").config(); // para .env funcionar
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const api = require("./api");
module.exports = { server }; // exportado para o servidor websocket

app.use(express.static("static"));
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
    // Obtendo os dados do ranking pela API
    api.get("/ranking/topScores")
        .then((response) => {
            const topScores = response.data; // Lista de jogadores
            res.render("ranking", { topScores }); // Passando os dados para a view
        })
        .catch((error) => {
            console.error("Erro ao obter os dados do ranking:", error);
            res.status(500).send(
                "Erro ao carregar o ranking. Tente novamente mais tarde."
            );
        });
});

app.post("/game", validateGameParameters, (req, res) => {
    const playerName = req.body["player-name"];
    const playerCharacter = parseInt(req.body["player-character"]);

    // Obtendo uma sala disponível pela API
    api.get("/game-room/getAvailableRoom")
        .then((response) => {
            const roomId = response.data.roomId;
            // Redirecionamento com parâmetros validados e gameId obtido da API
            res.redirect(
                `/game/${roomId}?playerName=${encodeURIComponent(
                    playerName.trim()
                )}&playerCharacter=${playerCharacter}`
            );
        })
        .catch((error) => {
            console.error("Erro ao obter o roomId:", error);
            res.status(500).send(
                "Erro ao criar o jogo. Tente novamente mais tarde."
            );
        });
});

// middleware para verificar se os parametros fornecidos para o jogo são válidos
function validateGameParameters(req, res, next) {
    const playerName =
        req.method === "GET" ? req.query.playerName : req.body["player-name"];
    const playerCharacter =
        req.method === "GET"
            ? parseInt(req.query.playerCharacter)
            : parseInt(req.body["player-character"]);

    // Validação do nome do jogador
    if (
        !playerName ||
        typeof playerName !== "string" ||
        playerName.trim().length === 0
    ) {
        return res
            .status(400)
            .send(
                "Nome do jogador é obrigatório e deve ser uma string não vazia"
            );
    }

    // Validação do personagem do jogador
    if (isNaN(playerCharacter) || playerCharacter < 0 || playerCharacter > 9) {
        return res
            .status(400)
            .send("Espaçonave inválida. Escolha um número entre 0 e 9");
    }

    next();
}

// Redireciona para "/" quando a rota não for identificada
app.use((req, res) => {
    res.redirect("/");
});
