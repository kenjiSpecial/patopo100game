export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type BoardState = (BlockType | null)[][];

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

export type GameStatus = 'idle' | 'playing' | 'gameover';

export interface ScoreReport {
  symmetryScore: number;
  smoothnessScore: number;
  cavityPenalty: number;
  colorHarmonyScore: number;
  totalScore: number;
  symmetryDetails: string;
  smoothnessDetails: string;
  cavityDetails: string;
  colorHarmonyDetails: string;
}

