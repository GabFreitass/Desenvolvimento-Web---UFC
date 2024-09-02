import { Game } from "./core/game.js";
import { GameWebSocket } from "./online/gamewebsocket.js";

export const gameCanvas = document.querySelector("canvas#game-canvas");
export const playerName = gameCanvas.getAttribute("data-player-name");
export const scoreEl = document.querySelector("#score");
const gameId = window.location.pathname.split('/game/')[1]; // Obtém o gameId da rota
export const game = new Game(gameCanvas, gameId);

await game.load();
