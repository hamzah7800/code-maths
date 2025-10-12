const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
let dx = 10;
let dy = 0;
let foodX;
let foodY;
let foodType = 'regular';
let score = 0;
let changingDirection = false; // Flag to prevent multiple direction changes per tick

const foods = {
    'regular': {color: '#ff0000', points: 10},
    'bonus': {color: '#ffd700', points: 30},
    'super': {color: '#ff00ff', points: 50}
};

function drawSnakePart(part, index) {
    const gradient = ctx.createRadialGradient(
        part.x + 5, part.y + 5, 1,
        part.x + 5, part.y + 5, 5
    );
    gradient.addColorStop(0, '#50C878');
    gradient.addColorStop(1, '#228B22');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 1;

    if(index === 0) { // Head
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
        ctx.fillRect(part.x, part.y, 10, 10);
        ctx.strokeRect(part.x, part.y, 10, 10);
    }
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function generateFood() {
    // Ensure food is not placed on the snake
    let newFoodX, newFoodY;
    do {
        newFoodX = Math.floor(Math.random() * 40) * 10;
        newFoodY = Math.floor(Math.random() * 40) * 10;
    } while (snake.some(part => part.x === newFoodX && part.y === newFoodY));

    foodX = newFoodX;
    foodY = newFoodY;
    foodType = Math.random() < 0.1 ? 'super' : Math.random() < 0.3 ? 'bonus' : 'regular';
}

function drawFood() {
    const food = foods[foodType];
    const gradient = ctx.createRadialGradient(
        foodX + 5, foodY + 5, 1,
        foodX + 5, foodY + 5, 5
    );
    gradient.addColorStop(0, food.color);
    gradient.addColorStop(1, '#880000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(foodX + 5, foodY + 5, 5, 0, Math.PI * 2);
    ctx.fill();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Reset the direction change flag after movement
    changingDirection = false; 

    if (head.x === foodX && head.y === foodY) {
        score += foods[foodType].points;
        generateFood();
    } else {
        snake.pop();
    }
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changingDirection) return; // Ignore input if already changed this tick
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === -10;
    const goingDown = dy === 10;
    const goingRight = dx === 10;
    const goingLeft = dx === -10;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -10;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -10;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 10;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 10;
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function showGameOver() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Press R to restart', canvas.width/2 - 80, canvas.height/2 + 40);
}

function gameLoop() {
    if (gameHasEnded()) {
        showGameOver();
        return;
    }
    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        drawScore();
        gameLoop();
    }, 100)
}

document.addEventListener('keydown', function(event) {
    // Restart logic
    if (event.key === 'r' && gameHasEnded()) {
        snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
        dx = 10;
        dy = 0;
        score = 0;
        generateFood();
        gameLoop();
    }
    // Direction change for keyboard
    changeDirection(event);
});

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameHasEnded() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - 10;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height - 10;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        touchStartX = e.touches[0].clientX - rect.left;
        touchStartY = e.touches[0].clientY - rect.top;
    }
    e.preventDefault(); // **Prevents scrolling/default touch action**
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault(); // **Prevents scrolling/default touch action**
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY || e.touches.length !== 0) return;

    // Use changedTouches to get the end position
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    const rect = canvas.getBoundingClientRect();
    let endX = touchEndX - rect.left;
    let endY = touchEndY - rect.top;

    let dx_swipe = endX - touchStartX;
    let dy_swipe = endY - touchStartY;

    // Ensure a sufficient swipe distance (e.g., 10 pixels)
    if (Math.abs(dx_swipe) < 10 && Math.abs(dy_swipe) < 10) return;

    if (Math.abs(dx_swipe) > Math.abs(dy_swipe)) {
        // Horizontal swipe
        if (dx_swipe > 0) changeDirection({ keyCode: 39 }); // Right
        else changeDirection({ keyCode: 37 }); // Left
    } else {
        // Vertical swipe
        if (dy_swipe > 0) changeDirection({ keyCode: 40 }); // Down
        else changeDirection({ keyCode: 38 }); // Up
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Initial setup
generateFood();
gameLoop();
