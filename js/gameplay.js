let W = 400, H = 300;
const scale = 3;

// Density of random walls to make it more Maze like
const WALL_DENSITY = 0.35;

const stage = document.getElementById("stage");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SPRITE_COLS = catFrames[0][0].length;
const SPRITE_ROWS = catFrames[0].length;
const spriteW = SPRITE_COLS * scale;
const spriteH = SPRITE_ROWS * scale;

const fishW = fish[0].length * scale;
const fishH = fish.length * scale;

let player = { x: 100, y: 75, speed: 3 };
let camX = 0, camY = 0;
const worldW = 5, worldH = 5;

let walls = null;

function makeEmptyWalls(w, h) {
  const g = Array.from({ length: w }, () =>
    Array.from({ length: h }, () => ({ N: true, S: true, E: true, W: true }))
  );
  return g;
}
function generateWalls() {
  walls = makeEmptyWalls(worldW, worldH);
  for (let x = 0; x < worldW; x++) {
    for (let y = 0; y < worldH; y++) {
      if (x + 1 < worldW && Math.random() < WALL_DENSITY) {
        walls[x][y].E = false;
        walls[x + 1][y].W = false;
      }
      if (y + 1 < worldH && Math.random() < WALL_DENSITY) {
        walls[x][y].S = false;
        walls[x][y + 1].N = false;
      }
    }
  }

  ensureConnectivity();
}

function neighborsOpen(x, y) {
  const n = [];
  if (y > 0 && walls[x][y].N) n.push({ x, y: y - 1 });
  if (y + 1 < worldH && walls[x][y].S) n.push({ x, y: y + 1 });
  if (x + 1 < worldW && walls[x][y].E) n.push({ x: x + 1, y });
  if (x > 0 && walls[x][y].W) n.push({ x: x - 1, y });
  return n;
}

function bfsVisited(startX = 0, startY = 0) {
  const vis = Array.from({ length: worldW }, () => Array(worldH).fill(false));
  const q = [{ x: startX, y: startY }];
  vis[startX][startY] = true;
  while (q.length) {
    const { x, y } = q.shift();
    for (const nb of neighborsOpen(x, y)) {
      if (!vis[nb.x][nb.y]) {
        vis[nb.x][nb.y] = true;
        q.push(nb);
      }
    }
  }
  return vis;
}

function ensureConnectivity() {
  while (true) {
    const vis = bfsVisited(0, 0);
    let all = true;
    for (let x = 0; x < worldW; x++) {
      for (let y = 0; y < worldH; y++) {
        if (!vis[x][y]) { all = false; break; }
      }
      if (!all) break;
    }
    if (all) return;

    let opened = false;
    for (let x = 0; x < worldW && !opened; x++) {
      for (let y = 0; y < worldH && !opened; y++) {
        if (!vis[x][y]) continue;
        if (x + 1 < worldW && !walls[x][y].E && !vis[x + 1][y]) {
          walls[x][y].E = true; walls[x + 1][y].W = true; opened = true; break;
        }
        if (y + 1 < worldH && !walls[x][y].S && !vis[x][y + 1]) {
          walls[x][y].S = true; walls[x][y + 1].N = true; opened = true; break;
        }
        if (x > 0 && !walls[x][y].W && !vis[x - 1][y]) {
          walls[x][y].W = true; walls[x - 1][y].E = true; opened = true; break;
        }
        if (y > 0 && !walls[x][y].N && !vis[x][y - 1]) {
          walls[x][y].N = true; walls[x][y - 1].S = true; opened = true; break;
        }
      }
    }
    if (!opened) return;
  }
}


const fishObj = {
  roomX: Math.floor(Math.random() * worldW),
  roomY: Math.floor(Math.random() * worldH),
  x: 50 + Math.random() * (W - 100),
  y: 50 + Math.random() * (H - 100),
  collected: false
};

const enemies = [];

function createEnemy() {
  const enemy = {
    roomX: 0, roomY: 0,
    x: 0, y: 0,
    size: 14,
    vx: 0, vy: 0,
    wanderTimer: 0,
    wanderSpeed: 0.5,
    chaseSpeed: 1.2,
    sight: 140
  };
  do {
    enemy.roomX = Math.floor(Math.random() * worldW);
    enemy.roomY = Math.floor(Math.random() * worldH);
  } while (enemy.roomX === 0 && enemy.roomY === 0);
  enemy.x = Math.random() * (W - enemy.size);
  enemy.y = Math.random() * (H - enemy.size);
  return enemy;
}

enemies.push(createEnemy());

let currentFrame = 0, frameTimer = 0;
const frameSpeed = 15;
let hitFlash = 0;
let direction = false;
const gravity = 0;

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

let wins = 0;
let getOutTimer = 0;

