export const GameStates = {
    UNREADY: "UNREADY",
    READY: "READY",
    RUNNING: "RUNNING",
    LOADING: "LOADING",
    PAUSED: "PAUSED",
};

export const GameConfig = {
    MAXFPS: 60,
    SHOW_COLLISION_CIRCLES: true,

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