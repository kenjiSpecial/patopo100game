'use client';

import { useEffect, useState } from 'react';
import { useGameLogic } from './_hooks/useGameLogic';
import { GameState } from './types';

export default function JustStopZeroPage() {
  const {
    gameState,
    timeLeft,
    result,
    highScore,
    combo,
    currentThreshold,
    currentLevel,
    maxLevel,
    handleInteraction,
    startGame
  } = useGameLogic();

  // Visual state for flash effect
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [showLevel, setShowLevel] = useState(false);

  useEffect(() => {
    if (gameState === 'playing') {
      setShowLevel(true);
      const timer = setTimeout(() => setShowLevel(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowLevel(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'result' || gameState === 'gameover') {
      setFlash(true);

      if (gameState === 'gameover') {
        setShake(true);
      }

      const timer = setTimeout(() => {
        setFlash(false);
        setShake(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Format time to 2 decimal places always
  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const sign = time < 0 ? '-' : '';
    return `${sign}${absTime.toFixed(2)}`;
  };

  // Determine color based on time
  const getTimeColor = () => {
    if (gameState !== 'playing') {
        if (gameState === 'gameover') return 'text-red-500';
        if (gameState === 'result') {
             if (result?.rank === 'PERFECT') return 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]';
             if (result?.rank === 'GREAT') return 'text-green-400';
             return 'text-white';
        }
        return 'text-white';
    }
    // Dynamic scaling and color
    if (timeLeft <= 0.1) return 'text-red-500 scale-110';
    if (timeLeft <= 0.5) return 'text-orange-400 scale-105';
    if (timeLeft <= 1.0) return 'text-yellow-400';
    return 'text-white';
  };

  // Vignette opacity based on time (starts at 1.0s remaining)
  const getVignetteOpacity = () => {
      if (gameState !== 'playing') return 0;
      if (timeLeft > 1.0) return 0;
      // 1.0 -> 0.0 opacity
      // 0.0 -> 0.5 opacity (max)
      const progress = Math.max(0, 1.0 - timeLeft); // 0 to 1
      return progress * 0.6;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      <div
        className={`relative w-full h-dvh flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors duration-300 ${
          flash ? 'bg-white' : 'bg-gray-900'
        } ${shake ? 'animate-shake' : ''}`}
        onClick={handleInteraction}
        onKeyDown={(e) => {
          if (e.code === 'Space') handleInteraction();
        }}
        tabIndex={0}
        autoFocus
      >
        {/* Vignette Effect */}
        <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-100 z-0"
            style={{
                background: 'radial-gradient(circle, transparent 30%, #ef4444 150%)',
                opacity: getVignetteOpacity(),
                mixBlendMode: 'overlay'
            }}
        />

        {/* Level Info Overlay */}
        {showLevel && gameState === 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-black/40 animate-in fade-in duration-300">
            <div className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
              LEVEL {currentLevel}
            </div>
            <div className="text-2xl font-mono text-yellow-400 bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm border border-yellow-500/30">
              TARGET: ±{currentThreshold.toFixed(2)}s
            </div>
            {currentLevel === maxLevel && (
              <div className="mt-4 text-red-500 font-bold tracking-widest animate-pulse">
                FINAL STAGE
              </div>
            )}
          </div>
        )}

        {/* Score & Combo Header */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col items-start">
             <span className="text-gray-400 text-sm font-mono tracking-widest">BEST SCORE</span>
             <span className="text-2xl font-bold font-mono text-yellow-400">{highScore.toLocaleString()}</span>
          </div>

          {combo > 0 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="text-orange-400 text-sm font-bold tracking-widest">COMBO</span>
              <span className="text-3xl font-black text-orange-500">{combo}</span>
            </div>
          )}
        </div>

        {/* Main Display */}
        <div className="flex flex-col items-center justify-center z-10 pointer-events-none transform transition-all duration-100">

          {/* Status/Rank Text */}
          <div className="h-16 flex items-center justify-center mb-4">
              {gameState === 'result' && result && (
                  <div className={`text-4xl md:text-6xl font-black italic tracking-tighter animate-pulse ${
                      result.rank === 'PERFECT' ? 'text-yellow-400' :
                      result.rank === 'GREAT' ? 'text-green-400' : 'text-white'
                  }`}>
                      {result.rank}!
                  </div>
              )}
              {gameState === 'gameover' && (
                  <div className="text-4xl md:text-6xl font-black tracking-tighter text-red-600">
                      GAME OVER
                  </div>
              )}
              {gameState === 'title' && (
                  <div className="text-2xl md:text-3xl font-bold text-gray-400 tracking-widest">
                      JUST STOP ZERO
                  </div>
              )}
          </div>

          {/* Timer */}
          <div className={`text-[15vh] md:text-[20vh] font-black font-mono leading-none tracking-tighter transition-all duration-75 ${getTimeColor()}`}>
            {formatTime(timeLeft)}
          </div>

          {/* Result Details */}
          <div className="h-32 flex flex-col items-center justify-center mt-8">
              {gameState === 'result' && result && (
                  <>
                      <div className="text-xl text-gray-300 mb-2">
                          誤差: <span className="font-mono font-bold text-white">{result.diff.toFixed(3)}</span>秒
                      </div>
                      <div className="text-3xl font-bold text-yellow-400">
                          +{result.score} <span className="text-sm text-gray-400">pts</span>
                      </div>
                      {result.isNewRecord && (
                          <div className="mt-2 px-3 py-1 bg-yellow-500 text-black font-bold text-xs rounded-full animate-pulse">
                              NEW RECORD!
                          </div>
                      )}
                  </>
              )}
              {gameState === 'title' && (
                  <div className="animate-pulse text-gray-400 text-lg mt-4">
                      TAP TO START
                  </div>
              )}
               {gameState === 'gameover' && (
                  <div className="animate-pulse text-gray-400 text-lg mt-4">
                      TAP TO RETRY
                  </div>
              )}
          </div>
        </div>

        {/* Instructions Footer */}
        <div className="absolute bottom-8 w-full text-center text-gray-500 text-sm pointer-events-none z-10">
          <p>0.00秒ジャストを狙ってタップ！</p>
          <p className="mt-1 opacity-60">
            {currentThreshold <= 0.005
              ? 'PERFECT以外はゲームオーバー'
              : `±${currentThreshold.toFixed(2)}秒以上でゲームオーバー`}
          </p>
        </div>
      </div>
    </>
  );
}
