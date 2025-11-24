'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { GameState, GameScore } from './types';
import { GameUI } from './_components/GameUI';

const GameCanvas = dynamic(() => import('./_components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
      Loading Game...
    </div>
  ),
});

export default function BackgroundScrollRacePage() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<GameScore>({ distance: 0, coins: 0 });

  const startGame = () => {
    setScore({ distance: 0, coins: 0 });
    setGameState('playing');
  };

  const handleGameOver = () => {
    setGameState('gameover');
  };

  const handleScoreUpdate = (points: number) => {
    setScore(prev => ({ ...prev, coins: prev.coins + points }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <GameCanvas
        gameState={gameState}
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
      />

      <GameUI
        gameState={gameState}
        score={score}
        onStart={startGame}
        onRetry={startGame}
      />
    </div>
  );
}
