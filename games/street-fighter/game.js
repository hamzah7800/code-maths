const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Gravity constant for jump physics
const GRAVITY = 0.5;
const FLOOR_Y = canvas.height - 100;

// Define player objects with jump properties
let player1 = { 
  x: 50, 
  y: FLOOR_Y, 
  width: 50, 
  height: 50, 
  health: 200, 
  vy: 0, 
  jumping: false, 
  dead: false
};

let player2 = { 
  x: canvas.width - 150, 
  y: FLOOR_Y, 
  width: 50, 
  height: 50, 
  health: 200, 
  vy: 0, 
  jumping: false, 
  dead: false
};

// Track key states
const keys = {};

// Listen for keyboard events
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Remove instruction overlay on first key press
document.addEventListener("keydown", removeOverlay, { once: true });
function removeOverlay() {
  document.getElementById("instructionOverlay").style.display = "none";
}

// Update game state based on keys pressed
function update() {
  // ---- Player 1 Movement (WASD) ----
  if (!player1.dead) {
    if (keys["KeyA"]) player1.x -= 5;
    if (keys["KeyD"]) player1.x += 5;
    // Jump with W key
    if (keys["KeyW"] && !player1.jumping) {
      player1.jumping = true;
      player1.vy = -12;
    }
    player1.y += player1.vy;
    player1.vy += GRAVITY;
    if (player1.y > FLOOR_Y) {
      player1.y = FLOOR_Y;
      player1.vy = 0;
      player1.jumping = false;
    }
  }

  // ---- Player 2 Movement (Arrow keys) ----
  if (!player2.dead) {
    if (keys["ArrowLeft"]) player2.x -= 5;
    if (keys["ArrowRight"]) player2.x += 5;
    // Jump with Up Arrow
    if (keys["ArrowUp"] && !player2.jumping) {
      player2.jumping = true;
      player2.vy = -12;
    }
    player2.y += player2.vy;
    player2.vy += GRAVITY;
    if (player2.y > FLOOR_Y) {
      player2.y = FLOOR_Y;
      player2.vy = 0;
      player2.jumping = false;
    }
  }

  // ---- Constrain players within canvas ----
  player1.x = Math.max(0, Math.min(player1.x, canvas.width - player1.width));
  player2.x = Math.max(0, Math.min(player2.x, canvas.width - player2.width));

  // ---- Attacks ----
  // Check horizontal distance between players
  const dist = Math.abs(player1.x - player2.x);
  if (dist < 60 && !player1.dead && !player2.dead) {
    // Player 1 attacks: Q (Punch), E (Kick), R (Combo)
    if (keys["KeyQ"]) { player2.health -= 10; keys["KeyQ"] = false; }
    if (keys["KeyE"]) { player2.health -= 15; keys["KeyE"] = false; }
    if (keys["KeyR"]) { player2.health -= 50; keys["KeyR"] = false; }
    // Player 2 attacks: Z (Punch), X (Kick), C (Combo)
    if (keys["KeyZ"]) { player1.health -= 10; keys["KeyZ"] = false; }
    if (keys["KeyX"]) { player1.health -= 15; keys["KeyX"] = false; }
    if (keys["KeyC"]) { player1.health -= 50; keys["KeyC"] = false; }
  }

  // ---- Check for death ----
  if (player1.health <= 0 && !player1.dead) {
    player1.dead = true;
    player1.health = 0;
    setTimeout(() => { alert("Player 2 Wins!"); resetGame(); }, 100);
  }
  if (player2.health <= 0 && !player2.dead) {
    player2.dead = true;
    player2.health = 0;
    setTimeout(() => { alert("Player 1 Wins!"); resetGame(); }, 100);
  }
}

// Draw characters and health bars
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Player 1 (blue) or dead state
  if (!player1.dead) {
    ctx.fillStyle = "blue";
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player1.x + player1.width / 2, player1.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "gray";
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player1.x, player1.y);
    ctx.lineTo(player1.x + player1.width, player1.y + player1.height);
    ctx.moveTo(player1.x + player1.width, player1.y);
    ctx.lineTo(player1.x, player1.y + player1.height);
    ctx.stroke();
  }

  // Draw Player 2 (red) or dead state
  if (!player2.dead) {
    ctx.fillStyle = "red";
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player2.x + player2.width / 2, player2.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "gray";
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player2.x, player2.y);
    ctx.lineTo(player2.x + player2.width, player2.y + player2.height);
    ctx.moveTo(player2.x + player2.width, player2.y);
    ctx.lineTo(player2.x, player2.y + player2.height);
    ctx.stroke();
  }

  // Draw health bars
  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, player1.health, 20);
  ctx.fillStyle = "green";
  ctx.fillRect(canvas.width - player2.health - 10, 10, player2.health, 20);
}

// Reset game state
function resetGame() {
  player1 = { x: 50, y: FLOOR_Y, width: 50, height: 50, health: 200, vy: 0, jumping: false, dead: false };
  player2 = { x: canvas.width - 150, y: FLOOR_Y, width: 50, height: 50, health: 200, vy: 0, jumping: false, dead: false };
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
