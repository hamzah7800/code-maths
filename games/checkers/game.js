const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 8;
const cellSize = canvas.width / boardSize;

// The board is a 2D array. Each cell is either null or an object:
// { player: 1 or 2, king: boolean }
let board = [];

// Current turn: 1 for Player 1 (blue), 2 for Player 2 (red)
let currentTurn = 1;
// Selected piece: { row, col }
let selected = null;
// Valid moves for the selected piece: an object mapping "row,col" -> captured piece coordinates (or null if simple move)
let validMoves = {};

// Initialize board with starting positions
function initBoard() {
  board = [];
  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = null;
      // Only dark squares ((row+col)%2==1) are used
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { player: 2, king: false };
        } else if (row > 4) {
          board[row][col] = { player: 1, king: false };
        }
      }
    }
  }
}
initBoard();

// Draw the checkers board
function drawBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = "#F0D9B5"; // light square
      } else {
        ctx.fillStyle = "#B58863"; // dark square
      }
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
}

// Draw all pieces on the board
function drawPieces() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      let piece = board[row][col];
      if (piece) {
        // Draw piece as a circle
        ctx.beginPath();
        ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
        ctx.fillStyle = piece.player === 1 ? "blue" : "red";
        ctx.fill();
        // If king, draw a "K" on top
        if (piece.king) {
          ctx.fillStyle = "gold";
          ctx.font = "20px Arial";
          ctx.fillText("K", col * cellSize + cellSize / 2 - 6, row * cellSize + cellSize / 2 + 7);
        }
      }
    }
  }
}

// Highlight a square (used for selected piece)
function highlightSquare(row, col) {
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

// Highlight valid move squares
function highlightValidMoves(moves) {
  for (let key in moves) {
    let parts = key.split(",");
    let r = parseInt(parts[0]);
    let c = parseInt(parts[1]);
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
  }
}

// Check if (row, col) is inside the board
function isInside(row, col) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

// Get all valid moves for the piece at (row, col)
function getValidMoves(row, col) {
  let moves = {};
  let piece = board[row][col];
  if (!piece) return moves;
  // Determine directions based on player and king status.
  let directions = [];
  if (piece.king) {
    directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  } else {
    directions = piece.player === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  }
  for (let d of directions) {
    let newRow = row + d[0];
    let newCol = col + d[1];
    // Simple move if empty
    if (isInside(newRow, newCol) && board[newRow][newCol] === null) {
      moves[[newRow, newCol]] = null;
    }
    // Capture move: must jump over an opponent piece
    let midRow = row + d[0];
    let midCol = col + d[1];
    let jumpRow = row + 2 * d[0];
    let jumpCol = col + 2 * d[1];
    if (isInside(midRow, midCol) && board[midRow][midCol] && board[midRow][midCol].player !== piece.player) {
      if (isInside(jumpRow, jumpCol) && board[jumpRow][jumpCol] === null) {
        moves[[jumpRow, jumpCol]] = { row: midRow, col: midCol };
      }
    }
  }
  return moves;
}

// King a piece if it reaches the far end
function tryKing(piece, row) {
  if (piece.player === 1 && row === 0) piece.king = true;
  if (piece.player === 2 && row === boardSize - 1) piece.king = true;
}

// Handle clicks on the canvas
canvas.addEventListener("click", function(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  // If no piece selected, select if it's the current player's piece
  if (!selected) {
    let piece = board[row][col];
    if (piece && piece.player === currentTurn) {
      selected = { row, col };
      validMoves = getValidMoves(row, col);
    }
  } else {
    // If clicked on the same square, deselect
    if (selected.row === row && selected.col === col) {
      selected = null;
      validMoves = {};
      return draw();
    }
    let key = row + "," + col;
    // If the clicked square is a valid move
    if (key in validMoves) {
      // Move piece
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = null;
      // If this is a capture move, remove the captured piece
      if (validMoves[key] !== null) {
        let cap = validMoves[key];
        board[cap.row][cap.col] = null;
        // After capture, check for additional captures from the new position
        let newMoves = getValidMoves(row, col);
        let extraCapture = false;
        for (let k in newMoves) {
          if (newMoves[k] !== null) {
            extraCapture = true;
            break;
          }
        }
        if (extraCapture) {
          selected = { row, col };
          validMoves = newMoves;
          tryKing(board[row][col], row);
          return draw();
        }
      }
      // King the piece if it reached the far side
      tryKing(board[row][col], row);
      // Switch turn
      currentTurn = currentTurn === 1 ? 2 : 1;
    }
    selected = null;
    validMoves = {};
  }
  draw();
});

// Main draw function
function draw() {
  drawBoard();
  if (selected) {
    highlightSquare(selected.row, selected.col);
    let moves = getValidMoves(selected.row, selected.col);
    highlightValidMoves(moves);
  }
  drawPieces();
}

// Main game loop (redraw on each frame)
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
