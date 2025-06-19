const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the maze (11 rows x 15 cols)
// 1 = wall, 0 = path
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,0,0,0,0,1,0,1,1,0,1],
  [1,0,0,0,1,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,0,1,0,0,0,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,0,0,0,1,1,0,1,0,1],
  [1,0,0,0,1,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const mazeRows = maze.length;       // 11 rows
const mazeCols = maze[0].length;      // 15 columns

// Global variables for dynamic scaling
let cellSize, offsetX, offsetY;

// Set canvas size and recalc scaling on resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Compute the maximum cell size that allows the maze to fit
  cellSize = Math.min(canvas.width / mazeCols, canvas.height / mazeRows);
  // Center the maze
  offsetX = (canvas.width - mazeCols * cellSize) / 2;
  offsetY = (canvas.height - mazeRows * cellSize) / 2;
  updatePacmanPosition();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create dots grid for maze paths (true if a dot exists)
let dots = [];
for (let r = 0; r < mazeRows; r++) {
  dots[r] = [];
  for (let c = 0; c < mazeCols; c++) {
    dots[r][c] = (maze[r][c] === 0);
  }
}

let score = 0;

// Define Pac-Man object; start at row 1, col 1
let pacman = {
  row: 1,
  col: 1,
  x: 0, // will be computed in updatePacmanPosition()
  y: 0,
  radius: 0, // computed as 0.4 * cellSize
  speed: 2,   // movement per update (in cells)
  // Direction vector; set by arrow keys
  dirX: 0,
  dirY: 0
};

function updatePacmanPosition() {
  pacman.x = offsetX + pacman.col * cellSize + cellSize / 2;
  pacman.y = offsetY + pacman.row * cellSize + cellSize / 2;
  pacman.radius = cellSize * 0.4;
}
updatePacmanPosition();

// Handle arrow key events to update Pac-Man's direction
document.addEventListener('keydown', (e) => {
  if (e.code === "ArrowUp") { pacman.dirX = 0; pacman.dirY = -1; }
  else if (e.code === "ArrowDown") { pacman.dirX = 0; pacman.dirY = 1; }
  else if (e.code === "ArrowLeft") { pacman.dirX = -1; pacman.dirY = 0; }
  else if (e.code === "ArrowRight") { pacman.dirX = 1; pacman.dirY = 0; }
});

// Check if a given cell (row, col) is a wall (maze value 1)
function isWall(row, col) {
  if (row < 0 || row >= mazeRows || col < 0 || col >= mazeCols) return true;
  return maze[row][col] === 1;
}

// Update Pac-Man: move one cell in the direction if no wall blocks the target
function updatePacman() {
  // Calculate the target cell based on the current direction
  let targetRow = pacman.row + pacman.dirY;
  let targetCol = pacman.col + pacman.dirX;
  // Move only if target cell is within bounds and not a wall
  if (!isWall(targetRow, targetCol)) {
    pacman.row = targetRow;
    pacman.col = targetCol;
    updatePacmanPosition();
    // If a dot exists in the new cell, eat it and increase score
    if (dots[pacman.row][pacman.col]) {
      dots[pacman.row][pacman.col] = false;
      score += 10;
      if (allDotsEaten()) {
        alert("You win! Score: " + score);
        resetGame();
      }
    }
  }
}

// Check if all dots have been eaten
function allDotsEaten() {
  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      if (dots[r][c]) return false;
    }
  }
  return true;
}

// Reset the game state
function resetGame() {
  score = 0;
  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      dots[r][c] = (maze[r][c] === 0);
    }
  }
  pacman.row = 1;
  pacman.col = 1;
  pacman.dirX = 0;
  pacman.dirY = 0;
  updatePacmanPosition();
}

// Draw the maze: walls and dots
function drawMaze() {
  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      let x = offsetX + c * cellSize;
      let y = offsetY + r * cellSize;
      if (maze[r][c] === 1) {
        ctx.fillStyle = "#0000cc";  // Wall color
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        ctx.fillStyle = "#000";     // Path color
        ctx.fillRect(x, y, cellSize, cellSize);
        if (dots[r][c]) {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

// Draw Pac-Man with an open mouth
function drawPacman() {
  ctx.fillStyle = "yellow";
  // Draw Pac-Man as an arc to simulate an open mouth
  let startAngle = 0.25 * Math.PI;
  let endAngle = 1.75 * Math.PI;
  ctx.beginPath();
  ctx.arc(pacman.x, pacman.y, pacman.radius, startAngle, endAngle, false);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fill();
}

// Draw the score at the top center of the screen
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + score, canvas.width / 2, 30);
}

// Main draw function: clear and redraw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawPacman();
  drawScore();
}

// Game loop: update every 300ms (can be adjusted)
let lastMoveTime = 0;
function gameLoop(timestamp) {
  if (!lastMoveTime) lastMoveTime = timestamp;
  let delta = timestamp - lastMoveTime;
  if (delta > 300) {  // move Pac-Man every 300ms
    updatePacman();
    lastMoveTime = timestamp;
  }
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
