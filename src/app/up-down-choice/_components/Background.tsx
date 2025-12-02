import React from 'react';
import { GameState } from '../types';

type Props = {
  gameState: GameState;
};

export const Background: React.FC<Props> = ({ gameState }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black ${gameState === 'playing' ? 'animate-pulse' : ''}`}></div>
      {/* 流れるライン（CSSアニメーション） */}
      {gameState === 'playing' && (
        <>
          <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-blue-500/20 to-transparent animate-rain" style={{ animationDuration: '2s' }}></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-linear-to-b from-transparent via-red-500/20 to-transparent animate-rain" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-linear-to-b from-transparent via-white/10 to-transparent animate-rain" style={{ animationDuration: '1.5s' }}></div>
        </>
      )}
      <style jsx>{`
        @keyframes rain {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
        .animate-rain {
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};








