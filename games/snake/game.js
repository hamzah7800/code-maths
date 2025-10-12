// Centralized Configuration and Constants
const CONFIG = {
    GRID_SIZE: 10,
    GRID_COUNT: 40,
    CANVAS_SIZE: 400,
    GAME_SPEED: 100, // Speed in milliseconds (used to control frames per update)
    FRAME_RATE_DIVISOR: 6, // Update snake position every 6 frames (60fps / 6 = 10 updates per second)
    KEY_CODES: {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        RESTART: 82, // R key
        PAUSE: 80    // P key
    }
};

// Game State Management
let gameState = {
    snake: [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}],
    dx: CONFIG.GRID_SIZE,
    dy: 0,
    foodX: 0,
    foodY: 0,
    foodType: 'regular',
    score: 0,
    changingDirection: false,
    isPaused: false,
    gameOver: false,
    frameCount: 0 // For requestAnimationFrame speed control and blinking
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const foods = {
    'regular': {color: '#ff0000', points: 10},
    'bonus': {color: '#ffd700', points: 30},
    'super': {color: '#ff00ff', points: 50}
};

function resetGame() {
    gameState.snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
    gameState.dx = CONFIG.GRID_SIZE;
    gameState.dy = 0;
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.isPaused = false;
    gameState.changingDirection = false;
    gameState.frameCount = 0;
    generateFood();
}

function drawGridBackground() {
    const gridSize = CONFIG.GRID_SIZE;
    const canvasSize = CONFIG.CANVAS_SIZE;
    
    // Solid background color
    ctx.fillStyle = '#f0fff0'; // Light, slightly off-white green
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Subtle grid lines
    ctx.strokeStyle = '#e0e0e0'; // Very light gray
    ctx.lineWidth = 0.5;

    for (let i = 0; i < CONFIG.GRID_COUNT; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvasSize);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvasSize, i * gridSize);
        ctx.stroke();
    }
}

