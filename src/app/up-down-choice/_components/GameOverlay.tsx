import React from 'react';
import Link from 'next/link';
import { GameState } from '../types';
import { MAX_MISSES } from '../constants';

type Props = {
  gameState: GameState;
  score: number;
  highScore: number;
  combo: number;
  misses: number;
  countdown: number;
  onStartGame: () => void;
};

export const GameOverlay: React.FC<Props> = ({
  gameState,
  score,
  highScore,
  combo,
  misses,
  countdown,
  onStartGame
}) => {
  return (
    <>
      {/* ヘッダーエリア */}
      <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start z-20 pointer-events-none">
        <div>
          <h1 className="text-lg font-bold text-slate-400 tracking-wider" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>UP/DOWN CHOICE</h1>
          <div className="flex items-baseline gap-4">
            <div className={`text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] font-mono transition-all duration-100 ${score > 0 ? 'scale-110' : ''}`}>
                {score}
            </div>
            {combo > 1 && (
                <div className="text-2xl font-bold text-cyan-400 animate-bounce drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    {combo} COMBO!
                </div>
            )}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">HIGH SCORE: {highScore}</div>
        </div>
        <div className="flex gap-2 bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur border border-slate-700 shadow-lg">
          {[...Array(MAX_MISSES)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${i < misses ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] scale-90' : 'bg-slate-600'}`}
            />
          ))}
        </div>
      </div>

      {/* カウントダウン画面 */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 pointer-events-none">
          <div className="text-9xl font-black text-white animate-ping drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            {countdown}
          </div>
        </div>
      )}

      {/* スタート画面 */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 backdrop-blur-md p-6 text-center">
          <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-red-500 blur-3xl opacity-30 animate-pulse"></div>
              <h1 className="relative text-6xl font-black mb-4 bg-linear-to-r from-blue-400 via-white to-red-400 text-transparent bg-clip-text drop-shadow-lg tracking-tighter italic">
              UP/DOWN<br/>CHOICE
              </h1>
          </div>
          <p className="text-slate-300 mb-10 text-lg font-light tracking-wide">
            瞬時の判断が試される。<br/>
            <span className="text-blue-400 font-bold drop-shadow-lg">偶数</span>は左へ、
            <span className="text-red-400 font-bold drop-shadow-lg">奇数</span>は右へ。
          </p>

          <button
            onClick={onStartGame}
            className="relative px-16 py-6 bg-white text-slate-900 font-black rounded-full hover:scale-105 active:scale-95 transition-all text-3xl shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden group"
          >
            <span className="relative z-10">START GAME</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-200 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </button>
        </div>
      )}

      {/* ゲームオーバー画面 */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 backdrop-blur-md p-6 animate-fade-in">
          <h2 className="text-5xl font-black text-red-600 mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">GAME OVER</h2>
          <div className="text-9xl font-black text-white mb-2 font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">{score}</div>
          <p className="text-slate-400 mb-12 text-xl tracking-[0.5em]">SCORE</p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={onStartGame}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 text-lg shadow-lg"
            >
              RETRY
            </button>
            <Link href="/" className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all hover:scale-105 border border-slate-600 text-center shadow-lg">
              BACK TO HOME
            </Link>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};






