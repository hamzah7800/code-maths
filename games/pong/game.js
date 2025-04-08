const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Function to set canvas size properly
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Settings
const paddleWidth = 20;
let paddleHeight = canvas.height * 0.2; // 20% of screen height
const ballRadius = 15;
let ballSpeedX = 5;
let ballSpeedY = 5;
let paddleSpeed = 10;

// Ball Position
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDirX = 1;
let ballDirY = 1;

// Paddle Positions
let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;

// Paddle Movement
let leftPaddleMove = 0;
let rightPaddleMove = 0;

// Dragging Support
let draggingLeft = false;
let draggingRight = false;

// Touch & Mouse Dragging
function handleStart(e) {
    let touch = e.touches ? e.touches[0] : e;
    if (touch.clientX < canvas.width / 2) {
        draggingLeft = true;
    } else {
        draggingRight = true;
    }
}

function handleMove(e) {
    let touch = e.touches ? e.touches[0] : e;
    if (draggingLeft) leftPaddleY = touch.clientY - paddleHeight / 2;
    if (draggingRight) rightPaddleY = touch.clientY - paddleHeight / 2;
    keepPaddlesInBounds();
}

function handleEnd() {
    draggingLeft = false;
    draggingRight = false;
}

// Attach Touch & Mouse Events
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

// Keep Paddles Inside Canvas
function keepPaddlesInBounds() {
    leftPaddleY = Math.max(0, Math.min(leftPaddleY, canvas.height - paddleHeight));
    rightPaddleY = Math.max(0, Math.min(rightPaddleY, canvas.height - paddleHeight));
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'w') leftPaddleMove = -paddleSpeed;
    if (e.key === 's') leftPaddleMove = paddleSpeed;
    if (e.key === 'ArrowUp') rightPaddleMove = -paddleSpeed;
    if (e.key === 'ArrowDown') rightPaddleMove = paddleSpeed;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 's') leftPaddleMove = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') rightPaddleMove = 0;
});

// Ball Movement
function moveBall() {
    ballX += ballSpeedX * ballDirX;
    ballY += ballSpeedY * ballDirY;

    // Bounce off top and bottom
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballDirY *= -1;
    }

    // Paddle Collision
    if (
        ballX - ballRadius < paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
    ) {
        ballDirX *= -1;
        ballX = paddleWidth + ballRadius; // Prevent ball from getting stuck
    }

    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
    ) {
        ballDirX *= -1;
        ballX = canvas.width - paddleWidth - ballRadius; // Prevent ball from getting stuck
    }

    // Score Handling
    if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballDirX *= -1; // Change direction after scoring
    }
}

// Update Game Frame
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move paddles
    leftPaddleY += leftPaddleMove;
    rightPaddleY += rightPaddleMove;
    keepPaddlesInBounds();

    // Draw Paddles
    ctx.fillStyle = 'white';
    ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    moveBall();
    requestAnimationFrame(updateGame);
}

// Start Game Loop
updateGame();
