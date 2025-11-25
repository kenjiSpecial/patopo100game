import React from 'react';
import { GameState } from '../types';

interface GameUIProps {
  gameState: GameState;
  onStart: () => void;
  onReset: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onStart, onReset }) => {
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-4">
      <div className="flex justify-between text-white font-bold text-xl drop-shadow-md">
        <div>Score: {Math.floor(gameState.score)}</div>
        <div>Coins: {gameState.coins}</div>
      </div>

      {gameState.status === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            1タップで<br/>ジャンプするだけランナー
          </h1>
          <p className="text-white mb-8">画面をタップしてジャンプ！</p>
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-xl font-bold shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            START
          </button>
        </div>
      )}

      {gameState.status === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md pointer-events-auto">
          <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-lg">GAME OVER</h2>
          <div className="text-white text-2xl mb-6 text-center">
            <p>Score: {Math.floor(gameState.score)}</p>
            <p className="text-sm text-gray-300 mt-2">Coins: {gameState.coins}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-xl font-bold shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
};
