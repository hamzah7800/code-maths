const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants for the track and race
const finishDistance = 5000;  // Distance required to finish the race
const roadWidth = 400;        // Width of the road
const roadX = (canvas.width - roadWidth) / 2; // Center the road horizontally

// Key tracking
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// Define Player 1 and Player 2 objects
// Player 1 will be in the left lane, Player 2 in the right lane.
let player1 = {
  x: roadX + roadWidth * 0.25 - 25,  // Left lane (centered in left half of road)
  distance: 0,
  speed: 0,
  maxSpeed: 10,
  color: "blue"
};

let player2 = {
  x: roadX + roadWidth * 0.75 - 25,  // Right lane (centered in right half of road)
  distance: 0,
  speed: 0,
  maxSpeed: 10,
  color: "red"
};

// Update game state
function update() {
  // --- Player 1 controls (W, A, D) ---
  if (keys["KeyW"]) {
    player1.speed = Math.min(player1.speed + 0.2, player1.maxSpeed);
  } else {
    player1.speed = Math.max(player1.speed - 0.1, 0);
  }
  if (keys["KeyA"]) player1.x -= 5;
  if (keys["KeyD"]) player1.x += 5;
  // Constrain Player 1 within road boundaries
  player1.x = Math.max(roadX, Math.min(player1.x, roadX + roadWidth/2 - 50));
  player1.distance += player1.speed;

  // --- Player 2 controls (Up Arrow, Left Arrow, Right Arrow) ---
  if (keys["ArrowUp"]) {
    player2.speed = Math.min(player2.speed + 0.2, player2.maxSpeed);
  } else {
    player2.speed = Math.max(player2.speed - 0.1, 0);
  }
  if (keys["ArrowLeft"]) player2.x -= 5;
  if (keys["ArrowRight"]) player2.x += 5;
  player2.x = Math.max(roadX + roadWidth/2, Math.min(player2.x, roadX + roadWidth - 50));
  player2.distance += player2.speed;

  // Check if any player reaches the finish line
  if (player1.distance >= finishDistance || player2.distance >= finishDistance) {
    let winner = player1.distance >= finishDistance ? "Player 1" : "Player 2";
    alert(winner + " wins!");
    resetGame();
  }
}

// Reset game state
function resetGame() {
  player1.distance = 0;
  player1.speed = 0;
  player1.x = roadX + roadWidth * 0.25 - 25;

  player2.distance = 0;
  player2.speed = 0;
  player2.x = roadX + roadWidth * 0.75 - 25;
}

// Return the highest distance traveled (for scrolling effect)
function getGlobalOffset() {
  return Math.max(player1.distance, player2.distance);
}

// Draw the track: grass, road, lane markers, finish line
function drawTrack() {
  // Draw grass on sides
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, roadX, canvas.height);
  ctx.fillRect(roadX + roadWidth, 0, roadX, canvas.height);

  // Draw road
  ctx.fillStyle = "gray";
  ctx.fillRect(roadX, 0, roadWidth, canvas.height);

  // Draw lane markers
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  // Vertical line in the middle of the road to separate lanes
  ctx.beginPath();
  ctx.moveTo(roadX + roadWidth/2, 0);
  ctx.lineTo(roadX + roadWidth/2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw finish line if within visible area
  let globalOffset = getGlobalOffset();
  let finishY = canvas.height - (finishDistance - globalOffset);
  if (finishY > 0 && finishY < canvas.height) {
    ctx.fillStyle = "white";
    ctx.fillRect(roadX, finishY, roadWidth, 10);
  }
}

// Draw the cars and the score board
function drawCars() {
  let globalOffset = getGlobalOffset();
  // Calculate vertical positions: the farther along the race, the higher up the car is drawn.
  let p1Y = canvas.height - 150 + (player1.distance - globalOffset);
  let p2Y = canvas.height - 150 + (player2.distance - globalOffset);

  // Draw Player 1's car (blue)
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, p1Y, 50, 30);
  ctx.fillStyle = "black";
  ctx.fillRect(player1.x + 5, p1Y + 30, 10, 5);
  ctx.fillRect(player1.x + 35, p1Y + 30, 10, 5);

  // Draw Player 2's car (red)
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, p2Y, 50, 30);
  ctx.fillStyle = "black";
  ctx.fillRect(player2.x + 5, p2Y + 30, 10, 5);
  ctx.fillRect(player2.x + 35, p2Y + 30, 10, 5);
}

// Draw the scoreboard (Player 1 on left, Player 2 on right)
function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Player 1: " + Math.floor(player1.distance), 10, 40);
  ctx.textAlign = "right";
  ctx.fillText("Player 2: " + Math.floor(player2.distance), canvas.width - 10, 40);
}

// Main draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  drawCars();
  drawUI();
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
