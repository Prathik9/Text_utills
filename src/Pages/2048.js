 
import React, { useEffect, useState, useRef } from "react";
 
// 2048 Game - Single-file React component using Tailwind CSS classes
// Default export is the App component. Drop this into a CRA / Vite React app.
// Requires Tailwind configured in the project (or you can replace classes with your own CSS).
 
const SIZE = 4;
const START_TILES = 2;
 
function copyGrid(grid) {
  return grid.map((row) => row.slice());
}
 
function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}
 
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
 
function addRandomTile(grid) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return false;
  const [r, c] = empty[getRandomInt(empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}
 
function initializeGrid() {
  const grid = createEmptyGrid();
  for (let i = 0; i < START_TILES; i++) addRandomTile(grid);
  return grid;
}
 
function transpose(grid) {
  const newG = createEmptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newG[r][c] = grid[c][r];
    }
  }
  return newG;
}
 
function reverseRows(grid) {
  return grid.map((row) => row.slice().reverse());
}
 
function compressRow(row) {
  // remove zeros and slide left
  const newRow = row.filter((v) => v !== 0);
  while (newRow.length < SIZE) newRow.push(0);
  return newRow;
}
 
function moveLeft(grid) {
  let scoreGain = 0;
  let moved = false;
  const newGrid = grid.map((row) => {
    let compressed = compressRow(row);
    for (let c = 0; c < SIZE - 1; c++) {
      if (compressed[c] !== 0 && compressed[c] === compressed[c + 1]) {
        compressed[c] = compressed[c] * 2;
        scoreGain += compressed[c];
        compressed[c + 1] = 0;
      }
    }
    const finalRow = compressRow(compressed);
    if (finalRow.some((v, i) => v !== row[i])) moved = true;
    return finalRow;
  });
  return { grid: newGrid, moved, scoreGain };
}
 
function moveRight(grid) {
  const reversed = reverseRows(grid);
  const { grid: movedGrid, moved, scoreGain } = moveLeft(reversed);
  return { grid: reverseRows(movedGrid), moved, scoreGain };
}
 
function moveUp(grid) {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved, scoreGain } = moveLeft(transposed);
  return { grid: transpose(movedGrid), moved, scoreGain };
}
 
function moveDown(grid) {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved, scoreGain } = moveRight(transposed);
  return { grid: transpose(movedGrid), moved, scoreGain };
}
 
function canMove(grid) {
  // if any zero cell
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) return true;
  // check merges horizontally
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE - 1; c++)
      if (grid[r][c] === grid[r][c + 1]) return true;
  // check merges vertically
  for (let c = 0; c < SIZE; c++)
    for (let r = 0; r < SIZE - 1; r++)
      if (grid[r][c] === grid[r + 1][c]) return true;
  return false;
}
 
function prettyTileClass(val) {
  // Tailwind classes depend on tile value
  const base =
    "w-20 h-20 flex items-center justify-center rounded-lg text-xl font-bold";
  if (val === 0)
    return `${base} bg-transparent border border-dashed border-gray-300`;
  const colorMap = {
    2: "bg-gray-100 text-gray-800",
    4: "bg-yellow-100 text-gray-800",
    8: "bg-yellow-300 text-white",
    16: "bg-orange-400 text-white",
    32: "bg-orange-500 text-white",
    64: "bg-red-400 text-white",
    128: "bg-red-500 text-white text-sm",
    256: "bg-pink-500 text-white text-sm",
    512: "bg-purple-600 text-white text-sm",
    1024: "bg-indigo-600 text-white text-sm",
    2048: "bg-green-600 text-white text-sm",
  };
  return `${base} ${colorMap[val] || "bg-black text-white"} shadow-md`;
}
 
export default function Game2048() {
  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem("react2048-grid");
    return saved ? JSON.parse(saved) : initializeGrid();
  });
  const [score, setScore] = useState(
    () => Number(localStorage.getItem("react2048-score")) || 0
  );
  const [best, setBest] = useState(
    () => Number(localStorage.getItem("react2048-best")) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const touchStartRef = useRef(null);
 
  useEffect(() => {
    localStorage.setItem("react2048-grid", JSON.stringify(grid));
  }, [grid]);
 
  useEffect(() => {
    localStorage.setItem("react2048-score", String(score));
    if (score > best) {
      setBest(score);
      localStorage.setItem("react2048-best", String(score));
    }
  }, [score, best]);
 
  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleMoveKey(e.key);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid]);
 
  function spawnAndSet(newGrid, addedScore = 0) {
    const g = copyGrid(newGrid);
    addRandomTile(g);
    setGrid(g);
    if (addedScore) setScore((s) => s + addedScore);
    if (!canMove(g)) setGameOver(true);
  }
 
  function handleMoveKey(key) {
    if (gameOver) return;
    let res;
    if (key === "ArrowLeft") res = moveLeft(grid);
    if (key === "ArrowRight") res = moveRight(grid);
    if (key === "ArrowUp") res = moveUp(grid);
    if (key === "ArrowDown") res = moveDown(grid);
    if (!res) return;
    if (res.moved) spawnAndSet(res.grid, res.scoreGain);
  }
 
  function restart() {
    const g = initializeGrid();
    setGrid(g);
    setScore(0);
    setGameOver(false);
  }
 
  // Touch/swipe support
  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchEnd(e) {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 30; // minimal swipe distance
    if (Math.max(absX, absY) < threshold) return;
    if (absX > absY) {
      if (dx > 0) handleMoveKey("ArrowRight");
      else handleMoveKey("ArrowLeft");
    } else {
      if (dy > 0) handleMoveKey("ArrowDown");
      else handleMoveKey("ArrowUp");
    }
    touchStartRef.current = null;
  }
 
  // small helper to format numbers
  function format(num) {
    return num === 0 ? "" : num;
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold">2048</h1>
          <div className="flex gap-3">
            <div className="bg-white p-3 rounded shadow text-center">
              <div className="text-xs">Score</div>
              <div className="font-bold text-lg">{score}</div>
            </div>
            <div className="bg-white p-3 rounded shadow text-center">
              <div className="text-xs">Best</div>
              <div className="font-bold text-lg">{best}</div>
            </div>
            <button
              onClick={restart}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Game
            </button>
          </div>
        </div>
 
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="bg-gray-200 p-4 rounded-lg shadow-inner"
        >
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
          >
            {grid.flatMap((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="flex items-center justify-center"
                >
                  <div className={prettyTileClass(val)}>
                    <span>{format(val)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
 
        {gameOver && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <div className="text-lg font-bold">Game Over</div>
            <div className="mt-2">Your score: {score}</div>
            <div className="mt-2">
              <button
                onClick={restart}
                className="px-3 py-2 bg-blue-500 text-white rounded"
              >
                Try again
              </button>
            </div>
          </div>
        )}
 
        <div className="mt-6 text-sm text-gray-600">
          Use arrow keys or swipe to move tiles. Merges give you points. Reach
          2048!
        </div>
      </div>
    </div>
  );
}
 
 