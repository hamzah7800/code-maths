const canvas = document.getElementById("chessCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 8;
const cellSize = canvas.width / boardSize;

// Unicode mapping for chess pieces
const pieceSymbols = {
  w: { K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658", P: "\u2659" },
  b: { K: "\u265A", Q: "\u265B", R: "\u265C", B: "\u265D", N: "\u265E", P: "\u265F" }
};

// The board is a 2D array: each cell is either null or an object { type: 'K', color: 'w' or 'b' }
let board = [];

// Whose turn it is: "w" for white, "b" for black. White starts.
let currentTurn = "w";

// Selected square (if any): { row, col }
let selected = null;

// Initialize board with standard starting positions
function initBoard() {
  board = [];
  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = null;
    }
  }
  // Place black pieces
  board[0][0] = board[0][7] = { type: "R", color: "b" };
  board[0][1] = board[0][6] = { type: "N", color: "b" };
  board[0][2] = board[0][5] = { type: "B", color: "b" };
  board[0][3] = { type: "Q", color: "b" };
  board[0][4] = { type: "K", color: "b" };
  for (let col = 0; col < boardSize; col++) {
    board[1][col] = { type: "P", color: "b" };
  }
  // Place white pieces
  board[7][0] = board[7][7] = { type: "R", color: "w" };
  board[7][1] = board[7][6] = { type: "N", color: "w" };
  board[7][2] = board[7][5] = { type: "B", color: "w" };
  board[7][3] = { type: "Q", color: "w" };
  board[7][4] = { type: "K", color: "w" };
  for (let col = 0; col < boardSize; col++) {
    board[6][col] = { type: "P", color: "w" };
  }
}
initBoard();

// Draw the chess board with alternating colors
function drawBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Standard chess board colors:
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = "#f0d9b5";  // light square
      } else {
        ctx.fillStyle = "#b58863";  // dark square
      }
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

      // If this square is selected, highlight it
      if (selected && selected.row === row && selected.col === col) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Draw the pieces using Unicode characters
function drawPieces() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${cellSize * 0.7}px Arial`;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col];
      if (piece) {
        ctx.fillStyle = piece.color === "w" ? "white" : "black";
        const symbol = pieceSymbols[piece.color][piece.type];
        ctx.fillText(symbol, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
      }
    }
  }
}

// Main draw function
function draw() {
  drawBoard();
  drawPieces();
}

// Handle click events on the canvas to select and move pieces
canvas.addEventListener("click", function(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  // If no piece is currently selected
  if (!selected) {
    // If the clicked cell has a piece belonging to the current player, select it
    const piece = board[row][col];
    if (piece && piece.color === currentTurn) {
      selected = { row, col };
    }
  } else {
    // A piece is already selected, so move it to the clicked square (if destination is different)
    // (This minimal version does not enforce legal moves; it allows any move.)
    if (selected.row !== row || selected.col !== col) {
      board[row][col] = board[selected.row][selected.col];
      board[selected.row][selected.col] = null;
      // Switch turn after moving
      currentTurn = currentTurn === "w" ? "b" : "w";
    }
    selected = null;
  }
  draw();
});

// Main game loop (redraw on each frame)
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
