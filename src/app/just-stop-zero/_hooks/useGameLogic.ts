import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameResult, GameConfig } from '../types';
import { useSound } from './useSound';

const DEFAULT_CONFIG: GameConfig = {
  initialTime: 3.00,
  countSpeed: 1, // per second (not used directly if using timestamp)
  perfectThreshold: 0.005, // 0.00 display (round to 2 decimals -> <0.005 is 0.00)
  greatThreshold: 0.05,
  gameoverThreshold: 0.10,
};

const LEVEL_THRESHOLDS = [0.30, 0.20, 0.10, 0.08, 0.06, 0.04, 0.02, 0.005];

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>('title');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_CONFIG.initialTime);
  const [result, setResult] = useState<GameResult | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);

  const getCurrentThreshold = useCallback(() => {
    const index = Math.min(combo, LEVEL_THRESHOLDS.length - 1);
    return LEVEL_THRESHOLDS[index];
  }, [combo]);

  const startTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startGameRef = useRef<() => void>(() => {});

  const { playSound } = useSound();

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('just-stop-zero-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (autoStartTimerRef.current) clearTimeout(autoStartTimerRef.current);
      isRunningRef.current = false;
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setResult(null);
    setTimeLeft(DEFAULT_CONFIG.initialTime);

    // Clear any pending auto-start
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    startTimeRef.current = performance.now();
    isRunningRef.current = true;

    playSound('count'); // Initial sound? Maybe not needed if it loops

    const loop = () => {
      if (!isRunningRef.current) return;

      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const current = DEFAULT_CONFIG.initialTime - elapsed;

      setTimeLeft(current);

      // Auto fail if too late
      const currentThreshold = getCurrentThreshold();
      if (current < -currentThreshold) {
        stopGame(current);
        return;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [playSound, getCurrentThreshold]);

  // Keep ref updated for auto-restart
  useEffect(() => {
    startGameRef.current = startGame;
  }, [startGame]);

  const stopGame = useCallback((finalTime: number) => {
    isRunningRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Calculate diff
    // We want 0.00 target.
    // If finalTime is 0.003, diff is 0.003.
    // If finalTime is -0.05, diff is 0.05.
    const diff = Math.abs(finalTime);
    const isJustStop = diff < DEFAULT_CONFIG.perfectThreshold;

    const currentThreshold = getCurrentThreshold();

    let rank: GameResult['rank'] = 'BAD';
    if (isJustStop) rank = 'PERFECT';
    else if (diff < DEFAULT_CONFIG.greatThreshold) rank = 'GREAT';
    else if (diff < DEFAULT_CONFIG.gameoverThreshold) rank = 'GOOD'; // Still game over if >= 0.10? Doc says >= 0.10 is game over. "GOOD" might be < 0.10 but not GREAT.

    // Check game over based on current level threshold
    const isGameOver = diff >= currentThreshold;

    if (isGameOver) {
      playSound('gameover');
      setGameState('gameover');
      setCombo(0);

      setResult({
        diff,
        score: 0,
        isNewRecord: false,
        justStop: isJustStop,
        rank: 'BAD'
      });
    } else {
      // Calculate score
      // 1000 - (diff * 10000)
      let score = Math.floor(1000 - (diff * 10000));
      if (score < 0) score = 0;

      // Bonuses
      if (rank === 'PERFECT') {
        score += 5000;
        playSound('perfect');
      } else if (rank === 'GREAT') {
        playSound('great');
      } else {
        // GOOD
        playSound('great');
      }

      // Combo bonus
      if (combo > 0) {
        score += combo * 100;
      }

      const isNewRecord = score > highScore;
      if (isNewRecord) {
        setHighScore(score);
        localStorage.setItem('just-stop-zero-highscore', score.toString());
      }

      setCombo(prev => prev + 1);
      setGameState('result');

      setResult({
        diff,
        score,
        isNewRecord,
        justStop: isJustStop,
        rank
      });

      // Auto start next game if success (diff < 0.10)
      if (autoStartTimerRef.current) clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = setTimeout(() => {
        startGameRef.current();
      }, 1200);
    }

    // Fix final time for display to avoid it jumping after stop
    setTimeLeft(finalTime);

  }, [combo, highScore, playSound, getCurrentThreshold]);

  const handleInteraction = useCallback(() => {
    if (gameState === 'playing') {
      // Stop the game
      stopGame(timeLeft);
      playSound('stop');
    } else if (gameState === 'title' || gameState === 'result' || gameState === 'gameover') {
      // Cancel auto-start if user manually starts
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
      startGame();
    }
  }, [gameState, timeLeft, startGame, stopGame, playSound]);

  return {
    gameState,
    timeLeft,
    result,
    highScore,
    combo,
    currentThreshold: getCurrentThreshold(),
    currentLevel: Math.min(combo, LEVEL_THRESHOLDS.length - 1) + 1,
    maxLevel: LEVEL_THRESHOLDS.length,
    handleInteraction,
    startGame
  };
};

