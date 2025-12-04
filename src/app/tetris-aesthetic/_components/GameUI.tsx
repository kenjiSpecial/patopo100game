import React from 'react';
import { AestheticBoard } from './AestheticBoard';
import { ResultModal } from './ResultModal';
import { BoardState, Block, GameStatus, ScoreReport } from '../types';

interface GameUIProps {
  board: BoardState;
  currentBlock: Block | null;
  gameStatus: GameStatus;
  scoreReport: ScoreReport | null;
  onStart: () => void;
  onRotate: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  board,
  currentBlock,
  gameStatus,
  scoreReport,
  onStart,
  onRotate,
  onMoveLeft,
  onMoveRight,
  onMoveDown,
}) => {

  // Helper for handling touch/click without double firing
  const createHandler = (action: () => void) => {
    return (e: React.MouseEvent) => {
      action();
    };
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] bg-gray-950 text-white p-2 font-sans overflow-hidden touch-none select-none">

      <div className="flex flex-col items-center w-full max-w-lg flex-1 justify-center">
        <header className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            美しき塔
          </h1>
        </header>

        <div className="relative mb-2">
          <AestheticBoard board={board} currentBlock={currentBlock} />

          {gameStatus === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-20">
              <button
                onClick={onStart}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform animate-pulse"
              >
                START
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Virtual Controls - Always visible, optimized for mobile */}
      <div className="w-full max-w-md grid grid-cols-2 gap-8 mb-6 px-4">
        {/* Left Side: Movement (Cross Layout) */}
        <div className="relative w-32 h-32 mx-auto">
             {/* Up (Spacer/Rotate alt?) - Empty for now */}

             {/* Down */}
             <button
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800/90 rounded-full shadow-lg border-2 border-gray-600 active:bg-gray-600 active:scale-95 transition-all flex items-center justify-center"
                onClick={createHandler(onMoveDown)}
                aria-label="Down"
            >
                <span className="text-xl">↓</span>
            </button>

            {/* Left */}
            <button
                className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 bg-gray-800/90 rounded-full shadow-lg border-2 border-gray-600 active:bg-gray-600 active:scale-95 transition-all flex items-center justify-center"
                onClick={createHandler(onMoveLeft)}
                aria-label="Left"
            >
                <span className="text-xl">←</span>
            </button>

            {/* Right */}
            <button
                className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 bg-gray-800/90 rounded-full shadow-lg border-2 border-gray-600 active:bg-gray-600 active:scale-95 transition-all flex items-center justify-center"
                onClick={createHandler(onMoveRight)}
                aria-label="Right"
            >
                <span className="text-xl">→</span>
            </button>

            {/* Center Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-700 rounded-full opacity-50 pointer-events-none" />
        </div>

        {/* Right Side: Action (Rotate) */}
        <div className="flex items-center justify-center">
            <button
                className="w-24 h-24 bg-cyan-700/90 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] border-4 border-cyan-500 active:bg-cyan-600 active:scale-95 transition-all flex items-center justify-center active:shadow-inner"
                onClick={createHandler(onRotate)}
                aria-label="Rotate"
            >
                <span className="text-3xl font-bold">↻</span>
            </button>
        </div>
      </div>

      {scoreReport && (
        <ResultModal report={scoreReport} onRestart={onStart} />
      )}
    </div>
  );
};
