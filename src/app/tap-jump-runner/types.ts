export type GameStatus = 'start' | 'playing' | 'gameover';

export interface PlayerState {
  y: number; // Bottom position (px)
  velocity: number;
  isJumping: boolean;
  jumpCount: number; // 0: grounded, 1: single jump, 2: double jump, 3: triple jump
}

export interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  type: 'ground' | 'flying' | 'pit';
  passed: boolean;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface GameState {
  status: GameStatus;
  score: number;
  coins: number;
  distance: number;
  speed: number;
  highScore: number;
}

export interface GameConfig {
  gravity: number;
  jumpForce: number;
  initialSpeed: number;
  maxSpeed: number;
  acceleration: number;
  groundHeight: number;
}
