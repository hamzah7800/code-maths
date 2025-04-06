const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over-screen');

// Ensure the canvas covers the whole screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.4,
    jump: -7,
    width: 30,  // Rectangle bird size
    height: 25,
    rotation: 0,
    scale: 1 // To control the zoom effect on restart
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 120;
let score = 0;
let gameOver = false;

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.1));
    ctx.rotate(bird.rotation);

    // Apply the zoom effect on restart
    ctx.scale(bird.scale, bird.scale);

    // Bird body (yellow rectangle)
    ctx.fillStyle = '#FFD700'; // Flappy Bird yellow
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);

    // Bird eye (black circle)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawPipes() {
    ctx.fillStyle = '#43a047'; // Green pipes
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height);
    });
}

function drawBackground() {
    ctx.fillStyle = '#70c5ce'; // Light blue sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    pipes.push({
        x: canvas.width,
        top: height,
        scored: false
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.scored = true;
        }
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }

    pipes.splice(0, pipes.filter(pipe => pipe.x + pipeWidth < 0).length);
}

function checkCollision() {
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        return true;
    }
    return pipes.some(pipe => {
        return bird.x + bird.width > pipe.x &&
               bird.x < pipe.x + pipeWidth &&
               (bird.y < pipe.top || bird.y + bird.height > pipe.top + pipeGap);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    if (!gameOver) {
        updateBird();
        updatePipes();
        gameOver = checkCollision();
    }

    drawPipes();
    drawBird();
    drawScore();

    if (gameOver) {
        gameOverScreen.style.display = 'block'; // Show game over screen
        return;
    }

    requestAnimationFrame(gameLoop);
}

function handleJump() {
    if (!gameOver) {
        bird.velocity = bird.jump;
    }
}

function handleRestart() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    bird.scale = 2; // Zoom in effect on restart
    setTimeout(() => {
        bird.scale = 1; // Return to normal size after a short time
        gameOver = false;
        gameOverScreen.style.display = 'none'; // Hide game over screen
        gameLoop();
    }, 500); // Zoom-in duration
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleJump();
    if (e.key === 'r') handleRestart();
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

restartButton.addEventListener('click', handleRestart);

gameLoop();
