export type GameStatus = 'idle' | 'playing' | 'gameover';

export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type BoardState = CellValue[][];

export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | 'Complex1' | 'Complex2' | 'Complex3';

export interface Position {
  x: number;
  y: number;
}

export interface Block {
  type: BlockType;
  shape: number[][];
  position: Position;
  color: string;
}

export type JankenHand = 'rock' | 'paper' | 'scissors' | null;
export type JankenResult = 'win' | 'lose' | 'draw' | 'timeout' | 'none';
export type JankenPhase = 'idle' | 'countdown' | 'input' | 'result';

export interface JankenLog {
  id: string;
  result: JankenResult;
  playerHand: JankenHand;
  cpuHand: JankenHand;
  timestamp: number;
}

export interface JankenHistory {
  wins: number;
  loses: number; // Includes timeouts
  draws: number;
  total: number;
  logs: JankenLog[]; // Add detailed logs
}

export interface JankenState {
  phase: JankenPhase;
  countdownValue: number; // 3, 2, 1
  cpuHand: JankenHand; // Hidden during input phase
  playerHand: JankenHand;
  result: JankenResult;
  history: JankenHistory;
}
