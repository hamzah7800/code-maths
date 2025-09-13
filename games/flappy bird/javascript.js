// Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.1;
const JUMP_SPEED = 4;
const PIPE_SPEED = 2;
const PIPE_GAP = 120;
const PIPE_WIDTH = 50;
const PIPE_COLOR = "#006600";
const BIRD_SIZE = 20;
const BIRD_COLOR = "#FFCC00";

// Variables
var canvas;
var ctx;
var bird;
var pipes;
var score;
var isPlaying;

// Bird class
class Bird {
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.speed = 0;
  }

  draw() {
    ctx.fillStyle = BIRD_COLOR;
    ctx.fillRect(this.x - BIRD_SIZE / 2, this.y - BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
  }

  update() {
    this.speed += GRAVITY;
    this.y += this.speed;
  }

  jump() {
    this.speed = -JUMP_SPEED;
  }
}

// Pipe class
class Pipe {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = PIPE_WIDTH;
    this.height = CANVAS_HEIGHT - y;
  }

  draw() {
    ctx.fillStyle = PIPE_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= PIPE_SPEED;
  }

  isColliding(bird) {
    if (bird.x + BIRD_SIZE / 2 > this.x && bird.x - BIRD_SIZE / 2 < this.x + this.width) {
      if (bird.y - BIRD_SIZE / 2 < this.y || bird.y + BIRD_SIZE / 2 > this.y + this.height) {
        return true;
      }
    }
    return false;
  }
}

// Initialize game
function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  bird = new Bird();
  pipes = [];
  score = 0;
  isPlaying = true;

  // Generate initial pipes
  for (var i = 0; i < 3; i++) {
    var x = CANVAS_WIDTH + i * (PIPE_WIDTH + PIPE_GAP);
    var y = Math.random() * (CANVAS_HEIGHT - 200) + 100;
    pipes.push(new Pipe(x, y));
  }

  // Event listener for jumping
  canvas.addEventListener("click", function() {
    bird.jump();
  });

  // Start game loop
  setInterval(update, 10);
}

// Main game loop
function update() {
  // Clear canvas
  ctx.clearRect(0, 0,
