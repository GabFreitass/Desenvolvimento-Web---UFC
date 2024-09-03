const ServerConfig = {
    TICK_RATE: 1e3 / 60, // 60 atualizações do estado do jogo por segundo
    UPDATE_RATE: 1e3 / 20 // 20 atualizações enviadas aos clientes por segundo
}

const GameConfig = {
    gameWidth: 1000,
    gameHeight: 1000
}

module.exports = { ServerConfig, GameConfig };