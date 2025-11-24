'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameLogic } from './_hooks/useGameLogic';
import { GAME_CONFIG } from './types';

export default function BackgroundScrollRacePage() {
  const {
    gameState,
    score,
    highScore,
    carX,
    obstacles,
    coins,
    scrollOffset,
    shakeIntensity,
    dangerLevel,
    moveCar,
    startGame,
  } = useGameLogic();

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (gameState === 'playing' && score.distance < 50) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [gameState, score.distance]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveCar(-0.05);
      if (e.key === 'ArrowRight') moveCar(0.05);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCar]);

  // Touch controls
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Sensitivity factor
    const sensitivity = 0.002;
    moveCar(diff * sensitivity);

    touchStartX.current = currentX;
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden select-none touch-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative w-full max-w-md h-full max-h-[900px] bg-gray-800 overflow-hidden shadow-2xl border-x-4 border-gray-950"
        style={{
          transform: `translate(${Math.random() * shakeIntensity - shakeIntensity/2}px, ${Math.random() * shakeIntensity - shakeIntensity/2}px)`
        }}
      >
        {/* Danger Overlay (Red Vignette) */}
        <div
            className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200 ease-out"
            style={{
                background: 'radial-gradient(circle, transparent 60%, rgba(255, 0, 0, 0.5) 100%)',
                opacity: dangerLevel * 0.8
            }}
        />

        {/* Background (Scrolling Road) */}
        <div className="absolute inset-0 flex flex-col bg-[#34495e]">
           {/* Road Texture */}
           <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #2c3e50 25%, transparent 25%, transparent 75%, #2c3e50 75%, #2c3e50), repeating-linear-gradient(45deg, #2c3e50 25%, #34495e 25%, #34495e 75%, #2c3e50 75%, #2c3e50)`,
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundSize: '20px 20px'
                }}
           />

           {/* Moving Grid/Stripes for speed sensation */}
           <div
             className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: 'linear-gradient(0deg, transparent 50%, #ffffff 50%)',
               backgroundSize: '100% 20vh',
               backgroundPosition: `0 ${scrollOffset}vh`,
             }}
           />

           {/* Lanes */}
           <div className="absolute inset-0 flex justify-between px-8">
              {/* Left Shoulder */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-repeating-linear-gradient-45 from-yellow-500 to-black bg-size-[20px_20px]" />

              <div className="w-2 h-full bg-white opacity-40" />
              <div className="w-2 h-full bg-dashed border-l-4 border-dashed border-white/40" />
              <div className="w-2 h-full bg-dashed border-l-4 border-dashed border-white/40" />
              <div className="w-2 h-full bg-white opacity-40" />

              {/* Right Shoulder */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-repeating-linear-gradient-45 from-yellow-500 to-black bg-size-[20px_20px]" />
           </div>
        </div>

        {/* Game Layer */}
        <div className="absolute inset-0 overflow-hidden">

          {/* Player Car */}
          <div
            className="absolute transition-transform duration-75 ease-linear z-10"
            style={{
              left: `${carX * 100}%`,
              bottom: `${GAME_CONFIG.PLAYER_Y * 100}%`,
              width: `${GAME_CONFIG.PLAYER_WIDTH * 100}%`,
              height: `${GAME_CONFIG.PLAYER_HEIGHT * 100}%`,
              transform: 'translateX(-50%)', // Center anchor
            }}
          >
            <div className="w-full h-full relative group">
               {/* Body */}
               <div className="absolute inset-x-1 top-1 bottom-1 bg-cyan-500 rounded-xl shadow-lg overflow-hidden border-b-4 border-cyan-700">
                  {/* Stripes */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1/5 bg-white/90" />
               </div>
               {/* Windshield */}
               <div className="absolute top-[20%] left-[15%] right-[15%] height-[20%] h-1/4 bg-sky-900/80 rounded-sm" />
               {/* Roof */}
               <div className="absolute top-[45%] left-[15%] right-[15%] height-[20%] h-1/4 bg-cyan-400 rounded-sm z-10" />
               {/* Spoiler */}
               <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-cyan-700 rounded-full" />
               {/* Tires */}
               <div className="absolute -left-0.5 top-[15%] w-1.5 h-1/4 bg-black rounded-l-md" />
               <div className="absolute -right-0.5 top-[15%] w-1.5 h-1/4 bg-black rounded-r-md" />
               <div className="absolute -left-0.5 bottom-[15%] w-1.5 h-1/4 bg-black rounded-l-md" />
               <div className="absolute -right-0.5 bottom-[15%] w-1.5 h-1/4 bg-black rounded-r-md" />
            </div>
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="absolute flex items-center justify-center text-2xl transition-transform will-change-transform"
              style={{
                left: `${obs.x * 100}%`,
                bottom: `${obs.y * 100}%`,
                width: `${obs.width * 100}%`,
                height: `${obs.height * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {obs.type === 'car' && <div className="text-4xl filter drop-shadow-lg">🚘</div>}
              {obs.type === 'cone' && <div className="text-3xl filter drop-shadow-lg">⚠️</div>}
              {obs.type === 'barrier' && <div className="text-4xl filter drop-shadow-lg">🚧</div>}
              {obs.type === 'manhole' && <div className="w-3/4 h-3/4 bg-gray-700 rounded-full border-2 border-gray-600 shadow-inner opacity-80"></div>}
              {obs.type === 'oil' && <div className="text-3xl filter opacity-80">🛢️</div>}
              {obs.type === 'crack' && <div className="text-3xl opacity-60 rotate-45">⚡️</div>}
              {obs.type === 'hazard' && <div className="text-3xl">☣️</div>}
              {obs.type === 'train' && <div className="w-full h-full bg-green-700 border-2 border-yellow-400 flex items-center justify-center text-xs text-white font-bold">TRAIN</div>}
            </div>
          ))}

          {/* Coins */}
          {coins.map(coin => (
            <div
              key={coin.id}
              className="absolute flex items-center justify-center text-yellow-400 text-3xl drop-shadow-md animate-bounce"
              style={{
                left: `${coin.x * 100}%`,
                bottom: `${coin.y * 100}%`,
                width: `${coin.width * 100}%`,
                height: `${coin.height * 100}%`,
                transform: 'translateX(-50%)',
                animationDuration: '0.8s'
              }}
            >
              🪙
            </div>
          ))}
        </div>

        {/* UI Layer */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30">
          {/* HUD */}
          <div className="flex justify-between items-start">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-bold text-xl shadow-lg flex items-center gap-2">
                <span>📍</span>
                <span className="tabular-nums">{score.distance}m</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-bold text-xl shadow-lg flex items-center gap-2">
                <span>💰</span>
                <span className="tabular-nums">{score.coins}</span>
            </div>
          </div>

          {/* Tutorial Overlay */}
          {showTutorial && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="flex gap-32 opacity-50">
                      <div className="text-6xl text-white font-black drop-shadow-lg">←</div>
                      <div className="text-6xl text-white font-black drop-shadow-lg">→</div>
                  </div>
                  <div className="absolute top-2/3 text-white/80 font-bold text-lg">
                      SWIPE TO STEER
                  </div>
              </div>
          )}

          {/* Title Screen */}
          {gameState === 'title' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-auto z-50">
              <div className="mb-8 relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                <h1 className="relative text-5xl font-black text-center leading-tight tracking-tighter italic transform -skew-x-6">
                  <span className="block text-transparent bg-clip-text bg-linear-to-br from-cyan-400 to-blue-600 drop-shadow-sm">SCROLL</span>
                  <span className="block text-transparent bg-clip-text bg-linear-to-br from-yellow-400 to-red-500 drop-shadow-sm">RACE</span>
                </h1>
              </div>

              <div className="space-y-4 text-center">
                  <p className="text-gray-400 text-sm uppercase tracking-widest">Avoid obstacles & Collect Coins</p>
                  <button
                    onClick={startGame}
                    className="group relative px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-black text-xl shadow-xl transition-all active:scale-95 hover:shadow-blue-500/30 ring-2 ring-white/20 ring-offset-2 ring-offset-black"
                  >
                    <span className="flex items-center gap-2">
                        <span>START ENGINE</span>
                        <span className="group-hover:translate-x-1 transition-transform">➜</span>
                    </span>
                  </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white pointer-events-auto z-50 animate-in fade-in zoom-in duration-300">
              <h2 className="text-6xl font-black mb-2 text-red-500 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] italic -skew-x-12">CRASH!</h2>

              <div className="w-full max-w-xs bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl mb-8">
                <div className="text-center mb-6">
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Score</div>
                    <div className="text-5xl font-black text-white tabular-nums tracking-tighter">
                        {score.distance + (score.coins * 10)}
                    </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Distance</span>
                        <span className="font-bold">{score.distance}m</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Coins (x10)</span>
                        <span className="font-bold text-yellow-400">{score.coins}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                        <span className="text-yellow-500 font-bold">High Score</span>
                        <span className="font-bold text-yellow-500">{highScore}</span>
                    </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="px-10 py-4 bg-white text-red-600 rounded-full font-black text-xl shadow-xl hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>↺</span>
                <span>RETRY</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
