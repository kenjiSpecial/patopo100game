import { BlockType, CellValue } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const BLOCK_COLORS: Record<BlockType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
  Complex1: 'bg-gray-500',
  Complex2: 'bg-gray-600',
  Complex3: 'bg-gray-700',
};

export const BLOCK_SHAPES: Record<BlockType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // "Bad" shapes (Lose penalty)
  Complex1: [
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 0],
  ], // Cross + extra
  Complex2: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ], // Z + extra
  Complex3: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ], // U shape big
};

export const NORMAL_BLOCKS: BlockType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
export const GOOD_BLOCKS: BlockType[] = ['I', 'O']; // Easy to stack
export const BAD_BLOCKS: BlockType[] = ['Complex1', 'Complex2', 'Complex3']; // Hard to stack

export const JANKEN_INTERVAL = 3000; // CPU changes hand every 3 seconds
export const TETRIS_TICK = 800; // Initial fall speed

