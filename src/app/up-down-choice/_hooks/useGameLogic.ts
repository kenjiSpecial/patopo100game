import { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, Block } from '../types';
import { INITIAL_SPEED, SPAWN_INTERVAL_INITIAL, MAX_MISSES, ZONE_HEIGHT } from '../constants';
import { useSound } from './useSound';
import { ParticleLayerHandle } from '../_components/ParticleLayer';

export const useGameLogic = (particleLayerRef: React.RefObject<ParticleLayerHandle | null>) => {
  // 状態管理
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [countdown, setCountdown] = useState(3);

  // Refs
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const blockIdCounterRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const gameStateRef = useRef<GameState>('start');
  const blocksRef = useRef<Block[]>([]);
  const comboRef = useRef(0);

  const { playSound } = useSound();

  // ゲーム開始（カウントダウン開始）
  const startGame = useCallback(() => {
    setGameState('countdown');
    gameStateRef.current = 'countdown';
    setCountdown(3);
    setScore(0);
    setMisses(0);
    setBlocks([]);
    setCombo(0);
    comboRef.current = 0;
    setSpeed(INITIAL_SPEED);
    speedRef.current = INITIAL_SPEED;
    blockIdCounterRef.current = 0;

    // カウントダウン処理
    let count = 3;
    playSound('countdown');

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playSound('countdown');
      } else {
        clearInterval(timer);
        setGameState('playing');
        gameStateRef.current = 'playing';
        const now = performance.now();
        lastTimeRef.current = now;
        // 最初のブロックをすぐに生成
        spawnBlock();
        lastSpawnTimeRef.current = now + Math.max(500, SPAWN_INTERVAL_INITIAL - (speedRef.current * 1000));

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    }, 1000);
  }, [playSound]);

  const endGame = useCallback(() => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';
    playSound('gameover');
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, [playSound]);

  const spawnBlock = useCallback(() => {
    const id = blockIdCounterRef.current++;
    const value = Math.floor(Math.random() * 100) + 1;
    setBlocks(prev => [
      ...prev,
      {
        id,
        value,
        x: 0,
        y: -10,
        status: 'falling'
      }
    ]);
  }, []);

  const createExplosion = useCallback((x: number, y: number, type: 'success' | 'miss') => {
    if (particleLayerRef.current) {
      particleLayerRef.current.createExplosion(x, y, type);
    }
  }, [particleLayerRef]);

  const gameLoop = useCallback((timestamp: number) => {
    // gameStateRefを使って最新の状態をチェック
    if (gameStateRef.current === 'gameover' || gameStateRef.current === 'countdown') {
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // ブロック生成判定（時間が経過したら生成）
    if (timestamp >= lastSpawnTimeRef.current) {
      spawnBlock();
      lastSpawnTimeRef.current = timestamp + Math.max(500, SPAWN_INTERVAL_INITIAL - (speedRef.current * 1000));
    }

    // 1. 判定と副作用の実行 (Refを使って現在の状態を確認し、重複実行を防ぐ)
    // StrictModeでの重複実行を避けるため、setBlocksの外で副作用を実行する
    const updates = new Map<number, { status: 'miss' | 'success', result: 'correct' | 'wrong' }>();
    let missIncrement = 0;
    let scoreIncrement = 0;

    blocksRef.current.forEach(b => {
      if (b.status !== 'falling') return;

      // 次のフレームでの位置を予測して判定
      const nextY = b.y + speedRef.current;

      if (nextY > 100 - ZONE_HEIGHT) {
        const isEven = b.value % 2 === 0;
        let result: 'correct' | 'wrong' = 'wrong';
        let isMiss = false;

        // 座標計算
        const screenX = window.innerWidth * (b.x === 0 ? 0.5 : b.x < 0 ? 0.25 : 0.75);
        const screenY = window.innerHeight * (1 - ZONE_HEIGHT / 100);

        if (b.x < 0) { // 左（偶数）
          if (isEven) {
            result = 'correct';
            scoreIncrement++;
          } else {
            result = 'wrong';
            isMiss = true;
          }
        } else if (b.x > 0) { // 右（奇数）
          if (!isEven) {
            result = 'correct';
            scoreIncrement++;
          } else {
            result = 'wrong';
            isMiss = true;
          }
        } else {
          result = 'wrong';
          isMiss = true;
        }

        if (isMiss) {
          missIncrement++;
          createExplosion(screenX, screenY, 'miss');
        } else {
          createExplosion(screenX, screenY, 'success');
        }

        const newStatus: 'miss' | 'success' = isMiss ? 'miss' : 'success';
        updates.set(b.id, { status: newStatus, result });
      }
    });

    // 副作用の実行
    if (missIncrement > 0) {
      playSound('miss');
      setCombo(0);
      comboRef.current = 0;
      setShake(true);
      setTimeout(() => setShake(false), 300);

      setMisses(m => {
        const newMisses = m + missIncrement;
        if (newMisses >= MAX_MISSES) {
          endGame();
        }
        return newMisses;
      });
    }

    if (scoreIncrement > 0) {
      playSound('success');
      // コンボ更新
      const currentCombo = comboRef.current + scoreIncrement;
      comboRef.current = currentCombo;
      setCombo(currentCombo);

      if (currentCombo > 1 && currentCombo % 5 === 0) {
           playSound('combo');
      }

      // スコア計算（コンボボーナス加算）
      setScore(s => {
        const newScore = s + scoreIncrement + Math.floor(currentCombo / 10);

        // スコアに応じてスピードを徐々に上げる（基本増加分 + スコア増加分）
        // 100点ごとに少しずつ加速率を上げる
        const difficultyMultiplier = 1 + Math.floor(newScore / 100) * 0.1;
        speedRef.current = Math.min(speedRef.current + 0.005 * difficultyMultiplier, 1.5); // 上限を設定

        return newScore;
      });
    }

    // 2. 状態更新 (位置更新 + ステータス反映)
    setBlocks(prev => {
      const updated = prev.map(b => {
        // すでに判定済みのブロックはそのまま（あるいはupdatesにあれば更新）
        if (b.status !== 'falling') return { ...b, y: b.y + speedRef.current };

        const update = updates.get(b.id);
        const newY = b.y + speedRef.current;

        if (update) {
          return { ...b, y: newY, status: update.status, result: update.result };
        }
        return { ...b, y: newY };
      });

      const filtered = updated.filter(b => b.y < 120);
      return filtered;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [endGame, playSound, spawnBlock, createExplosion]);

  const handleInput = useCallback((direction: 'left' | 'right') => {
    setBlocks(prev => {
      const targetBlock = [...prev]
        .filter(b => b.status === 'falling' && b.y < 100 - ZONE_HEIGHT)
        .sort((a, b) => b.y - a.y)[0];

      if (!targetBlock) return prev;

      return prev.map(b => {
        if (b.id === targetBlock.id) {
          return { ...b, x: direction === 'left' ? -1 : 1 };
        }
        return b;
      });
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft') handleInput('left');
      if (e.key === 'ArrowRight') handleInput('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('upDownChoiceHighScore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    const saved = localStorage.getItem('upDownChoiceHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // blocksが更新されたらblocksRefも更新
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // gameStateが変更されたらgameStateRefも更新
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // フリック操作
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || gameStateRef.current !== 'playing') return;

    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX.current;

    if (Math.abs(diffX) > 30) {
      handleInput(diffX > 0 ? 'right' : 'left');
      touchStartX.current = null;
    }
  }, [handleInput]);

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = null;
  }, []);

  return {
    gameState,
    score,
    highScore,
    combo,
    misses,
    blocks,
    shake,
    countdown,
    startGame,
    handleInput,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

