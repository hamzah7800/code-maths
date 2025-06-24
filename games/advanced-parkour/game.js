// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set the overall level width (world coordinates)
const levelWidth = 3000;

// Set canvas to fullscreen and update on resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  FLOOR_Y = canvas.height - 50; // update floor level
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Physics constants
const gravity = 0.8;
const friction = 0.9;

// Global floor (for lava start)
let FLOOR_Y = canvas.height - 50;

// Lava variables
let lavaLevel = FLOOR_Y;              // Starting at the floor
const normalLavaSpeed = 0.2;          // Normal rising speed (pixels/frame)
const slowMoLavaSpeed = 0.05;         // Slow-mo rising speed when checkpoint triggered
let currentLavaSpeed = normalLavaSpeed;
let slowMoActive = false;
const slowMoDuration = 5000;          // Slow-mo lasts 5 seconds
let slowMoTimer = 0;

// Define the player with double-jump capability
const player = {
  x: 100,
  y: canvas.height - 150,
  width: 50,
  height: 80,
  vx: 0,
  vy: 0,
  speed: 5,
  jumpForce: 15,
  jumpsLeft: 2,
  onGround: false
};

// Define platforms in world coordinates
// The ground spans the entire level; additional platforms are added.
// One platform is marked as a checkpoint (checkpoint: true) to trigger slow-mo.
let platforms = [
  { x: 0, y: FLOOR_Y, width: levelWidth, height: 50 }, // ground
  { x: 300, y: FLOOR_Y - 150, width: 150, height: 20 },
  { x: 600, y: FLOOR_Y - 250, width: 150, height: 20 },
  { x: 900, y: FLOOR_Y - 200, width: 150, height: 20 },
  { x: 1300, y: FLOOR_Y - 300, width: 150, height: 20, checkpoint: true }, // checkpoint platform
  { x: 1700, y: FLOOR_Y - 220, width: 150, height: 20 },
  { x: 2100, y: FLOOR_Y - 250, width: 150, height: 20 },
  // Extra parkour platforms
  { x: 2400, y: FLOOR_Y - 350, width: 150, height: 20 },
  { x: 2700, y: FLOOR_Y - 300, width: 150, height: 20 }
];

// Camera offset for horizontal scrolling
let cameraOffsetX = 0;

// Keyboard input tracking
const keys = {};
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Prevent multiple jumps per key press
let jumpKeyHeld = false;

// Simple rectangle intersection check
function rectIntersect(r1, r2) {
  return !(r2.x > r1.x + r1.width ||
           r2.x + r2.width < r1.x ||
           r2.y > r1.y + r1.height ||
           r2.y + r2.height < r1.y);
}

// Update the player's physics and handle collisions with platforms
function updatePlayer() {
  // Horizontal movement (Arrow keys or A/D)
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.vx = -player.speed;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.vx = player.speed;
  } else {
    player.vx *= friction;
  }

  // Jumping: Up Arrow, W, or Space (allow double jump)
  if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && player.jumpsLeft > 0 && !jumpKeyHeld) {
    player.vy = -player.jumpForce;
    player.jumpsLeft--;
    jumpKeyHeld = true;
  }
  if (!(keys["ArrowUp"] || keys["KeyW"] || keys["Space"])) {
    jumpKeyHeld = false;
  }

  // Apply gravity
  player.vy += gravity;

  // Update player position
  player.x += player.vx;
  player.y += player.vy;

  // Collision detection with platforms
  player.onGround = false;
  for (let plat of platforms) {
    // Create rectangles in world coordinates (no camera offset for collision)
    const platRect = { x: plat.x, y: plat.y, width: plat.width, height: plat.height };
    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
    if (rectIntersect(playerRect, platRect)) {
      // Check if landing on top of platform
      if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
        player.y = plat.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
        // If this platform is a checkpoint, trigger slow-mo effect on lava
        if (plat.checkpoint && !slowMoActive) {
          slowMoActive = true;
          currentLavaSpeed = slowMoLavaSpeed;
          slowMoTimer = performance.now() + slowMoDuration;
        }
      }
    }
  }

  // Prevent player from falling below the canvas if no collision occurs
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.vy = 0;
    player.onGround = true;
    player.jumpsLeft = 2;
  }

  // Prevent player from moving off the left side of the level
  if (player.x < 0) player.x = 0;
}

// Update the camera to follow the player horizontally
function updateCamera() {
  cameraOffsetX = player.x - canvas.width / 2 + player.width / 2;
  if (cameraOffsetX < 0) cameraOffsetX = 0;
  if (cameraOffsetX > levelWidth - canvas.width) cameraOffsetX = levelWidth - canvas.width;
}

// Update the lava level (rising from the bottom)
// When slow-mo is active (after hitting a checkpoint), the lava rises more slowly.
function updateLava() {
  if (slowMoActive && performance.now() > slowMoTimer) {
    slowMoActive = false;
    currentLavaSpeed = normalLavaSpeed;
  }
  // Lava rises upward (so lavaLevel decreases)
  lavaLevel -= currentLavaSpeed;
  // Prevent lava from rising above 0 (top of canvas)
  if (lavaLevel < 0) lavaLevel = 0;

  // Check if player touches the lava
  if (player.y + player.height > lavaLevel) {
    alert("Game Over! You were engulfed by lava!");
    resetGame();
  }
}

// Update game state
function update() {
  updatePlayer();
  updateCamera();
  updateLava();
}

// Draw the level: sky, ground, platforms, and lava
function drawLevel() {
  // Draw sky gradient
  let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#87ceeb");
  skyGradient.addColorStop(1, "#5c94fc");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ground: a large platform spanning the level width
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(-cameraOffsetX, canvas.height - 50, levelWidth, 50);

  // Draw platforms (adjust x by cameraOffsetX)
  ctx.fillStyle = "#654321";
  for (let plat of platforms) {
    ctx.fillRect(plat.x - cameraOffsetX, plat.y, plat.width, plat.height);
    // If platform is a checkpoint, highlight it with a yellow border
    if (plat.checkpoint) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(plat.x - cameraOffsetX, plat.y, plat.width, plat.height);
    }
  }

  // Draw rising lava (a red rectangle from lavaLevel to the bottom)
  ctx.fillStyle = "#ff4500";
  ctx.fillRect(-cameraOffsetX, lavaLevel, levelWidth, canvas.height - lavaLevel);
}

// Draw the player character (a red rectangle with a simple face)
function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(player.x - cameraOffsetX, player.y, player.width, player.height);
  // Draw face: white eye and black mustache
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x - cameraOffsetX + player.width/2, player.y + player.height/3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x - cameraOffsetX + 10, player.y + player.height - 15);
  ctx.lineTo(player.x - cameraOffsetX + 40, player.y + player.height - 15);
  ctx.stroke();
}

// Main draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLevel();
  drawPlayer();
}

// Reset the game state
function resetGame() {
  player.x = 100;
  player.y = canvas.height - 150;
  player.vx = 0;
  player.vy = 0;
  player.jumpsLeft = 2;
  lavaLevel = FLOOR_Y;
  slowMoActive = false;
  currentLavaSpeed = normalLavaSpeed;
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// Set normal lava speed
const normalLavaSpeed = 0.2;
currentLavaSpeed = normalLavaSpeed;
