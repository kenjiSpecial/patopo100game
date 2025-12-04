'use client';

import React, { useEffect } from 'react';
import { useAestheticTetris } from './_hooks/useAestheticTetris';
import { GameUI } from './_components/GameUI';

export default function TetrisAestheticPage() {
  const {
    board,
    currentBlock,
    gameStatus,
    scoreReport,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    startGame,
  } = useAestheticTetris();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault(); // Prevent scrolling
          rotate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, moveLeft, moveRight, moveDown, rotate]);

  return (
    <GameUI
      board={board}
      currentBlock={currentBlock}
      gameStatus={gameStatus}
      scoreReport={scoreReport}
      onStart={startGame}
      onRotate={rotate}
      onMoveLeft={moveLeft}
      onMoveRight={moveRight}
      onMoveDown={moveDown}
    />
  );
}