function resizeCanvas() {
  W = Math.floor(window.innerWidth / 5);
  H = Math.floor(window.innerHeight / 5);
  canvas.width = W;
  canvas.height = H;

  const maxX = W - spriteW;
  const maxY = H - spriteH;
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x > maxX) player.x = maxX;
  if (player.y > maxY) player.y = maxY;

  enemies.forEach(e => {
    e.x = Math.max(0, Math.min(W - e.size, e.x));
    e.y = Math.max(0, Math.min(H - e.size, e.y));
  });

  fishObj.x = Math.max(0, Math.min(W - fishW, fishObj.x));
  fishObj.y = Math.max(0, Math.min(H - fishH, fishObj.y));
  updateStagePos();
}
window.addEventListener("resize", resizeCanvas);

function updateStagePos() {
  stage.style.left = (camX * W) + "px";
  stage.style.top = (camY * H) + "px";
}

let exitRoom = null;

function pickExitRoom() {
  const edgeRooms = [];
  for (let x = 0; x < worldW; x++) {
    for (let y = 0; y < worldH; y++) {
      if (x === 0 || x === worldW - 1 || y === 0 || y === worldH - 1) {
        if (!(x === fishObj.roomX && y === fishObj.roomY)) {
          edgeRooms.push({ x, y });
        }
      }
    }
  }
  exitRoom = edgeRooms[(Math.random() * edgeRooms.length) | 0];
}

function drawSprite(x, y, sprite, options = {}) {
  const { scale = 3, flip = false, colors = {} } = options;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const cell = sprite[row][flip ? sprite[row].length - 1 - col : col];
      if (cell !== 0 && colors[cell]) {
        ctx.fillStyle = colors[cell];
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

function drawCat(x, y, frame, flip = false) {
  drawSprite(x, y, frame, { scale, flip, colors: { 1: "#000", 2: "#FF0000" } });
}

function drawFish() {
  if (fishObj.collected) return;
  if (camX !== fishObj.roomX || camY !== fishObj.roomY) return;
  drawSprite(fishObj.x, fishObj.y, fish, { scale, colors: { 1: "#4cf" } });
}

function drawEnemies() {
  enemies.forEach(e => {
    if (camX !== e.roomX || camY !== e.roomY) return;
    ctx.fillStyle = "#e33";
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });
}

function drawRoomWalls() {
  const w = walls[camX][camY];
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
  ctx.beginPath();
  if (!w.N) { ctx.moveTo(0, 0); ctx.lineTo(W, 0); }
  if (!w.S) { ctx.moveTo(0, H); ctx.lineTo(W, H); }
  if (!w.W) { ctx.moveTo(0, 0); ctx.lineTo(0, H); }
  if (!w.E) { ctx.moveTo(W, 0); ctx.lineTo(W, H); }
  ctx.stroke();
}

function drawExit() {
  if (!exitRoom) return;
  if (camX === exitRoom.x && camY === exitRoom.y) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, W, H);
  }
}

function updateEnemy(e) {
  if (camX !== e.roomX || camY !== e.roomY) return;

  const px = player.x + spriteW * 0.5;
  const py = player.y + spriteH * 0.5;
  const ex = e.x + e.size * 0.5;
  const ey = e.y + e.size * 0.5;

  const dx = px - ex;
  const dy = py - ey;
  const dist = Math.hypot(dx, dy);

  if (dist < e.sight) {
    const s = e.chaseSpeed / (dist || 1);
    e.vx = dx * s;
    e.vy = dy * s;
  } else {
    if (e.wanderTimer <= 0) {
      const dirs = [-1, 0, 1];
      e.vx = dirs[(Math.random() * 3) | 0] * e.wanderSpeed;
      e.vy = dirs[(Math.random() * 3) | 0] * e.wanderSpeed;
      e.wanderTimer = 60 + ((Math.random() * 60) | 0);
    } else {
      e.wanderTimer--;
    }
  }

  e.x += e.vx;
  e.y += e.vy;

  if (e.x < 0) { e.x = 0; e.vx *= -0.5; }
  if (e.y < 0) { e.y = 0; e.vy *= -0.5; }
  if (e.x > W - e.size) { e.x = W - e.size; e.vx *= -0.5; }
  if (e.y > H - e.size) { e.y = H - e.size; e.vy *= -0.5; }
}

function enemyCaughtPlayer() {
  return enemies.some(e => {
    if (camX !== e.roomX || camY !== e.roomY) return false;
    const r1 = { x: player.x, y: player.y, w: spriteW, h: spriteH };
    const r2 = { x: e.x, y: e.y, w: e.size, h: e.size };
    return !(r2.x > r1.x + r1.w ||
             r2.x + r2.w < r1.x ||
             r2.y > r1.y + r1.h ||
             r2.y + r2.h < r1.y);
  });
}

