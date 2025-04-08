const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let grid = Array(4).fill().map(() => Array(4).fill(0));
let score = 0;
let touchStartX = 0;
let touchStartY = 0;

const tileColors = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
};

function drawTile(x, y, value) {
    const padding = 5;
    const size = 90;

    // Draw tile background with shadow
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.fillStyle = value ? tileColors[value] || '#edc22e' : '#cdc1b4';
    ctx.fillRect(x * 100 + padding, y * 100 + padding, size, size);
    ctx.shadowBlur = 0;

    if(value) {
        // Draw text
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
        ctx.font = value >= 1024 ? 'bold 24px Arial' : 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, x * 100 + 50, y * 100 + 50);
    }
}

function draw() {
    // Draw background
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            drawTile(j, i, grid[i][j]);
        }
    }

    // Draw score
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if(Math.abs(deltaX) > Math.abs(deltaY)) {
        if(deltaX > 0) moveRight();
        else moveLeft();
    } else {
        if(deltaY > 0) moveDown();
        else moveUp();
    }
}

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);

function init() {
    addNewTile();
    addNewTile();
    draw();
}

function moveLeft() {
    let moved = false;
    for(let i = 0; i < 4; i++) {
        for(let j = 1; j < 4; j++) {
            if(grid[i][j] !== 0) {
                let k = j;
                while(k > 0 && (grid[i][k-1] === 0 || grid[i][k-1] === grid[i][k])) {
                    if(grid[i][k-1] === grid[i][k]) {
                        grid[i][k-1] *= 2;
                        score += grid[i][k-1];
                        grid[i][k] = 0;
                        moved = true;
                        break;
                    }
                    if(grid[i][k-1] === 0) {
                        grid[i][k-1] = grid[i][k];
                        grid[i][k] = 0;
                        k--;
                        moved = true;
                    }
                }
            }
        }
    }
    if(moved) addNewTile();
    draw();
}

function moveRight() {
    let moved = false;
    for(let i = 0; i < 4; i++) {
        for(let j = 2; j >= 0; j--) {
            if(grid[i][j] !== 0) {
                let k = j;
                while(k < 3 && (grid[i][k+1] === 0 || grid[i][k+1] === grid[i][k])) {
                    if(grid[i][k+1] === grid[i][k]) {
                        grid[i][k+1] *= 2;
                        score += grid[i][k+1];
                        grid[i][k] = 0;
                        moved = true;
                        break;
                    }
                    if(grid[i][k+1] === 0) {
                        grid[i][k+1] = grid[i][k];
                        grid[i][k] = 0;
                        k++;
                        moved = true;
                    }
                }
            }
        }
    }
    if(moved) addNewTile();
    draw();
}

function moveUp() {
    let moved = false;
    for(let j = 0; j < 4; j++) {
        for(let i = 1; i < 4; i++) {
            if(grid[i][j] !== 0) {
                let k = i;
                while(k > 0 && (grid[k-1][j] === 0 || grid[k-1][j] === grid[k][j])) {
                    if(grid[k-1][j] === grid[k][j]) {
                        grid[k-1][j] *= 2;
                        score += grid[k-1][j];
                        grid[k][j] = 0;
                        moved = true;
                        break;
                    }
                    if(grid[k-1][j] === 0) {
                        grid[k-1][j] = grid[k][j];
                        grid[k][j] = 0;
                        k--;
                        moved = true;
                    }
                }
            }
        }
    }
    if(moved) addNewTile();
    draw();
}

function moveDown() {
    let moved = false;
    for(let j = 0; j < 4; j++) {
        for(let i = 2; i >= 0; i--) {
            if(grid[i][j] !== 0) {
                let k = i;
                while(k < 3 && (grid[k+1][j] === 0 || grid[k+1][j] === grid[k][j])) {
                    if(grid[k+1][j] === grid[k][j]) {
                        grid[k+1][j] *= 2;
                        score += grid[k+1][j];
                        grid[k][j] = 0;
                        moved = true;
                        break;
                    }
                    if(grid[k+1][j] === 0) {
                        grid[k+1][j] = grid[k][j];
                        grid[k][j] = 0;
                        k++;
                        moved = true;
                    }
                }
            }
        }
    }
    if(moved) addNewTile();
    draw();
}

function addNewTile() {
    let available = [];
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            if(grid[i][j] === 0) {
                available.push({x: i, y: j});
            }
        }
    }
    if(available.length > 0) {
        let randomCell = available[Math.floor(Math.random() * available.length)];
        grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
}

init();