const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to fullscreen and update on resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Overlay to start game
const overlay = document.getElementById("overlay");
overlay.addEventListener("touchstart", startGame);
overlay.addEventListener("click", startGame);

let gameStarted = false;
let score = 0;
let gameOver = false;

// Ship definition: increased speed now
const ship = {
  width: 50,
  height: 30,
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  speed: 12  // increased from 8 to 12 for a faster ship
};

// Bullet properties: increased bullet speed
const bullets = [];
const bulletSpeed = 10;  // increased bullet speed

// Alien properties
const alienRows = 4;
const alienCols = 8;
const alienWidth = 40;
const alienHeight = 30;
const alienPadding = 20;
let aliens = [];
let alienOffsetX = 50;
let alienOffsetY = 50;
let alienSpeed = 1;
let alienDirection = 1; // 1 means moving right, -1 left

function initAliens() {
  aliens = [];
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      aliens.push({
        x: alienOffsetX + col * (alienWidth + alienPadding),
        y: alienOffsetY + row * (alienHeight + alienPadding),
        width: alienWidth,
        height: alienHeight,
        speed: 1 + Math.random(),  // slight random speed variation
        alive: true
      });
    }
  }
}
initAliens();

// Power-up feature
const powerUps = [];
const powerUpInterval = 10000; // spawn a power-up every 10 seconds
let powerUpTimer = 0;
const powerUpDuration = 5000;  // power-up lasts 5 seconds
let powerActive = false;
let powerExpireTime = 0;

// Touch control: tap left half to move left, right half to move right.
canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const x = touch.clientX;
  if (x < canvas.width / 2) {
    // Move left, but ensure we don't leave the screen
    ship.x = Math.max(0, ship.x - ship.speed);
  } else {
    // Move right
    ship.x = Math.min(canvas.width - ship.width, ship.x + ship.speed);
  }
  // Automatically fire a bullet on each tap
  shootBullet();
});

// Spawn a new alien power-up at a random horizontal position near the top
function spawnPowerUp() {
  const puSize = 30;
  const x = Math.random() * (canvas.width - puSize);
  const y = -puSize;
  powerUps.push({ x, y, size: puSize, speed: 2 });
}

// Update power-ups movement and check for collision with the ship
function updatePowerUps(deltaTime) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let pu = powerUps[i];
    pu.y += pu.speed + deltaTime * 0.05;
    // Remove power-up if off screen
    if (pu.y > canvas.height) {
      powerUps.splice(i, 1);
      continue;
    }
    // Collision check with ship
    if (pu.x < ship.x + ship.width && pu.x + pu.size > ship.x &&
        pu.y < ship.y + ship.height && pu.y + pu.size > ship.y) {
      // Activate power-up: increase ship speed and add bonus score
      powerActive = true;
      powerExpireTime = performance.now() + powerUpDuration;
      score += 500; // bonus points
      // Increase ship speed temporarily
      ship.speed *= 1.5;
      powerUps.splice(i, 1);
    }
  }
  // Deactivate power if expired
  if (powerActive && performance.now() > powerExpireTime) {
    powerActive = false;
    ship.speed /= 1.5;
  }
}

// Fire a bullet from the center top of the ship
function shootBullet() {
  bullets.push({
    x: ship.x + ship.width / 2 - 5,
    y: ship.y,
    width: 10,
    height: 20
  });
}

// Update game state
let lastTime = performance.now();
function update(deltaTime) {
  score += deltaTime * 0.01;
  // Update global power-up timer
  powerUpTimer += deltaTime;
  if (powerUpTimer > powerUpInterval) {
    spawnPowerUp();
    powerUpTimer = 0;
  }
  updatePowerUps(deltaTime);

  // Move bullets upward
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y + bullets[i].height < 0) {
      bullets.splice(i, 1);
    }
  }

  // Move aliens
  let rightEdge = 0, leftEdge = canvas.width;
  aliens.forEach(alien => {
    if (alien.alive) {
      alien.x += alien.speed * alienDirection;
      rightEdge = Math.max(rightEdge, alien.x + alien.width);
      leftEdge = Math.min(leftEdge, alien.x);
    }
  });
  // If aliens reach canvas edges, reverse direction and move down
  if (rightEdge >= canvas.width - 20 && alienDirection === 1) {
    alienDirection = -1;
    aliens.forEach(alien => { alien.y += 20; });
  }
  if (leftEdge <= 20 && alienDirection === -1) {
    alienDirection = 1;
    aliens.forEach(alien => { alien.y += 20; });
  }

  // Check for collision between bullets and aliens
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    for (let j = 0; j < aliens.length; j++) {
      let alien = aliens[j];
      if (alien.alive && rectIntersect(bullet, alien)) {
        alien.alive = false;
        bullets.splice(i, 1);
        score += 100;
        break;
      }
    }
  }

  // Check if any alien reaches the bottom (game over)
  for (let alien of aliens) {
    if (alien.alive && alien.y + alien.height >= ship.y) {
      gameOver = true;
    }
  }

  // Check win condition: all aliens dead
  if (aliens.every(a => !a.alive)) {
    gameOver = true;
  }
}

// Check for rectangle intersection
function rectIntersect(r1, r2) {
  return !(r2.x > r1.x + r1.width ||
           r2.x + r2.width < r1.x ||
           r2.y > r1.y + r1.height ||
           r2.y + r2.height < r1.y);
}

// Draw the track and background
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw score at top center
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + Math.floor(score), canvas.width/2, 30);

  // Draw ship as a triangle
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y + ship.height);
  ctx.lineTo(ship.x + ship.width/2, ship.y);
  ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
  ctx.closePath();
  ctx.fill();

  // Draw bullets
  ctx.fillStyle = "white";
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Draw aliens
  aliens.forEach(alien => {
    if (alien.alive) {
      ctx.fillStyle = "lime";
      ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    }
  });

  // Draw power-ups
  powerUps.forEach(pu => {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(pu.x + pu.size/2, pu.y + pu.size/2, pu.size/2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Main game loop: update and draw
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  } else {
    setTimeout(() => { alert("Game Over! Score: " + Math.floor(score)); resetGame(); }, 100);
  }
}

gameLoop(lastTime);

// Reset game state
function resetGame() {
  score = 0;
  ship.x = canvas.width / 2 - 25;
  bullets.length = 0;
  initAliens();
  powerUps.length = 0;
  gameOver = false;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// Start game: hide overlay, request fullscreen, and begin loop
function startGame() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
  overlay.style.display = "none";
  gameStarted = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}
