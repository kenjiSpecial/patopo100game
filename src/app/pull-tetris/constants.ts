export const GAME_WIDTH = 360;
// export const GAME_HEIGHT = 640; // Removed for dynamic height
export const BLOCK_SIZE = 30; // Size of one mino
export const WALL_THICKNESS = 20;

export const CATEGORY_WALL = 0x0001;
export const CATEGORY_BLOCK = 0x0002;
export const CATEGORY_CURRENT = 0x0004;

export const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
export type TetrominoType = typeof TETROMINO_TYPES[number];

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#06b6d4', // Cyan
  O: '#fbbf24', // Yellow
  T: '#a855f7', // Purple
  S: '#22c55e', // Green
  Z: '#ef4444', // Red
  J: '#3b82f6', // Blue
  L: '#f97316', // Orange
};

