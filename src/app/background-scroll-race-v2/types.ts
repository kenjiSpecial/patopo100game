export interface Obstacle {
  id: string;
  type: 'car' | 'cone' | 'barrier';
  x: number;
  y: number;
  width: number;
  height: number;
  speedOffset: number; // Speed difference relative to background
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameState = 'title' | 'playing' | 'gameover';

export interface GameScore {
  distance: number;
  coins: number;
}

