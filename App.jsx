import React, { useState } from "react";

export default function App() {
  // Screen: either "menu" or "game"
  const [screen, setScreen] = useState("menu");
  // Board size selection: 3 or 5 (default 3)
  const [boardSize, setBoardSize] = useState(3);
  // Game state: history of boards and current move index
  const [history, setHistory] = useState([Array(boardSize * boardSize).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  // Scoreboard states
  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  // When "Start Game" is pressed from the menu
  function handleStart() {
    setHistory([Array(boardSize * boardSize).fill(null)]);
    setCurrentMove(0);
    setScreen("game");
  }

  // When a move is made on the board
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    const winnerInfo = calculateWinner(nextSquares, boardSize);
    if (winnerInfo) {
      if (winnerInfo.player === "X") setScoreX((prev) => prev + 1);
      else setScoreO((prev) => prev + 1);
    }
  }

  // Time travel to a previous move
  function jumpTo(move) {
    setCurrentMove(move);
  }

  // Restart the game (keeping the same board size)
  function restartGame() {
    setHistory([Array(boardSize * boardSize).fill(null)]);
    setCurrentMove(0);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 font-mono"
      style={{ backgroundColor: "black", color: "white" }}
    >
      <div className="w-full max-w-5xl text-center relative" style={{ color: "white" }}>
        {/* Title with neon glow */}
        <h1
          className="text-6xl font-extrabold tracking-wider mb-8"
          style={{ color: "white", textShadow: "0 0 20px #8400ff" }}
        >
          TIC TAC TOE
        </h1>
        {screen === "menu" ? (
          <StartMenu
            boardSize={boardSize}
            setBoardSize={setBoardSize}
            onStart={handleStart}
          />
        ) : (
          <GameScreen
            boardSize={boardSize}
            squares={currentSquares}
            xIsNext={xIsNext}
            scoreX={scoreX}
            scoreO={scoreO}
            history={history}
            currentMove={currentMove}
            onPlay={handlePlay}
            jumpTo={jumpTo}
            restart={restartGame}
          />
        )}
      </div>
    </div>
  );
}

/* ===== START MENU =====  */
function StartMenu({ boardSize, setBoardSize, onStart }) {
  return (
    <div className="space-y-6 bg-black/70 rounded-xl p-8 max-w-xl mx-auto border border-[#8400ff] shadow-lg" style={{ color: "white" }}>
      <p className="text-xl" style={{ color: "white" }}>Select your grid size:</p>
      <div className="flex justify-center space-x-4">
        <label className="flex items-center gap-2" style={{ color: "white" }}>
          <input
            type="radio"
            name="gridSize"
            value={3}
            checked={boardSize === 3}
            onChange={() => setBoardSize(3)}
          />
          3×3
        </label>
        <label className="flex items-center gap-2" style={{ color: "white" }}>
          <input
            type="radio"
            name="gridSize"
            value={5}
            checked={boardSize === 5}
            onChange={() => setBoardSize(5)}
          />
          5×5
        </label>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-purple-700 hover:bg-pink-600 rounded-full text-2xl transition-transform transform hover:scale-105 shadow-neon"
        style={{ color: "white" }}
      >
        Start Game
      </button>
    </div>
  );
}

/* ===== GAME SCREEN ===== */
function GameScreen({
  boardSize,
  squares,
  xIsNext,
  scoreX,
  scoreO,
  history,
  currentMove,
  onPlay,
  jumpTo,
  restart
}) {
  const winnerInfo = calculateWinner(squares, boardSize);
  const status = winnerInfo
    ? `Winner: ${winnerInfo.player}`
    : squares.every(val => val !== null)
    ? "Draw!"
    : `Next: ${xIsNext ? "X" : "O"}`;
  function handleClick(i) {
    if (winnerInfo || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }
  return (
    <div className="space-y-6" style={{ color: "white" }}>
      {/* Scoreboard */}
      <div className="flex justify-center gap-8 text-2xl font-bold" style={{ color: "white" }}>
        <span>|X Wins: {scoreX}|------</span>
        <span>|O Wins: {scoreO}|</span>
      </div>
      {/* Status message */}
      <div className="text-3xl font-semibold" style={{ color: "white" }}>{status}</div>
      {/* Board */}
      <Board boardSize={boardSize} squares={squares} winnerInfo={winnerInfo} onClick={handleClick} />
      {/* Controls */}
      <Controls history={history} jumpTo={jumpTo} restartGame={restart} currentMove={currentMove} />
    </div>
  );
}

/* ===== BOARD COMPONENT =====  
   Creates an N×N grid that scales responsively.
   The board container is capped at 600×600px.
================================== */
function Board({ boardSize, squares, winnerInfo, onClick }) {
  const winningLine = winnerInfo?.line || [];
  const boardContainerClasses = "w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] mx-auto border-2 border-white shadow-neon relative";
  const rows = [];
  for (let r = 0; r < boardSize; r++) {
    const cells = [];
    for (let c = 0; c < boardSize; c++) {
      const idx = r * boardSize + c;
      const isWinningSquare = winningLine.includes(idx);
      cells.push(
        <Square
          key={idx}
          value={squares[idx]}
          onClick={() => onClick(idx)}
          isWinning={isWinningSquare}
          winnerLetter={winnerInfo && squares[idx] === winnerInfo.player}
        />
      );
    }
    rows.push(
      <div key={r} className="flex">
        {cells}
      </div>
    );
  }
  return (
    <div className={boardContainerClasses} style={{ color: "white" }}>
      {rows}
      {winnerInfo && <WinnerLine boardSize={boardSize} line={winningLine} />}
    </div>
  );
}

/* ===== SQUARE COMPONENT =====  
   Each square is a responsive cell with a white border.
   X's and O's scale to fill the cell.
   If the square is part of a win, it gets a neon highlight.
================================== */
function Square({ value, onClick, isWinning, winnerLetter }) {
  const baseClasses = "border border-white flex items-center justify-center transition-transform duration-300 hover:scale-105 flex-1 aspect-square";
  const bgClass = isWinning ? "bg-pink-600" : "bg-black/40";
  const textClass = winnerLetter ? "text-pink-500" : "text-white";
  const fontSize = "calc(1.5rem + 4vw)";
  return (
    <button onClick={onClick} className={`${baseClasses} ${bgClass} ${textClass}`} style={{ fontSize, fontWeight: "bold", lineHeight: 1 }}>
      {value}
    </button>
  );
}

/* ===== WINNER LINE COMPONENT =====  
   Draws a neon purple line covering the winning squares.
   Computes the center of the first and last winning cells on a 600×600 board.
================================== */
function WinnerLine({ boardSize, line }) {
  const containerSize = 600;
  const cellSize = containerSize / boardSize;
  const first = line[0];
  const last = line[line.length - 1];
  const row1 = Math.floor(first / boardSize);
  const col1 = first % boardSize;
  const row2 = Math.floor(last / boardSize);
  const col2 = last % boardSize;
  const x1 = col1 * cellSize + cellSize / 2;
  const y1 = row1 * cellSize + cellSize / 2;
  const x2 = col2 * cellSize + cellSize / 2;
  const y2 = row2 * cellSize + cellSize / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        top: `${y1}px`,
        left: `${x1}px`,
        width: `${length}px`,
        height: "8px",
        backgroundColor: "#8400ff",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
      }}
    />
  );
}

