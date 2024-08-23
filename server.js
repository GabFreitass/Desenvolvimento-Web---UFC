import express from "express";
import { fileURLToPath } from 'url';
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 8088;

app.set("views", join(__dirname, "static/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "static")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/game", (req, res) => {
    res.render("game", {})
});

app.post("/game", (req, res) => {
  res.render("game", {});
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
