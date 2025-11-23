'use client';

import React, { useRef } from 'react';
import { Background } from './_components/Background';
import { ParticleLayer, ParticleLayerHandle } from './_components/ParticleLayer';
import { GameOverlay } from './_components/GameOverlay';
import { GameArea } from './_components/GameArea';
import { useGameLogic } from './_hooks/useGameLogic';

export default function UpDownChoicePage() {
  const particleLayerRef = useRef<ParticleLayerHandle>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const {
    gameState,
    score,
    highScore,
    combo,
    misses,
    blocks,
    shake,
    countdown,
    startGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useGameLogic(particleLayerRef);

  return (
    <div
      className={`min-h-screen bg-slate-900 text-white overflow-hidden select-none font-sans touch-none transition-transform duration-100 ${shake ? 'translate-x-2 translate-y-2' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Canvas (パーティクル用レイヤー) */}
      <ParticleLayer ref={particleLayerRef} />

      {/* 背景演出 */}
      <Background gameState={gameState} />

      {/* UIオーバーレイ（ヘッダー、スタート画面など） */}
      <GameOverlay
        gameState={gameState}
        score={score}
        highScore={highScore}
        combo={combo}
        misses={misses}
        countdown={countdown}
        onStartGame={startGame}
      />

      {/* ゲームエリア（ブロック、ゾーン） */}
      <GameArea
        gameState={gameState}
        blocks={blocks}
        gameAreaRef={gameAreaRef}
      />
    </div>
  );
}
