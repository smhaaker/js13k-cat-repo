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