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
};

export const GameConfig = {
    MAXFPS: 60,
    MAXUPDATES: 5,
    ENTITY_COLLISION_RADIUS: 1,
    SHOW_COLLISION_CIRCLES: true,

    gameParameters: {
        entityAcceleration: 0.5,
        entityDeacceleration: 0.9
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