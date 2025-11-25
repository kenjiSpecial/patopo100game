export type GameState = 'title' | 'playing' | 'gameover';

export type ObstacleType = 'car' | 'cone' | 'barrier' | 'manhole' | 'oil' | 'crack' | 'hazard' | 'train';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number; // 0.0 ～ 1.0 (レーン位置)
  y: number; // 0.0 (画面下) ～ 1.0 (画面上)
  width: number; // 画面幅に対する割合
  height: number; // 画面高さに対する割合
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface Score {
  distance: number;
  coins: number;
}

export const GAME_CONFIG = {
  LANE_COUNT: 3, // レーン数（左、中央、右など）
  PLAYER_Y: 0.2, // プレイヤーのY位置（画面下からの割合、0.2なら下から20%の位置）
  PLAYER_WIDTH: 0.15, // プレイヤー幅
  PLAYER_HEIGHT: 0.1, // プレイヤー高さ
  INITIAL_SPEED: 0.005, // 初期のスクロール速度（フレームごとの移動量）
  MAX_SPEED: 0.02, // 最大速度
  SPEED_INCREMENT: 0.000001, // 速度の増加量
  OBSTACLE_SPAWN_RATE: 60, // 障害物生成頻度（フレーム数）
  COIN_SPAWN_RATE: 45, // コイン生成頻度
};




