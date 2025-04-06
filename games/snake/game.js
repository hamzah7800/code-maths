const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
let dx = 10;
let dy = 0;
let foodX;
let foodY;
let foodType = 'regular';
let score = 0;

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
    foodX = Math.floor(Math.random() * 40) * 10;
    foodY = Math.floor(Math.random() * 40) * 10;
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
    if (event.key === 'r' && gameHasEnded()) {
        snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
        dx = 10;
        dy = 0;
        score = 0;
        generateFood();
        gameLoop();
    }
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
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

document.addEventListener('touchmove', function(e) {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.touches[0].clientX;
    let touchEndY = e.touches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) changeDirection({ keyCode: 39 }); // Right
        else changeDirection({ keyCode: 37 }); // Left
    } else {
        // Vertical swipe
        if (dy > 0) changeDirection({ keyCode: 40 }); // Down
        else changeDirection({ keyCode: 38 }); // Up
    }

    touchStartX = null;
    touchStartY = null;
    e.preventDefault();
});

document.addEventListener('keydown', changeDirection);
generateFood();
gameLoop();