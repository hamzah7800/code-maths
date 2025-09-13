const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants (This is where we make it EASY) ---
const SPEED = 1.5;         // Game speed (Original was faster)
const PIPE_GAP = 150;      // Gap between pipes (Original was smaller)
const GRAVITY = 0.18;      // How fast the bird falls (Original was stronger)
const FLAP_STRENGTH = -4;  // How high the bird jumps (Original was higher)
const PIPE_WIDTH = 52;
const PIPE_SPAWN_RATE = 120; // How often pipes spawn (in frames)

// --- Game State Variables ---
let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    velocity: 0
};

let pipes = [];
let score = 0;
let frameCount = 0;
let gameState = 'start'; // Can be 'start', 'playing', 'gameOver'

// --- Game Drawing Functions ---
function drawBackground() {
    ctx.fillStyle = '#70c5ce'; // Sky color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.fillStyle = '#f2d45c'; // Bird color (yellow)
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = '#73bf2e'; // Pipe color (green)
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topPipeHeight);
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.topPipeHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topPipeHeight - PIPE_GAP);
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px "Press Start 2P", sans-serif'; // A pixel-style font
    ctx.fillText(score, canvas.width / 2 - 15, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeText(score, canvas.width / 2 - 15, 50);
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click or Press Space', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('to Start', canvas.width / 2, canvas.height / 2 + 10);
    ctx.textAlign = 'left';
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

// --- Game Logic Functions ---
function updateBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Prevent bird from going above the screen
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    // Move pipes to the left
    pipes.forEach(pipe => {
        pipe.x -= SPEED;
    });

    // Remove pipes that are off-screen
    if (pipes.length && pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
    }

    // Add a new pipe
    frameCount++;
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        const topPipeHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
        pipes.push({ x: canvas.width, topPipeHeight: topPipeHeight, passed: false });
    }
}

function checkCollisions() {
    // Ground collision
    if (bird.y + bird.height > canvas.height) {
        return true;
    }

    // Pipe collision
    for (let pipe of pipes) {
        if (bird.x < pipe.x + PIPE_WIDTH &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topPipeHeight || bird.y + bird.height > pipe.topPipeHeight + PIPE_GAP)) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
            score++;
            pipe.passed = true;
        }
    });
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'playing';
}

// --- Main Game Loop ---
function gameLoop() {
    if (gameState === 'playing') {
        // Update game state
        updateBird();
        updatePipes();
        updateScore();
        if (checkCollisions()) {
            gameState = 'gameOver';
        }
    }

    // Draw everything
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();

    if (gameState === 'start') {
        drawStartScreen();
    }
    
    if (gameState === 'gameOver') {
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---
function handleInput() {
    switch (gameState) {
        case 'start':
            gameState = 'playing';
            // fallthrough to flap on first click
        case 'playing':
            bird.velocity = FLAP_STRENGTH;
            break;
        case 'gameOver':
            resetGame();
            break;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleInput();
    }
});

window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput);


// Start the game loop
gameLoop();
