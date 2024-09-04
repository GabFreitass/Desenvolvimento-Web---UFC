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
    SHOW_COLLISION_CIRCLES: true,
    RESPAWN_ON_DEATH: true,

    controls: {// controls
        MOVE_LEFT: "KeyA",
        MOVE_RIGHT: "KeyD",
        MOVE_UP: "KeyW",
        MOVE_DOWN: "KeyS",
        FIRE: "KeyF"
    }
};

export const GameResources = {
    spaceships: [],
    bullet: null,
};