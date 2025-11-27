import React from 'react';
import { GameState, GameScore } from '../types';

interface GameUIProps {
  gameState: GameState;
  score: GameScore;
  hp: number;
  onStart: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, score, hp, onStart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 p-3 rounded-xl backdrop-blur-md border border-white/10">
          <div className="text-xs text-gray-300 mb-1">SCORE</div>
          <div className="text-3xl font-bold text-white font-mono">{score.score}</div>
        </div>

        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 border-white/30 transition-all duration-300 ${
                i < hp ? 'bg-red-500 scale-100' : 'bg-transparent scale-90 opacity-30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Combo Indicator */}
      {score.combo > 1 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
           <div className="text-4xl font-black text-yellow-400 drop-shadow-lg italic">{score.combo}</div>
           <div className="text-sm font-bold text-yellow-200 tracking-widest">COMBO!</div>
        </div>
      )}

      {/* Game Over / Title Screen */}
      {(gameState === 'title' || gameState === 'gameover') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50">
          {gameState === 'title' ? (
             <div className="text-center p-8">
               <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                 <span className="text-red-500">READ</span> THE <span className="text-blue-500">PUNCH</span>
               </h1>
               <p className="text-gray-300 mb-8">敵の動きを読んで左右にかわせ！</p>

               <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-8 bg-white/5 p-4 rounded-lg text-left">
                 <div>⬅️ 敵が右パンチ(画面左)</div>
                 <div className="text-blue-400">右へ回避</div>
                 <div>➡️ 敵が左パンチ(画面右)</div>
                 <div className="text-blue-400">左へ回避</div>
               </div>
             </div>
          ) : (
            <div className="text-center p-8">
               <h2 className="text-6xl font-black text-red-600 mb-4">KO</h2>
               <div className="text-2xl text-white mb-2">Score: {score.score}</div>
               <div className="text-xl text-yellow-400 mb-8">Max Combo: {score.maxCombo}</div>
            </div>
          )}

          <button
            onClick={onStart}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-2xl font-bold rounded-full shadow-xl transform transition hover:scale-105 active:scale-95"
          >
            {gameState === 'title' ? 'FIGHT!' : 'RETRY'}
          </button>
        </div>
      )}
    </div>
  );
};

