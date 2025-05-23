// Ensure the DOM is loaded before running the game
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tetris');
  const context = canvas.getContext('2d');
  context.scale(20, 20);

  // Game board dimensions
  const arenaWidth = 12;
  const arenaHeight = 20;
  const arena = createMatrix(arenaWidth, arenaHeight);

  // Color mapping for pieces; index corresponds to the piece number
  const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF'  // Z
  ];

  // Create a matrix (arena) filled with zeros
  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  // Generate a new tetromino based on type
  function createPiece(type) {
    switch (type) {
      case 'T':
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
      case 'O':
        return [
          [2, 2],
          [2, 2],
        ];
      case 'L':
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
      case 'J':
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
      case 'I':
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
        ];
      case 'S':
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      case 'Z':
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
      default:
        return [[]];
    }
  }

  // Check for collision between the arena and the current piece
  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (
          m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Merge the player's piece into the arena
  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  // Sweep full rows and update the score
  function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      player.score += rowCount * 10;
      rowCount *= 2;
      updateScore();
    }
  }

  // Draw the game board and the current piece
  function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
  }

  // Draw a matrix onto the canvas
  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  // Rotate a matrix (tetromino) by 90° increments
  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  // Drop the player's piece by one row; if it collides, merge and reset
  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
    }
    dropCounter = 0;
  }

  // Move the player's piece horizontally
  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  // Rotate the player's piece and adjust position if needed
  function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }

  // Reset the player's piece to a new random tetromino
  function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
      // Game over: clear the arena and reset score
      arena.forEach(row => row.fill(0));
      player.score = 0;
      updateScore();
    }
  }

  // Update the score display on the page
  function updateScore() {
    document.getElementById('score').innerText = player.score;
  }

  // Timing variables for piece drop
  let dropCounter = 0;
  const dropInterval = 1000;
  let lastTime = 0;

  // The game loop
  function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }
    draw();
    requestAnimationFrame(update);
  }

  // Player object holds the current piece and score
  const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
  };

  // Listen for keyboard events
  document.addEventListener('keydown', event => {
    switch (event.keyCode) {
      case 37: // Left arrow
        playerMove(-1);
        break;
      case 39: // Right arrow
        playerMove(1);
        break;
      case 40: // Down arrow
        playerDrop();
        break;
      case 81: // Q key (rotate left)
        playerRotate(-1);
        break;
      case 87: // W key (rotate right)
      case 38: // Up arrow (rotate right)
        playerRotate(1);
        break;
    }
  });

  // Start the game
  playerReset();
  update();
});
