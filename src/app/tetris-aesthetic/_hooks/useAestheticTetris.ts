import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Block,
  BoardState,
  GameStatus,
  BlockType,
  ScoreReport,
} from '../types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SHAPES,
  BLOCK_COLORS,
  STANDARD_BLOCKS,
  INITIAL_TICK,
} from '../constants';

const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const getRandomBlock = (): Block => {
  const type = STANDARD_BLOCKS[Math.floor(Math.random() * STANDARD_BLOCKS.length)];
  const shape = BLOCK_SHAPES[type];
  const x = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2);

  return {
    type,
    shape,
    position: { x, y: 0 },
    color: BLOCK_COLORS[type],
  };
};

const calculateScore = (board: BoardState): ScoreReport => {
  let symmetryScore = 0;
  let smoothnessScore = 0;
  let cavityPenalty = 0;
  let colorHarmonyScore = 0;

  // 1. Symmetry (Left vs Right)
  // Width is 10. Left: 0-4, Right: 5-9.
  // Compare (0, 9), (1, 8), (2, 7), (3, 6), (4, 5)
  let matchingCells = 0;
  let totalComparisons = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH / 2; x++) {
      const left = board[y][x];
      const right = board[y][BOARD_WIDTH - 1 - x];

      const leftFilled = left !== null;
      const rightFilled = right !== null;

      if (leftFilled === rightFilled) {
        matchingCells++;
      }
      totalComparisons++;
    }
  }

  // Perfect symmetry bonus
  const symmetryRate = matchingCells / totalComparisons;
  symmetryScore = Math.floor(symmetryRate * 200);

  // 2. Smoothness
  // Calculate column heights
  const colHeights = Array(BOARD_WIDTH).fill(0);
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (board[y][x] !== null) {
        colHeights[x] = BOARD_HEIGHT - y;
        break;
      }
    }
  }

  let totalDiff = 0;
  for (let x = 0; x < BOARD_WIDTH - 1; x++) {
    totalDiff += Math.abs(colHeights[x] - colHeights[x+1]);
  }
  // Max possible diff could be high, but let's say 200 max points minus diff penalty
  smoothnessScore = Math.max(0, 200 - (totalDiff * 5));

  // 3. Cavities
  let cavityCount = 0;
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let hitBlock = false;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (board[y][x] !== null) {
        hitBlock = true;
      } else if (hitBlock) {
        // Empty space after hitting a block
        cavityCount++;
      }
    }
  }
  cavityPenalty = cavityCount * 10;

  // 4. Color Harmony
  // Bonus for adjacent same colors (horizontally and vertically)
  let sameColorPairs = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const current = board[y][x];
      if (current === null) continue;

      // Check right
      if (x < BOARD_WIDTH - 1 && board[y][x+1] === current) {
        sameColorPairs++;
      }
      // Check down
      if (y < BOARD_HEIGHT - 1 && board[y+1][x] === current) {
        sameColorPairs++;
      }
    }
  }
  colorHarmonyScore = sameColorPairs * 2;

  const totalScore = Math.max(0, symmetryScore + smoothnessScore - cavityPenalty + colorHarmonyScore);

  return {
    symmetryScore,
    smoothnessScore,
    cavityPenalty,
    colorHarmonyScore,
    totalScore,
    symmetryDetails: `一致率: ${Math.round(symmetryRate * 100)}%`,
    smoothnessDetails: `高低差合計: ${totalDiff}`,
    cavityDetails: `空洞数: ${cavityCount}`,
    colorHarmonyDetails: `同色ペア: ${sameColorPairs}`,
  };
};

