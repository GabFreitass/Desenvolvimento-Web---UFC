import { Game } from "./core/game.js";

const gameCanvas = document.querySelector("canvas#game-canvas");

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');
const playerName = urlParams.get('playerName');
const playerCharacter = urlParams.get('playerCharacter');

const game = new Game(gameCanvas, gameId, playerName, playerCharacter);
await game.load();
game.start();