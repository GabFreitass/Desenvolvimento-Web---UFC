import { Game } from "./core/game.js";

const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('playerName'); // Obtém o playerName da query string
const gameId = urlParams.get('gameId');
console.log(playerName);
console.log(gameId);

const gameCanvas = document.querySelector("canvas#game-canvas");