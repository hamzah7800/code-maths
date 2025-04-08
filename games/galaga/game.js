const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player setup
const playerWidth = 50;
const playerHeight = 30;
let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height - playerHeight - 20;
const playerSpeed = 5;
let playerHealth = 100;         // Starting health
let playerMaxHealth = 100;
let playerBulletDamage = 10;    // Base damage for player's bullets

// Special power settings
let specialReady = true;
const specialCooldown = 5000;   // in milliseconds

// Bullet setup (player bullets)
const bulletWidth = 5;
const bulletHeight = 15;
const bulletSpeed = 3;
let bullets = [];

// Enemy bullet setup
const enemyBulletWidth = 5;
const enemyBulletHeight = 15;
const enemyBulletSpeed = 4;
let enemyBullets = [];
let enemyBulletDamage = 5;      // Base damage for enemy bullets

// Enemy setup
const enemyWidth = 50;
const enemyHeight = 30;
let enemies = [];

// Create custom level configurations (levels 1 to 50)
const levels = Array.from({ length: 50 }, (_, i) => {
  const levelNum = i + 1;
  return {
    enemyRows: Math.min(3 + Math.floor(levelNum / 10), 8),      // Level 1 starts with 3 rows; max 8 rows
    enemiesPerRow: Math.min(5 + Math.floor(levelNum / 5), 15),    // Level 1 starts with 5 per row; max 15 per row
    enemySpeed: 1 + (levelNum - 1) * 0.2,                         // Gradually increase speed
    enemyHealth: 20 + (levelNum - 1) * 5,                           // Increase enemy health per level
    enemyBulletDamage: 5 + (levelNum - 1) * 2,                      // Increase enemy bullet damage
    playerHealth: 100 + (levelNum - 1) * 10,                        // Increase player health per level
    playerBulletDamage: 10 + (levelNum - 1) * 2                     // Increase player's bullet damage per level
  };
});

// Game state variables
let currentLevel = 0; // index in levels array (level 1 is index 0)
let score = 0;

// Set initial enemy parameters from level 1
let enemyRows = levels[currentLevel].enemyRows;
let enemiesPerRow = levels[currentLevel].enemiesPerRow;
let enemySpeed = levels[currentLevel].enemySpeed;
let currentEnemyHealth = levels[currentLevel].enemyHealth;
enemyBulletDamage = levels[currentLevel].enemyBulletDamage;
playerHealth = levels[currentLevel].playerHealth;
playerMaxHealth = playerHealth;
playerBulletDamage = levels[currentLevel].playerBulletDamage;

// Sound effects (ensure these files exist in the assets folder)
const shootSound = new Audio('assets/shoot.mp3');
const explodeSound = new Audio('assets/explode.mp3');

// Key event listeners for movement, shooting, and special power
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;
let specialPressed = false;
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === " ") spacePressed = true;
  if (e.key.toLowerCase() === "s") specialPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === " ") spacePressed = false;
  if (e.key.toLowerCase() === "s") specialPressed = false;
}

// Create enemies based on current level configuration
function createEnemies() {
  enemies = [];  // Clear previous enemies
  for (let i = 0; i < enemyRows; i++) {
    for (let j = 0; j < enemiesPerRow; j++) {
      let enemy = {
        x: 50 + j * (enemyWidth + 10),
        y: 50 + i * (enemyHeight + 10),
        width: enemyWidth,
        height: enemyHeight,
        speed: enemySpeed,
        direction: 1, // 1 means moving right, -1 means left
        health: currentEnemyHealth,
        row: i  // Save row index so we know which ones can shoot
      };
      enemies.push(enemy);
    }
  }
}

// Move enemies in a wave-like pattern
function moveEnemies() {
  enemies.forEach(enemy => {
    enemy.x += enemy.speed * enemy.direction;
    if (enemy.x >= canvas.width - enemy.width || enemy.x <= 0) {
      enemy.direction *= -1;
      enemy.y += enemy.height;  // Move down on wall hit
    }
  });
}

// Allow first-row enemies (row 0) to randomly shoot
function enemyShoot() {
  enemies.forEach(enemy => {
    if (enemy.row === 0) {
      // Random chance to shoot (tweak probability as needed)
      if (Math.random() < 0.005) {
        let bullet = {
          x: enemy.x + enemy.width / 2 - enemyBulletWidth / 2,
          y: enemy.y + enemy.height,
          width: enemyBulletWidth,
          height: enemyBulletHeight,
          damage: enemyBulletDamage
        };
        enemyBullets.push(bullet);
      }
    }
  });
}

// Move enemy bullets downward and remove if off-screen
function moveEnemyBullets() {
  for (let i = 0; i < enemyBullets.length; i++) {
    enemyBullets[i].y += enemyBulletSpeed;
    if (enemyBullets[i].y > canvas.height) {
      enemyBullets.splice(i, 1);
      i--;
    }
  }
}

// Draw enemy bullets
function drawEnemyBullets() {
  ctx.fillStyle = 'orange';
  enemyBullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Draw enemies on canvas
function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    // Draw enemy health bar above enemy
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(enemy.health, enemy.x + enemy.width / 4, enemy.y - 5);
  });
}

// Create and shoot player bullets
function shootBullet() {
  if (spacePressed) {
    let bullet = {
      x: playerX + playerWidth / 2 - bulletWidth / 2,
      y: playerY,
      width: bulletWidth,
      height: bulletHeight,
      damage: playerBulletDamage,
      special: false
    };
    bullets.push(bullet);
    shootSound.play();
    spacePressed = false; // Prevent auto-fire until key is released
  }
}

