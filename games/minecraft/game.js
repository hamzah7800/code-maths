const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const tileSize = 32;

// Define a fixed world size (in tiles)
const worldWidth = 50;
const worldHeight = 50;
const world = [];

let visibleRows, visibleCols;

// Generate a persistent world only once at startup
function generateWorld() {
  for (let row = 0; row < worldHeight; row++) {
    const rowArray = [];
    for (let col = 0; col < worldWidth; col++) {
      rowArray.push(Math.random() > 0.5 ? 'grass' : 'dirt');
    }
    world.push(rowArray);
  }
}

// Resize the canvas and update how many tiles are visible
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  visibleRows = Math.floor(canvas.height / tileSize);
  visibleCols = Math.floor(canvas.width / tileSize);
}

window.addEventListener('resize', resizeCanvas);
generateWorld();
resizeCanvas();

// Draw one tile; if it's outside the world bounds, fill with a default "sky" color
function drawTile(x, y) {
  let tile;
  if (y < world.length && x < world[y].length) {
    tile = world[y][x];
  } else {
    tile = 'sky';
  }

  if (tile === 'grass') {
    context.fillStyle = '#00FF00';
  } else if (tile === 'dirt') {
    context.fillStyle = '#8B4513';
  } else {
    context.fillStyle = '#87CEEB'; // sky color for undefined areas
  }
  context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

// Render only the visible part of the world on the canvas
function render() {
  for (let row = 0; row < visibleRows; row++) {
    for (let col = 0; col < visibleCols; col++) {
      drawTile(col, row);
    }
  }
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();