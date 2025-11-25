import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, PlayerState, Obstacle, Coin, GameConfig, GameStatus } from '../types';
import { useSound } from './useSound';

const GAME_CONFIG: GameConfig = {
  gravity: 0.6,
  jumpForce: 12,
  initialSpeed: 20, // Increased 10x from original 5 (8 -> 50)
  maxSpeed: 80, // Increased
  acceleration: 0.0002,
  groundHeight: 50, // px
};

const PLAYER_SIZE = 40;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT_SMALL = 40;
const OBSTACLE_HEIGHT_LARGE = 70;
const PIT_WIDTH = 100; // Width of pit
const COIN_SIZE = 30;
const MAX_JUMPS = 3;

export const useGameLogic = (width: number, height: number) => {
  const { playSound } = useSound();
  const [gameState, setGameState] = useState<GameState>({
    status: 'start',
    score: 0,
    coins: 0,
    distance: 0,
    speed: GAME_CONFIG.initialSpeed,
    highScore: 0,
  });

  const [player, setPlayer] = useState<PlayerState>({
    y: 0,
    velocity: 0,
    isJumping: false,
    jumpCount: 0,
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);

  // Refs for game loop to avoid closure staleness and frequent state updates lagging logic
  const stateRef = useRef(gameState);
  const playerRef = useRef(player);
  const obstaclesRef = useRef(obstacles);
  const coinsRef = useRef(coins);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const hitStopRef = useRef<number>(0); // Hit stop timer
  const lastMilestoneRef = useRef<number>(0);

  // Sync refs with state (one way, for initialization mostly)
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState.status]); // Only sync status changes roughly

  const spawnObstacle = (currentDistance: number) => {
    const minGap = 400;
    // Delay logic removed to allow immediate obstacles
    // if (currentDistance < 1000) return;

    const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
    const spawnX = width + 100;

    if (!lastObstacle || (spawnX - lastObstacle.x > Math.random() * 300 + 300)) {
      const rand = Math.random();
      let type: 'ground' | 'flying' | 'pit';
      let obsHeight = 0;
      let obsWidth = OBSTACLE_WIDTH;

      if (rand > 0.9) {
        type = 'pit';
        obsHeight = 50; // Visual height (used for drawing hole)
        obsWidth = PIT_WIDTH;
      } else if (rand > 0.7) {
        type = 'flying';
        obsHeight = 40;
      } else {
        type = 'ground';
        obsHeight = Math.random() > 0.5 ? OBSTACLE_HEIGHT_LARGE : OBSTACLE_HEIGHT_SMALL;
      }

      // Pit logic handled differently in collision/ground check

      const newObstacle: Obstacle = {
        id: Date.now() + Math.random(),
        x: spawnX,
        width: obsWidth,
        height: obsHeight,
        type: type,
        passed: false,
      };

      obstaclesRef.current = [...obstaclesRef.current, newObstacle];

      // 50% chance to spawn coin above or after (not over pits generally to be nice, or maybe challenge)
      if (type !== 'pit' && Math.random() > 0.5) {
        const coinX = spawnX + 50 + Math.random() * 100;
        const coinY = Math.random() * 150 + 50; // Random height
        const newCoin: Coin = {
          id: Date.now() + Math.random(),
          x: coinX,
          y: coinY,
          width: COIN_SIZE,
          height: COIN_SIZE,
          collected: false,
        };
        coinsRef.current = [...coinsRef.current, newCoin];
      }
    }
  };

  const checkCollisions = () => {
    const p = playerRef.current;
    const playerLeft = 50; // Fixed X position
    const playerRight = playerLeft + PLAYER_SIZE;
    const playerBottom = p.y;
    const playerTop = p.y + PLAYER_SIZE;

    // Obstacles
    for (const obs of obstaclesRef.current) {
      if (obs.type === 'pit') continue; // Pits are handled in gravity/update

      const obsLeft = obs.x;
      const obsRight = obs.x + obs.width;
      const obsBottom = obs.type === 'flying' ? 100 : 0; // Hardcoded for now
      const obsTop = obsBottom + obs.height;

      // Slightly smaller hitbox for player forgiveness
      if (
        playerRight > obsLeft + 10 &&
        playerLeft < obsRight - 10 &&
        playerBottom < obsTop - 5 &&
        playerTop > obsBottom + 5
      ) {
        return true; // Collision
      }
    }
    return false;
  };

  const isOverPit = (playerX: number, playerWidth: number) => {
     const playerCenter = playerX + playerWidth / 2;
     for (const obs of obstaclesRef.current) {
        if (obs.type === 'pit') {
            if (playerCenter > obs.x && playerCenter < obs.x + obs.width) {
                return true;
            }
        }
     }
     return false;
  };

  const checkCoinCollection = () => {
     const p = playerRef.current;
     const playerLeft = 50;
     const playerRight = playerLeft + PLAYER_SIZE;
     const playerBottom = p.y;
     const playerTop = p.y + PLAYER_SIZE;

     coinsRef.current.forEach(coin => {
       if (!coin.collected) {
         const coinLeft = coin.x;
         const coinRight = coin.x + coin.width;
         const coinBottom = coin.y;
         const coinTop = coin.y + coin.height;

         if (
           playerRight > coinLeft &&
           playerLeft < coinRight &&
           playerBottom < coinTop &&
           playerTop > coinBottom
         ) {
           coin.collected = true;
           stateRef.current.coins += 1;
           stateRef.current.score += 100; // Bonus for coin

           // Trigger hit stop
           hitStopRef.current = 150; // 0.15s
           playSound('coin');
         }
       }
     });
  };

  const update = (time: number) => {
    if (stateRef.current.status !== 'playing') {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(update);
        return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Hit Stop Logic
    if (hitStopRef.current > 0) {
      hitStopRef.current -= deltaTime;
      // Don't update game state, just loop
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    // Update Speed
    if (stateRef.current.speed < GAME_CONFIG.maxSpeed) {
      stateRef.current.speed += GAME_CONFIG.acceleration * deltaTime;
    }

    // Update Distance
    // Scale distance update by frame time to be consistent
    const frameScale = deltaTime / 16.66;
    stateRef.current.distance += (stateRef.current.speed * frameScale);
    stateRef.current.score = Math.floor(stateRef.current.distance / 10) + stateRef.current.coins * 10;

    // Milestone Check (every 500 units of distance)
    const currentMilestone = Math.floor(stateRef.current.distance / 500);
    if (currentMilestone > lastMilestoneRef.current) {
        playSound('levelUp');
        lastMilestoneRef.current = currentMilestone;
    }

    // Update Player Physics
    let newY = playerRef.current.y + playerRef.current.velocity * frameScale;
    let newVel = playerRef.current.velocity - (GAME_CONFIG.gravity * frameScale);

    // Ground Check / Pit Check
    const playerLeft = 50;
    const inPit = isOverPit(playerLeft, PLAYER_SIZE);

    if (!inPit && newY <= 0) {
      newY = 0;
      newVel = 0;
      playerRef.current.isJumping = false;
      playerRef.current.jumpCount = 0; // Reset jumps on ground
    } else if (inPit && newY <= -100) {
        // Fell into pit
        handleGameOver();
        return;
    }

    playerRef.current = {
      ...playerRef.current,
      y: newY,
      velocity: newVel,
    };

    // Spawn Logic
    spawnObstacle(stateRef.current.distance);

    // Update Obstacles
    obstaclesRef.current = obstaclesRef.current
      .map(obs => ({ ...obs, x: obs.x - (stateRef.current.speed * frameScale) }))
      .filter(obs => obs.x + obs.width > -200);

    // Update Coins
    coinsRef.current = coinsRef.current
      .map(coin => ({ ...coin, x: coin.x - (stateRef.current.speed * frameScale) }))
      .filter(coin => coin.x + coin.width > -200);

    // Collision Detection
    if (checkCollisions()) {
      handleGameOver();
      return; // Stop loop
    }

    checkCoinCollection();

    // Sync to state for rendering
    setPlayer(playerRef.current);
    setObstacles(obstaclesRef.current);
    setCoins(coinsRef.current);
    setGameState(prev => ({
        ...prev,
        distance: stateRef.current.distance,
        score: stateRef.current.score,
        coins: stateRef.current.coins,
        speed: stateRef.current.speed,
    }));

    requestRef.current = requestAnimationFrame(update);
  };

  const handleJump = useCallback(() => {
    if (gameState.status === 'start') {
        startGame();
        return;
    }
    if (gameState.status !== 'playing') return;

    // Multi-jump logic
    if (playerRef.current.jumpCount < MAX_JUMPS) {
      playerRef.current.velocity = GAME_CONFIG.jumpForce;
      playerRef.current.isJumping = true;
      playerRef.current.jumpCount += 1;
      playSound('jump');
    }
  }, [gameState.status]);

  const startGame = () => {
    playSound('start');
    const freshState: GameState = { ...gameState, status: 'playing', score: 0, distance: 0, coins: 0, speed: GAME_CONFIG.initialSpeed };
    setGameState(freshState);
    stateRef.current = freshState;

    // Initial Obstacles Spawn
    const initialObstacles: Obstacle[] = [];
    let currentX = width + 200; // Start off screen

    for (let i = 0; i < 3; i++) {
        const rand = Math.random();
        let type: 'ground' | 'flying' | 'pit' = 'ground';
        let obsHeight = 40;
        let obsWidth = OBSTACLE_WIDTH;

        if (rand > 0.8) {
             type = 'pit';
             obsHeight = 50;
             obsWidth = PIT_WIDTH;
        } else if (rand > 0.6) {
             type = 'flying';
             obsHeight = 40;
        } else {
             type = 'ground';
             obsHeight = OBSTACLE_HEIGHT_SMALL;
        }

        initialObstacles.push({
            id: Date.now() + i,
            x: currentX,
            width: obsWidth,
            height: obsHeight,
            type: type,
            passed: false
        });

        currentX += 500 + Math.random() * 200;
    }

    setObstacles(initialObstacles);
    obstaclesRef.current = initialObstacles;
    setCoins([]);
    coinsRef.current = [];
    setPlayer({ y: 0, velocity: 0, isJumping: false, jumpCount: 0 });
    playerRef.current = { y: 0, velocity: 0, isJumping: false, jumpCount: 0 };
    hitStopRef.current = 0;
    lastMilestoneRef.current = 0;
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(update);
  };

  const handleGameOver = () => {
      playSound('crash');
      setGameState(prev => ({ ...prev, status: 'gameover' }));
      stateRef.current.status = 'gameover';
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const resetGame = () => {
      setGameState(prev => ({ ...prev, status: 'start' }));
      stateRef.current.status = 'start';
  };

  // Start loop handling
  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  return {
    gameState,
    player,
    obstacles,
    coins,
    handleJump,
    resetGame,
    startGame
  };
};