function update() {
  let moved = false;
  if (keys["ArrowUp"]) { player.y -= player.speed; moved = true; }
  if (keys["ArrowDown"]) { player.y += player.speed; moved = true; }
  if (keys["ArrowLeft"]) { player.x -= player.speed; moved = true; direction = true; }
  if (keys["ArrowRight"]) { player.x += player.speed; moved = true; direction = false; }

  let camChanged = false;


  if (player.x < 0) {
    if (camX > 0 && walls[camX][camY].W) {
      camX--; player.x += W; camChanged = true;
    } else {
      player.x = 0;
    }
  }

  if (player.x + spriteW > W) {
    if (camX < worldW - 1 && walls[camX][camY].E) {
      camX++; player.x -= W; camChanged = true;
    } else {
      player.x = W - spriteW;
    }
  }

  if (player.y < 0) {
    if (camY > 0 && walls[camX][camY].N) {
      camY--; player.y += H; camChanged = true;
    } else {
      player.y = 0;
    }
  }

  if (player.y + spriteH > H) {
    if (camY < worldH - 1 && walls[camX][camY].S) {
      camY++; player.y -= H; camChanged = true;
    } else {
      player.y = H - spriteH;
    }
  }

  if (camChanged) updateStagePos();

  if (moved) {
    frameTimer++;
    if (frameTimer > frameSpeed) {
      frameTimer = 0;
      currentFrame = currentFrame === 1 ? 2 : 1;
    }
    playBeep(440 + Math.random() * 100, 0.05);
  } else {
    currentFrame = 0;
  }

  player.y += gravity;

  enemies.forEach(updateEnemy);

  if (enemyCaughtPlayer()) {
    hitFlash = 18;
    playBeep(900, 0.08, "square");
    player.x = Math.max(0, Math.min(W - spriteW, (W - spriteW) * 0.5));
    player.y = Math.max(0, Math.min(H - spriteH, (H - spriteH) * 0.5));
  }

  if (!fishObj.collected && camX === fishObj.roomX && camY === fishObj.roomY) {
    const r1 = { x: player.x, y: player.y, w: spriteW, h: spriteH };
    const r2 = { x: fishObj.x, y: fishObj.y, w: fishW, h: fishH };
    const overlap = !(r2.x > r1.x + r1.w ||
                      r2.x + r2.w < r1.x ||
                      r2.y > r1.y + r1.h ||
                      r2.y + r2.h < r1.y);
    if (overlap) {
      fishObj.collected = true;
      meowSound();
      pickExitRoom();
      getOutTimer = 60;
    }
  }

  if (checkWin()) {
    wins++;
    camX = 0; camY = 0;
    player.x = Math.floor((W - spriteW) / 2);
    player.y = Math.floor((H - spriteH) / 2);
    updateStagePos();

    fishObj.collected = false;
    fishObj.roomX = Math.floor(Math.random() * worldW);
    fishObj.roomY = Math.floor(Math.random() * worldH);
    fishObj.x = 50 + Math.random() * (W - 100);
    fishObj.y = 50 + Math.random() * (H - 100);
    exitRoom = null;

    enemies.push(createEnemy());
    generateWalls();
  }
}

function checkWin() {
  if (!exitRoom || !fishObj.collected) return false;
  if (camX !== exitRoom.x || camY !== exitRoom.y) return false;

  if (exitRoom.x === 0 && player.x <= 0) return true;
  if (exitRoom.x === worldW - 1 && player.x + spriteW >= W) return true;
  if (exitRoom.y === 0 && player.y <= 0) return true;
  if (exitRoom.y === worldH - 1 && player.y + spriteH >= H) return true;

  return false;
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const hue = (camX + camY * worldW) * 40;
  ctx.fillStyle = `hsl(${hue}, 50%, 20%)`;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ddd";
  ctx.font = "12px monospace";
  ctx.fillText(
    `Room: ${camX},${camY} • Enemies: ${enemies.length} • Fish: ${fishObj.collected ? "✓" : "✗"} • Wins: ${wins}`,
    10, 16
  );

  drawFish();
  drawEnemies();
  drawExit();
  drawRoomWalls();
  drawCat(player.x, player.y, catFrames[currentFrame], direction);

  if (hitFlash > 0) {
    hitFlash--;
    ctx.fillStyle = "rgba(255,0,0,0.25)";
    ctx.fillRect(0, 0, W, H);
  }

  if (getOutTimer > 0) {
    getOutTimer--;
    ctx.fillStyle = "yellow";
    ctx.font = "24px monospace";
    ctx.fillText("GET OUT!", W / 2 - 50, H / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function startGameLoop() {
  resizeCanvas();
  updateStagePos();
  generateWalls();
  loop();
}
