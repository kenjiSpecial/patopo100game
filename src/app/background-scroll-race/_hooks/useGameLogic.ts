import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Obstacle, Coin, Score, GAME_CONFIG, ObstacleType } from '../types';
import { useSound } from './useSound';

export const useGameLogic = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<Score>({ distance: 0, coins: 0 });
  const [highScore, setHighScore] = useState<number>(0);
  const { playSound } = useSound();

  // Physics State (Refs for performance in game loop)
  const carPositionRef = useRef(0.5); // 0.0 - 1.0
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const speedRef = useRef(GAME_CONFIG.INITIAL_SPEED);
  const distanceRef = useRef(0);
  const bgScrollRef = useRef(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Visual Effects State
  const [hitStop, setHitStop] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [dangerLevel, setDangerLevel] = useState(0); // 0 to 1, for red flash
  const hitStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Exposed State for React Rendering
  const [carX, setCarX] = useState(0.5);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Start Game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore({ distance: 0, coins: 0 });
    carPositionRef.current = 0.5;
    obstaclesRef.current = [];
    coinsRef.current = [];
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
    distanceRef.current = 0;
    frameRef.current = 0;
    lastTimeRef.current = performance.now();

    setCarX(0.5);
    setObstacles([]);
    setCoins([]);
    setShakeIntensity(0);
    setHitStop(false);
    setDangerLevel(0);
    playSound('start');
  }, [playSound]);

  // Input Handlers
  const moveCar = useCallback((deltaX: number) => {
    if (gameState !== 'playing' || hitStop) return;

    let newPos = carPositionRef.current + deltaX;
    // Clamp to 0.1 - 0.9 to stay within road
    newPos = Math.max(0.1, Math.min(0.9, newPos));
    carPositionRef.current = newPos;
    setCarX(newPos); // Sync for UI
  }, [gameState, hitStop]);

  // Hit Stop Helper
  const triggerHitStop = (duration: number) => {
    setHitStop(true);
    if (hitStopTimerRef.current) clearTimeout(hitStopTimerRef.current);
    hitStopTimerRef.current = setTimeout(() => {
      setHitStop(false);
      lastTimeRef.current = performance.now(); // Reset time
    }, duration);
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = (time: number) => {
      if (hitStop) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // 1. Update Speed & Distance
      speedRef.current = Math.min(
        GAME_CONFIG.MAX_SPEED,
        speedRef.current + GAME_CONFIG.SPEED_INCREMENT
      );
      distanceRef.current += speedRef.current * 1000; // Scale for meter display

      // Update background scroll (vh)
      bgScrollRef.current = (bgScrollRef.current + speedRef.current * 100) % 100;

      // 2. Spawn Obstacles
      // Improved spawning to avoid impossible overlaps
      if (Math.random() < 1 / GAME_CONFIG.OBSTACLE_SPAWN_RATE) {
        const types: ObstacleType[] = ['car', 'cone', 'barrier', 'manhole', 'oil', 'crack'];
        const type = types[Math.floor(Math.random() * types.length)];
        const width = type === 'car' || type === 'barrier' ? 0.15 : 0.1;
        const x = Math.random() * (0.9 - width) + 0.05;

        // Check if too close to existing obstacles (vertical safety distance)
        const safeToSpawn = obstaclesRef.current.every(obs => obs.y < 1.0);

        if (safeToSpawn) {
            const newObstacle: Obstacle = {
            id: Math.random().toString(),
            type,
            x,
            y: 1.2,
            width,
            height: width, // Square-ish ratio for now
            };
            obstaclesRef.current.push(newObstacle);
        }
      }

      // 3. Spawn Coins
      if (Math.random() < 1 / GAME_CONFIG.COIN_SPAWN_RATE) {
        const newCoin: Coin = {
          id: Math.random().toString(),
          x: Math.random() * 0.8 + 0.1,
          y: 1.2,
          width: 0.08,
          height: 0.08,
          collected: false,
        };
        coinsRef.current.push(newCoin);
      }

      // 4. Update Positions
      obstaclesRef.current = obstaclesRef.current
        .map(obs => ({ ...obs, y: obs.y - speedRef.current }))
        .filter(obs => obs.y > -0.2);

      coinsRef.current = coinsRef.current
        .map(coin => ({ ...coin, y: coin.y - speedRef.current }))
        .filter(coin => coin.y > -0.2);

      // 5. Collision Detection
      const playerRect = {
        l: carPositionRef.current - GAME_CONFIG.PLAYER_WIDTH / 2 + 0.02,
        r: carPositionRef.current + GAME_CONFIG.PLAYER_WIDTH / 2 - 0.02,
        t: GAME_CONFIG.PLAYER_Y + GAME_CONFIG.PLAYER_HEIGHT / 2 - 0.02,
        b: GAME_CONFIG.PLAYER_Y - GAME_CONFIG.PLAYER_HEIGHT / 2 + 0.02,
      };

      let maxDanger = 0;
      let nearMissDetected = false;

      // Obstacles
      for (const obs of obstaclesRef.current) {
        const obsRect = {
          l: obs.x - obs.width / 2,
          r: obs.x + obs.width / 2,
          t: obs.y + obs.height / 2,
          b: obs.y - obs.height / 2,
        };

        // Collision
        if (
          playerRect.l < obsRect.r &&
          playerRect.r > obsRect.l &&
          playerRect.t > obsRect.b &&
          playerRect.b < obsRect.t
        ) {
          handleCrash();
          return;
        }

        // Near Miss / Danger Calculation
        // Calculate distance to player
        const distY = obs.y - GAME_CONFIG.PLAYER_Y;
        const distX = Math.abs(obs.x - carPositionRef.current);

        // If obstacle is just above player and close horizontally
        if (distY > 0 && distY < 0.3 && distX < 0.2) {
           maxDanger = Math.max(maxDanger, 1 - (distY / 0.3));
        }

        // Near Miss Trigger (passing side by side very close)
        if (
            Math.abs(obs.y - GAME_CONFIG.PLAYER_Y) < 0.1 && // Same Y level
            distX < (GAME_CONFIG.PLAYER_WIDTH/2 + obs.width/2 + 0.05) && // Close X
            distX > (GAME_CONFIG.PLAYER_WIDTH/2 + obs.width/2) // But not colliding
        ) {
             // Simple debounce for near miss sound?
             // Since loop runs every frame, we need to track if we already triggered for this obstacle.
             // For simplicity, we just use visual feedback or sound once per "pass" logic if we tracked it.
             // We'll stick to hitstop on COIN for now to avoid spamming, or maybe very short micro-stop.
             // Let's trigger a sound if we haven't tracked it. (Skipping complex tracking for now).
        }
      }
      setDangerLevel(maxDanger);

      // Coins
      coinsRef.current.forEach(coin => {
        if (coin.collected) return;

        const coinRect = {
          l: coin.x - coin.width / 2,
          r: coin.x + coin.width / 2,
          t: coin.y + coin.height / 2,
          b: coin.y - coin.height / 2,
        };

        if (
          playerRect.l < coinRect.r &&
          playerRect.r > coinRect.l &&
          playerRect.t > coinRect.b &&
          playerRect.b < coinRect.t
        ) {
          coin.collected = true;
          handleCoinCollect();
        }
      });

      // Remove collected coins
      coinsRef.current = coinsRef.current.filter(c => !c.collected);

      // 6. Sync State for Render
      setObstacles([...obstaclesRef.current]);
      setCoins([...coinsRef.current]);
      setScrollOffset(bgScrollRef.current);
      setScore(prev => ({
        ...prev,
        distance: Math.floor(distanceRef.current)
      }));

      if (shakeIntensity > 0) {
        setShakeIntensity(prev => Math.max(0, prev - 1));
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, hitStop, shakeIntensity, playSound]);

  const handleCrash = () => {
    setGameState('gameover');
    setShakeIntensity(20);
    playSound('crash');
    // Hit stop for crash
    setHitStop(true);
    setTimeout(() => setHitStop(false), 500); // Longer freeze for crash

    const finalScore = Math.floor(distanceRef.current) + (score.coins * 10);
    if (finalScore > highScore) setHighScore(finalScore);
  };

  const handleCoinCollect = () => {
    setScore(prev => ({ ...prev, coins: prev.coins + 1 }));
    playSound('coin');
    triggerHitStop(100); // 100ms hit stop
  };

  return {
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
  };
};
