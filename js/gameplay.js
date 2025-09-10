const fishObj = {
  roomX: Math.floor(Math.random() * worldW),
  roomY: Math.floor(Math.random() * worldH),
  x: 50 + Math.random() * (W - 100),
  y: 50 + Math.random() * (H - 100),
  collected: false
};

const enemies = [];

function createEnemy() {
  const enemy = {...enemySetting};
  do {
    enemy.roomX = Math.floor(Math.random() * worldW);
    enemy.roomY = Math.floor(Math.random() * worldH);
  } while (enemy.roomX === 0 && enemy.roomY === 0);
  enemy.x = Math.random() * (W - enemy.size);
  enemy.y = Math.random() * (H - enemy.size);
  return enemy;
}

enemies.push(createEnemy());

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

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

  enemies.forEach(updateEnemy);

  if (enemyCaughtPlayer()) {
    hitFlash = 18;
    playBeep(900, 0.08, "square");
    document.getElementById("restart").disabled = false;

    setTimeout(() => {
      document.getElementById("modal").style.display = "flex";
    }, 1000);
    showGameOver("You were caught!", false, true);

    gamePaused = true;

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
    showGameOver("Next level!", true, false);
    document.getElementById("next-level").disabled = false;
    document.getElementById("next-level").addEventListener("click", startNextLevel);
  }
}

function startNextLevel({ resetWins = false, sameLevel = false } = {}) {
  if (resetWins) wins = 0;
  if (!sameLevel) wins++;

  camX = 0;
  camY = 0;
  player.x = Math.floor((W - spriteW) / 2);
  player.y = Math.floor((H - spriteH) / 2);
  updateStagePos();

  fishObj.collected = false;
  fishObj.roomX = Math.floor(Math.random() * worldW);
  fishObj.roomY = Math.floor(Math.random() * worldH);
  fishObj.x = 50 + Math.random() * (W - 100);
  fishObj.y = 50 + Math.random() * (H - 100);

  exitRoom = null;

  if (!sameLevel) {
    enemies.push(createEnemy());
  } else {
    enemies.length = 0; 
    enemies.push(createEnemy());
  }

  generateWalls();

  document.getElementById("next-level").disabled = true;
  document.getElementById("modal").style.display = "none";
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

function loop() {
  if (!gamePaused) update();
  draw();
  requestAnimationFrame(loop);
}

function startGameLoop() {
  resizeCanvas();
  updateStagePos();
  generateWalls();
  loop();
}
