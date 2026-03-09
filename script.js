const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_BLOCK_SIZE = 24;
const LINES_PER_LEVEL = 10;
const BASE_DROP_MS = 700;
const SPEED_STEP_MS = 55;
const MIN_DROP_MS = 120;

const PIECES = {
  I: {
    color: "#39c5ff",
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  },
  J: {
    color: "#5f6cff",
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },
  L: {
    color: "#ff9f40",
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },
  O: {
    color: "#ffd93d",
    matrix: [
      [1, 1],
      [1, 1]
    ]
  },
  S: {
    color: "#62e68a",
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ]
  },
  T: {
    color: "#d985ff",
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },
  Z: {
    color: "#ff5c7a",
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]
  }
};

const scoreValues = [0, 100, 300, 500, 800];

const boardCanvas = document.getElementById("board");
const nextCanvas = document.getElementById("next");
const boardCtx = boardCanvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayTextEl = document.getElementById("overlayText");
const restartButton = document.getElementById("restartButton");

let board = [];
let currentPiece = null;
let nextPiece = null;
let bag = [];
let score = 0;
let lines = 0;
let level = 1;
let paused = false;
let gameOver = false;
let lastTime = 0;
let dropAccumulator = 0;
let animationFrameId = 0;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function refillBag() {
  if (bag.length === 0) {
    bag = shuffle(Object.keys(PIECES));
  }
}

function createPiece(type) {
  const { matrix, color } = PIECES[type];
  const width = matrix[0].length;

  return {
    type,
    color,
    matrix: cloneMatrix(matrix),
    x: Math.floor((COLS - width) / 2),
    y: -1
  };
}

function getNextPieceFromBag() {
  refillBag();
  const type = bag.pop();
  return createPiece(type);
}

function resetGame() {
  board = createBoard();
  bag = [];
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropAccumulator = 0;
  currentPiece = getNextPieceFromBag();
  nextPiece = getNextPieceFromBag();
  updateStats();
  hideOverlay();
  draw();
}

function getDropInterval() {
  return Math.max(MIN_DROP_MS, BASE_DROP_MS - (level - 1) * SPEED_STEP_MS);
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]).reverse());
}

function hasCollision(piece, candidateMatrix = piece.matrix, candidateX = piece.x, candidateY = piece.y) {
  for (let y = 0; y < candidateMatrix.length; y += 1) {
    for (let x = 0; x < candidateMatrix[y].length; x += 1) {
      if (!candidateMatrix[y][x]) {
        continue;
      }

      const boardX = candidateX + x;
      const boardY = candidateY + y;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function mergePiece(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) {
        return;
      }

      const boardY = piece.y + y;
      if (boardY >= 0) {
        board[boardY][piece.x + x] = piece.color;
      }
    });
  });
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    lines += cleared;
    score += scoreValues[cleared] * level;
    level = Math.floor(lines / LINES_PER_LEVEL) + 1;
    updateStats();
  }
}

function spawnPiece() {
  currentPiece = nextPiece;
  currentPiece.x = Math.floor((COLS - currentPiece.matrix[0].length) / 2);
  currentPiece.y = -1;
  nextPiece = getNextPieceFromBag();

  if (hasCollision(currentPiece)) {
    gameOver = true;
    showOverlay("Game Over", "Press Restart Game to jump back in.");
  }
}

function lockPiece() {
  mergePiece(currentPiece);
  clearLines();
  spawnPiece();
}

function movePiece(offset) {
  if (paused || gameOver) {
    return;
  }

  const nextX = currentPiece.x + offset;
  if (!hasCollision(currentPiece, currentPiece.matrix, nextX, currentPiece.y)) {
    currentPiece.x = nextX;
    draw();
  }
}

function softDrop() {
  if (paused || gameOver) {
    return false;
  }

  const nextY = currentPiece.y + 1;
  if (!hasCollision(currentPiece, currentPiece.matrix, currentPiece.x, nextY)) {
    currentPiece.y = nextY;
    score += 1;
    updateStats();
    draw();
    return true;
  }

  lockPiece();
  draw();
  return false;
}

