"use client";

import { GameState } from "../_hooks/useDoorGame";

interface GameUIProps {
  floor: number;
  highScore: number;
  gameState: GameState;
  onReset: () => void;
}

export default function GameUI({ floor, highScore, gameState, onReset }: GameUIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10">
      {/* ヘッダー情報 */}
      <div className="flex justify-between items-start">
        <div className="bg-black/50 p-3 md:p-4 rounded-lg backdrop-blur-sm border border-white/20">
          <div className="text-xs md:text-sm text-gray-400">CURRENT FLOOR</div>
          <div className="text-3xl md:text-4xl font-bold text-white">{floor}F</div>
        </div>
        <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm border border-white/20">
          <div className="text-[10px] md:text-xs text-gray-400">BEST RECORD</div>
          <div className="text-lg md:text-xl font-bold text-yellow-400">{highScore}F</div>
        </div>
      </div>

      {/* ゲームオーバー画面 */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto animate-in fade-in duration-500">
          <h2 className="text-4xl md:text-6xl font-bold text-red-500 mb-4 tracking-wider">GAME OVER</h2>
          <p className="text-xl md:text-2xl text-white mb-8">到達階数: {floor}階</p>

          <button
            onClick={onReset}
            className="px-6 py-3 md:px-8 md:py-4 bg-white text-black text-lg md:text-xl font-bold rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-200 shadow-lg shadow-white/20"
          >
            もう一度挑戦
          </button>
        </div>
      )}

      {/* 操作ガイド（プレイ中のみ） */}
      {gameState === 'playing' && (
        <div className="text-center text-white/70 text-xs md:text-sm pb-3 md:pb-4 animate-pulse">
          運命の扉を選べ...
        </div>
      )}
    </div>
  );
}

