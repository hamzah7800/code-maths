const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to fullscreen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Define physics constants
const gravity = 0.8;
const friction = 0.9;

// Define Mario (player)
const player = {
  x: 50,
  y: canvas.height - 150,
  width: 50,
  height: 50,
  dx: 0,
  dy: 0,
  speed: 5,
  jumpStrength: 15,
  onGround: false
};

// Define platforms (including ground and some floating platforms)
const platforms = [
  // Ground platform
  { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
  // Floating platforms
  { x: 200, y: canvas.height - 200, width: 150, height: 20 },
  { x: 500, y: canvas.height - 300, width: 120, height: 20 },
  { x: 800, y: canvas.height - 250, width: 150, height: 20 },
  { x: 1100, y: canvas.height - 350, width: 150, height: 20 }
];

// Listen for keyboard input
const keys = {};
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Update player position and physics
function updatePlayer() {
  // Horizontal movement (use Arrow keys or A/D)
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.dx = -player.speed;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.dx = player.speed;
  } else {
    player.dx *= friction;  // gradual slow down
  }

  // Jumping: Up Arrow, W, or Space
  if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && player.onGround) {
    player.dy = -player.jumpStrength;
    player.onGround = false;
  }

  // Apply gravity
  player.dy += gravity;

  // Update position
  player.x += player.dx;
  player.y += player.dy;

  // Prevent going off-screen horizontally
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Collision detection with platforms
  player.onGround = false;
  for (let platform of platforms) {
    if (collision(player, platform)) {
      // Simple collision resolution: place player on top of platform
      player.y = platform.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  }

  // Prevent falling below ground
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.onGround = true;
  }
}

// Check collision between player and a platform
function collision(player, platform) {
  return (
    player.x < platform.x + platform.width &&
    player.x + player.width > platform.x &&
    player.y < platform.y + platform.height &&
    player.y + player.height > platform.y
  );
}

// Draw platforms
function drawPlatforms() {
  ctx.fillStyle = "#654321";  // Brown color for platforms
  platforms.forEach(platform => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

// Draw Mario (player)
function drawPlayer() {
  // Draw Mario as a red rectangle
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Draw a simple face
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x + player.width / 2, player.y + player.height / 3, 5, 0, Math.PI * 2);
  ctx.fill();
  // Draw a simple mustache line
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(player.x + 10, player.y + player.height - 15);
  ctx.lineTo(player.x + 40, player.y + player.height - 15);
  ctx.stroke();
}

// Main draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background (sky)
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#5c94fc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPlatforms();
  drawPlayer();
}

// Main game loop
function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
