import { Game } from "./core/game.js";

export const gameCanvas = document.querySelector("canvas#game-canvas");
export const playerName = gameCanvas.getAttribute("data-player-name");
export const scoreEl = document.querySelector("#score");

export const game = new Game(gameCanvas);
game.load().then(() => {
    game.start();
});