/* ===== CONTROLS COMPONENT =====  
   Contains the Restart button and Move History.
================================== */
function Controls({ history, jumpTo, restartGame, currentMove }) {
  return (
    <div className="flex flex-col items-center space-y-6" style={{ color: "white" }}>
      <button
        onClick={restartGame}
        className="px-6 py-2 bg-purple-700 text-white rounded-full hover:bg-purple-600 transition transform hover:scale-105 shadow-neon"
      >
        Restart
      </button>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-3" style={{ color: "white" }}>Move History</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {history.map((_, move) => {
            const label = move === 0 ? "Start" : `#${move}`;
            return (
              <button
                key={move}
                onClick={() => jumpTo(move)}
                className="px-3 py-1 bg-black/40 text-white border border-purple-500 rounded transition hover:bg-purple-700"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== WINNER CALCULATION FOR NxN BOARD =====  
   Checks each possible winning line on an N×N board.
================================== */
function calculateWinner(squares, N) {
  if (!squares) return null;
  const lines = generateWinningLines(N);
  for (let line of lines) {
    const first = line[0];
    if (squares[first] && line.every(idx => squares[idx] === squares[first])) {
      return { player: squares[first], line };
    }
  }
  return null;
}

/* ===== GENERATE WINNING LINES FOR NxN BOARD =====  
   Generates all horizontal, vertical, and both diagonal lines.
================================== */
function generateWinningLines(N) {
  const lines = [];
  // Rows
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let c = 0; c < N; c++) {
      row.push(r * N + c);
    }
    lines.push(row);
  }
  // Columns
  for (let c = 0; c < N; c++) {
    const col = [];
    for (let r = 0; r < N; r++) {
      col.push(r * N + c);
    }
    lines.push(col);
  }
  // Main diagonal
  const diag1 = [];
  for (let i = 0; i < N; i++) {
    diag1.push(i * N + i);
  }
  lines.push(diag1);
  // Anti-diagonal
  const diag2 = [];
  for (let i = 0; i < N; i++) {
    diag2.push(i * N + (N - 1 - i));
  }
  lines.push(diag2);
  return lines;
}