export const useAestheticTetris = () => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [scoreReport, setScoreReport] = useState<ScoreReport | null>(null);

  const boardRef = useRef(board);
  const currentBlockRef = useRef(currentBlock);
  const gameStatusRef = useRef(gameStatus);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { currentBlockRef.current = currentBlock; }, [currentBlock]);
  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);

  const checkCollision = useCallback((x: number, y: number, shape: number[][], currentBoard: BoardState) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;

          // Bounds check
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;

          // Board check
          // Allow new block to spawn partially above board (y < 0) if not blocked
          if (newY >= 0 && currentBoard[newY][newX] !== null) return true;
        }
      }
    }
    return false;
  }, []);

  const endGame = useCallback(() => {
    setGameStatus('gameover');
    const report = calculateScore(boardRef.current);
    setScoreReport(report);
  }, []);

  const spawnBlock = useCallback(() => {
    const newBlock = getRandomBlock();

    // Initial collision check (Game Over check)
    // When spawning, if it collides immediately, it's game over.
    // Note: Standard Tetris usually allows spawn if it overlaps but user can move it immediately?
    // For simplicity: if spawn collides, game over.

    // However, we need to handle 'top out'.
    // If we can't place the block at the spawn point:
    if (checkCollision(newBlock.position.x, newBlock.position.y, newBlock.shape, boardRef.current)) {
       endGame();
    } else {
      setCurrentBlock(newBlock);
    }
  }, [checkCollision, endGame]);

  const placeBlock = useCallback(() => {
    const block = currentBlockRef.current;
    if (!block) return;

    const newBoard = boardRef.current.map(row => [...row]);

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const y = block.position.y + r;
          const x = block.position.x + c;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
             newBoard[y][x] = block.type;
          } else if (y < 0) {
              // Block locked above board - instant game over usually
              // But let's just ignore it for 'placement' and trigger gameover checks or just allow 'topping out' logic elsewhere
              // For this mode: "Teppen ni toutatsu shitara shuryo" -> if any block locks at y < 0 or y=0?
          }
        }
      }
    }

    setBoard(newBoard);
    setCurrentBlock(null);

    // Check for Game Over condition (Top out)
    // If any block is placed at y=0 or if the board is full to top?
    // Usually "Game Over" if spawn fails, or if locked block extends above visible area?
    // Let's stick to: if spawn fails -> Game Over.
    // Also check if newly placed block is at the very top row?
    const isAtTop = block.position.y <= 0;
    // But position.y is top-left of shape. Shape might have empty top rows.
    // More accurately: did we write anything to row 0?
    const wroteToTop = newBoard[0].some(cell => cell !== null);

    if (wroteToTop) {
        // Let's decide if reaching top is instant game over or if we just keep going until spawn fails.
        // The prompt says: "てっぺんに到達したら終了" (End when reaching the top).
        // So if row 0 has any blocks, trigger end game.

        // Update board first so we can calculate score based on it
        boardRef.current = newBoard; // Update ref for sync usage if needed
        endGame();
        return;
    }

    spawnBlock();
  }, [spawnBlock, endGame]);

  const move = useCallback((dx: number, dy: number) => {
    const block = currentBlockRef.current;
    const board = boardRef.current;
    if (!block || gameStatusRef.current !== 'playing') return;

    const newX = block.position.x + dx;
    const newY = block.position.y + dy;

    if (!checkCollision(newX, newY, block.shape, board)) {
      setCurrentBlock({ ...block, position: { x: newX, y: newY } });
    } else {
      if (dy > 0) {
        // Hit bottom or block
        placeBlock();
      }
    }
  }, [checkCollision, placeBlock]);

  const rotate = useCallback(() => {
    const block = currentBlockRef.current;
    const board = boardRef.current;
    if (!block || gameStatusRef.current !== 'playing') return;

    // Simple rotation
    const newShape = block.shape[0].map((_, index) =>
      block.shape.map(row => row[index]).reverse()
    );

    // Wall kick / adjustments could be added here, but keeping it simple
    if (!checkCollision(block.position.x, block.position.y, newShape, board)) {
      setCurrentBlock({ ...block, shape: newShape });
    } else {
      // Try basic wall kicks (shift left/right)
      if (!checkCollision(block.position.x - 1, block.position.y, newShape, board)) {
         setCurrentBlock({ ...block, shape: newShape, position: { ...block.position, x: block.position.x - 1 } });
      } else if (!checkCollision(block.position.x + 1, block.position.y, newShape, board)) {
         setCurrentBlock({ ...block, shape: newShape, position: { ...block.position, x: block.position.x + 1 } });
      }
    }
  }, [checkCollision]);

  const drop = useCallback(() => {
    move(0, 1);
  }, [move]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScoreReport(null);
    setGameStatus('playing');
    setCurrentBlock(null);
    // Reset refs
    gameStatusRef.current = 'playing';
    boardRef.current = createEmptyBoard();

    spawnBlock();
  }, [spawnBlock]);

  // Game Loop
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      drop();
    }, INITIAL_TICK);

    return () => clearInterval(interval);
  }, [gameStatus, drop]);

  return {
    board,
    currentBlock,
    gameStatus,
    scoreReport,
    moveLeft: () => move(-1, 0),
    moveRight: () => move(1, 0),
    moveDown: () => move(0, 1),
    rotate,
    startGame,
  };
};

