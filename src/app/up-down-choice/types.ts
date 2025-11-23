export type Block = {
  id: number;
  value: number;
  x: number; // -1 (左), 0 (中央), 1 (右)
  y: number; // 画面上部からの％位置 (0-100)
  status: 'falling' | 'success' | 'miss';
  result?: 'correct' | 'wrong';
};

export type GameState = 'start' | 'countdown' | 'playing' | 'gameover';

export type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  shape: 'circle' | 'rect';
};

