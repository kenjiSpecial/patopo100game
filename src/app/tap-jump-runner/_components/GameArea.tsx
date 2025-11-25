import React, { useRef, useEffect, useState } from 'react';
import { useGameLogic } from '../_hooks/useGameLogic';
import { Player } from './Player';
import { ObstacleItem } from './ObstacleItem';
import { CoinItem } from './CoinItem';
import { Background } from './Background';
import { GameUI } from './GameUI';

export default function GameArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const {
    gameState,
    player,
    obstacles,
    coins,
    handleJump,
    resetGame,
    startGame
  } = useGameLogic(dimensions.width, dimensions.height);

  // Global input handler (click/tap/space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-pointer"
      onClick={handleJump} // Tap anywhere to jump
      onTouchStart={(e) => {
          // Prevent default to avoid zoom/scroll issues on some devices
          // e.preventDefault(); // Careful with this if buttons need click
          handleJump();
      }}
    >
      <Background distance={gameState.distance} />

      {/* Game World Container */}
      <div className="absolute inset-0 z-10">
        <Player player={player} />

        {obstacles.map(obs => (
          <ObstacleItem key={obs.id} obstacle={obs} />
        ))}

        {coins.map(coin => (
          <CoinItem key={coin.id} coin={coin} />
        ))}
      </div>

      {/* Hit Flash Overlay */}
      {/* Could implement flash logic here based on game event */}

      <GameUI
        gameState={gameState}
        onStart={startGame}
        onReset={startGame}
      />
    </div>
  );
}

