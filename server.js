import express from "express";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8088;

app.set("views", join(__dirname, "static/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "static")));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/game", (req, res) => {
    res.redirect('/');
});

app.get("/ranking", (req, res) => {
    res.render("ranking");
});

app.post("/game", (req, res) => {
    const playerName = req.body["player-name"];
    if (!playerName || playerName.trim() === '') {
        return res.status(400).send('Nome do jogador é obrigatório');
    }
    res.render("game", { playerName });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
