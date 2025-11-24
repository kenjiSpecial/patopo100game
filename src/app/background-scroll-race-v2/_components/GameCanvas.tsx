'use client';

import { useEffect, useRef } from 'react';
import { RaceGame } from '../_game/RaceGame';
import { GameState, GameScore } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: () => void;
  onScoreUpdate: (points: number) => void;
  // Expose a ref or method to start game?
  // Or simply listen to gameState prop change.
}

export default function GameCanvas({ gameState, onGameOver, onScoreUpdate }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<RaceGame | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Initialize Game
    const game = new RaceGame(
        containerRef.current,
        window.innerWidth,
        window.innerHeight,
        onGameOver,
        onScoreUpdate
    );
    gameRef.current = game;

    const handleResize = () => {
        game.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (gameRef.current) {
            gameRef.current.destroy();
            gameRef.current = null;
        }
    };
  }, []); // Run once on mount

  // React to gameState changes
  useEffect(() => {
      if (!gameRef.current) return;

      if (gameState === 'playing') {
          gameRef.current.startGame();
      } else if (gameState === 'gameover') {
          gameRef.current.setGameOver();
      }
  }, [gameState]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
