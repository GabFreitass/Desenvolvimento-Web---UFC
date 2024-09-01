export const GameStates = {
    UNREADY: "UNREADY",
    READY: "READY",
    RUNNING: "RUNNING",
    LOADING: "LOADING",
    PAUSED: "PAUSED",
};

export const EntityState = {
    MOVING: "MOVING",
    IDLE: "IDLE",
    DEAD: "DEAD"
};

export const EntityType = {
    PLAYER: "PLAYER",
    BULLET: "BULLET",
};

export const GameConfig = {
    MAXFPS: 60,
    MAXUPDATES: 5,
    ENTITY_COLLISION_RADIUS: 1,
    SHOW_COLLISION_CIRCLES: false,
    RESPAWN_ON_DEATH: true,

    gameParameters: {
        // game
        frictionFactor: 1e-4,

        // entity

        // player
        maxPlayerSpeed: 0.5,
        playerMass: 500,
        playerCollisionDamage: 5,

        // bullet
        bulletSpeed: 1.5,
        bulletMass: 80,
        bulletDuration: 2000, // ms
        bulletDamage: 30
    },

    controls: {// controls
        MOVE_LEFT: "KeyA",
        MOVE_RIGHT: "KeyD",
        MOVE_UP: "KeyW",
        MOVE_DOWN: "KeyS",
        FIRE: "KeyF"
    }
};

export const GameResources = {
    spaceship: null,
    bullets: null,
};