"use client";

import Scene3D from "./_components/Scene3D";
import GameUI from "./_components/GameUI";
import { useDoorGame } from "./_hooks/useDoorGame";

export default function DoorChoicePage() {
  const {
    floor,
    gameState,
    selectedDoor,
    result,
    highScore,
    chooseDoor,
    resetGame
  } = useDoorGame();

  return (
    <main className="relative w-full h-full min-h-screen">
      {/* 3Dシーン */}
      <Scene3D
        gameState={gameState}
        selectedDoor={selectedDoor}
        result={result}
        onChooseDoor={chooseDoor}
      />

      {/* UIレイヤー */}
      <GameUI
        floor={floor}
        highScore={highScore}
        gameState={gameState}
        onReset={resetGame}
      />
    </main>
  );
}

