let W = 400, H = 300,
    camX = 0, camY = 0,
    gamePaused = false,
    walls = null,
    currentFrame = 0, frameTimer = 0,
    hitFlash = 0, direction = false,
    wins = 0, getOutTimer = 0;

const scale = 3,
      WALL_DENSITY = 0.45,
      worldW = 5, worldH = 5,
      frameSpeed = 15;

const stage = document.getElementById("stage"),
      canvas = document.getElementById("game"),
      ctx = canvas.getContext("2d");

      // move to render js 
const spriteW = catFrames[0][0].length * scale,
      spriteH = catFrames[0].length * scale;
      // move to render js 
const fishW = fish[0].length * scale,
      fishH = fish.length * scale;

let player = { x: 100, y: 75, speed: 5 };

let enemySetting = {
    roomX: 0, roomY: 0,
    x: 0, y: 0,
    size: 14,
    vx: 0, vy: 0,
    wanderTimer: 0,
    wanderSpeed: 0.5,
    chaseSpeed: 1.2,
    sight: 140
};
