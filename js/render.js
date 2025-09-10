function drawSprite(x, y, sprite, { scale = 3, flip = false, colors = {} } = {}) {
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

function drawOldLady(x, y, sprite, { scale = 3, flip = false } = {}) {
  const colors = {
    1: "rgb(0, 0, 0)", 2: "rgb(226, 164, 122)", 3: "rgb(101, 45, 45)",
    4: "rgb(37, 26, 40)", 5: "rgb(251, 242, 54)", 6: "rgb(255, 255, 255)",
    7: "rgb(120, 114, 102)", 8: "rgb(51, 37, 59)", 9: "rgb(75, 42, 30)",
    10: "rgb(52, 29, 22)", 11: "rgb(147, 65, 60)", 12: "rgb(208, 138, 96)",
    13: "rgb(68, 64, 63)"
  };
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const cell = sprite[row][flip ? sprite[row].length - 1 - col : col];
      if (cell !== 0) {
        ctx.fillStyle = colors[cell];
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

function drawEnemies() {
  enemies.forEach(e => {
    if (camX !== e.roomX || camY !== e.roomY) return;
    drawOldLady(e.x, e.y, oldLady, { scale: 2, flip: false });
  });
}

function drawRoomWalls() {
  const w = walls[camX][camY];
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
  ctx.beginPath();
  if (!w.N) ctx.moveTo(0,0), ctx.lineTo(W,0);
  if (!w.S) ctx.moveTo(0,H), ctx.lineTo(W,H);
  if (!w.W) ctx.moveTo(0,0), ctx.lineTo(0,H);
  if (!w.E) ctx.moveTo(W,0), ctx.lineTo(W,H);
  ctx.stroke();
}

function drawExit() {
  if (!exitRoom) return;
  if (camX === exitRoom.x && camY === exitRoom.y) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 6;
    ctx.strokeRect(0,0,W,H);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const hue = (camX + camY * worldW) * 40;
  ctx.fillStyle = `hsl(${hue},50%,20%)`;
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle = "#ddd";
  ctx.font = "12px monospace";
  ctx.fillText(`Room: ${camX},${camY} • Enemies: ${enemies.length} • Fish: ${fishObj.collected ? "✓" : "✗"} • Wins: ${wins}`, 10, 16);

  drawFish();
  drawEnemies();
  drawExit();
  drawRoomWalls();
  drawCat(player.x, player.y, catFrames[currentFrame], direction);

  if (hitFlash > 0) {
    hitFlash--;
    ctx.fillStyle = "rgba(255,0,0,0.25)";
    ctx.fillRect(0,0,W,H);
  }

  if (getOutTimer > 0) {
    getOutTimer--;
    ctx.fillStyle = "yellow";
    ctx.font = "24px monospace";
    ctx.fillText("GET OUT!", W/2-50,H/2);
  }
}
