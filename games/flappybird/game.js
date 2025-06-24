const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let cw = (canvas.width = window.innerWidth);
let ch = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
});

// Game settings
const gravity = 0.5;
const flapStrength = -10;
let bird, pipes, frameCount, score, gameOver;

// Bird object
class Bird {
  constructor() {
    this.x = cw / 4;
    this.y = ch / 2;
    this.radius = 20;
    this.velocity = 0;
  }
  update() {
    this.velocity += gravity;
    this.y += this.velocity;
  }
  flap() {
    this.velocity = flapStrength;
  }
  draw() {
    ctx.fillStyle = "#FFEB3B";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Pipe object
class Pipe {
  constructor() {
    this.topHeight = Math.random() * (ch / 2) + 50;
    this.gap = 150;
    this.bottomY = this.topHeight + this.gap;
    this.x = cw;
    this.width = 80;
    this.speed = 4;
  }
  update() {
    this.x -= this.speed;
  }
  draw() {
    ctx.fillStyle = "#4CAF50";
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    // Bottom pipe
    ctx.fillRect(this.x, this.bottomY, this.width, ch - this.bottomY);
  }
}

function init() {
  bird = new Bird();
  pipes = [];
  frameCount = 0;
  score = 0;
  gameOver = false;
  document.getElementById("gameOver").classList.add("hidden");
  animate();
}

function animate() {
  if (gameOver) return;
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, cw, ch);

  // Update bird
  bird.update();
  bird.draw();

  // Every 90 frames, add a new pipe
  if (frameCount % 90 === 0) {
    pipes.push(new Pipe());
  }

  // Update and draw pipes
  pipes.forEach((pipe, index) => {
    pipe.update();
    pipe.draw();

    // Check for collision
    if (
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipe.width &&
      (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.bottomY)
    ) {
      endGame();
    }

    // Increase score if pipe passed
    if (pipe.x + pipe.width < bird.x && !pipe.scored) {
      score++;
      pipe.scored = true;
    }

    // Remove off-screen pipes
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
    }
  });

  // Check if bird hits the ground or flies off top
  if (bird.y + bird.radius >= ch || bird.y - bird.radius <= 0) {
    endGame();
  }

  // Draw score
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  frameCount++;
}

function endGame() {
  gameOver = true;
  document.getElementById("gameOver").classList.remove("hidden");
}

// Input: spacebar to flap
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameOver) {
      init();
    } else {
      bird.flap();
    }
  }
});

// Touch: tap to flap (or restart if game over)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameOver) {
    init();
  } else {
    bird.flap();
  }
});

// Start the game
init();
