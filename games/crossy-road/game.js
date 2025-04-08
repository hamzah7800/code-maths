const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to fullscreen size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;
let score = 0;
let lastTime = 0;

// Player definition
let player = {
  x: canvas.width / 2 - 25, // centered horizontally
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 7
};

// Obstacles array and timer variables
let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 1500; // spawn an obstacle every 1.5 seconds

// The game scrolls upward to simulate forward movement
// We'll use a global offset for vertical scrolling
let globalOffset = 0;

// Touch control: tap left half to move left, right half to move right.
canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const x = touch.clientX;
  if (x < canvas.width / 2) {
    // Move left, but ensure we don't leave the screen
    player.x = Math.max(0, player.x - player.speed);
  } else {
    // Move right
    player.x = Math.min(canvas.width - player.width, player.x + player.speed);
  }
});

// Spawn a new obstacle at a random horizontal position within the road bounds
function spawnObstacle() {
  const obsWidth = 50;
  const obsHeight = 50;
  const x = Math.random() * (canvas.width - obsWidth);
  const y = -obsHeight;
  const speed = 3 + Math.random() * 2;
  obstacles.push({ x, y, width: obsWidth, height: obsHeight, speed });
}

// Update game state
function update(deltaTime) {
  score += deltaTime * 0.01;
  globalOffset += deltaTime * 0.05; // Scroll speed

  // Move obstacles downward relative to scrolling
  for (let obs of obstacles) {
    obs.y += obs.speed + deltaTime * 0.05;
  }
  // Remove obstacles that are off screen
  obstacles = obstacles.filter(obs => obs.y < canvas.height);

  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  // Collision detection
  for (let obs of obstacles) {
    if (rectIntersect(player, obs)) {
      gameOver();
      return;
    }
  }
}

// Check for rectangle intersection
function rectIntersect(r1, r2) {
  return !(r2.x > r1.x + r1.width ||
           r2.x + r2.width < r1.x ||
           r2.y > r1.y + r1.height ||
           r2.y + r2.height < r1.y);
}

// Draw the game scene
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background (simulate road/grass)
  // For simplicity, fill with a single color; you can add more details if desired.
  ctx.fillStyle = "#88c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw obstacles
  ctx.fillStyle = "red";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Draw the player
  ctx.fillStyle = "yellow";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw score at the top center
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + Math.floor(score), canvas.width / 2, 30);
}

// Main game loop
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  if (gameStarted) requestAnimationFrame(gameLoop);
}

// Game over handler
function gameOver() {
  gameStarted = false;
  alert("Game Over! Score: " + Math.floor(score));
  resetGame();
}

// Reset game state
function resetGame() {
  score = 0;
  globalOffset = 0;
  obstacles = [];
  player.x = canvas.width / 2 - 25;
  lastTime = 0;
  document.getElementById("overlay").style.display = "block";
}

// Start game: hide overlay, request fullscreen, and begin loop
function startGame() {
  // Request fullscreen
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
  document.getElementById("overlay").style.display = "none";
  gameStarted = true;
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// Start game on overlay tap
document.getElementById("overlay").addEventListener("touchstart", startGame);
document.getElementById("overlay").addEventListener("click", startGame);
