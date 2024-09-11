const ServerConfig = {
    TICK_RATE: 1e3 / 60, //  atualizações do estado do jogo por segundo
    UPDATE_RATE: 1e3 / 60 //  atualizações enviadas aos clientes por segundo
}

const GameServerConfig = {
    gameWidth: 1440,
    gameHeight: 1024,

    // enviroment physics
    frictionFactor: 1e-4,
    collisionRestitution: 0.5,

    // entity

    // player
    playerMass: 500,
    playerCollisionDamage: 5,
    playerMaxHealth: 100,
    playerMaxVelocity: 0.5,
    playerCollisionRadius: 40,
    
    // bullet
    bulletInitialSpeed: 1.5,
    bulletMass: 80,
    bulletDuration: 2000, // ms
    bulletDamage: 30,
    bulletCollisionRadius: 20,
    bulletBackImpulse: 0.2,
}

module.exports = { ServerConfig, GameServerConfig };