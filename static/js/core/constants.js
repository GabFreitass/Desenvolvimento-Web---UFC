export const GameStates = {
    UNREADY: "UNREADY",
    READY: "READY",
    RUNNING: "RUNNING",
    LOADING: "LOADING",
    PAUSED: "PAUSED",
    ENDED: "ENDED"
};

export const GameConfig = {
    MAXFPS: 60,
    SHOW_COLLISION_CIRCLES: false,

    controls: {// controls
        MOVE_LEFT: "KeyA",
        MOVE_RIGHT: "KeyD",
        MOVE_UP: "KeyW",
        MOVE_DOWN: "KeyS",
        FIRE: "KeyF",
        PAUSE_GAME: "Escape"
    }
};

export const GameResources = {
    spaceships: [],
    bullet: null,
    fireSound: null,
    gameMusic: null,
    gameOverSound: null
};