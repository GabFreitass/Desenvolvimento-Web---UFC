import { Game } from "./core/game.js";

const gameCanvas = document.querySelector("canvas#game-canvas");
const gameScore = document.querySelector("span#score");

const urlParams = new URLSearchParams(window.location.search);
const pathSegments = window.location.pathname.split('/');
const gameId = pathSegments[pathSegments.length - 1];
const playerName = urlParams.get('playerName');
const playerCharacter = urlParams.get('playerCharacter');

const game = new Game(gameCanvas, gameScore, gameId, playerName, playerCharacter);
game.load();