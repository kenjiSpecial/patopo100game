'use client';

import React, { useEffect } from 'react';
import { useJankenGame } from './_hooks/useJankenGame';
import { useTetrisGame } from './_hooks/useTetrisGame';
import { TetrisBoard } from './_components/TetrisBoard';
import { JankenPanel } from './_components/JankenPanel';
import { ControlPanel } from './_components/ControlPanel';
import { GameOverlay } from './_components/GameOverlay';

export default function TetrisJankenPage() {
  const [status, setStatus] = React.useState<'idle' | 'playing' | 'gameover'>('idle');

  const {
    jankenState,
    playHand,
    resetHistory
  } = useJankenGame(status);

  const {
    board,
    currentBlock,
    score,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    startGame: startTetris,
    gameStatus: tetrisStatus
  } = useTetrisGame(jankenState.history, resetHistory);

  useEffect(() => {
    if (tetrisStatus !== status) {
      setStatus(tetrisStatus);
    }
  }, [tetrisStatus, status]);

  const handleStart = () => {
    setStatus('playing');
    startTetris();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (status !== 'playing') return;

        switch(e.key) {
            case 'ArrowLeft': moveLeft(); break;
            case 'ArrowRight': moveRight(); break;
            case 'ArrowDown': moveDown(); break;
            case 'ArrowUp': rotate(); break;
            case ' ': rotate(); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, moveLeft, moveRight, moveDown, rotate]);

  return (
    <main className="relative h-[100svh] w-full bg-gray-950 text-white flex flex-col items-center justify-start overflow-hidden touch-none">

      <GameOverlay
        gameState={status}
        score={score}
        onStart={handleStart}
      />

      {/* Header / Score */}
      <div className="w-full bg-gray-900 p-2 flex justify-between items-center px-4 border-b border-gray-800 z-10 h-12 shrink-0">
        <div className="font-bold text-base sm:text-lg">Tetris x Janken</div>
        <div className="text-lg sm:text-xl font-mono text-yellow-400">Score: {score}</div>
      </div>

      <div className="flex-1 w-full max-w-md flex flex-col items-center relative p-2 min-h-0">

        {/* Upper: Tetris */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0 mb-2">
           <TetrisBoard board={board} currentBlock={currentBlock} />
        </div>

        {/* Lower: Janken & Controls */}
        <div className="w-full shrink-0 flex flex-col gap-2">
            <JankenPanel
                jankenState={jankenState}
                onPlayHand={playHand}
            />

            <ControlPanel
                onLeft={moveLeft}
                onRight={moveRight}
                onDown={moveDown}
                onRotate={rotate}
            />
        </div>
      </div>
    </main>
  );
}