function drawSnakePart(part, index) {
    const isHead = index === 0;
    const isBlinking = isHead && gameState.frameCount % 20 < 10; // Blink every 20 frames

    const colorStop1 = isBlinking ? '#FFFFFF' : '#50C878';
    const colorStop2 = isBlinking ? '#ADD8E6' : '#228B22';

    const gradient = ctx.createRadialGradient(
        part.x + 5, part.y + 5, 1,
        part.x + 5, part.y + 5, 5
    );
    gradient.addColorStop(0, colorStop1);
    gradient.addColorStop(1, colorStop2);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 1;

    if(isHead) { // Head
        ctx.beginPath();
        ctx.arc(part.x + 5, part.y + 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(part.x + 7, part.y + 3, 2, 0, Math.PI * 2);
        ctx.arc(part.x + 7, part.y + 7, 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillRect(part.x, part.y, CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
        ctx.strokeRect(part.x, part.y, CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
    }
}

function drawSnake() {
    gameState.snake.forEach(drawSnakePart);
}

function generateFood() {
    let newFoodX, newFoodY;
    do {
        newFoodX = Math.floor(Math.random() * CONFIG.GRID_COUNT) * CONFIG.GRID_SIZE;
        newFoodY = Math.floor(Math.random() * CONFIG.GRID_COUNT) * CONFIG.GRID_SIZE;
    } while (gameState.snake.some(part => part.x === newFoodX && part.y === newFoodY));

    gameState.foodX = newFoodX;
    gameState.foodY = newFoodY;
    gameState.foodType = Math.random() < 0.1 ? 'super' : Math.random() < 0.3 ? 'bonus' : 'regular';
}

function drawFood() {
    const food = foods[gameState.foodType];
    const gradient = ctx.createRadialGradient(
        gameState.foodX + 5, gameState.foodY + 5, 1,
        gameState.foodX + 5, gameState.foodY + 5, 5
    );
    gradient.addColorStop(0, food.color);
    gradient.addColorStop(1, '#880000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(gameState.foodX + 5, gameState.foodY + 5, 5, 0, Math.PI * 2);
    ctx.fill();
}

function moveSnake() {
    const head = {x: gameState.snake[0].x + gameState.dx, y: gameState.snake[0].y + gameState.dy};
    gameState.snake.unshift(head);
    
    // Reset the direction change flag after movement
    gameState.changingDirection = false; 

    if (head.x === gameState.foodX && head.y === gameState.foodY) {
        gameState.score += foods[gameState.foodType].points;
        generateFood();
    } else {
        gameState.snake.pop();
    }
}

function changeDirection(keyCode) {
    if (gameState.changingDirection) return; // Ignore input if already changed this tick
    gameState.changingDirection = true;

    const goingUp = gameState.dy === -CONFIG.GRID_SIZE;
    const goingDown = gameState.dy === CONFIG.GRID_SIZE;
    const goingRight = gameState.dx === CONFIG.GRID_SIZE;
    const goingLeft = gameState.dx === -CONFIG.GRID_SIZE;

    if (keyCode === CONFIG.KEY_CODES.LEFT && !goingRight) {
        gameState.dx = -CONFIG.GRID_SIZE;
        gameState.dy = 0;
    }
    if (keyCode === CONFIG.KEY_CODES.UP && !goingDown) {
        gameState.dx = 0;
        gameState.dy = -CONFIG.GRID_SIZE;
    }
    if (keyCode === CONFIG.KEY_CODES.RIGHT && !goingLeft) {
        gameState.dx = CONFIG.GRID_SIZE;
        gameState.dy = 0;
    }
    if (keyCode === CONFIG.KEY_CODES.DOWN && !goingUp) {
        gameState.dx = 0;
        gameState.dy = CONFIG.GRID_SIZE;
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + gameState.score, 10, 30);
}

function showGameOver() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
    ctx.fillRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);

    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Press R to restart', canvas.width/2 - 80, canvas.height/2 + 40);
}

function showPaused() {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);

    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('Paused', canvas.width/2 - 70, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Press P to continue', canvas.width/2 - 85, canvas.height/2 + 40);
}

// Replaced gameLoop with requestAnimationFrame
function gameLoop() {
    
    gameState.frameCount++;

    if (gameHasEnded()) {
        if (!gameState.gameOver) {
            gameState.gameOver = true;
        }
        showGameOver();
        requestAnimationFrame(gameLoop); // Continue loop to show game over screen
        return;
    }
    
    if (gameState.isPaused) {
        showPaused();
        requestAnimationFrame(gameLoop);
        return;
    }

    // Only update snake position every N frames for speed control
    if (gameState.frameCount % CONFIG.FRAME_RATE_DIVISOR === 0) {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        drawScore();
    } else {
        // Redraw only to update blinking head/score between moves
        clearCanvas();
        drawFood();
        drawSnake();
        drawScore();
    }
    
    requestAnimationFrame(gameLoop);
}

function clearCanvas() {
    drawGridBackground();
}

function gameHasEnded() {
    const snake = gameState.snake;
    // Self-collision (ignore first 4 segments)
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    // Wall collision
    const headX = snake[0].x;
    const headY = snake[0].y;
    return headX < 0 || headX > CONFIG.CANVAS_SIZE - CONFIG.GRID_SIZE || headY < 0 || headY > CONFIG.CANVAS_SIZE - CONFIG.GRID_SIZE;
}

// --- Event Listeners ---

document.addEventListener('keydown', function(event) {
    const keyCode = event.keyCode;
    
    // Restart logic
    if (keyCode === CONFIG.KEY_CODES.RESTART && gameState.gameOver) {
        resetGame();
        // gameLoop will be called by the current RAF loop after reset
        return; 
    }
    
    // Pause/Unpause logic
    if (keyCode === CONFIG.KEY_CODES.PAUSE && !gameState.gameOver) {
        gameState.isPaused = !gameState.isPaused;
        return;
    }

    // Direction change for keyboard
    if (!gameState.isPaused && !gameState.gameOver) {
        changeDirection(keyCode);
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    if (gameState.gameOver || gameState.isPaused) return;
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    e.preventDefault(); 
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault(); 
});

document.addEventListener('touchend', function(e) {
    if (gameState.gameOver || gameState.isPaused) return;
    if (e.touches.length !== 0) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let dx_swipe = touchEndX - touchStartX;
    let dy_swipe = touchEndY - touchStartY;

    const MIN_SWIPE_DISTANCE = 20; // Require a definite swipe to prevent accidental taps/reverses
    
    if (Math.abs(dx_swipe) < MIN_SWIPE_DISTANCE && Math.abs(dy_swipe) < MIN_SWIPE_DISTANCE) {
        touchStartX = 0;
        touchStartY = 0;
        return; // Ignore small taps
    }

    let keyCode;
    if (Math.abs(dx_swipe) > Math.abs(dy_swipe)) {
        // Horizontal swipe
        keyCode = dx_swipe > 0 ? CONFIG.KEY_CODES.RIGHT : CONFIG.KEY_CODES.LEFT;
    } else {
        // Vertical swipe
        keyCode = dy_swipe > 0 ? CONFIG.KEY_CODES.DOWN : CONFIG.KEY_CODES.UP;
    }
    
    changeDirection(keyCode);
    
    touchStartX = 0;
    touchStartY = 0;
});


// Initial setup and start
generateFood();
requestAnimationFrame(gameLoop);
