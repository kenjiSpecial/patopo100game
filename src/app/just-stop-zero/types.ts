export type GameState = 'title' | 'playing' | 'result' | 'gameover';

export interface GameResult {
  diff: number; // 誤差 (秒)
  score: number;
  isNewRecord: boolean;
  justStop: boolean; // 0.00ジャストかどうか
  rank: 'PERFECT' | 'GREAT' | 'GOOD' | 'BAD';
}

export interface GameConfig {
  initialTime: number; // 開始時間 (秒) e.g. 3.00
  countSpeed: number; // 減算速度 (秒/フレーム)
  perfectThreshold: number; // PERFECT判定の閾値 (秒)
  greatThreshold: number; // GREAT判定の閾値 (秒)
  gameoverThreshold: number; // ゲームオーバー判定の閾値 (秒)
}