// Special power: Fire a powerful bullet (area effect, 3x damage)
function shootSpecialBullet() {
  if (specialPressed && specialReady) {
    let bullet = {
      x: playerX + playerWidth / 2 - bulletWidth / 2,
      y: playerY,
      width: bulletWidth,
      height: bulletHeight,
      damage: playerBulletDamage * 3,
      special: true
    };
    bullets.push(bullet);
    shootSound.play();
    specialReady = false;
    // Cooldown timer for special power
    setTimeout(() => {
      specialReady = true;
    }, specialCooldown);
    specialPressed = false;
  }
}

// Move player bullets upward and remove if off-screen
function moveBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

// Draw player bullets
function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Move the player based on input; keep player's y fixed at bottom
function movePlayer() {
  if (leftPressed && playerX > 0) playerX -= playerSpeed;
  if (rightPressed && playerX < canvas.width - playerWidth) playerX += playerSpeed;
  // Always keep the player at the bottom
  playerY = canvas.height - playerHeight - 20;
}

// Draw the player on canvas along with a health bar
function drawPlayer() {
  ctx.fillStyle = 'white';
  ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
  // Draw player's health above the player
  ctx.fillStyle = 'green';
  ctx.font = '16px Arial';
  ctx.fillText("HP: " + playerHealth, playerX, playerY - 10);
}

// Check collisions between player bullets and enemies (damage is subtracted from enemy health)
function checkBulletEnemyCollision() {
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      let bullet = bullets[i];
      let enemy = enemies[j];
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Apply damage
        enemy.health -= bullet.damage;
        // Remove the bullet
        bullets.splice(i, 1);
        i--;
        // Remove enemy if its health is zero or below
        if (enemy.health <= 0) {
          enemies.splice(j, 1);
          score += 10;
          explodeSound.play();
        }
        break;
      }
    }
  }
}

// Check collisions between enemy bullets and the player
function checkEnemyBulletCollision() {
  for (let i = 0; i < enemyBullets.length; i++) {
    let bullet = enemyBullets[i];
    if (
      playerX < bullet.x + bullet.width &&
      playerX + playerWidth > bullet.x &&
      playerY < bullet.y + bullet.height &&
      playerY + playerHeight > bullet.y
    ) {
      // Subtract health from the player
      playerHealth -= bullet.damage;
      enemyBullets.splice(i, 1);
      i--;
      // If player health is zero or below, trigger game over
      if (playerHealth <= 0) {
        gameOver();
      }
    }
  }
}

// Check for collisions between the player and enemies
function checkCollision() {
  for (let enemy of enemies) {
    if (
      playerX < enemy.x + enemy.width &&
      playerX + playerWidth > enemy.x &&
      playerY < enemy.y + enemy.height &&
      playerY + playerHeight > enemy.y
    ) {
      gameOver();
    }
  }
}

// Draw score and level information on canvas
function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
}

function drawLevel() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Level: ' + (currentLevel + 1), canvas.width - 120, 30);
}

// Adjust canvas size when the window is resized; recenter player
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  playerX = canvas.width / 2 - playerWidth / 2;
  playerY = canvas.height - playerHeight - 20;
});

// Display Game Over screen with final score and restart prompt
function gameOver() {
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Game Over! Final Score: ' + score, canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Press R to Restart', canvas.width / 2 - 75, canvas.height / 2 + 40);
  window.addEventListener('keydown', restartGame);
}

// Restart the game when "R" is pressed
function restartGame(e) {
  if (e.key === 'r' || e.key === 'R') {
    window.removeEventListener('keydown', restartGame);
    score = 0;
    currentLevel = 0;
    // Update level-specific parameters
    enemyRows = levels[currentLevel].enemyRows;
    enemiesPerRow = levels[currentLevel].enemiesPerRow;
    enemySpeed = levels[currentLevel].enemySpeed;
    currentEnemyHealth = levels[currentLevel].enemyHealth;
    enemyBulletDamage = levels[currentLevel].enemyBulletDamage;
    playerHealth = levels[currentLevel].playerHealth;
    playerMaxHealth = playerHealth;
    playerBulletDamage = levels[currentLevel].playerBulletDamage;
    createEnemies();
    gameLoop();
  }
}

// Advance to the next level when all enemies are defeated
function nextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    enemyRows = levels[currentLevel].enemyRows;
    enemiesPerRow = levels[currentLevel].enemiesPerRow;
    enemySpeed = levels[currentLevel].enemySpeed;
    currentEnemyHealth = levels[currentLevel].enemyHealth;
    enemyBulletDamage = levels[currentLevel].enemyBulletDamage;
    // Increase player parameters if desired:
    playerHealth = levels[currentLevel].playerHealth;
    playerMaxHealth = playerHealth;
    playerBulletDamage = levels[currentLevel].playerBulletDamage;
    createEnemies();
  } else {
    // All levels complete
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Congratulations! You completed all levels!', canvas.width / 2 - 250, canvas.height / 2);
    return;
  }
}

// Main game loop
let animationId;
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  moveEnemies();
  enemyShoot();
  shootBullet();
  shootSpecialBullet();
  moveBullets();
  moveEnemyBullets();
  checkBulletEnemyCollision();
  checkEnemyBulletCollision();
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawEnemyBullets();
  drawScore();
  drawLevel();
  checkCollision();

  // Advance level if no enemies remain
  if (enemies.length === 0) {
    nextLevel();
  }

  animationId = requestAnimationFrame(gameLoop);
}

// Start the game
createEnemies();
gameLoop();
