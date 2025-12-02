import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Block,
  BoardState,
  GameStatus,
  BlockType,
  JankenHistory
} from '../types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SHAPES,
  BLOCK_COLORS,
  NORMAL_BLOCKS,
  GOOD_BLOCKS,
  BAD_BLOCKS,
  TETRIS_TICK
} from '../constants';

const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const determineModifierFromHistory = (history: JankenHistory): 'good' | 'bad' => {
  if (history.total === 0) return 'bad'; // Default to bad if no games played (encourages playing) or make it normal? User said "otherwise bad".
  // Actually, if no games played, maybe just bad?
  // "勝敗の勝ちの割合が高ければ、こちらに有利なコマが出て、そうでなかったら別にいびつなコマが出る"
  // Win rate calculation
  const winRate = history.wins / history.total;
  if (winRate > 0.5) return 'good';
  return 'bad';
};

const getRandomBlock = (modifier: 'good' | 'bad'): Block => {
  let pool: BlockType[] = BAD_BLOCKS; // Default bad
  if (modifier === 'good') pool = GOOD_BLOCKS;

  const type = pool[Math.floor(Math.random() * pool.length)];
  const shape = BLOCK_SHAPES[type];

  // Center position
  const x = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2);

  return {
    type,
    shape,
    position: { x, y: 0 },
    color: BLOCK_COLORS[type],
  };
};

export const useTetrisGame = (
  jankenHistory: JankenHistory,
  onResetHistory: () => void
) => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);

  // Refs
  const historyRef = useRef(jankenHistory);
  const boardRef = useRef(board);
  const blockRef = useRef(currentBlock);
  const gameStatusRef = useRef(gameStatus);

  useEffect(() => { historyRef.current = jankenHistory; }, [jankenHistory]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { blockRef.current = currentBlock; }, [currentBlock]);
  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);

  const checkCollision = useCallback((x: number, y: number, shape: number[][], currentBoard: BoardState) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && currentBoard[newY][newX] !== 0) return true;
        }
      }
    }
    return false;
  }, []);

  const spawnBlock = useCallback(() => {
    const modifier = determineModifierFromHistory(historyRef.current);
    const newBlock = getRandomBlock(modifier);

    // Reset history after spawning (new round of janken begins for next block)
    onResetHistory();

    if (checkCollision(newBlock.position.x, newBlock.position.y, newBlock.shape, boardRef.current)) {
      setGameStatus('gameover');
    } else {
      setCurrentBlock(newBlock);
    }
  }, [checkCollision, onResetHistory]);

  const placeBlock = useCallback(() => {
    const block = blockRef.current;
    if (!block) return;

    const newBoard = boardRef.current.map(row => [...row]);

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const y = block.position.y + r;
          const x = block.position.x + c;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
             newBoard[y][x] = 1;
          }
        }
      }
    }

    // Check lines
    let linesCleared = 0;
    const finalBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (finalBoard.length < BOARD_HEIGHT) {
      finalBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    setBoard(finalBoard);
    setScore(prev => prev + linesCleared * 100);
    setCurrentBlock(null);
    spawnBlock();
  }, [spawnBlock]);

  const move = useCallback((dx: number, dy: number) => {
    const block = blockRef.current;
    const board = boardRef.current;
    if (!block || gameStatusRef.current !== 'playing') return;

    const newX = block.position.x + dx;
    const newY = block.position.y + dy;

    if (!checkCollision(newX, newY, block.shape, board)) {
      setCurrentBlock({ ...block, position: { x: newX, y: newY } });
    } else {
      if (dy > 0) {
        placeBlock();
      }
    }
  }, [checkCollision, placeBlock]);

  const rotate = useCallback(() => {
    const block = blockRef.current;
    const board = boardRef.current;
    if (!block || gameStatusRef.current !== 'playing') return;

    const newShape = block.shape[0].map((_, index) =>
      block.shape.map(row => row[index]).reverse()
    );

    if (!checkCollision(block.position.x, block.position.y, newShape, board)) {
      setCurrentBlock({ ...block, shape: newShape });
    }
  }, [checkCollision]);

  const drop = useCallback(() => {
    move(0, 1);
  }, [move]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    if (!currentBlock) {
      spawnBlock();
    }

    const interval = setInterval(() => {
      drop();
    }, TETRIS_TICK);

    return () => clearInterval(interval);
  }, [gameStatus, drop, spawnBlock, currentBlock]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameStatus('playing');
    setCurrentBlock(null);
    // Note: History reset should happen at start too, but managed by Page usually or initial effect
  };

  // Controls
  const moveLeft = () => move(-1, 0);
  const moveRight = () => move(1, 0);
  const moveDown = () => move(0, 1);

  return {
    board,
    currentBlock,
    gameStatus,
    score,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    startGame,
  };
};
