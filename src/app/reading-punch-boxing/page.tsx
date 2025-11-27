'use client';

import { useGameLogic } from './_hooks/useGameLogic';
import { GameArea } from './_components/GameArea';
import { GameUI } from './_components/GameUI';

export default function ReadingPunchBoxingPage() {
  const {
    gameState,
    hp,
    score,
    enemyState,
    playerAction,
    hitStop,
    popups,
    startGame,
    handleDodge
  } = useGameLogic();

  return (
    <main className="w-full h-screen bg-black overflow-hidden select-none touch-none">
      <GameArea
        enemyState={enemyState}
        playerAction={playerAction}
        hitStop={hitStop}
        popups={popups}
        onDodge={handleDodge}
      />
      <GameUI
        gameState={gameState}
        score={score}
        hp={hp}
        onStart={startGame}
      />
    </main>
  );
}
