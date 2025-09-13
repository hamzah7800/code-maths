// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 480;

let bird = { x: 50, y: 150, width: 20, height: 20, gravity: 0.6, lift: -15, velocity: 0 };
let pipes = [];
let score = 0;
let gameStarted = false;

function setup() {
    document.getElementById('startButton').addEventListener('click', startGame);
    document.addEventListener('keydown', () => bird.velocity += bird.lift);
}

function startGame() {
    gameStarted = true;
    score = 0;
    pipes = [];
    bird.y = 150;
    bird.velocity = 0;
    document.getElementById('score').innerText = score;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameStarted) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height >= canvas.height) {
        gameStarted = false;
        alert('Game Over! Your score: ' + score);
        return;
    }

    if (frameCount % 75 === 0) {
        let pipeHeight = Math.random() * (canvas.height - 100) + 20;
        pipes.push({ x: canvas.width, y: 0, width: 20, height: pipeHeight });
        pipes.push({ x: canvas.width, y: pipeHeight + 100, width: 20, height: canvas.height - pipeHeight - 100 });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        pipe.x -= 2;

        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
            score++;
            document.getElementById('score').innerText = score;
        }

        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x && bird.y < pipe.y + pipe.height && bird.y + bird.height > pipe.y) {
            gameStarted = false;
            alert('Game Over! Your score: ' + score);
        }
    }

    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    requestAnimationFrame(gameLoop);
}

setup();
