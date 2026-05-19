const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.querySelector("#statusText");
const newRoundButton = document.querySelector("#newRoundButton");
const resetScoresButton = document.querySelector("#resetScoresButton");
const xScore = document.querySelector("#xScore");
const oScore = document.querySelector("#oScore");
const drawScore = document.querySelector("#drawScore");

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let scores = {
  X: 0,
  O: 0,
  draws: 0,
};

function renderBoard() {
  cells.forEach((cell, index) => {
    const mark = board[index];
    cell.textContent = mark;
    cell.disabled = Boolean(mark) || gameOver;
    cell.className = `cell ${mark.toLowerCase()}`;
    cell.setAttribute("aria-label", mark ? `Cell ${index + 1}, ${mark}` : `Cell ${index + 1}, empty`);
  });
}

function renderScores() {
  xScore.textContent = scores.X;
  oScore.textContent = scores.O;
  drawScore.textContent = scores.draws;
}

function getWinner() {
  return wins.find(([a, b, c]) => {
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function finishRound(winningLine) {
  gameOver = true;
  const winner = board[winningLine[0]];
  scores[winner] += 1;
  statusText.textContent = `${winner} wins`;

  winningLine.forEach((index) => cells[index].classList.add("win"));
  renderScores();
  cells.forEach((cell) => {
    cell.disabled = true;
  });
}

function handleDraw() {
  gameOver = true;
  scores.draws += 1;
  statusText.textContent = "Draw";
  renderScores();
}

function playTurn(index) {
  if (board[index] || gameOver) {
    return;
  }

  board[index] = currentPlayer;
  renderBoard();

  const winningLine = getWinner();
  if (winningLine) {
    finishRound(winningLine);
    return;
  }

  if (board.every(Boolean)) {
    handleDraw();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${currentPlayer} to move`;
}

function startNewRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  statusText.textContent = "X to move";
  renderBoard();
}

function resetScores() {
  scores = {
    X: 0,
    O: 0,
    draws: 0,
  };
  renderScores();
  startNewRound();
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => playTurn(index));
});

newRoundButton.addEventListener("click", startNewRound);
resetScoresButton.addEventListener("click", resetScores);

renderScores();
renderBoard();
