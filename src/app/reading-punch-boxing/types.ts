export type GameState = 'title' | 'playing' | 'gameover';

export type PunchType = 'left' | 'right' | 'none'; // 敵から見た左右（画面上では逆になることに注意）
export type PlayerAction = 'dodgeLeft' | 'dodgeRight' | 'idle' | 'hit';
export type DodgeRank = 'PERFECT' | 'GOOD' | 'EARLY' | 'MISS';

export interface GameScore {
  score: number;
  combo: number;
  maxCombo: number;
  level: number;
}

export interface EnemyState {
  action: PunchType;
  phase: 'idle' | 'telegraph' | 'attack' | 'cooldown';
  startTime: number; // アニメーション/フェーズ開始時間
  duration: number;  // 現在のフェーズの所要時間(ms)
}

export interface ScorePopup {
  id: number;
  text: string;
  score: number;
  rank: DodgeRank;
  x: number; // % position
  y: number; // % position
}