function hardDrop() {
  if (paused || gameOver) {
    return;
  }

  let distance = 0;
  while (!hasCollision(currentPiece, currentPiece.matrix, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    distance += 1;
  }
  score += distance * 2;
  updateStats();
  lockPiece();
  draw();
}

function rotatePiece() {
  if (paused || gameOver) {
    return;
  }

  const rotated = rotateMatrix(currentPiece.matrix);
  const kicks = [0, -1, 1, -2, 2];

  for (const offset of kicks) {
    if (!hasCollision(currentPiece, rotated, currentPiece.x + offset, currentPiece.y)) {
      currentPiece.matrix = rotated;
      currentPiece.x += offset;
      draw();
      return;
    }
  }
}

function togglePause() {
  if (gameOver) {
    return;
  }

  paused = !paused;
  if (paused) {
    showOverlay("Paused", "Press P to continue.");
  } else {
    hideOverlay();
  }
}

function updateStats() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawCell(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.fillRect(x * size, y * size, size, 4);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(x * size, y * size + size - 4, size, 4);
  ctx.strokeStyle = "rgba(5, 10, 20, 0.35)";
  ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
}

function drawMatrix(ctx, matrix, offsetX, offsetY, size, color) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(ctx, offsetX + x, offsetY + y, size, color);
      }
    });
  });
}

function drawGhostPiece() {
  let ghostY = currentPiece.y;
  while (!hasCollision(currentPiece, currentPiece.matrix, currentPiece.x, ghostY + 1)) {
    ghostY += 1;
  }

  boardCtx.save();
  boardCtx.globalAlpha = 0.22;
  drawMatrix(boardCtx, currentPiece.matrix, currentPiece.x, ghostY, BLOCK_SIZE, "#ffffff");
  boardCtx.restore();
}

function drawBoard() {
  boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        drawCell(boardCtx, x, y, BLOCK_SIZE, cell);
      }
    });
  });

  if (currentPiece && !gameOver) {
    drawGhostPiece();
    drawMatrix(boardCtx, currentPiece.matrix, currentPiece.x, currentPiece.y, BLOCK_SIZE, currentPiece.color);
  }
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextPiece) {
    return;
  }

  const matrix = nextPiece.matrix;
  const matrixWidth = matrix[0].length;
  const matrixHeight = matrix.length;
  const offsetX = Math.floor((nextCanvas.width / NEXT_BLOCK_SIZE - matrixWidth) / 2);
  const offsetY = Math.floor((nextCanvas.height / NEXT_BLOCK_SIZE - matrixHeight) / 2);

  drawMatrix(nextCtx, matrix, offsetX, offsetY, NEXT_BLOCK_SIZE, nextPiece.color);
}

function draw() {
  drawBoard();
  drawNextPiece();
}

function showOverlay(title, text) {
  overlayTitleEl.textContent = title;
  overlayTextEl.textContent = text;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (!paused && !gameOver) {
    dropAccumulator += delta;
    if (dropAccumulator >= getDropInterval()) {
      const moved = softDrop();
      dropAccumulator = moved ? 0 : dropAccumulator % getDropInterval();
    }
  }

  animationFrameId = window.requestAnimationFrame(update);
}

function handleKeydown(event) {
  if (event.key === "p" || event.key === "P") {
    togglePause();
    return;
  }

  if (gameOver) {
    return;
  }

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      movePiece(-1);
      break;
    case "ArrowRight":
      event.preventDefault();
      movePiece(1);
      break;
    case "ArrowDown":
      event.preventDefault();
      softDrop();
      dropAccumulator = 0;
      break;
    case "ArrowUp":
      event.preventDefault();
      rotatePiece();
      break;
    case " ":
      event.preventDefault();
      hardDrop();
      dropAccumulator = 0;
      break;
    default:
      break;
  }
}

document.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", () => {
  resetGame();
  lastTime = performance.now();
});

resetGame();
window.cancelAnimationFrame(animationFrameId);
animationFrameId = window.requestAnimationFrame(update);
