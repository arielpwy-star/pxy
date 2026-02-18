const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const messageEl = document.getElementById("message");

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const FOOD_COUNT = 5;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let foods = [];
let walls = [];
let score = 0;
let speedLevel = 1;
let gameOver = false;
let running = false;
let moveAccumulator = 0;
let lastTs = 0;

const BASE_INTERVAL = 170;

function initSnake() {
  snake = [
    { x: 7, y: 12 },
    { x: 6, y: 12 },
    { x: 5, y: 12 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
}

function initWalls() {
  walls = [];

  // 固定障碍：上下边界内侧构造围墙设施
  const addWallBlock = (x, y, w, h) => {
    for (let i = 0; i < w; i += 1) {
      for (let j = 0; j < h; j += 1) {
        walls.push({ x: x + i, y: y + j });
      }
    }
  };

  addWallBlock(14, 5, 1, 8);
  addWallBlock(21, 10, 1, 9);
  addWallBlock(28, 4, 6, 1);
  addWallBlock(32, 16, 4, 1);
  addWallBlock(3, 17, 6, 1);
}

function randomFreeCell() {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (
    snake.some((s) => s.x === cell.x && s.y === cell.y) ||
    foods.some((f) => f.x === cell.x && f.y === cell.y) ||
    walls.some((w) => w.x === cell.x && w.y === cell.y)
  );

  return cell;
}

function initFoods() {
  foods = Array.from({ length: FOOD_COUNT }, (_, i) => {
    const pos = randomFreeCell();
    const colors = ["#ff5252", "#f59e0b", "#ec4899", "#3b82f6", "#10b981"];
    return {
      ...pos,
      color: colors[i % colors.length],
    };
  });
}

function resetGame() {
  score = 0;
  speedLevel = 1;
  gameOver = false;
  moveAccumulator = 0;
  lastTs = 0;
  scoreEl.textContent = String(score);
  speedEl.textContent = `${speedLevel}x`;
  messageEl.textContent = "游戏进行中：吃彩色小球并避开围墙！";
  messageEl.classList.remove("over");

  initSnake();
  initWalls();
  initFoods();
  draw();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(30, 53, 95, 0.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawWalls() {
  walls.forEach((w) => {
    const px = w.x * CELL;
    const py = w.y * CELL;
    ctx.fillStyle = "#6f7d97";
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    ctx.strokeStyle = "#4d5a74";
    ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
  });
}

function drawFoods() {
  foods.forEach((food) => {
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2;
    const r = CELL * 0.37;

    ctx.beginPath();
    ctx.fillStyle = food.color;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.arc(cx - 4, cy - 4, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSnake() {
  // 画蛇身：卡通简笔画风格
  snake.forEach((seg, idx) => {
    const px = seg.x * CELL + CELL / 2;
    const py = seg.y * CELL + CELL / 2;

    ctx.beginPath();
    ctx.fillStyle = idx === 0 ? "#41c960" : "#37ae52";
    ctx.strokeStyle = idx === 0 ? "#1f7e37" : "#2f8f46";
    ctx.lineWidth = 2;
    ctx.arc(px, py, CELL * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  const head = snake[0];
  const headX = head.x * CELL + CELL / 2;
  const headY = head.y * CELL + CELL / 2;

  // 蛇眼
  const eyeOffsetX = direction.x === 0 ? 5 : direction.x * 4;
  const eyeOffsetY = direction.y === 0 ? 5 : direction.y * 4;

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(headX + eyeOffsetX - 4, headY + eyeOffsetY - 2, 3.1, 0, Math.PI * 2);
  ctx.arc(headX + eyeOffsetX + 4, headY + eyeOffsetY + 2, 3.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(headX + eyeOffsetX - 4, headY + eyeOffsetY - 2, 1.5, 0, Math.PI * 2);
  ctx.arc(headX + eyeOffsetX + 4, headY + eyeOffsetY + 2, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 小舌头
  ctx.strokeStyle = "#f0528f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headX + direction.x * 8, headY + direction.y * 8);
  ctx.lineTo(headX + direction.x * 14 + direction.y * 2, headY + direction.y * 14 + direction.x * 2);
  ctx.moveTo(headX + direction.x * 8, headY + direction.y * 8);
  ctx.lineTo(headX + direction.x * 14 - direction.y * 2, headY + direction.y * 14 - direction.x * 2);
  ctx.stroke();
}

function drawBoundary() {
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1e355f";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawWalls();
  drawFoods();
  drawSnake();
  drawBoundary();
}

function collidesWithWall(cell) {
  const outOfBounds = cell.x < 0 || cell.x >= COLS || cell.y < 0 || cell.y >= ROWS;
  const hitsObstacle = walls.some((w) => w.x === cell.x && w.y === cell.y);
  return outOfBounds || hitsObstacle;
}

function step() {
  direction = { ...nextDirection };
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (collidesWithWall(newHead) || snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
    gameOver = true;
    running = false;
    messageEl.textContent = `游戏结束！最终得分：${score}`;
    messageEl.classList.add("over");
    startBtn.disabled = true;
    restartBtn.disabled = false;
    draw();
    return;
  }

  snake.unshift(newHead);

  const foodIndex = foods.findIndex((f) => f.x === newHead.x && f.y === newHead.y);
  if (foodIndex >= 0) {
    score += 10;
    speedLevel = 1 + Math.floor(score / 50);
    scoreEl.textContent = String(score);
    speedEl.textContent = `${speedLevel}x`;

    foods.splice(foodIndex, 1);
    foods.push({
      ...randomFreeCell(),
      color: ["#ff5252", "#f59e0b", "#ec4899", "#3b82f6", "#10b981"][Math.floor(Math.random() * 5)],
    });
  } else {
    snake.pop();
  }

  draw();
}

function loop(timestamp) {
  if (!running) return;

  if (!lastTs) lastTs = timestamp;
  moveAccumulator += timestamp - lastTs;
  lastTs = timestamp;

  const interval = Math.max(65, BASE_INTERVAL - (speedLevel - 1) * 12);
  if (moveAccumulator >= interval) {
    moveAccumulator -= interval;
    step();
  }

  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

function startGame() {
  resetGame();
  running = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  requestAnimationFrame(loop);
}

function restartGame() {
  startGame();
}

window.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  if (!map[e.key]) return;
  e.preventDefault();

  const desired = map[e.key];
  const reverse = desired.x === -direction.x && desired.y === -direction.y;

  if (!reverse && running) {
    nextDirection = desired;
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

draw();
