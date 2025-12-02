import React from 'react';
import { GameStatus } from '../types';

interface GameOverlayProps {
  gameState: GameStatus;
  score: number;
  onStart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ gameState, score, onStart }) => {
  if (gameState === 'playing') return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Tetris x Janken
      </h1>

      {gameState === 'gameover' && (
        <div className="mb-6">
          <h2 className="text-2xl text-red-500 font-bold mb-2">GAME OVER</h2>
          <p className="text-xl">Score: {score}</p>
        </div>
      )}

      <div className="space-y-4 max-w-md text-sm text-gray-300 mb-8">
        <p>
          <strong className="text-white">上画面:</strong> テトリス。ラインを消してスコアを稼ごう。
        </p>
        <p>
          <strong className="text-white">下画面:</strong> じゃんけん。CPUに勝つと次のブロックが<span className="text-green-400">簡単</span>に。
          負けると<span className="text-red-400">難しく</span>なるぞ！
        </p>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-xl font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95"
      >
        {gameState === 'idle' ? 'START GAME' : 'RETRY'}
      </button>
    </div>
  );
};

