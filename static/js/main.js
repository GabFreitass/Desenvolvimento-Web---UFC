import { Game } from "./core/game.js";

export const gameCanvas = document.querySelector("canvas#game-canvas");
export const playerName = gameCanvas.getAttribute("data-player-name");

const game = new Game();
game.load().then(() => {
    game.start();
});
